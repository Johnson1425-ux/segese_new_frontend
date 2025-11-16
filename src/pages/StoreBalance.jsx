import { useState, useEffect } from "react";
import { AlertCircle, Package, TrendingDown } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from "../utils/api";
import { toast } from "react-hot-toast";

export default function StoreBalance() {
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, low, sufficient

  useEffect(() => {
    fetchStockBalance();
  }, []);

  const fetchStockBalance = async () => {
    try {
      const response = await api.get("/stock/balance");
      setStockItems(response.data.data);
    } catch (err) {
      toast.error("Failed to fetch stock balance.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const filteredItems = stockItems.filter(item => {
    if (filter === 'low') return item.isLowStock;
    if (filter === 'sufficient') return !item.isLowStock;
    return true;
  });

  const lowStockCount = stockItems.filter(item => item.isLowStock).length;
  const totalValue = stockItems.reduce((sum, item) => 
    sum + (item.totalQuantity * (item.medicine?.sellingPrice || 0)), 0
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <Package className="mr-3" size={32} />
              Store Balance
            </h1>
            <p className="text-gray-600 mt-1">Current inventory levels and stock status</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Items</p>
                <p className="text-3xl font-bold text-gray-800">{stockItems.length}</p>
              </div>
              <Package className="text-blue-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Low Stock Items</p>
                <p className="text-3xl font-bold text-red-600">{lowStockCount}</p>
              </div>
              <AlertCircle className="text-red-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Stock Value</p>
                <p className="text-3xl font-bold text-green-600">
                  {totalValue.toLocaleString()} TZS
                </p>
              </div>
              <TrendingDown className="text-green-500" size={40} />
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Items ({stockItems.length})
            </button>
            <button
              onClick={() => setFilter('low')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'low' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Low Stock ({lowStockCount})
            </button>
            <button
              onClick={() => setFilter('sufficient')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'sufficient' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sufficient ({stockItems.length - lowStockCount})
            </button>
          </div>
        </div>

        {/* Stock Table */}
        <div className="bg-white rounded-xl shadow-md p-6 overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4">Current Stock Levels</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Strength</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Batches</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Reorder Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nearest Expiry</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-gray-500">
                    No items found
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.medicine?.name}
                      </div>
                      {item.medicine?.genericName && (
                        <div className="text-xs text-gray-500">
                          {item.medicine.genericName}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.medicine?.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.medicine?.strength || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className={`text-sm font-semibold ${
                        item.isLowStock ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {item.totalQuantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                      {item.batchCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                      {item.reorderLevel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.nearestExpiry ? new Date(item.nearestExpiry).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        item.isLowStock
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.isLowStock ? 'Low Stock' : 'Sufficient'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}