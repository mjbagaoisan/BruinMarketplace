import { Router } from "express";
import { supabase } from "../services/db.js";
import { authenticateToken } from "../middleware/auth.js";
import { uploadAvatarImage } from "../services/uploads/fileuploader.js";
import multer from "multer";

const router = Router();
const upload = multer();

// gets the logged in user's profile
router.get("/me", authenticateToken, async (req, res) => {
  const user_id = req.user!.userId;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user_id)
    .single();
  if (error || !data) {
    console.error("Fetch user profile error:", error);
    return res.status(404).json({ error: "User not found" });
  }

  return res.json(data);
});

router.get("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("users")
    .select(
      "id, name, major, hide_major, class_year, hide_class_year, profile_image_url, created_at"
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error(`Fetch user profile by ID error (ID: ${id}):`, error);
    return res.status(404).json({ error: "User not found" });
  }

  return res.json(data);
})


// updates the logged in user's profile
router.patch("/me", authenticateToken, upload.single("avatar"), async (req, res) => {
  try {
    const user_id = req.user!.userId;
 
    const updateFields: any = {

      major: req.body.major ?? null,
      hide_major: req.body.hide_major,
      class_year: req.body.class_year ? Number(req.body.class_year) : null,
      hide_class_year: req.body.hide_class_year,
      updated_at: new Date().toISOString(),
    };

    // if we are inputting a file (pfp)
    if (req.file) {
      //convert multer file to blob to save in supabase
      const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
      // upload image and get the public url
      const newPfp = await uploadAvatarImage({
        userId: user_id,
        file: blob,
      });
        updateFields.profile_image_url = newPfp.publicUrl; 
    }
      

    const { data, error } = await supabase
      .from("users")
      .update(updateFields)
      .eq("id", user_id)
      .select()
      .single();
    if (!data || error) {
      console.error("User update error:", error);
      return res.status(404).json({ error: "User update failed " });
    }

    return res.json(data);
  } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Profile update failed." });
    }
});


export default router;