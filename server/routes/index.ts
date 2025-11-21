import { Router } from 'express';
import searchRouter from './search.js';
import authRouter from './auth.js';
import listingsRouter from './listings.js';
import reportsRouter from './reports.js';        // NEW
import adminReportsRouter from './adminReports.js'; // NEW

const router = Router();

// Health check
router.get('/', (req, res) => {
  res.json({ message: 'BruinMarketplace API is running', version: '1.0.0' });
});

// Mount route modules
router.use('/search', searchRouter);
router.use('/auth', authRouter);
router.use('/listings', listingsRouter);
router.use('/reports', reportsRouter);        // POST /reports
router.use('/admin', adminReportsRouter);     // GET /admin/reports, POST /admin/reports/:id/status

export default router;
