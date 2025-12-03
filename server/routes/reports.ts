// src/routes/reports.ts
import { Router } from "express";
import { supabase } from "../services/db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

type ReportReason =
  | "scam"
  | "prohibited_item"
  | "harassment"
  | "counterfeit"
  | "no_show";

router.post("/", authenticateToken, async (req, res) => {
  const reporter_id = req.user!.userId; // from your JWT

  const {
    listingId,
    reportedUserId,
    reason,
    notes,
  }: {
    listingId?: number;
    reportedUserId?: number;
    reason: ReportReason;
    notes?: string;
  } = req.body;

  // must report exactly ONE thing: a listing OR a user
  if ((!!listingId && !!reportedUserId) || (!listingId && !reportedUserId)) {
    return res
      .status(400)
      .json({ error: "Provide exactly one of listingId or reportedUserId" });
  }

  const validReasons: ReportReason[] = [
    "scam",
    "prohibited_item",
    "harassment",
    "counterfeit",
    "no_show",
  ];
  if (!validReasons.includes(reason)) {
    return res.status(400).json({ error: "Invalid reason" });
  }

  const { data, error } = await supabase
    .from("reports")
    .insert({
      reporter_id,
      listing_id: listingId ?? null,
      reported_user_id: reportedUserId ?? null,
      reason,
      notes: notes ?? null,
      status: "open",      // initial state
      resolved_by: null,
    })
    .select()
    .single();

  if (error) {
    console.error("Create report error:", error);
    return res.status(500).json({ error: error.message });
  }

  // TODO: optional - insert a row into notifications or send email to admins

  return res.status(201).json(data);
});

export default router;
