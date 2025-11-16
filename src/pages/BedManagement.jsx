// src/pages/BedManagement.jsx
import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  BedDouble, Plus, Edit, Trash2, Search, X, 
  CheckCircle, AlertCircle, Clock, Wrench, Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const BedManagement = () => {
  const [beds, setBeds] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBed, setEditingBed] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWard, setFilterWard] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [statistics, setStatistics] = useState(null);

  const [formData, setFormData] = useState({
    bedNumber: '',
    ward: '',
    type: 'standard',
    features: [],
    status: 'available',
    notes: ''
  });

  const bedTypes = [
    { value: 'standard', label: 'Standard' },
    { value: 'icu', label: 'ICU' },
    { value: 'isolation', label: 'Isolation' },
    { value: 'private', label: 'Private' },
    { value: 'semi-private', label: 'Semi-Private' },
    { value: 'pediatric', label: 'Pediatric' },
    { value: 'maternity', label: 'Maternity' }
  ];

  const bedStatuses = [
    { value: 'available', label: 'Available', icon: CheckCircle, color: 'text-green-600' },
    { value: 'occupied', label: 'Occupied', icon: AlertCircle, color: 'text-red-600' },
    { value: 'maintenance', label: 'Maintenance', icon: Wrench, color: 'text-yellow-600' },
    { value: 'reserved', label: 'Reserved', icon: Clock, color: 'text-blue-600' },
    { value: 'cleaning', label: 'Cleaning', icon: Sparkles, color: 'text-purple-600' }
  ];

  const featureOptions = [
    'adjustable', 'electric', 'manual', 'oxygen_outlet', 
    'monitor', 'suction', 'call_button'
  ];

  useEffect(() => {
    loadWards();
    loadBeds();
    loadStatistics();
  }, [filterWard, filterStatus]);

  const loadWards = async () => {
    try {
      const response = await api.get('/wards?status=active');
      setWards(response.data.data || []);
    } catch (error) {
      console.error('Error loading wards:', error);
    }
  };

  const loadBeds = async () => {
    setLoading(true);
    try {
      let query = '?';
      if (filterWard) query += `ward=${filterWard}&`;
      if (filterStatus) query += `status=${filterStatus}&`;
      
      const response = await api.get(`/beds${query}`);
      setBeds(response.data.data || []);
    } catch (error) {
      console.error('Error loading beds:', error);
      toast.error('Failed to load beds');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await api.get('/beds/statistics');
      setStatistics(response.data.data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingBed) {
        await api.put(`/beds/${editingBed._id}`, formData);
        toast.success('Bed updated successfully');
      } else {
        await api.post('/beds', formData);
        toast.success('Bed created successfully');
      }
      
      setShowModal(false);
      resetForm();
      loadBeds();
      loadStatistics();
    } catch (error) {
      console.error('Error saving bed:', error);
      toast.error(error.response?.data?.message || 'Failed to save bed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bed) => {
    setEditingBed(bed);
    setFormData({
      bedNumber: bed.bedNumber,
      ward: bed.ward?._id || bed.ward,
      type: bed.type,
      features: bed.features || [],
      status: bed.status,
      notes: bed.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (bedId) => {
    if (!window.confirm('Are you sure you want to delete this bed?')) {
      return;
    }

    try {
      await api.delete(`/beds/${bedId}`);
      toast.success('Bed deleted successfully');
      loadBeds();
      loadStatistics();
    } catch (error) {
      console.error('Error deleting bed:', error);
      toast.error(error.response?.data?.message || 'Failed to delete bed');
    }
  };

  const handleMarkCleaned = async (bedId) => {
    try {
      await api.put(`/beds/${bedId}/cleaned`);
      toast.success('Bed marked as cleaned and available');
      loadBeds();
      loadStatistics();
    } catch (error) {
      console.error('Error marking bed as cleaned:', error);
      toast.error('Failed to update bed status');
    }
  };

  const resetForm = () => {
    setFormData({
      bedNumber: '',
      ward: '',
      type: 'standard',
      features: [],
      status: 'available',
      notes: ''
    });
    setEditingBed(null);
  };

  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const filteredBeds = beds.filter(bed =>
    bed.bedNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const statusInfo = bedStatuses.find(s => s.value === status);
    if (!statusInfo) return null;

    const Icon = statusInfo.icon;
    return (
      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
        status === 'available' ? 'bg-green-100 text-green-800' :
        status === 'occupied' ? 'bg-red-100 text-red-800' :
        status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
        status === 'reserved' ? 'bg-blue-100 text-blue-800' :
        'bg-purple-100 text-purple-800'
      }`}>
        <Icon className="w-3 h-3" />
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BedDouble className="w-8 h-8" />
          Bed Management
        </h1>
        <p className="text-gray-600">Manage hospital beds and their availability</p>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-800">{statistics.total}</div>
            <div className="text-sm text-gray-600">Total Beds</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{statistics.available}</div>
            <div className="text-sm text-gray-600">Available</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">{statistics.occupied}</div>
            <div className="text-sm text-gray-600">Occupied</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">{statistics.maintenance}</div>
            <div className="text-sm text-gray-600">Maintenance</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">
              {statistics.occupancyRate ? `${statistics.occupancyRate.toFixed(1)}%` : '0%'}
            </div>
            <div className="text-sm text-gray-600">Occupancy Rate</div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search bed number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterWard}
            onChange={(e) => setFilterWard(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Wards</option>
            {wards.map(ward => (
              <option key={ward._id} value={ward._id}>
                {ward.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            {bedStatuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Bed
          </button>
        </div>
      </div>

      {/* Beds Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bed Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ward
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Features
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    Loading beds...
                  </td>
                </tr>
              ) : filteredBeds.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No beds found
                  </td>
                </tr>
              ) : (
                filteredBeds.map((bed) => (
                  <tr key={bed._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <BedDouble className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">{bed.bedNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {bed.ward?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="capitalize text-gray-900">{bed.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {bed.features?.map((feature, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {feature.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(bed.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {bed.currentPatient?.firstName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {bed.status === 'cleaning' && (
                          <button
                            onClick={() => handleMarkCleaned(bed._id)}
                            className="text-green-600 hover:text-green-900"
                            title="Mark as Cleaned"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(bed)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(bed._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editingBed ? 'Edit Bed' : 'Add New Bed'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bed Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.bedNumber}
                    onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., A-101"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ward *
                  </label>
                  <select
                    required
                    value={formData.ward}
                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Ward</option>
                    {wards.map(ward => (
                      <option key={ward._id} value={ward._id}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bed Type *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {bedTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {bedStatuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Features
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {featureOptions.map(feature => (
                    <label
                      key={feature}
                      className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={formData.features.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm capitalize">{feature.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : editingBed ? 'Update Bed' : 'Add Bed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BedManagement;