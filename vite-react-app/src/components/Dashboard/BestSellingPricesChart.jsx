import React, { useEffect, useState } from "react";
import { BarChart } from "react-chartkick";
import "chartkick/chart.js"; // required for chartkick
import { getBestSellingPrices } from "../../contexts/api/products";

const BestSellingVariantChart = () => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchChartData = async () => {
      const res = await getBestSellingPrices();
      const result = res.data;

      if (result.data) {
        // Transform into [["Variant X (₹price)", itemsSold], ...]
        const transformed = result.data.map((item) => [
          `${item.name} (${item.size} , ${item.color}) -₹${item.price_at_purchase} `,
          item.total_sold,
        ]);
        setChartData(transformed);
      }
    };

    fetchChartData();
  }, []);

  return (
    <div className="admin-graphs">
      <h1>Best Selling Price per Variant</h1>
      <h3>At which price each variant sold the most</h3>

      <BarChart
        data={chartData}
        colors={["#6ba1a9", "#547792"]}
        height="25vh"
        width="40vw"
        download={{ background: "#fff" }}
        library={{
            scales: {
            y: {
                ticks: {
                font: {
                    size: 14,
                    weight: "bold",
                },
                color: "#1f2937",
                },
            },
            x: {
                ticks: {
                font: {
                    size: 14,
                },
                },
            },
            },
        }}
      />
    </div>
  );
};

export default BestSellingVariantChart;
