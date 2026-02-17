import Inventory from '../models/Inventory.js';
import Product from '../models/Product.js';

// @desc    Get all inventory
// @route   GET /api/inventory
export const getInventory = async (req, res) => {
    try {
        const inventory = await Inventory.find()
            .populate('product', 'name sku category price minStockLevel isActive')
            .sort({ lowStockAlert: -1, currentStock: 1 });
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
export const getInventoryItem = async (req, res) => {
    try {
        const inventory = await Inventory.findById(req.params.id)
            .populate('product', 'name sku category price minStockLevel');
        if (!inventory) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update inventory (restock)
// @route   POST /api/inventory/:id/restock
export const restockInventory = async (req, res) => {
    try {
        const { quantity, notes, supplier } = req.body;
        
        const inventory = await Inventory.findById(req.params.id);
        if (!inventory) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        // Update inventory
        inventory.currentStock += quantity;
        inventory.lastRestockDate = new Date();
        inventory.movements.push({
            type: 'IN',
            quantity,
            reference: `RESTOCK-${Date.now()}`,
            notes: notes || `Restocked from ${supplier || 'Unknown supplier'}`
        });

        await inventory.save();

        // Update product stock
        await Product.findByIdAndUpdate(
            inventory.product,
            { 
                $inc: { stockQuantity: quantity },
                supplier: supplier || undefined
            }
        );

        const updatedInventory = await Inventory.findById(inventory._id)
            .populate('product', 'name sku category price');

        res.json(updatedInventory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc Get low stock alerts
// @route GET /api/inventory/low-stock
export const getLowStockAlerts = async (req, res) => {
    try {
        const lowStockItems = await Inventory.find({ lowStockAlert: true })
            .populate('product', 'name sku category minStockLevel')
            .sort({ currentStock: 1 });
        res.json(lowStockItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get inventory movements for a product
// @route  GET /api/inventory/:id/movements
export const getInventoryMovements = async (req, res) => {
    try {
        const inventory = await Inventory.findById(req.params.id)
            .select('movements')
            .populate('product', 'name sku');
        if (!inventory) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};