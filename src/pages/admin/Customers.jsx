import { useEffect, useMemo, useState } from "react";
import {
  getCustomersFullApi,
  deleteProfileApi,
} from "../../api/adminCustomerApi";

import styles from "../../styles/Admin.module.css";
import { Eye, Pencil, Trash2, Search } from "lucide-react";
import AdminHeader from "../../layout/admin/AdminHeader";
import AdminMenu from "../../layout/admin/AdminMenu";
import { useNavigate } from "react-router-dom";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

const PAGE_SIZE = 10;

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadCustomers = async () => {
      try {
        const res = await getCustomersFullApi(0, 1000);

        if (isMounted) {
          setCustomers(res.data || []);
        }
      } catch (e) {
        console.error(e);
      }
    };

    loadCustomers();

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    let data = [...customers];
    const normalizedKeyword = keyword.trim().toLowerCase();

    if (normalizedKeyword) {
      data = data.filter(
        (c) =>
          c.name?.toLowerCase().includes(normalizedKeyword) ||
          c.fullName?.toLowerCase().includes(normalizedKeyword) ||
          c.email?.toLowerCase().includes(normalizedKeyword) ||
          c.phone?.toLowerCase().includes(normalizedKeyword),
      );
    }

    return data;
  }, [keyword, customers]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);

  // ===== TOAST AUTO HIDE =====
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  // ===== ACTION =====
  const handleDelete = async (id) => {
    if (!window.confirm("Xóa khách hàng?")) return;

    try {
      await deleteProfileApi(id);
      setMessage({ type: "success", text: "Xóa khách hàng thành công!" });
      setCustomers((prev) => prev.filter((customer) => customer.id !== id));
    } catch (e) {
      console.error(e);
      setMessage({ type: "error", text: "Xóa thất bại!" });
    }
  };

  // ===== UI =====
  const formatMoney = (n) => (n || 0).toLocaleString("vi-VN") + " đ";

  const paginatedCustomers = filtered.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE,
  );

  const renderStatus = (c) =>
    c.status === "CANCELLED" ? (
      <span className={styles.inactive}>Không hoạt động</span>
    ) : (
      <span className={styles.active}>Hoạt động</span>
    );

  return (
    <div className={styles.adminDashboard}>
      <AdminHeader />
      <AdminMenu />

      {/* TOAST */}
      {message && (
        <div
          className={
            message.type === "success" ? styles.toastSuccess : styles.toastError
          }
        >
          {message.text}
        </div>
      )}

      <div className={styles.container}>
        {/* TOP BAR */}
        <div className={styles.topBar}>
          <div className={styles.searchBox}>
            <Search size={16} />
            <input
              placeholder="Tìm kiếm khách hàng..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(0);
              }}
            />
          </div>
        </div>

        {/* TABLE */}
        <div className={`${styles.table} ${styles.customerTable}`}>
          <div className={styles.customerHead}>
            <span>Khách hàng</span>
            <span>Số điện thoại</span>
            <span>Số đơn</span>
            <span>Chi tiêu</span>
            <span>Ngày mua đầu</span>
            <span>Trạng thái</span>
            <span>Thao tác</span>
          </div>

          {paginatedCustomers.map((c) => (
            <div key={c.id} className={styles.customerRow}>
              <div className={styles.customerInfo}>
                <b>{c.name}</b>
                <p>{c.email}</p>
              </div>

              <span>{c.phone || "—"}</span>
              <span>{c.totalOrders || 0}</span>

              <span className={styles.money}>{formatMoney(c.totalSpent)}</span>

              <span className={styles.date}>
                {c.firstOrderDate
                  ? new Date(c.firstOrderDate).toLocaleDateString("vi-VN")
                  : "Chưa có"}
              </span>

              <span>{renderStatus(c)}</span>

              <div className={styles.customerActions}>
                {/* VIEW */}
                <button
                  className={styles.viewBtn}
                  onClick={() => navigate(`/admin/customers/${c.id}`)}
                >
                  <Eye size={14} />
                </button>

                {/* EDIT */}
                <button
                  className={styles.editBtn}
                  onClick={() => navigate(`/admin/customers/${c.id}/edit`)}
                >
                  <Pencil size={14} />
                </button>

                {/* DELETE */}
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(c.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        <div className={styles.pagination}>
          <button
            disabled={currentPage === 0}
            onClick={() => setPage(currentPage - 1)}
          >
            <LeftOutlined />
          </button>

          <span>
            Trang {currentPage + 1} / {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages - 1}
            onClick={() => setPage(currentPage + 1)}
          >
            <RightOutlined />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Customers;
