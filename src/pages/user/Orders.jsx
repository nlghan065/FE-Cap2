import { useEffect, useState } from "react";
import { getOrdersApi } from "../../api/orderApi";
import { addToCartApi } from "../../api/cartApi";
import { cancelOrderApi } from "../../api/orderApi";
import styles from "../../styles/Orders.module.css";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  Eye,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createVnpayPaymentApi } from "../../api/paymentApi";
import logoImage from "../../assets/logo.png";
import {
  getResolvedOrderItemImage,
  hydrateOrderItemsWithImages,
} from "../../utils/orderItemImage";
import { getOrderReviewStats } from "../../utils/reviewStatus";

const PAGE_SIZE = 5;
const REVIEWABLE_STATUSES = new Set(["DELIVERED", "COMPLETED"]);

/* ===== Tabs filter ===== */
const ORDER_STATUS = [
  { value: "ALL", label: "Tất cả", icon: Package },
  { value: "PENDING", label: "Đang xử lý", icon: Clock },
  { value: "CONFIRMED", label: "Đã xác nhận", icon: CheckCircle },
  { value: "SHIPPING", label: "Đang giao", icon: Truck },
  { value: "DELIVERED", label: "Đã giao", icon: CheckCircle },
];

/* ===== Status config ===== */
const STATUS_CONFIG = {
  COMPLETED: { text: "Hoàn thành", icon: CheckCircle, className: "delivered" },
  PENDING: { text: "Đang xử lý", icon: Clock, className: "pending" },
  CONFIRMED: { text: "Đã xác nhận", icon: CheckCircle, className: "confirmed" },
  SHIPPING: { text: "Đang giao", icon: Truck, className: "shipping" },
  DELIVERED: { text: "Đã giao", icon: CheckCircle, className: "delivered" },
  CANCELLED: { text: "Đã huỷ", icon: Package, className: "cancelled" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [, setReviewSync] = useState(0);

  const navigate = useNavigate();

  /* ===== format price ===== */
  const formatPrice = (value) =>
    Number(value || 0).toLocaleString("vi-VN") + " đ";

  /* ===== Fetch orders ===== */
  const fetchOrders = async () => {
    setLoading(true);

    try {
      const res = await getOrdersApi();

      const ordersData = res?.data?.content || res?.content || [];
      const imageCache = new Map();
      const hydratedOrders = await Promise.all(
        ordersData.map(async (order) => ({
          ...order,
          items: await hydrateOrderItemsWithImages(
            order.items || [],
            imageCache,
          ),
        })),
      );

      setOrders(hydratedOrders);
    } catch (error) {
      console.error("Fetch orders error:", error);
      toast.error("Không thể tải đơn hàng");
      setOrders([]);
    }

    setLoading(false);
  };
  const handlePay = async (orderId) => {
    try {
      const res = await createVnpayPaymentApi(orderId);

      // ✅ lưu lại để dùng sau khi redirect
      localStorage.setItem("pendingOrderId", orderId);

      window.location.href = res.paymentUrl;
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Không thể thanh toán!");
    }
  };
  const handleCancel = async (orderId) => {
    const confirm = window.confirm("Bạn có chắc muốn huỷ đơn hàng này?");
    if (!confirm) return;

    try {
      await cancelOrderApi(orderId);

      toast.success("Đã huỷ đơn hàng");
      fetchOrders();
    } catch (error) {
      console.error("Cancel error:", error);

      const msg =
        error?.response?.data?.message || error.message || "Huỷ đơn thất bại";

      toast.error(msg);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const handleReviewUpdate = () => {
      setReviewSync((value) => value + 1);
    };

    window.addEventListener("reviewUpdated", handleReviewUpdate);

    return () => {
      window.removeEventListener("reviewUpdated", handleReviewUpdate);
    };
  }, []);

  useEffect(() => {
    setPage(0);
  }, [statusFilter]);

  /* ===== BUY AGAIN ===== */
  const handleBuyAgain = async (order) => {
    try {
      for (const item of order.items) {
        await addToCartApi({
          productId: item.productId,
          quantity: item.quantity,
        });
      }

      toast.success("Đã thêm sản phẩm vào giỏ hàng");
      setTimeout(() => navigate("/cart"), 100);
    } catch (error) {
      console.error(error);
      toast.error("Mua lại thất bại");
    }
  };

  /* ===== Filter orders ===== */
  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "ALL") return true;
    return order.status === statusFilter;
  });

  /* ===== Pagination ===== */
  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);

  const paginatedOrders = filteredOrders.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE,
  );

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Đơn hàng của tôi</h2>

      {/* ===== Tabs ===== */}
      <div className={styles.tabs}>
        {ORDER_STATUS.map((status) => {
          const Icon = status.icon;

          return (
            <button
              key={status.value}
              className={`${styles.tab} ${
                statusFilter === status.value ? styles.activeTab : ""
              }`}
              onClick={() => setStatusFilter(status.value)}
            >
              <Icon size={16} />
              {status.label}
            </button>
          );
        })}
      </div>

      {loading && <div className={styles.loading}>Đang tải đơn hàng...</div>}

      {!loading && paginatedOrders.length === 0 && (
        <div className={styles.empty}>Bạn chưa có đơn hàng nào</div>
      )}

      {/* ===== Orders ===== */}
      {!loading &&
        paginatedOrders.map((order, index) => {
          const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
          const canReviewOrder = REVIEWABLE_STATUSES.has(order.status);
          const reviewStats = getOrderReviewStats(order);
          const orderReviewed = canReviewOrder && reviewStats.fullyReviewed;

          const StatusIcon = status.icon;

          return (
            <div key={order.id ?? index} className={styles.card}>
              {/* TOP */}
              <div className={styles.topRow}>
                <div>
                  <div className={styles.label}>Mã đơn hàng</div>
                  <div className={styles.orderCode}>{order.orderCode}</div>
                </div>

                <div className={`${styles.status} ${styles[status.className]}`}>
                  <StatusIcon size={14} />
                  {status.text}
                </div>
              </div>

              {/* PRODUCTS */}
              <div className={styles.products}>
                {order.items?.slice(0, 3).map((item, idx) => (
                  <img
                    key={item.id ?? idx}
                    src={getResolvedOrderItemImage(item) || logoImage}
                    alt={item.productName}
                    className={styles.productImg}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = logoImage;
                    }}
                  />
                ))}

                {order.items?.length > 3 && (
                  <div className={styles.more}>+{order.items.length - 3}</div>
                )}
              </div>

              <div className={styles.divider}></div>

              {/* BOTTOM */}
              <div className={styles.bottomRow}>
                <div>
                  <div className={styles.label}>Tổng giá trị</div>

                  <div className={styles.price}>
                    {formatPrice(order.totalAmount)}
                  </div>

                  <div className={styles.payment}>
                    Thanh toán:{" "}
                    {order.paymentMethod === "VNPAY" ? "VNPAY" : "COD"}
                  </div>
                  {orderReviewed && (
                    <div className={styles.reviewedNote}>Đã đánh giá</div>
                  )}
                </div>

                <div className={styles.actions}>
                  <button
                    className={styles.detailBtn}
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <Eye size={16} />
                    Chi tiết
                  </button>
                  {order.paymentMethod === "VNPAY" &&
                    order.paymentStatus !== "PAID" && // ✅ FIX
                    order.status !== "CANCELLED" &&
                    !canReviewOrder && (
                      <button
                        className={styles.payBtn}
                        onClick={() => handlePay(order.id)}
                      >
                        Thanh toán
                      </button>
                    )}
                  {["PENDING", "CONFIRMED"].includes(order.status) &&
                    order.paymentStatus !== "PAID" && (
                      <button
                        className={styles.cancelBtn}
                        onClick={() => handleCancel(order.id)}
                      >
                        Huỷ đơn
                      </button>
                    )}

                  {canReviewOrder && !orderReviewed && (
                    <button
                      className={styles.reviewBtn}
                      onClick={() => navigate(`/orders/${order.id}?review=1`)}
                    >
                      <Star size={16} />
                      Đánh giá
                    </button>
                  )}

                  {canReviewOrder && (
                    <button
                      className={styles.buyAgain}
                      onClick={() => handleBuyAgain(order)}
                    >
                      <RotateCcw size={16} />
                      Mua lại
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

      {/* ===== Pagination ===== */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button disabled={page === 0} onClick={() => setPage(page - 1)}>
            <ChevronLeft size={16} />
          </button>

          <span>
            Trang {page + 1} / {totalPages}
          </span>

          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
