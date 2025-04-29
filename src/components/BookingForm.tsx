import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Stethoscope, ClipboardCheck, Building2 } from 'lucide-react';
import { createBooking, updateBooking, getBookingById, checkBookingConflict  } from '../lib/bookings';
import Select from 'react-select';



interface FormData {
  patientId: string;
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  phoneContact: string;
  doctor: string;
  operationType: string;
  surgeryDay: string;
  surgeryMonth: string;
  surgeryYear: string;
  operationTime: string;
  operationPeriod: string;
  durationMinutes: string;
  operationRoom: string;
  anesthesiaReview: string;
  classification: string;
  urgencyLevel: string;
  diagnosis: string;
  requirements: string;
  modeOfPayment: string;
  location: string;
  status: string; // ← Add this
}

const initialFormData: FormData = {
  patientId: '',
  firstName: '',
  lastName: '',
  age: '',
  gender: '',
  phoneContact: '',
  doctor: '',
  operationType: '',
  surgeryDay: '',
  surgeryMonth: '',
  surgeryYear: new Date().getFullYear().toString(),
  operationTime: '',
  operationPeriod: 'AM',
  durationMinutes: '60',
  operationRoom: '',
  anesthesiaReview: '',
  classification: '',
  urgencyLevel: '',
  diagnosis: '',
  requirements: '',
  modeOfPayment: '',
  location: '',
  status: 'scheduled'
};

const doctorOptions = [
  { value: "Dr. Fualal Jane Odubu - General Surgeon", label: "Dr. Fualal Jane Odubu - General Surgeon" },
  { value: "Dr. Noah Masiira Mukasa - General Surgeon", label: "Dr. Noah Masiira Mukasa - General Surgeon" },
  { value: "Dr. Nelson Onira Alema - General Surgeon", label: "Dr. Nelson Onira Alema - General Surgeon" },
  { value: "Dr. Johashaphat Jombwe - General Surgeon", label: "Dr. Johashaphat Jombwe - General Surgeon" },
  { value: "Dr. Ronald Mbiine - General Surgeon", label: "Dr. Ronald Mbiine - General Surgeon" },
  { value: "Dr. Makobore Patson - General Surgeon", label: "Dr. Makobore Patson - General Surgeon" },
  { value: "Dr. Vianney Kweyamba - General,HPB,GIT&Laparascopic Surgeon", label: "Dr. Vianney Kweyamba - General,HPB,GIT&Laparascopic Surgeon" },
  { value: "Dr.Gabriel Okumu - Inhouse-General Surgeon", label: "Dr.Gabriel Okumu - Inhouse-General Surgeon" },
  { value: "Dr. Francis Lakor - Maxillofacial & Oral Surgeon", label: "Dr. Francis Lakor - Maxillofacial & Oral Surgeon" },
  { value: "Dr. Michael Bironse - Maxillofacial & Oral Surgeon", label: "Dr. Michael Bironse - Maxillofacial & Oral Surgeon" },
  { value: "Dr. Juliet Nalwanga - Neurosurgeon", label: "Dr. Juliet Nalwanga - Neurosurgeon" },
  { value: "Dr. Justin Onen - Neurosurgeon", label: "Dr. Justin Onen - Neurosurgeon" },
  { value: "Dr. Peter Ssenyonga - Neurosurgeon", label: "Dr. Peter Ssenyonga - Neurosurgeon" },
  { value: "Dr. Hussein Ssenyonjo - Neurosurgeon", label: "Dr. Hussein Ssenyonjo - Neurosurgeon" },
  { value: "Dr. Michael Edgar Muhumuza - Neurosurgeon", label: "Dr. Michael Edgar Muhumuza - Neurosurgeon" },
  { value: "Dr.Rodney Mugarura - Orthopaedic Spine Surgeon", label: "Dr.Rodney Mugarura - Orthopaedic Spine Surgeon" },
  { value: "Dr.Malagala Joseph - Orthopaedic Surgeon", label: "Dr.Malagala Joseph - Orthopaedic Surgeon" },
  { value: "Dr. Edward Kironde - Orthopaedic Surgeon", label: "Dr. Edward Kironde - Orthopaedic Surgeon" },
  { value: "Dr. Ben Mbonye - Orthopaedic Surgeon", label: "Dr. Ben Mbonye - Orthopaedic Surgeon" },
  { value: "Dr. Edward Naddumba - Orthopaedic Surgeon", label: "Dr. Edward Naddumba - Orthopaedic Surgeon" },
  { value: "Dr. Isaac Kyamanywa - Orthopaedic Surgeon", label: "Dr. Isaac Kyamanywa - Orthopaedic Surgeon" },
  { value: "Dr. Isaac Ojangor - Orthopaedic Surgeon", label: "Dr. Isaac Ojangor - Orthopaedic Surgeon" },
  { value: "Dr. Fred Mutyaba - Orthopaedic Surgeon", label: "Dr. Fred Mutyaba - Orthopaedic Surgeon" },
  { value: "Dr. Arlene Muzira Nakanwangi - Paediatric Surgeon", label: "Dr. Arlene Muzira Nakanwangi - Paediatric Surgeon" },
  { value: "Dr. Nasser Kakembo - Paediatric Surgeon", label: "Dr. Nasser Kakembo - Paediatric Surgeon" },
  { value: "Dr. John Sekabira - Paediatric Surgeon", label: "Dr. John Sekabira - Paediatric Surgeon" },
  { value: "Dr. Phyllis Kisa - Paediatric Urology Surgeon", label: "Dr. Phyllis Kisa - Paediatric Urology Surgeon" },
  { value: "Dr. George Galiwango - Plastic & Reconstructive Surgeon", label: "Dr. George Galiwango - Plastic & Reconstructive Surgeon" },
  { value: "Dr. Martin Tungotyo - Plastic & Reconstructive Surgeon", label: "Dr. Martin Tungotyo - Plastic & Reconstructive Surgeon" },
  { value: "Dr. Robert Ssentongo - Plastic & Reconstructive Surgeon", label: "Dr. Robert Ssentongo - Plastic & Reconstructive Surgeon" },
  { value: "Dr. Leonard Odoi - Urologist/General Surgeon", label: "Dr. Leonard Odoi - Urologist/General Surgeon" },
  { value: "Dr. Badru Ssekitoleko - Urologist/General Surgeon", label: "Dr. Badru Ssekitoleko - Urologist/General Surgeon" },
  { value: "Dr. Frank Asiimwe Rubabinda - Urologist/General Surgeon", label: "Dr. Frank Asiimwe Rubabinda - Urologist/General Surgeon" },
  { value: "Dr. Godfrey Nabunwa - Urology Surgeon", label: "Dr. Godfrey Nabunwa - Urology Surgeon" },
  { value: "DR. NAOMI LEAH KEKISA - Plastic & Reconstructive Surgeon", label: "DR. NAOMI LEAH KEKISA - Plastic & Reconstructive Surgeon" },
  { value: "DR. FLAVIA WERE - General Surgeon", label: "DR. FLAVIA WERE - General Surgeon" },
  { value: "DR. CORNELIUS MASAMBA - Plastic & Reconstructive Surgeon", label: "DR. CORNELIUS MASAMBA - Plastic & Reconstructive Surgeon" },
  { value: "DR. IRENE ASABA ASABA - Plastic & Reconstructive Surgeon", label: "DR. IRENE ASABA ASABA - Plastic & Reconstructive Surgeon" }
];


const operationRooms = [
  'Theater 1',
  'Theater 2',
  'Theater 3',
  'Theater 4',
];

const formSteps = [
  { id: 1, title: 'Patient Details', icon: User },
  { id: 2, title: 'Operation Details', icon: Stethoscope },
  { id: 3, title: 'Medical Assessment', icon: ClipboardCheck },
  { id: 4, title: 'Administrative', icon: Building2 },
];

interface BookingFormProps {
  onBack: () => void;
  bookingId?: string;
}

function BookingForm({ onBack, bookingId }: BookingFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (bookingId) {
      loadBooking(bookingId);
    }
  }, [bookingId]);

  const loadBooking = async (id: string) => {
    try {
      setLoading(true);
      const booking = await getBookingById(id);
  
      const start = new Date(booking.start_time);
      const end = new Date(booking.end_time);
  
      const durationMs = end.getTime() - start.getTime();
      const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
      const timeStr = start.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).split(' ')[0];
  
      const period = start.toLocaleTimeString([], {
        hour12: true
      }).split(' ')[1];
      
      const bookingTyped = booking as any; // (temporary fix, fast)

      setFormData({
        patientId: booking.patient_id,
        firstName: booking.patient_first_name,
        lastName: booking.patient_last_name,
        age: booking.age,
        gender: booking.gender,
        phoneContact: booking.phone_contact,
        doctor: booking.doctor,
        operationType: booking.operation_type,
        surgeryDay: String(start.getDate()).padStart(2, '0'),
        surgeryMonth: String(start.getMonth() + 1),
        surgeryYear: String(start.getFullYear()),
        operationTime: timeStr,
        operationPeriod: period,
        durationMinutes: String(durationMinutes),
        operationRoom: booking.theater,
        anesthesiaReview: booking.anesthesia_review,
        classification: booking.classification,
        urgencyLevel: booking.urgency_level,
        diagnosis: booking.diagnosis,
        requirements: booking.special_requirements,
        modeOfPayment: booking.mode_of_payment,
        location: booking.patient_location,
        status: bookingTyped.status || 'scheduled'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  };
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
  
    setError(null);
    setIsSubmitting(true);
  
    try {
      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - parseInt(formData.age || '0');
      const dateOfBirth = `${birthYear}-01-01`; // defaulting to Jan 1st
      const surgeryDate = `${formData.surgeryYear}-${String(formData.surgeryMonth).padStart(2, '0')}-${String(formData.surgeryDay).padStart(2, '0')}`;
  
      // ⏱️ Calculate start and end times
      let [hours, minutes] = formData.operationTime.split(':').map(Number);
      console.log('Selected time:', formData.operationTime);
      console.log('Parsed hours and minutes:', { hours, minutes });
      
      // Create date string in local timezone
      const startTimeStr = `${surgeryDate}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
      console.log('Start time string:', startTimeStr);
      
      // Create date object and convert to UTC
      const startTime = new Date(startTimeStr);
      console.log('Start time:', startTime.toISOString());
      
      const totalMinutes = parseInt(formData.durationMinutes || '0');
      console.log('Duration minutes:', totalMinutes);
      
      const endTime = new Date(startTime.getTime() + totalMinutes * 60000);
      console.log('End time:', endTime.toISOString());
      
      // Format times in 24-hour format for display
      const formattedStartTime = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      const formattedEndTime = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      console.log('Formatted times:', { formattedStartTime, formattedEndTime });
  
      // ✅ STEP: Conflict check BEFORE creating or updating booking
      try {
        await checkBookingConflict(formData.operationRoom, startTime.toISOString(), endTime.toISOString());
      } catch (conflictError) {
        setError(conflictError instanceof Error ? conflictError.message : 'Conflict check failed');
        setIsSubmitting(false);
        return;
      }
  
      // 🧠 Only proceed with booking after confirming no conflict
      const bookingData = {
        patientId: formData.patientId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth,
        gender: formData.gender,
        phoneContact: formData.phoneContact,
        operationType: formData.operationType,
        doctor: formData.doctor,
        theater: formData.operationRoom,
        surgeryDate,
        surgeryTime: formattedStartTime,
        surgeryAmPm: '24h', // Since we're using 24-hour format
        durationHours: Math.floor(parseInt(formData.durationMinutes) / 60),
        durationMinutes: parseInt(formData.durationMinutes),
        anesthesiaReview: formData.anesthesiaReview,
        classification: formData.classification,
        urgencyLevel: formData.urgencyLevel,
        diagnosis: formData.diagnosis,
        specialRequirements: formData.requirements,
        modeOfPayment: formData.modeOfPayment,
        patientLocation: formData.location,
        status: formData.status
      };
      console.log('Booking data being sent:', bookingData);
  
      if (bookingId) {
        await updateBooking(bookingId, bookingData);
      } else {
        await createBooking(bookingData);
      }
  
      setSubmitted(true);
      setTimeout(onBack, 1500);
  
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save booking');
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };
  
 
 
 
  const handleNext = () => {
    if (currentStep < formSteps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowConfirm(true);
    }
  };

  const generateOptions = (start: number, end: number) => {
    return Array.from({ length: end - start + 1 }, (_, i) => i + start).map(num => (
      <option key={num} value={num}>{String(num).padStart(2, '0')}</option>
    ));
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    return times;
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
  <label className="block text-sm font-semibold text-indigo-900">Patient ID</label>
  <input
    type="text"
    name="patientId"
    value={formData.patientId}
    onChange={handleInputChange}
    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors text-gray-800 font-medium"
    required
  />
</div>

              <div>
                <label className="block text-sm font-semibold text-indigo-900">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors text-gray-800 font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-indigo-900">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors text-gray-800 font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
              <label className="block text-sm font-semibold text-indigo-900">Age</label>
<input
  type="number"
  name="age"
  min={0}
  value={formData.age}
  onChange={handleInputChange}
  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors text-gray-800 font-medium"
  required
/>

              </div>

              <div>
                <label className="block text-sm font-semibold text-indigo-900">Gender</label>
                <div className="mt-1 flex space-x-4">
                  {['Male', 'Female'].map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, gender }))}
                      className={`flex-1 px-4 py-2 rounded-lg transition-all transform hover:scale-105 font-semibold ${
                        formData.gender === gender
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-indigo-900">Phone Contact</label>
              <input
                type="tel"
                name="phoneContact"
                value={formData.phoneContact}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors text-gray-800 font-medium"
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
  <label className="block text-sm font-semibold text-indigo-900">Doctor</label>
  <Select
    options={doctorOptions}
    value={doctorOptions.find(option => option.value === formData.doctor) || null}
    onChange={(selected) =>
      setFormData(prev => ({ ...prev, doctor: selected?.value || '' }))
    }
    isClearable
    placeholder="Search or select a doctor"
    className="mt-1 text-gray-800 font-medium"
    classNamePrefix="react-select"
  />
</div>

              <div>
                <label className="block text-sm font-semibold text-indigo-900">Operation Type</label>
                <input
                  type="text"
                  name="operationType"
                  value={formData.operationType}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors text-gray-800 font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-indigo-900">Surgery Date</label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    name="surgeryDay"
                    value={formData.surgeryDay}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors text-gray-800 font-medium"
                    required
                  >
                    <option value="">Day</option>
                    {generateOptions(1, 31)}
                  </select>
                  <select
                    name="surgeryMonth"
                    value={formData.surgeryMonth}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors text-gray-800 font-medium"
                    required
                  >
                    <option value="">Month</option>
                    {months.map((month, index) => (
                      <option key={month} value={index + 1}>{month}</option>
                    ))}
                  </select>
                  <select
                    name="surgeryYear"
                    value={formData.surgeryYear}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors text-gray-800 font-medium"
                    required
                  >
                    <option value="">Year</option>
                    {generateOptions(new Date().getFullYear(), new Date().getFullYear() + 2)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-indigo-900">Surgery Time</label>
                <div className="grid grid-cols-1 gap-2">
                  <select
                    name="operationTime"
                    value={formData.operationTime}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors text-gray-800 font-medium"
                    required
                  >
                    <option value="">Select Time</option>
                    {generateTimeOptions().map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
  <label className="block text-sm font-semibold text-indigo-900">Duration (in minutes)</label>
  <input
    type="number"
    name="durationMinutes"
    min={5}
    step={5}
    value={formData.durationMinutes}
    onChange={handleInputChange}
    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors text-gray-800 font-medium"
    required
  />
</div>


              <div>
                <label className="block text-sm font-semibold text-indigo-900">Operation Room</label>
                <select
                  name="operationRoom"
                  value={formData.operationRoom}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors text-gray-800 font-medium"
                  required
                >
                  <option value="">Select Theater</option>
                  {operationRooms.map(room => (
                    <option key={room} value={room}>{room}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-slide-up">
            <div>
              <label className="block text-sm font-semibold text-indigo-900">Anesthesia Review</label>
              <div className="mt-2 space-x-4">
                {['Yes', 'No'].map((option) => (
                  <label key={option} className="inline-flex items-center">
                    <input
                      type="radio"
                      name="anesthesiaReview"
                      value={option}
                      checked={formData.anesthesiaReview === option}
                      onChange={handleInputChange}
                      className="form-radio h-4 w-4 text-indigo-600 transition-colors"
                      required
                    />
                    <span className="ml-2 text-gray-800 font-medium">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-indigo-900">Classification</label>
                <select
                  name="classification"
                  value={formData.classification}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors text-gray-800 font-medium"
                  required
                >
                  <option value="">Select Classification</option>
                  <option value="Minor">Minor</option>
                  <option value="Major">Major</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-indigo-900">Urgency Level</label>
                <select
                  name="urgencyLevel"
                  value={formData.urgencyLevel}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors text-gray-800 font-medium"
                  required
                >
                  <option value="">Select Urgency Level</option>
                  <option value="elective">Elective</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-indigo-900">Diagnosis</label>
              <textarea
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors text-gray-800 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-indigo-900">Special Requirements</label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors text-gray-800 font-medium"
                required
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-indigo-900">Mode of Payment</label>
                <select
                  name="modeOfPayment"
                  value={formData.modeOfPayment}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors text-gray-800 font-medium"
                  required
                >
                  <option value="">Select Payment Mode</option>
                  <option value="cash">Cash</option>
                  <option value="insurance">Insurance</option>
                  <option value="credit">Credit</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-indigo-900">Patient's Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors text-gray-800 font-medium"
                  required
                />
              </div>

              
            </div>

            {showConfirm && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Confirm Operation Details</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p>Patient: {formData.firstName} {formData.lastName}</p>
                  <p>Operation: {formData.operationType}</p>
                  <p>Doctor: {formData.doctor}</p>
                  <p>Date: {formData.surgeryMonth}/{formData.surgeryDay}/{formData.surgeryYear}</p>
                  <p>Time: {formData.operationTime} {formData.operationPeriod}</p>
                  <p>Theater: {formData.operationRoom}</p>
                </div>
              </div>
            )}
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
          onClick={onBack}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-900 transition-colors font-medium"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Bookings
        </button>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {bookingId ? 'Edit Operation' : 'Schedule New Operation'}
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
                      ? 'text-indigo-600'
                      : currentStep > step.id
                      ? 'text-green-600'
                      : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all transform hover:scale-105 ${
                      currentStep === step.id
                        ? 'bg-gradient-to-r from-indigo-100 to-purple-100'
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
        <div className="p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-white">
          {renderStepContent()}
        </div>

        <div className="px-8 py-4 bg-gradient-to-r from-gray-50 to-indigo-50 flex justify-between items-center">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-6 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-900 transition-colors"
            >
              Previous
            </button>
          )}
          {currentStep < formSteps.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="ml-auto px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105 font-semibold shadow-md"
            >
              Next
            </button>
          ) : (
            <div className="ml-auto space-x-3">
              {showConfirm ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowConfirm(false)}
                    className="px-6 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105 font-semibold shadow-md ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {bookingId ? 'Updating...' : 'Scheduling...'}
                      </span>
                    ) : (
                      'Confirm'
                    )}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirm(true)}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105 font-semibold shadow-md"
                >
                  Review & Submit
                </button>
              )}
            </div>
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
          {bookingId ? 'Operation updated successfully!' : 'Operation scheduled successfully!'}
        </div>
      )}
    </div>
  );
}

export default BookingForm;