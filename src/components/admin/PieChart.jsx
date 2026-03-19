import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { useEffect, useState } from "react";
import { getOrderStatusSummaryApi } from "../../api/dashboardApi";
import styles from "../../styles/Chart.module.css";
import { useDashboardRefresh } from "../../context/DashboardRefreshContext";

const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

function OrderPieChart() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);

  const { refreshKey } = useDashboardRefresh();

  const fetchOrders = async () => {
    try {
      const res = await getOrderStatusSummaryApi();

      const completed = res.delivered || 0;

      const processing =
        (res.pending || 0) + (res.confirmed || 0) + (res.shipping || 0);

      const cancelled = res.cancelled || 0;

      const formatted = [
        { name: "Hoàn thành", value: completed },
        { name: "Đang xử lý", value: processing },
        { name: "Đã huỷ", value: cancelled },
      ];

      setData(formatted);
      setTotal(completed + processing + cancelled);
    } catch (error) {
      console.log("Order API error:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [refreshKey]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipTitle}>{payload[0].name}</p>
          <p className={styles.tooltipValue}>{payload[0].value} đơn</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}>Trạng thái đơn hàng</h3>

      <div className={styles.pieWrapper}>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={data.filter((d) => d.value > 0).length > 1 ? 3 : 0}
              stroke="none"
              label={false}
              labelLine={false}
              animationDuration={900}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>

            <Tooltip content={<CustomTooltip />} cursor={false} />

            <Legend
              iconType="circle"
              wrapperStyle={{
                fontSize: "14px",
                paddingTop: "10px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className={styles.pieCenter}>
          <span className={styles.pieTotal}>{total}</span>
          <span className={styles.pieLabel}>đơn</span>
        </div>
      </div>
    </div>
  );
}

export default OrderPieChart;
