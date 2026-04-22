import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Send, Star } from "lucide-react";
import { getOrderByIdApi } from "../../api/orderApi";
import { createReviewApi } from "../../api/reviewApi";
import styles from "../../styles/OrderDetail.module.css";
import logoImage from "../../assets/logo.png";
import {
  getResolvedOrderItemImage,
  hydrateOrderItemsWithImages,
} from "../../utils/orderItemImage";
import {
  getOrderProductId,
  getOrderReviewStats,
  isOrderItemReviewed,
  markOrderItemReviewed,
} from "../../utils/reviewStatus";
import toast from "react-hot-toast";

const REVIEWABLE_STATUSES = new Set(["DELIVERED", "COMPLETED"]);

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const reviewSectionRef = useRef(null);

  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [reviewForms, setReviewForms] = useState({});
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewedIds, setReviewedIds] = useState(() => new Set());
  const role = localStorage.getItem("role") || sessionStorage.getItem("role");
  const isAdminPreview = role === "ADMIN";

  const formatPrice = (value) =>
    Number(value || 0).toLocaleString("vi-VN") + " đ";

  const fetchOrder = async () => {
    try {
      const data = await getOrderByIdApi(id);
      const hydratedItems = await hydrateOrderItemsWithImages(
        data?.items || [],
      );

      console.log("ORDER ITEMS:", data?.items);
      console.log("HYDRATED ITEMS:", hydratedItems);
      const hydratedOrder = {
        ...data,
        items: hydratedItems,
      };
      const reviewedProductIds = hydratedItems
        .filter((item) => isOrderItemReviewed(hydratedOrder, item))
        .map((item) => getOrderProductId(item))
        .filter(Boolean)
        .map(String);

      setOrder(hydratedOrder);
      setReviewedIds(new Set(reviewedProductIds));
    } catch (error) {
      console.error("Fetch order detail error:", error);
      setError(
        isAdminPreview
          ? "Admin đang ở chế độ xem user nên không có dữ liệu đơn hàng này."
          : "Không thể tải chi tiết đơn hàng.",
      );
    }
  };

  const updateReviewForm = (productId, patch) => {
    setReviewForms((prev) => ({
      ...prev,
      [productId]: {
        rating: 5,
        comment: "",
        ...prev[productId],
        ...patch,
      },
    }));
  };

  const submitReview = async (item) => {
    const productId = getOrderProductId(item);
    const reviewKey = String(productId || "");
    const form = reviewForms[reviewKey] || { rating: 5, comment: "" };
    const rating = Number(form.rating || 5);
    const comment = form.comment.trim();

    if (!productId) {
      toast.error("Không tìm thấy sản phẩm để đánh giá");
      return;
    }

    if (!comment) {
      toast.error("Vui lòng nhập nội dung đánh giá");
      return;
    }

    if (!order?.orderCode) {
      toast.error("Không tìm thấy mã đơn hàng để đánh giá");
      return;
    }

    setReviewingId(reviewKey);

    try {
      await createReviewApi({
        productId,
        orderCode: order.orderCode,
        rating,
        comment,
      });

      markOrderItemReviewed(order, item);
      setReviewedIds((prev) => new Set(prev).add(reviewKey));
      updateReviewForm(reviewKey, { comment: "" });
      toast.success("Đã gửi đánh giá");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Không thể gửi đánh giá. Có thể sản phẩm đã được đánh giá trước đó.";
      toast.error(message);
    } finally {
      setReviewingId(null);
    }
  };

  const renderReviewForm = (item) => {
    const productId = getOrderProductId(item);
    const reviewKey = String(productId || "");

    if (!order || !REVIEWABLE_STATUSES.has(order.status) || !productId) {
      return null;
    }

    const form = reviewForms[reviewKey] || {
      rating: 5,
      comment: "",
    };
    const isReviewed =
      getOrderReviewStats(order).fullyReviewed ||
      reviewedIds.has(reviewKey) ||
      isOrderItemReviewed(order, item);

    if (isReviewed) {
      return <div className={styles.reviewedInline}>Đã đánh giá</div>;
    }

    return (
      <div className={styles.reviewForm}>
        <div className={styles.reviewTitle}>Đánh giá sản phẩm</div>

        <div className={styles.starPicker}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={
                Number(form.rating) >= star ? styles.starActive : ""
              }
              onClick={() => updateReviewForm(reviewKey, { rating: star })}
              aria-label={`${star} sao`}
            >
              <Star
                size={18}
                fill={Number(form.rating) >= star ? "currentColor" : "none"}
              />
            </button>
          ))}
        </div>

        <textarea
          value={form.comment}
          placeholder="Chia sẻ cảm nhận của bạn sau khi nhận hàng..."
          onChange={(e) =>
            updateReviewForm(reviewKey, { comment: e.target.value })
          }
          disabled={isReviewed || reviewingId === reviewKey}
        />

        <button
          type="button"
          className={styles.submitReview}
          onClick={() => submitReview(item)}
          disabled={isReviewed || reviewingId === reviewKey}
        >
          <Send size={15} />
          {isReviewed ? "Đã gửi" : "Gửi đánh giá"}
        </button>
      </div>
    );
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!order) return;

    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("review") !== "1") return;

    const timeout = setTimeout(() => {
      reviewSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);

    return () => clearTimeout(timeout);
  }, [order, location.search]);

  if (error) return <div className={styles.loading}>{error}</div>;

  if (!order) return <div className={styles.loading}>Đang tải...</div>;

  const reviewStats = getOrderReviewStats(order);

  return (
    <div className={styles.container}>
      {/* BACK */}
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        <ArrowLeft size={18} />
        Quay lại
      </button>

      {/* TITLE */}
      <h2 className={styles.pageTitle}>Đơn hàng {order.orderCode}</h2>

      <div className={styles.wrapper}>
        {/* LEFT BLOCK */}
        <div className={styles.card}>
          <div className={styles.left}>
            <h3>Thông tin đơn hàng</h3>

            <div className={styles.info}>
              <p>
                <b>Trạng thái:</b> {order.statusDisplay}
              </p>
              <p>
                <b>Thanh toán:</b> {order.paymentMethodDisplay}
              </p>
              <p>
                <b>TT thanh toán:</b> {order.paymentStatusDisplay}
              </p>
              <p>
                <b>Ngày đặt:</b>{" "}
                {new Date(order.createdAt).toLocaleString("vi-VN")}
              </p>
            </div>

            <div className={styles.customer}>
              <h3>Thông tin nhận hàng</h3>

              <p>
                <b>Khách hàng:</b> {order.customerName}
              </p>
              <p>
                <b>Email:</b> {order.customerEmail}
              </p>
              <p>
                <b>SĐT:</b> {order.customerPhone}
              </p>
              <p>
                <b>Địa chỉ:</b> {order.fullShippingAddress}
              </p>

              {order.note && (
                <p className={styles.note}>
                  <b>Ghi chú:</b> {order.note}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT BLOCK */}
        <div className={styles.card} ref={reviewSectionRef}>
          <div className={styles.right}>
            <div className={styles.productHeader}>
              <h3>Sản phẩm</h3>
              {REVIEWABLE_STATUSES.has(order.status) &&
                reviewStats.fullyReviewed && (
                  <span className={styles.reviewedBadge}>Đã đánh giá</span>
                )}
            </div>

            <div className={styles.products}>
              {order.items?.map((item, index) => (
                <div key={item.id || index} className={styles.product}>
                  <img
                    src={getResolvedOrderItemImage(item) || logoImage}
                    alt={item.productName}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = logoImage;
                    }}
                  />

                  <div className={styles.productInfo}>
                    <div className={styles.productName}>{item.productName}</div>
                    <div>Số lượng: {item.quantity}</div>
                    <div className={styles.price}>
                      {formatPrice(item.price)}
                    </div>
                    <div>Tạm tính: {formatPrice(item.subtotal)}</div>
                    {renderReviewForm(item)}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.summary}>
              <div className={styles.row}>
                <span>Tạm tính</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>

              <div className={styles.row}>
                <span>Phí vận chuyển</span>
                <span>{formatPrice(order.shippingFee)}</span>
              </div>

              <div className={styles.row}>
                <span>Giảm giá</span>
                <span className={styles.discount}>
                  -{formatPrice(order.discount)}
                </span>
              </div>

              <div className={styles.total}>
                <span>Tổng thanh toán</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
