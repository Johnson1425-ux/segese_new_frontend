import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import RadiologyFulfillModal from './RadiologyFulfillModal';

// Service function to fetch all radiology requests
const radiologyService = {
  getAll: async () => {
    const response = await api.get('/radiology');
    return response.data;
  },
};

const RadiologyDashboard = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: requestsData, isLoading, error } = useQuery('radiologyRequests', radiologyService.getAll);

  const handleOpenModal = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    toast.error('Failed to fetch radiology requests.');
    return <div className="text-red-500 text-center">Error loading data. Please try again.</div>;
  }

  const requests = requestsData?.data || [];
  const pendingRequests = requests.filter(req => req.status === 'Pending');
  const completedRequests = requests.filter(req => req.status === 'Completed');

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Radiology Dashboard</h1>

      {/* Pending Requests Table */}
      <div className="bg-white p-8 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Pending Scans</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scan Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Body Part</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordered By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingRequests.length > 0 ? (
                pendingRequests.map(req => (
                  <tr key={req._id} className="border-b">
                    <td className="px-6 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {req.patient?.firstName} {req.patient?.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900"> 
                        {req.scanType}
                      </div>
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {req.bodyPart}
                      </div>
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        Dr. {req.orderedBy?.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {req.reason}
                      </div>
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap font-medium">
                      <button
                        onClick={() => handleOpenModal(req)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        Fulfill Request
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-500">
                    No pending radiology requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Completed Requests Table */}
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Completed Scans</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scan Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Body Part</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Findings</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {completedRequests.length > 0 ? (
                completedRequests.map(req => (
                  <tr key={req._id} className="border-b">
                    <td className="px-6 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {req.patient?.firstName} {req.patient?.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {req.scanType}
                      </div>
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {req.bodyPart}
                      </div>
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        Dr. {req.completedBy?.lastName || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {req.completedAt ? new Date(req.completedAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-2">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {req.findings || 'No findings recorded'}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-500">
                    No completed radiology requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fulfill Modal */}
      {selectedRequest && (
        <RadiologyFulfillModal
          request={selectedRequest}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default RadiologyDashboard;