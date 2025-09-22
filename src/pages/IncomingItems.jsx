import { useState, useEffect } from "react";
import api from "../utils/api.js";

export default function IncomingItems() {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [initialTotal, setInitialTotal] = useState(0);
  const [alert, setAlert] = useState(null);

  const fetchIncomingItems = async () => {
    try {
      const response = await api.get("/incoming-items");
      setIncomingRequests(response.data.data);
      setInitialTotal(response.data.data.length);
    } catch (error) {
      console.error("Failed to fetch incoming items", error);
      setAlert("Failed to load incoming items.");
      setTimeout(() => setAlert(null), 3000);
    }
  };

  useEffect(() => {
    fetchIncomingItems();
  }, []);

  const handleReceive = async (id) => {
    const item = incomingRequests.find((i) => i._id === id);
    if (!item) return;

    try {
      await api.put(`/incoming-items/${id}`, { received: true });
      // Show alert
      setAlert(`Received ${item.quantity} of ${item.name}`);
      setTimeout(() => setAlert(null), 3000);
      fetchIncomingItems(); // Re-fetch to update the list
    } catch (error) {
      setAlert("Failed to receive item.");
      setTimeout(() => setAlert(null), 3000);
      console.error(error);
    }
  };

  return (
    <div>
      <h1 className="flex justify-between items-center text-3xl font-bold text-gray-800 mb-2">
        Incoming Items
      </h1>
      <br />

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          Pending Incoming Requests
        </h2>

        <div className="mb-4 text-gray-700 font-medium">
          Total Requested: {initialTotal} | Items Received:{" "}
          {initialTotal - incomingRequests.length}
        </div>

        {incomingRequests.length === 0 ? (
          <p className="text-gray-500">No pending requests 🎉</p>
        ) : (
          <div className="space-y-4">
            {incomingRequests.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between bg-gray-50 rounded-lg p-4"
              >
                <div>
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    ({item.quantity} requested)
                  </p>
                  <p className="text-sm text-gray-500">From: {item.from}</p>
                </div>
                <button
                  onClick={() => handleReceive(item._id)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  Receive
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast Alert */}
      {alert && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
          {alert}
        </div>
      )}
    </div>
  );
}