import { useEffect, useState } from "react";

import AdminHeader from "../../layout/admin/AdminHeader";
import AdminMenu from "../../layout/admin/AdminMenu";

import RevenueBarChart from "../../components/admin/BarChart";
import OrderPieChart from "../../components/admin/PieChart";
import RecentOrders from "../../components/admin/RecentOrders";
import TopProducts from "../../components/admin/TopProducts";

import { getDashboardOverviewApi } from "../../api/dashboardApi";

import { DollarSign, ShoppingCart, Package, Users } from "lucide-react";

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
        {/* Tổng doanh thu */}
        <div className={`${styles.card} ${styles.green}`}>
          <div className={styles.cardContent}>
            <div className={styles.iconGreen}>
              <DollarSign size={26} />
            </div>

            <div className={styles.cardInfo}>
              <p>Tổng doanh thu</p>
              <h2>
                {overview
                  ? overview.totalRevenue.toLocaleString("vi-VN") + " ₫"
                  : "0 ₫"}
              </h2>
            </div>
          </div>
        </div>

        {/* Đơn hàng */}
        <div className={`${styles.card} ${styles.blue}`}>
          <div className={styles.cardContent}>
            <div className={styles.iconBlue}>
              <ShoppingCart size={26} />
            </div>

            <div className={styles.cardInfo}>
              <p>Đơn hàng mới</p>
              <h2>{overview ? overview.totalOrders : 0}</h2>
            </div>
          </div>
        </div>

        {/* Sản phẩm */}
        <div className={`${styles.card} ${styles.purple}`}>
          <div className={styles.cardContent}>
            <div className={styles.iconPurple}>
              <Package size={26} />
            </div>

            <div className={styles.cardInfo}>
              <p>Sản phẩm</p>
              <h2>{overview ? overview.totalProducts : 0}</h2>
            </div>
          </div>
        </div>

        {/* Khách hàng */}
        <div className={`${styles.card} ${styles.orange}`}>
          <div className={styles.cardContent}>
            <div className={styles.iconOrange}>
              <Users size={26} />
            </div>

            <div className={styles.cardInfo}>
              <p>Khách hàng</p>
              <h2>{overview ? overview.totalCustomers : 0}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.charts}>
        <div className={styles.chartBox}>
          <RevenueBarChart />
        </div>

        <div className={styles.chartBox}>
          <OrderPieChart />
        </div>

        <div className={styles.topProductsSection}>
          <TopProducts />
        </div>

        <div className={styles.recentOrdersSection}>
          <RecentOrders />
        </div>
      </div>
      {/* RECENT ORDERS */}
    </div>
  );
}

export default Dashboard;
