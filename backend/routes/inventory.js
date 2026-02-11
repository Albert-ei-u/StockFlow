import express from 'express';
import {
    getInventory,
    getInventoryItem,
    restockInventory,
    getLowStockAlerts,
    getInventoryMovements
} from '../controllers/inventoryController.js';

const router = express.Router();

router.get('/', getInventory);
router.get('/low-stock', getLowStockAlerts);
router.get('/:id', getInventoryItem);
router.get('/:id/movements', getInventoryMovements);
router.post('/:id/restock', restockInventory);

export default router;