import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  Loader2,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { addToCartApi } from "../../api/cartApi";
import {
  getWishlistApi,
  getWishlistProduct,
  getWishlistProductId,
  normalizeWishlistItems,
  removeFromWishlistApi,
} from "../../api/wishlistApi";
import styles from "../../styles/Wishlist.module.css";

const formatPrice = (price = 0) => `${Number(price).toLocaleString("vi-VN")}đ`;

const mapWishlistItem = (item) => {
  const product = getWishlistProduct(item);
  const productId = getWishlistProductId(item);

  return {
    id: productId ? String(productId) : productId,
    name: product?.name || item?.productName || item?.name || "Sản phẩm",
    description: product?.description || item?.description || "",
    price: product?.price ?? item?.price ?? 0,
    stock: product?.stock ?? item?.stock ?? null,
    category: product?.category || item?.category || "",
    image:
      product?.images?.[0] ||
      product?.image ||
      product?.thumbnail ||
      item?.productImage ||
      item?.image ||
      "/no-image.png",
  };
};

function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const showFeedback = (id, message, isError = false) => {
    setFeedback({ id, message, isError });
    setTimeout(() => setFeedback(null), 1600);
  };

  const fetchWishlist = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getWishlistApi();
      const mappedItems = normalizeWishlistItems(data)
        .map(mapWishlistItem)
        .filter((item) => item.id);

      setItems(mappedItems);
    } catch (err) {
      console.error("Fetch wishlist error:", err);
      setError("Không tải được danh sách yêu thích.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeItem = async (productId) => {
    setBusyId(productId);

    try {
      await removeFromWishlistApi(productId);
      setItems((prev) => prev.filter((item) => item.id !== productId));
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (err) {
      console.error("Remove wishlist error:", err);
      showFeedback(productId, "Xóa thất bại!", true);
    } finally {
      setBusyId(null);
    }
  };

  const addToCart = async (item) => {
    if (item.stock === 0) {
      showFeedback(item.id, "Sản phẩm đã hết hàng!", true);
      return;
    }

    setBusyId(item.id);

    try {
      await addToCartApi({ productId: item.id, quantity: 1 });
      window.dispatchEvent(new Event("cartUpdated"));
      showFeedback(item.id, "Đã thêm vào giỏ!");
    } catch (err) {
      console.error("Wishlist add to cart error:", err);
      showFeedback(item.id, "Thêm giỏ thất bại!", true);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loader2 size={28} className={styles.spinner} />
        <span>Đang tải danh sách yêu thích...</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <section className={styles.header}>
        <div>
          <p className={styles.kicker}>
            <Heart size={16} fill="currentColor" /> Yêu thích
          </p>
          <h1>Sản phẩm bạn đã lưu</h1>
          <span>{items.length} sản phẩm</span>
        </div>

        <button type="button" onClick={() => navigate("/products")}>
          Tiếp tục mua sắm <ArrowRight size={18} />
        </button>
      </section>

      {error && <div className={styles.error}>{error}</div>}

      {items.length === 0 ? (
        <div className={styles.empty}>
          <Heart size={42} />
          <h2>Chưa có sản phẩm yêu thích</h2>
          <p>Lưu lại những món bạn thích để xem nhanh khi cần.</p>
          <button type="button" onClick={() => navigate("/products")}>
            Khám phá sản phẩm
          </button>
        </div>
      ) : (
        <div className={styles.list}>
          {items.map((item) => (
            <article className={styles.card} key={item.id}>
              <button
                type="button"
                className={styles.imageButton}
                onClick={() => navigate(`/products/${item.id}`)}
              >
                <img src={item.image} alt={item.name} />
              </button>

              <div className={styles.info}>
                <div className={styles.meta}>
                  {item.category && <span>{item.category}</span>}
                  {item.stock === 0 && (
                    <span className={styles.outStock}>Hết hàng</span>
                  )}
                </div>
                <h3>{item.name}</h3>
                <p>{item.description?.slice(0, 120)}</p>
                <strong>{formatPrice(item.price)}</strong>
              </div>

              <div className={styles.actions}>
                {feedback?.id === item.id && (
                  <span
                    className={`${styles.feedback} ${
                      feedback.isError ? styles.feedbackError : ""
                    }`}
                  >
                    {feedback.message}
                  </span>
                )}
                <button
                  type="button"
                  className={styles.cartBtn}
                  disabled={busyId === item.id}
                  onClick={() => addToCart(item)}
                >
                  <ShoppingCart size={17} />
                  Thêm giỏ
                </button>
                <button
                  type="button"
                  className={styles.detailBtn}
                  onClick={() => navigate(`/products/${item.id}`)}
                >
                  Chi tiết
                </button>
                <button
                  type="button"
                  className={styles.removeBtn}
                  disabled={busyId === item.id}
                  onClick={() => removeItem(item.id)}
                  aria-label="Xóa khỏi yêu thích"
                  title="Xóa khỏi yêu thích"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;
