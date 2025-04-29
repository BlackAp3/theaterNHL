import  { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay, parseISO, isToday, startOfDay, endOfDay, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock,  AlertCircle } from 'lucide-react';
import { getScheduleBookings } from '../lib/bookings';

// Generate all 24 hours
const timeSlots = Array.from({ length: 24 }, (_, i) => i);

// Operation status colors
const statusColors = {
  scheduled: 'bg-blue-100 border-blue-200 text-blue-800',
  urgent: 'bg-red-100 border-red-200 text-red-800',
  completed: 'bg-green-100 border-green-200 text-green-800',
  cancelled: 'bg-gray-100 border-gray-200 text-gray-800'
};

interface Operation {
  id: string;
  patient_first_name: string;
  patient_last_name: string;
  operation_type: string;
  doctor: string;
  theater: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'urgent' | 'completed' | 'cancelled';
  urgency_level?: string;
}

function Schedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'week' | 'day'>('week');
  const [hoveredOperation, setHoveredOperation] = useState<Operation | null>(null);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start week on Monday
  const weekDays = view === 'week' 
    ? Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    : [currentDate];

  useEffect(() => {
    fetchSchedule();
  }, [currentDate, view]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      let startDate, endDate;
      
      if (view === 'week') {
        startDate = startOfDay(weekStart);
        endDate = endOfDay(endOfWeek(weekStart));
      } else {
        startDate = startOfDay(currentDate);
        endDate = endOfDay(currentDate);
      }

      const data = await getScheduleBookings(startDate, endDate);
      setOperations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch schedule');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentDate(prev => addDays(prev, view === 'week' ? -7 : -1));
  };

  const handleNext = () => {
    setCurrentDate(prev => addDays(prev, view === 'week' ? 7 : 1));
  };

  const handleTodayClick = () => {
    setCurrentDate(new Date());
  };

  const handleViewChange = (newView: 'week' | 'day') => {
    setView(newView);
    setCurrentDate(new Date()); // Reset to today when switching views
  };

  const getOperationStyle = (operation: Operation) => {
    const baseStyle = statusColors[operation.status] || statusColors.scheduled;
    const urgentStyle = operation.urgency_level === 'urgent' ? 'border-l-4 border-l-red-500' : '';
    return `${baseStyle} ${urgentStyle}`;
  };

  const OperationTooltip = ({ operation }: { operation: Operation }) => (
    <div className="absolute z-50 w-64 p-4 bg-white rounded-lg shadow-xl border border-gray-200 transform -translate-x-1/2 -translate-y-full">
      <div className="space-y-2">
        <div className="font-medium text-gray-900">{operation.operation_type}</div>
        <div className="text-sm text-gray-600">
          <div>Patient: {operation.patient_first_name} {operation.patient_last_name}</div>
          <div>Doctor: {operation.doctor}</div>
          <div>Theater: {operation.theater}</div>
          <div>Time: {format(parseISO(operation.start_time), 'HH:mm')} - {format(parseISO(operation.end_time), 'HH:mm')}</div>
          <div className="mt-1">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[operation.status]}`}>
              {operation.status.charAt(0).toUpperCase() + operation.status.slice(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600">
        <AlertCircle className="h-6 w-6 mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  const gridCols = view === 'week' ? 'grid-cols-8' : 'grid-cols-2';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleViewChange('week')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                view === 'week' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => handleViewChange('day')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                view === 'day' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Day
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={handleTodayClick}
            className="px-3 py-1 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-md"
          >
            Today
          </button>
          <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <button 
              className="p-1 rounded-md hover:bg-gray-100"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <span className="px-2 text-sm font-medium text-gray-900">
              {view === 'week' 
                ? `${format(weekStart, 'MMM d')} - ${format(addDays(weekStart, 6), 'MMM d, yyyy')}`
                : format(currentDate, 'MMMM d, yyyy')}
            </span>
            <button 
              className="p-1 rounded-md hover:bg-gray-100"
              onClick={handleNext}
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className={`grid ${gridCols} border-b`}>
          <div className="p-4 text-sm font-medium text-gray-500 bg-gray-50">
            <Clock className="h-4 w-4 inline-block mr-1" />
            Time
          </div>
          {weekDays.map((day) => (
            <div
              key={day.toString()}
              className={`p-4 text-sm font-medium ${
                isToday(day)
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'bg-gray-50 text-gray-700'
              }`}
            >
              <div className="flex flex-col">
                <span>{format(day, 'EEE')}</span>
                <span className={`text-lg ${isToday(day) ? 'font-bold' : ''}`}>
                  {format(day, 'd')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Time Grid */}
        <div className={`grid ${gridCols} relative`}>
          {/* Time column */}
          <div className="flex flex-col border-r bg-gray-50">
            {timeSlots.map((hour) => (
              <div 
                key={hour} 
                className={`h-20 border-b text-xs font-medium ${
                  hour >= 9 && hour <= 17 ? 'bg-gray-50' : 'bg-gray-100/50'
                }`}
              >
                <span className="sticky left-0 ml-2 text-gray-500">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day) => (
            <div key={day.toString()} className="relative border-r">
              {/* Time slots background */}
              {timeSlots.map((hour) => (
                <div 
                  key={hour} 
                  className={`h-20 border-b ${
                    hour >= 9 && hour <= 17 
                      ? 'bg-white' 
                      : 'bg-gray-50'
                  }`} 
                />
              ))}

              {/* Current time indicator */}
              {isToday(day) && (
                <div 
                  className="absolute left-0 right-0 border-t-2 border-red-500 z-20"
                  style={{
                    top: `${(new Date().getHours() * 60 + new Date().getMinutes()) * (80 / 60)}px`
                  }}
                >
                  <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-red-500" />
                </div>
              )}

              
              {operations
  .filter(op => {
    const opDate = startOfDay(parseISO(op.start_time));
    const cellDate = startOfDay(day);
    const match = isSameDay(opDate, cellDate);


    console.log('🔍 OP:', op.operation_type, 'start:', opDate.toISOString(), '| cell:', cellDate.toISOString(), '| match:', match);

    return match;
  })
.map(op => {
                  const start = parseISO(op.start_time);
                  const end = parseISO(op.end_time);
                  const startHour = start.getHours();
                  const startMinutes = start.getMinutes();
                  const durationMinutes = (end.getTime() - start.getTime()) / 60000;

                  return (
                    <div
                      key={op.id}
                      className={`absolute left-1 right-1 rounded-lg border shadow-sm cursor-pointer transition-transform hover:scale-[1.02] ${getOperationStyle(op)}`}
                      style={{
                        top: `${(startHour * 60 + startMinutes) * (80 / 60)}px`,
                        height: `${durationMinutes * (80 / 60)}px`,
                        minHeight: '20px'
                      }}
                      onMouseEnter={() => setHoveredOperation(op)}
                      onMouseLeave={() => setHoveredOperation(null)}
                    >
                      <div className="p-1 overflow-hidden">
                        <div className="font-medium truncate">{op.operation_type}</div>
                        <div className="text-xs truncate">{`${op.patient_first_name} ${op.patient_last_name}`}</div>
                        <div className="text-xs truncate">{op.theater}</div>
                      </div>

                      {hoveredOperation?.id === op.id && (
                        <OperationTooltip operation={op} />
                      )}
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-6">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded ${color.split(' ')[0]}`} />
              <span className="text-sm text-gray-600">
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Schedule;