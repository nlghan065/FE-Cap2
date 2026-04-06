import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/Cart.module.css";
import { createOrderApi } from "../../api/orderApi";
import { getCartApi } from "../../api/cartApi";
import { createVnpayPaymentApi } from "../../api/paymentApi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  CreditCard,
  ShoppingCart,
  User,
  Truck,
  ShieldCheck,
} from "lucide-react";

function Payment() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [discountCode, setDiscountCode] = useState("");
  const [loading, setLoading] = useState(false);

  const checkout = JSON.parse(localStorage.getItem("checkout") || "{}");
  const formatPrice = (p) => p.toLocaleString("vi-VN") + " đ";

  const calculateShipping = (subtotal) => (subtotal > 500000 ? 0 : 300000);

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

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = calculateShipping(subtotal);

  const discountRaw = (() => {
    if (!discountCode) return 0;
    switch (discountCode.toUpperCase()) {
      case "SALE10":
        return subtotal * 0.1;
      case "SALE20":
        return subtotal * 0.2;
      default:
        return 0;
    }
  })();

  const discount = Math.min(discountRaw, subtotal + shipping);
  const total = Math.max(0, subtotal + shipping - discount);

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

  const handleOrder = async () => {
    if (loading) return;
    if (!validateCheckout()) return;

    try {
      setLoading(true);

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
        totalPrice: total,
      });

      if (paymentMethod === "COD") {
        toast.success("Đặt hàng thành công!");
        localStorage.removeItem("checkout");
        localStorage.removeItem("pendingOrderId");
        setTimeout(() => {
          navigate("/order-success", { state: { order } });
        }, 800);
        return;
      }

      if (paymentMethod === "VNPAY") {
        const res = await createVnpayPaymentApi(order.id);
        if (!res?.paymentUrl) {
          toast.error("Không tạo được link thanh toán");
          return;
        }
        localStorage.setItem("pendingOrderId", order.id);
        window.location.href = res.paymentUrl;
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

  return (
    <div className={styles.container}>
      {/* STEPS */}
      <div className={styles.steps}>
        <div className={styles.stepItem}>
          <div className={`${styles.circle} ${styles.done}`}>
            <ShoppingCart size={16} />
          </div>
          <span className={styles.labelActive}>Giỏ hàng</span>
        </div>

        <div className={styles.line} />

        <div className={styles.stepItem}>
          <div className={`${styles.circle} ${styles.done}`}>
            <User size={16} />
          </div>
          <span className={styles.labelActive}>Thông tin</span>
        </div>

        <div className={`${styles.line} ${styles.lineActive}`} />

        <div className={styles.stepItem}>
          <div className={`${styles.circle} ${styles.active}`}>
            <CreditCard size={16} />
          </div>
          <span className={styles.labelActive}>Thanh toán</span>
        </div>
      </div>
      <h2 className={styles.titlegh}>Thanh toán</h2>

      <div className={styles.wrapper}>
        {/* LEFT */}
        <div className={styles.cartList}>
          {/* Mã giảm giá */}
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
            </div>
          </div>

          {/* Phương thức thanh toán */}
          <div className={styles.formCard}>
            <h3>Phương thức thanh toán</h3>
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

          {/* Buttons */}
          <div className={styles.stepActions}>
            <button
              onClick={() => navigate("/cart2")}
              className={styles.cancelBtn}
            >
              Quay lại
            </button>
            <button
              onClick={handleOrder}
              className={styles.checkoutBtn}
              disabled={loading || cart.length === 0}
            >
              {loading ? "Đang xử lý..." : "Đặt hàng"}
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className={styles.summary}>
          <h3 className={styles.summaryTitle}>Tóm tắt đơn hàng</h3>

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
            <span>Phí ship</span>
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

          <div className={styles.boxGreen}>
            <Truck size={18} />
            <div>
              <b>Miễn phí vận chuyển</b>
              <span>Đơn từ 500.000₫</span>
            </div>
          </div>

          <div className={styles.boxBlue}>
            <ShieldCheck size={18} />
            <div>
              <b>Bảo hành 24 tháng</b>
              <span>Đổi trả 7 ngày</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;
