import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Building2,
  FileBarChart,
  Settings as SettingsIcon,
  Users,
  AlertTriangle
} from 'lucide-react';

type Tab = 'dashboard' | 'bookings' | 'schedule' | 'theaters' | 'reports' | 'settings' | 'users'| 'emergency';

interface NavigationProps {
  currentTab: Tab;
  setCurrentTab: (tab: Tab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  showMobile: boolean;
  setShowMobile: (show: boolean) => void;
  allowedTabs: Tab[];
}

const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  setCurrentTab,
  collapsed,
  showMobile,
  setShowMobile,
  allowedTabs
}) => {
  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'bookings', name: 'Bookings', icon: Calendar },
    { id: 'emergency', name: 'Emergency', icon: AlertTriangle },
    { id: 'schedule', name: 'Schedule', icon: Clock },
    { id: 'theaters', name: 'Theaters', icon: Building2 },
    { id: 'reports', name: 'Reports', icon: FileBarChart },
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'settings', name: 'Settings', icon: SettingsIcon },
  ];

  const handleTabClick = (tabId: Tab) => {
    setCurrentTab(tabId);
    setShowMobile(false);
  };

  return (
    <>
      {/* Mobile Navigation Backdrop */}
      {showMobile && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setShowMobile(false)}
        />
      )}

      {/* Navigation Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${showMobile ? 'translate-x-0' : '-translate-x-full'}
          ${collapsed ? 'lg:w-20' : 'lg:w-64'}
        `}
      >
        <div className="h-full bg-white shadow-sm flex flex-col">
          {/* Navigation Items */}
          <nav className="flex-1 pt-4">
            <ul className="space-y-1 px-2">
              {navigationItems
                .filter((item) => allowedTabs.includes(item.id as Tab))
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleTabClick(item.id as Tab)}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg
                          transition-colors duration-150 ease-in-out
                          ${currentTab === item.id
                            ? 'bg-gradient-to-r from-brand-50 to-accent-50 text-brand-600'
                            : 'text-gray-600 hover:bg-gray-50'}
                          ${collapsed ? 'justify-center' : 'justify-start'}
                        `}
                      >
                        <Icon className={`h-5 w-5 ${collapsed ? '' : 'mr-3'}`} />
                        {!collapsed && <span>{item.name}</span>}
                      </button>
                    </li>
                  );
                })}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Navigation;
