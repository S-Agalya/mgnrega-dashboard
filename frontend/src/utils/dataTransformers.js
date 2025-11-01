// Data transformation utilities
export const transformDistrictData = (apiData) => {
  if (!apiData) return null;

  return {
    district: apiData.district_name || '',
    state: apiData.state_name || '',
    districtCode: apiData.district_code || '',
    updatedAt: apiData.updated_at || new Date().toISOString(),
    metrics: {
      employment: {
        households: apiData.households_worked || 0
      },
      financial: {
        averageWageRate: apiData.average_wage_rate || 0
      }
    }
  };
};

export const calculateMonthlyTrends = (monthlyData) => {
  if (!monthlyData || !monthlyData.length) return [];

  return monthlyData.map(month => ({
    month: `${month.month}/${month.fin_year}`,
    year: month.fin_year,
    employmentMetrics: {
      householdsWorked: month.households_worked || 0,
      individualsWorked: month.individuals_worked || 0,
      averageDays: month.average_days_employment || 0
    },
    financialMetrics: {
      expenditure: month.total_expenditure || 0,
      wageRate: month.average_wage_rate || 0
    },
    workProgress: {
      completedWorks: month.completed_works || 0,
      ongoingWorks: month.ongoing_works || 0
    }
  })).reverse();  // Reverse to show oldest to newest
};

export const generateInsights = (data) => {
  return {
    positive: [],
    issues: [],
    analytical: []
  };
  insights.analytical.push(
    `${data.metrics.performance.nrmExpenditure}% expenditure on Natural Resource Management`,
    `${data.metrics.performance.agricultureAlliedWorks}% expenditure on Agriculture & Allied works`
  );

  return insights;
};