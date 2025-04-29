import { useState } from 'react';
import { updateEmergencyBooking } from '../lib/emergencies';
import { ArrowLeft } from 'lucide-react';

interface EmergencyBooking {
  id: string;
  patient_first_name: string;
  patient_last_name: string;
  patient_id: string;
  doctor: string;
  theater: string;
  operation_type: string;
  start_time: string;
  end_time: string;
  emergency_reason: string;
}

interface EditEmergencyFormProps {
  booking: EmergencyBooking;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditEmergencyForm({ booking, onSuccess, onCancel }: EditEmergencyFormProps) {
  const [formData, setFormData] = useState({
    patient_first_name: booking.patient_first_name || '',
    patient_last_name: booking.patient_last_name || '',
    patient_id: booking.patient_id || '',
    doctor: booking.doctor || '',
    theater: booking.theater || '',
    operation_type: booking.operation_type || '',
    start_time: booking.start_time || '',
    end_time: booking.end_time || '',
    emergency_reason: booking.emergency_reason || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateEmergencyBooking(booking.id, formData);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to update emergency');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onCancel}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-900 transition-colors font-medium"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Emergencies
        </button>
        <h1 className="text-2xl font-bold text-indigo-900">
          Edit Emergency Booking
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-white">
          <div className="space-y-6">
            {/* Patient Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                name="patient_first_name"
                label="Patient First Name"
                value={formData.patient_first_name}
                onChange={handleChange}
                required
              />
              <Input
                name="patient_last_name"
                label="Patient Last Name"
                value={formData.patient_last_name}
                onChange={handleChange}
                required
              />
              <Input
                name="patient_id"
                label="Patient ID"
                value={formData.patient_id}
                onChange={handleChange}
                required
              />
            </div>

            {/* Operation Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                name="doctor"
                label="Doctor"
                value={formData.doctor}
                onChange={handleChange}
                required
              />
              <Input
                name="theater"
                label="Theater"
                value={formData.theater}
                onChange={handleChange}
                required
              />
              <Input
                name="operation_type"
                label="Operation Type"
                value={formData.operation_type}
                onChange={handleChange}
                required
              />
            </div>

            {/* Time Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                name="start_time"
                label="Start Time"
                value={formData.start_time}
                onChange={handleChange}
                type="datetime-local"
                required
              />
              <Input
                name="end_time"
                label="End Time"
                value={formData.end_time}
                onChange={handleChange}
                type="datetime-local"
                required
              />
            </div>

            {/* Emergency Reason */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-indigo-900">Emergency Reason *</label>
              <textarea
                name="emergency_reason"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors text-gray-800 font-medium resize-none h-36"
                value={formData.emergency_reason}
                onChange={handleChange}
                required
                placeholder="Describe the emergency situation and reason for immediate operation..."
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm font-medium">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="px-8 py-4 bg-gradient-to-r from-gray-50 to-indigo-50 flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Helper input component
function Input({
  name,
  label,
  value,
  onChange,
  type = 'text',
  required = false,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-semibold text-indigo-900">{label}</label>
      <input
        type={type}
        name={name}
        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors text-gray-800 font-medium"
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
}
