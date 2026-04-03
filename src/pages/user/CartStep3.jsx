import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOrderApi } from "../../api/orderApi";
import { createVNPayPayment } from "../../api/paymentApi";

function CartStep3() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cartData = JSON.parse(localStorage.getItem("cart")) || [];
    const checkout = JSON.parse(localStorage.getItem("checkout"));

    setCart(cartData);
    setInfo(checkout);
  }, []);

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleVNPay = async () => {
    try {
      setLoading(true);

      // 🔥 1. CREATE ORDER
      const res = await createOrderApi({
        name: info.name,
        phone: info.phone,
        address: info.address,
      });

      const orderId = res.data.data.id;

      // lưu lại để dùng ở success
      localStorage.setItem("orderId", orderId);

      // 🔥 2. CREATE PAYMENT URL
      const pay = await createVNPayPayment(orderId);

      const url = pay.data.data;

      // 🔥 3. REDIRECT
      window.location.href = url;
    } catch (err) {
      console.log(err);
      alert("Thanh toán thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Thanh toán</h2>

      <h3>Thông tin</h3>
      <p>{info?.name}</p>
      <p>{info?.phone}</p>
      <p>{info?.address}</p>

      <h3>Đơn hàng</h3>
      {cart.map((i) => (
        <div key={i.id}>
          {i.name} x{i.quantity}
        </div>
      ))}

      <h3>Tổng: {total.toLocaleString("vi-VN")} đ</h3>

      <button onClick={handleVNPay} disabled={loading}>
        {loading ? "Đang xử lý..." : "Thanh toán VNPay"}
      </button>
    </div>
  );
}

export default CartStep3;
