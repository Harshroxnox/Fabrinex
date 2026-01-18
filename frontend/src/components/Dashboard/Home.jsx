

import React, { useEffect, useState } from 'react';
import { LineChart, PieChart } from 'react-chartkick';
import 'chartkick/chart.js';
import { getMetrics, getTodaysMetrics } from '../../contexts/api/dashboard';
import "../Home/Home.css";
import BestSellingPricesChart from '../Dashboard/BestSellingPricesChart';

const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= 2022; i--) {
    years.push(i);
  }
  return years;
};

const monthOptions = [
  { value: 1, name: 'January' }, { value: 2, name: 'February' },
  { value: 3, name: 'March' }, { value: 4, name: 'April' },
  { value: 5, name: 'May' }, { value: 6, name: 'June' },
  { value: 7, name: 'July' }, { value: 8, name: 'August' },
  { value: 9, name: 'September' }, { value: 10, name: 'October' },
  { value: 11, name: 'November' }, { value: 12, name: 'December' },
];

const Home = () => {
  const [metrics, setMetrics] = useState(null);
  const [todaysMetrics, setTodaysMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    const fetchAllMetrics = async () => {
      setLoading(true);
      const [mainData, todayData] = await Promise.all([
        getMetrics({ year: selectedYear, month: selectedMonth }),
        getTodaysMetrics()
      ]);

      if (mainData.error) console.error("Error fetching metrics:", mainData.error);
      else setMetrics(mainData.data);
      
      if (todayData.error) console.error("Error fetching today's metrics:", todayData.error);
      else setTodaysMetrics(todayData.data);
      
      setLoading(false);
    };

    fetchAllMetrics();
  }, [selectedYear, selectedMonth]);

  if (loading) return <div>Loading dashboard...</div>;
  if (!metrics) return <div>No metrics available.</div>;

  // --- Chart Data Processing for Combo Charts ---
  const selectedMonthName = monthOptions.find(m => m.value === selectedMonth)?.name.substring(0, 3) || '';

  const dailyEarningsData = metrics.monthlySummary.chartData.reduce((acc, cur) => {
    acc[`${selectedMonthName} ${cur.day}, ${selectedYear}`] = cur.total_earnings;
    return acc;
  }, {});

  const dailySalesCountData = metrics.monthlySummary.chartData.reduce((acc, cur) => {
    acc[`${selectedMonthName} ${cur.day}, ${selectedYear}`] = cur.sales_count;
    return acc;
  }, {});

  const monthlyEarningsData = metrics.yearlySummary.chartData.reduce((acc, cur) => {
    acc[cur.month_name] = cur.total_earnings;
    return acc;
  }, {});

  const monthlySalesCountData = metrics.yearlySummary.chartData.reduce((acc, cur) => {
    acc[cur.month_name] = cur.sales_count;
    return acc;
  }, {});

  // Data formatted for react-chartkick multi-series combo charts
  const dailyComboChartData = [
    { name: "Earnings", data: dailyEarningsData, type: 'column' },
    { name: "Sales Count", data: dailySalesCountData, yAxisID: 'y1' }
  ];

  const monthlyComboChartData = [
    { name: "Earnings", data: monthlyEarningsData, type: 'column' },
    { name: "Sales Count", data: monthlySalesCountData, yAxisID: 'y1' }
  ];

  // // Options for Chart.js to create a second Y-axis
  // const comboChartOptions = {
  //   scales: {
  //     y: {
  //       beginAtZero: true,
  //       title: { display: true, text: 'Earnings (₹)' }
  //     },
  //     y1: {
  //       type: 'linear',
  //       position: 'right',
  //       beginAtZero: true,
  //       title: { display: true, text: 'Sales Count' },
  //       grid: { drawOnChartArea: false }
  //     }
  //   }
  // };

  const piechartColors = ["#ACD3A8", "#99BC85", "#FFFECE", "#FFD0C7", "#F1E7E7", "#E69DB8"];
  const piechartData = metrics.productSummary.salesByCategory.map(cat => [cat.category, parseInt(cat.total_units_sold)]);

  const paymentBreakdown = metrics.monthlySummary.paymentBreakdown || {
    cash: 0,
    online: 0
  };

  const paymentPieData = [
    ["Cash", paymentBreakdown.cash],
    ["Online", paymentBreakdown.online]
  ];

  const todayPayments = metrics.paymentSummary || null;


  return (
    <div className='home'>
      {/* Filters and Key Metrics are unchanged */}
      <div className="dashboard-filters-container">
        <div className="dashboard-select-wrapper">
          <label>Year: </label>
          <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
            {generateYearOptions().map(year => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>
        <div className="dashboard-select-wrapper">
          <label>Month: </label>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
            {monthOptions.map(month => <option key={month.value} value={month.value}>{month.name}</option>)}
          </select>
        </div>
      </div>

      <div className="row-graphs">
        {todaysMetrics && (
          <>
            <div className="text-card">
              <h1>Today's Revenue</h1>
              <h2>₹{todaysMetrics.todaysRevenue.toLocaleString()}</h2>
              <h3>{(todaysMetrics.revenueChange ?? 0).toFixed(2)}% from yesterday</h3>
            </div>
            <div className="text-card">
              <h1>Today's Sales</h1>
              <h2>{todaysMetrics.todaysSales}</h2>
              <h3>{(todaysMetrics.salesChange ?? 0).toFixed(2)}% from yesterday</h3>
            </div>
          </>
        )}

        <div className="text-card">
          <h1>Monthly Revenue</h1>
          <h2>₹{metrics.monthlySummary.revenue.toLocaleString()}</h2>
          <h3>{(metrics.monthlySummary.revenueChange ?? 0).toFixed(2)}% from last month</h3>
        </div>
        <div className="text-card">
          <h1>Monthly Sales</h1>
          <h2>{metrics.monthlySummary.salesCount}</h2>
          <h3>{(metrics.monthlySummary.salesCountChange ?? 0).toFixed(2)}% from last month</h3>
        </div>
        <div className="text-card">
          <h1>Customers</h1>
          <h2>{metrics.userSummary.totalUsers}</h2>
          <h3>{(metrics.userSummary.periodGrowth ?? 0).toFixed(2)}% growth this month</h3>
        </div>
      </div>

<div className='row-graphs'>
    {todayPayments && (
          <>
            <div className="text-card">
              <h1>Today's Cash</h1>
              <h2>₹{todayPayments.cash.today.toLocaleString()}</h2>
            </div>

            <div className="text-card">
              <h1>Today's Online</h1>
              <h2>₹{todayPayments.online.today.toLocaleString()}</h2>
            </div>
          </>
        )}

        <div className="text-card">
          <h1>Cash Collection</h1>
          <h2>₹{paymentBreakdown.cash.toLocaleString()}</h2>
          <h3>This month</h3>
        </div>

        <div className="text-card">
          <h1>Online Collection</h1>
          <h2>₹{paymentBreakdown.online.toLocaleString()}</h2>
          <h3>This month</h3>
        </div>
</div>
      {/* --- Updated Chart Section --- */}
      <div className="row-graphs">
        <div className="admin-graphs-container">
          <h3>Daily Stats for {monthOptions.find(m => m.value === selectedMonth)?.name} {selectedYear}</h3>
          <LineChart
            data={dailyComboChartData}
            // library={comboChartOptions}
            height="40vh"
            xtitle="Day"
            download={{ background: "#fff" }}
          />
        </div>
        <div className="admin-graphs-container">
          <h3>Monthly Stats for {selectedYear}</h3>
          <LineChart
            data={monthlyComboChartData}
            // library={comboChartOptions}
            height="40vh"
            xtitle="Month"
            download={{ background: "#fff" }}
          />
        </div>
      </div>

      <div className="admin-graphs">
        <h1>Product Sales Category Wise</h1>
        <div className='admin-piecharts'>
          <PieChart donut={true} colors={piechartColors} data={piechartData} height="55vh" width="35vw" download={{background: "#fff"}}/>
          <div className="piechart-text">
            {metrics.productSummary.salesByCategory.map((cat, idx) => (
              <div key={idx} className="piechart-row">
                <div className="piechart-color" style={{backgroundColor: piechartColors[idx]}}></div>
                <div className="piechart-label">{cat.category}:</div>
                <div className="piechart-value">{cat.total_units_sold} units</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="admin-graphs">
        <h1>Payment Mode Breakdown</h1>

        <div className="admin-piecharts">
          <PieChart
            donut={true}
            colors={["#7ED957", "#4D96FF"]}
            data={paymentPieData}
            height="45vh"
            width="35vw"
            download={{ background: "#fff" }}
          />

          <div className="piechart-text">
            <div className="piechart-row">
              <div
                className="piechart-color"
                style={{ backgroundColor: "#7ED957" }}
              ></div>
              <div className="piechart-label">Cash:</div>
              <div className="piechart-value">
                ₹{paymentBreakdown.cash.toLocaleString()}
              </div>
            </div>

            <div className="piechart-row">
              <div
                className="piechart-color"
                style={{ backgroundColor: "#4D96FF" }}
              ></div>
              <div className="piechart-label">Online:</div>
              <div className="piechart-value">
                ₹{paymentBreakdown.online.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hot-products card">
        <h1>Hot Selling Products</h1>
        <table className='admin-table'>
          <thead>
            <tr>
              <th>Name</th>
              <th>Units Sold</th>
              <th>Total Sales</th>
            </tr>
          </thead>
          <tbody>
            {metrics.productSummary.hotSelling.map((prod, idx) => (
              <tr key={idx}>
                <td>{prod.product_name}</td>
                <td>{prod.total_units_sold}</td>
                <td>₹{parseFloat(prod.total_sales).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="low-stock card">
        <h1>Low Stock Variants</h1>
        <table className='admin-table'>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Color</th>
              <th>Size</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {metrics.productSummary.lowStock.map((v, idx) => (
              <tr key={idx}>
                <td>{v.product_name}</td>
                <td>{v.color}</td>
                <td>{v.size}</td>
                <td>{v.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BestSellingPricesChart />
    </div>
  );
};

export default Home;