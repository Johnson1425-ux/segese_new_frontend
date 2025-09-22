import { useState, useMemo, useEffect } from "react";
import api from "../api";

export default function StockTaking() {
  const [stock, setStock] = useState([]);
  const [search, setSearch] = useState("");
  const [alert, setAlert] = useState(null);

  const fetchStock = async () => {
    try {
      const res = await api.get('/stock');
      // Initialize 'actual' count for the audit
      const stockWithActual = res.data.data.map(item => ({
        ...item,
        actual: item.quantity // Default actual to system balance initially
      }));
      setStock(stockWithActual);
    } catch (error) {
      console.error("Failed to fetch stock", error);
      setAlert("Failed to load stock data.");
      setTimeout(() => setAlert(null), 4000);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);


  // Filtered stock list
  const filteredStock = useMemo(() => {
    return stock.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, stock]);

  // Helper to format timestamp
  const getTimestamp = () => {
    return new Date().toLocaleString(); // e.g. "9/13/2025, 2:45:10 PM"
  };

  // Handle actual count input change
  const handleChange = (id, value) => {
    setStock((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, actual: Number(value) } : item
      )
    );
  };

  // Save individual item
  const saveItem = async (id) => {
    const item = stock.find((s) => s._id === id);
    if (!item) return;

    try {
      await api.put(`/stock/${id}`, { quantity: item.actual });
      setAlert(
        `${item.name} saved with actual count ${item.actual} at ${getTimestamp()}`
      );
      setTimeout(() => setAlert(null), 4000);
      fetchStock(); // Refresh data from server
    } catch (error) {
      setAlert(`Failed to save ${item.name}.`);
      setTimeout(() => setAlert(null), 4000);
    }
  };

  // Save all items
  const saveAll = async () => {
    try {
      // This would typically be a single API call to a bulk update endpoint
      // For now, we'll update one by one.
      for (const item of stock) {
        await api.put(`/stock/${item._id}`, { quantity: item.actual });
      }
      setAlert(`All stock audit results saved at ${getTimestamp()}`);
      setTimeout(() => setAlert(null), 4000);
      fetchStock(); // Refresh
    } catch (error) {
      setAlert("An error occurred while saving all items.");
      setTimeout(() => setAlert(null), 4000);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-6">Stock Taking</h1>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Stock Audit Table</h2>

        {/* Search bar */}
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 w-full border rounded-lg p-2"
        />

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="p-3">Item Name</th>
              <th className="p-3">System Balance</th>
              <th className="p-3">Actual Count</th>
              <th className="p-3">Difference</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStock.map((item) => {
              const difference = item.actual - item.quantity;
              return (
                <tr
                  key={item._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">{item.quantity}</td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={item.actual}
                      onChange={(e) => handleChange(item._id, e.target.value)}
                      className="w-24 border rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </td>
                  <td
                    className={`p-3 font-semibold ${
                      difference < 0
                        ? "text-red-600"
                        : difference > 0
                        ? "text-green-600"
                        : "text-gray-600"
                    }`}
                  >
                    {difference}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => saveItem(item._id)}
                      className="px-4 py-1 bg-primary text-white rounded-lg hover:bg-blue-800"
                    >
                      Save
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Save All button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={saveAll}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition"
          >
            Save All Audit Results
          </button>
        </div>
      </div>

      {/* Toast alert */}
      {alert && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
          {alert}
        </div>
      )}
    </div>
  );
}