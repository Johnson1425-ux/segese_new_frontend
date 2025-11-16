import { useState, useEffect } from "react";
import { Plus, Check, X, FileText, AlertCircle, PackageCheck } from 'lucide-react';
import { toast } from "react-hot-toast";
import api from "../utils/api.js";

export default function Requisition() {
  const [showForm, setShowForm] = useState(false);
  const [department, setDepartment] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState("");
  const [qty, setQty] = useState("");
  const [newItems, setNewItems] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [filter, setFilter] = useState("all"); // all, incoming, sent

  const fetchMedicines = async () => {
    try {
      const res = await api.get("/stock");
      setMedicines(res.data.data);
    } catch (error) {
      console.error("Failed to fetch medicines", error);
      toast.error("Failed to load medicines.");
    }
  };

  const fetchRequisitions = async () => {
    try {
      const res = await api.get("/requisitions");
      setRequisitions(res.data.data);
    } catch (error) {
      console.error("Failed to fetch requisitions", error);
      toast.error("Failed to load requisitions.");
    }
  };

  useEffect(() => {
    fetchMedicines();
    fetchRequisitions();
  }, []);

  const addItem = () => {
    if (!selectedMedicine || !qty || qty <= 0) {
      toast.error("Please select a medicine and enter quantity");
      return;
    }

    const medicine = medicines.find(m => m._id === selectedMedicine);
    if (!medicine) return;

    setNewItems((prev) => [
      ...prev,
      {
        medicineId: medicine._id,
        medicineName: medicine.name,
        medicineType: medicine.type,
        medicineStrength: medicine.strength,
        qty: parseInt(qty)
      }
    ]);
    setSelectedMedicine("");
    setQty("");
  };

  const removeItem = (index) => {
    setNewItems(prev => prev.filter((_, i) => i !== index));
  };

  const sendRequest = async () => {
    if (!department || newItems.length === 0) {
      toast.error("Please select department and add at least one item");
      return;
    }

    try {
      await api.post("/requisitions", {
        department,
        priority,
        notes,
        items: newItems
      });

      fetchRequisitions();
      setDepartment("");
      setPriority("Normal");
      setNotes("");
      setNewItems([]);
      setShowForm(false);
      toast.success("Requisition sent successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send requisition.");
    }
  };

  const updateItemStatus = async (reqId, itemId, status, issuedQty = null) => {
    try {
      const data = { status };
      if (issuedQty !== null) {
        data.issuedQty = issuedQty;
      }

      await api.put(`/requisitions/${reqId}/items/${itemId}`, data);
      toast.success(`Item ${status.toLowerCase()}.`);
      fetchRequisitions();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update item.");
    }
  };

  const acceptItem = (reqId, item) => {
    const qty = prompt(
      `Enter quantity to issue for ${item.medicine.name} (Requested: ${item.requestedQty})`,
      item.requestedQty
    );
    
    if (!qty || qty <= 0) return;
    
    updateItemStatus(reqId, item._id, "Issued", parseInt(qty));
  };

  const rejectItem = (reqId, item) => {
    if (window.confirm(`Reject ${item.medicine.name}?`)) {
      updateItemStatus(reqId, item._id, "Rejected");
    }
  };

  const completeRequisition = async (reqId) => {
    if (window.confirm("Mark this requisition as complete?")) {
      try {
        await api.put(`/requisitions/${reqId}/complete`);
        toast.success("Requisition completed");
        fetchRequisitions();
      } catch (error) {
        toast.error("Failed to complete requisition.");
      }
    }
  };

  const cancelRequisition = async (reqId) => {
    if (window.confirm("Cancel this requisition?")) {
      try {
        await api.put(`/requisitions/${reqId}/cancel`);
        toast.success("Requisition cancelled");
        fetchRequisitions();
      } catch (error) {
        toast.error("Failed to cancel requisition.");
      }
    }
  };

  // Filter requisitions based on current user (simplified - you'd check user department)
  const incomingRequisitions = requisitions.filter(
    r => ['Submitted', 'In Progress'].includes(r.status)
  );
  
  const sentRequisitions = requisitions.filter(
    r => r.status === 'Completed' || r.status === 'Cancelled'
  );

  const displayedRequisitions = 
    filter === 'incoming' ? incomingRequisitions :
    filter === 'sent' ? sentRequisitions :
    requisitions;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <FileText className="mr-3" size={32} />
              Store Requisitions
            </h1>
            <p className="text-gray-600 mt-1">Request and manage stock transfers</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Requisition
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-600 text-sm">Total Requisitions</p>
            <p className="text-3xl font-bold text-gray-800">{requisitions.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-600 text-sm">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{incomingRequisitions.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-600 text-sm">Completed</p>
            <p className="text-3xl font-bold text-green-600">
              {requisitions.filter(r => r.status === 'Completed').length}
            </p>
          </div>
        </div>

        {/* New Requisition Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Requisition</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department *
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="">Select Department</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Maternity">Maternity</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Outpatient">Outpatient</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Radiology">Radiology</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional information"
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>

            {/* Add Item */}
            <div className="border-t pt-4 mb-4">
              <h3 className="text-lg font-semibold mb-3">Add Items</h3>
              <div className="flex space-x-4">
                <select
                  value={selectedMedicine}
                  onChange={(e) => setSelectedMedicine(e.target.value)}
                  className="flex-1 border rounded-lg p-2"
                >
                  <option value="">Select Medicine</option>
                  {medicines.map((med) => (
                    <option key={med._id} value={med._id}>
                      {med.name} - {med.type} {med.strength}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Quantity"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="w-32 border rounded-lg p-2"
                  min="1"
                />
                <button
                  onClick={addItem}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Plus size={16} className="mr-1" />
                  Add
                </button>
              </div>
            </div>

            {/* Items List */}
            {newItems.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Items to Request:</h4>
                <div className="space-y-2">
                  {newItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                    >
                      <div>
                        <span className="font-medium">{item.medicineName}</span>
                        <span className="text-gray-600 text-sm ml-2">
                          ({item.medicineType} {item.medicineStrength})
                        </span>
                        <span className="text-blue-600 font-semibold ml-2">
                          × {item.qty}
                        </span>
                      </div>
                      <button
                        onClick={() => removeItem(idx)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={sendRequest}
                disabled={newItems.length === 0}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <FileText size={16} className="mr-2" />
                Send Request
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setNewItems([]);
                  setDepartment("");
                  setNotes("");
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All ({requisitions.length})
            </button>
            <button
              onClick={() => setFilter("incoming")}
              className={`px-4 py-2 rounded-lg ${
                filter === "incoming"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Pending ({incomingRequisitions.length})
            </button>
            <button
              onClick={() => setFilter("sent")}
              className={`px-4 py-2 rounded-lg ${
                filter === "sent"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Completed ({sentRequisitions.length})
            </button>
          </div>
        </div>

        {/* Requisitions List */}
        <div className="space-y-4">
          {displayedRequisitions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-500">No requisitions found</p>
            </div>
          ) : (
            displayedRequisitions.map((req) => (
              <div key={req._id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {req.requisitionNumber}
                    </h3>
                    <p className="text-sm text-gray-600">
                      From: {req.requestedFor.department} | 
                      Requested by: {req.requestedBy?.firstName} {req.requestedBy?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(req.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        req.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : req.status === "Cancelled"
                          ? "bg-red-100 text-red-800"
                          : req.status === "In Progress"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {req.status}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        req.priority === "Emergency"
                          ? "bg-red-100 text-red-800"
                          : req.priority === "Urgent"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {req.priority}
                    </span>
                  </div>
                </div>

                {req.notes && (
                  <p className="text-sm text-gray-600 mb-3 italic">Note: {req.notes}</p>
                )}

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                          Medicine
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                          Requested
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                          Issued
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">
                          Status
                        </th>
                        {req.status !== "Completed" && req.status !== "Cancelled" && (
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {req.items.map((item) => (
                        <tr key={item._id}>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">
                              {item.medicine?.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.medicine?.type} {item.medicine?.strength}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-900">
                            {item.requestedQty}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-green-600">
                            {item.issuedQty || 0}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                item.status === "Issued"
                                  ? "bg-green-100 text-green-800"
                                  : item.status === "Rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          {req.status !== "Completed" && req.status !== "Cancelled" && (
                            <td className="px-4 py-3 text-center">
                              {item.status === "Pending" && (
                                <div className="flex justify-center space-x-2">
                                  <button
                                    onClick={() => acceptItem(req._id, item)}
                                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                  >
                                    <Check size={14} />
                                  </button>
                                  <button
                                    onClick={() => rejectItem(req._id, item)}
                                    className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Action Buttons */}
                {req.status !== "Completed" && req.status !== "Cancelled" && (
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      onClick={() => completeRequisition(req._id)}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <PackageCheck size={16} className="mr-2" />
                      Complete
                    </button>
                    <button
                      onClick={() => cancelRequisition(req._id)}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <X size={16} className="mr-2" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}