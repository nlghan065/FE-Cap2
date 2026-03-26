import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminHeader from "../../layout/admin/AdminHeader";
import AdminMenu from "../../layout/admin/AdminMenu";
import styles from "../../styles/Admin.module.css";
import { Pencil } from "lucide-react";
import { getOrderByIdAdminApi } from "../../api/orderAdminApi";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatMoney = (v) => {
    const num = Number(v);
    if (isNaN(num)) return "0 đ";
    return num.toLocaleString("vi-VN") + " đ";
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getOrderByIdAdminApi(id);
        setOrder(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!order) return <div>Không tìm thấy đơn hàng</div>;

  return (
    <div className={styles.adminDashboard}>
      <AdminHeader />
      <AdminMenu />

      <div className={styles.productDetailContainer}>
        {/* HEADER */}
        <div className={styles.titleRow}>
          <h2 className={styles.title}>Đơn {order.orderCode}</h2>
          <button
            className={styles.editBtn}
            onClick={() => navigate(`/admin/orders/${id}/edit`)}
          >
            <Pencil size={16} />
          </button>
        </div>

        {/* 🔥 WRAPPER 2 KHUNG */}
        <div className={styles.orderWrapper}>
          {/* ===== KHUNG 1: THÔNG TIN ===== */}
          <div className={styles.orderCard}>
            <h3>Thông tin đơn hàng</h3>

            <p>
              <b>Khách:</b> {order.customerName}
            </p>
            <p>
              <b>Email:</b> {order.customerEmail}
            </p>
            <p>
              <b>SĐT:</b> {order.customerPhone}
            </p>
            <p>
              <b>Địa chỉ:</b> {order.fullShippingAddress}
            </p>

            <p>
              <b>Thanh toán:</b> {order.paymentMethodDisplay}
            </p>
            <p>
              <b>TT thanh toán:</b> {order.paymentStatusDisplay}
            </p>
            <p>
              <b>Trạng thái:</b> {order.statusDisplay}
            </p>

            <p>
              <b>Ngày tạo:</b>{" "}
              {new Date(order.createdAt).toLocaleString("vi-VN")}
            </p>

            <p>
              <b>Ghi chú:</b> {order.note || "—"}
            </p>
          </div>

          {/* ===== KHUNG 2: SẢN PHẨM + TIỀN ===== */}
          <div className={styles.orderCard}>
            <h3>Danh sách sản phẩm</h3>

            {order.items?.map((item, i) => (
              <div key={i} className={styles.orderItem}>
                <img src={item.productImage} alt="" />
                <div>
                  <p>
                    <b>{item.productName}</b>
                  </p>
                  <p>SL: {item.quantity}</p>
                  <p>Giá: {formatMoney(item.price)}</p>
                  <p>Tạm tính: {formatMoney(item.subtotal)}</p>
                </div>
              </div>
            ))}

            {/* TOTAL */}
            <div className={styles.orderSummary}>
              <p>Tạm tính: {formatMoney(order.subtotal)}</p>
              <p>Phí ship: {formatMoney(order.shippingFee)}</p>
              <p>Giảm giá: -{formatMoney(order.discount)}</p>
              <h3>Tổng: {formatMoney(order.totalAmount)}</h3>
            </div>
          </div>
        </div>

        <button
          className={styles.backBtn}
          onClick={() => navigate("/admin/orders")}
        >
          ← Quay lại
        </button>
      </div>
    </div>
  );
};

export default OrderDetail;
