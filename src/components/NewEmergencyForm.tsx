import { useState, useEffect } from 'react';
import { createEmergencyBooking } from '../lib/emergencies';
import Select from 'react-select';
import { API_URL } from '../config';
import { ArrowLeft, User, Stethoscope, ClipboardCheck } from 'lucide-react';

interface NewEmergencyFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface Options {
  theaters: string[];
  doctors: { value: string; label: string }[];
}

const formSteps = [
  { id: 1, title: 'Patient Info', icon: User },
  { id: 2, title: 'Operation Details', icon: Stethoscope },
  { id: 3, title: 'Emergency Details', icon: ClipboardCheck },
];

export default function NewEmergencyForm({ onSuccess, onCancel }: NewEmergencyFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [patientFirstName, setPatientFirstName] = useState('');
  const [patientLastName, setPatientLastName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [doctor, setDoctor] = useState('');
  const [theater, setTheater] = useState('');
  const [operationType, setOperationType] = useState('');
  const [emergencyReason, setEmergencyReason] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<Options | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/emergency/options`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch options');
        const data = await response.json();
        setOptions(data);
      } catch (error) {
        console.error('Error fetching options:', error);
        setError('Failed to load form options');
      }
    };
    fetchOptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

      await createEmergencyBooking({
        patient_id: patientId,
        patient_first_name: patientFirstName,
        patient_last_name: patientLastName,
        doctor,
        theater,
        operation_type: operationType,
        start_time: now.toISOString(),
        end_time: oneHourLater.toISOString(),
        emergency_reason: emergencyReason,
        gender,
        // Set default values for non-critical fields
        date_of_birth: '',
        phone_contact: '',
        special_requirements: '',
        mode_of_payment: 'Emergency - To be billed',
        patient_location: 'Emergency Room',
        anesthesia_review: 'Yes', // Default to Yes for emergencies
        diagnosis: emergencyReason // Use emergency reason as diagnosis
      });

      setSubmitted(true);
      setTimeout(onSuccess, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create emergency booking');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < formSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Patient ID" value={patientId} setValue={setPatientId} required />
              <Input label="Patient First Name" value={patientFirstName} setValue={setPatientFirstName} required />
              <Input label="Patient Last Name" value={patientLastName} setValue={setPatientLastName} required />
              <div>
                <label className="block text-sm font-semibold text-indigo-900">Gender</label>
                <div className="mt-2 flex space-x-4">
                  {['Male', 'Female'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`flex-1 px-4 py-2 rounded-lg transition-all transform hover:scale-105 font-semibold ${
                        gender === g
                          ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-indigo-900">Doctor *</label>
                <Select
                  options={options?.doctors}
                  value={options?.doctors.find(d => d.value === doctor)}
                  onChange={(option) => setDoctor(option?.value || '')}
                  className="mt-1 text-gray-800 font-medium"
                  classNamePrefix="react-select"
                  isSearchable
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-indigo-900">Theater *</label>
                <Select
                  options={options?.theaters.map(t => ({ value: t, label: t }))}
                  value={options?.theaters.find(t => t === theater) ? { value: theater, label: theater } : null}
                  onChange={(option) => setTheater(option?.value || '')}
                  className="mt-1 text-gray-800 font-medium"
                  classNamePrefix="react-select"
                  required
                />
              </div>

              <Input label="Operation Type" value={operationType} setValue={setOperationType} required />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-slide-up">
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-indigo-900">Emergency Reason *</label>
              <textarea
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-colors text-gray-800 font-medium resize-none h-36"
                value={emergencyReason}
                onChange={(e) => setEmergencyReason(e.target.value)}
                required
                placeholder="Describe the emergency situation and reason for immediate operation..."
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onCancel}
          className="inline-flex items-center text-red-600 hover:text-red-900 transition-colors font-medium"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Emergencies
        </button>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
          New Emergency Operation
        </h1>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center">
          {formSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`flex-1 ${index !== formSteps.length - 1 ? 'relative' : ''}`}
              >
                <div
                  className={`flex flex-col items-center ${
                    currentStep === step.id
                      ? 'text-red-600'
                      : currentStep > step.id
                      ? 'text-green-600'
                      : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all transform hover:scale-105 ${
                      currentStep === step.id
                        ? 'bg-gradient-to-r from-red-100 to-pink-100'
                        : currentStep > step.id
                        ? 'bg-green-100'
                        : 'bg-gray-100'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold">{step.title}</span>
                </div>
                {index !== formSteps.length - 1 && (
                  <div
                    className={`absolute top-6 left-1/2 w-full h-0.5 transition-colors ${
                      currentStep > step.id ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8 bg-gradient-to-br from-red-50 via-pink-50 to-white">
          {renderStepContent()}
        </div>

        <div className="px-8 py-4 bg-gradient-to-r from-gray-50 to-red-50 flex justify-between items-center">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-6 py-2 text-sm font-semibold text-red-600 hover:text-red-900 transition-colors"
            >
              Previous
            </button>
          )}
          {currentStep < formSteps.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="ml-auto px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all transform hover:scale-105 font-semibold shadow-md"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className={`ml-auto px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all transform hover:scale-105 font-semibold shadow-md ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Emergency...
                </span>
              ) : (
                'Create Emergency'
              )}
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="fixed bottom-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slide-up font-medium">
          {error}
        </div>
      )}

      {submitted && (
        <div className="fixed bottom-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slide-up font-medium">
          Emergency operation created successfully!
        </div>
      )}
    </div>
  );
}

function Input({
  label,
  value,
  setValue,
  required = false,
  type = 'text',
}: {
  label: string;
  value: string;
  setValue: (val: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-semibold text-indigo-900">{label}</label>
      <input
        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-colors text-gray-800 font-medium"
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required={required}
      />
    </div>
  );
}
