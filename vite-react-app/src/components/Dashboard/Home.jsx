import React, { useEffect, useState } from 'react';
import { LineChart, PieChart, BarChart } from 'react-chartkick';
import 'chartkick/chart.js';
import { getMetrics } from '../../contexts/api/dashboard';
import "../Home/Home.css";
import BestSellingPricesChart from '../Dashboard/BestSellingPricesChart';

const Home = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      const { data, error } = await getMetrics();
      if (error) {
        console.error("Error fetching metrics:", error);
      } else {
        setMetrics(data);
      }
      setLoading(false);
    };

    fetchMetrics();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (!metrics) return <div>No metrics available</div>;

  const piechartColors = ["#ACD3A8","#99BC85", "#FFFECE", "#FFD0C7", "#F1E7E7",  "#E69DB8"];
  const piechartData = metrics.productSalesCategory.map(cat => [cat.category, parseInt(cat.total_units_sold)]);

  const now = new Date();
  const currentMonth = now.toLocaleDateString("default", {month:"short"});
  const year = new Date().getFullYear();
  // const currentMonth = now.getMonth() + 1;
  const dailySalesData = metrics.monthSalesChart.reduce((acc, cur) => {
    acc[`${currentMonth} ${cur.day} , ${year}`] = cur.sales;
    return acc;
  }, {});

  const monthlySalesData = metrics.yearSalesChart.reduce((acc, cur) => {
    acc[cur.month_name] = cur.sales_count;
    return acc;
  }, {});

  return (
    <div className='home'>
      {/* ------------------ 1st row: Key Metrics ------------------- */}
      <div className="row-graphs">
        <div className="text-card">
          <h1>Total Revenue</h1>
          <h2>₹{metrics.monthRev.toLocaleString()}</h2>
          <h3>{metrics.monthRevChange}% from last month</h3>
        </div>
        <div className="text-card">
          <h1>Sales</h1>
          <h2>{metrics.monthSales}</h2>
          <h3>{metrics.monthSalesChange}% from last month</h3>
        </div>
        <div className="text-card">
          <h1>Profit</h1>
          <h2>₹{metrics.monthProfit.toLocaleString()}</h2>
          <h3>{metrics.monthProfitChange}% from last month</h3>
        </div>
        <div className="text-card">
          <h1>Tax</h1>
          <h2>₹{metrics.monthTax.toLocaleString()}</h2>
          <h3>{metrics.monthTaxChange}% from last month</h3>
        </div>
        <div className="text-card">
          <h1>Customers</h1>
          <h2>{metrics.noUsers}</h2>
          <h3>{metrics.userMonthGrowth}% growth</h3>
        </div>
      </div>

      {/* ------------------ 2nd row: Sales Charts ------------------- */}
      <div className="row-graphs">
        <div className="admin-graphs-monthly">
          <p style={{fontSize:'2rem'}}>Monthly Sales</p>
          <LineChart 
            colors={["#373F4C"]}
            curve={false}
            data={dailySalesData}
            height="25vh"
            width="45vw"
            download={{background: "#fff"}}
          />
        </div>
        <div className="admin-graphs">
          <h1>Yearly Sales</h1>
          <LineChart 
            colors={["#373F4C"]}
            curve={false}
            data={monthlySalesData}
            height="25vh"
            width="25vw"
            download={{background: "#fff"}}
          />
        </div>
      </div>

      {/* ------------------ 3rd row: Product Category Pie ------------------- */}
      <div className="admin-graphs">
        <h1>Product Sales Category Wise</h1>
        <div className='admin-piecharts'>

        <PieChart 
          donut={true}
          colors={piechartColors}
          data={piechartData}
          height="55vh"
          width="35vw"
          download={{background: "#fff"}}
        />
        <div className="piechart-text">
          {metrics.productSalesCategory.map((cat, idx) => (
            <div key={idx} className="piechart-row">
              <div className="piechart-color" style={{backgroundColor: piechartColors[idx]}}></div>
              <div className="piechart-label">{cat.category}:</div>
              <div className="piechart-value">{cat.total_units_sold} units</div>
            </div>
          ))}
        </div>
        </div>

      </div>

      {/* ------------------ 4th row: Hot Selling Products ------------------- */}
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
            {metrics.hotSellingProducts.map((prod, idx) => (
              <tr key={idx}>
                <td>{prod.product_name}</td>
                <td>{prod.total_units_sold}</td>
                <td>₹{parseFloat(prod.total_sales).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ------------------ 5th row: Low Stock Variants ------------------- */}
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
            {metrics.lowStockVariants.map((v, idx) => (
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
