import { Router } from "express";
import { supabase } from "../services/db.js";

const router = Router();

/**
 * GET /api/listings
 * Just return all active listings for now (simple test)
 */
router.get("/", async (req, res) => {
    const { data, error } = await supabase
    .from("listings")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
    
    if (error) {
        console.error("Listings fetch error:", error);
        return res.status(500).json({ error: error.message });
    }
    return res.json(data ?? []);

});

router.post("/", async (req, res) => {
  const { title, price } = req.body;

  if (!title || !price) {
    return res.status(400).json({ error: "title and price are required" });
  }

  const { data, error } = await supabase
    .from("listings")
    .insert({
      user_id: 1,           
      title,
      price,
      condition: "good",   
      category: "other",    
      status: "active",
    })
    .select()
    .single();

  if (error) {
    console.error("Insert error:", error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json(data);
});


export default router;
