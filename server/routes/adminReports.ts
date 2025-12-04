// server/routes/adminReports.ts
import { Router } from "express";
import { supabase } from "../services/db.js";
import { authenticateToken } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

const router = Router();

type ReportStatus = "open" | "in_review" | "resolved";

/**
 * GET /admin/reports
 * List all reports for the admin dashboard.
 * Also include whether the reported user is currently suspended.
 */
router.get(
  "/reports",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    // 1) Get all reports
    const { data: reports, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch reports error:", error);
      return res.status(500).json({ error: error.message });
    }

    let enrichedReports: any[] = reports ?? [];

    // 2) Collect distinct reported_user_ids
    const userIds = Array.from(
      new Set(
        enrichedReports
          .map((r) => r.reported_user_id)
          .filter((id: string | null) => !!id)
      )
    );

    if (userIds.length > 0) {
      // 3) Fetch those users and their suspension status
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, is_suspended")
        .in("id", userIds);

      if (usersError) {
        console.error("Fetch users for reports error:", usersError);
        // we’ll still return reports, just without the extra info
      } else if (users) {
        const userMap = new Map(users.map((u: any) => [u.id, u]));

        // 4) Attach reported_user onto each report
        enrichedReports = enrichedReports.map((r) => ({
          ...r,
          reported_user: r.reported_user_id
            ? userMap.get(r.reported_user_id) ?? null
            : null,
        }));
      }
    }

    return res.json(enrichedReports);
  }
);

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
    const adminId = admin.userId;
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

    // log into admin_actions
    const { error: logError } = await supabase.from("admin_actions").insert({
      admin_id: adminId,
      action: "update_report_status",
      target_type: "report",
      target_id: String(reportId),
      notes: `Status changed from ${oldReport.status} to ${status}`,
    });

    if (logError) {
      console.error("admin_actions log error (update_report_status):", logError);
    }

    return res.json(updated);
  }
);

/**
 * POST /admin/listings/:id/remove
 * Body (optional): { reportId?: number }
 * Marks listing as removed (status + deleted_at), optionally resolves report, logs action.
 */
router.post(
  "/listings/:id/remove",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    const admin = (req as any).user;
    const adminId = admin.userId;
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
    const adminId = admin.userId;
    const userId = req.params.id; // users.id is text
    const { reportId } = req.body || {};

    // 1) Update user as suspended
    const { data: userRow, error: userError } = await supabase
      .from("users")
      .update({
        is_suspended: true,
      })
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
      action: "suspend_user",
      target_type: "user",
      target_id: String(userId),
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

/**
 * POST /admin/users/:id/unsuspend
 * Unsuspends a user and logs the action.
 */
router.post(
  "/users/:id/unsuspend",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    const admin = (req as any).user;
    const adminId = admin.userId;
    const userId = req.params.id; // users.id is text

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
      target_id: String(userId),
      notes: "User unsuspended by admin",
    });

    if (logError) {
      console.error("admin_actions log error (unsuspend_user):", logError);
    }

    return res.json({ success: true, user: userRow });
  }
);

export default router;
