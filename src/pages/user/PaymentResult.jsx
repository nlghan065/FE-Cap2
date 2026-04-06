import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function PaymentResult() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const responseCode = params.get("vnp_ResponseCode");
    const transactionStatus = params.get("vnp_TransactionStatus");

    const success = responseCode === "00" && transactionStatus === "00";

    const orderId = localStorage.getItem("pendingOrderId");

    // delay nhẹ cho UX
    setTimeout(() => {
      if (success) {
        navigate("/order-success", {
          state: { orderId },
        });
      } else {
        navigate("/order-fail", {
          state: { orderId },
        });
      }

      localStorage.removeItem("pendingOrderId");
    }, 1200);
  }, [location, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: 100 }}>
      <h2>Đang xử lý thanh toán...</h2>
      <p>Vui lòng chờ...</p>
    </div>
  );
}

export default PaymentResult;
