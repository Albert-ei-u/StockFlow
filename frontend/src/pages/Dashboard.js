import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users,
  Plus,
  LogOut,
  Menu,
  X,
  BarChart3,
  Activity
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    salesGrowth: 0,
    ordersGrowth: 0
  });
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Simulate API calls - replace with actual API calls
      setLoading(true);
      
      // Mock data for demonstration
      const mockStats = {
        totalSales: 45678.50,
        totalOrders: 234,
        totalProducts: 56,
        totalCustomers: 128,
        salesGrowth: 12.5,
        ordersGrowth: 8.3
      };

      const mockSalesData = [
        { name: 'Mon', sales: 2400, orders: 45 },
        { name: 'Tue', sales: 1398, orders: 28 },
        { name: 'Wed', sales: 9800, orders: 89 },
        { name: 'Thu', sales: 3908, orders: 48 },
        { name: 'Fri', sales: 4800, orders: 67 },
        { name: 'Sat', sales: 3800, orders: 52 },
        { name: 'Sun', sales: 4300, orders: 58 }
      ];

      const mockTopProducts = [
        { name: 'Laptop Pro', value: 35, color: '#3B82F6' },
        { name: 'Phone X', value: 25, color: '#10B981' },
        { name: 'Tablet Plus', value: 20, color: '#F59E0B' },
        { name: 'Watch Smart', value: 12, color: '#EF4444' },
        { name: 'Others', value: 8, color: '#8B5CF6' }
      ];

      const mockRecentSales = [
        { id: '1', customer: 'John Doe', amount: 245.99, status: 'completed', date: '2024-01-15' },
        { id: '2', customer: 'Jane Smith', amount: 189.50, status: 'pending', date: '2024-01-15' },
        { id: '3', customer: 'Bob Johnson', amount: 425.00, status: 'completed', date: '2024-01-14' },
        { id: '4', customer: 'Alice Brown', amount: 89.99, status: 'completed', date: '2024-01-14' },
        { id: '5', customer: 'Charlie Wilson', amount: 312.75, status: 'pending', date: '2024-01-13' }
      ];

      setStats(mockStats);
      setSalesData(mockSalesData);
      setTopProducts(mockTopProducts);
      setRecentSales(mockRecentSales);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, change, changeType }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {typeof value === 'number' && title.includes('$') ? `$${value.toLocaleString()}` : value.toLocaleString()}
          </p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
              {changeType === 'positive' ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {change}% from last month
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${title.includes('Sales') ? 'bg-blue-100' : title.includes('Orders') ? 'bg-green-100' : title.includes('Products') ? 'bg-yellow-100' : 'bg-purple-100'}`}>
          <Icon className={`h-6 w-6 ${title.includes('Sales') ? 'text-blue-600' : title.includes('Orders') ? 'text-green-600' : title.includes('Products') ? 'text-yellow-600' : 'text-purple-600'}`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <h1 className="ml-4 text-2xl font-bold text-gray-900">SalesFlow Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.name || 'User'}</span>
              <button
                onClick={onLogout}
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="flex items-center justify-center h-16 bg-blue-600 text-white">
            <h2 className="text-xl font-bold">SalesFlow</h2>
          </div>
          <nav className="mt-8">
            <div className="px-4 space-y-2">
              <Link
                to="/dashboard"
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg"
              >
                <BarChart3 className="h-5 w-5 mr-3" />
                Dashboard
              </Link>
              <Link
                to="/new-sale"
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <Plus className="h-5 w-5 mr-3" />
                New Sale
              </Link>
              <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition w-full text-left">
                <Package className="h-5 w-5 mr-3" />
                Products
              </button>
              <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition w-full text-left">
                <ShoppingCart className="h-5 w-5 mr-3" />
                Sales
              </button>
              <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition w-full text-left">
                <Users className="h-5 w-5 mr-3" />
                Customers
              </button>
              <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition w-full text-left">
                <Activity className="h-5 w-5 mr-3" />
                Reports
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Sales"
              value={stats.totalSales}
              icon={DollarSign}
              change={stats.salesGrowth}
              changeType="positive"
            />
            <StatCard
              title="Total Orders"
              value={stats.totalOrders}
              icon={ShoppingCart}
              change={stats.ordersGrowth}
              changeType="positive"
            />
            <StatCard
              title="Total Products"
              value={stats.totalProducts}
              icon={Package}
            />
            <StatCard
              title="Total Customers"
              value={stats.totalCustomers}
              icon={Users}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Sales Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Top Products Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={topProducts}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {topProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Orders Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Sales Table */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {sale.customer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${sale.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          sale.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {sale.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sale.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
