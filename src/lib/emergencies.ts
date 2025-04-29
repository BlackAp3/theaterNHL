// lib/emergencies.ts
import { API_URL } from '../config'; // adjust path if different

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
  