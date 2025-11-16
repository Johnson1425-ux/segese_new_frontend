import { useState, useMemo, useEffect } from "react";
import api from "../utils/api.js";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Dispensing() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [dispenseData, setDispenseData] = useState({});
  const [menuOpen, setMenuOpen] = useState(null);
  const [reasonPrompt, setReasonPrompt] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/prescriptions');
      setPrescriptions(response.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch prescriptions");
      console.error("Failed to fetch prescriptions", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await api.get('/medicines');
      setMedicines(response.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch medicines");
      console.error("Failed to fetch medicines", error);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
    fetchMedicines();
  }, []);

  // Get medicine details including price
  const getMedicineDetails = (medicineName) => {
    return medicines.find(
      (med) => med.name?.toLowerCase() === medicineName?.toLowerCase()
    );
  };

  // Calculate total price for dispensing
  const calculateTotal = () => {
    return Object.entries(dispenseData).reduce((total, [prescriptionId, data]) => {
      const medicine = getMedicineDetails(data.medicine);
      const price = medicine?.price || 0;
      return total + (price * data.quantity);
    }, 0);
  };

  // Filtering
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((p) => {
      const patientName = p.patient
        ? `${p.patient.firstName || ""} ${p.patient.lastName || ""}`
        : "";
      
      const matchesSearch =
        filters.search.trim() === "" ||
        patientName.toLowerCase().includes(filters.search.toLowerCase()) ||
        (p._id && p._id.toLowerCase().includes(filters.search.toLowerCase()));

      const matchesStatus =
        filters.status === "" || p.status === filters.status;

      return matchesSearch && matchesStatus;
    });
  }, [filters, prescriptions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const toggleDispense = (prescriptionId, checked, medName, dosage) => {
    setDispenseData((prev) => {
      const updated = { ...prev };
      if (checked) {
        const medicine = getMedicineDetails(medName);
        updated[prescriptionId] = {
          medicine: medName,
          medicineId: medicine?._id,
          dosage,
          quantity: 1,
          price: medicine?.price || 0,
          dispensed: true,
        };
      } else {
        delete updated[prescriptionId];
      }
      return updated;
    });
  };

  const updateQuantity = (prescriptionId, value) => {
    setDispenseData((prev) => {
      const updated = { ...prev };
      if (updated[prescriptionId]) {
        updated[prescriptionId].quantity = Math.max(1, Number(value) || 1);
      }
      return updated;
    });
  };

  const handleAction = (action, prescription) => {
    if (action === "remove" || action === "return") {
      setReasonPrompt({ action, prescription, reason: "" });
    } else if (action === "unavailable") {
      setReasonPrompt({ action, prescription, reason: "" });
    }
    setMenuOpen(null);
  };

  const confirmReason = async () => {
    if (!reasonPrompt?.reason.trim()) {
      toast.error("Please enter a reason!");
      return;
    }

    try {
      if (
        reasonPrompt.action === "remove" ||
        reasonPrompt.action === "unavailable"
      ) {
        await api.patch(`/prescriptions/${reasonPrompt.prescription._id}`, {
          isActive: false,
        });
      }

      toast.success(
        `${reasonPrompt.action === "remove" ? "Removed" : reasonPrompt.action === "unavailable" ? "Marked unavailable" : "Returned"} prescription for ${reasonPrompt.prescription.medication}`
      );

      fetchPrescriptions();
      setSelectedPrescription(null);
      setReasonPrompt(null);
    } catch (error) {
      toast.error("Failed to process action");
      console.error(error);
    }
  };

  const completeDispensing = async () => {
    if (Object.keys(dispenseData).length === 0) {
      toast.error("No medicines selected for dispensing");
      return;
    }

    try {
      // Create dispensing records for each selected prescription with medicine IDs
      const dispensingRecords = Object.entries(dispenseData).map(
        ([prescriptionId, data]) => ({
          patient: selectedPrescription.patient._id,
          medicine: data.medicineId, // Pass medicine ID for stock tracking
          medicineName: data.medicine,
          quantity: data.quantity,
          prescription: prescriptionId,
          issuedBy: user._id,
          date: new Date(),
          price: data.price,
          totalAmount: data.price * data.quantity,
        })
      );

      // Save all dispensing records (backend should handle stock movements)
      await Promise.all(
        dispensingRecords.map((record) =>
          api.post("/dispensing", record)
        )
      );

      // Mark prescription as inactive after dispensing
      await api.patch(`/prescriptions/${selectedPrescription._id}`, {
        isActive: false,
      });

      toast.success(`Medicines dispensed successfully. Total: $${calculateTotal().toFixed(2)}`);
      fetchPrescriptions();
      fetchMedicines(); // Refresh medicines to get updated stock
      setSelectedPrescription(null);
      setDispenseData({});
    } catch (error) {
      toast.error("Failed to complete dispensing");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-center">
        <p className="text-gray-500">Loading prescriptions...</p>
      </div>
    );
  }

  if (!prescriptions.length) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-center">
        <p className="text-gray-500">No prescriptions available for dispensing</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filter */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Filter Prescriptions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Search by patient name or prescription ID"
            className="w-full border rounded-lg p-2"
          />
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="dispensed">Dispensed</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
      </div>

      {/* Prescriptions table */}
      <div className="bg-white rounded-xl shadow-md p-6 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="p-3">Patient Name</th>
              <th className="p-3">Medication</th>
              <th className="p-3">Dosage</th>
              <th className="p-3">Frequency</th>
              <th className="p-3">Duration</th>
              <th className="p-3">Prescribed By</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrescriptions.map((p) => (
              <tr
                key={p._id}
                onClick={() => {
                  if (p.isActive) {
                    setSelectedPrescription(p);
                    setDispenseData({});
                  }
                }}
                className={`border-b ${
                  !p.isActive
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "hover:bg-blue-50 cursor-pointer"
                }`}
              >
                <td className="p-3">
                  {p.patient
                    ? `${p.patient.firstName || ""} ${p.patient.lastName || ""}`
                    : "N/A"}
                </td>
                <td className="p-3 font-medium">{p.medication}</td>
                <td className="p-3">{p.dosage}</td>
                <td className="p-3">{p.frequency}</td>
                <td className="p-3">{p.duration || "N/A"}</td>
                <td className="p-3">
                  {p.prescribedBy
                    ? `${p.prescribedBy.firstName || ""} ${p.prescribedBy.lastName || ""}`
                    : "N/A"}
                </td>
                <td className="p-3">
                  {p.createdAt
                    ? new Date(p.createdAt).toLocaleDateString()
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[700px] max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setSelectedPrescription(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>

            <h2 className="text-xl font-bold mb-6">
              Dispense Prescription for{" "}
              {selectedPrescription.patient
                ? `${selectedPrescription.patient.firstName} ${selectedPrescription.patient.lastName}`
                : "Patient"}
            </h2>

            {/* Prescription Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Medication</p>
                  <p className="font-semibold">{selectedPrescription.medication}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Dosage</p>
                  <p className="font-semibold">{selectedPrescription.dosage}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Frequency</p>
                  <p className="font-semibold">{selectedPrescription.frequency}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-semibold">{selectedPrescription.duration || "N/A"}</p>
                </div>
              </div>
              {selectedPrescription.notes && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Notes</p>
                  <p className="text-gray-700">{selectedPrescription.notes}</p>
                </div>
              )}
            </div>

            {/* Dispense Section */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold">Dispense this medication?</p>
                  <p className="text-sm text-gray-600">
                    {(() => {
                      const medicine = getMedicineDetails(selectedPrescription.medication);
                      return medicine 
                        ? `Price: $${medicine.price?.toFixed(2) || '0.00'} | Stock: ${medicine.quantity || 0}`
                        : "Price information not available";
                    })()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      toggleDispense(
                        selectedPrescription._id,
                        e.target.checked,
                        selectedPrescription.medication,
                        selectedPrescription.dosage
                      )
                    }
                    className="w-5 h-5"
                  />
                  <input
                    type="number"
                    min="1"
                    value={dispenseData[selectedPrescription._id]?.quantity || ""}
                    onChange={(e) =>
                      updateQuantity(selectedPrescription._id, e.target.value)
                    }
                    placeholder="Quantity"
                    className="w-24 border rounded-lg p-2"
                    disabled={!dispenseData[selectedPrescription._id]}
                  />
                </div>
              </div>
              {dispenseData[selectedPrescription._id] && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-sm font-semibold text-blue-900">
                    Subtotal: ${(
                      dispenseData[selectedPrescription._id].price * 
                      dispenseData[selectedPrescription._id].quantity
                    ).toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {/* Total Amount */}
            {Object.keys(dispenseData).length > 0 && (
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-green-900">Total Amount:</p>
                  <p className="text-2xl font-bold text-green-700">
                    ${calculateTotal().toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {/* Action Menu */}
            <div className="flex justify-between items-center mb-6">
              <div className="relative">
                <button
                  onClick={() =>
                    setMenuOpen(menuOpen ? null : "actions")
                  }
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  More Actions ⋮
                </button>
                {menuOpen === "actions" && (
                  <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-lg border z-50">
                    <button
                      onClick={() =>
                        handleAction("return", selectedPrescription)
                      }
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Return to Doctor
                    </button>
                    <button
                      onClick={() =>
                        handleAction("unavailable", selectedPrescription)
                      }
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Mark Unavailable
                    </button>
                    <button
                      onClick={() =>
                        handleAction("remove", selectedPrescription)
                      }
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedPrescription(null)}
                className="px-6 py-2 rounded-lg border hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={completeDispensing}
                disabled={Object.keys(dispenseData).length === 0}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Dispense Medication
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reason Prompt */}
      {reasonPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[400px]">
            <h2 className="text-lg font-bold mb-4">
              {reasonPrompt.action === "remove" && "Remove Prescription"}
              {reasonPrompt.action === "return" && "Return to Doctor"}
              {reasonPrompt.action === "unavailable" && "Mark Unavailable"}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Medication: {reasonPrompt.prescription.medication}
            </p>
            <textarea
              className="w-full border rounded-lg p-2"
              rows="3"
              placeholder="Enter reason..."
              value={reasonPrompt.reason || ""}
              onChange={(e) =>
                setReasonPrompt((prev) => ({
                  ...prev,
                  reason: e.target.value,
                }))
              }
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setReasonPrompt(null)}
                className="px-4 py-2 rounded-lg border hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmReason}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
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