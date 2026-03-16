import { useState, useEffect } from "react";
import { User, Settings, LogOut } from "lucide-react";
import styles from "../../styles/Admin.module.css";
import { useNavigate } from "react-router-dom";
import { getUserByIdApi } from "../../api/authApi";

function AdminHeader() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");

    navigate("/login");
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = localStorage.getItem("userId");

        if (!userId) return;

        const data = await getUserByIdApi(userId);

        setUser(data);
      } catch (err) {
        console.log("Load user error:", err);
      }
    };

    fetchUser();
  }, []);

  return (
    <header className={styles.adminHeader}>
      <div className={styles.headerLeft}>
        <img src="/src/assets/logo.png" className={styles.logo} />

        <div className={styles.titleBox}>
          <h1>VirtuSpace</h1>
          <p>Hệ thống quản trị nội thất AI</p>
        </div>
      </div>

      <div className={styles.headerRight}>
        <div className={styles.adminBox} onClick={() => setOpen(!open)}>
          <div className={styles.welcomeBox}>
            <span className={styles.welcomeText}>Chào mừng trở lại</span>
            <p>{user?.name || "Admin"}</p>
          </div>

          <div className={styles.avatar}>
            {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
          </div>

          {open && (
            <div className={styles.dropdown}>
              <button>
                <User size={18} />
                Hồ sơ
              </button>

              <button>
                <Settings size={18} />
                Cài đặt
              </button>

              <button className={styles.logout} onClick={handleLogout}>
                <LogOut size={18} />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
