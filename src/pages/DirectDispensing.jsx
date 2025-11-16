import { useState, useMemo, useEffect } from "react";
import { Search, ShoppingCart, Trash2, Plus, X, Package, User, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import api from "../utils/api.js";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function DirectDispensing() {
  const { user } = useAuth();
  const [medicineCatalog, setMedicineCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [medicines, setMedicines] = useState([]);

  // Fetch medicines with their base selling prices from medicines endpoint
  const fetchMedicines = async () => {
    try {
      setLoading(true);
      
      // Fetch medicines from the medicines endpoint for prices
      const medicinesRes = await api.get('/medicines');
      const medicinesData = medicinesRes.data.data || medicinesRes.data;
      
      // Fetch stock balance for quantities
      const stockRes = await api.get('/stock/balance');
      const stockData = stockRes.data.data || stockRes.data;
      
      // Create a map of medicine ID to stock quantity
      const stockMap = {};
      stockData.forEach(item => {
        const medId = item.medicine?._id || item.medicine;
        stockMap[medId] = item.balance || item.quantity || 0;
      });
      
      // Map medicines with their base selling price, ID, and stock quantity from stock balance
      const catalogWithPrices = medicinesData.map(med => ({
        _id: med._id,
        name: med.name,
        price: med.prices?.Pharmacy || med.sellingPrice || 0,
        type: med.type,
        strength: med.strength,
        quantity: stockMap[med._id] || 0,
      }));

      setMedicineCatalog(catalogWithPrices);
    } catch (error) {
      console.error("Failed to fetch medicines", error);
      toast.error("Failed to fetch medicines");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // Debounced search function
  useEffect(() => {
    const searchPatients = async () => {
      if (search.trim().length < 2) {
        setSearchResults([]);
        setHasSearched(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await api.get(`/patients/search?q=${encodeURIComponent(search)}`);
        const patients = response.data.data || response.data.patients || [];
        setSearchResults(patients);
        setHasSearched(true);
      } catch (error) {
        console.error("Failed to search patients", error);
        setSearchResults([]);
        setHasSearched(true);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchPatients, 500);
    return () => clearTimeout(debounceTimer);
  }, [search]);

  const handleRemoveFromResults = (id) => {
    setSearchResults((prev) => prev.filter((c) => c._id !== id));
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const addMedicine = () => {
    setMedicines((prev) => [
      ...prev,
      { id: Date.now(), medicineId: "", name: "", qty: 1, price: 0, stock: 0 },
    ]);
  };

  const updateMedicine = (id, field, value) => {
    setMedicines((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;

        if (field === "name") {
          const selected = medicineCatalog.find((med) => med.name === value);
          return { 
            ...m, 
            medicineId: selected?._id || "",
            name: value, 
            price: selected ? selected.price : 0,
            stock: selected ? selected.quantity : 0
          };
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
    if (medicines.length === 0) {
      toast.error("No medicines selected");
      return;
    }

    // Check if any medicine quantity exceeds available stock
    const invalidStock = medicines.find(m => m.qty > m.stock);
    if (invalidStock) {
      toast.error(`Insufficient stock for ${invalidStock.name}. Available: ${invalidStock.stock}`);
      return;
    }

    const saleRecord = {
      clientName: `${selectedClient.firstName} ${selectedClient.lastName}`,
      patient: selectedClient._id,
      issuedBy: user._id, // Pass user ID for performedBy in stock movements
      medicines: medicines.map(({ medicineId, name, qty, price }) => ({ 
        medicine: medicineId,  // Pass medicine ID for backend stock tracking
        name, 
        quantity: qty, 
        qty: qty,  // Keep both for compatibility
        price,
        totalAmount: price * qty
      })),
      totalCost,
    };

    try {
      // Create direct dispensing record (backend will handle stock movements)
      await api.post('/direct-dispensing', saleRecord);

      toast.success(`Sale completed successfully. Total: ${totalCost.toLocaleString()} TZS`);
      
      // Remove client from search results
      handleRemoveFromResults(selectedClient._id);

      // Reset state
      setSelectedClient(null);
      setMedicines([]);
      
      // Refresh medicine catalog to get updated stock levels
      fetchMedicines();
    } catch (error) {
      console.error("Failed to complete sale", error);
      toast.error("Failed to complete sale");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading medicine catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">Direct Dispensing</h1>
          </div>
          <p className="text-gray-600 ml-16">Manage walk-in client medication sales</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search clients by name (minimum 2 characters)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border-2 border-gray-200 rounded-xl pl-12 pr-12 py-3.5 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
            />
            {isSearching && (
              <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-600 w-5 h-5 animate-spin" />
            )}
          </div>
          {search.trim().length > 0 && search.trim().length < 2 && (
            <p className="text-sm text-amber-600 mt-2 ml-1">Please enter at least 2 characters to search</p>
          )}
        </div>

        {/* Search Results */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5" />
              {hasSearched ? 'Search Results' : 'Search for Clients'}
            </h2>
          </div>

          <div className="overflow-x-auto">
            {!hasSearched && search.trim().length < 2 ? (
              <div className="px-6 py-16 text-center">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium text-lg">Search for a client to begin</p>
                <p className="text-gray-400 text-sm mt-2">Type a client's name in the search box above</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Registration Date
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Client Name
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isSearching ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-12 text-center">
                        <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-3 animate-spin" />
                        <p className="text-gray-500 font-medium">Searching for clients...</p>
                      </td>
                    </tr>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((c) => (
                      <tr key={c._id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-gray-600">{formatDate(c.createdAt)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-800">{`${c.firstName} ${c.lastName}`}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setSelectedClient(c)}
                              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              Sell Medicine
                            </button>
                            <button
                              onClick={() => handleRemoveFromResults(c._id)}
                              className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-12 text-center">
                        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No clients found</p>
                        <p className="text-gray-400 text-sm mt-1">Try a different search term</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Sell Medicine Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Package className="w-6 h-6" />
                  Sell Medicine
                </h2>
                <p className="text-blue-100 mt-1">
                  Client: {selectedClient.firstName} {selectedClient.lastName}
                </p>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {medicines.map((m, index) => (
                  <div
                    key={m.id}
                    className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold text-sm">
                        {index + 1}
                      </span>
                      <span className="text-sm font-semibold text-gray-600">Medicine Item</span>
                      {m.stock > 0 && (
                        <span className="ml-auto text-xs font-medium text-gray-500">
                          Available: <span className="text-green-600 font-bold">{m.stock}</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-12 gap-3 items-end">
                      {/* Medicine Selection */}
                      <div className="col-span-6">
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          Select Medicine
                        </label>
                        <select
                          value={m.name}
                          onChange={(e) => updateMedicine(m.id, "name", e.target.value)}
                          className="w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                        >
                          <option value="">Choose medicine...</option>
                          {medicineCatalog.map((med, idx) => (
                            <option key={`${med.name}-${idx}`} value={med.name}>
                              {med.name} {med.strength && `(${med.strength})`} - {med.price.toLocaleString()} TZS (Stock: {med.quantity})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={m.stock}
                          value={m.qty}
                          onChange={(e) => updateMedicine(m.id, "qty", e.target.value)}
                          className={`w-full border-2 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 transition-all text-center font-semibold ${
                            m.qty > m.stock 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50' 
                              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                          }`}
                        />
                        {m.qty > m.stock && (
                          <p className="text-xs text-red-600 mt-1">Exceeds stock!</p>
                        )}
                      </div>

                      {/* Subtotal */}
                      <div className="col-span-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          Subtotal
                        </label>
                        <div className="bg-blue-100 border-2 border-blue-300 rounded-lg px-3 py-2.5 text-center">
                          <span className="font-bold text-blue-800">
                            {(m.price * m.qty).toLocaleString()} TZS
                          </span>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <div className="col-span-1">
                        <button
                          onClick={() => removeMedicine(m.id)}
                          className="w-full bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-5 h-5 mx-auto" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {medicines.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No medicines added yet</p>
                    <p className="text-gray-400 text-sm mt-1">Click the button below to add medicines</p>
                  </div>
                )}
              </div>

              <button
                onClick={addMedicine}
                className="mt-5 w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Medicine
              </button>
            </div>

            {/* Modal Footer */}
            <div className="border-t-2 border-gray-200 bg-gray-50 px-6 py-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
                <span className="text-3xl font-bold text-blue-600">
                  {totalCost.toLocaleString()} TZS
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedClient(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={completeSale}
                  disabled={medicines.length === 0 || medicines.some(m => m.qty > m.stock)}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Complete Sale
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}