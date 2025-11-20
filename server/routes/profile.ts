import { Router } from "express";
import { supabase } from "../services/db.js";
import { uploadAvatarImage } from "../services/uploads/fileuploader.js";
import multer from "multer";

const router = Router();
const upload = multer();

// gets the logged in user's profile
router.get("/me", async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: "missing userId" });
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  if (error || !data) {
    console.error("Fetch user profile error:", error);
    return res.status(404).json({ error: "User not found" });
  }

  return res.json(data);
});



// updates the logged in user's profile
router.patch("/me", upload.single("avatar"), async (req, res) => {
  try {
    const userId = String(req.query.userId);
    if (!userId) {
      return res.status(400).json({ error: "missing userId" });
    }

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
        userId: userId,
        file: blob,
      });
        updateFields.profile_image_url = newPfp.publicUrl; 
    }
      

    const { data, error } = await supabase
      .from("users")
      .update(updateFields)
      .eq("id", userId)
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