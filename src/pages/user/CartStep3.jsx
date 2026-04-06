import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/Cart.module.css";
import { createOrderApi } from "../../api/orderApi";
import { getCartApi } from "../../api/cartApi";
import { createVnpayPaymentApi } from "../../api/paymentApi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Payment() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [discountCode, setDiscountCode] = useState("");
  const [loading, setLoading] = useState(false);

  const checkout = JSON.parse(localStorage.getItem("checkout") || "{}");

  const formatPrice = (p) => p.toLocaleString("vi-VN") + " đ";

  // ================= SHIPPING =================
  const calculateShipping = (subtotal) => {
    return subtotal > 500000 ? 0 : 30000; // 🔥 sửa 300k -> 30k
  };

  // ================= LOAD CART =================
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const data = await getCartApi();
      setCart(data.items || []);
    } catch {
      toast.error("Lỗi tải giỏ hàng");
    }
  };

  // ================= TOTAL =================
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = calculateShipping(subtotal);

  const discount = (() => {
    if (!discountCode) return 0;

    switch (discountCode.toUpperCase()) {
      case "FREESHIP":
        return shipping;
      case "SALE10":
        return subtotal * 0.1;
      case "SALE20":
        return subtotal * 0.2;
      default:
        return 0;
    }
  })();

  const total = Math.max(0, subtotal + shipping - discount);

  // ================= VALIDATE =================
  const validateCheckout = () => {
    if (!checkout.name || !checkout.phone) {
      toast.error("Thiếu tên hoặc số điện thoại");
      return false;
    }

    if (!checkout.address || !checkout.ward) {
      toast.error("Thiếu địa chỉ");
      return false;
    }

    if (!checkout.city && !checkout.province) {
      toast.error("Thiếu tỉnh/thành");
      return false;
    }

    if (cart.length === 0) {
      toast.error("Giỏ hàng trống");
      return false;
    }

    return true;
  };

  // ================= SUBMIT =================
  const handleOrder = async () => {
    if (loading) return;
    if (!validateCheckout()) return;

    try {
      setLoading(true);

      // 1️⃣ Tạo order
      const order = await createOrderApi({
        customerName: checkout.name,
        customerPhone: checkout.phone,
        shippingAddress: checkout.address,
        shippingCity: checkout.city || null,
        shippingProvince: checkout.province || null,
        shippingWard: checkout.ward,
        note: checkout.note || "",
        paymentMethod,
        discountCode: discountCode || "",
      });

      // ================= COD =================
      if (paymentMethod === "COD") {
        toast.success("Đặt hàng thành công!");

        localStorage.removeItem("checkout");

        setTimeout(() => {
          navigate("/order-success", {
            state: { order },
          });
        }, 800);

        return;
      }

      // ================= VNPAY =================
      if (paymentMethod === "VNPAY") {
        const res = await createVnpayPaymentApi(order.id);

        const paymentUrl = res.paymentUrl;

        if (!paymentUrl) {
          toast.error("Không tạo được link thanh toán");
          return;
        }
        localStorage.setItem("pendingOrderId", order.id);
        // 👉 redirect
        window.location.href = paymentUrl;
      }
    } catch (err) {
      console.error(err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Đặt hàng thất bại";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <div className={styles.container}>
      <h2 className={styles.titlegh}>Thanh toán</h2>

      <div className={styles.wrapper}>
        {/* LEFT */}
        <div className={styles.cartList}>
          {/* DISCOUNT */}
          <div className={styles.formCard}>
            <h3>Mã giảm giá</h3>

            <input
              placeholder="Nhập mã"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
            />

            <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
              <button onClick={() => setDiscountCode("SALE10")}>SALE10</button>
              <button onClick={() => setDiscountCode("SALE20")}>SALE20</button>
              <button onClick={() => setDiscountCode("FREESHIP")}>
                FREESHIP
              </button>
            </div>
          </div>

          {/* PAYMENT */}
          <div className={styles.formCard}>
            <h3>Thanh toán</h3>

            <label>
              <input
                type="radio"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
              />
              COD
            </label>

            <label>
              <input
                type="radio"
                checked={paymentMethod === "VNPAY"}
                onChange={() => setPaymentMethod("VNPAY")}
              />
              VNPay
            </label>
          </div>

          {/* ACTION */}
          <div className={styles.stepActions}>
            <button onClick={() => navigate("/cart2")} disabled={loading}>
              Quay lại
            </button>

            <button
              onClick={handleOrder}
              disabled={loading || cart.length === 0}
            >
              {loading ? "Đang xử lý..." : "Đặt hàng"}
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className={styles.summary}>
          <h3 className={styles.summaryTitle}>Tóm tắt</h3>

          {cart.map((item) => (
            <div key={item.productId} className={styles.summaryItemBig}>
              <div>
                {item.productName} x{item.quantity}
              </div>
              <div>{formatPrice(item.price * item.quantity)}</div>
            </div>
          ))}

          <hr />

          <div className={styles.summaryRow}>
            <span>Tạm tính</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <div className={styles.summaryRow}>
            <span>Ship</span>
            <span>{formatPrice(shipping)}</span>
          </div>

          <div className={styles.summaryRow}>
            <span>Giảm</span>
            <span>-{formatPrice(discount)}</span>
          </div>

          <div className={styles.totalBig}>
            <span>Tổng</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}

export default Payment;
