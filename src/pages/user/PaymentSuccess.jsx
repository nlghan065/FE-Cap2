import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

function PaymentSuccess() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState("processing");

  useEffect(() => {
    const vnpResponseCode = params.get("vnp_ResponseCode");

    if (vnpResponseCode === "00") {
      setStatus("success");
    } else {
      setStatus("fail");
    }

    // 🔥 clear cart sau khi thanh toán
    localStorage.removeItem("cart");
  }, []);

  return (
    <div style={{ padding: 40 }}>
      {status === "processing" && <h2>Đang xử lý...</h2>}

      {status === "success" && (
        <>
          <h2>🎉 Thanh toán thành công</h2>
          <p>Cảm ơn bạn đã mua hàng</p>
        </>
      )}

      {status === "fail" && (
        <>
          <h2>❌ Thanh toán thất bại</h2>
        </>
      )}
    </div>
  );
}

export default PaymentSuccess;
