import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/Admin.module.css";

import AdminHeader from "../../layout/admin/AdminHeader";
import AdminMenu from "../../layout/admin/AdminMenu";
import { Eye, Pencil, Search } from "lucide-react";

import {
  getOrdersAdminApi,
  searchOrdersAdminApi,
  updateOrderStatusApi,
} from "../../api/orderAdminApi";

const OrdersAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ===== FORMAT MONEY =====
  const formatMoney = (value) => {
    const num = Number(value);
    if (isNaN(num)) return "0 đ";
    return num.toLocaleString("vi-VN") + " đ";
  };

  // ===== FETCH =====
  const fetchOrders = async () => {
    try {
      setLoading(true);

      let res;

      if (keyword || status) {
        res = await searchOrdersAdminApi({
          page,
          size: 10,
          keyword,
          status,
        });
      } else {
        res = await getOrdersAdminApi({
          page,
          size: 10,
        });
      }

      setOrders(res.content || []);
      setTotalPages(res.totalPages || 1);
    } catch (e) {
      console.error("Fetch orders error:", e);
      alert("Không tải được đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, keyword, status]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  // ===== UPDATE STATUS =====
  const handleUpdateStatus = async (order, newStatus) => {
    // ❌ lock đơn
    if (order.status === "DELIVERED" || order.status === "CANCELLED") {
      alert("Đơn này không thể cập nhật!");
      return;
    }

    // 🚨 CHẶN VNPAY CHƯA THANH TOÁN
    if (order.paymentMethod === "VNPAY" && order.paymentStatus !== "PAID") {
      alert("Đơn chưa thanh toán VNPAY → không thể cập nhật!");
      return;
    }

    // 🚨 CHẶN NHẢY FLOW
    const validFlow = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["SHIPPING", "CANCELLED"],
      SHIPPING: ["DELIVERED"],
    };

    if (!validFlow[order.status]?.includes(newStatus)) {
      alert("Không thể chuyển trạng thái không hợp lệ!");
      return;
    }

    const confirmMsg =
      newStatus === "CANCELLED"
        ? "Bạn có chắc muốn HỦY đơn này?"
        : `Chuyển sang "${newStatus}"?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setLoading(true);

      await updateOrderStatusApi(order.id, newStatus);

      if (newStatus === "DELIVERED") {
        alert("Đã giao hàng → hệ thống đã cộng số lượng bán!");
      }

      fetchOrders();
    } catch (e) {
      console.error(e);
      alert("Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.adminDashboard}>
      <AdminHeader />
      <AdminMenu />

      <div className={styles.orderContainer}>
        {/* TOP BAR */}
        <div className={styles.orderTopBar}>
          <div className={styles.orderSearchBox}>
            <Search size={16} />
            <input
              placeholder="Tìm đơn hàng..."
              value={keyword}
              onChange={(e) => {
                setPage(0);
                setKeyword(e.target.value);
              }}
            />
          </div>

          <select
            className={styles.orderSelect}
            value={status}
            onChange={(e) => {
              setPage(0);
              setStatus(e.target.value);
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Đang xử lý</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="SHIPPING">Đang giao</option>
            <option value="DELIVERED">Đã giao</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>

        {/* TABLE */}
        <div className={styles.orderTable}>
          <div className={styles.orderThead}>
            <span>Mã đơn</span>
            <span>Khách hàng</span>
            <span>Sản phẩm</span>
            <span>Tổng tiền</span>
            <span>Thanh toán</span>
            <span>Trạng thái</span>
            <span>Ngày đặt</span>
            <span>Thao tác</span>
          </div>

          {loading ? (
            <p style={{ padding: 20 }}>Đang tải...</p>
          ) : orders.length === 0 ? (
            <p style={{ padding: 20 }}>Không có đơn hàng</p>
          ) : (
            orders.map((o) => {
              const isLocked =
                o.status === "DELIVERED" || o.status === "CANCELLED";
              const isVnpayNotPaid =
                o.paymentMethod === "VNPAY" && o.paymentStatus !== "PAID";
              const canCancel = ["PENDING", "CONFIRMED"].includes(o.status);

              return (
                <div key={o.id} className={styles.orderRow}>
                  <span className={styles.orderCode}>{o.orderCode}</span>

                  <span>
                    <b>{o.customerName}</b>
                    <br />
                    <small>{o.customerEmail}</small>
                  </span>

                  <span>{o.totalItems || 0} sản phẩm</span>

                  <span className={styles.orderMoney}>
                    {formatMoney(o.totalAmount)}
                  </span>

                  <span>
                    {o.paymentMethodDisplay}
                    <br />
                    <small
                      style={{
                        color:
                          o.paymentStatus === "FAILED"
                            ? "red"
                            : o.paymentStatus === "PAID"
                              ? "green"
                              : "orange",
                      }}
                    >
                      {o.paymentStatusDisplay}
                    </small>
                  </span>

                  <select
                    className={`${styles.orderStatusSelect} ${
                      styles[`order_${o.status.toLowerCase()}`]
                    }`}
                    value={o.status}
                    onChange={(e) => handleUpdateStatus(o, e.target.value)}
                    disabled={loading || isLocked || isVnpayNotPaid}
                  >
                    <option value="PENDING">Đang xử lý</option>
                    <option value="CONFIRMED">Đã xác nhận</option>
                    <option value="SHIPPING">Đang giao</option>
                    <option value="DELIVERED">Đã giao</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>

                  <span>
                    {o.createdAt
                      ? new Date(o.createdAt).toLocaleDateString("vi-VN")
                      : "—"}
                  </span>

                  {/* ACTION */}
                  <div className={styles.actions}>
                    <button
                      className={styles.viewBtn}
                      onClick={() => navigate(`/admin/orders/${o.id}`)}
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      className={`${styles.editBtn} ${
                        isLocked ? styles.disabledBtn : ""
                      }`}
                      onClick={() =>
                        !isLocked && navigate(`/admin/orders/${o.id}/edit`)
                      }
                      disabled={isLocked}
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      className={`${styles.cancelBtn} ${
                        !canCancel ? styles.disabledBtn : ""
                      }`}
                      onClick={() =>
                        canCancel && handleUpdateStatus(o, "CANCELLED")
                      }
                      disabled={!canCancel}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* PAGINATION */}
        <div className={styles.orderPagination}>
          <button disabled={page === 0} onClick={() => setPage(page - 1)}>
            ←
          </button>

          <span>
            Trang {page + 1} / {totalPages}
          </span>

          <button
            disabled={page === totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersAdmin;
