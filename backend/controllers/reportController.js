import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';

// @desc    Get sales summary
// @route   GET /api/reports/sales-summary
export const getSalesSummary = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const matchStage = {};
        if (startDate && endDate) {
            matchStage.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const salesData = await Sale.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: '$totalAmount' },
                    totalOrders: { $sum: 1 },
                    averageOrderValue: { $avg: '$totalAmount' }
                }
            }
        ]);

        res.json(salesData[0] || { totalSales: 0, totalOrders: 0, averageOrderValue: 0 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get top selling products
// @route   GET /api/reports/top-products
export const getTopProducts = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        const topProducts = await Sale.aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: '$items.subtotal' }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' }
        ]);

        res.json(topProducts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get daily sales report
// @route   GET /api/reports/daily-sales
export const getDailySales = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        
        const dailySales = await Sale.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    totalSales: { $sum: '$totalAmount' },
                    totalOrders: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        res.json(dailySales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};