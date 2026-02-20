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
  Activity,
  Building,
  Copy,
  Check,
  CreditCard
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dashboardAPI } from '../services/api';

const Dashboard = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [business, setBusiness] = useState(null);
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
    // Load business data from localStorage
    const businessData = localStorage.getItem('business');
    if (businessData) {
      setBusiness(JSON.parse(businessData));
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from backend APIs
      const [statsResponse, salesResponse, productsResponse, recentSalesResponse] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getDailySales(7),
        dashboardAPI.getTopProducts(),
        dashboardAPI.getRecentSales()
      ]);

      setStats(statsResponse.data || {
        totalSales: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalCustomers: 0,
        salesGrowth: 0,
        ordersGrowth: 0
      });

      setSalesData(salesResponse.data || []);
      setTopProducts(productsResponse.data || []);
      setRecentSales(recentSalesResponse.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty data on error
      setStats({
        totalSales: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalCustomers: 0,
        salesGrowth: 0,
        ordersGrowth: 0
      });
      setSalesData([]);
      setTopProducts([]);
      setRecentSales([]);
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
            {typeof value === 'number' && title.includes('Sales') ? `FRw ${value.toLocaleString()}` : value.toLocaleString()}
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
              <Link
                to="/products"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition ${
                  user?.role === 'staff' 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={(e) => user?.role === 'staff' && e.preventDefault()}
              >
                <Package className="h-5 w-5 mr-3" />
                Products
                {user?.role === 'staff' && (
                  <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">Owner Only</span>
                )}
              </Link>
              <Link
                to="/sales-history"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition ${
                  user?.role === 'staff' 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={(e) => user?.role === 'staff' && e.preventDefault()}
              >
                <ShoppingCart className="h-5 w-5 mr-3" />
                Sales
                {user?.role === 'staff' && (
                  <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">Owner Only</span>
                )}
              </Link>
              <Link
                to="/debts"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition ${
                  user?.role === 'staff' 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={(e) => user?.role === 'staff' && e.preventDefault()}
              >
                <CreditCard className="h-5 w-5 mr-3" />
                Debts
                {user?.role === 'staff' && (
                  <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">Owner Only</span>
                )}
              </Link>
              <button 
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition w-full text-left ${
                  user?.role === 'staff' 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                disabled={user?.role === 'staff'}
              >
                <Activity className="h-5 w-5 mr-3" />
                Reports
                {user?.role === 'staff' && (
                  <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">Owner Only</span>
                )}
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Business Code Display for Owners */}
          {user?.role === 'owner' && business && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Building className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{business.name}</h3>
                    <p className="text-xs text-gray-600">Business Code</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-white border border-blue-300 rounded-lg px-3 py-2 font-mono text-lg font-bold text-blue-600">
                    {business.businessCode}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(business.businessCode);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                    title="Copy business code"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Sales"
              value={stats.totalSales}
              icon={TrendingUp}
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
                        FRw {sale.amount.toFixed(2)}
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
