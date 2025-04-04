import  { useState, useEffect } from 'react';
import { Activity,  Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { getTheaterStatus } from '../lib/bookings';

interface Theater {
  id: number;
  name: string;
  type: string;
  status: string;
  currentOperation: {
    patient: string;
    type: string;
    timeRemaining: string;
  } | null;
  nextOperation: {
    patient: string;
    type: string;
    time: string;
  } | null;
}

function Theaters() {
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTheaterStatus();
    // Set up real-time updates every minute
    const interval = setInterval(fetchTheaterStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchTheaterStatus = async () => {
    try {
      const data = await getTheaterStatus();
      setTheaters(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch theater status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Operation Theaters</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {theaters.map((theater) => (
          <div key={theater.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">{theater.name}</h3>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    theater.status === 'In Use'
                      ? 'bg-green-100 text-green-800'
                      : theater.status === 'Available'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {theater.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">{theater.type}</p>

              <div className="mt-4 space-y-3">
                {theater.currentOperation && (
                  <div className="flex items-center text-sm">
                    <Activity className="h-5 w-5 text-green-500 mr-2" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Current: {theater.currentOperation.type}
                      </p>
                      <p className="text-gray-500">
                        Patient: {theater.currentOperation.patient}
                      </p>
                      <p className="text-gray-500">
                        Time remaining: {theater.currentOperation.timeRemaining}
                      </p>
                    </div>
                  </div>
                )}

                {theater.nextOperation && (
                  <div className="flex items-center text-sm">
                    <Clock className="h-5 w-5 text-blue-500 mr-2" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Next: {theater.nextOperation.type}
                      </p>
                      <p className="text-gray-500">
                        Patient: {theater.nextOperation.patient}
                      </p>
                      <p className="text-gray-500">
                        Scheduled: {theater.nextOperation.time}
                      </p>
                    </div>
                  </div>
                )}

                {!theater.currentOperation && !theater.nextOperation && (
                  <div className="flex items-center text-sm">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                    <p className="text-gray-500">No operations scheduled</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4">
              <div className="flex justify-between text-sm">
                <button className="text-blue-600 hover:text-blue-900 font-medium">
                  View Schedule
                </button>
                <button className="text-blue-600 hover:text-blue-900 font-medium">
                  Equipment Status
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Theaters;