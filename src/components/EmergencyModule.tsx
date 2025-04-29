import React, { useEffect, useState } from 'react';
import { cancelEmergencyBooking } from '../lib/bookings';
import { Badge } from './ui/badge';
import { formatTime } from '../lib/utils';
import { AlertTriangle, ChevronDown, ChevronUp, UserCircle, Stethoscope, FileText, ChevronLeft, MoreHorizontal, ChevronRight } from 'lucide-react';
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
}

export default function EmergencyModule() {
  const [emergencies, setEmergencies] = useState<EmergencyBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
                  <div className="font-medium text-gray-900">{booking.doctor}</div>
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
                <div className="font-medium text-gray-900 mt-1">{booking.emergency_reason}</div>
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

  return (
    <div className="space-y-6">
  
      {/* Priority 1: Edit Emergency Form */}
      {editingBooking ? (
        <EditEmergencyForm
          booking={editingBooking}
          onSuccess={() => {
            setEditingBooking(null);
            fetchEmergencies();
          }}
          onCancel={() => setEditingBooking(null)}
        />
      ) : showEmergencyForm ? (
        /* Priority 2: New Emergency Form */
        <NewEmergencyForm
          onSuccess={() => {
            setShowEmergencyForm(false);
            fetchEmergencies();
          }}
          onCancel={() => setShowEmergencyForm(false)}
        />
      ) : (
        <>
          {/* Priority 3: Emergency Table */}
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              Emergency Operations
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              List of escalated surgical operations requiring urgent intervention
            </p>
  
            <button
              onClick={() => setShowEmergencyForm(true)}
              className="mt-4 inline-flex items-center px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition text-sm"
            >
              ➕ New Emergency
            </button>
          </div>
  
          <div className="flex justify-between items-center my-4">
            <input
              type="text"
              placeholder="Search emergencies..."
              className="w-full md:w-1/3 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
  
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <span className="ml-2 text-gray-600">Loading emergencies...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error loading emergencies</h3>
                      <div className="mt-2 text-sm text-red-700">{error}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="w-8 px-6 py-3"></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Operation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Theater
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start - End
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {emergencies
                    .filter((booking: EmergencyBooking) =>
                      booking.patient_first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      booking.patient_last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      booking.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      booking.operation_type.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .slice((currentPage - 1) * emergenciesPerPage, currentPage * emergenciesPerPage)
                    .map((booking: EmergencyBooking) => (
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
                                <div className="h-full w-full rounded-full bg-gradient-to-r from-red-100 to-pink-100 flex items-center justify-center text-red-600 font-medium">
                                  {booking.patient_first_name[0]}{booking.patient_last_name[0]}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {booking.patient_first_name} {booking.patient_last_name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-red-700">{booking.patient_id}</td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{booking.doctor}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{booking.operation_type}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500">{booking.theater}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
                            </div>
                          </td>
                          <td className="px-6 py-4 space-x-2">
                            <Badge variant="error" size="sm" className="inline-flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" /> Emergency
                            </Badge>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancel(booking.id);
                              }}
                              className="ml-2 inline-flex items-center px-2 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700 transition"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(booking);
                              }}
                              className="ml-2 inline-flex items-center px-2 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700 transition"
                            >
                              Edit
                            </button>
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
            )}
          </div>
        </>
      )}

      <Card.Footer className="bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * emergenciesPerPage + 1} to{' '}
            {Math.min(currentPage * emergenciesPerPage, emergencies.length)} of{' '}
            {emergencies.length} entries
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
              {Array.from({ length: Math.ceil(emergencies.length / emergenciesPerPage) }, (_, i) => i + 1)
                .filter(page => {
                  const totalPages = Math.ceil(emergencies.length / emergenciesPerPage);
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
              onClick={() => setCurrentPage(p => Math.min(Math.ceil(emergencies.length / emergenciesPerPage), p + 1))}
              disabled={currentPage === Math.ceil(emergencies.length / emergenciesPerPage)}
              rightIcon={<ChevronRight className="h-4 w-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      </Card.Footer>
    </div>
  );
}
