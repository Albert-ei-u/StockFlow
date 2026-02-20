import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  DollarSign, 
  Package, 
  User, 
  CreditCard,
  ShoppingCart,
  ArrowLeft,
  Save,
  X
} from 'lucide-react';
import { productAPI, saleAPI } from '../services/api';

const NewSale = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isDebt, setIsDebt] = useState(false);
  const [isPartialPayment, setIsPartialPayment] = useState(false);
  const [paidAmount, setPaidAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showProductSearch, setShowProductSearch] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addProduct = (product) => {
    const existingProduct = selectedProducts.find(p => (p._id || p.id) === (product._id || product.id));
    if (existingProduct) {
      if (existingProduct.quantity < product.stock) {
        setSelectedProducts(selectedProducts.map(p =>
          (p._id || p.id) === (product._id || product.id) 
            ? { ...p, quantity: p.quantity + 1, subtotal: (p.quantity + 1) * (p.sellingPrice || p.cost * 1.5) }
            : p
        ));
      }
    } else {
      setSelectedProducts([...selectedProducts, {
        ...product,
        quantity: 1,
        sellingPrice: product.cost * 1.5, // Default selling price (50% markup)
        subtotal: product.cost * 1.5
      }]);
    }
    setShowProductSearch(false);
    setSearchTerm('');
  };

  const updateQuantity = (productId, change) => {
    setSelectedProducts(selectedProducts.map(product => {
      if ((product._id || product.id) === productId) {
        const newQuantity = product.quantity + change;
        if (newQuantity > 0 && newQuantity <= product.stock) {
          return {
            ...product,
            quantity: newQuantity,
            subtotal: newQuantity * (product.sellingPrice || product.cost * 1.5)
          };
        }
      }
      return product;
    }));
  };

  const removeProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => (p._id || p.id) !== productId));
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, product) => total + product.subtotal, 0);
  };

  const calculateGrandTotal = () => {
    return calculateTotal();
  };


  // Generate unique sale number
  const generateSaleNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `SALE-${timestamp}-${random}`;
  };

  const handleSaveSale = async () => {
    if (selectedProducts.length === 0) {
      alert('Please add at least one product');
      return;
    }

    const totalAmount = calculateGrandTotal();
    let actualPaidAmount = 0;
    let remainingDebtAmount = 0;
    let finalIsDebt = false;

    if (isPartialPayment && paidAmount) {
      actualPaidAmount = parseFloat(paidAmount);
      remainingDebtAmount = totalAmount - actualPaidAmount;
      finalIsDebt = remainingDebtAmount > 0;
      
      if (actualPaidAmount > totalAmount) {
        alert('Paid amount cannot exceed total amount');
        return;
      }
      
      if (actualPaidAmount <= 0) {
        alert('Paid amount must be greater than 0');
        return;
      }
    } else if (isDebt) {
      finalIsDebt = true;
      remainingDebtAmount = totalAmount;
    }

    if ((finalIsDebt || isPartialPayment) && !customerInfo.name.trim()) {
      alert('Customer name is required for debt/partial payments');
      return;
    }

    setLoading(true);
    try {
      const saleData = {
        saleNumber: generateSaleNumber(),
        items: selectedProducts.map(p => ({
          product: p._id || p.id,
          quantity: p.quantity,
          unitPrice: p.sellingPrice || (p.cost * 1.5),
          subtotal: p.subtotal
        })),
        totalAmount: totalAmount,
        paymentMethod: isPartialPayment ? 'Partial' : (isDebt ? 'Debt' : paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)),
        isDebt: finalIsDebt,
        paidAmount: actualPaidAmount,
        remainingDebt: remainingDebtAmount,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        salesperson: user?.name || 'Unknown'
      };

      await saleAPI.create(saleData);
      
      let successMessage = '';
      if (isPartialPayment) {
        successMessage = `Partial payment successful! FRw ${actualPaidAmount.toFixed(2)} paid, FRw ${remainingDebtAmount.toFixed(2)} remaining.`;
      } else if (isDebt) {
        successMessage = 'Debt sale saved successfully!';
      } else {
        successMessage = 'Sale saved successfully!';
      }
      
      alert(successMessage);
      
      // Reset form
      setSelectedProducts([]);
      setCustomerInfo({ name: '', email: '', phone: '' });
      setPaymentMethod('cash');
      setIsDebt(false);
      setIsPartialPayment(false);
      setPaidAmount('');
      
    } catch (error) {
      console.error('Error saving sale:', error);
      alert('Error saving sale: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="ml-8 text-2xl font-bold text-gray-900">New Sale</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Salesperson: {user?.name || 'User'}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Customer Info & Product Search */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Customer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="+250•••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Product Search */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Add Products
              </h2>
              <div className="relative">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setShowProductSearch(true)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Search products by name or SKU..."
                  />
                </div>

                {/* Product Search Results */}
                {showProductSearch && searchTerm && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map(product => (
                        <div
                          key={product.id}
                          onClick={() => addProduct(product)}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-500">SKU: {product.sku} | Stock: {product.stock}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">${product.price.toFixed(2)}</p>
                              <p className="text-xs text-gray-500">{product.category}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500 text-center">
                        No products found
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Products */}
              {selectedProducts.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Selected Products</h3>
                  <div className="space-y-3">
                    {selectedProducts.map(product => (
                      <div key={product._id || product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">Cost: FRw {product.cost.toFixed(2)} each</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <label className="text-xs text-gray-600">Sell Price:</label>
                            <input
                              type="number"
                              step="0.01"
                              value={product.sellingPrice || (product.cost * 1.5)}
                              onChange={(e) => {
                                const newSellingPrice = parseFloat(e.target.value) || 0;
                                setSelectedProducts(selectedProducts.map(p => 
                                  (p._id || p.id) === (product._id || product.id)
                                    ? { ...p, sellingPrice: newSellingPrice, subtotal: newSellingPrice * p.quantity }
                                    : p
                                ));
                              }}
                              className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(product._id || product.id, -1)}
                            className="p-1 rounded hover:bg-gray-200 transition"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{product.quantity}</span>
                          <button
                            onClick={() => updateQuantity(product._id || product.id, 1)}
                            className="p-1 rounded hover:bg-gray-200 transition"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeProduct(product._id || product.id)}
                            className="p-1 rounded hover:bg-red-100 text-red-600 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Order Summary
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">FRw {calculateTotal().toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-bold text-blue-600">FRw {calculateGrandTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="cash"
                      checked={paymentMethod === 'cash' && !isDebt && !isPartialPayment}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        setIsDebt(false);
                        setIsPartialPayment(false);
                        setPaidAmount('');
                      }}
                      className="mr-2"
                    />
                    <span className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Full Payment - Cash
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="card"
                      checked={paymentMethod === 'card' && !isDebt && !isPartialPayment}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        setIsDebt(false);
                        setIsPartialPayment(false);
                        setPaidAmount('');
                      }}
                      className="mr-2"
                    />
                    <span className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Full Payment - Card
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="partial"
                      checked={isPartialPayment}
                      onChange={(e) => {
                        setIsPartialPayment(true);
                        setIsDebt(false);
                        setPaymentMethod('partial');
                      }}
                      className="mr-2"
                    />
                    <span className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2 text-blue-500" />
                      Partial Payment (Pay some now, rest later)
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="debt"
                      checked={isDebt}
                      onChange={(e) => {
                        setIsDebt(true);
                        setIsPartialPayment(false);
                        setPaymentMethod('debt');
                        setPaidAmount('');
                      }}
                      className="mr-2"
                    />
                    <span className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2 text-orange-500" />
                      Full Debt (Pay later)
                    </span>
                  </label>
                </div>
              </div>

              {/* Partial Payment Amount */}
              {isPartialPayment && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount Paid Now
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">FRw</span>
                    <input
                      type="number"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      min="0"
                      max={calculateGrandTotal()}
                      step="0.01"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Enter amount paid now"
                    />
                  </div>
                  {paidAmount && (
                    <div className="mt-2 text-sm text-gray-600">
                      Remaining amount: <span className="font-medium text-orange-600">FRw {(calculateGrandTotal() - parseFloat(paidAmount)).toFixed(2)}</span>
                    </div>
                  )}
                  {paidAmount && parseFloat(paidAmount) > calculateGrandTotal() && (
                    <div className="mt-2 text-sm text-red-600">
                      Paid amount cannot exceed total amount
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleSaveSale}
                  disabled={loading || selectedProducts.length === 0}
                  className="w-full flex justify-center items-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Complete Sale
                    </>
                  )}
                </button>
                <Link
                  to="/dashboard"
                  className="w-full flex justify-center items-center px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewSale;
