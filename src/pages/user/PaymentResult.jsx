import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyVnpayApi } from "../../api/paymentApi";

function PaymentResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleVerify = async () => {
      const params = new URLSearchParams(location.search);
      const orderId = localStorage.getItem("pendingOrderId");

      try {
        // 👉 gửi toàn bộ query lên backend
        const res = await verifyVnpayApi(params.toString());

        if (res?.success) {
          navigate("/order-success", {
            state: { orderId },
          });
        } else {
          navigate("/order-fail", {
            state: { orderId },
          });
        }
      } catch (error) {
        console.error("Verify VNPay error:", error);

        navigate("/order-fail", {
          state: { orderId },
        });
      } finally {
        localStorage.removeItem("pendingOrderId");
        setLoading(false);
      }
    };

    handleVerify();
  }, [location, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: 100 }}>
      <h2>Đang xác minh thanh toán...</h2>
      <p>Vui lòng chờ, hệ thống đang xử lý với VNPay...</p>
    </div>
  );
}

export default PaymentResult;
