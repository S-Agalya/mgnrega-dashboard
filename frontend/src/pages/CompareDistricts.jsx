import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Link } from "react-router-dom";
import LanguageSwitcher from "../components/LanguageSwitcher";

const CompareDistricts = () => {
  const { t } = useTranslation();
  const [districts, setDistricts] = useState([]);
  const [district1, setDistrict1] = useState("");
  const [district2, setDistrict2] = useState("");
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // District colors for charts
  const DISTRICT_COLORS = {
    district1: "#3B82F6", // Blue
    district2: "#10B981", // Green
  };

  // Fetch all districts on mount
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        console.log('Fetching districts from:', `${import.meta.env.VITE_API_BASE_URL}/api/mgnrega/districts`);
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/mgnrega/districts`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch districts: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Fetched districts:', data);
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid response format: expected an array of districts');
        }

        setDistricts(data);
        if (data.length === 0) {
          setError(t('compare.noDistricts'));
        }
      } catch (err) {
        console.error("Error fetching districts:", err);
        setError(t('compare.fetchError') + ': ' + err.message);
      }
    };

    fetchDistricts();
  }, [t]);

  // Handle comparison
  const handleCompare = async () => {
    if (!district1 || !district2) {
      alert(t('compare.selectBoth'));
      return;
    }

    if (district1 === district2) {
      alert(t('compare.selectDifferent'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/mgnrega/districts/compare?districts=${district1},${district2}`
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      
      const dist1Name = data[0].district_name;
      const dist2Name = data[1].district_name;

      // Transform the API data for comparison charts
      const transformedData = {
        employment: [
          {
            metric: t('compare.metrics.households'),
            [dist1Name]: data[0].households_worked,
            [dist2Name]: data[1].households_worked
          },
          {
            metric: t('compare.metrics.individuals'),
            [dist1Name]: data[0].individuals_worked,
            [dist2Name]: data[1].individuals_worked
          }
        ],
        expenditure: [
          {
            metric: t('compare.metrics.totalExp'),
            [dist1Name]: data[0].total_exp,
            [dist2Name]: data[1].total_exp
          },
          {
            metric: t('compare.metrics.wages'),
            [dist1Name]: data[0].wages,
            [dist2Name]: data[1].wages
          }
        ],
        performance: [
          {
            metric: t('compare.metrics.avgWage'),
            [dist1Name]: data[0].average_wage_rate,
            [dist2Name]: data[1].average_wage_rate
          },
          {
            metric: t('compare.metrics.avgDays'),
            [dist1Name]: data[0].average_days_employment,
            [dist2Name]: data[1].average_days_employment
          },
          {
            metric: t('compare.metrics.completedWorks'),
            [dist1Name]: data[0].completed_works,
            [dist2Name]: data[1].completed_works
          }
        ],
        inclusion: [
          {
            metric: t('compare.metrics.womenPersonDays'),
            [dist1Name]: data[0].women_persondays,
            [dist2Name]: data[1].women_persondays
          },
          {
            metric: t('compare.metrics.scWorkers'),
            [dist1Name]: data[0].sc_workers,
            [dist2Name]: data[1].sc_workers
          },
          {
            metric: t('compare.metrics.stWorkers'),
            [dist1Name]: data[0].st_workers,
            [dist2Name]: data[1].st_workers
          }
        ],
        districtNames: {
          district1: dist1Name,
          district2: dist2Name
        }
      };

      setComparisonData(transformedData);
    } catch (err) {
      console.error("Error comparing districts:", err);
      setError(t('compare.comparisonError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-800 via-blue-700 to-indigo-900 text-white py-5 px-8 shadow-lg flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="bg-white text-indigo-800 px-6 py-2.5 rounded-lg hover:bg-indigo-100 transition-all duration-300 shadow-md hover:shadow-lg font-semibold flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            <span className="text-lg">←</span> Return Homepage
          </Link>
          <h1 className="text-2xl font-bold tracking-wide">{t('compare.title')}</h1>
        </div>
        <LanguageSwitcher />
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Selection Controls */}
        <div className="bg-white p-8 rounded-2xl shadow-lg mb-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Select Districts to Compare</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('compare.district1')}
              </label>
              <select
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-300 py-2.5"
                value={district1}
                onChange={(e) => setDistrict1(e.target.value)}
              >
                <option value="">{t('compare.select')}</option>
                {districts.length > 0 ? (
                  districts.map((d) => (
                    <option key={d.district_code} value={d.district_code}>
                      {d.district_name} ({d.state_name})
                    </option>
                  ))
                ) : (
                  <option disabled>Loading districts...</option>
                )}
              </select>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('compare.district2')}
              </label>
              <select
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-300 py-2.5"
                value={district2}
                onChange={(e) => setDistrict2(e.target.value)}
              >
                <option value="">{t('compare.select')}</option>
                {districts.length > 0 ? (
                  districts.map((d) => (
                    <option key={d.district_code} value={d.district_code}>
                      {d.district_name} ({d.state_name})
                    </option>
                  ))
                ) : (
                  <option disabled>Loading districts...</option>
                )}
              </select>
            </div>
            <button
              onClick={handleCompare}
              disabled={loading || !district1 || !district2 || district1 === district2}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 px-6 rounded-lg 
                hover:from-indigo-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 
                disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-300 
                font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('common.loading')}
                </>
              ) : (
                <>
                  <span>🔄</span>
                  {t('compare')}
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {comparisonData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Employment Comparison */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="text-blue-500">👥</span> {t('compare.charts.employment')}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData.employment}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="metric" stroke="#4B5563" />
                  <YAxis stroke="#4B5563" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      padding: '12px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                  <Bar
                    dataKey={comparisonData.districtNames.district1}
                    fill={DISTRICT_COLORS.district1}
                    name={comparisonData.districtNames.district1}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey={comparisonData.districtNames.district2}
                    fill={DISTRICT_COLORS.district2}
                    name={comparisonData.districtNames.district2}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Expenditure Comparison */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold mb-4">{t('compare.charts.expenditure')}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData.expenditure}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey={comparisonData.districtNames.district1}
                    fill={DISTRICT_COLORS.district1}
                    name={comparisonData.districtNames.district1}
                  />
                  <Bar
                    dataKey={comparisonData.districtNames.district2}
                    fill={DISTRICT_COLORS.district2}
                    name={comparisonData.districtNames.district2}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold mb-4">{t('compare.charts.performance')}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData.performance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey={comparisonData.districtNames.district1}
                    fill={DISTRICT_COLORS.district1}
                    name={comparisonData.districtNames.district1}
                  />
                  <Bar
                    dataKey={comparisonData.districtNames.district2}
                    fill={DISTRICT_COLORS.district2}
                    name={comparisonData.districtNames.district2}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Inclusion Metrics */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold mb-4">{t('compare.charts.inclusion')}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={comparisonData.inclusion}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis />
                  <Radar
                    name={comparisonData.districtNames.district1}
                    dataKey={comparisonData.districtNames.district1}
                    stroke={DISTRICT_COLORS.district1}
                    fill={DISTRICT_COLORS.district1}
                    fillOpacity={0.6}
                  />
                  <Radar
                    name={comparisonData.districtNames.district2}
                    dataKey={comparisonData.districtNames.district2}
                    stroke={DISTRICT_COLORS.district2}
                    fill={DISTRICT_COLORS.district2}
                    fillOpacity={0.6}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareDistricts;