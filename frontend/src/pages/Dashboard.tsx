import React, { useState, useEffect } from 'react';
import { TrendingUp, Package, DollarSign, AlertTriangle } from 'lucide-react';
import Layout from '../components/Layout';
import { reportAPI, inventoryAPI } from '../services/api.js';
import { SalesSummary, Inventory } from '../types.js';

const Dashboard: React.FC = () => {
  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null);
  const [lowStockItems, setLowStockItems] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [summaryData, lowStockData] = await Promise.all([
        reportAPI.getSalesSummary(),
        inventoryAPI.getLowStockAlerts()
      ]);
      
      setSalesSummary(summaryData.data);
      setLowStockItems(lowStockData.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Overview of your sales and inventory status
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Sales
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ${salesSummary?.totalSales?.toFixed(2) || '0.00'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Orders
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {salesSummary?.totalOrders || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Average Order Value
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ${salesSummary?.averageOrderValue?.toFixed(2) || '0.00'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Low Stock Alerts
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {lowStockItems.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Low Stock Alerts
            </h2>
            <div className="bg-white shadow overflow-hidden rounded-md">
              <ul className="divide-y divide-gray-200">
                {lowStockItems.map((item) => (
                  <li key={item._id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          SKU: {item.product.sku} | Current Stock: {item.currentStock}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Low Stock
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;