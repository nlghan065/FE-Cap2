import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminHeader from "../../layout/admin/AdminHeader";
import AdminMenu from "../../layout/admin/AdminMenu";
import styles from "../../styles/Admin.module.css";

import {
  getOrderByIdAdminApi,
  updateOrderStatusApi,
} from "../../api/orderAdminApi";

const OrderEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getOrderByIdAdminApi(id);
        setOrder(data);
        setStatus(data.status);
      } catch (e) {
        console.error(e);
        alert("Không tải được đơn hàng");
      }
    };
    fetch();
  }, [id]);

  if (!order) return <div>Loading...</div>;

  // 🚨 CHECK VNPAY
  const isVnpayNotPaid =
    order.paymentMethod === "VNPAY" && order.paymentStatus !== "PAID";

  // 🚨 LOCK đơn
  const isLocked = order.status === "DELIVERED" || order.status === "CANCELLED";

  // 🚨 FLOW hợp lệ
  const validFlow = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["SHIPPING", "CANCELLED"],
    SHIPPING: ["DELIVERED"],
  };

  const allowedStatuses = validFlow[order.status] || [];

  const handleSubmit = async () => {
    // ❌ không cho sửa nếu lock
    if (isLocked) {
      alert("Đơn này không thể cập nhật!");
      return;
    }

    // ❌ chặn VNPAY chưa thanh toán
    if (isVnpayNotPaid) {
      alert("Đơn chưa thanh toán VNPAY → không thể cập nhật!");
      return;
    }

    // ❌ chặn nhảy sai flow
    if (!allowedStatuses.includes(status) && status !== order.status) {
      alert("Trạng thái không hợp lệ!");
      return;
    }

    try {
      setSaving(true);

      await updateOrderStatusApi(id, status);

      if (status === "DELIVERED") {
        alert("Đã giao hàng → đã cộng số lượng bán!");
      }

      navigate("/admin/orders");
    } catch (e) {
      console.error(e);
      alert("Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.adminDashboard}>
      <AdminHeader />
      <AdminMenu />

      <div className={styles.profileWrapper}>
        <div className={styles.leftPanel}>
          <h2>Sửa đơn hàng</h2>

          <p>
            <b>Mã:</b> {order.orderCode}
          </p>

          <p>
            <b>Khách:</b> {order.customerName}
          </p>

          <p>
            <b>Thanh toán:</b> {order.paymentMethod} -{" "}
            <span
              style={{
                color:
                  order.paymentStatus === "PENDING"
                    ? "orange"
                    : order.paymentStatus === "FAILED"
                      ? "red"
                      : "green",
              }}
            >
              {order.paymentStatus}
            </span>
          </p>

          {/* 🚨 DISABLE nếu chưa thanh toán */}
          <select
            className={`${styles.orderStatusSelect} ${
              styles[`order_${status.toLowerCase()}`]
            }`}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={isLocked || isVnpayNotPaid}
          >
            {/* luôn cho chọn current */}
            <option value={order.status}>{order.status}</option>

            {/* chỉ show trạng thái hợp lệ */}
            {allowedStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {isVnpayNotPaid && (
            <p style={{ color: "red", marginTop: 10 }}>
              ⚠ Đơn chưa thanh toán VNPAY → không thể xử lý
            </p>
          )}

          <div className={styles.editActions}>
            <button
              className={styles.saveBtn}
              onClick={handleSubmit}
              disabled={saving || isLocked || isVnpayNotPaid}
            >
              {saving ? "Đang lưu..." : "Cập nhật"}
            </button>

            <button className={styles.cancelBtn} onClick={() => navigate(-1)}>
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderEdit;
