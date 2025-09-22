import { useState, useEffect } from "react";
import api from "../utils/api.js";

export default function ItemReceiving() {
  const [invoices, setInvoices] = useState([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ number: "", date: "" });

  const [form, setForm] = useState({
    invoice: "",
    date: "",
    medicine: "",
    type: "",
    strength: "",
    expiry: "",
    qty: "",
    price: "",
    receiveTo: "MAIN STORE",
  });

  const [preview, setPreview] = useState(null);
  const [alert, setAlert] = useState(null);

  const fetchInvoices = async () => {
    try {
      const res = await api.get("/billing/invoices");
      setInvoices(res.data.data);
    } catch (error) {
      console.error("Failed to fetch invoices", error);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "invoice") {
      const inv = invoices.find((i) => i.number === value);
      if (inv) setForm((prev) => ({ ...prev, date: new Date(inv.date).toISOString().split('T')[0] }));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setPreview(form);
  };

  const confirmSave = async () => {
    try {
        await api.post("/item-receiving", form);
        setAlert(`Medicine ${preview.medicine} received successfully!`);
        setTimeout(() => setAlert(null), 3000);

        setPreview(null);
        setForm({
            invoice: "",
            date: "",
            medicine: "",
            type: "",
            strength: "",
            expiry: "",
            qty: "",
            price: "",
            receiveTo: "MAIN STORE",
        });
    } catch (error) {
        setAlert("Failed to receive item.");
        setTimeout(() => setAlert(null), 3000);
    }
  };

  const addInvoice = async () => {
    if (!newInvoice.number || !newInvoice.date) return;
    try {
      await api.post("/item-receiving/invoices", newInvoice);
      fetchInvoices(); // Refresh invoices
      setNewInvoice({ number: "", date: "" });
      setShowInvoiceModal(false);
      setAlert("Invoice added successfully");
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert("Failed to add invoice.");
      setTimeout(() => setAlert(null), 3000);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Item Receiving</h1>
      </div>
      {/* Receiving Form */}
      {!preview && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Record New Supply</h2>
          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            onSubmit={handleSave}
          >
            {/* Invoice Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Invoice Number
              </label>
              <div className="flex space-x-2">
                <select
                  name="invoice"
                  value={form.invoice}
                  onChange={handleChange}
                  className="flex-1 border rounded-lg p-2"
                  required
                >
                  <option value="">Select invoice</option>
                  {setInvoices.map}
                </select>
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(true)}
                  className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 rounded-lg"
                >
                  Add Invoice
                </button>
              </div>
            </div>

            {/* Receiving Date (auto) */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Receiving Date
              </label>
              <input
                type="text"
                name="date"
                value={form.date}
                readOnly
                className="w-full border rounded-lg p-2 bg-gray-100"
              />
            </div>

            {/* Medicine name */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Medicine Name
              </label>
              <input
                type="text"
                name="medicine"
                value={form.medicine}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Type
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
                required
              >
                <option value="">Select type</option>
                <option value="Syrup">Syrup</option>
                <option value="Injection">Injection</option>
                <option value="Capsule">Capsule</option>
                <option value="Tablet">Tablet</option>
              </select>
            </div>

            {/* Strength */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Strength
              </label>
              <input
                type="text"
                name="strength"
                value={form.strength}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
              />
            </div>

            {/* Expiry */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                name="expiry"
                value={form.expiry}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
                required
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Quantity
              </label>
              <input
                type="number"
                name="qty"
                value={form.qty}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
                required
              />
            </div>

            {/* Buying Price */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Buying Price (per item)
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
                required
              />
            </div>

            {/* Receive to */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Receive To
              </label>
              <input
                type="text"
                value="MAIN STORE"
                disabled
                className="w-full border rounded-lg p-2 bg-gray-100"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-800"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Preview Section */}
      {preview && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Preview Supply</h2>
          <ul className="space-y-2 text-gray-700">
            <li>
              <strong>Invoice:</strong> {preview.invoice}
            </li>
            <li>
              <strong>Date:</strong> {preview.date}
            </li>
            <li>
              <strong>Medicine:</strong> {preview.medicine} ({preview.type},{" "}
              {preview.strength})
            </li>
            <li>
              <strong>Expiry:</strong> {preview.expiry}
            </li>
            <li>
              <strong>Quantity:</strong> {preview.qty}
            </li>
            <li>
              <strong>Price:</strong> {preview.price} TZS
            </li>
            <li>
              <strong>Receive To:</strong> {preview.receiveTo}
            </li>
          </ul>

          <div className="mt-6 flex space-x-3">
            <button
              onClick={() => confirmSave()}
              className="bg-green-600 text-white px-6 py-2 rounded-lg"
            >
              Confirm
            </button>
            <button
              onClick={() => setPreview(null)}
              className="bg-yellow-500 text-white px-6 py-2 rounded-lg"
            >
              Edit
            </button>
          </div>
        </div>
      )}

      {/* Add Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[400px] relative">
            <h2 className="text-xl font-bold mb-4">Add Invoice</h2>
            <input
              type="text"
              placeholder="Invoice Number"
              value={newInvoice.number}
              onChange={(e) =>
                setNewInvoice((prev) => ({ ...prev, number: e.target.value }))
              }
              className="w-full border rounded-lg p-2 mb-3"
            />
            <input
              type="date"
              value={newInvoice.date}
              onChange={(e) =>
                setNewInvoice((prev) => ({ ...prev, date: e.target.value }))
              }
              className="w-full border rounded-lg p-2 mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={addInvoice}
                className="px-4 py-2 btn-primary text-white rounded-lg"
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