import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Eye, MessageSquare, Search, Star, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../layout/admin/AdminHeader";
import AdminMenu from "../../layout/admin/AdminMenu";
import { searchOrdersAdminApi } from "../../api/orderAdminApi";
import { getProductAdminByIdApi } from "../../api/productAdminApi";
import { deleteReviewApi, getReviewsAdminApi } from "../../api/reviewApi";
import styles from "../../styles/Admin.module.css";

const PAGE_SIZE = 5;

const getReviewId = (review) => review?.id || review?._id || review?.reviewId;

const getOrderId = (order) => order?.id || order?._id || order?.orderId || null;

const getReviewOrderId = (review) =>
  review?.orderId || review?.order?.id || review?.order?._id || null;

const getProductId = (review) =>
  review?.productId ||
  review?.product?.id ||
  review?.product?._id ||
  review?.product?.productId ||
  null;

const getProductName = (review) =>
  review?.productName ||
  review?.product?.name ||
  review?.product?.productName ||
  "Sản phẩm";

const getProductImage = (review) =>
  review?.productImage ||
  review?.thumbnail ||
  review?.image ||
  review?.product?.images?.[0] ||
  review?.product?.image ||
  review?.product?.thumbnail ||
  null;

const getReviewerName = (review) =>
  review?.reviewerName ||
  review?.customerName ||
  review?.userName ||
  review?.user?.fullName ||
  review?.user?.name ||
  review?.customer?.fullName ||
  review?.customer?.name ||
  "Ẩn danh";

const getReviewerEmail = (review) =>
  review?.reviewerEmail ||
  review?.customerEmail ||
  review?.userEmail ||
  review?.user?.email ||
  review?.customer?.email ||
  "";

const getReviewDate = (review) =>
  review?.createdAt || review?.updatedAt || review?.date || null;

function ReviewsAdmin() {
  const navigate = useNavigate();
  const productCacheRef = useRef({});
  const orderCacheRef = useRef({});
  const [reviews, setReviews] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const filteredReviews = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return reviews.filter((review) => {
      const matchRating =
        !ratingFilter || Number(review.rating) === Number(ratingFilter);

      if (!normalizedKeyword) return matchRating;

      const searchable = [
        getProductName(review),
        getProductId(review),
        getReviewerName(review),
        getReviewerEmail(review),
        review.comment,
        review.orderCode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchRating && searchable.includes(normalizedKeyword);
    });
  }, [reviews, keyword, ratingFilter]);

  const fetchReviews = useCallback(async (targetPage = 0) => {
    setLoading(true);
    try {
      const data = await getReviewsAdminApi({
        page: targetPage,
        size: PAGE_SIZE,
      });
      const reviewItems = data.content || [];
      const productIds = [
        ...new Set(reviewItems.map(getProductId).filter(Boolean)),
      ];
      const productEntries = await Promise.all(
        productIds.map(async (productId) => {
          if (!(productId in productCacheRef.current)) {
            productCacheRef.current[productId] =
              await getProductAdminByIdApi(productId);
          }

          return [productId, productCacheRef.current[productId]];
        }),
      );
      const productMap = Object.fromEntries(productEntries);
      const enrichedReviews = reviewItems.map((review) => {
        const productId = getProductId(review);
        const product = productId ? productMap[productId] : null;

        if (!product) return review;

        return {
          ...review,
          productName:
            review.productName || product.name || product.productName,
          product: {
            ...(review.product || {}),
            ...product,
            id:
              getProductId(review) ||
              product.id ||
              product._id ||
              product.productId,
            name:
              review.product?.name ||
              review.productName ||
              product.name ||
              product.productName,
            images:
              review.product?.images?.length > 0
                ? review.product.images
                : product.images || [],
          },
        };
      });

      setReviews(enrichedReviews);
      setTotalPages(Math.max(1, data.totalPages || 1));
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error("Fetch reviews admin error:", error);
      setReviews([]);
      setTotalPages(1);
      setTotalElements(0);
      setMessage({ type: "error", text: "Không tải được danh sách bình luận" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews(page);
  }, [fetchReviews, page]);

  useEffect(() => {
    setPage(0);
  }, [keyword, ratingFilter]);

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  useEffect(() => {
    if (!message) return undefined;

    const timeout = setTimeout(() => setMessage(null), 2500);
    return () => clearTimeout(timeout);
  }, [message]);

  const handleDelete = async (review) => {
    const reviewId = getReviewId(review);
    if (!reviewId) return;

    const confirmed = window.confirm("Xóa bình luận này?");
    if (!confirmed) return;

    try {
      await deleteReviewApi(reviewId);
      setMessage({ type: "success", text: "Đã xóa bình luận" });

      if (reviews.length === 1 && page > 0) {
        setPage((prev) => prev - 1);
      } else {
        fetchReviews(page);
      }
    } catch (error) {
      console.error("Delete review admin error:", error);
      setMessage({ type: "error", text: "Xóa bình luận thất bại" });
    }
  };

  const handleViewOrder = async (review) => {
    const directOrderId = getReviewOrderId(review);
    if (directOrderId) {
      navigate(`/admin/orders/${directOrderId}`);
      return;
    }

    const orderCode = review?.orderCode;
    if (!orderCode) {
      setMessage({ type: "error", text: "Đánh giá này chưa có mã đơn hàng" });
      return;
    }

    if (orderCacheRef.current[orderCode]) {
      navigate(`/admin/orders/${orderCacheRef.current[orderCode]}`);
      return;
    }

    try {
      const data = await searchOrdersAdminApi({
        page: 0,
        size: 10,
        keyword: orderCode,
      });
      const matchedOrder =
        data.content?.find((order) => order.orderCode === orderCode) ||
        data.content?.[0];
      const orderId = getOrderId(matchedOrder);

      if (!orderId) {
        setMessage({ type: "error", text: "Không tìm thấy đơn hàng đã mua" });
        return;
      }

      orderCacheRef.current[orderCode] = orderId;
      navigate(`/admin/orders/${orderId}`);
    } catch (error) {
      console.error("Find review order error:", error);
      setMessage({ type: "error", text: "Không mở được đơn hàng" });
    }
  };

  const resetFilters = () => {
    setKeyword("");
    setRatingFilter("");
    setPage(0);
  };

  return (
    <div className={styles.adminDashboard}>
      <AdminHeader />
      <AdminMenu />

      {message && (
        <div
          className={
            message.type === "success" ? styles.toastSuccess : styles.toastError
          }
        >
          {message.text}
        </div>
      )}

      <div className={styles.reviewAdminContainer}>
        <div className={styles.reviewAdminToolbar}>
          <div className={styles.orderSearchBox}>
            <Search size={16} />
            <input
              placeholder="Tìm theo khách hàng, sản phẩm, nội dung..."
              value={keyword}
              onChange={(e) => {
                setPage(0);
                setKeyword(e.target.value);
              }}
            />
          </div>

          <select
            className={styles.orderSelect}
            value={ratingFilter}
            onChange={(e) => {
              setPage(0);
              setRatingFilter(e.target.value);
            }}
          >
            <option value="">Tất cả sao</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>

          <button
            className={styles.resetBtn}
            type="button"
            onClick={resetFilters}
          >
            Xóa lọc
          </button>
        </div>

        <div className={styles.reviewAdminTable}>
          <div className={styles.reviewAdminThead}>
            <span>Khách hàng</span>
            <span>Sản phẩm</span>
            <span>Đánh giá</span>
            <span>Bình luận</span>
            <span>Đơn hàng</span>
            <span>Ngày</span>
            <span>Thao tác</span>
          </div>

          {loading ? (
            <p className={styles.reviewAdminState}>Đang tải bình luận...</p>
          ) : filteredReviews.length === 0 ? (
            <p className={styles.reviewAdminState}>Không có bình luận</p>
          ) : (
            filteredReviews.map((review, index) => {
              const productImage = getProductImage(review);
              const createdAt = getReviewDate(review);

              return (
                <div
                  className={styles.reviewAdminRow}
                  key={getReviewId(review) || `${review.orderCode}-${index}`}
                >
                  <span>
                    <b>{getReviewerName(review)}</b>
                    {getReviewerEmail(review) && (
                      <small>{getReviewerEmail(review)}</small>
                    )}
                  </span>

                  <span className={styles.reviewProductCell}>
                    {productImage ? (
                      <img src={productImage} alt={getProductName(review)} />
                    ) : (
                      <span className={styles.reviewProductImageFallback} />
                    )}
                    <span>
                      <b>{getProductName(review)}</b>
                    </span>
                  </span>

                  <span className={styles.reviewRating}>
                    <Star size={15} fill="currentColor" />
                    {Number(review.rating || 0).toFixed(1)}
                  </span>

                  <span className={styles.reviewComment}>
                    {review.comment || "Không có nội dung"}
                  </span>

                  <span>{review.orderCode || "-"}</span>

                  <span>
                    {createdAt
                      ? new Date(createdAt).toLocaleDateString("vi-VN")
                      : "-"}
                  </span>

                  <div className={styles.actions}>
                    <button
                      className={styles.viewBtn}
                      onClick={() => handleViewOrder(review)}
                      title="Xem đơn hàng"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(review)}
                      title="Xóa bình luận"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className={styles.orderPagination}>
          <button
            disabled={page === 0}
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
          >
            ←
          </button>
          <span>
            Trang {page + 1} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() =>
              setPage((prev) => Math.min(totalPages - 1, prev + 1))
            }
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewsAdmin;
