import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Building2, Plus, Edit, Trash2, Search, X, 
  BedDouble, Users, Activity, CheckCircle, AlertCircle 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const WardManagement = () => {
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingWard, setEditingWard] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [statistics, setStatistics] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    wardNumber: '',
    type: 'general',
    floor: 1,
    capacity: 10,
    description: '',
    facilities: [],
    status: 'active'
  });

  const wardTypes = [
    { value: 'general', label: 'General Ward' },
    { value: 'icu', label: 'ICU' },
    { value: 'ccu', label: 'CCU' },
    { value: 'nicu', label: 'NICU' },
    { value: 'pediatric', label: 'Pediatric Ward' },
    { value: 'maternity', label: 'Maternity Ward' },
    { value: 'surgical', label: 'Surgical Ward' },
    { value: 'medical', label: 'Medical Ward' },
    { value: 'orthopedic', label: 'Orthopedic Ward' },
    { value: 'emergency', label: 'Emergency Ward' },
    { value: 'isolation', label: 'Isolation Ward' },
    { value: 'private', label: 'Private Room' }
  ];

  const facilityOptions = [
    'oxygen', 'ventilator', 'monitor', 'bathroom', 
    'shower', 'tv', 'wifi', 'air_conditioning', 'heating'
  ];

  useEffect(() => {
    loadWards();
    loadStatistics();
  }, [filterType]);

  const loadWards = async () => {
    setLoading(true);
    try {
      const query = filterType ? `?type=${filterType}` : '';
      const response = await api.get(`/wards${query}`);
      setWards(response.data.data || []);
    } catch (error) {
      console.error('Error loading wards:', error);
      toast.error('Failed to load wards');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await api.get('/wards/statistics');
      setStatistics(response.data.data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingWard) {
        await api.put(`/wards/${editingWard._id}`, formData);
        toast.success('Ward updated successfully');
      } else {
        await api.post('/wards', formData);
        toast.success('Ward created successfully');
      }
      
      setShowModal(false);
      resetForm();
      loadWards();
      loadStatistics();
    } catch (error) {
      console.error('Error saving ward:', error);
      toast.error(error.response?.data?.message || 'Failed to save ward');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ward) => {
    setEditingWard(ward);
    setFormData({
      name: ward.name,
      wardNumber: ward.wardNumber,
      type: ward.type,
      floor: ward.floor,
      capacity: ward.capacity,
      description: ward.description || '',
      facilities: ward.facilities || [],
      status: ward.status
    });
    setShowModal(true);
  };

  const handleDelete = async (wardId) => {
    if (!window.confirm('Are you sure you want to delete this ward?')) {
      return;
    }

    try {
      await api.delete(`/wards/${wardId}`);
      toast.success('Ward deleted successfully');
      loadWards();
      loadStatistics();
    } catch (error) {
      console.error('Error deleting ward:', error);
      toast.error(error.response?.data?.message || 'Failed to delete ward');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      wardNumber: '',
      type: 'general',
      floor: 1,
      capacity: 10,
      description: '',
      facilities: [],
      status: 'active'
    });
    setEditingWard(null);
  };

  const handleFacilityToggle = (facility) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  const filteredWards = wards.filter(ward =>
    ward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ward.wardNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'full': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-500 p-3 rounded-lg mr-4">
                <Building2 className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Ward Management</h1>
                <p className="text-gray-600">Manage hospital wards and their capacity</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              <Plus size={20} />
              Add Ward
            </button>
          </div>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Wards</p>
                  <p className="text-2xl font-bold text-gray-800">{statistics.totalWards}</p>
                </div>
                <Building2 className="text-blue-500" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Capacity</p>
                  <p className="text-2xl font-bold text-gray-800">{statistics.totalCapacity}</p>
                </div>
                <BedDouble className="text-green-500" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Occupied Beds</p>
                  <p className="text-2xl font-bold text-gray-800">{statistics.totalOccupied}</p>
                </div>
                <Users className="text-orange-500" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-gray-800">{statistics.overallOccupancyRate}%</p>
                </div>
                <Activity className="text-purple-500" size={32} />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search wards..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Ward Types</option>
              {wardTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Wards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredWards.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Building2 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-500">No wards found</p>
            </div>
          ) : (
            filteredWards.map((ward) => (
              <div key={ward._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{ward.name}</h3>
                    <p className="text-sm text-gray-500">{ward.wardNumber}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ward.status)}`}>
                    {ward.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium text-gray-800 capitalize">{ward.type}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Floor:</span>
                    <span className="font-medium text-gray-800">{ward.floor}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Capacity:</span>
                    <span className="font-medium text-gray-800">{ward.capacity} beds</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Occupied:</span>
                    <span className="font-medium text-gray-800">{ward.occupiedBeds}/{ward.capacity}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Available:</span>
                    <span className="font-medium text-green-600">{ward.availableBeds}</span>
                  </div>
                </div>

                {/* Occupancy Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Occupancy</span>
                    <span>{ward.occupancyRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        ward.occupancyRate >= 90 ? 'bg-red-500' :
                        ward.occupancyRate >= 70 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${ward.occupancyRate}%` }}
                    />
                  </div>
                </div>

                {/* Facilities */}
                {ward.facilities && ward.facilities.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 mb-2">Facilities:</p>
                    <div className="flex flex-wrap gap-1">
                      {ward.facilities.map((facility, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                        >
                          {facility.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleEdit(ward)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(ward._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingWard ? 'Edit Ward' : 'Add New Ward'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ward Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ward Number *
                    </label>
                    <input
                      type="text"
                      value={formData.wardNumber}
                      onChange={(e) => setFormData({ ...formData, wardNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ward Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {wardTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Floor *
                    </label>
                    <input
                      type="number"
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capacity (beds) *
                    </label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facilities
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {facilityOptions.map((facility) => (
                        <label key={facility} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.facilities.includes(facility)}
                            onChange={() => handleFacilityToggle(facility)}
                            className="rounded text-blue-500 focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 capitalize">
                            {facility.replace('_', ' ')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400"
                  >
                    {loading ? 'Saving...' : editingWard ? 'Update Ward' : 'Create Ward'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WardManagement;