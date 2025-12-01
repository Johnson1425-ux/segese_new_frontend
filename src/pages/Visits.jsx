import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Plus, Search, Filter, Eye, ChevronLeft, ChevronRight, MoreVertical, Trash2, Loader2 } from 'lucide-react';
import { visitService } from '../utils/visitService.js';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import PaymentConfirmation from '../components/visit/PaymentConfirmation.jsx';

const Visits = () => {
  const { hasAnyRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);

  const canCreateVisit = hasAnyRole(['admin', 'receptionist']);
  const dropdownRef = useRef(null);

  const toggleDropdown = (visitId) => {
    setOpenDropdown(openDropdown === visitId ? null : visitId);
  };

  const {
    data: visitsData,
    isLoading,
    isError,
    refetch,
  } = useQuery(
    ['visits', currentPage, statusFilter, searchTerm],
    () => visitService.getAllVisits({ page: currentPage, limit: 10, status: statusFilter, search: searchTerm }),
    { keepPreviousData: true }
  );

  const visits = visitsData?.data || [];
  const totalPages = visitsData?.totalPages || 1;

  const handleDeleteClick = async (visit) => {
    if (!window.confirm(`Are you sure you want to delete this visit?`)) return;

    try {
      setIsDeleting(visit._id);
      await visitService.deleteVisit(visit._id);
      refetch();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete visit';
      console.error(message);
    } finally {
      setIsDeleting(null);
      setOpenDropdown(null);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div className="text-red-500">Error loading visits.</div>;

  // Actions Dropdown Component
  const ActionsDropdown = ({ visit, isOpen, onToggle }) => {
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
    const buttonRef = useRef(null);
    const dropdownMenuRef = useRef(null);

    useEffect(() => {
      if (isOpen && buttonRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const dropdownWidth = 192;
        const viewportHeight = window.innerHeight;
        const dropdownHeight = 140;
        
        const spaceBelow = viewportHeight - buttonRect.bottom;
        const shouldAppearAbove = spaceBelow < dropdownHeight && buttonRect.top > dropdownHeight;
        
        setDropdownPosition({
          top: shouldAppearAbove ? buttonRect.top - dropdownHeight - 4 : buttonRect.bottom + 4,
          left: Math.max(8, buttonRect.right - dropdownWidth)
        });
      }
    }, [isOpen]);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownMenuRef.current && !dropdownMenuRef.current.contains(event.target) && 
            buttonRef.current && !buttonRef.current.contains(event.target)) {
          setOpenDropdown(null);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    return (
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(visit._id);
          }}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors duration-200"
          title="More actions"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-[9998]" 
              onClick={() => setOpenDropdown(null)} 
            />
            
            <div 
              ref={dropdownMenuRef}
              className="fixed bg-white rounded-md shadow-2xl border border-gray-200 py-1 z-[9999] w-48"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
              onClick={(e) => e.stopPropagation()}
            >              
              <Link
                to={`/visits/${visit._id}`}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 no-underline"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(null);
                }}
              >
                <Eye className="w-4 h-4 mr-3 flex-shrink-0" />
                View Details
              </Link>
              
              <hr className="my-1 border-gray-200" />
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(visit);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 cursor-pointer"
                disabled={isDeleting === visit._id}
              >
                {isDeleting === visit._id ? (
                  <Loader2 className="w-4 h-4 mr-3 animate-spin flex-shrink-0" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-3 flex-shrink-0" />
                )}
                Delete Visit
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Patient Visits</h1>
        {canCreateVisit && (
          <Link to="/visits/new" className="btn-primary inline-flex items-center w-full sm:w-auto">
            <Plus className="h-5 w-5 mr-2" />
            Start New Visit
          </Link>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="input-field pl-10 w-full sm:w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In-Progress">In-Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visits.length > 0 ? (
                visits.map((visit) => (
                  <tr key={visit._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{visit.patient?.firstName} {visit.patient?.lastName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">Dr. {visit.doctor?.firstName} {visit.doctor?.lastName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(visit.visitDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap truncate max-w-xs">{visit.reason}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        visit.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        visit.status === 'In-Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {visit.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <ActionsDropdown 
                        visit={visit}
                        isOpen={openDropdown === visit._id}
                        onToggle={toggleDropdown}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-gray-500">
                    No visits found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="btn-secondary disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Previous
        </button>
        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="btn-secondary disabled:opacity-50"
        >
          Next
          <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>

      {/* Payment Confirmation Modal */}
      {showPaymentConfirmation && selectedVisit && (
        <PaymentConfirmation 
          visit={selectedVisit} 
          onSuccess={() => {
            refetch();
            setShowPaymentConfirmation(false);
            setSelectedVisit(null);
          }}
          onClose={() => {
            setShowPaymentConfirmation(false);
            setSelectedVisit(null);
          }}
        />
      )}
    </div>
  );
};

export default Visits;