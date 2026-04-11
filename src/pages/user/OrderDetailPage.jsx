import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getOrderByIdApi } from "../../api/orderApi";
import styles from "../../styles/OrderDetail.module.css";
import logoImage from "../../assets/logo.png";
import {
  getResolvedOrderItemImage,
  hydrateOrderItemsWithImages,
} from "../../utils/orderItemImage";

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const role = localStorage.getItem("role") || sessionStorage.getItem("role");
  const isAdminPreview = role === "ADMIN";

  const formatPrice = (value) =>
    Number(value || 0).toLocaleString("vi-VN") + " đ";

  const fetchOrder = async () => {
    try {
      const data = await getOrderByIdApi(id);
      const hydratedItems = await hydrateOrderItemsWithImages(
        data?.items || [],
      );

      console.log("ORDER ITEMS:", data?.items);
      console.log("HYDRATED ITEMS:", hydratedItems);
      setOrder({
        ...data,
        items: hydratedItems,
      });
    } catch (error) {
      console.error("Fetch order detail error:", error);
      setError(
        isAdminPreview
          ? "Admin đang ở chế độ xem user nên không có dữ liệu đơn hàng này."
          : "Không thể tải chi tiết đơn hàng.",
      );
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (error) return <div className={styles.loading}>{error}</div>;

  if (!order) return <div className={styles.loading}>Đang tải...</div>;

  return (
    <div className={styles.container}>
      {/* BACK */}
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        <ArrowLeft size={18} />
        Quay lại
      </button>

      {/* TITLE */}
      <h2 className={styles.pageTitle}>Đơn hàng {order.orderCode}</h2>

      <div className={styles.wrapper}>
        {/* LEFT BLOCK */}
        <div className={styles.card}>
          <div className={styles.left}>
            <h3>Thông tin đơn hàng</h3>

            <div className={styles.info}>
              <p>
                <b>Trạng thái:</b> {order.statusDisplay}
              </p>
              <p>
                <b>Thanh toán:</b> {order.paymentMethodDisplay}
              </p>
              <p>
                <b>TT thanh toán:</b> {order.paymentStatusDisplay}
              </p>
              <p>
                <b>Ngày đặt:</b>{" "}
                {new Date(order.createdAt).toLocaleString("vi-VN")}
              </p>
            </div>

            <div className={styles.customer}>
              <h3>Thông tin nhận hàng</h3>

              <p>
                <b>Khách hàng:</b> {order.customerName}
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

              {order.note && (
                <p className={styles.note}>
                  <b>Ghi chú:</b> {order.note}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT BLOCK */}
        <div className={styles.card}>
          <div className={styles.right}>
            <h3>Sản phẩm</h3>

            <div className={styles.products}>
              {order.items?.map((item, index) => (
                <div key={item.id || index} className={styles.product}>
                  <img
                    src={getResolvedOrderItemImage(item) || logoImage}
                    alt={item.productName}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = logoImage;
                    }}
                  />

                  <div className={styles.productInfo}>
                    <div className={styles.productName}>{item.productName}</div>
                    <div>Số lượng: {item.quantity}</div>
                    <div className={styles.price}>
                      {formatPrice(item.price)}
                    </div>
                    <div>Tạm tính: {formatPrice(item.subtotal)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.summary}>
              <div className={styles.row}>
                <span>Tạm tính</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>

              <div className={styles.row}>
                <span>Phí vận chuyển</span>
                <span>{formatPrice(order.shippingFee)}</span>
              </div>

              <div className={styles.row}>
                <span>Giảm giá</span>
                <span className={styles.discount}>
                  -{formatPrice(order.discount)}
                </span>
              </div>

              <div className={styles.total}>
                <span>Tổng thanh toán</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
