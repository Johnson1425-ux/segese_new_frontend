import React, { useState, useEffect } from "react";
import { Plus } from 'lucide-react';
import api from "../utils/api.js";

const CATEGORIES = [
  "BRITAM",
  "NSSF",
  "NHIF",
  "ASSEMBLE",
  "Pharmacy",
  "HospitalShop",
];

const DISPLAY = {
  BRITAM: "BRITAM",
  NSSF: "NSSF",
  NHIF: "NHIF",
  ASSEMBLE: "ASSEMBLE",
  Pharmacy: "Pharmacy",
  HospitalShop: "Hospital Shop",
};

export default function ItemPricing() {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [alert, setAlert] = useState(null);

  const fetchItems = async () => {
    try {
      const response = await api.get("/item-pricing");
      setItems(response.data.data);
    } catch (error) {
      console.error("Failed to fetch items", error);
      setTempAlert("Failed to load item prices.");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const setTempAlert = (msg, ms = 3000) => {
    setAlert(msg);
    setTimeout(() => setAlert(null), ms);
  };

  const openAddModal = () => {
    setForm({
      name: "",
      prices: CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: "" }), {}),
    });
    setEditId(null);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setForm({ name: item.name, ...item.prices });
    setEditId(item._id);
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!form.name || form.name.trim() === "") {
      setTempAlert("Medicine name is required");
      return;
    }

    const priceData = CATEGORIES.reduce((acc, cat) => {
      const val = parseFloat(form[cat]);
      acc[cat] = Number.isFinite(val) ? val : 0;
      return acc;
    }, {});

    const newItem = {
      name: form.name.trim(),
      prices: priceData,
    };

    try {
      if (editId) {
        await api.put(`/item-pricing/${editId}`, newItem);
        setTempAlert("Item updated successfully");
      } else {
        await api.post("/item-pricing", newItem);
        setTempAlert("Item price added successfully");
      }
      fetchItems();
    } catch (error) {
      setTempAlert("Failed to save item.");
      console.error(error);
    }

    setShowModal(false);
    setEditId(null);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete ${name}?`)) {
      try {
        await api.delete(`/item-pricing/${id}`);
        setTempAlert(`${name} deleted`);
        fetchItems();
      } catch (error) {
        setTempAlert("Failed to delete item.");
        console.error(error);
      }
    }
  };

  return (
    <div>
      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Item Pricing</h1>
        <button
          onClick={openAddModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item Price
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md p-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 ">Medicine</th>
              {CATEGORIES.map((cat) => (
                <th key={cat} className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                  {DISPLAY[cat]}
                </th>
              ))}
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={1 + CATEGORIES.length + 1}
                  className="p-4 text-center text-gray-500"
                >
                  No items yet
                </td>
              </tr>
            )}

            {items.map((item) => (
              <tr key={item._id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                {CATEGORIES.map((cat) => (
                  <td key={cat} className="px-6 py-4 whitespace-nowrap text-right">
                    {Number.isFinite(item.prices?.[cat])
                      ? item.prices[cat]
                      : 0}
                  </td>
                ))}
                <td className="p-3 text-center">
                  <button
                    onClick={() => openEditModal(item)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg mr-2 hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id, item.name)}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[640px] max-w-full">
            <h2 className="text-xl font-bold mb-4">
              {editId ? "Edit Item Price" : "Add Item Price"}
            </h2>

            <div className="space-y-3">
              <input
                name="name"
                value={form.name || ""}
                onChange={handleChange}
                placeholder="Medicine name"
                className="w-full border rounded-lg p-2"
              />

              {CATEGORIES.map((cat) => (
                <div key={cat} className="flex items-center gap-2">
                  <label className="w-40 text-sm text-gray-700">
                    {DISPLAY[cat]}
                  </label>
                  <input
                    type="number"
                    name={cat}
                    value={form[cat] || ""}
                    onChange={handleChange}
                    placeholder="0"
                    className="flex-1 border rounded-lg p-2"
                    min="0"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert */}
      {alert && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
          {alert}
        </div>
      )}
    </div>
  );
}