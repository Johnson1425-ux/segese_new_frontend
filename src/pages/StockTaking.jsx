import { useState, useMemo, useEffect } from "react";
import { Search, Save, CheckCircle2 } from 'lucide-react';
import api from "../utils/api";
import { toast } from "react-hot-toast";

export default function StockTaking() {
  const [stock, setStock] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchStock = async () => {
    try {
      const res = await api.get('/stock/taking');
      const stockWithActual = res.data.data.map(item => ({
        ...item,
        actual: item.quantity,
        _id: item._id.toString(), // Ensure string ID
      }));
      setStock(stockWithActual);
    } catch (error) {
      console.error("Failed to fetch stock", error);
      toast.error("Failed to load stock data.");
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const filteredStock = useMemo(() => {
    if (!search) return stock;
    return stock.filter((item) =>
      item.medicine?.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, stock]);

  const handleChange = (id, value) => {
    setStock((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, actual: Number(value) || 0 } : item
      )
    );
  };

  const saveItem = async (id) => {
    const item = stock.find((s) => s._id === id);
    if (!item) return;

    try {
      setLoading(true);
      await api.put(`/stock/audit/${item._id}`, { 
        actualCount: item.actual 
      });
      
      const difference = item.actual - item.quantity;
      toast.success(
        `${item.medicine?.name} audit saved. Difference: ${difference > 0 ? '+' : ''}${difference}`
      );
      
      await fetchStock();
    } catch (error) {
      toast.error(`Failed to save ${item.medicine?.name}.`);
    } finally {
      setLoading(false);
    }
  };

  const saveAll = async () => {
    try {
      setLoading(true);
      const updates = stock.map(item => 
        api.put(`/stock/audit/${item._id}`, { actualCount: item.actual })
      );
      
      await Promise.all(updates);
      toast.success('All stock audit results saved successfully!');
      await fetchStock();
    } catch (error) {
      toast.error("An error occurred while saving all items.");
    } finally {
      setLoading(false);
    }
  };

  const totalDifference = stock.reduce((sum, item) => 
    sum + (item.actual - item.quantity), 0
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Stock Taking / Audit</h1>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-600 text-sm">Items to Audit</p>
            <p className="text-3xl font-bold text-gray-800">{stock.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-600 text-sm">Total Difference</p>
            <p className={`text-3xl font-bold ${
              totalDifference < 0 ? 'text-red-600' : 
              totalDifference > 0 ? 'text-green-600' : 
              'text-gray-800'
            }`}>
              {totalDifference > 0 ? '+' : ''}{totalDifference}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-center">
            <button
              onClick={saveAll}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <CheckCircle2 size={20} />
              <span>Save All Audit Results</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Stock Audit Table</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">System Balance</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actual Count</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Difference</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStock.map((item) => {
                  const difference = item.actual - item.quantity;
                  return (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.medicine?.name}
                        </div>
                        {item.medicine?.strength && (
                          <div className="text-xs text-gray-500">
                            {item.medicine.strength}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.medicine?.type}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <input
                          type="number"
                          value={item.actual}
                          onChange={(e) => handleChange(item._id, e.target.value)}
                          className="w-24 border rounded-lg p-2 text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-sm font-semibold ${
                          difference < 0
                            ? "text-red-600"
                            : difference > 0
                            ? "text-green-600"
                            : "text-gray-600"
                        }`}>
                          {difference > 0 ? '+' : ''}{difference}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => saveItem(item._id)}
                          disabled={loading}
                          className="inline-flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          <Save size={16} />
                          <span>Save</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}