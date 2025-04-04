import  { useState, useEffect } from 'react';
import { Menu, Bell, ChevronDown, Search, X } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Bookings from './components/Bookings';
import Schedule from './components/Schedule';
import Theaters from './components/Theaters';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Navigation from './components/Navigation';
import Login from './components/Login';
import UserManagement from './components/UserManagement';

type Tab = 'dashboard' | 'bookings' | 'schedule' | 'theaters' | 'reports' | 'settings' | 'users';

const notifications = [
  {
    id: 1,
    title: 'Operation Scheduled',
    message: 'New operation scheduled for Theater 1',
    time: '5 minutes ago',
    unread: true,
  },
  {
    id: 2,
    title: 'Equipment Maintenance',
    message: 'Theater 3 maintenance completed',
    time: '1 hour ago',
    unread: false,
  },
];

function App() {
  const [currentTab, setCurrentTab] = useState<Tab>('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [user, setUser] = useState<{
    id: number;
    username: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    permissions?: Record<string, any>;
    details?: Record<string, any>;
  } | null>(null);

  const [allowedTabs, setAllowedTabs] = useState<Tab[]>([]);


  // Load user info from localStorage on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
  
    if (token && storedUser) {
      setIsAuthenticated(true);
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
  
        const tabs = parsedUser.permissions?.tabs || [];
        setAllowedTabs(tabs); // ✅ Use setAllowedTabs here
  
        if (tabs.length > 0) {
          setCurrentTab(tabs[0]); // ✅ Set default tab
        }
  
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    }
  }, []);
  


  const handleLogin = () => {
    setIsAuthenticated(true);
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
  
        const tabs = parsedUser.permissions?.tabs || [];
        setAllowedTabs(tabs); // ✅ Use setAllowedTabs here too
  
        if (tabs.length > 0) {
          setCurrentTab(tabs[0]);
        }
  
      } catch (e) {
        console.error('Invalid user JSON');
      }
    }
  };
  

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'bookings':
        return <Bookings />;
      case 'schedule':
        return <Schedule />;
      case 'theaters':
        return <Theaters />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
        case 'users':
          return <UserManagement currentUser={user} />;
        
      default:
        return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm fixed w-full z-50">
        <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
            >
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div className="flex-shrink-0 flex items-center ml-4 lg:ml-0">
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Hospital Theater
              </span>
            </div>
          </div>

          <div className="flex-1 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex-1 flex">
              <div className="w-full max-w-lg lg:max-w-xs">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Search"
                    type="search"
                  />
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 relative"
              >
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" />
                {notifications.some(n => n.unread) && (
                  <div className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-400 ring-2 ring-white" />
                )}
              </button>

              <div className="ml-3 relative">
                <div>
                  <button
                    onClick={() => setShowProfile(!showProfile)}
                    className="max-w-xs flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <div className="h-9 w-9 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center text-sm font-medium">
                      {user ? user.firstName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="hidden md:flex md:items-center ml-3">
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        {user ? `${user.firstName} ${user.lastName}` : 'Unknown User'}
                      </span>
                      <ChevronDown className="ml-2 h-5 w-5 text-gray-400" />
                    </div>
                  </button>
                </div>

                {showProfile && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 focus:outline-none">
                    <a
                      href="#profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Your Profile
                    </a>
                    <a
                      href="#settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </a>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 hover:bg-gray-50 ${notification.unread ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                    <p className="text-xs text-gray-500">{notification.time}</p>
                  </div>
                  <p className="text-sm text-gray-500">{notification.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex h-screen pt-16">
      <Navigation
  currentTab={currentTab}
  setCurrentTab={setCurrentTab}
  collapsed={sidebarCollapsed}
  setCollapsed={setSidebarCollapsed}
  showMobile={showMobileMenu}
  setShowMobile={setShowMobileMenu}
  allowedTabs={allowedTabs} // ✅ new prop
/>

        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;