import { API_URL } from '../config'; // adjust path as needed
import { format, parseISO } from 'date-fns';

interface BookingData {
  patientId: string;
  firstName: string;
  lastName: string;
  operationType: string;
  doctor: string;
  theater?: string;
  operationRoom?: string;
  surgeryDate: string;
  surgeryTime: string;
  surgeryAmPm: string;
  durationHours: number;
  durationMinutes: number;
  status?: string;
  dateOfBirth: string;
  gender: string;
  phoneContact: string;
  anesthesiaReview: string;
  classification: string;
  urgencyLevel: string;
  diagnosis: string;
  specialRequirements: string;
  modeOfPayment: string;
  patientLocation?: string;
  location?: string;
}

interface EmergencyBookingData {
  patient_id: string;
  patient_first_name: string;
  patient_last_name: string;
  doctor: string;
  theater: string;
  operation_type: string;
  start_time: string;
  end_time: string;
  emergency_reason: string;
  date_of_birth: string;
  gender: string;
  phone_contact: string;
  anesthesia_review: string;
  classification?: string;
  urgency_level?: string;
  diagnosis: string;
  special_requirements: string;
  mode_of_payment: string;
  patient_location: string;
}

// WebSocket connection
let ws: WebSocket | null = null;
let wsReconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export function initializeWebSocket(onUpdate: (data: any) => void) {
  if (ws) return;

  const wsUrl = API_URL.replace('http', 'ws') + '/ws/theaters';
  ws = new WebSocket(wsUrl);

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onUpdate(data);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };

  ws.onclose = () => {
    ws = null;
    if (wsReconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      wsReconnectAttempts++;
      setTimeout(() => initializeWebSocket(onUpdate), 1000 * Math.pow(2, wsReconnectAttempts));
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
}

export function closeWebSocket() {
  if (ws) {
    ws.close();
    ws = null;
  }
}

// Enhanced theater status types
export type TheaterStatus = 
  | 'Available'
  | 'In Use'
  | 'Maintenance'
  | 'Emergency'
  | 'Cleaning'
  | 'Setup';

export interface TheaterStats {
  utilizationRate: number;
  averageOperationTime: number;
  totalOperations: number;
  emergencyOperations: number;
}

export interface EquipmentStatus {
  id: string;
  name: string;
  status: 'Operational' | 'Maintenance' | 'In Use' | 'Offline';
  lastMaintenance: string;
  nextMaintenance: string;
}

export interface Theater {
  id: number;
  name: string;
  type: string;
  status: TheaterStatus;
  currentOperation: {
    patient: string;
    type: string;
    timeRemaining: string;
    doctor: string;
    startTime: string;
    isEmergency: boolean;
    equipment: EquipmentStatus[];
  } | null;
  nextOperation: {
    patient: string;
    type: string;
    time: string;
    doctor: string;
    startTime: string;
    isEmergency: boolean;
    equipment: EquipmentStatus[];
  } | null;
  stats: TheaterStats;
  equipment: EquipmentStatus[];
}

export async function createBooking(data: BookingData) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication token not found');
  }

  try {
    const response = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        patient_id: data.patientId,
        patient_first_name: data.firstName,
        patient_last_name: data.lastName,
        operation_type: data.operationType,
        doctor: data.doctor,
        theater: data.theater || data.operationRoom,
        start_time: buildDateTime(data),
        end_time: buildEndTime(data),
        status: 'scheduled',
        date_of_birth: data.dateOfBirth,
        gender: data.gender,
        phone_contact: data.phoneContact,
        anesthesia_review: data.anesthesiaReview,
        classification: data.classification,
        urgency_level: data.urgencyLevel,
        diagnosis: data.diagnosis,
        special_requirements: data.specialRequirements,
        mode_of_payment: data.modeOfPayment,
        patient_location: data.patientLocation || data.location
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create booking');
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create booking: ${error.message}`);
    }
    throw error;
  }
}

function buildDateTime(data: any): string {
  console.log('buildDateTime input:', data);
  const dateTime = `${data.surgeryDate}T${data.surgeryTime}:00`;
  console.log('buildDateTime output:', dateTime);
  return dateTime;
}

function buildEndTime(data: any): string {
  console.log('buildEndTime input:', data);
  const start = new Date(buildDateTime(data));
  const tzOffset = new Date().getTimezoneOffset();
  console.log('Timezone offset in minutes:', tzOffset);
  start.setMinutes(start.getMinutes() - tzOffset);
  console.log('Start time in buildEndTime:', start.toISOString());
  const durationMs = (data.durationHours * 60 + data.durationMinutes) * 60 * 1000;
  console.log('Duration in milliseconds:', durationMs);
  const endTime = new Date(start.getTime() + durationMs);
  console.log('End time in buildEndTime:', endTime.toISOString());
  return endTime.toISOString().slice(0, 19);
}

export async function getBookingById(id: string) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/bookings/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch booking');
  }

  return await response.json();
}

export async function updateBooking(id: string, data: any) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/bookings/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      patient_id: data.patientId,
      patient_first_name: data.firstName,
      patient_last_name: data.lastName,
      operation_type: data.operationType,
      doctor: data.doctor,
      theater: data.theater || data.operationRoom,
      start_time: buildDateTime(data),
      end_time: buildEndTime(data),
      status: data.status,
      date_of_birth: data.dateOfBirth,
      gender: data.gender,
      phone_contact: data.phoneContact,
      anesthesia_review: data.anesthesiaReview,
      classification: data.classification,
      urgency_level: data.urgencyLevel,
      diagnosis: data.diagnosis,
      special_requirements: data.specialRequirements,
      mode_of_payment: data.modeOfPayment,
      patient_location: data.patientLocation || data.location,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to update booking');
  }

  return await response.json();
}

export async function getBookings(onlyEmergencies = false) {
  const token = localStorage.getItem('token');

  let url = `${API_URL}/bookings`;
  if (onlyEmergencies) {
    url += '?isEmergency=true';  // 🧠 Match backend query param
  }

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch bookings');
  }

  return await response.json();
}

export async function getTheaterStatus(): Promise<Theater[]> {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/bookings`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch theater status');
  }

  const bookings = await response.json();
  
  // Get unique theaters from the bookings
  const theaters: Theater[] = Array.from(new Set(bookings.map((b: any) => b.theater)))
    .filter((theater): theater is string => Boolean(theater))
    .map((theater, index) => ({
      id: index + 1,
      name: theater,
      type: getTheaterType(theater),
      status: 'Available' as TheaterStatus,
      currentOperation: null,
      nextOperation: null,
      stats: {
        utilizationRate: 0,
        averageOperationTime: 0,
        totalOperations: 0,
        emergencyOperations: 0
      },
      equipment: []
    }));

  // Process bookings for each theater
  theaters.forEach(theater => {
    const theaterBookings = bookings
      .filter((b: any) => b.theater === theater.name)
      .sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    const now = new Date();
    const currentBooking = theaterBookings.find((b: any) => {
      const startTime = new Date(b.start_time);
      const endTime = new Date(b.end_time);
      return startTime <= now && endTime >= now;
    });

    const nextBooking = theaterBookings.find((b: any) => {
      const startTime = new Date(b.start_time);
      return startTime > now;
    });

    // Calculate theater statistics
    const completedBookings = theaterBookings.filter((b: any) => 
      new Date(b.end_time) < now
    );
    
    const emergencyBookings = theaterBookings.filter((b: any) => 
      b.is_emergency
    );

    const totalDuration = completedBookings.reduce((acc: number, b: any) => {
      const start = new Date(b.start_time);
      const end = new Date(b.end_time);
      return acc + (end.getTime() - start.getTime());
    }, 0);

    theater.stats = {
      utilizationRate: completedBookings.length > 0 
        ? (completedBookings.length / theaterBookings.length) * 100 
        : 0,
      averageOperationTime: completedBookings.length > 0 
        ? totalDuration / (completedBookings.length * 60 * 1000) // in minutes
        : 0,
      totalOperations: completedBookings.length,
      emergencyOperations: emergencyBookings.length
    };

    if (currentBooking) {
      theater.status = currentBooking.is_emergency ? 'Emergency' : 'In Use';
      theater.currentOperation = {
        patient: `${currentBooking.patient_first_name} ${currentBooking.patient_last_name}`,
        type: currentBooking.operation_type,
        timeRemaining: calculateTimeRemaining(new Date(currentBooking.end_time)),
        doctor: currentBooking.doctor,
        startTime: currentBooking.start_time,
        isEmergency: currentBooking.is_emergency,
        equipment: currentBooking.equipment || []
      };
    }

    if (nextBooking) {
      theater.nextOperation = {
        patient: `${nextBooking.patient_first_name} ${nextBooking.patient_last_name}`,
        type: nextBooking.operation_type,
        time: format(parseISO(nextBooking.start_time), 'h:mm a'),
        doctor: nextBooking.doctor,
        startTime: nextBooking.start_time,
        isEmergency: nextBooking.is_emergency,
        equipment: nextBooking.equipment || []
      };
    }

    // Fetch equipment status
    fetchEquipmentStatus(theater.id).then(equipment => {
      theater.equipment = equipment;
    });
  });

  return theaters;
}

async function fetchEquipmentStatus(theaterId: number): Promise<EquipmentStatus[]> {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`${API_URL}/theaters/${theaterId}/equipment`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch equipment status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching equipment status:', error);
    return [];
  }
}

function getTheaterType(theaterName: string): string {
  // You can implement this based on your theater naming convention
  const typeMap: { [key: string]: string } = {
    'Theater 1': 'General Surgery',
    'Theater 2': 'Orthopedics',
    'Theater 3': 'Cardiac',
    'Theater 4': 'Neurosurgery'
  };
  return typeMap[theaterName] || 'General';
}

function calculateTimeRemaining(endTime: Date): string {
  const now = new Date();
  const diff = endTime.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

export async function updateBookingStatus(id: string, status: string) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/bookings/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error('Failed to update booking status');
  }

  return await response.json();
}

export async function checkBookingConflict(theater: string, start_time: string, end_time: string) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/bookings/conflicts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ theater, start_time, end_time })
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Conflict detected');
  }

  return await response.json();
}

export async function getScheduleBookings(start: Date, end: Date) {
  const token = localStorage.getItem('token');

  const response = await fetch(
    `${API_URL}/bookings/schedule?start=${start.toISOString()}&end=${end.toISOString()}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch schedule');
  }

  return await response.json();
}

export async function getDashboardStats() {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_URL}/bookings/dashboard/stats`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
}

export const getMonthlyReports = async () => {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_URL}/bookings/reports/monthly`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch monthly reports');
  }

  return res.json();
};

export const getOperationTypes = async () => {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_URL}/bookings/reports/types`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch operation types');
  }

  return res.json();
};

export async function escalateEmergencyBooking(bookingId: string, reason: string) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/emergency/escalate/${bookingId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to escalate emergency booking');
  }

  return data;
}

export async function cancelEmergencyBooking(id: string) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/emergency/cancel/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to cancel emergency booking');
  }

  return data;
}

export async function createEmergencyBooking(data: EmergencyBookingData) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication token not found');
  }

  try {
    const response = await fetch(`${API_URL}/emergency`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || 'Failed to create emergency booking');
    }

    return responseData;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create emergency booking: ${error.message}`);
    }
    throw error;
  }
}

