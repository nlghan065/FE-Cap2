import { useLocation, useNavigate } from "react-router-dom";

function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const order = location.state?.order;
  const orderId = location.state?.orderId;

  return (
    <div style={{ textAlign: "center", marginTop: 100 }}>
      <h1 style={{ color: "green" }}>🎉 Đặt hàng thành công!</h1>

      {order?.orderCode && (
        <p>
          Mã đơn hàng: <b>{order.orderCode}</b>
        </p>
      )}

      {orderId && (
        <p>
          ID đơn hàng: <b>{orderId}</b>
        </p>
      )}

      <p>Cảm ơn bạn đã mua hàng ❤️</p>

      <div style={{ marginTop: 20 }}>
        <button onClick={() => navigate("/")}>Về trang chủ</button>

        <button style={{ marginLeft: 10 }} onClick={() => navigate("/orders")}>
          Xem đơn hàng
        </button>
      </div>
    </div>
  );
}

export default OrderSuccess;
