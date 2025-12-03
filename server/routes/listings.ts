import { Router } from "express";
import { supabase } from "../services/db.js";
import { authenticateToken } from "../middleware/auth.js";


import multer from "multer"; // middleware for handling formData
import { uploadListingMedia } from "../services/uploads/fileuploader.js";


const router = Router();


const upload = multer({ storage: multer.memoryStorage() });

const CONDITION_ENUM = ["new", "like_new", "good", "fair", "poor"];
const CATEGORY_ENUM = ["textbooks", "electronics", "furniture", "parking", "clothing", "tickets", "other"];
const STATUS_ENUM = ["active", "sold", "traded", "removed"];
const PAYMENT_ENUM = ["zelle", "cash", "venmo", "other"];
const LOCATION_ENUM = ["hill", "on_campus", "off_campus", "univ_apps"];

//return all active listings (now requires authentication)
router.get("/", authenticateToken, async (req, res) => {
  const {
    condition,
    location,
    category,
    sort,
  } = req.query as {
    condition?: string;
    location?: string;
    category?: string;
    sort?: string;
  };
  
  let query = supabase
    .from("listings")
    .select("*, media(*)")
    .eq("status", "active");

    // filter applies to db based on user selection
    if (condition && CONDITION_ENUM.includes(condition)) {
      query = query.eq("condition", condition);
    }
    if (location && LOCATION_ENUM.includes(location)) {
      query = query.eq("location", location);
    }
    if (category && CATEGORY_ENUM.includes(category)) {
      query = query.eq("category", category);
    }

    // sort by date
    let ascending = false;
    if (sort === "date_asc") {
      ascending = true;
    } else if (sort === "date_desc") {
      ascending = false;
    }
    query = query.order("created_at", { ascending });
    
  const { data, error } = await query;
  if (error) {
    console.error("Listings fetch errr:", error);
    return res.status(500).json({ error: error.message });
  }

  return res.json(data ?? []);
});


router.post("/", authenticateToken, upload.array('mediaFiles', 5), async (req, res) => {
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

  const files = req.files as Express.Multer.File[];

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

  if (files && files.length > 0) {
    const mediaToInsert = [];

    for (const file of files) {
      try {
        const fileForUpload = new File([file.buffer], file.originalname, {
            type: file.mimetype,
        });

        const { publicUrl, type } = await uploadListingMedia({
            listingId: data.id, 
            file: fileForUpload, 
        });

        mediaToInsert.push({
          listing_id: data.id,
          url: publicUrl,
          type: type,
        });
      } catch (uploadError) {
        console.error("Error uploading one of the files:", uploadError);
      } 
    }

    if (mediaToInsert.length > 0) {
      const { error: mediaError } = await supabase
        .from("media")
        .insert(mediaToInsert);

      if (mediaError) {
        console.error("Insert media error:", mediaError);
      }
    }
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

router.get("/user/:userId", authenticateToken, async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await supabase
    .from("listings")
    .select("*, media(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json(data ?? []);
});

// update a listing
router.put("/:id", authenticateToken, upload.array('mediaFiles', 5), async (req, res) => {
  const user_id = req.user!.userId;
  const { id } = req.params;

  const {
    title,
    price,
    description = "",
    condition,
    category,
    location,
    preferred_payment = "other",
    mediaToDelete = "[]",
  } = req.body;

  const files = req.files as Express.Multer.File[];

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

  // delete the media that the user removed 
  let parsedMediaToDelete: number[] = [];
  try {
    parsedMediaToDelete = JSON.parse(mediaToDelete);
  } catch (e) {
    parsedMediaToDelete = [];
  }

  if (parsedMediaToDelete.length > 0) {
    const { data: mediaRows, error: fetchError } = await supabase
      .from("media")
      .select("url")
      .in("id", parsedMediaToDelete);
    if (fetchError) {
      return res.status(500).json({ error: fetchError.message });
    }

    const paths = mediaRows.map(m => {
      const parts = m.url.split("/object/public/listings/");
      return parts[1];
    });

    const { error: storageError } = await supabase.storage
      .from("listings")
      .remove(paths);
    if (storageError) {
      return res.status(500).json({ error: storageError.message });
    }

    await supabase
      .from("media")
      .delete()
      .in("id", parsedMediaToDelete);
  }

  // upload new files as media
  if (files && files.length > 0) {
    const mediaToInsert = [];

    for (const file of files) {
      try {
        const fileForUpload = new File([file.buffer], file.originalname, {
          type: file.mimetype,
        });

        const { publicUrl, type } = await uploadListingMedia({
          listingId: id,
          file: fileForUpload,
        });
        mediaToInsert.push({
          listing_id: id,
          url: publicUrl,
          type: type,
        });
      } catch (uploadErr) {
        console.error("Upload error:", uploadErr);
      }
    }

    if (mediaToInsert.length > 0) {
      await supabase.from("media").insert(mediaToInsert);
    }
  }

  return res.json({ success: true, updated: data });
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

  let interestedDetails: any[] = [];

  if (Array.isArray((data as any).interested_users) && (data as any).interested_users.length > 0) {
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, name, email, phone_number, class_year, major")
      .in("id", (data as any).interested_users);

    if (usersError) {
      console.error("Fetch interested users error:", usersError);
      return res.status(500).json({ error: usersError.message });
    }
    interestedDetails = users ?? [];
  }

  return res.json({
    ...data,
    interested_user_details: interestedDetails,
  });
});

router.post("/:id/interested", authenticateToken, async (req, res) => {
  const user_id = req.user!.userId;
  const { id } = req.params;

  const { data: listing, error: fetchError } = await supabase
    .from("listings")
    .select("id, user_id, interested_users")
    .eq("id", id)
    .single();

  if (fetchError || !listing) {
    return res.status(404).json({ error: "Listing not found" });
  }

  if (listing.user_id === user_id) {
    return res.status(400).json({ error: "You cannot mark interest on your own listing" });
  }

  const current = Array.isArray(listing.interested_users)
    ? listing.interested_users
    : [];

  if (current.includes(user_id)) {
    return res.json({ interested_users: current });
  }

  const updated = [...current, user_id];

  const { data, error: updateError } = await supabase
    .from("listings")
    .update({ interested_users: updated })
    .eq("id", id)
    .select("interested_users")
    .single();

  if (updateError) {
    return res.status(500).json({ error: updateError.message });
  }

  return res.json(data);
});

router.delete("/:id/interested/:userId", authenticateToken, async (req, res) => {
  const requesterId = req.user!.userId;
  const { id, userId } = req.params;

  const { data: listing, error: fetchError } = await supabase
    .from("listings")
    .select("id, user_id, interested_users")
    .eq("id", id)
    .single();

  if (fetchError || !listing) {
    return res.status(404).json({ error: "Listing not found" });
  }

  if (listing.user_id !== requesterId && req.user!.role !== "admin") {
    return res.status(403).json({ error: "You do not own this listing" });
  }

  const current = Array.isArray(listing.interested_users) ? listing.interested_users : [];
  const updated = current.filter((uid) => uid !== userId);

  const { data, error: updateError } = await supabase
    .from("listings")
    .update({ interested_users: updated })
    .eq("id", id)
    .select("interested_users")
    .single();

  if (updateError) {
    return res.status(500).json({ error: updateError.message });
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
  if (listing.user_id !== user_id && req.user!.role !== "admin") {
    return res.status(403).json({ error: "You do not own this listing" });
  }

  const { data: mediaRows, error: mediaFetchError } = await supabase
    .from("media")
    .select("id, url")
    .eq("listing_id", id)
  if (mediaFetchError) {
    return res.status(500).json({ error: mediaFetchError.message });
  }
  const paths = mediaRows.map(m => {
    const split = m.url.split("/object/public/listings/");
    return split[1];
  });

  if (paths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("listings")
      .remove(paths);
    if (storageError) {
      return res.status(500).json({ error: storageError.message });
    }

    const ids = mediaRows.map((m) => m.id);
    const { error: mediaDeleteError } = await supabase
      .from("media")
      .delete()
      .in("id", ids);
    if (mediaDeleteError) {
      return res.status(500).json({ error: mediaDeleteError.message });
    }
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
