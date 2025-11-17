import { Router } from "express";
import { supabase } from "../services/db.js";

const router = Router();

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
router.patch("/me", async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: "missing userId" });
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
  if (error) {
    console.error("User update error:", error);
    return res.status(404).json({ error: "Failed to update profile" });
  }

  return res.json(data);
});


export default router;