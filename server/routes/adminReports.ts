import { Router } from "express";
import { supabase } from "../services/db.js";
import { authenticateToken } from "../middleware/auth.js";

import { requireAdmin } from '../middleware/admin.js';

const router = Router();

// GET /admin/reports
router.get('/reports', authenticateToken, requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch reports error:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.json(data ?? []);
});

// POST /admin/reports/:id/status
router.post(
  '/reports/:id/status',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    const admin = (req as any).user;
    const adminId = admin.userId;
    const reportId = Number(req.params.id);
    const { status } = req.body as {
      status: 'open' | 'in_review' | 'resolved';
    };

    if (!['open', 'in_review', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const { data: oldReport, error: fetchErr } = await supabase
      .from('reports')
      .select('status')
      .eq('id', reportId)
      .single();

    if (fetchErr || !oldReport) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const update: any = { status };
    if (status === 'resolved') {
      update.resolved_by = adminId;
    }

    const { data: updated, error } = await supabase
      .from('reports')
      .update(update)
      .eq('id', reportId)
      .select()
      .single();

    if (error) {
      console.error('Update report status error:', error);
      return res.status(500).json({ error: error.message });
    }

    // log to admin_actions
    const { error: logError } = await supabase
        .from('admin_actions')
        .insert({
        admin_id: adminId,
        action: 'update_report_status',
        target_type: 'report',
        target_id: reportId,
        notes: `Status changed from ${oldReport.status} to ${status}`,
    });
    if (logError) {
        console.error('admin_actions log error:', logError);
    }
    
    return res.json(updated);
  }
);

export default router;
