import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { useEffect, useState } from "react";
import { getRevenueMonthlyApi } from "../../api/dashboardApi";
import styles from "../../styles/Chart.module.css";

function RevenueBarChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await getRevenueMonthlyApi(12);

        const now = new Date();
        const months = [];

        // tạo 12 tháng gần nhất
        for (let i = 11; i >= 0; i--) {
          const d = new Date();
          d.setMonth(now.getMonth() - i);

          const month = d.getMonth() + 1;
          const year = d.getFullYear();

          months.push({
            key: `${month}-${year}`,
            month: `${month}/${year}`,
            revenue: 0,
          });
        }

        // map dữ liệu API
        res.forEach((item) => {
          const key = `${item.month}-${item.year}`;
          const index = months.findIndex((m) => m.key === key);

          if (index !== -1) {
            months[index].revenue = item.revenue;
          }
        });

        setData(months);
      } catch (error) {
        console.log("Revenue API error:", error);
      }
    };

    fetchRevenue();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipTitle}>Tháng {label}</p>
          <p className={styles.tooltipRevenue}>
            {payload[0].value.toLocaleString("vi-VN")} ₫
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}>Doanh thu 12 tháng gần nhất</h3>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis
            dataKey="month"
            tick={{ fill: "#6b7280", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tickFormatter={(v) => (v / 1000000).toFixed(0) + "M"}
            tick={{ fill: "#6b7280", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
          />

          <Bar
            dataKey="revenue"
            fill="#14b8a6"
            radius={[6, 6, 0, 0]}
            barSize={32}
            animationDuration={1200}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RevenueBarChart;
