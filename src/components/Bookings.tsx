import React, { useState, useEffect } from 'react';

import BookingForm from './BookingForm';
import { 
  Plus, 
  Search,
  ChevronLeft, ChevronRight, MoreHorizontal, 
   
  Edit2, 
  Clock, 
  Calendar as CalendarIcon, 
  User2, 
  Stethoscope, 
  Building2, 
  MoreVertical,
  ChevronDown,
  ChevronUp,
 
  UserCircle,
  FileText,
  
} from 'lucide-react';
import { getBookings, updateBookingStatus } from '../lib/bookings';
import { format } from 'date-fns';

const statusMap: { [key: string]: { label: string; icon: string } } = {
  scheduled: { 
    label: 'Scheduled',
    icon: '🕒'
  },
  pending: { 
    label: 'Pending Review',
    icon: '⏳'
  },
  completed: { 
    label: 'Completed',
    icon: '✅'
  },
  canceled: { 
    label: 'Canceled',
    icon: '❌'
  }
};

const statusColors: { [key: string]: { bg: string; text: string; border: string; hover: string } } = {
  scheduled: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-100',
    hover: 'hover:bg-blue-100'
  },
  pending: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-100',
    hover: 'hover:bg-yellow-100'
  },
  completed: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-100',
    hover: 'hover:bg-green-100'
  },
  canceled: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-100',
    hover: 'hover:bg-red-100'
  }
};




interface Booking {
  id: string;
  patient_first_name: string;
  patient_last_name: string;
  operation_type: string;
  doctor: string;
  theater: string;
  start_time: string;
  end_time: string;
  status: string;
  date_of_birth: string;
  gender: string;
  phone_contact: string;
  anesthesia_review: string;
  classification: string;
  urgency_level: string;
  diagnosis: string;
  special_requirements: string;
  mode_of_payment: string;
  patient_location: string;
}

function Bookings() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showStatusDropdown, setShowStatusDropdown] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1); // track which page we're on
const bookingsPerPage = 10; // how many bookings to show per page

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await getBookings();
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setShowForm(true);
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      setBookings(prev =>
        prev.map(booking =>
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        )
      );
      setShowStatusDropdown(null);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const toggleRowExpansion = (bookingId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bookingId)) {
        newSet.delete(bookingId);
      } else {
        newSet.add(bookingId);
      }
      return newSet;
    });
  };

  const filteredBookings = bookings.filter(booking => {
    const searchString = searchTerm.toLowerCase();
    const matchesSearch = (
      booking.patient_first_name?.toLowerCase().includes(searchString) ||
      booking.patient_last_name?.toLowerCase().includes(searchString) ||
      booking.operation_type?.toLowerCase().includes(searchString) ||
      booking.doctor?.toLowerCase().includes(searchString)
    );

    const matchesFilters = activeFilters.length === 0 || activeFilters.includes(booking.status);

    return matchesSearch && matchesFilters;
  });

  const indexOfLastBooking = currentPage * bookingsPerPage;
const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);


  const renderStatusBadge = (bookingId: string, status: string) => {
    const colors = statusColors[status] || statusColors.pending;
    const statusInfo = statusMap[status] || { label: 'Unknown', icon: '❓' };

    return (
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowStatusDropdown(showStatusDropdown === bookingId ? null : bookingId);
          }}
          className={`inline-flex items-center px-3 py-1 rounded-full border ${colors.bg} ${colors.text} ${colors.border} ${colors.hover} transition-colors duration-150 ease-in-out transform hover:scale-105`}
        >
          <span className="mr-1">{statusInfo.icon}</span>
          <span className="text-sm font-medium">{statusInfo.label}</span>
          <MoreVertical className="w-4 h-4 ml-1" />
        </button>

        {showStatusDropdown === bookingId && (
          <div 
            className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transform transition-all duration-200 ease-out scale-100 opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1" role="menu" aria-orientation="vertical">
              {Object.entries(statusMap).map(([key, value]) => (
                <button
                  key={key}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(bookingId, key);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    key === status ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                  } transition-colors duration-150`}
                  role="menuitem"
                >
                  {value.icon} {value.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderExpandedDetails = (booking: Booking) => {
    return (
      <td colSpan={9} className="px-6 py-6 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-8">
            {/* Patient Information Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <UserCircle className="h-5 w-5 text-indigo-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Patient Details</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Full Name</span>
                  <span className="text-sm font-medium text-gray-900">
                    {booking.patient_first_name} {booking.patient_last_name}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Date of Birth</span>
                  <span className="text-sm font-medium text-gray-900">
                    {format(new Date(booking.date_of_birth), 'MMMM d, yyyy')}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Gender</span>
                  <span className="text-sm font-medium text-gray-900">{booking.gender}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Contact</span>
                  <span className="text-sm font-medium text-gray-900">{booking.phone_contact}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500">Location</span>
                  <span className="text-sm font-medium text-gray-900">{booking.patient_location}</span>
                </div>
              </div>
            </div>

            {/* Operation Details Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Stethoscope className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Operation Details</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Operation Type</span>
                  <span className="text-sm font-medium text-gray-900">{booking.operation_type}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Classification</span>
                  <span className="text-sm font-medium text-gray-900">{booking.classification}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Urgency Level</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    booking.urgency_level === 'emergency' 
                      ? 'bg-red-50 text-red-700'
                      : booking.urgency_level === 'urgent'
                      ? 'bg-yellow-50 text-yellow-700'
                      : 'bg-green-50 text-green-700'
                  }`}>
                    {booking.urgency_level.charAt(0).toUpperCase() + booking.urgency_level.slice(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Duration</span>
                  <span className="text-sm font-medium text-gray-900">
                    {format(new Date(booking.start_time), 'h:mm a')} - {format(new Date(booking.end_time), 'h:mm a')}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500">Theater</span>
                  <span className="text-sm font-medium text-gray-900">{booking.theater}</span>
                </div>
              </div>
            </div>

            {/* Medical Assessment Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Medical Assessment</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Anesthesia Review</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    booking.anesthesia_review === 'Yes' 
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {booking.anesthesia_review}
                  </span>
                </div>
                <div className="py-2 border-b border-gray-50">
                  <div className="text-sm text-gray-500 mb-1">Diagnosis</div>
                  <div className="text-sm font-medium text-gray-900">{booking.diagnosis}</div>
                </div>
                <div className="py-2 border-b border-gray-50">
                  <div className="text-sm text-gray-500 mb-1">Special Requirements</div>
                  <div className="text-sm font-medium text-gray-900">
                    {booking.special_requirements || 'None specified'}
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500">Payment Method</span>
                  <span className="text-sm font-medium px-2 py-1 rounded-full bg-gray-50 text-gray-700">
                    {booking.mode_of_payment.charAt(0).toUpperCase() + booking.mode_of_payment.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </td>
    );
  };

  if (showForm) {
    return (
      <BookingForm
        onBack={() => {
          setShowForm(false);
          setSelectedBookingId(null);
          fetchBookings();
        }}
        bookingId={selectedBookingId || undefined}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Operation Bookings
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track all surgical operations
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105 hover:shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Booking
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative group">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors group-hover:text-indigo-500" />
                <input
                  type="text"
                  placeholder="Search by patient name, operation type, or doctor..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all group-hover:border-indigo-300 group-hover:shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex flex-wrap gap-2">
                {Object.entries(statusMap).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setActiveFilters(prev =>
                      prev.includes(key)
                        ? prev.filter(f => f !== key)
                        : [...prev, key]
                    )}
                    className={`inline-flex items-center px-3 py-1 rounded-full border text-sm ${
                      activeFilters.includes(key)
                        ? `${statusColors[key].bg} ${statusColors[key].text} ${statusColors[key].border} shadow-sm`
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    } transition-all duration-200 transform hover:scale-105`}
                  >
                    {value.icon} {value.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="p-6 text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-lg bg-red-50 text-red-600 border border-red-100 shadow-sm">
              <span className="mr-2">❌</span>
              {error}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-white">
                  <th className="w-8 px-6 py-3"></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <User2 className="w-4 h-4" />
                      <span>Patient</span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <Stethoscope className="w-4 h-4" />
                      <span>Operation</span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Date</span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Time</span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <User2 className="w-4 h-4" />
                      <span>Doctor</span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <Building2 className="w-4 h-4" />
                      <span>Theater</span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {currentBookings.map((booking) => (
  <React.Fragment key={booking.id}>
    <tr
      className="hover:bg-gray-50 transition-all duration-200 ease-in-out group cursor-pointer"
      onClick={() => toggleRowExpansion(booking.id)}
    >
      <td className="px-6 py-4 w-8">
        {expandedRows.has(booking.id) ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-medium transform transition-transform group-hover:scale-110">
              {booking.patient_first_name?.[0]}{booking.patient_last_name?.[0]}
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {`${booking.patient_first_name} ${booking.patient_last_name}`}
            </div>
            <div className="text-sm text-gray-500">
              {booking.phone_contact}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{booking.operation_type}</div>
        <div className="text-xs text-gray-500">{booking.classification}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {format(new Date(booking.start_time), 'MMM d, yyyy')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {format(new Date(booking.start_time), 'h:mm a')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{booking.doctor}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {booking.theater}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {renderStatusBadge(booking.id, booking.status)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(booking.id);
          }}
          className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105 hover:shadow-sm group-hover:border-indigo-300 group-hover:text-indigo-600"
        >
          <Edit2 className="h-4 w-4 mr-1" />
          Edit
        </button>
      </td>
    </tr>

    {expandedRows.has(booking.id) && (
      <tr key={`${booking.id}-expanded`}>
        {renderExpandedDetails(booking)}
      </tr>
    )}
  </React.Fragment>
))}

              </tbody>
            </table>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-white">
  {/* Results Summary */}
  <div className="text-sm text-gray-600">
    Showing{" "}
    <span className="font-semibold text-gray-900">
      {(currentPage - 1) * bookingsPerPage + 1}
    </span>{" "}
    to{" "}
    <span className="font-semibold text-gray-900">
      {Math.min(currentPage * bookingsPerPage, filteredBookings.length)}
    </span>{" "}
    of{" "}
    <span className="font-semibold text-gray-900">{filteredBookings.length}</span>{" "}
    bookings
  </div>

  {/* Pagination Controls */}
  <nav className="flex items-center space-x-1">
    {/* Previous Button */}
    <button
      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
      className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
    >
      <ChevronLeft className="w-4 h-4" />
    </button>

    {/* Page Numbers */}
    {Array.from({ length: Math.ceil(filteredBookings.length / bookingsPerPage) }, (_, i) => i + 1)
      .filter((page) => {
        const total = Math.ceil(filteredBookings.length / bookingsPerPage);
        return (
          page === 1 ||
          page === total ||
          (page >= currentPage - 1 && page <= currentPage + 1)
        );
      })
      .map((page, idx, arr) => (
        <React.Fragment key={page}>
          {/* Add ellipsis if skipping numbers */}
          {idx > 0 && page - arr[idx - 1] > 1 && (
            <span className="px-2 text-gray-400">
              <MoreHorizontal className="w-4 h-4" />
            </span>
          )}

          <button
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              currentPage === page
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            } transition`}
          >
            {page}
          </button>
        </React.Fragment>
      ))}

    {/* Next Button */}
    <button
      onClick={() => {
        const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);
        setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
      }}
      disabled={currentPage >= Math.ceil(filteredBookings.length / bookingsPerPage)}
      className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
    >
      <ChevronRight className="w-4 h-4" />
    </button>
  </nav>
</div>


          </div>
        )}
      </div>
    </div>
  );
}

export default Bookings;