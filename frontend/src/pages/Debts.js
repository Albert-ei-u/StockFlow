import React, { useState, useEffect, useCallback } from 'react';
import { 
  CreditCard, 
  User, 
  Phone, 
  Mail, 
  DollarSign,
  CheckCircle,
  Clock,
  Search,
  Filter,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { saleAPI } from '../services/api';

const Debts = ({ user }) => {
  const [debts, setDebts] = useState([]);
  const [filteredDebts, setFilteredDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [stats, setStats] = useState({
    totalDebt: 0,
    totalCustomers: 0,
    paidAmount: 0,
    pendingAmount: 0
  });

  useEffect(() => {
    fetchDebts();
  }, []);

  useEffect(() => {
    filterDebts();
  }, [filterDebts]);

  const fetchDebts = async () => {
    try {
      setLoading(true);
      const response = await saleAPI.getAll();
      const allSales = response.data || [];
      
      // Filter only debt sales
      const debtSales = allSales.filter(sale => sale.isDebt);
      
      // Group by customer
      const customerDebts = {};
      debtSales.forEach(sale => {
        const customerName = sale.customerName || 'Unknown Customer';
        if (!customerDebts[customerName]) {
          customerDebts[customerName] = {
            customerName,
            customerEmail: sale.customerEmail,
            customerPhone: sale.customerPhone,
            totalDebt: 0,
            paidAmount: 0,
            pendingAmount: 0,
            sales: [],
            createdAt: sale.createdAt
          };
        }
        
        customerDebts[customerName].totalDebt += sale.totalAmount;
        customerDebts[customerName].paidAmount += sale.paidAmount || 0;
        customerDebts[customerName].pendingAmount += sale.remainingDebt || 0;
        customerDebts[customerName].sales.push(sale);
      });
      
      const debtsArray = Object.values(customerDebts);
      setDebts(debtsArray);
      
      // Calculate stats
      const totalDebt = debtsArray.reduce((sum, debt) => sum + debt.totalDebt, 0);
      const totalCustomers = debtsArray.length;
      const totalPaid = debtsArray.reduce((sum, debt) => sum + debt.paidAmount, 0);
      const totalPending = debtsArray.reduce((sum, debt) => sum + debt.pendingAmount, 0);
      
      setStats({
        totalDebt,
        totalCustomers,
        paidAmount: totalPaid,
        pendingAmount: totalPending
      });
      
    } catch (error) {
      console.error('Error fetching debts:', error);
      setDebts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterDebts = useCallback(() => {
    let filtered = debts;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(debt => 
        debt.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        debt.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        debt.customerPhone?.includes(searchTerm)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(debt => {
        if (statusFilter === 'pending') {
          return debt.pendingAmount > 0;
        } else if (statusFilter === 'paid') {
          return debt.pendingAmount === 0;
        }
        return true;
      });
    }

    setFilteredDebts(filtered);
  }, [debts, searchTerm, statusFilter]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (amount) => {
    if (amount > 0) return 'text-orange-600 bg-orange-100';
    return 'text-green-600 bg-green-100';
  };

  const getStatusIcon = (amount) => {
    if (amount > 0) return <Clock className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const handleRecordPayment = (customer) => {
    setSelectedCustomer(customer);
    setPaymentAmount('');
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    if (parseFloat(paymentAmount) > selectedCustomer.pendingAmount) {
      alert('Payment amount cannot exceed remaining debt');
      return;
    }

    try {
      // TODO: Create payment API call
      alert(`Payment of FRw ${parseFloat(paymentAmount).toFixed(2)} recorded for ${selectedCustomer.customerName}`);
      setShowPaymentModal(false);
      setSelectedCustomer(null);
      setPaymentAmount('');
      fetchDebts(); // Refresh the debts list
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Error recording payment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="ml-8 text-xl font-semibold text-gray-900 flex items-center">
                <CreditCard className="h-6 w-6 mr-2" />
                Customer Debts
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Debt</p>
                <p className="text-2xl font-bold text-gray-900">
                  FRw {stats.totalDebt.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalCustomers}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  FRw {stats.pendingAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-gray-900">
                  FRw {stats.paidAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by customer name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">All Debts</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Debts List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredDebts.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No debts found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'No customer debts recorded yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Debt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount Paid
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remaining
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      First Sale
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDebts.map((debt) => (
                    <tr key={debt.customerName} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {debt.customerName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {debt.sales.length} sale{debt.sales.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {debt.customerEmail && (
                            <div className="flex items-center mb-1">
                              <Mail className="h-3 w-3 mr-1 text-gray-400" />
                              {debt.customerEmail}
                            </div>
                          )}
                          {debt.customerPhone && (
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1 text-gray-400" />
                              {debt.customerPhone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          FRw {debt.totalDebt.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">
                          FRw {debt.paidAmount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-orange-600">
                          FRw {debt.pendingAmount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(debt.pendingAmount)}`}>
                          {getStatusIcon(debt.pendingAmount)}
                          <span className="ml-1">
                            {debt.pendingAmount > 0 ? 'Pending' : 'Paid'}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(debt.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          View Details
                        </button>
                        {debt.pendingAmount > 0 && (
                          <button 
                            onClick={() => handleRecordPayment(debt)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Record Payment
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Record Payment for {selectedCustomer.customerName}
            </h3>
            
            <div className="mb-4">
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Debt:</span>
                  <span className="font-medium">FRw {selectedCustomer.totalDebt.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Already Paid:</span>
                  <span className="font-medium text-green-600">FRw {selectedCustomer.paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium pt-2 border-t">
                  <span>Remaining:</span>
                  <span className="text-orange-600">FRw {selectedCustomer.pendingAmount.toFixed(2)}</span>
                </div>
              </div>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Amount
              </label>
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">FRw</span>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  min="0"
                  max={selectedCustomer.pendingAmount}
                  step="0.01"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter payment amount"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handlePaymentSubmit}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition"
              >
                Record Payment
              </button>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedCustomer(null);
                  setPaymentAmount('');
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Debts;
