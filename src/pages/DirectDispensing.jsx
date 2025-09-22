import { useState, useMemo, useEffect } from "react";
import { Search } from 'lucide-react';
import api from "../utils/api.js";

// Assuming you have an endpoint to get a catalog of medicines
// For now, we'll use the hardcoded one and also fetch item prices
const initialMedicineCatalog = [
    { name: "Paracetamol 500mg", price: 0 },
    { name: "Amoxicillin 250mg", price: 0 },
    { name: "Vitamin C 100mg", price: 0 },
    { name: "Cough Syrup", price: 0 },
];

export default function DirectDispensing() {
  const [medicineCatalog, setMedicineCatalog] = useState(initialMedicineCatalog);
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState([
    { id: 1, name: "Alice Johnson", date: "2025-09-13" },
    { id: 2, name: "Michael Smith", date: "2025-09-12" },
    { id: 3, name: "David Lee", date: "2025-09-11" },
  ]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const fetchMedicinePrices = async () => {
        try {
            const res = await api.get('/item-pricing');
            const priceMap = res.data.data.reduce((acc, item) => {
                // Assuming 'Pharmacy' price category for direct dispensing
                acc[item.name] = item.prices.Pharmacy;
                return acc;
            }, {});

            setMedicineCatalog(prev => prev.map(med => ({
                ...med,
                price: priceMap[med.name] || med.price
            })));
        } catch (error) {
            console.error("Failed to fetch medicine prices", error);
        }
    };
    fetchMedicinePrices();
  }, []);

  const filteredClients = useMemo(() => {
    return clients.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, clients]);

  const handleRemoveClient = (id) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    setAlert("Client removed successfully");
    setTimeout(() => setAlert(null), 3000);
  };

  const addMedicine = () => {
    setMedicines((prev) => [
      ...prev,
      { id: Date.now(), name: "", qty: 1, price: 0 },
    ]);
  };

  const updateMedicine = (id, field, value) => {
    setMedicines((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;

        if (field === "name") {
          const selected = medicineCatalog.find((med) => med.name === value);
          return { ...m, name: value, price: selected ? selected.price : 0 };
        }

        if (field === "qty") {
          return { ...m, qty: Number(value) };
        }

        return m;
      })
    );
  };

  const removeMedicine = (id) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  };

  const totalCost = medicines.reduce(
    (sum, m) => sum + m.qty * (m.price || 0),
    0
  );

  const completeSale = async () => {
    const saleRecord = {
        clientName: selectedClient.name,
        medicines: medicines.map(({ name, qty, price }) => ({ name, qty, price })),
        totalCost,
    };

    try {
        await api.post('/direct-dispensing', saleRecord);
        
        // Remove client from list
        setClients((prev) => prev.filter((c) => c.id !== selectedClient.id));

        setAlert(
          `Sale completed for ${selectedClient.name} - Total: ${totalCost} TZS`
        );
        setTimeout(() => setAlert(null), 4000);

        setSelectedClient(null);
        setMedicines([]);

    } catch (error) {
        setAlert("Failed to complete sale.");
        setTimeout(() => setAlert(null), 4000);
        console.error(error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 ">
        <h1 className="text-3xl font-bold text-gray-800">
          Direct Dispensing
        </h1>
      </div>

      {/* Search Clients */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          Recent Registered Clients
        </h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="p-3">Date</th>
              <th className="p-3">Client</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{c.date}</td>
                <td className="p-3">{c.name}</td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => setSelectedClient(c)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg"
                  >
                    Sell Medicine
                  </button>
                  <button
                    onClick={() => handleRemoveClient(c.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {filteredClients.length === 0 && (
              <tr>
                <td colSpan="3" className="p-3 text-center text-gray-500">
                  No clients found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sell Medicine Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[650px] relative">
            <button
              onClick={() => setSelectedClient(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">
              Sell Medicine - {selectedClient.name}
            </h2>

            <div className="space-y-4">
              {medicines.map((m) => (
                <div
                  key={m.id}
                  className="grid grid-cols-6 gap-3 items-center bg-gray-50 p-3 rounded-lg"
                >
                  {/* Dropdown medicine selection */}
                  <select
                    value={m.name}
                    onChange={(e) =>
                      updateMedicine(m.id, "name", e.target.value)
                    }
                    className="col-span-3 border rounded-lg p-2"
                  >
                    <option value="">Select medicine</option>
                    {medicineCatalog.map((med) => (
                      <option key={med.name} value={med.name}>
                        {med.name} ({med.price} TZS)
                      </option>
                    ))}
                  </select>

                  {/* Quantity */}
                  <input
                    type="number"
                    min="1"
                    value={m.qty}
                    onChange={(e) =>
                      updateMedicine(m.id, "qty", e.target.value)
                    }
                    className="border rounded-lg p-2"
                  />

                  {/* Price display (auto-set from dropdown) */}
                  <p className="text-gray-800 font-semibold">
                    {m.price * m.qty} TZS
                  </p>

                  <button
                    onClick={() => removeMedicine(m.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addMedicine}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              + Add Medicine
            </button>

            <div className="mt-6 flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>{totalCost} TZS</span>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={completeSale}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
                disabled={medicines.length === 0}
              >
                Collect Cash & Sell
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {alert && (
        <div className="fixed top-4 right-4 bg-gray-600 text-white px-4 py-2 rounded-lg shadow-lg">
          {alert}
        </div>
      )}
    </div>
  );
}