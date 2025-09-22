import { useState, useMemo, useEffect } from "react";
import api from "../utils/api.js";

export default function Dispensing() {
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [dispenseData, setDispenseData] = useState({});
  const [menuOpen, setMenuOpen] = useState(null);
  const [reasonPrompt, setReasonPrompt] = useState(null);

  const fetchPatients = async () => {
    try {
      const response = await api.get("/patients");
      setPatients(response.data.data);
    } catch (error) {
      console.error("Failed to fetch patients", error);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Filtering
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchesSearch =
        filters.search.trim() === "" ||
        p.patientName || p.patientId

      const matchesStatus =
        filters.status === "" || p.status === filters.status;

      return matchesSearch && matchesStatus;
    });
  }, [filters, patients]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const toggleMedicine = (medName, checked, prescribedQty, cost) => {
    setDispenseData((prev) => {
      const updated = { ...prev };
      if (checked) {
        updated[medName] = {
          given: prescribedQty,
          cost,
          prescribed: prescribedQty,
        };
      } else {
        delete updated[medName];
      }
      return updated;
    });
  };

  const updateGivenQty = (medName, value) => {
    setDispenseData((prev) => {
      const updated = { ...prev };
      if (updated[medName]) {
        const maxAllowed = updated[medName].prescribed;
        const givenQty = Math.min(Number(value), maxAllowed);
        updated[medName].given = givenQty;
      }
      return updated;
    });
  };

  const totalCost = Object.values(dispenseData).reduce(
    (sum, med) => sum + med.given * med.cost,
    0
  );

  const handleAction = (action, med) => {
    if (action === "remove" || action === "return") {
      setReasonPrompt({ action, med });
    } else if (action === "shop") {
      alert(
        `Sent ${med.qty} of ${med.medicine} to Hospital Shop for ${selectedPatient.patientName}`
      );
    }
    setMenuOpen(null);
  };

  const confirmReason = () => {
    if (!reasonPrompt?.reason) {
      alert("Please enter a reason!");
      return;
    }

    setSelectedPatient((prev) => ({
      ...prev,
      prescriptions: prev.prescriptions.filter(
        (m) => m.medicine !== reasonPrompt.med.medicine
      ),
    }));

    alert(
      `${
        reasonPrompt.action === "remove" ? "Removed" : "Returned"
      } ${reasonPrompt.med.medicine} (Reason: ${reasonPrompt.reason})`
    );

    setReasonPrompt(null);
  };

  const completeAction = async () => {
    const newStatus = selectedPatient.status === "Initiated" ? "Paid" : "Dispensed";
    try {
      await api.put(`/patients/${selectedPatient._id}`, { status: newStatus });
      
      if (selectedPatient.status === "Initiated") {
        alert("Sent to cashier");
      } else if (selectedPatient.status === "Paid") {
        alert("Dispensed successfully");
      }
      
      fetchPatients(); // Re-fetch to update the UI
      setSelectedPatient(null);
    } catch (error) {
      alert("Failed to update status.");
      console.error(error);
    }
  };

  return (
    <div>
      {/* Filter */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Filter Prescriptions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Search by patient name or ID"
            className="w-full border rounded-lg p-2"
          />
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          >
            <option value="">All Status</option>
            <option value="Initiated">Initiated</option>
            <option value="Paid">Paid</option>
            <option value="Dispensed">Dispensed</option>
          </select>
        </div>
      </div>

      {/* Patients table */}
      <div className="bg-white rounded-xl shadow-md p-6 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="p-3">Patient Name</th>
              <th className="p-3">Patient ID</th>
              <th className="p-3">Status</th>
              <th className="p-3">Doctor</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((p) => (
              <tr
                key={p._id}
                onClick={() => {
                  if (p.status !== "Dispensed") {
                    setSelectedPatient(p);
                    setDispenseData({});
                  }
                }}
                className={`border-b ${
                  p.status === "Dispensed"
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "hover:bg-blue-50 cursor-pointer"
                }`}
              >
                <td className="p-3">{p.patientName}</td>
                <td className="p-3">{p.patientId}</td>
                <td
                  className={`p-3 font-semibold ${
                    p.status === "Paid"
                      ? "text-green-600"
                      : p.status === "Dispensed"
                      ? "text-blue-600"
                      : "text-yellow-600"
                  }`}
                >
                  {p.status}
                </td>
                <td className="p-3">{p.doctor}</td>
                <td className="p-3">{new Date(p.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[650px] relative">
            <button
              onClick={() => setSelectedPatient(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">
              Prescriptions for {selectedPatient.patientName}
            </h2>

            <div className="space-y-4">
              {selectedPatient.prescriptions.map((med, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg relative"
                >
                  {selectedPatient.status === "Paid" ? (
                    <>
                      <div className="flex-1">
                        <p className="font-semibold">{med.medicine}</p>
                        <p className="text-sm text-gray-500">
                          Qty Paid: {med.qty}
                        </p>
                      </div>
                      <div className="text-right w-24">
                        <p className="font-semibold">{med.cost} TZS</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <input
                        type="checkbox"
                        onChange={(e) =>
                          toggleMedicine(
                            med.medicine,
                            e.target.checked,
                            med.qty,
                            med.cost
                          )
                        }
                      />
                      <div className="flex-1 ml-3">
                        <p className="font-semibold">{med.medicine}</p>
                        <p className="text-sm text-gray-500">
                          Prescribed: {med.qty}
                        </p>
                        <input
                          type="number"
                          min="0"
                          max={med.qty}
                          value={dispenseData[med.medicine]?.given || ""}
                          onChange={(e) =>
                            updateGivenQty(med.medicine, e.target.value)
                          }
                          placeholder="Qty given"
                          className="mt-1 w-24 border rounded-lg p-1"
                          disabled={!dispenseData[med.medicine]}
                        />
                      </div>
                      <div className="text-right w-24">
                        <p className="font-semibold">{med.cost} TZS</p>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() =>
                            setMenuOpen(
                              menuOpen === med.medicine ? null : med.medicine
                            )
                          }
                          className="p-2 rounded hover:bg-gray-200"
                        >
                          ⋮
                        </button>
                        {menuOpen === med.medicine && (
                          <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border z-50">
                            <button
                              onClick={() => handleAction("remove", med)}
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                              Remove
                            </button>
                            <button
                              onClick={() => handleAction("return", med)}
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                              Return to Doctor
                            </button>
                            <button
                              onClick={() => handleAction("shop", med)}
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                              Send to Hospital Shop
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Totals */}
            {selectedPatient.status === "Initiated" && (
              <div className="mt-6 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>{totalCost} TZS</span>
              </div>
            )}
            {selectedPatient.status === "Paid" && (
              <div className="mt-6 flex justify-between font-bold text-lg">
                <span>Total Paid:</span>
                <span>
                  {selectedPatient.prescriptions.reduce(
                    (sum, med) => sum + med.qty * med.cost,
                    0
                  )}{" "}
                  TZS
                </span>
              </div>
            )}

            {/* Action button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={completeAction}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-800"
              >
                {selectedPatient.status === "Initiated"
                  ? "Send to Cashier"
                  : "Dispense"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reason Prompt */}
      {reasonPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[400px]">
            <h2 className="text-lg font-bold mb-4">Provide Reason</h2>
            <textarea
              className="w-full border rounded-lg p-2"
              rows="3"
              placeholder="Enter reason..."
              value={reasonPrompt.reason || ""}
              onChange={(e) =>
                setReasonPrompt((prev) => ({ ...prev, reason: e.target.value }))
              }
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setReasonPrompt(null)}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>
              <button
                onClick={confirmReason}
                className="px-4 py-2 rounded-lg bg-primary text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}