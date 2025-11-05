import { Router, Request, Response } from 'express';
import { supabase } from '../services/db.js';

const router = Router();

/**
 * GET /api/search
 * Search listings by title or description
 * Query params:
 *   - q: search query (required)
 *   - page: page number (default: 1)
 *   - limit: results per page (default: 12, max: 50)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '').trim();
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '12'), 10)));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    if (!q) {
      return res.json({ results: [], total: 0, page, limit });
    }

    const { data, error, count } = await supabase
      .from('listings')
      .select('*', { count: 'exact' })
      .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Supabase search error:', error);
      return res.status(500).json({ error: error.message });
    }

    res.setHeader('cache-control', 'no-store');
    return res.json({ 
      results: data ?? [], 
      total: count ?? 0, 
      page, 
      limit 
    });
  } catch (e: any) {
    console.error('Search route error:', e);
    return res.status(500).json({ error: e?.message || 'Unexpected error' });
  }
});

export default router;
