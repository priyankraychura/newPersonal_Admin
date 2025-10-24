import React, { useEffect, useMemo, useState } from 'react';
import {
  Mail,
  Phone,
  CreditCard,
  ChevronDown,
  ChevronUp,
  User,
  MapPin,
  IndianRupee,
  Building,
  FileText,
  Calendar,
  Filter,
  X
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const LoanQueries = () => {
  const [loanApplications, setLoanApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [expandedRows, setExpandedRows] = useState(new Set());
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  const [activeLoanTypeFilter, setActiveLoanTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const statusFilters = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'under review', label: 'Under Review' },
  ];

  const loanTypes = [
    { id: 'all', label: 'All Types' },
    { id: 'personal loan', label: 'Personal' },
    { id: 'homeloan', label: 'Home Loan' },
    { id: 'unsecured business loan', label: 'Business' },
  ];

  const fetchLoanApplications = () => {
    setLoading(true);

    const config = {
      headers: {
        Authorization: localStorage.getItem("token")
      }
    };

    try {
      axios.get('http://localhost:1008/api/v1/admin/get-loan-application', config).then((responseData) => {
        // Normalize the data to match the component's expected structure
        const normalizedData = responseData?.data?.data?.map(app => {
          let loanDetails = {};
          if (app.loanType === 'personal loan') {
            loanDetails = {
              salary: app.personalLoanInfo.monthlySalary,
              company: app.personalLoanInfo.currentEmployer,
              employmentType: app.personalLoanInfo.employmentType,
              existingLoan: app.personalLoanInfo.existingLoan,
              creditScore: app.personalLoanInfo.creditScore,
              loanAmount: app.personalLoanInfo.requestedLoanAmount,
            };
          } else if (app.loanType === 'homeloan') {
            loanDetails = {
              propertyPrice: app.homeLoanInfo.propertyPrice,
              propertyValuation: app.homeLoanInfo.propertyValuation,
              propertyType: app.homeLoanInfo.propertyType,
              downPayment: app.homeLoanInfo.downPayment,
              propertyArea: app.homeLoanInfo.propertyArea,
              loanTenure: app.homeLoanInfo.loanTenure,
              propertyAddress: app.homeLoanInfo.propertyAddress,
            };
          } else if (app.loanType === 'unsecured business loan') {
            loanDetails = {
              businessType: app.businessLoanInfo.businessType,
              businessContinuity: app.businessLoanInfo.businessContinuity,
              turnover: app.businessLoanInfo.annualTurnover,
              gstNumber: app.businessLoanInfo.gstNumber,
              loanObligation: app.businessLoanInfo.loanObligation
            };
          }

          return {
            id: app._id,
            name: app.name,
            mobile: app.mobile,
            email: app.email,
            loanType: app.loanType,
            appliedDate: app.createdAt,
            status: app.status,
            personalInfo: {
              pan: app.personalInfo.panNumber,
              aadhar: app.personalInfo.aadharNumber,
              address: app.personalInfo.residentialAddress,
            },
            loanDetails: loanDetails,
          };
        });

        setLoanApplications(normalizedData.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate)));
        setLoading(false);

      })
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Could not fetch loan applications. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoanApplications();
  }, []);

  const getStatusCounts = () => {
    return {
      all: loanApplications.length,
      pending: loanApplications.filter(app => app.status === 'pending').length,
      approved: loanApplications.filter(app => app.status === 'approved').length,
      rejected: loanApplications.filter(app => app.status === 'rejected').length,
      'under review': loanApplications.filter(app => app.status === 'under review').length,
    };
  };

  const statusCounts = getStatusCounts();

  const filteredApplications = useMemo(() => {
    let filtered = [...loanApplications];

    // Status filter
    if (activeStatusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === activeStatusFilter);
    }

    // Loan type filter
    if (activeLoanTypeFilter !== 'all') {
      filtered = filtered.filter(app => app.loanType === activeLoanTypeFilter);
    }

    // Date range filter
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);

      filtered = filtered.filter(app => {
        const appDate = new Date(app.appliedDate);
        return appDate >= startDate && appDate <= endDate;
      });
    }

    return filtered;
  }, [loanApplications, activeStatusFilter, activeLoanTypeFilter, dateRange]);

  const handleStatusChange = (id, newStatus) => {
    setLoanApplications(prevApplications =>
      prevApplications.map(app =>
        app.id === id ? { ...app, status: newStatus } : app
      )
    );
    const config = {
      headers: {
        Authorization: localStorage.getItem("token")
      }
    };

    axios.patch(`http://localhost:1008/api/v1/admin/update-status/${id}`, { status: newStatus }, config)
      .then((response) => {
        toast.success(response.data.msg)
      }).catch((err) => {
        toast.error(error.response?.data?.msg || 'Status update failed!')
      })
  };

  const toggleRowExpansion = (id) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      rejected: 'bg-rose-50 text-rose-700 border-rose-200',
      'under review': 'bg-sky-50 text-sky-700 border-sky-200',
    };
    return statusColors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const clearFilters = () => {
    setDateRange({ start: '', end: '' });
    setActiveLoanTypeFilter('all');
    setActiveStatusFilter('all');
  };

  const hasActiveFilters = activeLoanTypeFilter !== 'all' || (dateRange.start && dateRange.end);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Loan Applications</h1>
        <div className="text-sm text-gray-500">
          {filteredApplications.length} of {loanApplications.length} applications
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4 ">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveStatusFilter(filter.id)}
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${activeStatusFilter === filter.id
                ? 'bg-blue-100 text-blue-700 border-blue-200 border'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
            >
              {filter.label}
              <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${activeStatusFilter === filter.id
                ? 'bg-blue-200 text-blue-800'
                : 'bg-gray-200 text-gray-600'
                }`}>
                {statusCounts[filter.id] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Secondary Filters */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Loan Type Filter */}
          <div className="relative">
            <select
              value={activeLoanTypeFilter}
              onChange={(e) => setActiveLoanTypeFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
            >
              {loanTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Date Range Filter */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`inline-flex items-center px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium transition-colors ${dateRange.start && dateRange.end
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              {dateRange.start && dateRange.end
                ? `${new Date(dateRange.start).toLocaleDateString('en-IN')} - ${new Date(dateRange.end).toLocaleDateString('en-IN')}`
                : 'Date Range'
              }
            </button>

            {/* Date Picker Dropdown */}
            {showDatePicker && (
              <div className="absolute top-full mt-2 ml-[-10rem] bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-4 w-80">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">Select Date Range</h4>
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      onClick={() => setDateRange({ start: '', end: '' })}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Clear dates
                    </button>
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-4 h-4 mr-1" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-y-auto max-h-[600px]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loan Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center space-y-2">
                      <FileText className="w-12 h-12 text-gray-300" />
                      <p className="text-lg font-medium">No applications found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApplications.map((application) => (
                  <React.Fragment key={application.id}>
                    <tr className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {application.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {application.name}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {application.email}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {application.mobile}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CreditCard className="w-4 h-4 text-blue-500 mr-2" />
                          <span className="text-sm text-gray-900 capitalize">
                            {application.loanType}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(application.appliedDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(application.status)}`}>
                          {application.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => toggleRowExpansion(application.id)}
                          className="text-blue-600 hover:text-blue-900 flex items-center space-x-1 transition-colors duration-200"
                        >
                          {expandedRows.has(application.id) ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              <span>Hide Details</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              <span>View Details</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedRows.has(application.id) && (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 bg-gray-50">
                          <div className="space-y-4">
                            {/* Personal Information */}
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                <User className="w-4 h-4 text-blue-500 mr-2" />
                                Personal Information
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-md">
                                  <CreditCard className="w-4 h-4 text-blue-600" />
                                  <div>
                                    <div className="text-xs text-blue-600 font-medium">PAN</div>
                                    <div className="text-sm text-gray-900">{application.personalInfo.pan}</div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 bg-purple-50 px-3 py-2 rounded-md">
                                  <User className="w-4 h-4 text-purple-600" />
                                  <div>
                                    <div className="text-xs text-purple-600 font-medium">Aadhar</div>
                                    <div className="text-sm text-gray-900">{application.personalInfo.aadhar}</div>
                                  </div>
                                </div>
                                <div className="md:col-span-1 flex items-start space-x-2 bg-gray-50 px-3 py-2 rounded-md">
                                  <MapPin className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <div className="text-xs text-gray-600 font-medium">Address</div>
                                    <div className="text-sm text-gray-900">{application.personalInfo.address}</div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Loan Details */}
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                <FileText className="w-4 h-4 text-green-500 mr-2" />
                                {application.loanType === 'personal loan' ? 'Employment Details' :
                                  application.loanType === 'unsecured business loan' ? 'Business Information' :
                                    'Property Information'}
                              </h4>

                              {application.loanType === 'personal loan' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-md">
                                    <IndianRupee className="w-4 h-4 text-green-600" />
                                    <div>
                                      <div className="text-xs text-green-600 font-medium">Monthly Salary</div>
                                      <div className="text-sm font-semibold text-gray-900">₹{application.loanDetails.salary?.toLocaleString()}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-md">
                                    <Building className="w-4 h-4 text-blue-600" />
                                    <div>
                                      <div className="text-xs text-blue-600 font-medium">Company</div>
                                      <div className="text-sm text-gray-900">{application.loanDetails.company}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 bg-purple-50 px-3 py-2 rounded-md">
                                    <User className="w-4 h-4 text-purple-600" />
                                    <div>
                                      <div className="text-xs text-purple-600 font-medium">Employment Type</div>
                                      <div className="text-sm text-gray-900 capitalize">{application.loanDetails.employmentType}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 bg-orange-50 px-3 py-2 rounded-md">
                                    <CreditCard className="w-4 h-4 text-orange-600" />
                                    <div>
                                      <div className="text-xs text-orange-600 font-medium">Credit Score</div>
                                      <div className="text-sm font-semibold text-gray-900">{application.loanDetails.creditScore || "N/A"}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-md">
                                    <IndianRupee className="w-4 h-4 text-red-600" />
                                    <div>
                                      <div className="text-xs text-red-600 font-medium">Loan Amount</div>
                                      <div className="text-sm font-semibold text-gray-900">₹{application.loanDetails.loanAmount?.toLocaleString()}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-md">
                                    <FileText className="w-4 h-4 text-gray-600" />
                                    <div>
                                      <div className="text-xs text-gray-600 font-medium">Existing Loan</div>
                                      <div className="text-sm text-gray-900 capitalize">{application.loanDetails.existingLoan}</div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {application.loanType === 'unsecured business loan' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  <div className="flex items-center space-x-2 bg-purple-50 px-3 py-2 rounded-md">
                                    <Building className="w-4 h-4 text-purple-600" />
                                    <div>
                                      <div className="text-xs text-purple-600 font-medium">Business Type</div>
                                      <div className="text-sm text-gray-900">{application.loanDetails.businessType}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-md">
                                    <User className="w-4 h-4 text-blue-600" />
                                    <div>
                                      <div className="text-xs text-blue-600 font-medium">Experience</div>
                                      <div className="text-sm text-gray-900">{application.loanDetails.businessContinuity} years</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-md">
                                    <IndianRupee className="w-4 h-4 text-green-600" />
                                    <div>
                                      <div className="text-xs text-green-600 font-medium">Annual Turnover</div>
                                      <div className="text-sm font-semibold text-gray-900">₹{application.loanDetails.turnover?.toLocaleString()}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-md">
                                    <CreditCard className="w-4 h-4 text-red-600" />
                                    <div>
                                      <div className="text-xs text-red-600 font-medium">GST Number</div>
                                      <div className="text-sm text-gray-900">{application.loanDetails.gstNumber}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-md">
                                    <FileText className="w-4 h-4 text-gray-600" />
                                    <div>
                                      <div className="text-xs text-gray-600 font-medium">Loan Obligation</div>
                                      <div className="text-sm text-gray-900">{application.loanDetails.loanObligation}</div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {application.loanType === 'homeloan' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-md">
                                    <IndianRupee className="w-4 h-4 text-green-600" />
                                    <div>
                                      <div className="text-xs text-green-600 font-medium">Property Price</div>
                                      <div className="text-sm font-semibold text-gray-900">₹{application.loanDetails.propertyPrice?.toLocaleString()}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-md">
                                    <IndianRupee className="w-4 h-4 text-blue-600" />
                                    <div>
                                      <div className="text-xs text-blue-600 font-medium">Property Valuation</div>
                                      <div className="text-sm font-semibold text-gray-900">₹{application.loanDetails.propertyValuation?.toLocaleString()}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 bg-purple-50 px-3 py-2 rounded-md">
                                    <Building className="w-4 h-4 text-purple-600" />
                                    <div>
                                      <div className="text-xs text-purple-600 font-medium">Property Type</div>
                                      <div className="text-sm text-gray-900 capitalize">{application.loanDetails.propertyType}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 bg-orange-50 px-3 py-2 rounded-md">
                                    <IndianRupee className="w-4 h-4 text-orange-600" />
                                    <div>
                                      <div className="text-xs text-orange-600 font-medium">Down Payment</div>
                                      <div className="text-sm font-semibold text-gray-900">₹{application.loanDetails.downPayment?.toLocaleString()}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-md">
                                    <MapPin className="w-4 h-4 text-red-600" />
                                    <div>
                                      <div className="text-xs text-red-600 font-medium">Property Area</div>
                                      <div className="text-sm text-gray-900">{application.loanDetails.propertyArea} sq ft</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-md">
                                    <Calendar className="w-4 h-4 text-gray-600" />
                                    <div>
                                      <div className="text-xs text-gray-600 font-medium">Loan Tenure</div>
                                      <div className="text-sm text-gray-900">{application.loanDetails.loanTenure} years</div>
                                    </div>
                                  </div>
                                  <div className="md:col-span-3 flex items-start space-x-2 bg-green-50 px-3 py-2 rounded-md">
                                    <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <div className="text-xs text-green-600 font-medium">Property Address</div>
                                      <div className="text-sm text-gray-900">{application.loanDetails.propertyAddress}</div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Status Management */}
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                Update Status
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {['pending', 'under review', 'approved', 'rejected'].map((status) => (
                                  <button
                                    key={status}
                                    onClick={() => handleStatusChange(application.id, status)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${application.status === status
                                      ? `${getStatusBadge(status)} shadow-sm`
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                                      }`}
                                  >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LoanQueries;
