import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

function PaymentReturn() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const status = params.get("vnp_ResponseCode");
    const orderId = localStorage.getItem("pendingOrderId");

    if (!orderId) {
      navigate("/");
      return;
    }

    if (status === "00") {
      toast.success("Thanh toán thành công!");
      localStorage.removeItem("checkout");
      localStorage.removeItem("pendingOrderId");

      navigate("/order-success");
    } else {
      toast.error("Thanh toán thất bại!");
      localStorage.removeItem("pendingOrderId");

      navigate("/payment-failed");
    }
  }, []);

  return <div>Đang xử lý thanh toán...</div>;
}

export default PaymentReturn;
