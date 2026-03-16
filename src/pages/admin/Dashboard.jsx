import { useEffect, useState } from "react";

import AdminHeader from "../../layout/admin/AdminHeader";
import AdminMenu from "../../layout/admin/AdminMenu";

import RevenueBarChart from "../../components/admin/BarChart";
import OrderPieChart from "../../components/admin/PieChart";

import { getDashboardOverviewApi } from "../../api/dashboardApi";

import styles from "../../styles/Admin.module.css";

function Dashboard() {
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await getDashboardOverviewApi();
        console.log("Dashboard overview:", res);
        setOverview(res);
      } catch (error) {
        console.log("Overview API error:", error);
      }
    };

    fetchOverview();
  }, []);

  return (
    <div className={styles.adminDashboard}>
      <AdminHeader />

      <AdminMenu />

      <div className={styles.stats}>
        <div className={`${styles.card} ${styles.green}`}>
          <p>Tổng doanh thu</p>
          <h2>
            {overview
              ? overview.totalRevenue.toLocaleString("vi-VN") + " ₫"
              : "0 ₫"}
          </h2>
        </div>

        <div className={`${styles.card} ${styles.blue}`}>
          <p>Đơn hàng mới</p>
          <h2>{overview ? overview.totalOrders : 0}</h2>
        </div>

        <div className={`${styles.card} ${styles.purple}`}>
          <p>Sản phẩm</p>
          <h2>{overview ? overview.totalProducts : 0}</h2>
        </div>

        <div className={`${styles.card} ${styles.orange}`}>
          <p>Khách hàng</p>
          <h2>{overview ? overview.totalCustomers : 0}</h2>
        </div>
      </div>

      <div className={styles.charts}>
        <div className={styles.chartBox}>
          <RevenueBarChart />
        </div>

        <div className={styles.chartBox}>
          <OrderPieChart />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
