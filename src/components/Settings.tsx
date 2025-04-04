import React, { useState } from 'react';
import { Bell, Lock, Building2,  Printer } from 'lucide-react';

function Settings() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
        <SettingsSection
          icon={<Bell className="h-5 w-5 text-gray-400" />}
          title="Notifications"
          description="Manage your notification preferences"
        >
          <div className="space-y-4">
            <SettingsToggle
              label="Email Notifications"
              description="Receive email updates about your operation schedule"
            />
            <SettingsToggle
              label="SMS Notifications"
              description="Get text messages for urgent updates"
            />
            <SettingsToggle
              label="System Notifications"
              description="In-app notifications for general updates"
            />
          </div>
        </SettingsSection>

        <SettingsSection
          icon={<Lock className="h-5 w-5 text-gray-400" />}
          title="Security"
          description="Update your security preferences"
        >
          <div className="space-y-4">
            <button className="text-sm text-blue-600 hover:text-blue-900">
              Change Password
            </button>
            <SettingsToggle
              label="Two-factor Authentication"
              description="Add an extra layer of security to your account"
            />
          </div>
        </SettingsSection>

        <SettingsSection
          icon={<Building2 className="h-5 w-5 text-gray-400" />}
          title="Theater Settings"
          description="Configure operation theater settings"
        >
          <div className="space-y-4">
            <SettingsToggle
              label="Automatic Scheduling"
              description="Enable AI-powered scheduling suggestions"
            />
            <SettingsToggle
              label="Equipment Tracking"
              description="Track theater equipment usage and maintenance"
            />
          </div>
        </SettingsSection>

        <SettingsSection
          icon={<Printer className="h-5 w-5 text-gray-400" />}
          title="Reports"
          description="Configure report generation settings"
        >
          <div className="space-y-4">
            <SettingsToggle
              label="Automatic Reports"
              description="Generate weekly performance reports"
            />
            <SettingsToggle
              label="Export to PDF"
              description="Enable PDF export for all reports"
            />
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}

interface SettingsSectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}

function SettingsSection({ icon, title, description, children }: SettingsSectionProps) {
  return (
    <div className="px-4 py-6 sm:p-6">
      <div className="flex items-center">
        {icon}
        <div className="ml-3">
          <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}

interface SettingsToggleProps {
  label: string;
  description: string;
}

function SettingsToggle({ label, description }: SettingsToggleProps) {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        type="button"
        className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
          enabled ? 'bg-indigo-600' : 'bg-gray-200'
        }`}
        role="switch"
        aria-checked={enabled}
        onClick={() => setEnabled(!enabled)}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export default Settings;