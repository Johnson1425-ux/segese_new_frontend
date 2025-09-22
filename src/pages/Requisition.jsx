import { useState, useEffect } from "react";
import { Plus } from 'lucide-react';
import api from "../utils/api.js";

export default function Requisition() {
  const [showForm, setShowForm] = useState(false);
  const [department, setDepartment] = useState("");
  const [newItems, setNewItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({ medicine: "", qty: "" });
  const [records, setRecords] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [alert, setAlert] = useState(null);

  const fetchRequisitions = async () => {
    try {
      const res = await api.get("/requisitions");
      // Assuming your API can differentiate between outgoing and incoming
      // For this example, we'll filter them on the client-side
      setRecords(res.data.data.filter(r => r.status === "Sent"));
      setIncoming(res.data.data.filter(r => r.status !== "Sent"));
    } catch (error) {
      console.error("Failed to fetch requisitions", error);
      showAlert("Failed to load requisitions.", "error");
    }
  };

  useEffect(() => {
    fetchRequisitions();
  }, []);

  // Helper to show bottom-right alerts
  const showAlert = (msg, type = "success") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3000);
  };

  // Add item to new requisition
  const addItem = () => {
    if (!currentItem.medicine || !currentItem.qty) return;
    setNewItems((prev) => [...prev, currentItem]);
    setCurrentItem({ medicine: "", qty: "" });
  };

  // Send new requisition
  const sendRequest = async () => {
    if (!department || newItems.length === 0) return;

    const newRecord = {
      from: department, // In a real app, this might be the logged-in user's department
      items: newItems,
      status: "Sent",
    };

    try {
      await api.post("/requisitions", newRecord);
      fetchRequisitions(); // Refresh data
      setDepartment("");
      setNewItems([]);
      setShowForm(false);
      showAlert("Requisition sent successfully!");
    } catch (error) {
      showAlert("Failed to send requisition.", "error");
    }
  };

  // Update an incoming item's status
  const updateItemStatus = async (reqId, med, newStatus, issuedQty = null) => {
    const requisition = incoming.find(r => r._id === reqId);
    if (!requisition) return;

    const updatedItems = requisition.items.map(item => {
      if (item.medicine === med.medicine) {
        return { ...item, status: newStatus, issuedQty: issuedQty || item.issuedQty };
      }
      return item;
    });

    try {
      await api.put(`/requisitions/${reqId}`, { items: updatedItems });
      showAlert(`Item ${newStatus.toLowerCase()}.`);
      fetchRequisitions(); // Refresh
    } catch (error) {
      showAlert("Failed to update item.", "error");
    }
  };

  const acceptItem = (reqId, med) => {
    const qty = prompt(`Enter quantity to issue for ${med.medicine}`, med.qty);
    if (!qty || qty <= 0) return;
    updateItemStatus(reqId, med, "Issued", qty);
  };

  const rejectItem = (reqId, med) => {
    updateItemStatus(reqId, med, "Rejected");
  };

  // Issue whole requisition
  const issueRequisition = async (reqId) => {
    try {
        await api.put(`/requisitions/${reqId}`, { status: "Closed" });
        showAlert("Requisition issued and closed");
        fetchRequisitions(); // Refresh
    } catch (error) {
        showAlert("Failed to close requisition.", "error");
    }
  };


  return (
    <div className="space-y-8">
      {/* New Requisition */}
      <div className="flex justify-between items-center md-4">
        <h1 className="text-3xl font-bold text-gray-800">
          Requisitions
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Requisition
        </button>

        {showForm && (
          <div className="mt-6 space-y-4">
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full border rounded-lg p-2"
            >
              <option value="">Select Department</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="Surgery">Surgery</option>
              <option value="Pediatrics">Pediatrics</option>
            </select>

            {/* Add item form */}
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="Medicine name"
                value={currentItem.medicine}
                onChange={(e) =>
                  setCurrentItem((prev) => ({ ...prev, medicine: e.target.value }))
                }
                className="flex-1 border rounded-lg p-2"
              />
              <input
                type="number"
                placeholder="Quantity"
                value={currentItem.qty}
                onChange={(e) =>
                  setCurrentItem((prev) => ({ ...prev, qty: e.target.value }))
                }
                className="w-32 border rounded-lg p-2"
              />
              <button
                onClick={addItem}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add Item
              </button>
            </div>

            {/* Items preview */}
            {newItems.length > 0 && (
              <ul className="list-disc pl-5 space-y-1">
                {newItems.map((item, idx) => (
                  <li key={idx}>
                    {item.medicine} - {item.qty}
                  </li>
                ))}
              </ul>
            )}

            <button
              onClick={sendRequest}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Send Request
            </button>
          </div>
        )}
      </div>

      {/* Incoming Requisitions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Incoming Requisitions</h2>
        {incoming.map((req) => (
          <div key={req._id} className="mb-6 border rounded-lg p-4">
            <h3 className="font-bold mb-2">
              From: {req.from} ({new Date(req.date).toLocaleDateString()})
            </h3>
            <ul className="space-y-2">
              {req.items.map((med, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center bg-gray-50 p-2 rounded-lg"
                >
                  <span>
                    {med.medicine} - {med.qty} ({med.status})
                  </span>
                  <div className="space-x-2">
                    {med.status === "Pending" && (
                      <>
                        <button
                          onClick={() => acceptItem(req._id, med)}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => rejectItem(req._id, med)}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {med.status === "Issued" && (
                      <span className="text-green-700 font-semibold">
                        Issued ({med.issuedQty})
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-3">
              <button
                onClick={() => issueRequisition(req._id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                ISSUE
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Requisition Records</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="p-3">Date</th>
              <th className="p-3">Department</th>
              <th className="p-3">Items</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec) => (
              <tr key={rec._id} className="border-b">
                <td className="p-3">{new Date(rec.date).toLocaleDateString()}</td>
                <td className="p-3">{rec.department}</td>
                <td className="p-3">
                  {rec.items.map((i, ii) => (
                    <div key={ii}>
                      {i.medicine} ({i.qty})
                    </div>
                  ))}
                </td>
                <td className="p-3">{rec.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Alert */}
      {alert && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white ${
            alert.type === "error" ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {alert.msg}
        </div>
      )}
    </div>
  );
}