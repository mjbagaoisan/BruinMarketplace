import { Router } from "express";
import { supabase } from "../services/db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

//return all active listings (for now)
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Listings fetch error:", error);
    return res.status(500).json({ error: error.message });
  }

  return res.json(data ?? []);
});


router.post("/", authenticateToken, async (req, res) => {
  const user_id = req.user!.userId; 
  const { title, price } = req.body;

  if (!title || !price) {
    return res.status(400).json({ error: "title and price are required" });
  }

  const { data, error } = await supabase
    .from("listings")
    .insert({
      user_id,
      title,
      price,
      condition: "good",
      category: "other",
      status: "active",
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json(data);
});


router.get("/me", authenticateToken, async (req, res) => {
  const user_id = req.user!.userId;

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json(data ?? []);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {     
    console.error("Fetch listing error:", error);
    return res.status(404).json({ error: "Listing not found" });
  }

  return res.json(data);
});

router.delete("/:id", authenticateToken, async (req, res) => {
  const user_id = req.user!.userId;
  const { id } = req.params;

  const { data: listing, error: fetchError } = await supabase
    .from("listings")
    .select("id, user_id")
    .eq("id", id)
    .single();

  if (fetchError || !listing) {
    return res.status(404).json({ error: "Listing not found" });
  }
  if (listing.user_id !== user_id) {
    return res.status(403).json({ error: "You do not own this listing" });
  }

  const { error: deleteError } = await supabase
    .from("listings")
    .delete()                  
    .eq("id", id);

  if (deleteError) {
    return res.status(500).json({ error: deleteError.message });
  }

  return res.status(204).send();
});


export default router;
