import { useState, useEffect } from 'react';
import { Activity, Clock, AlertTriangle, Calendar, User, X } from 'lucide-react';
import { getTheaterStatus, initializeWebSocket, closeWebSocket, Theater, TheaterStatus } from '../lib/bookings';
import { format } from 'date-fns';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

function Theaters() {
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedTheater, setSelectedTheater] = useState<Theater | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);

  useEffect(() => {
    fetchTheaterStatus();
    initializeWebSocket((data) => {
      setTheaters(prevTheaters => {
        const updatedTheaters = [...prevTheaters];
        const theaterIndex = updatedTheaters.findIndex(t => t.id === data.theaterId);
        if (theaterIndex !== -1) {
          updatedTheaters[theaterIndex] = { ...updatedTheaters[theaterIndex], ...data };
        }
        return updatedTheaters;
      });
    });

    return () => {
      closeWebSocket();
    };
  }, []);

  const fetchTheaterStatus = async () => {
    try {
      const data = await getTheaterStatus();
      setTheaters(data);
      setError(null);
      setRetryCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch theater status');
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchTheaterStatus();
        }, Math.min(1000 * Math.pow(2, retryCount), 10000));
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: TheaterStatus) => {
    switch (status.toLowerCase()) {
      case 'in use':
        return 'bg-green-100 text-green-800';
      case 'available':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'emergency':
        return 'bg-red-100 text-red-800';
      case 'cleaning':
        return 'bg-purple-100 text-purple-800';
      case 'setup':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderEquipmentStatus = (equipment: Theater['equipment']) => {
    if (!equipment.length) return null;
    
    return (
      <div className="mt-4 space-y-2">
        <h4 className="text-sm font-medium text-gray-900">Equipment Status</h4>
        <div className="space-y-1">
          {equipment.map(item => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{item.name}</span>
              <Badge className={getEquipmentStatusColor(item.status)}>
                {item.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getEquipmentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'operational':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'in use':
        return 'bg-blue-100 text-blue-800';
      case 'offline':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderTheaterStats = (stats: Theater['stats']) => (
    <div className="mt-4 space-y-2">
      <h4 className="text-sm font-medium text-gray-900">Theater Statistics</h4>
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Utilization Rate</span>
            <span className="text-gray-900">{stats.utilizationRate.toFixed(1)}%</span>
          </div>
          <Progress value={stats.utilizationRate} className="h-2" />
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">Avg. Operation Time</span>
            <p className="text-gray-900">{stats.averageOperationTime.toFixed(1)} min</p>
          </div>
          <div>
            <span className="text-gray-600">Total Operations</span>
            <p className="text-gray-900">{stats.totalOperations}</p>
          </div>
          <div>
            <span className="text-gray-600">Emergency Ops</span>
            <p className="text-gray-900">{stats.emergencyOperations}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderScheduleModal = () => {
    if (!selectedTheater) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedTheater.name}</h2>
                <p className="text-gray-500">{selectedTheater.type}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSchedule(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Operation Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Current Operation</h3>
                {selectedTheater.currentOperation ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(selectedTheater.status)}>
                        {selectedTheater.status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {selectedTheater.currentOperation.timeRemaining} remaining
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedTheater.currentOperation.type}</p>
                      <p className="text-sm text-gray-500">Patient: {selectedTheater.currentOperation.patient}</p>
                      <p className="text-sm text-gray-500">Doctor: {selectedTheater.currentOperation.doctor}</p>
                      <p className="text-sm text-gray-500">
                        Started: {format(new Date(selectedTheater.currentOperation.startTime), 'h:mm a')}
                      </p>
                    </div>
                    {selectedTheater.currentOperation.isEmergency && (
                      <div className="bg-red-50 text-red-700 p-2 rounded">
                        🚨 Emergency Operation
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No current operation</p>
                )}
              </div>

              {/* Next Operation Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Next Operation</h3>
                {selectedTheater.nextOperation ? (
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium text-gray-900">{selectedTheater.nextOperation.type}</p>
                      <p className="text-sm text-gray-500">Patient: {selectedTheater.nextOperation.patient}</p>
                      <p className="text-sm text-gray-500">Doctor: {selectedTheater.nextOperation.doctor}</p>
                      <p className="text-sm text-gray-500">Scheduled: {selectedTheater.nextOperation.time}</p>
                    </div>
                    {selectedTheater.nextOperation.isEmergency && (
                      <div className="bg-red-50 text-red-700 p-2 rounded">
                        🚨 Emergency Operation
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No upcoming operations</p>
                )}
              </div>

              {/* Equipment Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Equipment Status</h3>
                {selectedTheater.equipment.length > 0 ? (
                  <div className="space-y-2">
                    {selectedTheater.equipment.map(item => (
                      <div key={item.id} className="flex items-center justify-between">
                        <span className="text-gray-600">{item.name}</span>
                        <Badge className={getEquipmentStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No equipment information available</p>
                )}
              </div>

              {/* Theater Statistics */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Theater Statistics</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Utilization Rate</span>
                      <span className="text-gray-900">{selectedTheater.stats.utilizationRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={selectedTheater.stats.utilizationRate} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Average Operation Time</p>
                      <p className="text-lg font-medium">{selectedTheater.stats.averageOperationTime.toFixed(1)} min</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Operations</p>
                      <p className="text-lg font-medium">{selectedTheater.stats.totalOperations}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Emergency Operations</p>
                      <p className="text-lg font-medium">{selectedTheater.stats.emergencyOperations}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Operation Theaters</h1>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <div className="text-red-600 mb-4">{error}</div>
        <Button 
          onClick={fetchTheaterStatus}
          variant="outline"
          className="text-blue-600 hover:text-blue-900"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Operation Theaters</h1>
        <Button 
          onClick={fetchTheaterStatus}
          variant="outline"
          size="sm"
          className="text-blue-600 hover:text-blue-900"
        >
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {theaters.map((theater) => (
          <div 
            key={theater.id} 
            className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedTheater(theater)}
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{theater.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{theater.type}</p>
                </div>
                <Badge className={getStatusColor(theater.status)}>
                  {theater.status}
                </Badge>
              </div>

              <div className="mt-4 space-y-4">
                {theater.currentOperation && (
                  <div className="flex items-start space-x-3">
                    <Activity className="h-5 w-5 text-green-500 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">
                          Current Operation
                          {theater.currentOperation.isEmergency && (
                            <span className="ml-2 text-red-600">🚨 Emergency</span>
                          )}
                        </p>
                        <span className="text-sm text-gray-500">
                          {theater.currentOperation.timeRemaining} remaining
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {theater.currentOperation.type}
                      </p>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-1" />
                        <span>{theater.currentOperation.patient}</span>
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Started: {format(new Date(theater.currentOperation.startTime), 'h:mm a')}</span>
                      </div>
                    </div>
                  </div>
                )}

                {theater.nextOperation && (
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-blue-500 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">
                          Next Operation
                          {theater.nextOperation.isEmergency && (
                            <span className="ml-2 text-red-600">🚨 Emergency</span>
                          )}
                        </p>
                        <span className="text-sm text-gray-500">
                          {theater.nextOperation.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {theater.nextOperation.type}
                      </p>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-1" />
                        <span>{theater.nextOperation.patient}</span>
                      </div>
                    </div>
                  </div>
                )}

                {!theater.currentOperation && !theater.nextOperation && (
                  <div className="flex items-center text-sm text-gray-500">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                    <p>No operations scheduled</p>
                  </div>
                )}

                {renderEquipmentStatus(theater.equipment)}
                {renderTheaterStats(theater.stats)}
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4">
              <div className="flex justify-between text-sm">
                <Button 
                  variant="ghost" 
                  className="text-blue-600 hover:text-blue-900"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTheater(theater);
                    setShowSchedule(true);
                  }}
                >
                  View Schedule
                </Button>
                <Button 
                  variant="ghost"
                  className="text-blue-600 hover:text-blue-900"
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Implement equipment status
                  }}
                >
                  Equipment Status
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showSchedule && renderScheduleModal()}
    </div>
  );
}

export default Theaters;