import { Fragment, useEffect, useState } from 'react';
import { cancelEmergencyBooking } from '../lib/bookings';
import { formatTime } from '../lib/utils';
import { ChevronUp,ChevronDown, UserCircle, Stethoscope, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import NewEmergencyForm from './NewEmergencyForm';
import { getEmergencies } from '../lib/emergencies';
import EditEmergencyForm from './EditEmergencyForm';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface EmergencyBooking {
  id: string;
  patient_id: string;
  patient_first_name: string;
  patient_last_name: string;
  operation_type: string;
  doctor: string;
  theater: string;
  start_time: string;
  end_time: string;
  emergency_reason: string;
  created_at: string;
  is_emergency: boolean;
  notes: string;
}

export default function EmergencyModule() {
  const [emergencies, setEmergencies] = useState<EmergencyBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBooking, setEditingBooking] = useState<EmergencyBooking | null>(null);
  const [expandedRows, setExpandedRows] = useState(new Set<string>());
  const [currentPage, setCurrentPage] = useState(1);
  const emergenciesPerPage = 10;

  const fetchEmergencies = async () => {
    try {
      const data = await getEmergencies();
      setEmergencies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load emergencies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencies();
  }, []);

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this emergency booking?')) return;

    try {
      await cancelEmergencyBooking(bookingId);
      alert('Emergency booking cancelled and original booking restored');
      fetchEmergencies(); // Refresh list
    } catch (err: any) {
      alert(err.message || 'Failed to cancel emergency booking');
    }
  };

  const handleEdit = (booking: EmergencyBooking) => {
    setEditingBooking(booking);
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

  const renderExpandedDetails = (booking: EmergencyBooking) => {
    return (
      <td colSpan={8} className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="hover">
            <Card.Header>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <UserCircle className="h-5 w-5 text-red-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Patient Details</h4>
              </div>
            </Card.Header>
            <Card.Body className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Patient ID</div>
                  <div className="font-mono text-sm text-red-700">{booking.patient_id}</div>
                </div>
                <div>
                  <div className="text-gray-500">Full Name</div>
                  <div className="font-medium text-gray-900">
                    {booking.patient_first_name} {booking.patient_last_name}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card variant="hover">
            <Card.Header>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <Stethoscope className="h-5 w-5 text-red-600" />
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
                <div className="text-gray-500">Doctor</div>
                <div className="font-medium text-gray-900 break-words max-w-full truncate sm:whitespace-normal">
                 {booking.doctor}</div> 
                 </div>
                <div>
                  <div className="text-gray-500">Theater</div>
                  <div className="font-medium text-gray-900">{booking.theater}</div>
                </div>
                <div>
                  <div className="text-gray-500">Duration</div>
                  <div className="font-medium text-gray-900">
                    {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card variant="hover">
            <Card.Header>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <FileText className="h-5 w-5 text-red-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Emergency Details</h4>
              </div>
            </Card.Header>
            <Card.Body className="space-y-4">
              <div>
                <div className="text-gray-500">Emergency Reason</div>
                <div className="font-medium text-gray-900 break-words whitespace-pre-wrap max-w-full">
  {booking.emergency_reason || '—'}
</div>
              </div>
              <div>
                <div className="text-gray-500">Created At</div>
                <div className="font-medium text-gray-900 mt-1">
                  {new Date(booking.created_at).toLocaleString()}
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </td>
    );
  };

  const paginatedEmergencies = emergencies
  .filter((booking) =>
    booking.patient_first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.patient_last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.operation_type.toLowerCase().includes(searchTerm.toLowerCase())
  )
  .slice((currentPage - 1) * emergenciesPerPage, currentPage * emergenciesPerPage);


  return (
    <div className="space-y-6">
      <div>
        <h1 className="emergency-header">Emergency Bookings</h1>
        <p className="emergency-subheader">Manage urgent and critical appointments</p>
      </div>

      <div className="emergency-card">
  <div className="emergency-card-header">
    <div className="flex justify-between items-center">
    <h2 className="text-lg font-semibold text-red-700">
  {showEmergencyForm
    ? 'New Emergency Booking'
    : editingBooking
    ? 'Edit Emergency Booking'
    : 'Quick Actions'}
</h2>

      {!showEmergencyForm && (
        <button
          onClick={() => setShowEmergencyForm(true)}
          className="btn-emergency"
        >
          New Emergency Booking
        </button>
      )}
    </div>
  </div>

  <div className="emergency-card-body">
  {showEmergencyForm ? (
    <NewEmergencyForm
      onSuccess={() => {
        setShowEmergencyForm(false);
        fetchEmergencies();
      }}
      onCancel={() => setShowEmergencyForm(false)}
    />
  ) : editingBooking ? (
    <EditEmergencyForm
      booking={editingBooking}
      onSubmit={() => {
        setEditingBooking(null);
        fetchEmergencies();
      }}
      onCancel={() => setEditingBooking(null)}
    />
  ) : (
    <>
      {/* Search + Table */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search emergency bookings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field-emergency"
        />
        <button onClick={() => fetchEmergencies()} className="btn-emergency-secondary">
          Search
        </button>
      </div>

      <div className="overflow-x-auto">
      {loading ? (
    <div className="text-center text-gray-500 py-10">Loading emergency bookings...</div>
  ) : (
        <table className="emergency-table">
          <thead>
            <tr>
              <th></th> {/* 👈 This is the new cell for chevrons */}
              <th>Patient</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {emergencies
              .filter((booking: EmergencyBooking) =>
                booking.patient_first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.patient_last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.operation_type.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .slice((currentPage - 1) * emergenciesPerPage, currentPage * emergenciesPerPage)
              .map((booking: EmergencyBooking) => (
                <Fragment key={booking.id}>
  <tr
    className="hover:bg-gray-50 cursor-pointer transition-colors"
    onClick={() => toggleRowExpansion(booking.id)}
  >
    <td className="px-4">
      {expandedRows.has(booking.id) ? (
        <ChevronUp className="h-5 w-5 text-gray-400" />
      ) : (
        <ChevronDown className="h-5 w-5 text-gray-400" />
      )}
    </td>
    <td>{booking.patient_first_name} {booking.patient_last_name}</td>
    <td>
      <span className="emergency-badge">
        {booking.is_emergency ? 'Emergency' : 'Regular'}
      </span>
    </td>
    <td>{booking.operation_type}</td>
    <td>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</td>
    <td>
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(booking);
          }}
          className="btn-emergency-secondary"
        >
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCancel(booking.id);
          }}
          className="btn-emergency-secondary"
        >
          Cancel
        </button>
      </div>
    </td>
  </tr>

  {expandedRows.has(booking.id) && (
    <tr>{renderExpandedDetails(booking)}</tr>
  )}

{paginatedEmergencies.length === 0 && !loading && (
  <tr>
    <td colSpan={6} className="text-center text-gray-500 py-6">
      No emergency bookings found.
    </td>
  </tr>
)}

</Fragment>

              ))}

          </tbody>
        </table>
          )}

        <div className="flex justify-between items-center mt-4">
  <div className="text-sm text-gray-600">
    Showing {(currentPage - 1) * emergenciesPerPage + 1} to{' '}
    {Math.min(currentPage * emergenciesPerPage, emergencies.length)} of {emergencies.length} entries
  </div>
  <div className="flex items-center gap-2">
  <Button
  size="sm"
  variant="secondary"
  onClick={() => {
    setExpandedRows(new Set()); // Collapse any expanded rows
    setCurrentPage(p => Math.max(1, p - 1));
  }}
  disabled={currentPage === 1}
>
  <ChevronLeft className="w-4 h-4" />
  Previous
</Button>

    <span className="text-sm">
      Page {currentPage} of {Math.ceil(emergencies.length / emergenciesPerPage)}
    </span>
    <Button
      size="sm"
      variant="secondary"
      onClick={() => {
        setExpandedRows(new Set());
        setCurrentPage(p => Math.min(Math.ceil(emergencies.length / emergenciesPerPage), p + 1));
      }}
      
      disabled={currentPage === Math.ceil(emergencies.length / emergenciesPerPage)}
    >
      Next
      <ChevronRight className="w-4 h-4" />
    </Button>
  </div>
</div>
  
      </div>
    </>
  )}
</div>

</div>





    </div>
  );
}
