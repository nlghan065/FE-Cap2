import { useEffect, useState } from "react";
import {
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  ShoppingCart,
  RotateCcw,
} from "lucide-react";
import { Link } from "react-router-dom";

import styles from "../../styles/Admin.module.css";
import { getRecentOrdersApi } from "../../api/dashboardApi";

function RecentOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // =========================
  // FETCH DATA
  // =========================
  const fetchOrders = async () => {
    try {
      setRefreshing(true);

      const res = await getRecentOrdersApi(5);
      setOrders(res || []);
    } catch (error) {
      console.error("Lỗi lấy đơn:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, 30000); // auto refresh 30s

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    fetchOrders();
  };

  // =========================
  // FORMAT
  // =========================
  const formatMoney = (value) => {
    if (!value) return "0 ₫";
    return Number(value).toLocaleString("vi-VN") + " ₫";
  };

  const formatOrderCode = (code, id) => {
    if (code) return code.startsWith("#") ? code : `#${code}`;
    if (id) return `#${id}`;
    return "#---";
  };

  // =========================
  // STATUS
  // =========================
  const statusMap = {
    PENDING: {
      label: "Chờ xử lý",
      className: styles.processing,
      icon: <Clock size={14} />,
    },
    PROCESSING: {
      label: "Đang xử lý",
      className: styles.processing,
      icon: <Clock size={14} />,
    },
    CONFIRMED: {
      label: "Đã xác nhận",
      className: styles.confirmed,
      icon: <CheckCircle size={14} />,
    },
    SHIPPING: {
      label: "Đang giao",
      className: styles.shipping,
      icon: <Truck size={14} />,
    },
    DELIVERED: {
      label: "Đã giao",
      className: styles.delivered,
      icon: <CheckCircle size={14} />,
    },
    CANCELLED: {
      label: "Đã huỷ",
      className: styles.cancelled,
      icon: <XCircle size={14} />,
    },
  };

  const renderStatus = (status) => {
    const s = statusMap[status];
    if (!s) return <span className={styles.status}>{status || "N/A"}</span>;

    return (
      <span className={`${styles.status} ${s.className}`}>
        {s.icon} {s.label}
      </span>
    );
  };

  // =========================
  // PAYMENT
  // =========================
  const paymentMap = {
    PAID: { label: "Đã thanh toán", className: styles.paid },
    FAILED: { label: "Thất bại", className: styles.failed },
    PENDING: { label: "Chưa thanh toán", className: styles.pending },
  };

  const renderPayment = (paymentStatus) => {
    const p = paymentMap[paymentStatus];
    if (!p) return null;

    return (
      <span className={`${styles.payment} ${p.className}`}>{p.label}</span>
    );
  };

  // =========================
  // UI
  // =========================
  if (loading) {
    return <div className={styles.card}>Đang tải đơn hàng...</div>;
  }

  return (
    <div className={styles.card}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.title}>
          <div className={styles.icon}>
            <ShoppingCart size={18} />
          </div>
          <h3>Đơn hàng gần đây</h3>

          {/* RESET BUTTON */}
          <button
            onClick={handleReset}
            disabled={refreshing}
            className={styles.resetBtn}
          >
            <RotateCcw size={16} />
            {refreshing ? "Đang cập nhật..." : ""}
          </button>
        </div>

        <Link to="/admin/orders" className={styles.viewAll}>
          Xem đơn hàng →
        </Link>
      </div>

      {/* LIST */}
      <div className={styles.list}>
        {orders.length === 0 ? (
          <p>Không có đơn hàng</p>
        ) : (
          orders.map((order, index) => (
            <div
              key={order._id || order.orderCode || index}
              className={`${styles.item} ${
                order.paymentStatus === "FAILED" ? styles.failedBorder : ""
              }`}
            >
              {/* LEFT */}
              <div className={styles.left}>
                <span className={styles.orderCode}>
                  {formatOrderCode(order.orderCode, order._id)}
                </span>

                <span className={styles.customerName}>
                  {order.customerName || "Khách lẻ"}
                </span>
              </div>

              {/* RIGHT */}
              <div className={styles.right}>
                <strong className={styles.price}>
                  {formatMoney(order.totalAmount)}
                </strong>

                {renderStatus(order.status)}
                {renderPayment(order.paymentStatus)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RecentOrders;
