import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Clock, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { getDashboardStats } from '../lib/bookings';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

// Add styles for hiding scrollbar
const styles = `
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;  /* Chrome, Safari and Opera */
  }
`;

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalPatients: number;
    averageWaitTime: number;
    pendingReviews: number;
    completedOperations: number;
    weeklyData: Array<{ name: string; operations: number }>;
    todayOperations: Array<{
      id: string;
      patient: string;
      operation: string;
      doctor: string;
      time: string;
      status: string;
    }>;
    operationTypes: Array<{ name: string; value: number }>;
  }>({
    totalPatients: 0,
    averageWaitTime: 0,
    pendingReviews: 0,
    completedOperations: 0,
    weeklyData: [],
    todayOperations: [],
    operationTypes: []
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="h-screen overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-hide">
          <div className="space-y-6 p-8 max-w-[1400px] mx-auto">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <button
                onClick={fetchDashboardStats}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Refresh Dashboard"
              >
                <RefreshCw className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Patients"
                value={stats.totalPatients.toString()}
                icon={<Users className="h-6 w-6 text-blue-600" />}
                trend="+12% from last month"
              />
              <StatCard
                title="Average Wait Time"
                value={`${stats.averageWaitTime}min`}
                icon={<Clock className="h-6 w-6 text-green-600" />}
                trend="-8% from last month"
              />
              <StatCard
                title="Pending Reviews"
                value={stats.pendingReviews.toString()}
                icon={<AlertTriangle className="h-6 w-6 text-yellow-600" />}
                trend="+2 from yesterday"
              />
              <StatCard
                title="Completed Operations"
                value={stats.completedOperations.toString()}
                icon={<CheckCircle className="h-6 w-6 text-indigo-600" />}
                trend="+5 this week"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Operations</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="operations" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Operation Types Distribution</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.operationTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stats.operationTypes.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Operations</h2>
                <div className="overflow-x-auto">
                  <div className="min-w-full inline-block align-middle">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operation</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {stats.todayOperations.map((op) => (
                          <tr key={op.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{op.patient}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{op.operation}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{op.doctor}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{op.time}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                op.status === 'Confirmed' 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {op.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
}

function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center">
        <div className="flex-shrink-0">{icon}</div>
        <div className="ml-5">
          <h3 className="text-lg font-medium text-gray-900">{value}</h3>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-xs text-gray-400 mt-1">{trend}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;