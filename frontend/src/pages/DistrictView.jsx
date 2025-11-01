import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend,
  CartesianGrid,
  RadialBarChart,
  RadialBar
} from "recharts";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import LanguageSwitcher from "../components/LanguageSwitcher";


// Simple inline components
const Header = ({ t }) => (
  <header className="bg-gradient-to-r from-indigo-800 via-blue-700 to-indigo-900 text-white py-5 px-8 shadow-lg flex justify-between items-center">
    <h1 className="text-2xl font-bold">{t('district.title')}</h1>
    <LanguageSwitcher />
  </header>
);


const DistrictCard = ({ title, value, icon, t }) => (
  <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-blue-100">
    <div className="flex items-center justify-between mb-3">
      <div className="text-5xl">{icon}</div>
      <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
        {t('district.active')}
      </div>
    </div>
    <h3 className="text-gray-600 font-semibold text-sm uppercase tracking-wide mb-1">
      {title}
    </h3>
    <p className="text-4xl font-bold text-indigo-700">
      {parseFloat(value).toLocaleString()}
    </p>
    <div className="mt-3 pt-3 border-t border-gray-200">
      <span className="text-xs text-green-600 font-semibold">{t('district.trendingUp')}</span>
    </div>
  </div>
);


const StatCard = ({ title, value, icon, color, trend }) => (
  <div className={`bg-gradient-to-br ${color} p-6 rounded-2xl shadow-lg text-white transform hover:scale-105 transition-all duration-300`}>
    <div className="flex items-center justify-between mb-4">
      <div className="text-4xl">{icon}</div>
      {trend && (
        <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-sm font-medium opacity-90 mb-1">{title}</h3>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);


export default function DistrictView() {
  const { t } = useTranslation();
  const { name } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [districtData, setDistrictData] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState({
    employmentGrowth: [],
    jobsWages: [],
  });
  const [insights, setInsights] = useState({
    positive: [],
    issues: [],
    analytical: []
  });


  useEffect(() => {
    const fetchDistrictData = async () => {
      if (!name) {
        setError(t('district.noData'));
        setLoading(false);
        return;
      }


      setLoading(true);
      setError(null);


      try {
        // Fetch main district data
        const dataResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/mgnrega/district/${name}`
        );
        if (!dataResponse.ok) {
          throw new Error(`${t('district.noData')}: ${dataResponse.status}`);
        }
        const data = await dataResponse.json();
        setDistrictData(data);


        // Fetch district stats
        try {
          const statsResponse = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/api/mgnrega/district/${name}/stats`
          );
          if (statsResponse.ok) {
            const stats = await statsResponse.json();
            setMonthlyStats(stats);
          }
        } catch (err) {
          console.warn("Stats fetch failed:", err);
        }


        // Fetch insights
        try {
          const insightsResponse = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/api/mgnrega/district/${name}/insights`
          );
          if (insightsResponse.ok) {
            const insightsData = await insightsResponse.json();
            setInsights(insightsData);
          }
        } catch (err) {
          console.warn("Insights fetch failed:", err);
        }


      } catch (err) {
        setError(err.message);
        console.error('Error fetching district data:', err);
      } finally {
        setLoading(false);
      }
    };


    fetchDistrictData();
  }, [name, t]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">{t('common.loading')} {name} {t('district.noData')}...</div>
          <div className="text-sm text-gray-500 mt-2">Please wait while we fetch the latest information</div>
        </div>
      </div>
    );
  }


  if (error || !districtData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-2xl max-w-lg">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-red-600 text-xl font-semibold mb-2">{error || t('district.noData')}</p>
          <p className="text-gray-600 mb-6">{t('district.district')} {name}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition shadow-lg"
          >
            ← {t('district.backDashboard')}
          </button>
        </div>
      </div>
    );
  }


  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
  const HEADER_HEIGHT = 64;


  // Calculate some derived stats
  const totalEmployed = districtData.metrics?.find(m => m.metric_name === 'People Employed')?.metric_value || 0;
  const totalJobs = districtData.metrics?.find(m => m.metric_name === 'Jobs Created')?.metric_value || 0;
  const totalWages = districtData.metrics?.find(m => m.metric_name === 'Wages Paid')?.metric_value || 0;
  const avgWage = districtData.metrics?.find(m => m.metric_name === 'Average Wage Rate')?.metric_value || 0;
  const completedWorks = districtData.metrics?.find(m => m.metric_name === 'Completed Works')?.metric_value || 0;
  const ongoingWorks = districtData.metrics?.find(m => m.metric_name === 'Ongoing Works')?.metric_value || 0;


  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen flex flex-col">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 w-full z-50 shadow-md">
        <Header t={t} />
      </div>


      {/* Main Layout */}
      <div className="flex flex-1 gap-6 p-6 mt-[64px]">
        {/* Left Panel - Scrollable */}
        <div
          className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2"
          style={{ height: `calc(100vh - ${HEADER_HEIGHT}px - 48px)` }}
        >
          {/* Header Section with Back Button */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition bg-white px-5 py-3 rounded-xl shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('district.backDashboard')}
            </button>
            
            <div className="flex gap-3">
              <button className="bg-white px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2 text-gray-700 hover:text-indigo-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                {t('district.share')}
              </button>
              <button className="bg-white px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2 text-gray-700 hover:text-green-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {t('district.export')}
              </button>
            </div>
          </div>


          {/* District Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-8 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  {districtData.district_name}
                </h1>
                <p className="text-blue-100 text-lg flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {districtData.state_name}
                </p>
              </div>
              <div className="text-right">
                <div className="text-5xl mb-2">📍</div>
                <div className="text-sm bg-white/20 px-4 py-2 rounded-full">
                  {t('district.active')}
                </div>
              </div>
            </div>
          </div>


          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title={t('district.totalEmployed')} 
              value={totalEmployed.toLocaleString()} 
              icon="👥" 
              color="from-blue-500 to-blue-600"
              trend="+12%"
            />
            <StatCard 
              title={t('district.jobsCreated')} 
              value={totalJobs.toLocaleString()} 
              icon="💼" 
              color="from-green-500 to-green-600"
              trend="+8%"
            />
            <StatCard 
              title={t('district.wagesPaid')} 
              value={`₹${(totalWages/1000).toFixed(0)}K`} 
              icon="💰" 
              color="from-yellow-500 to-orange-500"
              trend="+15%"
            />
            <StatCard 
              title={t('district.avgWageRate')} 
              value={`₹${avgWage}`} 
              icon="💵" 
              color="from-purple-500 to-purple-600"
              trend="+5%"
            />
          </div>


          {/* Main Metrics Cards */}
          {districtData.metrics && districtData.metrics.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {districtData.metrics.map((metric) => (
                <DistrictCard
                  key={metric.metric_name}
                  title={metric.metric_name}
                  value={metric.metric_value}
                  icon={metric.metric_icon}
                  t={t}
                />
              ))}
            </div>
          )}


          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart - Overall Performance */}
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                {t('district.overallPerformance')}
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={districtData.metrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="metric_name" 
                    angle={-15}
                    textAnchor="end"
                    height={80}
                    fontSize={11}
                  />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="metric_value" 
                    fill="#3B82F6" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>


            {/* Pie Chart - Work Status */}
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">🥧</span>
                {t('district.workDistribution')}
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: t('district.completedWorks'), value: completedWorks },
                      { name: t('district.ongoingWorks'), value: ongoingWorks }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[completedWorks, ongoingWorks].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>


            {/* Line Chart - Employment Trend */}
            {monthlyStats.employmentGrowth && monthlyStats.employmentGrowth.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📈</span>
                  {t('district.employmentTrend')}
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyStats.employmentGrowth}>
                    <defs>
                      <linearGradient id="colorEmployed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="employed" 
                      stroke="#10B981" 
                      fill="url(#colorEmployed)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}


            {/* Line Chart - Jobs & Wages */}
            {monthlyStats.jobsWages && monthlyStats.jobsWages.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">💵</span>
                  {t('district.jobsVsWages')}
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyStats.jobsWages}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="jobs_created" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      name={t('district.jobsCreated')}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="wages_paid" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      name={t('district.wagesPaid')}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>


          {/* Work Completion Progress */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              {t('district.workCompletionStatus')}
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">{t('district.completedWorks')}</span>
                  <span className="text-sm font-bold text-green-600">{completedWorks}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(completedWorks / (completedWorks + ongoingWorks)) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">{t('district.ongoingWorks')}</span>
                  <span className="text-sm font-bold text-blue-600">{ongoingWorks}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(ongoingWorks / (completedWorks + ongoingWorks)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Right Panel - Insights (Sticky) */}
        <aside
          className="w-96 bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100 p-6 rounded-2xl shadow-2xl flex flex-col gap-5 sticky top-[84px] overflow-y-auto"
          style={{ height: `calc(100vh - ${HEADER_HEIGHT}px - 48px)` }}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">📋</span>
            <h2 className="text-2xl font-bold text-yellow-400">
              {t('district.districtInsights')}
            </h2>
          </div>


          {/* Positive Outcomes */}
          <div className="bg-gradient-to-br from-green-800/40 to-green-900/40 p-5 rounded-xl border border-green-700/30 hover:border-green-600/50 transition">
            <h3 className="font-bold text-green-300 mb-3 flex items-center gap-2 text-lg">
              <span className="text-xl">✅</span>
              {t('district.positiveOutcomes')}
            </h3>
            <ul className="space-y-2 text-sm text-gray-200">
              {insights.positive && insights.positive.length > 0 ? (
                insights.positive.map((note, i) => (
                  <li key={i} className="flex items-start gap-2 hover:text-green-200 transition">
                    <span className="text-green-400 mt-0.5">•</span>
                    <span>{note}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-400 italic">{t('district.noOutcomes')}</li>
              )}
            </ul>
          </div>


          {/* Key Issues */}
          <div className="bg-gradient-to-br from-red-800/40 to-red-900/40 p-5 rounded-xl border border-red-700/30 hover:border-red-600/50 transition">
            <h3 className="font-bold text-red-300 mb-3 flex items-center gap-2 text-lg">
              <span className="text-xl">⚠️</span>
              {t('district.keyIssues')}
            </h3>
            <ul className="space-y-2 text-sm text-gray-200">
              {insights.issues && insights.issues.length > 0 ? (
                insights.issues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 hover:text-red-200 transition">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>{issue}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-400 italic">{t('district.noIssues')}</li>
              )}
            </ul>
          </div>


          {/* Analytical Insights */}
          <div className="bg-gradient-to-br from-blue-800/40 to-blue-900/40 p-5 rounded-xl border border-blue-700/30 hover:border-blue-600/50 transition">
            <h3 className="font-bold text-blue-300 mb-3 flex items-center gap-2 text-lg">
              <span className="text-xl">🔍</span>
              {t('district.analyticalInsights')}
            </h3>
            <ul className="space-y-2 text-sm text-gray-200">
              {insights.analytical && insights.analytical.length > 0 ? (
                insights.analytical.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 hover:text-blue-200 transition">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>{insight}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-400 italic">{t('district.noAnalytical')}</li>
              )}
            </ul>
          </div>


          {/* Data Source */}
          <div className="mt-auto pt-5 border-t border-gray-700">
            <p className="text-xs text-gray-400 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              {t('district.dataSource')}
            </p>
            <a
              href="https://nrega.nic.in"
              className="text-sm text-blue-300 hover:text-blue-200 underline transition mt-1 block"
              target="_blank"
              rel="noreferrer"
            >
              {t('district.mgnregaPortal')}
            </a>
          </div>
        </aside>
      </div>


      <Footer />
    </div>
  );
}
