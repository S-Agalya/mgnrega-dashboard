import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, RadialBarChart, RadialBar,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell
} from "recharts";
import Footer from "../components/Footer";
import LanguageSwitcher from "../components/LanguageSwitcher";
import LocationModal from "../components/LocationModal";


// Colors for charts
const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];


// Calculate development index from metrics
const calculateDevelopmentIndex = (metrics) => {
  if (!metrics?.length) return 0;
  const totalEmployed = metrics.find(m => m.metric_name === 'People Employed')?.metric_value || 0;
  const totalJobs = metrics.find(m => m.metric_name === 'Jobs Created')?.metric_value || 0;
  const totalWages = metrics.find(m => m.metric_name === 'Wages Paid')?.metric_value || 0;
  
  return ((totalEmployed * 0.4 + totalJobs * 0.3 + totalWages * 0.3) / 1000).toFixed(2);
};


export default function Home() {
  const { t } = useTranslation();
  const [districts, setDistricts] = useState([]);
  const [aggregatedMetrics, setAggregatedMetrics] = useState([]);
  const [insights, setInsights] = useState({
    positive: [],
    issues: [],
    analytical: []
  });
  const [loading, setLoading] = useState(true);
  const [selectValue, setSelectValue] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch all districts
        const districtsRes = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/mgnrega/districts`
        );
        const districtsData = await districtsRes.json();
        setDistricts(districtsData);


        // Fetch aggregated metrics
        const metricsRes = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/mgnrega/metrics/aggregated`
        );
        const metricsData = await metricsRes.json();
        setAggregatedMetrics(metricsData);


        // Fetch aggregated insights
        const insightsRes = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/mgnrega/insights/aggregated`
        );
        const insightsData = await insightsRes.json();
        setInsights(insightsData);


      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };


    fetchAllData();
  }, []);


  const handleDistrictSelect = (districtName) => {
    if (districtName) {
      setSelectValue("");
      navigate(`/district/${districtName}`);
    }
  };

  const handleLocationSelect = (districtName) => {
    setShowLocationModal(false);
    navigate(`/district/${districtName}`);
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 w-full bg-gradient-to-r from-indigo-800 via-blue-700 to-indigo-900 text-white py-5 px-8 shadow-lg z-50 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wide">
          {t('header.title')}
        </h1>


        <div className="flex items-center space-x-6">
          <Link
            to="/"
            className="text-white hover:text-yellow-300 font-medium transition"
          >
            {t('header.dashboard')}
          </Link>
          <Link
            to="/compare"
            className="text-white hover:text-yellow-300 font-medium transition"
          >
            {t('header.compare')}
          </Link>

          {/* View Location Button */}
          <button
            onClick={() => setShowLocationModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition font-semibold flex items-center gap-2"
          >
            <span>📍</span>
            View Location
          </button>

          <select
            value={selectValue}
            onChange={(e) => {
              setSelectValue(e.target.value);
              handleDistrictSelect(e.target.value);
            }}
            className="p-2 rounded-lg text-black font-semibold shadow-md w-56"
          >
            <option value="">{t('header.quickNavigate')}</option>
            {districts.map((d) => (
              <option key={d.district_name} value={d.district_name}>
                {d.district_name}
              </option>
            ))}
          </select>

          <LanguageSwitcher />
        </div>
      </header>


      {/* Main Content */}
      <main className="flex flex-1 mt-24">
        {/* Left: Main Content */}
        <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
          {/* District Cards Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              📍 {t('home.selectDistrict')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {districts.map((district) => (
                <div
                  key={district.district_name}
                  onClick={() => handleDistrictSelect(district.district_name)}
                  className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-indigo-500"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-800">
                      {district.district_name}
                    </h3>
                    <span className="text-2xl">📍</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {district.state_name}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                    <span className="text-xs text-gray-500">{t('home.viewDetails')}</span>
                    <span className="text-indigo-600 font-bold">→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>


          {/* Aggregated Metrics */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              📊 {t('home.overallStats')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {aggregatedMetrics.map((metric) => (
                <div
                  key={metric.metric_name}
                  className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="text-4xl mb-2">{metric.metric_icon}</div>
                  <h3 className="text-gray-700 font-semibold text-sm mb-1">
                    {metric.metric_name}
                  </h3>
                  <p className="text-3xl font-bold text-indigo-700">
                    {parseFloat(metric.metric_value).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>


          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Overall Metrics Bar Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="font-bold text-gray-800 mb-4">
                📊 {t('home.metricsOverview')}
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={aggregatedMetrics}>
                    <XAxis 
                      dataKey="metric_name" 
                      angle={-15} 
                      textAnchor="end" 
                      height={80}
                      fontSize={10}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="metric_value" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>


            {/* Districts Distribution Pie */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="font-bold text-gray-800 mb-4">
                🥧 {t('home.districtsCoverage')}
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={districts.map(d => ({
                        name: d.district_name,
                        value: 1
                      }))}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                    >
                      {districts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>


            {/* Development Index */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="font-bold text-gray-800 mb-4">
                🌾 {t('home.developmentIndex')}
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart 
                    innerRadius="60%" 
                    outerRadius="100%" 
                    data={[{
                      name: t('home.developmentIndex'),
                      value: parseFloat(calculateDevelopmentIndex(aggregatedMetrics)),
                      fill: '#4F46E5'
                    }]} 
                    startAngle={180} 
                    endAngle={0}
                  >
                    <RadialBar
                      minAngle={15}
                      background
                      clockWise={true}
                      dataKey="value"
                    />
                    <Legend />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>


        {/* Right: Insights Panel */}
        <aside className="w-96 bg-gray-900 text-gray-100 p-6 shadow-2xl sticky top-0 h-screen overflow-y-auto">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">
            📋 {t('home.overallInsights')}
          </h2>


          {/* Positive */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-green-400 mb-2">
              {t('home.positive')}
            </h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
              {insights.positive.length > 0 ? (
                insights.positive.map((item, index) => (
                  <li key={index}>{item}</li>
                ))
              ) : (
                <li className="text-gray-500">{t('home.noPositive')}</li>
              )}
            </ul>
          </div>


          {/* Issues */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-red-400 mb-2">
              {t('home.issues')}
            </h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
              {insights.issues.length > 0 ? (
                insights.issues.map((item, index) => (
                  <li key={index}>{item}</li>
                ))
              ) : (
                <li className="text-gray-500">{t('home.noIssues')}</li>
              )}
            </ul>
          </div>


          {/* Analytical */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">
              {t('home.analytical')}
            </h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
              {insights.analytical.length > 0 ? (
                insights.analytical.map((item, index) => (
                  <li key={index}>{item}</li>
                ))
              ) : (
                <li className="text-gray-500">{t('home.noAnalytical')}</li>
              )}
            </ul>
          </div>


          <div className="text-sm text-gray-400 mt-6 border-t border-gray-700 pt-4">
            Source:{" "}
            <a
              href="https://nrega.nic.in"
              className="underline text-blue-300 hover:text-blue-400"
              target="_blank"
              rel="noreferrer"
            >
              MGNREGA Portal
            </a>
          </div>
        </aside>
      </main>

      {/* Location Modal */}
      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSelectDistrict={handleLocationSelect}
        districts={districts}
      />

      <Footer />
    </div>
  );
}
