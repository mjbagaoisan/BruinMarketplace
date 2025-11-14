import { Router } from "express";
import { supabase } from "../services/db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// gets the logged in user's profile
router.get("/me", authenticateToken, async (req, res) => {
  const userId = req.user!.userId;

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
router.patch("/me", authenticateToken, async (req, res) => {
  const userId = req.user!.userId;
  const updates = req.body;

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();
  if (error) {
    console.error("User update error:", error);
    return res.status(400).json({ error: "Failed to update profile" });
  }

  return res.json(data);
});


export default router;