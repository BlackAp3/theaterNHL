import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Download, Filter } from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

interface MonthlyData {
  month: string;
  operations: number;
}

interface OperationTypeData {
  name: string;
  value: number;
}

interface Metrics {
  averageOperationTime: string;
  theaterUtilization: string;
  patientSatisfaction: string;
}

function Reports() {
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [operationTypes, setOperationTypes] = useState<OperationTypeData[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    averageOperationTime: '0h 0m',
    theaterUtilization: '0%',
    patientSatisfaction: '0/5'
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const res = await fetch('http://localhost:5000/api/reports/stats', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // ✅ Add this
        },
      });
            if (!res.ok) throw new Error('Failed to load');

      const data = await res.json();
      setMonthlyData(data.monthlyData || []);
      setOperationTypes(data.operationTypes || []);
      setMetrics(data.metrics || {
        averageOperationTime: '0h 0m',
        theaterUtilization: '0%',
        patientSatisfaction: '0/5'
      });
    } catch (err) {
      console.error(err);
      setError('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading reports...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        <div className="flex space-x-4">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="h-5 w-5 mr-2 text-gray-400" />
            Filter
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm text-white bg-blue-600 hover:bg-blue-700">
            <Download className="h-5 w-5 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Operations</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
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
                  data={operationTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {operationTypes.map((_, index) => (
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <MetricCard title="Average Operation Time" value={metrics.averageOperationTime} trend="-8%" trendDirection="down" />
            <MetricCard title="Theater Utilization" value={metrics.theaterUtilization} trend="+5%" trendDirection="up" />
            <MetricCard title="Patient Satisfaction" value={metrics.patientSatisfaction} trend="+0.2" trendDirection="up" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down';
}

function MetricCard({ title, value, trend, trendDirection }: MetricCardProps) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <p className={`ml-2 text-sm font-semibold ${trendDirection === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend}
        </p>
      </div>
    </div>
  );
}

export default Reports;
