import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search,
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal,
  Edit2, 
  Stethoscope, 
  ChevronDown,
  ChevronUp,
  UserCircle,
  FileText,
  Filter
} from 'lucide-react';
import { getBookings, updateBookingStatus,  } from '../lib/bookings';
import {escalateEmergencyBooking} from '../lib/emergencies'
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { cn, formatDate, formatTime } from '../lib/utils';
import BookingForm from './BookingForm';
import EmergencyEscalationModal from './ui/EmergencyEscalationModal';


const statusMap: { [key: string]: { label: string; icon: string; variant: 'default' | 'success' | 'warning' | 'error' } } = {
  scheduled: { 
    label: 'Scheduled',
    icon: '🕒',
    variant: 'default' // ✅ Valid
  }
  ,
  pending: { 
    label: 'Pending Review',
    icon: '⏳',
    variant: 'warning'
  },
  completed: { 
    label: 'Completed',
    icon: '✅',
    variant: 'success'
  },
  canceled: { 
    label: 'Canceled',
    icon: '❌',
    variant: 'error'
  },
  rescheduled: { 
    label: 'Rescheduled',
    icon: '🔁',
    variant: 'warning'
  }  
};

interface Booking {
  id: string;
  patient_id: string;
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
  is_emergency: boolean; // ✅ required
  emergency_reason?: string;
  overridden_booking_id?: number;
}


function Bookings() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showStatusDropdown, setShowStatusDropdown] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const bookingsPerPage = 10;
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [escalationBooking, setEscalationBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (showStatusDropdown && !(event.target as Element).closest('.status-dropdown')) {
        setShowStatusDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showStatusDropdown]);

  const fetchBookings = async () => {
    try {
      const data = await getBookings();
      setBookings(data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
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
    if (['rescheduled', 'preempted'].includes(booking.status) || booking.is_emergency) return false;

    const searchString = searchTerm.toLowerCase();
    const matchesSearch = (
      booking.patient_first_name?.toLowerCase().includes(searchString) ||
      booking.patient_last_name?.toLowerCase().includes(searchString) ||
      booking.operation_type?.toLowerCase().includes(searchString) ||
      booking.doctor?.toLowerCase().includes(searchString) ||
      booking.patient_id?.toLowerCase().includes(searchString) 
    );

    const matchesFilters = activeFilters.length === 0 || activeFilters.includes(booking.status);

    return matchesSearch && matchesFilters;
  });

  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);
  const currentBookings = filteredBookings.slice(
    (currentPage - 1) * bookingsPerPage,
    currentPage * bookingsPerPage
  );

  const renderStatusBadge = (bookingId: string, status: string) => {
    const statusInfo = statusMap[status] || { label: 'Unknown', icon: '❓', variant: 'default' };

    return (
      <div className="relative status-dropdown">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowStatusDropdown(showStatusDropdown === bookingId ? null : bookingId);
          }}
          className="group flex items-center space-x-1"
        >
          <Badge
            variant={statusInfo.variant}
            className="transition-transform group-hover:scale-105"
          >
            <span className="mr-1">{statusInfo.icon}</span>
            <span>{statusInfo.label}</span>
          </Badge>
          <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
        </button>

        {showStatusDropdown === bookingId && (
          <div 
            className="absolute z-50 mt-2 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 transform transition-all duration-200 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1" role="menu">
              {Object.entries(statusMap).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleStatusChange(bookingId, key)}
                  className={cn(
                    'w-full text-left px-4 py-2 text-sm transition-colors',
                    key === status 
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
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
      <td colSpan={9} className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="hover">
            <Card.Header>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <UserCircle className="h-5 w-5 text-indigo-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Patient Details</h4>
              </div>
            </Card.Header>
            <Card.Body className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
  <div className="text-gray-500">Patient ID</div>
  <div className="font-mono text-sm text-indigo-700">{booking.patient_id}</div>
</div>

                <div>
                  <div className="text-gray-500">Full Name</div>
                  <div className="font-medium text-gray-900">
                    {booking.patient_first_name} {booking.patient_last_name}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Date of Birth</div>
                  <div className="font-medium text-gray-900">
                    {formatDate(booking.date_of_birth)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Gender</div>
                  <div className="font-medium text-gray-900">{booking.gender}</div>
                </div>
                <div>
                  <div className="text-gray-500">Contact</div>
                  <div className="font-medium text-gray-900">{booking.phone_contact}</div>
                </div>
              </div>
              <div>
                <div className="text-gray-500">Location</div>
                <div className="font-medium text-gray-900">{booking.patient_location}</div>
              </div>
            </Card.Body>
          </Card>

          <Card variant="hover">
            <Card.Header>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Stethoscope className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Operation Details</h4>
              </div>
            </Card.Header>
            <Card.Body className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Operation Type</div>
                  <div className="font-medium text-gray-900">{booking.operation_type}</div>
                </div>
                <div>
                  <div className="text-gray-500">Classification</div>
                  <div className="font-medium text-gray-900">{booking.classification}</div>
                </div>
                <div>
                  <div className="text-gray-500">Urgency Level</div>
                  <Badge
  variant={
    booking.urgency_level === 'emergency'
      ? 'error'
      : booking.urgency_level === 'urgent'
      ? 'warning'
      : 'success'
  }
>
  {typeof booking.urgency_level === 'string'
    ? booking.urgency_level.charAt(0).toUpperCase() + booking.urgency_level.slice(1)
    : 'N/A'}
</Badge>

                </div>
                <div>
                  <div className="text-gray-500">Duration</div>
                  <div className="font-medium text-gray-900">
                    {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-gray-500">Theater</div>
                <div className="font-medium text-gray-900">{booking.theater}</div>
              </div>
            </Card.Body>
          </Card>

          <Card variant="hover">
            <Card.Header>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Medical Assessment</h4>
              </div>
            </Card.Header>
            <Card.Body className="space-y-4">
              <div>
                <div className="text-gray-500">Anesthesia Review</div>
                <Badge
                  variant={booking.anesthesia_review === 'Yes' ? 'success' : 'error'}
                  className="mt-1"
                >
                  {booking.anesthesia_review}
                </Badge>
              </div>
              <div>
                <div className="text-gray-500">Diagnosis</div>
                <div className="font-medium text-gray-900 mt-1">{booking.diagnosis}</div>
              </div>
              <div>
                <div className="text-gray-500">Special Requirements</div>
                <div className="font-medium text-gray-900 mt-1">
                  {booking.special_requirements || 'None specified'}
                </div>
              </div>
              <div>
  <div>
  <div className="text-gray-500">Payment Method</div>
  <Badge className="mt-1">
    {typeof booking.mode_of_payment === 'string'
      ? booking.mode_of_payment.charAt(0).toUpperCase() + booking.mode_of_payment.slice(1)
      : 'N/A'}
  </Badge>
</div>

</div>


            </Card.Body>
          </Card>
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

  

  return (
    <div className="h-screen overflow-hidden">
      <div className="space-y-6 h-full p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="section-header">Operation Bookings</h1>
            <p className="section-subheader">Manage and track all surgical operations</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            leftIcon={<Plus className="h-5 w-5" />}
            className="btn-primary"
          >
            New Booking
          </Button>
        </div>

        <Card variant="hover" className="flex-1 flex flex-col h-[calc(100vh-10rem)] overflow-hidden">
          <Card.Header className="bg-gradient-to-r from-gray-50 to-white flex-none">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="relative w-[300px]">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-8 pr-3 py-1.5 text-sm"
                  />
                </div>
                <Button
                  variant="secondary"
                  leftIcon={<Filter className="h-4 w-4" />}
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="whitespace-nowrap h-8"
                  size="sm"
                >
                  Filters
                </Button>
              </div>
              {showMobileFilters && (
                <div className="content-card">
                  <div className="content-card-body">
                    <div className="text-sm font-medium text-gray-700">Filter by Status:</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(statusMap).map(([key, value]) => (
                        <Badge
                          key={key}
                          variant={value.variant}
                          className={cn(
                            'cursor-pointer transition-all hover:scale-105',
                            activeFilters.includes(key) && 'ring-2 ring-offset-2 ring-brand-500'
                          )}
                          onClick={() => setActiveFilters(prev =>
                            prev.includes(key)
                              ? prev.filter(f => f !== key)
                              : [...prev, key]
                          )}
                        >
                          {value.icon} {value.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card.Header>

          <div className="flex-1 overflow-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-indigo-200 hover:scrollbar-thumb-indigo-300">
            <table className="table">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="w-8 px-3 py-3"></th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">
                    Patient
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                    Operation
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                    Date & Time
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                    Doctor
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                    Theater
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                    Status
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentBookings.map((booking) => (
                  <React.Fragment key={booking.id}>
                    <tr
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => toggleRowExpansion(booking.id)}
                    >
                      <td className="px-6 py-4">
                        {expandedRows.has(booking.id) ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-full w-full rounded-full bg-gradient-to-r from-brand-100 to-accent-100 flex items-center justify-center text-brand-600 font-medium">
                              {booking.patient_first_name[0]}{booking.patient_last_name[0]}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.patient_first_name} {booking.patient_last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.phone_contact}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{booking.operation_type}</div>
                        <div className="text-xs text-gray-500">{booking.classification}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{formatDate(booking.start_time)}</div>
                        <div className="text-xs text-gray-500">{formatTime(booking.start_time)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{booking.doctor}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">{booking.theater}</div>
                      </td>
                      <td className="px-6 py-4">
                        {renderStatusBadge(booking.id, booking.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end space-y-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<Edit2 className="h-4 w-4" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(booking.id);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEscalationBooking(booking);
                              setShowEmergencyModal(true);
                            }}
                            className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 px-2 py-1 text-xs"
                          >
                            <span className="flex items-center gap-1">
                              <span>Escalate</span>
                              <span>🚨</span>
                            </span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {expandedRows.has(booking.id) && (
                      <tr>
                        {renderExpandedDetails(booking)}
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <Card.Footer className="bg-gray-50 flex-none">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-700">
                Showing {(currentPage - 1) * bookingsPerPage + 1} to{' '}
                {Math.min(currentPage * bookingsPerPage, filteredBookings.length)} of{' '}
                {filteredBookings.length} entries
              </div>
              <div className="flex items-center justify-end space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  leftIcon={<ChevronLeft className="h-4 w-4" />}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      if (totalPages <= 5) return true;
                      if (page === 1 || page === totalPages) return true;
                      if (Math.abs(page - currentPage) <= 1) return true;
                      return false;
                    })
                    .map((page, idx, arr) => (
                      <React.Fragment key={page}>
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="text-gray-500">
                            <MoreHorizontal className="h-4 w-4" />
                          </span>
                        )}
                        <Button
                          variant={currentPage === page ? 'primary' : 'secondary'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      </React.Fragment>
                    ))}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          </Card.Footer>
        </Card>

        <EmergencyEscalationModal
          isOpen={showEmergencyModal}
          patientName={`${escalationBooking?.patient_first_name} ${escalationBooking?.patient_last_name}`}
          onClose={() => {
            setShowEmergencyModal(false);
            setEscalationBooking(null);
          }}
          onSubmit={async (reason) => {
            if (!escalationBooking) return;

            try {
              await escalateEmergencyBooking(escalationBooking.id, reason);
              alert('Escalated to emergency successfully');
              fetchBookings(); // Refresh table
            } catch (err: any) {
              alert(err.message || 'Escalation failed');
            } finally {
              setShowEmergencyModal(false);
              setEscalationBooking(null);
            }
          }}
        />
      </div>
    </div>
  );
  
}


export default Bookings;