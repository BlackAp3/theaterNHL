import  { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, addMonths, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getScheduleBookings } from '../lib/bookings';

const timeSlots = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

interface Operation {
  id: string;
  patient_first_name: string;
  patient_last_name: string;
  operation_type: string;
  doctor: string;
  theater: string;
  start_time: string;
  end_time: string;
  status: string;
}

function Schedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const weekStart = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    fetchSchedule();
  }, [currentDate]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const startDate = weekStart;
      const endDate = addMonths(startDate, 1); // Fetch data for current week plus one month
      const data = await getScheduleBookings(startDate, endDate);
      setOperations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch schedule');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousWeek = () => {
    setCurrentDate(prev => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => addDays(prev, 7));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Weekly Schedule</h1>
        <div className="flex items-center space-x-4">
          <button 
            className="p-2 rounded-md hover:bg-gray-100"
            onClick={handlePreviousWeek}
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <span className="text-sm font-medium text-gray-600">
            {format(weekStart, 'MMMM d')} - {format(addDays(weekStart, 6), 'MMMM d, yyyy')}
          </span>
          <button 
            className="p-2 rounded-md hover:bg-gray-100"
            onClick={handleNextWeek}
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="grid grid-cols-8 border-b">
          <div className="p-4 text-sm font-medium text-gray-500">Time</div>
          {weekDays.map((day) => (
            <div
              key={day.toString()}
              className={`p-4 text-sm font-medium ${
                isSameDay(day, new Date())
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-500'
              }`}
            >
              {format(day, 'EEE d')}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-8">
  {/* Time column */}
  <div className="flex flex-col border-r">
    {timeSlots.map((hour) => (
      <div key={hour} className="h-[60px] border-b text-xs text-gray-500 pl-2">
        {hour.toString().padStart(2, '0')}:00
      </div>
    ))}
  </div>

  {/* Day columns */}
  {weekDays.map((day) => (
    <div key={day.toString()} className="relative border-r">
      {/* Time slots background */}
      {timeSlots.map((_, i) => (
        <div key={i} className="h-[60px] border-b" />
      ))}

      {/* Bookings */}
      {operations
        .filter(op => isSameDay(parseISO(op.start_time), day))
        .map(op => {
          const start = parseISO(op.start_time);
          const end = parseISO(op.end_time);
          const startHour = start.getHours();
          const startMinutes = start.getMinutes();
          const durationMinutes = (end.getTime() - start.getTime()) / 60000;

          return (
            <div
              key={op.id}
              className="absolute left-1 right-1 bg-blue-100 rounded p-2 text-xs shadow"
              style={{
                top: `${((startHour - 8) * 60 + startMinutes) * (60 / (timeSlots.length * 60))}rem`,
                height: `${durationMinutes * (60 / (timeSlots.length * 60))}rem`,
              }}
            >
              <div className="font-medium text-blue-800">{op.operation_type}</div>
              <div className="text-blue-600">{`${op.patient_first_name} ${op.patient_last_name}`}</div>
              <div className="text-blue-500">{op.theater}</div>
              <div className="text-blue-400">{op.doctor}</div>
            </div>
          );
        })}
    </div>
  ))}
</div>

      </div>
    </div>
  );
}

export default Schedule;