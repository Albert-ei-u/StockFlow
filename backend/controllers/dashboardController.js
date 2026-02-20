import User from '../models/User.js';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';

// Get Dashboard Stats
export const getStats = async (req, res) => {
  try {
    // Get total sales amount
    const salesResult = await Sale.aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    // Get total products
    const totalProducts = await Product.countDocuments();

    // Get total customers (unique customers from sales)
    const totalCustomers = await Sale.distinct('customerName').then(customers => 
      customers.filter(customer => customer && customer.trim() !== '').length
    );

    // Get last month's stats for comparison
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const lastMonthSales = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: lastMonth, $lt: new Date() }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    const currentStats = salesResult[0] || { totalSales: 0, totalOrders: 0 };
    const lastMonthStats = lastMonthSales[0] || { totalSales: 0, totalOrders: 0 };

    // Calculate growth percentages
    const salesGrowth = lastMonthStats.totalSales > 0 
      ? ((currentStats.totalSales - lastMonthStats.totalSales) / lastMonthStats.totalSales * 100)
      : 0;
    
    const ordersGrowth = lastMonthStats.totalOrders > 0 
      ? ((currentStats.totalOrders - lastMonthStats.totalOrders) / lastMonthStats.totalOrders * 100)
      : 0;

    res.json({
      totalSales: currentStats.totalSales,
      totalOrders: currentStats.totalOrders,
      totalProducts,
      totalCustomers,
      salesGrowth: parseFloat(salesGrowth.toFixed(1)),
      ordersGrowth: parseFloat(ordersGrowth.toFixed(1))
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
};

// Get Daily Sales for Chart
export const getDailySales = async (req, res) => {
  try {
    const days = parseInt(req.params.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailySales = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%a",
              date: "$createdAt"
            }
          },
          sales: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json(dailySales);
  } catch (error) {
    console.error('Error getting daily sales:', error);
    res.status(500).json({ message: 'Error fetching daily sales' });
  }
};

// Get Top Products
export const getTopProducts = async (req, res) => {
  try {
    const topProducts = await Sale.aggregate([
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.productId',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $project: {
          name: '$product.name',
          value: '$totalQuantity',
          color: { $literal: '#3B82F6' }
        }
      },
      {
        $sort: { value: -1 }
      },
      {
        $limit: 5
      }
    ]);

    res.json(topProducts);
  } catch (error) {
    console.error('Error getting top products:', error);
    res.status(500).json({ message: 'Error fetching top products' });
  }
};

// Get Recent Sales
export const getRecentSales = async (req, res) => {
  try {
    const recentSales = await Sale.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('items.product', 'name price');

    const formattedSales = recentSales.map(sale => ({
      id: sale._id,
      customer: sale.customerName || 'Walk-in Customer',
      amount: sale.totalAmount,
      status: sale.status,
      date: sale.createdAt.toISOString().split('T')[0]
    }));

    res.json(formattedSales);
  } catch (error) {
    console.error('Error getting recent sales:', error);
    res.status(500).json({ message: 'Error fetching recent sales' });
  }
};
