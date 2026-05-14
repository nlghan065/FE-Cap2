import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
  FolderKanban,
  Heart,
  Loader2,
  PackageCheck,
  Plus,
  Sparkles,
  Truck,
  X,
} from "lucide-react";
import { getMyDesignRequestsApi } from "../../api/aiRecommendApi";
import { getOrdersApi } from "../../api/orderApi";
import { getProfileApi } from "../../api/profileApi";
import {
  getWishlistApi,
  getWishlistProduct,
  getWishlistProductId,
  normalizeWishlistItems,
} from "../../api/wishlistApi";
import logoImage from "../../assets/logo.png";
import styles from "../../styles/Home.module.css";
import { normalizeAiRecommendResult } from "../../utils/aiRecommendResultV2";
import { resolveImageUrl } from "../../utils/imageUrl";
import {
  getResolvedOrderItemImage,
  hydrateOrderItemsWithImages,
} from "../../utils/orderItemImage";

const PANEL_KEYS = {
  PROJECTS: "projects",
  ORDERS: "orders",
  WISHLIST: "wishlist",
};

const AI_DESIGNER_STORAGE_KEY = "aiDesignerData";
const ACTIVE_PROJECT_STATUSES = new Set(["PENDING", "PROCESSING"]);
const SHIPPING_STATUSES = new Set(["CONFIRMED", "SHIPPING"]);

const PROJECT_STATUS_META = {
  COMPLETED: { label: "Hoàn tất", tone: "done" },
  PENDING: { label: "Đang chờ AI", tone: "draft" },
  PROCESSING: { label: "Đang xử lý", tone: "draft" },
  FAILED: { label: "Thất bại", tone: "error" },
};

const ORDER_STATUS_META = {
  PENDING: { label: "Đang xử lý", tone: "pending" },
  CONFIRMED: { label: "Đã xác nhận", tone: "confirmed" },
  SHIPPING: { label: "Đang giao", tone: "shipping" },
  DELIVERED: { label: "Đã giao", tone: "delivered" },
  COMPLETED: { label: "Hoàn thành", tone: "delivered" },
  CANCELLED: { label: "Đã hủy", tone: "cancelled" },
};

const ROOM_TYPE_LABELS = {
  living_room: "Phòng khách",
  livingroom: "Phòng khách",
  phong_khach: "Phòng khách",
  bedroom: "Phòng ngủ",
  phong_ngu: "Phòng ngủ",
  kitchen: "Phòng bếp",
  phong_bep: "Phòng bếp",
  dining_room: "Phòng ăn",
  diningroom: "Phòng ăn",
  phong_an: "Phòng ăn",
};

const padCount = (value) => String(Number(value || 0)).padStart(2, "0");

const formatPrice = (value = 0) =>
  `${Number(value || 0).toLocaleString("vi-VN")} đ`;

const formatDateTime = (value) => {
  if (!value) return "Chưa có thời gian";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có thời gian";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatRelativeTime = (value) => {
  if (!value) return "Vừa cập nhật";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Vừa cập nhật";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} ngày trước`;

  return formatDateTime(value);
};

const prettifyLabel = (value) =>
  String(value || "")
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getRoomTypeLabel = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  return ROOM_TYPE_LABELS[normalized] || prettifyLabel(value) || "Thiết kế AI";
};

const getProjectStatusMeta = (status) =>
  PROJECT_STATUS_META[status] || {
    label: prettifyLabel(status) || "Đang chờ AI",
    tone: "draft",
  };

const getOrderStatusMeta = (status) =>
  ORDER_STATUS_META[status] || {
    label: prettifyLabel(status) || "Đang xử lý",
    tone: "pending",
  };

const getProjectDimensionLabel = (roomAnalysis) => {
  const width = roomAnalysis?.width;
  const length = roomAnalysis?.length;
  const height = roomAnalysis?.height;

  if (width && length && height) {
    return `${width} x ${length} x ${height} m`;
  }

  if (width && length) {
    return `${width} x ${length} m`;
  }

  if (height) {
    return `Cao ${height} m`;
  }

  return "Chưa có";
};

const buildAiDesignerFormData = (result) => ({
  roomType: result?.roomType || "",
  dimensions: {
    width:
      result?.roomAnalysis?.width !== undefined &&
      result?.roomAnalysis?.width !== null
        ? String(result.roomAnalysis.width)
        : "",
    length:
      result?.roomAnalysis?.length !== undefined &&
      result?.roomAnalysis?.length !== null
        ? String(result.roomAnalysis.length)
        : "",
    height:
      result?.roomAnalysis?.height !== undefined &&
      result?.roomAnalysis?.height !== null
        ? String(result.roomAnalysis.height)
        : "",
  },
  style: result?.style || "",
  furnitureDensity: result?.furnitureDensity || "",
  gender: result?.gender || "",
  age: result?.age ? String(result.age) : "",
});

const mapWishlistItem = (item) => {
  const product = getWishlistProduct(item);
  const productId = getWishlistProductId(item);

  return {
    id: productId ? String(productId) : "",
    name: product?.name || item?.productName || item?.name || "Sản phẩm",
    description: product?.description || item?.description || "",
    price: product?.price ?? item?.price ?? 0,
    stock: product?.stock ?? item?.stock ?? null,
    category: product?.category || item?.category || "",
    image:
      resolveImageUrl(
        product?.images?.[0] ||
          product?.image ||
          product?.thumbnail ||
          item?.productImage ||
          item?.image,
      ) || logoImage,
  };
};

const mapDesignRequest = (payload, index) => {
  const normalized = normalizeAiRecommendResult(payload || {});
  const status = payload?.status || normalized.requestMeta?.status || "PENDING";
  const statusMeta = getProjectStatusMeta(status);
  const productImages = normalized.products
    .map((item) => resolveImageUrl(item.imageUrl || item.image))
    .filter(Boolean);
  const previewCandidate = normalized.imageUrl || productImages[0] || "";
  const title = [
    getRoomTypeLabel(normalized.roomType),
    normalized.style ? prettifyLabel(normalized.style) : "",
  ]
    .filter(Boolean)
    .join(" • ");

  return {
    id: normalized.id || `design-request-${index + 1}`,
    title: title || `Yêu cầu AI #${index + 1}`,
    subtitle: normalized.products.length
      ? `${normalized.products.length} sản phẩm AI`
      : "Đang chờ AI đề xuất",
    previewImage: resolveImageUrl(previewCandidate),
    createdAt: normalized.createdAt || payload?.createdAt || null,
    status,
    statusLabel: statusMeta.label,
    statusTone: statusMeta.tone,
    requestId: normalized.requestMeta?.id || normalized.id || "",
    roomType: getRoomTypeLabel(normalized.roomType),
    style: normalized.style ? prettifyLabel(normalized.style) : "",
    productCount: normalized.products.length,
    totalPrice: normalized.totalPrice || 0,
    dimensionLabel: getProjectDimensionLabel(normalized.roomAnalysis),
    productImages,
    reasoning:
      normalized.reasoning ||
      normalized.requestMeta?.message ||
      "Yêu cầu đang chờ hệ thống xử lý.",
    result: normalized,
  };
};

const getOrderProgress = (order) => {
  const currentStepByStatus = {
    PENDING: 0,
    CONFIRMED: 1,
    SHIPPING: 2,
    DELIVERED: 3,
    COMPLETED: 3,
    CANCELLED: 0,
  };
  const currentStep = currentStepByStatus[order?.status] ?? 0;

  const steps = [
    {
      label: "Đã tạo đơn",
      description: order?.createdAt
        ? formatDateTime(order.createdAt)
        : "Hệ thống đã ghi nhận đơn hàng",
    },
    {
      label: "Đã xác nhận",
      description:
        currentStep >= 1
          ? "Đơn hàng đã được xác nhận"
          : "Đang chờ cửa hàng xác nhận",
    },
    {
      label: "Đang giao",
      description:
        currentStep >= 2
          ? "Đơn hàng đang trên đường giao"
          : "Sẽ cập nhật sau khi xuất kho",
    },
    {
      label: "Hoàn tất",
      description:
        currentStep >= 3
          ? "Đơn hàng đã giao thành công"
          : "Hoàn tất sau khi giao",
    },
  ];

  return steps.map((step, index) => {
    let state = "upcoming";

    if (index < currentStep) {
      state = "completed";
    } else if (index === currentStep) {
      state = order?.status === "CANCELLED" ? "cancelled" : "active";
    }

    return {
      ...step,
      state,
    };
  });
};

const getProjectProgress = (project) => {
  const status = project?.status || "PENDING";
  const currentStepByStatus = {
    PENDING: 1,
    PROCESSING: 2,
    COMPLETED: 3,
    FAILED: 2,
  };
  const currentStep = currentStepByStatus[status] ?? 1;
  const hasProducts = Number(project?.productCount || 0) > 0;
  const isFailed = status === "FAILED";

  const steps = [
    {
      label: "Đã tạo yêu cầu",
      description: project?.createdAt
        ? formatDateTime(project.createdAt)
        : "Hệ thống đã ghi nhận yêu cầu AI",
    },
    {
      label: "AI tiếp nhận",
      description: isFailed
        ? "Yêu cầu đã được tiếp nhận nhưng chưa xử lý trọn vẹn"
        : currentStep >= 1
          ? "AI Designer đã nhận thông tin không gian và phong cách"
          : "Đang chờ hệ thống tiếp nhận",
    },
    {
      label: "Đang phân tích",
      description: isFailed
        ? "AI chưa thể hoàn tất bước phân tích cho dự án này"
        : currentStep >= 2
          ? "AI đã phân tích không gian và đối chiếu sản phẩm phù hợp"
          : "Sẽ bắt đầu khi yêu cầu được đưa vào xử lý",
    },
    {
      label: "Hoàn tất",
      description: isFailed
        ? "Mở lại AI Designer để kiểm tra hoặc gửi lại yêu cầu"
        : hasProducts
          ? `${project.productCount} sản phẩm AI đã sẵn sàng để xem chi tiết`
          : "Hiển thị khi AI trả kết quả hoàn chỉnh",
    },
  ];

  return steps.map((step, index) => {
    let state = "upcoming";

    if (isFailed && index === 2) {
      state = "failed";
    } else if (index < currentStep) {
      state = "completed";
    } else if (index === currentStep) {
      state = "active";
    }

    return {
      ...step,
      state,
    };
  });
};

function EmptyPanelState({ icon, title, description, actionLabel, onAction }) {
  const EmptyIcon = icon;

  return (
    <div className={styles.emptyPanel}>
      <div className={styles.emptyPanelIcon}>
        <EmptyIcon size={22} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          className={styles.panelPrimaryBtn}
          onClick={onAction}
        >
          {actionLabel}
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}

function ProjectsPanel({
  loading,
  error,
  items,
  selectedProject,
  onOpenDesigner,
  onViewProject,
}) {
  if (loading) {
    return (
      <div className={styles.panelLoading}>
        <Loader2 size={24} className={styles.spinner} />
        <span>Đang tải dự án AI...</span>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyPanelState
        icon={FolderKanban}
        title="Không tải được dự án AI"
        description={error}
        actionLabel="Mở AI Designer"
        onAction={onOpenDesigner}
      />
    );
  }

  if (!items.length) {
    return (
      <EmptyPanelState
        icon={FolderKanban}
        title="Chưa có dự án AI"
        description="Khi bạn tạo yêu cầu bằng AI Designer, dự án gần đây sẽ xuất hiện tại đây."
        actionLabel="Tạo dự án AI"
        onAction={onOpenDesigner}
      />
    );
  }

  const currentProject = selectedProject || items[0];
  const progress = getProjectProgress(currentProject);
  const productImages = (currentProject.productImages || []).slice(0, 3);

  return (
    <div className={styles.panelStack}>
      <div className={styles.panelScroll}>
        <article className={styles.orderCard}>
          <div className={styles.orderTop}>
            <div>
              <strong className={styles.orderCode}>
                {currentProject.title}
              </strong>
              <p className={styles.orderDate}>
                {currentProject.requestId
                  ? `${currentProject.requestId} • `
                  : ""}
                {formatDateTime(currentProject.createdAt)}
              </p>
            </div>

            <span
              className={`${styles.projectStatus} ${styles[currentProject.statusTone]}`}
            >
              {currentProject.statusLabel}
            </span>
          </div>

          <div className={styles.panelProjectVisual}>
            {currentProject.previewImage ? (
              <img
                src={currentProject.previewImage}
                alt={currentProject.title}
                className={styles.panelProjectImage}
                loading="lazy"
              />
            ) : (
              <div className={styles.panelProjectFallback}>
                <Sparkles size={18} />
                <span>{currentProject.roomType}</span>
              </div>
            )}
          </div>

          {!!currentProject.reasoning && (
            <div className={styles.projectInsight}>
              <strong>Đánh giá AI</strong>
              <p>{currentProject.reasoning}</p>
            </div>
          )}

          {productImages.length > 0 && (
            <div className={styles.projectThumbSection}>
              <span className={styles.projectSectionLabel}>
                Sản phẩm AI gợi ý
              </span>
              <div className={styles.orderThumbRow}>
                {productImages.map((image, index) => (
                  <img
                    key={`${currentProject.id}-product-${index + 1}`}
                    src={image}
                    alt={`${currentProject.title} - sản phẩm ${index + 1}`}
                    className={styles.orderThumb}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = logoImage;
                    }}
                  />
                ))}

                {currentProject.productCount > productImages.length && (
                  <span className={styles.orderThumbMore}>
                    +{currentProject.productCount - productImages.length}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className={styles.orderMetaGrid}>
            <div>
              <span>Không gian</span>
              <strong>{currentProject.roomType}</strong>
            </div>
            <div>
              <span>Kích thước</span>
              <strong>{currentProject.dimensionLabel}</strong>
            </div>
            <div>
              <span>Sản phẩm AI</span>
              <strong>{currentProject.productCount || 0} sản phẩm</strong>
            </div>
            <div>
              <span>Tổng dự kiến</span>
              <strong>
                {currentProject.totalPrice > 0
                  ? formatPrice(currentProject.totalPrice)
                  : "Đang chờ AI"}
              </strong>
            </div>
          </div>

          <div className={styles.orderProgress}>
            {progress.map((step) => (
              <div key={step.label} className={styles.progressItem}>
                <span
                  className={`${styles.progressDot} ${styles[step.state]}`}
                />
                <div>
                  <strong>{step.label}</strong>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className={styles.panelSecondaryBtn}
            onClick={() => onViewProject(currentProject)}
          >
            Xem chi tiết dự án
            <ArrowRight size={16} />
          </button>
        </article>
      </div>

      <button
        type="button"
        className={styles.panelFooterBtn}
        onClick={onOpenDesigner}
      >
        Mở AI Designer
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

function OrdersPanel({ loading, error, items, onViewOrder, onViewAllOrders }) {
  if (loading) {
    return (
      <div className={styles.panelLoading}>
        <Loader2 size={24} className={styles.spinner} />
        <span>Đang tải đơn hàng...</span>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyPanelState
        icon={Truck}
        title="Không tải được đơn hàng"
        description={error}
        actionLabel="Xem trang đơn hàng"
        onAction={onViewAllOrders}
      />
    );
  }

  if (!items.length) {
    return (
      <EmptyPanelState
        icon={Truck}
        title="Không có đơn đang giao"
        description="Đơn hàng ở trạng thái đã xác nhận hoặc đang vận chuyển sẽ hiển thị ở đây."
        actionLabel="Xem tất cả đơn hàng"
        onAction={onViewAllOrders}
      />
    );
  }

  return (
    <div className={styles.panelStack}>
      <div className={styles.panelScroll}>
        {items.map((order) => {
          const statusMeta = getOrderStatusMeta(order.status);
          const progress = getOrderProgress(order);
          const orderId = order?.id || order?._id || order?.orderId;

          return (
            <article
              key={orderId || order.orderCode}
              className={styles.orderCard}
            >
              <div className={styles.orderTop}>
                <div>
                  <strong className={styles.orderCode}>
                    {order.orderCode}
                  </strong>
                  <p className={styles.orderDate}>
                    {formatDateTime(order.createdAt)}
                  </p>
                </div>

                <span
                  className={`${styles.orderBadge} ${styles[statusMeta.tone]}`}
                >
                  {statusMeta.label}
                </span>
              </div>

              <div className={styles.orderThumbRow}>
                {(order.items || []).slice(0, 3).map((item, index) => (
                  <img
                    key={item.id || `${order.orderCode}-${index}`}
                    src={getResolvedOrderItemImage(item) || logoImage}
                    alt={item.productName || "Sản phẩm"}
                    className={styles.orderThumb}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = logoImage;
                    }}
                  />
                ))}

                {(order.items || []).length > 3 && (
                  <span className={styles.orderThumbMore}>
                    +{order.items.length - 3}
                  </span>
                )}
              </div>

              <div className={styles.orderMetaGrid}>
                <div>
                  <span>Tổng tiền</span>
                  <strong>{formatPrice(order.totalAmount)}</strong>
                </div>
                <div>
                  <span>Thanh toán</span>
                  <strong>
                    {order.paymentMethodDisplay || order.paymentMethod || "COD"}
                  </strong>
                </div>
              </div>

              <div className={styles.orderProgress}>
                {progress.map((step) => (
                  <div key={step.label} className={styles.progressItem}>
                    <span
                      className={`${styles.progressDot} ${styles[step.state]}`}
                    />
                    <div>
                      <strong>{step.label}</strong>
                      <p>{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className={styles.panelSecondaryBtn}
                onClick={() => onViewOrder(orderId)}
                disabled={!orderId}
              >
                Xem chi tiết đơn
                <ArrowRight size={16} />
              </button>
            </article>
          );
        })}
      </div>

      <button
        type="button"
        className={styles.panelFooterBtn}
        onClick={onViewAllOrders}
      >
        Xem toàn bộ đơn hàng
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

function WishlistPanel({
  loading,
  error,
  items,
  onViewProduct,
  onViewWishlist,
}) {
  const totalValue = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0),
    0,
  );

  if (loading) {
    return (
      <div className={styles.panelLoading}>
        <Loader2 size={24} className={styles.spinner} />
        <span>Đang tải danh sách yêu thích...</span>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyPanelState
        icon={Heart}
        title="Không tải được yêu thích"
        description={error}
        actionLabel="Mở danh sách yêu thích"
        onAction={onViewWishlist}
      />
    );
  }

  if (!items.length) {
    return (
      <EmptyPanelState
        icon={Heart}
        title="Chưa có sản phẩm yêu thích"
        description="Những sản phẩm bạn lưu từ trang sản phẩm sẽ hiển thị nhanh tại đây."
        actionLabel="Khám phá sản phẩm"
        onAction={onViewWishlist}
      />
    );
  }

  return (
    <div className={styles.panelStack}>
      <div className={styles.panelScroll}>
        <div className={styles.wishlistGrid}>
          {items.map((item) => (
            <article key={item.id} className={styles.wishlistCard}>
              <button
                type="button"
                className={styles.wishlistImageBtn}
                onClick={() => onViewProduct(item.id)}
              >
                <img
                  src={item.image || logoImage}
                  alt={item.name}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = logoImage;
                  }}
                />
              </button>

              <div className={styles.wishlistBody}>
                <div className={styles.wishlistMeta}>
                  <span>{item.category || "Nội thất"}</span>
                  {item.stock === 0 && (
                    <strong className={styles.outOfStock}>Hết hàng</strong>
                  )}
                </div>

                <h3>{item.name}</h3>
                <strong>{formatPrice(item.price)}</strong>
              </div>

              <button
                type="button"
                className={styles.wishlistAction}
                onClick={() => onViewProduct(item.id)}
              >
                Xem sản phẩm
                <ChevronRight size={15} />
              </button>
            </article>
          ))}
        </div>
      </div>

      <div className={styles.panelFooterSummary}>
        <div>
          <span>Đang hiển thị</span>
          <strong>{items.length} sản phẩm</strong>
        </div>
        <div>
          <span>Tổng giá trị</span>
          <strong>{formatPrice(totalValue)}</strong>
        </div>
      </div>

      <button
        type="button"
        className={styles.panelFooterBtn}
        onClick={onViewWishlist}
      >
        Xem toàn bộ yêu thích
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

function Home() {
  const navigate = useNavigate();
  const sidePanelRef = useRef(null);
  const [firstName, setFirstName] = useState("bạn");
  const [isLoading, setIsLoading] = useState(true);
  const [activePanel, setActivePanel] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [designRequests, setDesignRequests] = useState([]);
  const [shippingOrders, setShippingOrders] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [errors, setErrors] = useState({
    projects: "",
    orders: "",
    wishlist: "",
  });

  useEffect(() => {
    let isMounted = true;

    const loadHomeData = async () => {
      setIsLoading(true);

      const [profileResult, projectsResult, ordersResult, wishlistResult] =
        await Promise.allSettled([
          getProfileApi(),
          getMyDesignRequestsApi({
            page: 0,
            size: 20,
            sort: "createdAt,desc",
          }),
          getOrdersApi(0, 100),
          getWishlistApi(),
        ]);

      if (!isMounted) return;

      const nextErrors = {
        projects: "",
        orders: "",
        wishlist: "",
      };

      if (profileResult.status === "fulfilled") {
        const fullName = profileResult.value?.fullName?.trim();
        if (fullName) {
          const nameParts = fullName.split(/\s+/);
          setFirstName(nameParts[nameParts.length - 1]);
        }
      }

      if (projectsResult.status === "fulfilled") {
        const mappedProjects = (projectsResult.value?.content || []).map(
          mapDesignRequest,
        );
        setDesignRequests(mappedProjects);
      } else {
        console.error("Load design requests error:", projectsResult.reason);
        nextErrors.projects = "Không thể lấy dữ liệu dự án AI từ hệ thống.";
        setDesignRequests([]);
      }

      if (ordersResult.status === "fulfilled") {
        try {
          const ordersPayload = ordersResult.value;
          const rawOrders = ordersPayload?.content || [];
          const imageCache = new Map();
          const hydratedOrders = await Promise.all(
            rawOrders.map(async (order) => ({
              ...order,
              items: await hydrateOrderItemsWithImages(
                order.items || [],
                imageCache,
              ),
            })),
          );

          if (!isMounted) return;

          setShippingOrders(
            hydratedOrders.filter((order) =>
              SHIPPING_STATUSES.has(order.status),
            ),
          );
        } catch (error) {
          console.error("Hydrate home orders error:", error);
          nextErrors.orders = "Không thể xử lý hình ảnh đơn hàng.";
          setShippingOrders([]);
        }
      } else {
        console.error("Load orders error:", ordersResult.reason);
        nextErrors.orders = "Không thể lấy dữ liệu đơn hàng từ hệ thống.";
        setShippingOrders([]);
      }

      if (wishlistResult.status === "fulfilled") {
        const mappedWishlistItems = normalizeWishlistItems(wishlistResult.value)
          .map(mapWishlistItem)
          .filter((item) => item.id);
        setWishlistItems(mappedWishlistItems);
      } else {
        console.error("Load wishlist error:", wishlistResult.reason);
        nextErrors.wishlist = "Không thể lấy dữ liệu yêu thích từ hệ thống.";
        setWishlistItems([]);
      }

      setErrors(nextErrors);
      setIsLoading(false);
    };

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!designRequests.length) {
      setSelectedProjectId("");
      return;
    }

    setSelectedProjectId((currentProjectId) =>
      designRequests.some((project) => project.id === currentProjectId)
        ? currentProjectId
        : designRequests[0].id,
    );
  }, [designRequests]);

  useEffect(() => {
    if (!activePanel || !sidePanelRef.current) return;

    sidePanelRef.current.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [activePanel, selectedProjectId]);

  const activeProjectsCount = designRequests.filter((project) =>
    ACTIVE_PROJECT_STATUSES.has(project.status),
  ).length;
  const recentProjects = designRequests.slice(0, 2);
  const selectedProject =
    designRequests.find((project) => project.id === selectedProjectId) ||
    designRequests[0] ||
    null;

  const stats = [
    {
      key: PANEL_KEYS.PROJECTS,
      label: "Dự án đang thực hiện",
      value: errors.projects ? "--" : padCount(activeProjectsCount),
      icon: FolderKanban,
      tone: "blue",
      helper: "Mở panel dự án AI",
    },
    {
      key: PANEL_KEYS.ORDERS,
      label: "Đơn hàng đang giao",
      value: errors.orders ? "--" : padCount(shippingOrders.length),
      icon: PackageCheck,
      tone: "orange",
      helper: "Xem chi tiết đơn hàng",
    },
    {
      key: PANEL_KEYS.WISHLIST,
      label: "Sản phẩm yêu thích",
      value: errors.wishlist ? "--" : padCount(wishlistItems.length),
      icon: Heart,
      tone: "violet",
      helper: "Xem nhanh danh sách đã lưu",
    },
  ];

  const panelMeta = {
    [PANEL_KEYS.PROJECTS]: {
      icon: FolderKanban,
      title: "Dự án AI gần đây",
      subtitle: `${designRequests.length} yêu cầu thiết kế đã tạo bằng AI Designer`,
    },
    [PANEL_KEYS.ORDERS]: {
      icon: Truck,
      title: "Đơn hàng đang giao",
      subtitle: `${shippingOrders.length} đơn đã xác nhận hoặc đang vận chuyển`,
    },
    [PANEL_KEYS.WISHLIST]: {
      icon: Heart,
      title: "Danh sách yêu thích",
      subtitle: `${wishlistItems.length} sản phẩm đã lưu từ trang sản phẩm`,
    },
  };

  const handleCreateProject = () => {
    navigate("/ai-designer");
  };

  const handleViewProject = (project) => {
    if (!project?.result) {
      navigate("/ai-designer");
      return;
    }

    try {
      localStorage.setItem(
        AI_DESIGNER_STORAGE_KEY,
        JSON.stringify({
          step: 4,
          uploadedImage:
            project.previewImage || project.result.imageUrl || null,
          aiResults: project.result,
          formData: buildAiDesignerFormData(project.result),
        }),
      );
    } catch (error) {
      console.error("Persist AI project detail error:", error);
    }

    navigate("/ai-designer");
  };

  const handleOpenProjectPanel = (projectId) => {
    const nextProject =
      designRequests.find((project) => project.id === projectId) ||
      designRequests[0] ||
      null;

    setSelectedProjectId(nextProject?.id || "");
    setActivePanel(PANEL_KEYS.PROJECTS);
  };

  const handleOpenPanel = (panelKey, options = {}) => {
    if (panelKey === PANEL_KEYS.PROJECTS) {
      handleOpenProjectPanel(options.projectId || selectedProjectId);
      return;
    }

    setActivePanel(panelKey);
  };

  const renderPanelContent = () => {
    if (activePanel === PANEL_KEYS.PROJECTS) {
      return (
        <ProjectsPanel
          loading={isLoading}
          error={errors.projects}
          items={designRequests}
          onOpenDesigner={handleCreateProject}
          onViewProject={handleViewProject}
          selectedProject={selectedProject}
        />
      );
    }

    if (activePanel === PANEL_KEYS.ORDERS) {
      return (
        <OrdersPanel
          loading={isLoading}
          error={errors.orders}
          items={shippingOrders}
          onViewOrder={(orderId) => navigate(`/orders/${orderId}`)}
          onViewAllOrders={() => navigate("/orders")}
        />
      );
    }

    return (
      <WishlistPanel
        loading={isLoading}
        error={errors.wishlist}
        items={wishlistItems}
        onViewProduct={(productId) => navigate(`/products/${productId}`)}
        onViewWishlist={() => navigate("/wishlist")}
      />
    );
  };

  const activePanelMeta =
    panelMeta[activePanel] || panelMeta[PANEL_KEYS.WISHLIST];
  const ActivePanelIcon = activePanelMeta.icon;

  return (
    <div className={styles.page}>
      <div
        className={`${styles.dashboardShell} ${
          !activePanel ? styles.dashboardShellFull : ""
        }`}
      >
        <div className={styles.mainColumn}>
          <section className={styles.hero}>
            <div>
              <p className={styles.kicker}>Trang chủ người dùng</p>
              <h1>Chào {firstName}, hôm nay bạn muốn làm gì?</h1>
              <p className={styles.subtitle}>
                Tiếp tục công việc, xem nhanh đơn hàng hoặc mở lại các sản phẩm
                bạn đã lưu.
              </p>
            </div>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleCreateProject}
            >
              <Plus size={18} />
              Tạo dự án mới
            </button>
          </section>

          <section className={styles.statsGrid}>
            {stats.map((item) => {
              const Icon = item.icon;
              const isActive = activePanel === item.key;

              return (
                <button
                  type="button"
                  key={item.key}
                  className={`${styles.statCard} ${isActive ? styles.statCardActive : ""}`}
                  onClick={() => handleOpenPanel(item.key)}
                  aria-pressed={isActive}
                >
                  <div className={`${styles.statIcon} ${styles[item.tone]}`}>
                    <Icon size={18} />
                  </div>

                  <div className={styles.statContent}>
                    <strong className={styles.statValue}>
                      {isLoading && !errors[item.key] ? "--" : item.value}
                    </strong>
                    <p className={styles.statLabel}>{item.label}</p>
                    <span className={styles.statHelper}>{item.helper}</span>
                  </div>

                  <ChevronRight size={16} className={styles.statArrow} />
                </button>
              );
            })}
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>Dự án gần đây</h2>
                <p>
                  Xem lại các yêu cầu thiết kế AI bạn đã tạo gần đây hoặc mở lại
                </p>
              </div>

              <button
                type="button"
                className={styles.linkButton}
                onClick={handleCreateProject}
              >
                Mở AI Designer
                <ArrowRight size={16} />
              </button>
            </div>

            <div className={styles.projectGrid}>
              {isLoading ? (
                <article className={styles.projectEmptyCard}>
                  <div className={styles.emptyPanelIcon}>
                    <Loader2 size={22} className={styles.spinner} />
                  </div>
                  <h3>Đang tải dự án gần đây</h3>
                  <p>
                    Hệ thống đang lấy dữ liệu dự án AI từ lịch sử AI Designer
                    của bạn. Vui lòng chờ trong giây lát.
                  </p>
                </article>
              ) : recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <article
                    key={project.id}
                    className={`${styles.projectCard} ${
                      activePanel === PANEL_KEYS.PROJECTS &&
                      selectedProject?.id === project.id
                        ? styles.projectCardActive
                        : ""
                    }`}
                  >
                    <div className={styles.projectVisual}>
                      <span
                        className={`${styles.projectStatus} ${styles[project.statusTone]}`}
                      >
                        {project.statusLabel}
                      </span>

                      {project.previewImage ? (
                        <img
                          src={project.previewImage}
                          alt={project.title}
                          className={styles.projectPreview}
                          loading="lazy"
                        />
                      ) : (
                        <div className={styles.projectFallback}>
                          <Sparkles size={22} />
                          <span>{project.roomType}</span>
                        </div>
                      )}
                    </div>

                    <div className={styles.projectBody}>
                      <div>
                        <h3>{project.title}</h3>
                        <p>
                          {formatRelativeTime(project.createdAt)} •{" "}
                          {project.subtitle}
                        </p>
                      </div>

                      <button
                        type="button"
                        className={`${styles.projectAction} ${
                          activePanel === PANEL_KEYS.PROJECTS &&
                          selectedProject?.id === project.id
                            ? styles.projectActionActive
                            : ""
                        }`}
                        onClick={() => handleOpenProjectPanel(project.id)}
                        aria-pressed={
                          activePanel === PANEL_KEYS.PROJECTS &&
                          selectedProject?.id === project.id
                        }
                      >
                        Chi tiết
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <article className={styles.projectEmptyCard}>
                  <div className={styles.emptyPanelIcon}>
                    {errors.projects ? (
                      <X size={22} />
                    ) : (
                      <FolderKanban size={22} />
                    )}
                  </div>
                  <h3>
                    {errors.projects
                      ? "Không tải được dự án AI"
                      : "Chưa có dự án AI gần đây"}
                  </h3>
                  <p>
                    {errors.projects
                      ? errors.projects
                      : "Sau khi gửi yêu cầu ở AI Designer, lịch sử dự án sẽ hiển thị tại đây."}
                  </p>
                </article>
              )}

              <button
                type="button"
                className={styles.createCard}
                onClick={handleCreateProject}
              >
                <div className={styles.createIcon}>
                  <Plus size={22} />
                </div>
                <strong>Bắt đầu dự án mới</strong>
                <span>
                  Upload ảnh phòng hoặc cấu hình không gian 3D bằng AI.
                </span>
                <div className={styles.createHint}>
                  <Sparkles size={16} />
                  Khởi tạo với AI Designer
                </div>
              </button>
            </div>
          </section>
        </div>

        {activePanel && (
          <aside className={styles.sidePanel} ref={sidePanelRef}>
            <div className={styles.sidePanelHeader}>
              <div>
                <p className={styles.panelKicker}>
                  <ActivePanelIcon size={15} />
                  Chi tiết
                </p>
                <h2>{activePanelMeta.title}</h2>
                <span>{activePanelMeta.subtitle}</span>
              </div>

              <button
                type="button"
                className={styles.panelClose}
                onClick={() => setActivePanel(null)}
                aria-label="Đóng panel"
              >
                <X size={18} />
              </button>
            </div>

            {renderPanelContent()}
          </aside>
        )}
      </div>
    </div>
  );
}

export default Home;
