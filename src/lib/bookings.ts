import { API_URL } from '../config'; // adjust path as needed

export async function createBooking(data: any) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
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
    throw new Error('Failed to create booking');
  }

  return response.json();
}

function buildDateTime(data: any): string {
  const time24 = convertTo24Hour(data.surgeryTime, data.surgeryAmPm);
  return `${data.surgeryDate}T${time24}:00`;
}

function buildEndTime(data: any): string {
  const start = new Date(buildDateTime(data));
  const durationMs = (data.durationHours * 60 + data.durationMinutes) * 60 * 1000;
  return new Date(start.getTime() + durationMs).toISOString().slice(0, 19);
}

function convertTo24Hour(time: string, period: string): string {
  let [hour, minute] = time.split(':').map(Number);
  if (period === 'PM' && hour < 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
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

export async function getBookings() {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/bookings`, {
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

export async function getTheaterStatus() {
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

  const data = await response.json();
  return data;
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
