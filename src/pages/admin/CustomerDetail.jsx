import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminHeader from "../../layout/admin/AdminHeader";
import AdminMenu from "../../layout/admin/AdminMenu";
import {
  getProfileByIdApi,
  getOrdersApi,
  getUserByIdApi,
} from "../../api/adminCustomerApi";
import styles from "../../styles/Admin.module.css";
import { Pencil } from "lucide-react";

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);

      console.log("ID:", id);

      // 1. PROFILE
      const profile = await getProfileByIdApi(id);
      console.log("PROFILE:", profile);

      // 2. USER (để lấy DOB nếu thiếu)
      let user = null;
      if (profile.userId) {
        user = await getUserByIdApi(profile.userId);
        console.log("USER:", user);
      }

      // 👉 fix DOB tại đây
      const dateOfBirth = profile.dateOfBirth || user?.dateOfBirth || null;

      console.log("FINAL DOB:", dateOfBirth);

      // 3. ORDERS
      const orders = await getOrdersApi();

      const userOrders = orders.filter((o) => {
        const orderEmail = o.customerEmail || o.email || o.userEmail;

        return (
          orderEmail?.trim().toLowerCase() ===
          profile.email?.trim().toLowerCase()
        );
      });

      // 4. TÍNH TOÁN
      const totalOrders = userOrders.length;

      const totalSpent = userOrders.reduce(
        (sum, o) => sum + (o.totalAmount || 0),
        0,
      );

      const firstOrderDate = userOrders.length
        ? userOrders.reduce(
            (min, o) =>
              new Date(o.createdAt) < new Date(min) ? o.createdAt : min,
            userOrders[0].createdAt,
          )
        : null;

      // 5. MERGE
      setCustomer({
        ...profile,
        dateOfBirth, // 🔥 đã fix
        totalOrders,
        totalSpent,
        firstOrderDate,
      });
    } catch (err) {
      console.error("Lỗi khi fetch customer:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Chưa cập nhật";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const formatMoney = (n) => (n || 0).toLocaleString("vi-VN") + " đ";

  if (loading) return <div>Loading...</div>;
  if (!customer) return <div>Không tìm thấy khách hàng</div>;

  return (
    <div className={styles.adminDashboard}>
      <AdminHeader />
      <AdminMenu />

      <div className={styles.profileWrapper}>
        <div className={styles.layoutGrid}>
          {/* LEFT PANEL */}
          <div className={styles.leftPanel}>
            {/* HEADER */}
            <div className={styles.profileTop}>
              <div className={styles.avatarBox}>
                {customer.fullName?.charAt(0).toUpperCase()}
              </div>

              <div className={styles.profileInfo}>
                <h2>{customer.fullName}</h2>
                <p>{customer.email}</p>
              </div>

              <div className={styles.editAction}>
                <button
                  className={styles.editIconBtn}
                  title="Chỉnh sửa"
                  onClick={() => navigate(`/admin/customers/${id}/edit`)}
                >
                  <Pencil size={18} />
                </button>
              </div>
            </div>

            {/* PERSONAL INFO */}
            <div className={styles.section}>
              <h3>Thông tin cá nhân</h3>

              <div className={styles.infoGrid}>
                <div>
                  <label>Số điện thoại</label>
                  <p>{customer.phone || "—"}</p>
                </div>

                <div>
                  <label>Giới tính</label>
                  <p>{customer.gender || "Chưa cập nhật"}</p>{" "}
                </div>

                <div>
                  <label>Ngày sinh</label>
                  <p>
                    {customer.dateOfBirth
                      ? formatDate(customer.dateOfBirth)
                      : "Chưa cập nhật"}
                  </p>{" "}
                </div>

                <div>
                  <label>Thành phố</label>
                  <p>{customer.city}</p>
                </div>

                <div>
                  <label>Phường</label>
                  <p>{customer.ward}</p>
                </div>

                <div className={styles.full}>
                  <label>Địa chỉ</label>
                  <p>{customer.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className={styles.rightPanel}>
            <div className={styles.section}>
              <h3>Thống kê đơn hàng</h3>

              <div className={styles.statsColumn}>
                <div className={styles.statCard}>
                  <span>Tổng đơn</span>
                  <h3>{customer.totalOrders || 0}</h3>
                </div>

                <div className={styles.statCard}>
                  <span>Tổng chi tiêu</span>
                  <h3>{formatMoney(customer.totalSpent)}</h3>
                </div>

                <div className={styles.statCard}>
                  <span>Đơn đầu tiên</span>
                  <h3>{formatDate(customer.firstOrderDate)}</h3>
                </div>
              </div>
            </div>

            <button
              className={styles.backBtn}
              onClick={() => navigate("/admin/customers")}
            >
              ← Quay lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
