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
      const data = await getOrderByIdAdminApi(id);
      setOrder(data);
      setStatus(data.status);
    };
    fetch();
  }, [id]);

  const handleSubmit = async () => {
    try {
      setSaving(true);
      await updateOrderStatusApi(id, status);
      navigate("/admin/orders");
    } catch (e) {
      console.error(e);
      alert("Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  if (!order) return <div>Loading...</div>;

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

          <select
            className={`${styles.orderStatusSelect} ${
              styles[`order_${status.toLowerCase()}`]
            }`}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="PENDING">Đang xử lý</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="SHIPPING">Đang giao</option>
            <option value="DELIVERED">Đã giao</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>

          <div className={styles.editActions}>
            <button
              className={styles.saveBtn}
              onClick={handleSubmit}
              disabled={saving}
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
