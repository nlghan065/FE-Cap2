import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { verifyVnpayApi } from "../../api/paymentApi";

function PaymentResult() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleVerify = async () => {
      const params = new URLSearchParams(location.search);

      const pendingOrderId = sessionStorage.getItem("pendingOrderId");

      if (!pendingOrderId) {
        navigate("/");
        return;
      }

      try {
        // ✅ check nhanh từ VNPay trước
        const responseCode = params.get("vnp_ResponseCode");

        if (responseCode !== "00") {
          navigate("/order-fail", {
            state: { orderId: pendingOrderId },
          });
          return;
        }

        const res = await verifyVnpayApi(params.toString());

        // ✅ FIX ở đây
        const isSuccess = res?.success === true;

        if (isSuccess) {
          navigate("/order-success", {
            state: { orderId: pendingOrderId },
          });
        } else {
          navigate("/order-fail", {
            state: { orderId: pendingOrderId },
          });
        }
      } catch (error) {
        console.error("Verify error:", error);

        navigate("/order-fail", {
          state: { orderId: pendingOrderId },
        });
      } finally {
        sessionStorage.removeItem("pendingOrderId");
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
