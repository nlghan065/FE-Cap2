import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/Admin.module.css";

import AdminHeader from "../../layout/admin/AdminHeader";
import AdminMenu from "../../layout/admin/AdminMenu";
import { Eye, Pencil, Trash2, Search } from "lucide-react";

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

      setOrders(res.content);
      setTotalPages(res.totalPages);
    } catch (e) {
      console.error("Fetch orders error:", e);
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
    if (order.status === "DELIVERED" || order.status === "CANCELLED") {
      alert("Đơn này không thể cập nhật!");
      return;
    }

    if (!window.confirm("Cập nhật trạng thái đơn hàng?")) return;

    try {
      await updateOrderStatusApi(order.id, newStatus);
      fetchOrders();
    } catch (e) {
      console.error(e);
      alert("Cập nhật thất bại!");
    }
  };

  return (
    <div className={styles.adminDashboard}>
      <AdminHeader />
      <AdminMenu />

      <div className={styles.orderContainer}>
        {/* ===== TOP BAR ===== */}
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

        {/* ===== TABLE ===== */}
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
            orders.map((o) => (
              <div key={o.id} className={styles.orderRow}>
                {/* MÃ ĐƠN */}
                <span className={styles.orderCode}>{o.orderCode}</span>

                {/* KHÁCH */}
                <span>
                  <b>{o.customerName}</b>
                  <br />
                  <small>{o.customerEmail}</small>
                </span>

                {/* SẢN PHẨM */}
                <span>{o.totalItems || 0} sản phẩm</span>

                {/* TIỀN */}
                <span className={styles.orderMoney}>
                  {formatMoney(o.totalAmount)}
                </span>
                {/* PAYMENT */}
                <span>
                  {o.paymentMethodDisplay}
                  <br />
                  <small>{o.paymentStatusDisplay}</small>
                </span>

                {/* STATUS (🔥 dropdown màu) */}
                <select
                  className={`${styles.orderStatusSelect} ${
                    styles[`order_${o.status.toLowerCase()}`]
                  }`}
                  value={o.status}
                  onChange={(e) => handleUpdateStatus(o, e.target.value)}
                  disabled={
                    o.status === "DELIVERED" || o.status === "CANCELLED"
                  }
                >
                  <option value="PENDING">Đang xử lý</option>
                  <option value="CONFIRMED">Đã xác nhận</option>
                  <option value="SHIPPING">Đang giao</option>
                  <option value="DELIVERED">Đã giao</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>

                {/* DATE */}
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
                    className={styles.editBtn}
                    onClick={() => navigate(`/admin/orders/${o.id}/edit`)}
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    className={styles.deleteBtn}
                    onClick={() => alert("TODO: delete")}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ===== PAGINATION ===== */}
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
