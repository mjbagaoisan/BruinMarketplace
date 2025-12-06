// server/routes/adminReports.ts
import { Router } from "express";
import { supabase } from "../services/db.js";
import { authenticateToken } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

const router = Router();

type ReportStatus = "open" | "in_review" | "resolved";

/**
 * GET /admin/reports
 * List reports for the admin dashboard.
 */
router.get("/reports", authenticateToken, requireAdmin, async (req, res) => {
  // Include the reported user's suspension flag in this query
  const { data, error } = await supabase
    .from("reports")
    .select(`
      *,
      reported_user:users!reports_reported_user_id_fkey (
        is_suspended
      )
    `)
    .select(`
      *,
      reported_user:users!reports_reported_user_id_fkey (is_suspended)
    `) // Select 'is_suspended' from 'users' where 'user_id' matches 'reported_user_id'.
    .or(
      // and(listing_id IS NOT NULL, status != 'resolved')
      // OR reported_user_id IS NOT NULL
      "and(listing_id.not.is.null,status.neq.resolved),reported_user_id.not.is.null"
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch reports error:", error);
    return res.status(500).json({ error: error.message });
  }

  // Flatten the joined reported_user.is_suspended field into each report
  const reportsWithSuspension = (data ?? []).map(
    ({ reported_user, ...report }) => ({
      ...report,
      reported_user_is_suspended: reported_user?.is_suspended ?? false,
    })
  );

  return res.json(reportsWithSuspension);
});

/**
 * POST /admin/reports/:id/status
 * Body: { status: "open" | "in_review" | "resolved" }
 * Updates report.status + resolved_by, logs to admin_actions.
 */
router.post(
  "/reports/:id/status",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    const admin = (req as any).user;
    const adminId: string = admin.userId;
    const reportId = Number(req.params.id);
    const { status } = req.body as { status: ReportStatus };

    const allowedStatuses: ReportStatus[] = ["open", "in_review", "resolved"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // get old status for logging
    const { data: oldReport, error: fetchErr } = await supabase
      .from("reports")
      .select("status")
      .eq("id", reportId)
      .single();

    if (fetchErr || !oldReport) {
      return res.status(404).json({ error: "Report not found" });
    }

    const update: any = { status };
    if (status === "resolved") {
      update.resolved_by = adminId;
    }

    const { data: updated, error } = await supabase
      .from("reports")
      .update(update)
      .eq("id", reportId)
      .select()
      .single();

    if (error) {
      console.error("Update report status error:", error);
      return res.status(500).json({ error: error.message });
    }

    // only log to admin_actions when resolving (close_report is a valid action per schema)
    if (status === "resolved") {
      const { error: logError } = await supabase.from("admin_actions").insert({
        admin_id: adminId,
        action: "close_report",
        target_type: "report",
        target_id: String(reportId),
        notes: `Report resolved (was ${oldReport.status})`,
      });

      if (logError) {
        console.error("admin_actions log error (close_report):", logError);
      }
    }

    return res.json(updated);
  }
);

/**
 * POST /admin/listings/:id/remove
 * Body (optional): { reportId?: number }
 * Marks listing as removed (status + deleted_at),
 * optionally resolves report, logs action.
 */
router.post(
  "/listings/:id/remove",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    const admin = (req as any).user;
    const adminId: string = admin.userId;
    const listingId = Number(req.params.id);
    const { reportId } = req.body || {};

    // 1) Mark listing as removed in listings table
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .update({
        status: "removed",
        deleted_at: new Date().toISOString(),
      })
      .eq("id", listingId)
      .select()
      .single();

    if (listingError) {
      console.error("Remove listing error:", listingError);
      return res.status(500).json({ error: listingError.message });
    }

    // 2) Optionally resolve related report
    if (reportId) {
      const { error: reportUpdateError } = await supabase
        .from("reports")
        .update({
          status: "resolved",
          resolved_by: adminId,
        })
        .eq("id", reportId);

      if (reportUpdateError) {
        console.error("Report resolve error:", reportUpdateError);
      }
    }

    // 3) Log action
    const { error: logError } = await supabase.from("admin_actions").insert({
      admin_id: adminId,
      action: "remove_listing",
      target_type: "listing",
      target_id: String(listingId),
      notes: reportId
        ? `Listing removed in response to report #${reportId}`
        : "Listing removed by admin",
    });

    if (logError) {
      console.error("admin_actions log error (remove_listing):", logError);
    }

    return res.json({ success: true, listing });
  }
);

/**
 * POST /admin/users/:id/suspend
 * Body (optional): { reportId?: number }
 * Suspends a user, optionally resolves report, logs action.
 */
router.post(
  "/users/:id/suspend",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    const admin = (req as any).user;
    const adminId: string = admin.userId;
    const userId: string = req.params.id; // users.id is text
    const { reportId } = req.body || {};

    // 1) Update user as suspended
    const { data: userRow, error: userError } = await supabase
      .from("users")
      .update({ is_suspended: true })
      .eq("id", userId)
      .select()
      .single();

    if (userError) {
      console.error("Suspend user error:", userError);
      return res.status(500).json({ error: userError.message });
    }

    // 2) Optionally resolve related report
    if (reportId) {
      const { error: reportUpdateError } = await supabase
        .from("reports")
        .update({
          status: "resolved",
          resolved_by: adminId,
        })
        .eq("id", reportId);

      if (reportUpdateError) {
        console.error("Report resolve error:", reportUpdateError);
      }
    }

    // 3) Log action
    const { error: logError } = await supabase.from("admin_actions").insert({
      admin_id: adminId,
      action: "ban_user",
      target_type: "user",
      target_id: userId,
      notes: reportId
        ? `User suspended in response to report #${reportId}`
        : "User suspended by admin",
    });

    if (logError) {
      console.error("admin_actions log error (suspend_user):", logError);
    }

    return res.json({ success: true, user: userRow });
  }
);

/*
PROMPT
I’m working in adminReports.ts on my Express + Supabase backend. I already have the router set up with authenticateToken and requireAdmin, 
and I’m adding a POST /admin/users/:id/suspend route.
The idea is:
Get adminId from (req as any).user.userId
userId from req.params.id (this matches users.id which is text)
Optional JSON body { reportId?: number }
I want to:
Mark the user as suspended in the users table (is_suspended: true) and return the updated row.
If a reportId is passed, mark that report as status = "resolved" and set resolved_by = adminId.
Log the action in an admin_actions table with:
admin_id, action: "ban_user", target_type: "user", target_id: userId
notes should mention the report if reportId is present, otherwise just say it was a manual suspension.
I’ve sketched most of this out but I’m not sure about the cleanest way to structure the error handling and logging around Supabase calls. 
Can you show me what a solid implementation of this handler would look like, keeping it consistent with the rest of an Express route file?
PROMPT

Here I just wanted to really make sure I implemented this correctly, as suspending users is a serious offense
So using ChatGPT to verify I was on the right track gave me peace of mind once properly implemented
From here I tested it to make sure it worked and it did

*/
/**
 * POST /admin/users/:id/unsuspend
 * Unsuspends a user & logs action.
 */
router.post(
  "/users/:id/unsuspend",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    const admin = (req as any).user;
    const adminId: string = admin.userId;
    const userId: string = req.params.id; // users.id is text

    const { data: userRow, error: userError } = await supabase
      .from("users")
      .update({ is_suspended: false })
      .eq("id", userId)
      .select()
      .single();

    if (userError) {
      console.error("Unsuspend user error:", userError);
      return res.status(500).json({ error: userError.message });
    }

    const { error: logError } = await supabase.from("admin_actions").insert({
      admin_id: adminId,
      action: "unsuspend_user",
      target_type: "user",
      target_id: userId,
      notes: "User unsuspended by admin",
    });

    if (logError) {
      console.error("admin_actions log error (unsuspend_user):", logError);
    }

    return res.json({ success: true, user: userRow });
  }
);

export default router;
