import express from 'express';
import {
    getSales,
    getSale,
    createSale,
    updateSaleStatus,
    getSalesByDateRange
} from '../controllers/saleController.js';

const router = express.Router();

router.get('/', getSales);
router.get('/dates/:startDate/:endDate', getSalesByDateRange);
router.get('/:id', getSale);
router.post('/', createSale);
router.patch('/:id/status', updateSaleStatus);

export default router;