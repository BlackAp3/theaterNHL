import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { Download, Filter, Calendar, TrendingUp, Clock, Users, AlertTriangle, FileText, Table, ChevronDown } from 'lucide-react';
import { API_URL } from '../config';
import { format, subMonths, startOfMonth, endOfMonth, subDays, addDays } from 'date-fns';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

interface MonthlyData {
  month: string;
  operations: number;
  emergencyOps: number;
  avgDuration: number;
  cancellations: number;
  totalPatients: number;
}

interface OperationTypeData {
  name: string;
  value: number;
  trend: number;
}

interface Metrics {
  averageOperationTime: string;
  theaterUtilization: string;
  patientSatisfaction: string;
  emergencyOperations: string;
  totalOperations: string;
  averageWaitTime: string;
  totalPatients: string;
  cancellationRate: string;
  emergencyRate: string;
}

interface DateRange {
  startDate: Date;
  endDate: Date;
}

function Reports() {
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [operationTypes, setOperationTypes] = useState<OperationTypeData[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    averageOperationTime: '0h 0m',
    theaterUtilization: '0%',
    patientSatisfaction: '0/5',
    emergencyOperations: '0',
    totalOperations: '0',
    averageWaitTime: '0m',
    totalPatients: '0',
    cancellationRate: '0%',
    emergencyRate: '0%'
  });
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: startOfMonth(subMonths(new Date(), 6)),
    endDate: endOfMonth(new Date())
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_URL}/reports/stats?startDate=${dateRange.startDate.toISOString()}&endDate=${dateRange.endDate.toISOString()}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to load');

      const data = await res.json();
      setMonthlyData(data.monthlyData || []);
      setOperationTypes(data.operationTypes || []);
      setMetrics(data.metrics || {
        averageOperationTime: '0h 0m',
        theaterUtilization: '0%',
        patientSatisfaction: '0/5',
        emergencyOperations: '0',
        totalOperations: '0',
        averageWaitTime: '0m',
        totalPatients: '0',
        cancellationRate: '0%',
        emergencyRate: '0%'
      });
    } catch (err) {
      console.error(err);
      setError('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setDateRange({ startDate, endDate });
    setShowDatePicker(false);
  };

  const handleExport = async (exportFormat: 'excel' | 'pdf') => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/reports/export?startDate=${dateRange.startDate.toISOString()}&endDate=${dateRange.endDate.toISOString()}&format=${exportFormat}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!res.ok) throw new Error('Failed to export');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `theater-reports-${format(new Date(), 'yyyy-MM-dd')}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      setError('Failed to export report');
    }
  };

  const quickDateRanges = [
    {
      label: 'Last 7 Days',
      startDate: subDays(new Date(), 7),
      endDate: new Date()
    },
    {
      label: 'Last 30 Days',
      startDate: subDays(new Date(), 30),
      endDate: new Date()
    },
    {
      label: 'Last 3 Months',
      startDate: startOfMonth(subMonths(new Date(), 3)),
      endDate: endOfMonth(new Date())
    },
    {
      label: 'Last 6 Months',
      startDate: startOfMonth(subMonths(new Date(), 6)),
      endDate: endOfMonth(new Date())
    },
    {
      label: 'This Year',
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date())
    }
  ];

  if (loading) {
    return <div className="p-6">Loading reports...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <div className="flex space-x-4">
            <div className="relative">
              <button 
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                {format(dateRange.startDate, 'MMM d, yyyy')} - {format(dateRange.endDate, 'MMM d, yyyy')}
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>
              {showDatePicker && (
                <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1">
                    {quickDateRanges.map((range) => (
                      <button
                        key={range.label}
                        onClick={() => handleDateRangeChange(range.startDate, range.endDate)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="relative group">
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm text-white bg-blue-600 hover:bg-blue-700">
                <Download className="h-5 w-5 mr-2" />
                Export
              </button>
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block">
                <div className="py-1">
                  <button
                    onClick={() => handleExport('excel')}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                  >
                    <Table className="h-5 w-5 mr-2 text-gray-400" />
                    Export as Excel
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                  >
                    <FileText className="h-5 w-5 mr-2 text-gray-400" />
                    Export as PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <MetricCard 
            title="Total Patients" 
            value={metrics.totalPatients} 
            icon={<Users className="h-6 w-6 text-blue-600" />}
            trend="+12% from last month"
          />
          <MetricCard 
            title="Emergency Operations" 
            value={metrics.emergencyOperations} 
            icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
            trend="+5% from last month"
          />
          <MetricCard 
            title="Cancellation Rate" 
            value={metrics.cancellationRate} 
            icon={<AlertTriangle className="h-6 w-6 text-yellow-600" />}
            trend="-2% from last month"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Operations Trend</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="operations" stroke="#3B82F6" fill="#3B82F6" name="Total Operations" />
                <Area type="monotone" dataKey="emergencyOps" stroke="#EF4444" fill="#EF4444" name="Emergency Operations" />
                <Area type="monotone" dataKey="cancellations" stroke="#F59E0B" fill="#F59E0B" name="Cancellations" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Statistics</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="totalPatients" stroke="#3B82F6" name="Total Patients" />
                <Line type="monotone" dataKey="avgDuration" stroke="#10B981" name="Avg Duration (min)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <MetricCard 
              title="Theater Utilization" 
              value={metrics.theaterUtilization} 
              icon={<TrendingUp className="h-6 w-6 text-indigo-600" />}
              trend="+5% from last month"
            />
            <MetricCard 
              title="Patient Satisfaction" 
              value={metrics.patientSatisfaction} 
              icon={<Users className="h-6 w-6 text-green-600" />}
              trend="+0.2 from last month"
            />
            <MetricCard 
              title="Emergency Rate" 
              value={metrics.emergencyRate} 
              icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
              trend="+3% from last month"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
}

function MetricCard({ title, value, icon, trend }: MetricCardProps) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg">
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

export default Reports;
