import React, { useState, useEffect } from 'react';
import { FileText, Calendar, DollarSign, Users, Activity, Pill, Stethoscope, Download, Filter, TrendingUp, Building2, AlertCircle } from 'lucide-react';
import api from '../utils/api';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  
  // Statistics state
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    pendingAmount: 0,
    currentAdmissions: 0,
    totalAdmissions: 0
  });

  // Fetch statistics on component mount
  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      // Fetch patient statistics
      const patientRes = await api.get('/patients', { params: { limit: 1 } });
      
      // Fetch billing statistics
      const billingRes = await api.get('/billing/statistics');
      
      // Fetch IPD statistics
      const ipdRes = await api.get('/ipd-records/statistics');

      setStats({
        totalPatients: patientRes.data.pagination?.total || 0,
        activePatients: patientRes.data.count || 0,
        totalRevenue: billingRes.data.data?.invoices?.totalPaid || 0,
        pendingInvoices: billingRes.data.data?.overdueCount || 0,
        pendingAmount: billingRes.data.data?.invoices?.totalDue || 0,
        currentAdmissions: ipdRes.data.data?.currentAdmissions || 0,
        totalAdmissions: ipdRes.data.data?.statusCounts?.reduce((acc, s) => acc + s.count, 0) || 0
      });
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const reportCategories = [
    {
      id: 'patient',
      title: 'Patient Reports',
      icon: Users,
      color: 'bg-blue-500',
      reports: [
        { id: 'patient-list', name: 'Patient List', description: 'Complete list of all patients', endpoint: '/patients' },
        { id: 'patient-search', name: 'Patient Search', description: 'Search patients by name or ID', endpoint: '/patients/search' },
        { id: 'patient-insurance', name: 'Insurance Coverage', description: 'Patients with insurance details', endpoint: '/patients' }
      ]
    },
    {
      id: 'clinical',
      title: 'Clinical Reports',
      icon: Stethoscope,
      color: 'bg-green-500',
      reports: [
        { id: 'visits-summary', name: 'Visits Summary', description: 'All patient visits', endpoint: '/visits' },
        { id: 'visit-details', name: 'Visit Details', description: 'Detailed visit information', endpoint: '/visits' },
        { id: 'prescriptions', name: 'Prescription Report', description: 'All prescriptions by visit', endpoint: '/visits' }
      ]
    },
    {
      id: 'ipd',
      title: 'IPD Reports',
      icon: Building2,
      color: 'bg-purple-500',
      reports: [
        { id: 'ipd-admissions', name: 'Admissions Report', description: 'All IPD admissions', endpoint: '/ipd-records' },
        { id: 'ipd-statistics', name: 'IPD Statistics', description: 'Admission statistics and trends', endpoint: '/ipd-records/statistics' },
        { id: 'ipd-active', name: 'Active Admissions', description: 'Currently admitted patients', endpoint: '/ipd-records' },
        { id: 'ipd-discharged', name: 'Discharged Patients', description: 'Discharge summary report', endpoint: '/ipd-records' }
      ]
    },
    {
      id: 'financial',
      title: 'Financial Reports',
      icon: DollarSign,
      color: 'bg-yellow-500',
      reports: [
        { id: 'invoice-list', name: 'All Invoices', description: 'Complete invoice listing', endpoint: '/billing/invoices' },
        { id: 'invoice-pending', name: 'Pending Invoices', description: 'Unpaid invoices', endpoint: '/billing/invoices' },
        { id: 'invoice-paid', name: 'Paid Invoices', description: 'Completed payments', endpoint: '/billing/invoices' },
        { id: 'payments-summary', name: 'Payments Summary', description: 'All payment transactions', endpoint: '/billing/payments' },
        { id: 'billing-statistics', name: 'Billing Statistics', description: 'Revenue and payment analytics', endpoint: '/billing/statistics' }
      ]
    },
    {
      id: 'pharmacy',
      title: 'Pharmacy Reports',
      icon: Pill,
      color: 'bg-pink-500',
      reports: [
        { id: 'dispensing-records', name: 'Dispensing Records', description: 'Patient medicine dispensing', endpoint: '/dispensing' },
        { id: 'direct-dispensing', name: 'Direct Dispensing', description: 'Over-the-counter sales', endpoint: '/direct-dispensing' }
      ]
    },
    {
      id: 'theatre',
      title: 'Theatre Reports',
      icon: Activity,
      color: 'bg-red-500',
      reports: [
        { id: 'procedures-list', name: 'All Procedures', description: 'Complete procedure listing', endpoint: '/theatre-procedures' },
        { id: 'procedures-scheduled', name: 'Scheduled Procedures', description: 'Upcoming procedures', endpoint: '/theatre-procedures' },
        { id: 'procedures-completed', name: 'Completed Procedures', description: 'Finished procedures', endpoint: '/theatre-procedures' }
      ]
    }
  ];

  const handleGenerateReport = async (report) => {
    setSelectedReport(report);
    setLoading(true);
    setError(null);
    setReportData(null);

    try {
      const params = {};

      // Add date range if provided
      if (dateRange.start) params.startDate = dateRange.start;
      if (dateRange.end) params.endDate = dateRange.end;

      // Add specific filters based on report type
      if (report.id === 'invoice-pending') {
        params.status = 'pending';
      } else if (report.id === 'invoice-paid') {
        params.status = 'paid';
      } else if (report.id === 'ipd-active') {
        params.status = 'admitted';
      } else if (report.id === 'ipd-discharged') {
        params.status = 'discharged';
      } else if (report.id === 'procedures-scheduled') {
        params.status = 'scheduled';
      } else if (report.id === 'procedures-completed') {
        params.status = 'completed';
      }

      // Set higher limit for reports
      params.limit = 100;

      const response = await api.get(report.endpoint, { params });
      setReportData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate report');
      console.error('Error generating report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = (format) => {
    if (!reportData) return;

    let dataToExport = reportData.data || reportData.patients || reportData.invoices || [];
    
    if (format === 'csv') {
      exportToCSV(dataToExport);
    } else if (format === 'json') {
      exportToJSON(dataToExport);
    } else {
      alert(`${format.toUpperCase()} export will be implemented with a PDF library`);
    }
  };

  const exportToCSV = (data) => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    // Flatten nested objects for CSV export
    const flattenObject = (obj, prefix = '') => {
      return Object.keys(obj).reduce((acc, key) => {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
          Object.assign(acc, flattenObject(value, newKey));
        } else if (Array.isArray(value)) {
          acc[newKey] = JSON.stringify(value);
        } else {
          acc[newKey] = value;
        }
        return acc;
      }, {});
    };

    const flatData = data.map(item => flattenObject(item));
    const headers = Object.keys(flatData[0] || {});
    
    const csvContent = [
      headers.join(','),
      ...flatData.map(row => 
        headers.map(header => {
          let value = row[header];
          if (value === null || value === undefined) value = '';
          if (typeof value === 'string' && value.includes(',')) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${selectedReport?.id}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = (data) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${selectedReport?.id}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getRecordCount = () => {
    if (!reportData) return 0;
    return reportData.total || reportData.count || (reportData.data || reportData.patients || reportData.invoices || []).length;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
          <p className="text-gray-600">Generate comprehensive reports across all departments</p>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Date Range:</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">From:</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">To:</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button 
              onClick={() => setDateRange({ start: '', end: '' })}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Report Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {reportCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <div key={category.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className={`${category.color} p-4`}>
                  <div className="flex items-center gap-3">
                    <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">{category.title}</h2>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {category.reports.map((report) => (
                      <div
                        key={report.id}
                        className={`p-3 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group ${
                          selectedReport?.id === report.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                        onClick={() => handleGenerateReport(report)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 group-hover:text-blue-600 mb-1">
                              {report.name}
                            </h3>
                            <p className="text-xs text-gray-500">{report.description}</p>
                          </div>
                          <FileText className="w-4 h-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0 ml-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Generating report...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Report Results */}
        {reportData && !loading && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedReport?.name}
              </h3>
              <div className="text-sm text-gray-600">
                Total Records: {getRecordCount()}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <div className="max-h-96 overflow-y-auto">
                <pre className="text-xs bg-gray-50 p-4 rounded border border-gray-200">
                  {JSON.stringify(reportData, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Export Options */}
        {reportData && !loading && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Report</h3>
            <div className="flex gap-3">
              <button
                onClick={() => handleExportReport('csv')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export as CSV
              </button>
              <button
                onClick={() => handleExportReport('json')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export as JSON
              </button>
              <button
                onClick={() => handleExportReport('pdf')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export as PDF
              </button>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Quick Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Total Patients</div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalPatients.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">Registered patients</div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</div>
              <div className="text-xs text-gray-500 mt-1">Paid invoices</div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Active Admissions</div>
              <div className="text-2xl font-bold text-gray-900">{stats.currentAdmissions}</div>
              <div className="text-xs text-gray-500 mt-1">Currently admitted</div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Pending Amount</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.pendingAmount)}</div>
              <div className="text-xs text-red-600 mt-1">{stats.pendingInvoices} overdue invoices</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;