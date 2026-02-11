import express from 'express';
import {
    getSalesSummary,
    getTopProducts,
    getDailySales
} from '../controllers/reportController.js';

const router = express.Router();

router.get('/sales-summary', getSalesSummary);
router.get('/top-products', getTopProducts);
router.get('/daily-sales', getDailySales);

export default router;