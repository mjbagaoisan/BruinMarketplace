import { Router } from 'express';
import searchRouter from './search.js';
import authRouter from './auth.js';
import listingsRouter from './listings.js';
import profileRouter from "./profile.js";
import reports from "./reports.js"
import adminReports from "./adminReports.js"

const router = Router();

// Health check
router.get('/', (req, res) => {
  res.json({ message: 'BruinMarketplace API is running', version: '1.0.0' });
});

// Mount route modules
router.use('/search', searchRouter);
router.use('/auth', authRouter);
router.use('/listings', listingsRouter);
router.use("/profile", profileRouter);
router.use('/reports', reports)
router.use('/admin', adminReports)


export default router;
