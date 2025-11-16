import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Download, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../utils/api.js';
import serviceService from '../utils/serviceService.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ConfirmationDialog from './ConfirmationDialog.jsx';

const Services = () => {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const { data: services, isLoading, isError } = useQuery('services', () => 
    serviceService.getAllServices().then(res => res.data.data)
  );

  // Download Excel Template
  const downloadTemplate = () => {
    const template = [
      {
        name: 'Service Name Example',
        category: 'Category Example',
        price: 50000,
        description: 'Optional description'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Services Template');
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 30 }, // name
      { wch: 20 }, // category
      { wch: 15 }, // price
      { wch: 40 }  // description
    ];

    XLSX.writeFile(workbook, 'services_template.xlsx');
  };

  // Handle Excel Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Validate data
      if (jsonData.length === 0) {
        throw new Error('Excel file is empty');
      }

      // Validate required fields
      const requiredFields = ['name', 'category', 'price'];
      const isValid = jsonData.every(row => 
        requiredFields.every(field => row[field] !== undefined && row[field] !== '')
      );

      if (!isValid) {
        throw new Error('Missing required fields. Please ensure all rows have name, category, and price.');
      }

      // Check for duplicates in Excel file
      const excelNames = jsonData.map(row => row.name.trim().toLowerCase());
      const duplicatesInFile = excelNames.filter((name, index) => 
        excelNames.indexOf(name) !== index
      );

      if (duplicatesInFile.length > 0) {
        throw new Error(`Duplicate services found in Excel file: ${[...new Set(duplicatesInFile)].join(', ')}`);
      }

      // Get existing service names for comparison
      const existingServiceNames = services.map(s => s.name.trim().toLowerCase());

      // Process and upload services
      const results = {
        success: 0,
        failed: 0,
        skipped: 0,
        errors: []
      };

      for (const row of jsonData) {
        // Skip if service already exists
        if (existingServiceNames.includes(row.name.trim().toLowerCase())) {
          results.skipped++;
          continue;
        }

        try {
          await serviceService.createService({
            name: row.name,
            category: row.category,
            price: Number(row.price),
            description: row.description || ''
          });
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Row with name "${row.name}": ${error.message}`);
        }
      }

      // Refresh services list
      queryClient.invalidateQueries('services');

      if (results.failed === 0 && results.skipped === 0) {
        toast.success(`Successfully uploaded ${results.success} services!`);
      } else if (results.failed === 0 && results.skipped > 0) {
        toast.success(`Successfully uploaded ${results.success} services. ${results.skipped} services were skipped (already exist).`);
      } else {
        toast.success(`Uploaded ${results.success} services. ${results.skipped} skipped, ${results.failed} failed.`);
        if (results.errors.length > 0) {
          toast.error(results.errors.join('\n'));
        }
      }
    } catch (error) {
      toast.error(error.message || 'Failed to process Excel file');
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const deleteMutation = useMutation(
    (id) => {
      return api.delete(`/services/${id}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('services');
        toast.success('Service deleted successfully');
        setDialogOpen(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete service');
        setDialogOpen(false);
      },
    }
  );

  const handleDeleteClick = (service) => {
    setSelectedService(service);
    setDialogOpen(true);
  }

  const confirmDelete = () => {
    if (selectedService) {
      deleteMutation.mutate(selectedService._id);
    }
  }

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div>Error loading services.</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Manage Services</h1>
        <div className="flex gap-2">
          <button
            onClick={downloadTemplate}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-5 w-5 mr-2" />
            Download Template
          </button>
          
          <label className="flex items-center px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors cursor-pointer">
            <Upload className="h-5 w-5 mr-2" />
            Upload Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>

          <Link to="/services/new" className="btn-primary inline-flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Add New Service
          </Link>
        </div>
      </div>

      {/* Upload Status Messages */}
      {uploading && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-800">Uploading services...</p>
        </div>
      )}

      {uploadSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800">{uploadSuccess}</p>
        </div>
      )}

      {uploadError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 font-medium">Error:</p>
          <p className="text-red-700 whitespace-pre-line text-sm mt-1">{uploadError}</p>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price (TZS)</th>
              <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {services?.map((service) => (
              <tr key={service._id}>
                <td className="px-6 py-4 whitespace-nowrap">{service.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{service.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right">{service.price.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/services/edit/${service._id}`} className="text-indigo-600 hover:text-indigo-900">
                    <Edit className="inline h-5 w-5" />
                  </Link>
                  <button onClick={() => handleDeleteClick(service)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmationDialog 
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Service"
        message="Are you sure you want to delete this service? This action cannot be undone."
      />
    </div>
  );
};

export default Services;