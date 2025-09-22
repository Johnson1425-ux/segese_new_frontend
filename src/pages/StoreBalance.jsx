import { useState, useEffect } from "react";
import api from "../utils/api";

export default function StoreBalance() {
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStockItems = async () => {
      try {
        const response = await api.get("/stock");
        setStockItems(response.data.data);
      } catch (err) {
        setError("Failed to fetch stock items.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStockItems();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-800">Store Balance</h1>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Current Stock Levels</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="p-3">Item Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Quantity</th>
              <th className="p-3">Reorder Level</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {stockItems.map((item) => {
              const isLow = item.quantity < item.reorder;
              return (
                <tr
                  key={item._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">{item.category}</td>
                  <td className="p-3">{item.quantity}</td>
                  <td className="p-3">{item.reorder}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-sm rounded-full ${
                        isLow
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {isLow ? "Low Stock" : "Sufficient"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}