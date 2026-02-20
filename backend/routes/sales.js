import express from 'express';
import { getSales, getSale, createSale, updateSaleStatus, getSalesByDateRange } from '../controllers/saleController.js';

const router = express.Router();

// Get all sales
router.get('/', getSales);

// Get recent sales (for dashboard)
router.get('/recent', getSales);

// Get single sale
router.get('/:id', getSale);

// Create sale
router.post('/', createSale);

// Update sale status
router.patch('/:id/status', updateSaleStatus);

// Get sales by date range
router.get('/dates/:startDate/:endDate', getSalesByDateRange);

export default router;