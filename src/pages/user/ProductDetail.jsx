import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../../styles/ProductDetail.module.css";
import { getProductByIdApi } from "../../api/productApi";
import {
  Star,
  Truck,
  ShieldCheck,
  Minus,
  Plus,
  ArrowLeft,
  FileText,
  MessageCircle,
  RefreshCw,
  MessageCircle as Msg,
} from "lucide-react";
import { getReviewsByProductApi } from "../../api/reviewApi";
import { addToCartApi } from "../../api/cartApi";
import { trackBehaviorApi } from "../../api/behaviorApi";

const getAuthToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");
function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState("detail");
  const [toast, setToast] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewPage, setReviewPage] = useState(0);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);
  const [loadingReview, setLoadingReview] = useState(false);
  const [added, setAdded] = useState(false);
  const resolvedProductId = product?.id || product?._id || id;

  useEffect(() => {
    if (!id || id === "undefined") {
      console.log("ID lỗi:", id);
      setLoading(false);
      return;
    }

    const fetch = async () => {
      try {
        const res = await getProductByIdApi(id);

        if (!res) {
          console.log("Không có data");
          return;
        }

        const images = res.images?.length ? res.images : ["/no-image.png"];

        setProduct({
          ...res,
          id: res.id || res._id || id,
          images,
          oldPrice: res.price,
          finalPrice: res.price,
          oldPriceFormatted: res.price.toLocaleString("vi-VN") + "đ",
          priceFormatted: res.price.toLocaleString("vi-VN") + "đ",
          rating: res.avgRating || 0,
          reviewCount: res.reviewCount || 0,
          sold: res.soldCount || 0,
          stock: res.stock ?? 0,
        });

        setActiveImg(0);
      } catch (err) {
        console.log("DETAIL ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [id]);
  const handleAddToCart = async () => {
    if (!product || product.stock === 0) return;

    if (!getAuthToken()) {
      setToast({ message: "Hãy đăng nhập!", error: true });
      setTimeout(() => setToast(null), 1500);
      return;
    }

    try {
      await addToCartApi({
        productId: product.id || product._id,
        quantity: qty,
      });

      window.dispatchEvent(new Event("cartUpdated"));

      // 👉 bật hiệu ứng button
      setAdded(true);

      setTimeout(() => {
        setAdded(false);
      }, 1200);
    } catch (err) {
      console.error(err);
      setToast({
        message: err?.response?.status === 401 ? "Hãy đăng nhập!" : "Lỗi!",
        error: true,
      });
      setTimeout(() => setToast(null), 1500);
    }
  };
  const handleBuyNow = async () => {
    if (!product || product.stock === 0) return;

    if (!getAuthToken()) {
      setToast({ message: "Hãy đăng nhập!", error: true });
      setTimeout(() => setToast(null), 1500);
      return;
    }

    try {
      await addToCartApi({
        productId: product.id || product._id,
        quantity: qty,
      });

      window.dispatchEvent(new Event("cartUpdated"));

      // 👉 chuyển thẳng sang checkout
      navigate("/cart");
    } catch (err) {
      console.error(err);
      setToast({
        message:
          err?.response?.status === 401 ? "Hãy đăng nhập!" : "Lỗi mua ngay!",
        error: true,
      });
      setTimeout(() => setToast(null), 1500);
    }
  };

  useEffect(() => {
    if (product && product.stock === 0) setQty(0);
  }, [product]);

  useEffect(() => {
    if (activeTab !== "review" || !resolvedProductId) return;

    const fetchReviews = async () => {
      setLoadingReview(true);

      const res = await getReviewsByProductApi({
        productId: resolvedProductId,
        page: reviewPage,
        size: 5,
      });

      setReviews(res.content);
      setReviewTotalPages(res.totalPages);
      setLoadingReview(false);
    };

    fetchReviews();
  }, [activeTab, resolvedProductId, reviewPage]);

  useEffect(() => {
    const trackedProductId = product?.id || product?._id;
    if (!trackedProductId) return;

    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;

    trackBehaviorApi({
      productId: trackedProductId,
      eventType: "PRODUCT_VIEW",
    });
  }, [product?.id, product?._id]);

  const increase = () => {
    if (product && qty < product.stock) setQty(qty + 1);
  };
  const decrease = () => {
    if (qty > 1) setQty(qty - 1);
  };

  if (loading) return <p style={{ padding: 20 }}>Đang tải...</p>;
  if (!product) return <p>Không tìm thấy sản phẩm</p>;

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* LEFT */}
        <div className={styles.left}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Quay lại
          </button>
          <div className={styles.mainImage}>
            {product.stock === 0 && (
              <span className={styles.outStock}>Hết hàng</span>
            )}
            <img src={product.images[activeImg]} alt={product.name} />
            {activeImg > 0 && (
              <button
                className={`${styles.navBtn} ${styles.prev}`}
                onClick={() => setActiveImg((prev) => prev - 1)}
              >
                ‹
              </button>
            )}
            {activeImg < product.images.length - 1 && (
              <button
                className={`${styles.navBtn} ${styles.next}`}
                onClick={() => setActiveImg((prev) => prev + 1)}
              >
                ›
              </button>
            )}
          </div>
          <div className={styles.thumbWrapper}>
            <div className={styles.thumbList}>
              {product.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  onClick={() => setActiveImg(i)}
                  className={i === activeImg ? styles.activeThumb : ""}
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className={styles.right}>
          <h1 className={styles.title}>{product.name}</h1>
          <div className={styles.rating}>
            {product.reviewCount > 0 ? (
              <>
                <Star size={16} fill="#ee4d2d" color="#ee4d2d" />
                {product.rating.toFixed(1)} ({product.reviewCount})
              </>
            ) : (
              <span className={styles.noRating}>Chưa có đánh giá</span>
            )}
            <span className={styles.sold}>| Đã bán {product.sold}</span>
          </div>

          <div className={styles.priceBox}>
            <span className={styles.price}>{product.priceFormatted}</span>
            <span className={styles.freeShip}>
              <Truck size={14} /> Miễn phí vận chuyển
            </span>
          </div>

          <div className={styles.colors}>
            <span>Màu</span>
            <div className={styles.colorBox}>
              <div
                className={styles.colorCircle}
                style={{ background: product.color?.hex }}
              />
              {product.color?.name}
            </div>
          </div>

          <div className={styles.qtyWrap}>
            <span>Số lượng</span>
            <div className={styles.qtyBox}>
              <button
                onClick={decrease}
                disabled={product.stock === 0 || qty <= 1}
              >
                <Minus size={14} />
              </button>
              <span>{qty}</span>
              <button
                onClick={increase}
                disabled={product.stock === 0 || qty >= product.stock}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
          <span className={styles.stock}>Còn lại {product.stock} sản phẩm</span>

          <div className={styles.actions}>
            {toast && (
              <div
                className={`${styles.toast} ${
                  toast.error ? styles.toastError : ""
                }`}
              >
                {toast.message}
              </div>
            )}
            <button
              className={`${styles.addCart} ${added ? styles.added : ""}`}
              disabled={product.stock === 0}
              onClick={handleAddToCart}
            >
              <span className={styles.btnText}>Thêm vào giỏ</span>
              <span className={styles.btnAdded}>Đã thêm</span>
            </button>
            <button
              className={styles.buyNow}
              disabled={product.stock === 0}
              onClick={handleBuyNow}
            >
              Mua ngay
            </button>
          </div>
          {/* POLICY */}
          <div className={styles.policyBox}>
            <div className={styles.policyItem}>
              <ShieldCheck size={18} />
              <div>
                <b>Cam kết chính hãng</b>
                <span>100% sản phẩm</span>
              </div>
            </div>
            <div className={styles.policyItem}>
              <RefreshCw size={18} />
              <div>
                <b>Đổi trả minh bạch</b>
                <span>Thủ tục đơn giản</span>
              </div>
            </div>
            <div className={styles.policyItem}>
              <Truck size={18} />
              <div>
                <b>Miễn phí vận chuyển</b>
                <span>Toàn quốc</span>
              </div>
            </div>
            <div className={styles.policyItem}>
              <Msg size={18} />
              <div>
                <b>Tư vấn sản phẩm</b>
                <span>Hỗ trợ 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className={styles.tabs}>
        <button
          onClick={() => setActiveTab("detail")}
          className={activeTab === "detail" ? styles.activeTab : ""}
        >
          <FileText size={16} /> Chi tiết sản phẩm
        </button>
        <button
          onClick={() => setActiveTab("review")}
          className={activeTab === "review" ? styles.activeTab : ""}
        >
          <MessageCircle size={16} /> Đánh giá
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === "detail" && (
          <div className={styles.detailGrid}>
            <div className={styles.section}>
              <h3>Mô tả sản phẩm</h3>
              <p className={styles.fullText}>{product.description}</p> <br />
              {product.careInstructions?.length > 0 && (
                <>
                  <h3>Hướng dẫn bảo quản</h3>
                  <ul className={styles.list}>
                    {product.careInstructions.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <div className={styles.section}>
              <h3>Thông số kỹ thuật</h3>
              <div className={styles.specGrid}>
                <div>Danh mục</div>
                <div>{product.category}</div>
                <div>SKU</div>
                <div>{product.sku}</div>
                <div>Màu sắc</div>
                <div>{product.color?.name}</div>
                <div>Xuất xứ</div>
                <div>{product.origin}</div>
                <div>Kích thước</div>
                <div>{product.dimensionsRaw || "-"}</div>
                <div>Tồn kho</div>
                <div>{product.stock}</div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "review" && (
          <div className={styles.reviewBox}>
            {/* ⭐ Tổng rating */}
            {product.reviewCount > 0 ? (
              <div className={styles.summary}>
                <div className={styles.bigRating}>
                  {product.rating.toFixed(1)}
                </div>
                <div className={styles.total}>
                  {product.reviewCount} đánh giá
                </div>
              </div>
            ) : (
              <p className={styles.noRating}>Chưa có đánh giá</p>
            )}

            {/* 🔥 LIST REVIEW */}
            {loadingReview ? (
              <p>Đang tải đánh giá...</p>
            ) : (
              <div className={styles.reviewList}>
                {reviews.length === 0 && (
                  <p className={styles.noReview}>Chưa có bình luận</p>
                )}

                {reviews.map((r) => (
                  <div key={r.id} className={styles.reviewItem}>
                    <div className={styles.reviewHeader}>
                      <span className={styles.user}>
                        {r.reviewerName || "Ẩn danh"}
                      </span>

                      <span className={styles.date}>
                        {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>

                    {/* ⭐ rating */}
                    <div className={styles.stars}>
                      {"★".repeat(r.rating)}
                      {"☆".repeat(5 - r.rating)}
                    </div>

                    {/* 💬 comment */}
                    <div className={styles.comment}>{r.comment}</div>
                  </div>
                ))}
              </div>
            )}

            {/* 🔥 PAGINATION */}
            {reviewTotalPages > 1 && (
              <div className={styles.reviewPagination}>
                <button
                  disabled={reviewPage === 0}
                  onClick={() => setReviewPage(reviewPage - 1)}
                >
                  ←
                </button>

                {[...Array(reviewTotalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setReviewPage(i)}
                    className={reviewPage === i ? styles.activePage : ""}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  disabled={reviewPage >= reviewTotalPages - 1}
                  onClick={() => setReviewPage(reviewPage + 1)}
                >
                  →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;
