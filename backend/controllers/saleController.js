import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';

// @desc    Get all sales
// @route   GET /api/sales
export const getSales = async (req, res) => {
    try {
        const sales = await Sale.find()
            .populate('items.product', 'name sku price')
            .sort({ createdAt: -1 });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single sale
// @route   GET /api/sales/:id
export const getSale = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id)
            .populate('items.product', 'name sku price');
        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }
        res.json(sale);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create sale
// @route   POST /api/sales
export const createSale = async (req, res) => {
    try {
        const { items, paymentMethod, customerName, customerEmail, customerPhone, salesperson, notes, paidAmount, remainingDebt } = req.body;

        // Validate stock availability
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(400).json({ message: `Product ${item.product} not found` });
            }
            if (product.stockQuantity < item.quantity) {
                return res.status(400).json({ 
                    message: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}, Required: ${item.quantity}` 
                });
            }
            // Set current price
            item.unitPrice = product.price;
            item.subtotal = product.price * item.quantity;
        }

        // Calculate total
        const totalAmount = items.reduce((total, item) => total + item.subtotal, 0);

        // Determine if this is a debt sale
        const isDebtSale = paymentMethod === 'Debt' || (paymentMethod === 'Partial' && remainingDebt > 0);

        // Create sale
        const sale = new Sale({
            items,
            totalAmount,
            paymentMethod,
            isDebt: isDebtSale,
            paidAmount: paidAmount || 0,
            remainingDebt: remainingDebt || 0,
            customerName,
            customerEmail,
            customerPhone,
            salesperson,
            notes
        });

        const savedSale = await sale.save();

        // Update product stock and inventory (stock decreases for all sales including partial payments)
        for (const item of items) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stockQuantity: -item.quantity } }
            );

            await Inventory.findOneAndUpdate(
                { product: item.product },
                { 
                    $inc: { currentStock: -item.quantity },
                    $push: {
                        movements: {
                            type: 'OUT',
                            quantity: item.quantity,
                            reference: savedSale.saleNumber,
                            notes: `Sale: ${customerName || 'Walk-in customer'} (${paymentMethod})`
                        }
                    }
                }
            );
        }

        const populatedSale = await Sale.findById(savedSale._id)
            .populate('items.product', 'name sku price');

        res.status(201).json(populatedSale);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update sale status
// @route   PATCH /api/sales/:id/status
export const updateSaleStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const sale = await Sale.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );
        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }
        res.json(sale);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get sales by date range
// @route   GET /api/sales/dates/:startDate/:endDate
export const getSalesByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.params;
        const sales = await Sale.find({
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }).populate('items.product', 'name sku price');
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};