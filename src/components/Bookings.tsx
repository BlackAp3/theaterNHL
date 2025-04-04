import { useState, useEffect } from 'react';
import BookingForm from './BookingForm';
import { Plus, Search, Filter, ChevronDown, Edit, Loader2 } from 'lucide-react';
import { getBookings, updateBookingStatus } from '../lib/bookings';
import { format } from 'date-fns';

const statusMap: { [key: string]: string } = {
  scheduled: 'Scheduled',
  pending: 'Pending Review',
  completed: 'Completed',
  canceled: 'Canceled'
};

const statusColors: { [key: string]: string } = {
  scheduled: 'bg-green-100 text-green-800 hover:bg-green-200',
  pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  completed: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  canceled: 'bg-red-100 text-red-800 hover:bg-red-200'
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

  const filteredBookings = bookings.filter((booking) => {
    const searchString = searchTerm.toLowerCase();
    return (
      booking.patient_first_name?.toLowerCase().includes(searchString) ||
      booking.patient_last_name?.toLowerCase().includes(searchString) ||
      booking.operation_type?.toLowerCase().includes(searchString) ||
      booking.doctor?.toLowerCase().includes(searchString)
    );
  });

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
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Operation Bookings</h1>
        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Booking
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search bookings..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors">
              <Filter className="h-5 w-5 mr-2 text-gray-400" />
              Filter
            </button>
          </div>
        </div>

        {error ? (
          <div className="p-6 text-center text-red-600 bg-red-50">
            ⚠️ {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Patient', 'Operation', 'Date', 'Time', 'Doctor', 'Theater', 'Status', 'Actions'].map((header) => (
                    <th
                      key={header}
                      className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {`${booking.patient_first_name} ${booking.patient_last_name}`}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.operation_type}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(booking.start_time), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(booking.start_time), 'h:mm a')}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.doctor}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.theater}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                        <div className="relative">
                          <select
                            value={booking.status}
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              try {
                                await updateBookingStatus(booking.id, newStatus);
                                setBookings((prev) =>
                                  prev.map((b) =>
                                    b.id === booking.id ? { ...b, status: newStatus } : b
                                  )
                                );
                              } catch (err) {
                                console.error('Failed to update status:', err);
                                alert('Failed to update status');
                              }
                            }}
                            className={`appearance-none cursor-pointer w-full px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                              statusColors[booking.status]
                            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                          >
                            {Object.keys(statusMap).map((statusKey) => (
                              <option key={statusKey} value={statusKey}>
                                {statusMap[statusKey]}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-current" />
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleEdit(booking.id)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Bookings;