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
        
        // Transform data for charts
        const transformedMetrics = [
          { name: t('metrics.totalDistricts'), value: metricsData.total_districts },
          { name: t('metrics.totalHouseholds'), value: metricsData.total_households },
          { name: t('metrics.avgWageRate'), value: metricsData.avg_wage_rate }
        ];
        
        setAggregatedMetrics(transformedMetrics);

        // Generate insights based on the data
        const generatedInsights = {
          positive: [
            `${t('insights.totalDistricts')}: ${metricsData.total_districts}`,
            `${t('insights.employedHouseholds')}: ${metricsData.total_households.toLocaleString()}`
          ],
          issues: [],
          analytical: [
            `${t('insights.avgWage')}: ₹${metricsData.avg_wage_rate.toLocaleString()}`
          ]
        };
        setInsights(generatedInsights);

      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);


  const handleDistrictSelect = (districtCode) => {
    if (districtCode) {
      setSelectValue(districtCode);
      navigate(`/district/${districtCode}`);
    }
  };

  const handleLocationSelect = (district) => {
    setShowLocationModal(false);
    handleDistrictSelect(district.district_code);
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
              <option key={d.district_code} value={d.district_code}>
                {d.district_name} ({d.state_name})
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
                  key={district.district_code}
                  onClick={() => handleDistrictSelect(district.district_code)}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
                <div className="text-4xl mb-2">💰</div>
                <h3 className="text-gray-700 font-semibold text-sm mb-1">
                  Average Daily Wage Rate
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  ₹{aggregatedMetrics[2]?.value.toLocaleString() || 0}
                </p>
                <p className="text-sm text-gray-500 mt-2">Average wage per day across all Tamil Nadu districts</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
                <div className="text-4xl mb-2">👥</div>
                <h3 className="text-gray-700 font-semibold text-sm mb-1">
                  Total Households Employed
                </h3>
                <p className="text-3xl font-bold text-indigo-600">
                  {aggregatedMetrics[1]?.value.toLocaleString() || 0}
                </p>
                <p className="text-sm text-gray-500 mt-2">Total number of households working across Tamil Nadu</p>
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
