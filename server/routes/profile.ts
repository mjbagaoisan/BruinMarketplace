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

router.get("/:user_id", authenticateToken, async (req, res) => {
  const { user_id } = req.params;

  const { data, error } = await supabase
    .from("users")
    // selecting specific fields to avoid sending private data
    .select("id, name, profile_image_url, major, hide_major, class_year, hide_class_year, created_at")
    .eq("id", user_id)
    .single();

  if (error) {
    console.error(`Error fetching user ID: ${user_id}:`, error);
    return res.status(500).json({ error: "An error occurred while fetching" });
  }

  if (!data) {
    console.error(`User ID ${user_id} not found`);
    return res.status(404).json({ error: "User not found" });
  }

  return res.json(data);
})


// updates the logged in user's profile
router.put("/me", authenticateToken, upload.single("avatar"), async (req, res) => {
  try {
    const user_id = req.user!.userId;

    // get prev pfp if found
    const { data: oldUser, error: oldUserError } = await supabase
        .from("users")
        .select("profile_image_url")
        .eq("id", user_id)
        .single();
    if (oldUserError) {
      return res.status(500).json({ error: "Failed to fetch old avatar" });
    }

    const updateFields: any = {
      major: req.body.major ?? null,
      hide_major: req.body.hide_major,
      class_year: req.body.class_year ? Number(req.body.class_year) : null,
      hide_class_year: req.body.hide_class_year,
      email: req.body.email ?? null,
      phone_number: req.body.phone_number ?? null,
      updated_at: new Date().toISOString(),
    };


    // if we are inputting a file (pfp)
    if (req.file) {

      // if there is a prev pfp (to delete it)
      if (oldUser?.profile_image_url) {
        const [, oldPath] = oldUser.profile_image_url.split("/object/public/avatars/");
        if (oldPath) {
          const { error: delError } = await supabase.storage
            .from("avatars")
            .remove([oldPath]);
          if (delError) {
            console.error("Failed to delete old avatar", delError);
          }
        }
      }
      
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