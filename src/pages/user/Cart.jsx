import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

function Cart() {
  const [cart, setCart] = useState([]);
  const [shipping, setShipping] = useState(0);
  const [loading, setLoading] = useState(true);

  // ✅ pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const navigate = useNavigate();
  const location = useLocation();

  const formatPrice = (p) => p.toLocaleString("vi-VN") + " đ";

  const calculateShipping = (subtotal) => {
    return subtotal > 500000 ? 0 : 300000;
  };

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

  // ================= LOAD CART =================
  const fetchCart = async () => {
    setLoading(true);
    try {
      const data = await getCartApi();
      const items = (data.items || []).map(mapCartItem);

      setCart(items);

      const subtotal = data.totalPrice || 0;
      setShipping(calculateShipping(subtotal));
    } catch (err) {
      console.error(err);
      toast.error("Lỗi tải giỏ hàng!");
      setShipping(300000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // reset page khi cart đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [cart.length]);

  // fix vượt page
  const totalPages = Math.ceil(cart.length / itemsPerPage);
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [cart.length]);

  // scroll mượt
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // ================= ACTION =================
  const updateQty = async (id, delta) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;

    if (item.quantity === 1 && delta === -1) {
      toast.info("Nhấn ✕ để xóa sản phẩm");
      return;
    }

    const newQty = Math.max(1, item.quantity + delta);

    try {
      await updateCartApi(id, newQty);

      const newCart = cart.map((i) =>
        i.id === id ? { ...i, quantity: newQty } : i,
      );

      setCart(newCart);

      const newSubtotal = newCart.reduce((s, i) => s + i.price * i.quantity, 0);
      setShipping(calculateShipping(newSubtotal));
    } catch (err) {
      toast.error("Cập nhật thất bại!");
    }
  };

  const removeItem = async (id) => {
    try {
      await deleteCartApi(id);

      const newCart = cart.filter((i) => i.id !== id);
      setCart(newCart);

      const newSubtotal = newCart.reduce((s, i) => s + i.price * i.quantity, 0);
      setShipping(calculateShipping(newSubtotal));

      toast.success("Đã xóa!");
    } catch {
      toast.error("Xóa thất bại!");
    }
  };

  // ================= PAGINATION =================
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = cart.slice(startIndex, startIndex + itemsPerPage);

  // ================= TOTAL =================
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal + shipping;

  return (
    <div className={styles.container}>
      {/* ===== STEPS ===== */}
      <div className={styles.steps}>
        <div className={styles.stepItem}>
          <div
            className={`${styles.circle} ${
              currentStep > 1 ? styles.done : styles.active
            }`}
          >
            {currentStep > 1 ? "✓" : <ShoppingCart size={16} />}
          </div>
          <span className={styles.labelActive}>Giỏ hàng</span>
        </div>

        <div
          className={`${styles.line} ${
            currentStep > 1 ? styles.lineActive : ""
          }`}
        />

        <div className={styles.stepItem}>
          <div
            className={`${styles.circle} ${
              currentStep === 2 ? styles.active : ""
            }`}
          >
            <User size={16} />
          </div>
          <span className={styles.labelActive}>Thông tin</span>
        </div>

        <div
          className={`${styles.line} ${
            currentStep > 2 ? styles.lineActive : ""
          }`}
        />

        <div className={styles.stepItem}>
          <div
            className={`${styles.circle} ${
              currentStep === 3 ? styles.active : ""
            }`}
          >
            <CreditCard size={16} />
          </div>
          <span className={styles.labelInactive}>Thanh toán</span>
        </div>
      </div>

      <h2 className={styles.titlegh}>Giỏ hàng của bạn</h2>

      {loading ? (
        <p>Đang tải...</p>
      ) : cart.length === 0 ? (
        <p>Giỏ hàng trống</p>
      ) : (
        <div className={styles.wrapper}>
          {/* ===== LEFT ===== */}
          <div className={styles.cartList}>
            {currentItems.map((item) => (
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
                  <div className={styles.unitPrice}>
                    {formatPrice(item.price)} x {item.quantity}
                  </div>
                </div>

                <button
                  className={styles.deleteBtn}
                  onClick={() => removeItem(item.id)}
                >
                  ✕
                </button>
              </div>
            ))}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  ←
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    className={currentPage === i + 1 ? styles.activePage : ""}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  →
                </button>
              </div>
            )}

            <button
              className={styles.checkoutBtn}
              onClick={() => navigate("/cart2")}
            >
              Tiếp tục thanh toán
            </button>
          </div>

          {/* ===== RIGHT ===== */}
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

            <div className={styles.boxGreen}>
              <Truck size={18} />
              <div>
                <b>Miễn phí vận chuyển</b>
                <span>Cho đơn từ 500.000₫</span>
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

          <ToastContainer position="top-center" autoClose={3000} />
        </div>
      )}
    </div>
  );
}

export default Cart;
