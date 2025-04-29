import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

interface EmergencyEscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  patientName: string;
}

const EmergencyEscalationModal: React.FC<EmergencyEscalationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  patientName,
}) => {
  const [reason, setReason] = useState('');

  const handleEscalate = () => {
    if (reason.trim()) {
      onSubmit(reason.trim());
      setReason('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Escalate Operation for {patientName}
          </h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>
        <div className="mb-4">
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Emergency
          </label>
          <textarea
            id="reason"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            placeholder="Explain why this operation is being escalated..."
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleEscalate} disabled={!reason.trim()}>
            Escalate 🚨
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyEscalationModal;
