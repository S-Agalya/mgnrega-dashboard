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
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [winners, setWinners] = useState({});


  const DISTRICT_COLORS = {
    district1: "#3B82F6", // Blue
    district2: "#10B981", // Green
  };


  // Fetch all districts on mount
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/mgnrega/districts`)
      .then((res) => res.json())
      .then((data) => setDistricts(data))
      .catch((err) => console.error("Error fetching districts:", err));
  }, []);


  // Handle comparison
  const handleCompare = async () => {
    if (!district1 || !district2) {
      alert(t('common.selectTwo'));
      return;
    }


    if (district1 === district2) {
      alert(t('common.selectDifferent'));
      return;
    }


    setLoading(true);
    setError(null);
    
    try {
      const url = `${import.meta.env.VITE_API_BASE_URL}/api/mgnrega/compare?districts=${district1},${district2}`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      
      if (!data.chartData || data.chartData.length === 0) {
        setError(t('compare.noData'));
        setComparisonData(null);
      } else {
        setComparisonData(data);
        calculateWinners(data);
        generateInsights(data);
      }
    } catch (err) {
      console.error("Error comparing districts:", err);
      setError(`${t('compare.failedFetch')}: ${err.message}`);
      setComparisonData(null);
    } finally {
      setLoading(false);
    }
  };


  // Calculate which district wins each metric
  const calculateWinners = (data) => {
    const winnersMap = {};
    data.chartData.forEach((metric) => {
      const val1 = metric[district1] || 0;
      const val2 = metric[district2] || 0;
      winnersMap[metric.metricName] = val1 > val2 ? district1 : district2;
    });
    setWinners(winnersMap);
  };


  // Generate insights from comparison data
  const generateInsights = (data) => {
    if (!data || !data.chartData || data.chartData.length === 0) {
      setNotes([t('compare.noDataAvailable')]);
      return;
    }


    const insights = [];
    let district1Wins = 0;
    let district2Wins = 0;
    
    data.chartData.forEach((metric) => {
      const dist1Value = metric[district1];
      const dist2Value = metric[district2];
      
      if (dist1Value !== undefined && dist2Value !== undefined) {
        if (dist1Value > dist2Value) district1Wins++;
        else district2Wins++;


        const diff = Math.abs(dist1Value - dist2Value);
        const higherDistrict = dist1Value > dist2Value ? district1 : district2;
        const lowerValue = Math.min(dist1Value, dist2Value);
        
        if (lowerValue > 0) {
          const percentage = ((diff / lowerValue) * 100).toFixed(1);
          insights.push({
            metric: metric.metricName,
            winner: higherDistrict,
            percentage,
            value1: dist1Value,
            value2: dist2Value
          });
        }
      }
    });


    // Summary insight
    const overallWinner = district1Wins > district2Wins ? district1 : district2;
    insights.unshift({
      summary: true,
      text: `🏆 ${overallWinner} ${t('compare.leadsOverall')} ${Math.max(district1Wins, district2Wins)} ${t('compare.outOf')} ${data.chartData.length} ${t('compare.metrics')}`,
      district1Wins,
      district2Wins
    });


    setNotes(insights);
  };


  const resetComparison = () => {
    setDistrict1("");
    setDistrict2("");
    setComparisonData(null);
    setNotes([]);
    setWinners({});
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-800 via-blue-700 to-indigo-900 text-white py-5 px-8 shadow-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('compare.title')}</h1>
          <div className="flex gap-6 items-center">
            <Link to="/" className="hover:text-yellow-300 transition">{t('header.dashboard')}</Link>
            <Link to="/compare" className="hover:text-yellow-300 transition">{t('header.compare')}</Link>
            <LanguageSwitcher />
          </div>
        </div>
      </header>


      <div className="p-6">
        {/* Selection Panel */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <span className="text-3xl">⚖️</span>
              {t('compare.selectDistricts')}
            </h2>
            {comparisonData && (
              <button
                onClick={resetComparison}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t('compare.reset')}
              </button>
            )}
          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* District 1 Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">{t('compare.district1')}</label>
              <select
                value={district1}
                onChange={(e) => setDistrict1(e.target.value)}
                className="w-full p-4 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition text-lg font-medium"
              >
                <option value="">{t('compare.selectFirst')}</option>
                {districts.map((d) => (
                  <option key={d.district_name} value={d.district_name} disabled={d.district_name === district2}>
                    {d.district_name}
                  </option>
                ))}
              </select>
              {district1 && (
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl">
                  <p className="text-sm opacity-90">{t('compare.selected')}</p>
                  <p className="text-xl font-bold">{district1}</p>
                </div>
              )}
            </div>


            {/* VS Badge */}
            <div className="flex items-center justify-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg transform hover:scale-110 transition">
                {t('compare.vs')}
              </div>
            </div>


            {/* District 2 Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">{t('compare.district2')}</label>
              <select
                value={district2}
                onChange={(e) => setDistrict2(e.target.value)}
                className="w-full p-4 border-2 border-green-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition text-lg font-medium"
              >
                <option value="">{t('compare.selectSecond')}</option>
                {districts.map((d) => (
                  <option key={d.district_name} value={d.district_name} disabled={d.district_name === district1}>
                    {d.district_name}
                  </option>
                ))}
              </select>
              {district2 && (
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl">
                  <p className="text-sm opacity-90">{t('compare.selected')}</p>
                  <p className="text-xl font-bold">{district2}</p>
                </div>
              )}
            </div>
          </div>


          {/* Compare Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleCompare}
              disabled={!district1 || !district2 || loading}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-12 py-4 rounded-xl hover:from-indigo-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition shadow-lg text-lg font-bold flex items-center gap-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  {t('compare.comparing')}
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {t('compare.compareBtn')}
                </>
              )}
            </button>
          </div>
        </div>


        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 p-6 rounded-2xl mb-6">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold">{t('common.error')}:</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}


        {/* Results Section */}
        {!loading && comparisonData?.chartData?.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
            {/* Charts Section */}
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-gray-600 text-sm">{t('compare.totalMetrics')}</p>
                  <p className="text-3xl font-bold text-indigo-600">{comparisonData.chartData.length}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg text-center">
                  <div className="text-4xl mb-2">🏆</div>
                  <p className="text-blue-100 text-sm">{district1} {t('compare.wins')}</p>
                  <p className="text-3xl font-bold">{notes[0]?.district1Wins || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg text-center">
                  <div className="text-4xl mb-2">🏆</div>
                  <p className="text-green-100 text-sm">{district2} {t('compare.wins')}</p>
                  <p className="text-3xl font-bold">{notes[0]?.district2Wins || 0}</p>
                </div>
              </div>


              {/* Bar Chart */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  {t('compare.sideByComparison')}
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={comparisonData.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="metricName" 
                      angle={-15} 
                      textAnchor="end" 
                      height={100}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey={district1} fill={DISTRICT_COLORS.district1} name={district1} radius={[8, 8, 0, 0]} />
                    <Bar dataKey={district2} fill={DISTRICT_COLORS.district2} name={district2} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>


              {/* Radar Chart */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  {t('compare.performanceRadar')}
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={comparisonData.chartData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metricName" fontSize={10} />
                    <PolarRadiusAxis />
                    <Radar
                      name={district1}
                      dataKey={district1}
                      stroke={DISTRICT_COLORS.district1}
                      fill={DISTRICT_COLORS.district1}
                      fillOpacity={0.6}
                    />
                    <Radar
                      name={district2}
                      dataKey={district2}
                      stroke={DISTRICT_COLORS.district2}
                      fill={DISTRICT_COLORS.district2}
                      fillOpacity={0.6}
                    />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>


              {/* Line Chart */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">📈</span>
                  {t('compare.performanceTrend')}
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={comparisonData.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="metricName" 
                      angle={-15} 
                      textAnchor="end" 
                      height={100}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey={district1} 
                      stroke={DISTRICT_COLORS.district1}
                      strokeWidth={3}
                      name={district1}
                    />
                    <Line 
                      type="monotone" 
                      dataKey={district2} 
                      stroke={DISTRICT_COLORS.district2}
                      strokeWidth={3}
                      name={district2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>


            {/* Insights Panel */}
            <div className="space-y-6">
              {/* Winner Summary */}
              {notes[0]?.summary && (
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white p-6 rounded-2xl shadow-xl">
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                    <span className="text-2xl">🏆</span>
                    {t('compare.overallWinner')}
                  </h3>
                  <p className="text-lg font-semibold">{notes[0].text}</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <p className="text-sm opacity-90">{district1}</p>
                      <p className="text-2xl font-bold">{notes[0].district1Wins}</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-lg">
                      <p className="text-sm opacity-90">{district2}</p>
                      <p className="text-2xl font-bold">{notes[0].district2Wins}</p>
                    </div>
                  </div>
                </div>
              )}


              {/* Detailed Insights */}
              <div className="bg-white rounded-2xl shadow-lg p-6 max-h-[600px] overflow-y-auto">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 sticky top-0 bg-white pb-3">
                  <span className="text-2xl">💡</span>
                  {t('compare.detailedInsights')}
                </h3>
                <div className="space-y-3">
                  {notes.slice(1).map((insight, index) => (
                    <div 
                      key={index}
                      className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border-l-4 border-indigo-500 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 mb-1">{insight.metric}</p>
                          <p className="text-sm text-gray-600">
                            <span className="font-bold" style={{ color: insight.winner === district1 ? DISTRICT_COLORS.district1 : DISTRICT_COLORS.district2 }}>
                              {insight.winner}
                            </span> {t('compare.leadsBy')} <span className="font-bold text-orange-600">{insight.percentage}%</span>
                          </p>
                          <div className="flex gap-3 mt-2 text-xs">
                            <span className="text-blue-600 font-semibold">{district1}: {insight.value1?.toLocaleString()}</span>
                            <span className="text-green-600 font-semibold">{district2}: {insight.value2?.toLocaleString()}</span>
                          </div>
                        </div>
                        <span className="text-2xl">
                          {insight.winner === district1 ? "🔵" : "🟢"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : !loading && !error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg className="w-32 h-32 text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">{t('compare.noComparison')}</h3>
            <p className="text-gray-500">{t('compare.noComparisonDesc')}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};


export default CompareDistricts;
