import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/Cart.module.css";
import { getCartApi, updateCartApi, deleteCartApi } from "../../api/cartApi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ShoppingCart,
  User,
  CreditCard,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { useLocation } from "react-router-dom";

function Cart() {
  const [cart, setCart] = useState([]);
  const [shipping, setShipping] = useState(0); // Lấy từ API
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const formatPrice = (p) => p.toLocaleString("vi-VN") + " đ";

  const location = useLocation();

  const getCurrentStep = () => {
    if (location.pathname === "/cart") return 1;
    if (location.pathname === "/cart2") return 2;
    if (location.pathname === "/payment") return 3;
    return 1;
  };

  const currentStep = getCurrentStep();
  const mapCartItem = (i) => ({
    id: i.productId,
    name: i.productName,
    price: i.price,
    quantity: i.quantity,
    image: i.productImage || "/no-image.png",
  });

  // 🔥 LOAD CART
  const fetchCart = async () => {
    setLoading(true);
    try {
      const data = await getCartApi();
      setCart((data.items || []).map(mapCartItem));
      setShipping(data.shippingFee ?? 500000); // fallback 50k nếu API ko trả
    } catch (err) {
      console.error(err);
      toast.error("Lỗi tải giỏ hàng!");
      setShipping(50000); // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // 🔥 UPDATE QUANTITY
  const updateQty = async (id, delta) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;

    // Nếu bấm '-' mà quantity = 1 → hiện toast hỏi xóa
    if (item.quantity === 1 && delta === -1) {
      toast.info("Nhấn ✕ để xóa sản phẩm khỏi giỏ hàng", {
        position: "top-center",
        autoClose: 5000,
        closeOnClick: true,
        pauseOnHover: true,
      });
      return;
    }

    const newQty = Math.max(1, item.quantity + delta);

    try {
      await updateCartApi(id, newQty);
      setCart((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity: newQty } : i)),
      );
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật số lượng thất bại!");
    }
  };

  // 🗑️ DELETE ITEM
  const removeItem = async (id) => {
    try {
      await deleteCartApi(id);
      setCart((prev) => prev.filter((i) => i.id !== id));
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
    } catch (err) {
      console.error(err);
      toast.error("Xóa sản phẩm thất bại!");
    }
  };

  // 🔥 TOTALS
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal + shipping;

  return (
    <div className={styles.container}>
      <div className={styles.steps}>
        {/* STEP 1 */}
        <div className={styles.stepItem}>
          <div
            className={`${styles.circle} ${
              currentStep > 1
                ? styles.done
                : currentStep === 1
                  ? styles.active
                  : ""
            }`}
          >
            {currentStep > 1 ? "✓" : <ShoppingCart size={16} />}
          </div>
          <span
            className={
              currentStep >= 1 ? styles.labelActive : styles.labelInactive
            }
          >
            Giỏ hàng
          </span>
        </div>

        <div
          className={`${styles.line} ${
            currentStep > 1 ? styles.lineActive : ""
          }`}
        ></div>

        {/* STEP 2 */}
        <div className={styles.stepItem}>
          <div
            className={`${styles.circle} ${
              currentStep > 2
                ? styles.done
                : currentStep === 2
                  ? styles.active
                  : ""
            }`}
          >
            {currentStep > 2 ? "✓" : <User size={16} />}
          </div>
          <span
            className={
              currentStep >= 2 ? styles.labelActive : styles.labelInactive
            }
          >
            Thông tin
          </span>
        </div>

        <div
          className={`${styles.line} ${
            currentStep > 2 ? styles.lineActive : ""
          }`}
        ></div>

        {/* STEP 3 */}
        <div className={styles.stepItem}>
          <div
            className={`${styles.circle} ${
              currentStep === 3 ? styles.active : ""
            }`}
          >
            <CreditCard size={16} />
          </div>
          <span
            className={
              currentStep === 3 ? styles.labelActive : styles.labelInactive
            }
          >
            Thanh toán
          </span>
        </div>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : cart.length === 0 ? (
        <p>Giỏ hàng trống</p>
      ) : (
        <div className={styles.wrapper}>
          {/* LEFT: Danh sách sản phẩm */}
          <div className={styles.cartList}>
            <h2 className={styles.titlegh}>Giỏ hàng của bạn</h2>
            {cart.map((item) => (
              <div key={item.id} className={styles.card}>
                <img src={item.image} alt={item.name} />

                <div className={styles.info}>
                  <h3>{item.name}</h3>

                  <div className={styles.qty}>
                    <button onClick={() => updateQty(item.id, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, 1)}>+</button>
                  </div>
                </div>

                <div className={styles.price}>
                  <strong>{formatPrice(item.price * item.quantity)}</strong>
                </div>

                <button
                  className={styles.deleteBtn}
                  onClick={() => removeItem(item.id)}
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              className={styles.checkoutBtn}
              onClick={() => navigate("/cart2")}
            >
              Tiếp tục thanh toán
            </button>
          </div>

          {/* RIGHT: Tóm tắt */}
          <div className={styles.summary}>
            <h3 className={styles.summaryTitle}>Tóm tắt đơn hàng</h3>

            {cart.map((item) => (
              <div key={item.id} className={styles.summaryItemBig}>
                <div>
                  {item.name} x{item.quantity}
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
              <span>Phí vận chuyển</span>
              <span>{formatPrice(shipping)}</span>
            </div>

            <div className={styles.totalBig}>
              <span>Tổng cộng</span>
              <span>{formatPrice(total)}</span>
            </div>

            {/* BOX */}
            <div className={styles.boxGreen}>
              <Truck size={18} />
              <div>
                <b>Giao hàng nhanh</b>
                <span>Giao hàng 2–3 ngày</span>
              </div>
            </div>

            <div className={styles.boxBlue}>
              <ShieldCheck size={18} />
              <div>
                <b>Bảo hành 24 tháng</b>
                <span>Đổi trả miễn phí 7 ngày</span>
              </div>
            </div>
          </div>

          {/* Toast Container */}
          <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      )}
    </div>
  );
}

export default Cart;
