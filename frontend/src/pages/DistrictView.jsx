import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
  Legend, CartesianGrid, RadialBarChart, RadialBar
} from "recharts";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { transformDistrictData, calculateMonthlyTrends, generateInsights } from '../utils/dataTransformers';

// Header Component
const Header = ({ t, onBack }) => (
  <header className="bg-gradient-to-r from-indigo-800 via-blue-700 to-indigo-900 text-white py-5 px-8 shadow-lg flex justify-between items-center">
    <div className="flex items-center gap-4">
      <button
        onClick={onBack}
        className="bg-white text-indigo-800 px-6 py-2.5 rounded-lg hover:bg-indigo-100 transition-all duration-300 
        shadow-md hover:shadow-lg font-semibold flex items-center gap-2 transform hover:-translate-y-0.5"
      >
        <span className="text-lg">←</span> Return Homepage
      </button>
      <h1 className="text-2xl font-bold tracking-wide">{t('district.title')}</h1>
    </div>
    <LanguageSwitcher />
  </header>
);

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => (
  <div className={`bg-gradient-to-br ${color} p-6 rounded-2xl shadow-lg text-white transform hover:scale-105 transition-all duration-300`}>
    <div className="flex items-center justify-between mb-4">
      <div className="text-4xl">{icon}</div>
    </div>
    <h3 className="text-sm font-medium opacity-90 mb-1">{title}</h3>
    <p className="text-3xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
  </div>
);

export default function DistrictView() {
  const { t } = useTranslation();
  const { district_code } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [districtData, setDistrictData] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [insights, setInsights] = useState({
    positive: [],
    issues: [],
    analytical: []
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!district_code) {
        setError(t('district.noData'));
        setLoading(false);
        return;
      }

      try {
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/mgnrega/districts/${district_code}/metrics`;
        console.log('Fetching district data from:', apiUrl);
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const rawData = await response.json();
        console.log('API Response:', rawData);
        
        if (!rawData) {
          throw new Error('No data available for this district');
        }
        
        // Transform API data to match our frontend structure
        const transformedData = transformDistrictData(rawData);
        setDistrictData(transformedData);
        
        // Also fetch monthly data
        const monthlyUrl = `${import.meta.env.VITE_API_BASE_URL}/api/mgnrega/districts/${district_code}/data`;
        const monthlyResponse = await fetch(monthlyUrl);
        const monthlyData = await monthlyResponse.json();
        
        // Transform monthly data
        const monthlyStats = calculateMonthlyTrends(monthlyData || []);
        setMonthlyStats(monthlyStats);
        
        // Generate insights
        const dataInsights = generateInsights(transformedData);
        setInsights(dataInsights);
        
      } catch (err) {
        console.error("Error fetching district data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [district_code, t]);

  if (loading) return <div className="text-center py-10">{t('common.loading')}</div>;
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>;
  if (!districtData) return <div className="text-center py-10">{t('district.noData')}</div>;

  // Key metrics for the dashboard
  const keyMetrics = [
    {
      title: t('district.metrics.households'),
      value: districtData?.metrics?.employment?.households || 0,
      icon: "👨‍👩‍👧‍👦",
      color: "from-blue-500 to-blue-700"
    },
    {
      title: t('district.metrics.avgWage'),
      value: `₹${districtData?.metrics?.financial?.averageWageRate || 0}`,
      icon: "💰",
      color: "from-green-500 to-green-700"
    },
    {
      title: t('district.metrics.completedWorks'),
      value: districtData?.metrics?.works?.completed || 0,
      icon: "✅",
      color: "from-purple-500 to-purple-700"
    },
    {
      title: t('district.metrics.expenditure'),
      value: `₹${((districtData?.metrics?.financial?.totalExpenditure || 0) / 10000000).toFixed(2)}Cr`,
      icon: "📊",
      color: "from-red-500 to-red-700"
    }
  ];

  // Employment chart data
  const employmentChartData = Array.isArray(monthlyStats) ? monthlyStats.map(stat => ({
    month: stat.month,
    households: stat.employmentMetrics?.householdsWorked || 0,
    individuals: stat.employmentMetrics?.individualsWorked || 0
  })) : [];

  // Works progress data
  const worksChartData = [
    {
      name: t('district.completedWorks'),
      value: districtData?.metrics?.works?.completed || 0,
      fill: "#3B82F6"  // Blue color for completed works
    }, 
    {
      name: t('district.ongoingWorks'),
      value: districtData?.metrics?.works?.ongoing || 0,
      fill: "#10B981"  // Green color for ongoing works
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header t={t} onBack={() => navigate('/')} />
      
      {/* District Overview */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {keyMetrics.map((metric, idx) => (
            <StatCard key={idx} {...metric} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Employment Trends */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4">{t('district.charts.employment')}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={employmentChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="households" fill="#3B82F6" stroke="#2563EB" name={t('district.metrics.households')} />
                <Area type="monotone" dataKey="individuals" fill="#10B981" stroke="#059669" name={t('district.metrics.individuals')} />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Basic Stats */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{t('district.title')}</h3>
              <div className="text-sm text-gray-500">
                {districtData?.state}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{t('district.metrics.households')}</p>
                <p className="text-xl font-bold text-gray-800">
                  {districtData?.metrics?.employment?.households?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{t('district.metrics.avgWage')}</p>
                <p className="text-xl font-bold text-gray-800">
                  ₹{districtData?.metrics?.financial?.averageWageRate?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>
        </div>


      </div>
      
      <Footer />
    </div>
  );
}