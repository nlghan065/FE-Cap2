import { useEffect, useState } from "react";
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
  const [filtered, setFiltered] = useState([]);
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("ALL");

  // ===== FETCH =====
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getCustomersFullApi(0, 1000);
      setCustomers(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  // ===== FILTER =====
  useEffect(() => {
    handleFilter();
  }, [keyword, status, customers]);

  useEffect(() => {
    setPage(0);
  }, [keyword, status]);

  const handleFilter = () => {
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

    if (status !== "ALL") {
      data = data.filter((c) => c.status === status);
    }

    setFiltered(data);
    setTotalPages(Math.max(1, Math.ceil(data.length / PAGE_SIZE)));
  };

  // ===== TOAST AUTO HIDE =====
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    const lastPage = Math.max(0, totalPages - 1);

    if (page > lastPage) {
      setPage(lastPage);
    }
  }, [page, totalPages]);

  // ===== ACTION =====
  const handleDelete = async (id) => {
    if (!window.confirm("Xóa khách hàng?")) return;

    try {
      await deleteProfileApi(id);
      setMessage({ type: "success", text: "Xóa khách hàng thành công!" });
      fetchData();
    } catch (e) {
      console.error(e);
      setMessage({ type: "error", text: "Xóa thất bại!" });
    }
  };

  // ===== UI =====
  const formatMoney = (n) => (n || 0).toLocaleString("vi-VN") + " đ";

  const paginatedCustomers = filtered.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE,
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
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </div>

        {/* TABLE */}
        <div className={styles.table}>
          <div className={styles.thead}>
            <span>Khách hàng</span>
            <span>Số điện thoại</span>
            <span>Số đơn</span>
            <span>Chi tiêu</span>
            <span>Ngày mua đầu</span>
            <span>Trạng thái</span>
            <span>Thao tác</span>
          </div>

          {paginatedCustomers.map((c) => (
            <div key={c.id} className={styles.row}>
              <div>
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

              <div className={styles.actions}>
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
          <button disabled={page === 0} onClick={() => setPage(page - 1)}>
            <LeftOutlined />
          </button>

          <span>
            Trang {page + 1} / {totalPages}
          </span>

          <button
            disabled={page === totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            <RightOutlined />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Customers;
