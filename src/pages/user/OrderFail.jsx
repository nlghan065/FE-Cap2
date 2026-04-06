import { useNavigate, useLocation } from "react-router-dom";

function OrderFail() {
  const navigate = useNavigate();
  const location = useLocation();

  const orderId = location.state?.orderId;

  return (
    <div style={{ textAlign: "center", marginTop: 100 }}>
      <h1 style={{ color: "red" }}>❌ Thanh toán thất bại</h1>

      <p>Đơn hàng chưa được thanh toán.</p>

      {orderId && (
        <p>
          Mã đơn: <b>{orderId}</b>
        </p>
      )}

      <div style={{ marginTop: 20 }}>
        <button onClick={() => navigate("/payment")}>Thử lại</button>

        <button style={{ marginLeft: 10 }} onClick={() => navigate("/")}>
          Về trang chủ
        </button>
      </div>
    </div>
  );
}

export default OrderFail;
