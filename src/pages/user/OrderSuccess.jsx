import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from "../../styles/OrderSuccess.module.css";
import { getOrderByIdApi } from "../../api/orderApi";

function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const [order, setOrder] = useState(location.state?.order || null);
  const orderIdFromState = location.state?.orderId;

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // Ưu tiên lấy từ localStorage (VNPay redirect)
        const pendingOrderId = localStorage.getItem("pendingOrderId");

        const finalOrderId = pendingOrderId || orderIdFromState;

        if (!finalOrderId) return;

        const data = await getOrderByIdApi(finalOrderId);
        setOrder(data);

        // clear sau khi dùng
        localStorage.removeItem("pendingOrderId");
      } catch (error) {
        console.error("Fetch order failed:", error);
      }
    };

    fetchOrder();
  }, [orderIdFromState]);

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
                  ? order.totalAmount.toLocaleString() + " đ"
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
