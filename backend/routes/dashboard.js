import express from 'express';
import { getStats, getDailySales, getTopProducts, getRecentSales } from '../controllers/dashboardController.js';

const router = express.Router();

// Get dashboard stats
router.get('/stats', getStats);

// Get daily sales for chart
router.get('/daily-sales/:days', getDailySales);

// Get top products
router.get('/top-products', getTopProducts);

// Get recent sales
router.get('/recent-sales', getRecentSales);

export default router;
