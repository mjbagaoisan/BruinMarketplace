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
      name: req.body.name,
      bio: req.body.bio,
    };
    if (req.file) {
      const result = await uploadAvatarImage({userId, file: new Blob([req.file.buffer], { type: req.file.mimetype })});
      updateFields.profilePicURL = result.publicUrl;
    }

    const updates = req.body;
    updates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();
    if (!data) {
      console.error("User update error:", error);
      return res.status(404).json({ error: "User not found" });
    }
    if (error) throw error;

    return res.json({success: true, updated: updateFields});
  } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Profile update failed." });
    }
});


export default router;