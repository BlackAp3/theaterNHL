import { useState } from 'react';
import { updateEmergencyBooking } from '../lib/emergencies';
import { ArrowLeft } from 'lucide-react';

interface FormData {
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
  booking: FormData;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

const operationTypes = [
  'Emergency Surgery',
  'Urgent Care',
  'Critical Procedure',
  'Immediate Treatment',
];

const doctors = [
  'Dr. Smith',
  'Dr. Johnson',
  'Dr. Williams',
  'Dr. Brown',
  'Dr. Davis',
];

const theaters = [
  'Theater 1',
  'Theater 2',
  'Theater 3',
  'Theater 4',
];

const EditEmergencyForm: React.FC<EditEmergencyFormProps> = ({ booking, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<FormData>(booking);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateEmergencyBooking(booking.id, formData);
      onSubmit(formData);
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-red-700">Patient First Name</label>
            <input
              type="text"
              name="patient_first_name"
              value={formData.patient_first_name}
              onChange={handleChange}
              className="input-field-emergency mt-1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-red-700">Patient Last Name</label>
            <input
              type="text"
              name="patient_last_name"
              value={formData.patient_last_name}
              onChange={handleChange}
              className="input-field-emergency mt-1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-red-700">Operation Type</label>
            <select
              name="operation_type"
              value={formData.operation_type}
              onChange={handleChange}
              className="input-field-emergency mt-1"
              required
            >
              <option value="">Select operation type</option>
              {operationTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-red-700">Doctor</label>
            <select
              name="doctor"
              value={formData.doctor}
              onChange={handleChange}
              className="input-field-emergency mt-1"
              required
            >
              <option value="">Select doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor} value={doctor}>
                  {doctor}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-red-700">Start Time</label>
            <input
              type="datetime-local"
              name="start_time"
              value={formData.start_time.split('.')[0]}
              onChange={handleChange}
              className="input-field-emergency mt-1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-red-700">End Time</label>
            <input
              type="datetime-local"
              name="end_time"
              value={formData.end_time.split('.')[0]}
              onChange={handleChange}
              className="input-field-emergency mt-1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-red-700">Theater</label>
            <select
              name="theater"
              value={formData.theater}
              onChange={handleChange}
              className="input-field-emergency mt-1"
              required
            >
              <option value="">Select theater</option>
              {theaters.map((theater) => (
                <option key={theater} value={theater}>
                  {theater}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
  <label className="block text-sm font-medium text-red-700">Emergency Reason</label>
  <textarea
    name="emergency_reason"
    value={formData.emergency_reason}
    onChange={handleChange}
    className="input-field-emergency mt-1"
    rows={3}
    required
  />
</div>

        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="btn-emergency-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-emergency"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Emergency Booking'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
    </div>
  );
};

export default EditEmergencyForm;
