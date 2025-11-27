import { Router } from "express";
import { supabase } from "../services/db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

const CONDITION_ENUM = ["new", "like_new", "good", "fair", "poor"];
const CATEGORY_ENUM = ["textbooks", "electronics", "furniture", "parking", "clothing", "tickets", "other"];
const STATUS_ENUM = ["active", "sold", "traded", "removed"];
const PAYMENT_ENUM = ["zelle", "cash", "venmo", "other"];
const LOCATION_ENUM = ["hill", "on campus", "off campus"];

//return all active listings (now requires authentication)
router.get("/", authenticateToken, async (req, res) => {
  const { data, error } = await supabase
    .from("listings")
    .select("*, media(*)")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Listings fetch errr:", error);
    return res.status(500).json({ error: error.message });
  }

  return res.json(data ?? []);
});


// create a new listing
router.post("/", authenticateToken, async (req, res) => {
  const user_id = req.user!.userId; 
  const {
    title,
    price,
    description = "",
    condition,
    category,
    location,
    preferred_payment = "other",
    status,
  } = req.body;

  //validation
  if (!title || !title.trim() ) {
    return res.status(400).json({
      error: "title cannot be empty"
    })
  }
  if (!price || !condition || !category || !location || !status) {
    return res.status(400).json({
      error: "missing a required field"
    });
  }
  const priceNum = Number(price);
  if (isNaN(priceNum) || priceNum <= 0) {
    return res.status(400).json({ error: "price must be a number greater than 0" });
  }
  if (!CONDITION_ENUM.includes(condition)) {
    return res.status(400).json({ error: "invalid condition" });
  }
  if (!CATEGORY_ENUM.includes(category)) {
    return res.status(400).json({ error: "invalid category" });
  }
  if (!STATUS_ENUM.includes(status)) {
    return res.status(400).json({ error: "invalid status" });
  }
  if (!PAYMENT_ENUM.includes(preferred_payment)) {
    return res.status(400).json({ error: "invalid payment method" });
  }
  if (!LOCATION_ENUM.includes(location)) {
    return res.status(400).json({ error: "invalid location" });
  }

  const { data, error } = await supabase
    .from("listings")
    .insert({
      user_id,
      title,
      price: priceNum,
      description,
      condition,
      category,
      status,
      location,
      preferred_payment,
    })
    .select()
    .single();

  if (error) {
    console.error("Insert listing error:", error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json(data);
});


// get all active listings for the authenticated user
router.get("/me", authenticateToken, async (req, res) => {
  const user_id = req.user!.userId;

  const { data, error } = await supabase
    .from("listings")
    .select("*, media(*)")
    .eq("user_id", user_id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json(data ?? []);
});


// update a listing
router.put("/:id", authenticateToken, async (req, res) => {
  const user_id = req.user!.userId;
  const { id } = req.params;

  const {
    title,
    price,
    description,
    condition,
    category,
    location,
    preferred_payment
  } = req.body;

  //validations
  const { data: listing, error: fetchError } = await supabase
    .from("listings")
    .select("user_id")
    .eq("id", id)
    .single();

  if (fetchError || !listing) {
    return res.status(404).json({ error: "listing not found" });
  }
  if (listing.user_id !== user_id) {
    return res.status(403).json({ error: "you do not own this listing" });
  }

  if (title !== undefined && (!title.trim())) {
  return res.status(400).json({ error: "title cannot be empty" });
  }
  let priceNum = undefined;
  if (price !== undefined) {
    priceNum = Number(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({ error: "price must be a number greater than 0" });
    }
  }
  if (condition && !CONDITION_ENUM.includes(condition)) {
    return res.status(400).json({ error: "invalid condition" });
  }
  if (category && !CATEGORY_ENUM.includes(category)) {
    return res.status(400).json({ error: "invalid category" });
  }
  if (preferred_payment && !PAYMENT_ENUM.includes(preferred_payment)) {
    return res.status(400).json({ error: "invalid payment method" });
  }
  if (location && !LOCATION_ENUM.includes(location)) {
    return res.status(400).json({ error: "invalid location" });
  }

  const updateFields: any = {};
  if (title !== undefined) updateFields.title = title;
  if (priceNum !== undefined) updateFields.price = priceNum;
  if (description !== undefined) updateFields.description = description;
  if (condition !== undefined) updateFields.condition = condition;
  if (category !== undefined) updateFields.category = category;
  if (location !== undefined) updateFields.location = location;
  if (preferred_payment !== undefined) updateFields.preferred_payment = preferred_payment;

  const { data, error } = await supabase
    .from("listings")
    .update(updateFields)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Update listing error:", error);
    return res.status(500).json({ error: error.message });
  }

  return res.json(data);
});


// get a specific listing by its id
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("listings")
    .select(`
      *,
      media (*),
      user:users (
        id,
        name,
        profile_image_url,
        is_verified,
        created_at
      )
    `)
    .eq("id", id)
    .single();

  if (error || !data) {     
    console.error("Fetch listing error:", error);
    return res.status(404).json({ error: "Listing not found" });
  }

  return res.json(data);
});


// delete a listing by its id
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
  if (listing.user_id !== user_id && req.user!.role !== "admin") {
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


// update an existant listing
router.post("/:id/status", authenticateToken, async (req, res) => {
  const user_id = req.user!.userId;
  const user_role = req.user!.role; // we already store role in req.user
  
  const { id } = req.params;
  const { status } = req.body;

  //validation
  if (!status || !STATUS_ENUM.includes(status)) {
    return res.status(400).json({ error: "invalid status" });
  }

  const { data: listing, error: fetchError } = await supabase
    .from("listings")
    .select("id, user_id")
    .eq("id", id)
    .single();

  if (fetchError || !listing) {
    return res.status(404).json({ error: "Listing not found" });
  }
  if (listing.user_id !== user_id && user_role !== "admin") {
    return res.status(403).json({ error: "You are not allowed to update this listing" });
  }


  const { data, error } = await supabase
    .from("listings")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Update status error:", error);
    return res.status(500).json({ error: error.message });
  }

  return res.json(data);
});


export default router;
