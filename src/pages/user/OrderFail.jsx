import { useNavigate, useLocation } from "react-router-dom";
import styles from "../../styles/OrderFail.module.css";

function OrderFail() {
  const navigate = useNavigate();
  const location = useLocation();

  const orderId = location.state?.orderId;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>❌</div>

        <h1 className={styles.title}>Thanh toán thất bại</h1>

        <p className={styles.subtitle}>
          Đơn hàng của bạn chưa được thanh toán hoặc đã bị huỷ.
        </p>

        {orderId && (
          <div className={styles.orderId}>
            Mã đơn: <b>{orderId}</b>
          </div>
        )}

        <div className={styles.actions}>
          <button
            className={styles.primaryBtn}
            onClick={() => navigate("/orders")}
          >
            Xem đơn hàng
          </button>

          <button
            className={styles.secondaryBtn}
            onClick={() => navigate("/home")}
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderFail;
