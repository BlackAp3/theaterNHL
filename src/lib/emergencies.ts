// lib/emergencies.ts
import { API_URL } from '../config'; // adjust path if different


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

export async function getEmergencies() {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/emergency/list`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch emergencies');
  }

  return await response.json();
}

export async function updateEmergencyBooking(id: string, data: any) {
    const token = localStorage.getItem('token');
  
    const response = await fetch(`${API_URL}/emergency/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) {
      throw new Error('Failed to update emergency booking');
    }
  
    return await response.json();
  }
  

  export async function cancelEmergencyBooking(id: string) {
    const token = localStorage.getItem('token');
  
    const response = await fetch(`${API_URL}/emergency/cancel/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  
    if (!response.ok) {
      throw new Error('Failed to cancel emergency booking');
    }
  
    return await response.json();
  }

  
  /* export async function softDeleteEmergency(id: string) {
    const token = localStorage.getItem('token');
  
    const response = await fetch(`${API_URL}/emergency/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  
    if (!response.ok) {
      throw new Error('Failed to delete emergency booking');
    }
  
    return await response.json();
  }
  */

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