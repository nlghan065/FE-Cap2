import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from "../../styles/OrderSuccess.module.css";
import { getOrderByIdApi, getOrderByCodeApi } from "../../api/orderApi";

function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);

  const pendingOrderId = localStorage.getItem("pendingOrderId");
  const orderIdFromState = location.state?.orderId;

  const finalId = pendingOrderId || orderIdFromState;

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!finalId) return;

        let data = null;

        if (finalId.startsWith("ORD")) {
          data = await getOrderByCodeApi(finalId);
        } else {
          data = await getOrderByIdApi(finalId);
        }

        setOrder(data);

        localStorage.removeItem("pendingOrderId");
      } catch (error) {
        console.error("Fetch order failed:", error);
      }
    };

    fetchOrder();
  }, [finalId]);
  useEffect(() => {
    if (!finalId) return;

    const interval = setInterval(async () => {
      try {
        let data = null;

        if (finalId.startsWith("ORD")) {
          data = await getOrderByCodeApi(finalId);
        } else {
          data = await getOrderByIdApi(finalId);
        }

        setOrder(data);

        // ✅ nếu đã PAID thì dừng
        if (data?.paymentMethod !== "VNPAY" || data?.paymentStatus === "PAID") {
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Retry fetch order failed:", error);
      }
    }, 3000); // retry mỗi 3s

    return () => clearInterval(interval);
  }, [finalId]);

  // ✅ CHỐNG fake success
  if (order?.paymentMethod === "VNPAY" && order?.paymentStatus !== "PAID") {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <h2>Đang xác minh thanh toán...</h2>
        <p>Hệ thống đang xác nhận với VNPay, vui lòng đợi vài giây</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>✔</div>

        <h1 className={styles.title}>Đặt hàng thành công! 🎉</h1>

        <p className={styles.subtitle}>
          Cảm ơn bạn đã mua sắm tại AI Interior Design. <br />
          Đơn hàng của bạn đang được xử lý.
        </p>

        <div className={styles.infoBox}>
          <div className={styles.row}>
            <div>
              <p className={styles.label}>Mã đơn hàng</p>
              <p className={styles.value}>{order?.orderCode || "#---"}</p>
            </div>

            <div>
              <p className={styles.label}>Tổng tiền</p>
              <p className={styles.price}>
                {order?.totalAmount != null
                  ? Number(order.totalAmount).toLocaleString("vi-VN") + " đ"
                  : "---"}
              </p>
            </div>
          </div>

          <div className={styles.row}>
            <div>
              <p className={styles.label}>Phương thức thanh toán</p>
              <p className={styles.value}>{order?.paymentMethod || "VNPay"}</p>
            </div>

            <div>
              <p className={styles.label}>Dự kiến giao hàng</p>
              <p className={styles.value}>2-3 ngày</p>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.primaryBtn}
            onClick={() => navigate("/orders")}
          >
            Xem đơn hàng
          </button>

          <button className={styles.secondaryBtn} onClick={() => navigate("/")}>
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;
