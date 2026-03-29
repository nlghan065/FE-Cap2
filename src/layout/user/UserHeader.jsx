import { useState, useEffect, useRef } from "react";
import { User, LogOut, ShoppingCart, LogIn, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getProfileApi } from "../../api/profileApi";
import styles from "../../styles/LayoutUser.module.css";

function UserHeader() {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  const [token, setToken] = useState(
    localStorage.getItem("token") || sessionStorage.getItem("token"),
  );

  const navigate = useNavigate();
  const dropdownRef = useRef();

  // ✅ LOGOUT CHUẨN
  const handleLogout = () => {
    // clear storage
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("userId");

    // reset state
    setToken(null);
    setProfile(null);
    setOpen(false);

    navigate("/login");
  };

  // 👉 avatar fallback
  const getInitial = (name) => {
    if (!name) return "U";
    return name.trim().split(" ").slice(-1)[0].charAt(0).toUpperCase();
  };

  // ✅ fetch profile (chặn call sau logout)
  useEffect(() => {
    if (!token) {
      setProfile(null);
      return;
    }

    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const data = await getProfileApi();

        if (isMounted) {
          setProfile(data);
        }
      } catch (err) {
        console.log(err);

        // ❗ nếu token sai → auto logout luôn
        handleLogout();
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [token]);

  // ✅ click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <header className={styles.header}>
      {/* LEFT */}
      <div className={styles.left} onClick={() => navigate("/")}>
        <img src="/src/assets/logo.png" className={styles.logo} />
        <div>
          <h2 className={styles.brand}>VirtuSpace</h2>
          <p className={styles.subtitle}>Thiết kế không gian thông minh</p>
        </div>
      </div>

      {/* RIGHT */}
      <div className={styles.right}>
        {/* 👉 chưa login */}
        {!token && (
          <div className={styles.authButtons}>
            <button onClick={() => navigate("/login")}>
              <LogIn size={16} /> Đăng nhập
            </button>
            <button
              className={styles.register}
              onClick={() => navigate("/register")}
            >
              Đăng ký
            </button>
          </div>
        )}

        {/* 👉 đã login */}
        {token && (
          <>
            {/* Cart */}
            <div className={styles.iconBtn} onClick={() => navigate("/cart")}>
              <ShoppingCart size={20} />
              <span className={styles.badge}>3</span>
            </div>

            {/* Profile */}
            <div
              className={styles.iconBtn}
              onClick={() => navigate("/profile")}
            >
              <User size={20} />
            </div>

            {/* Settings */}
            <div
              className={styles.iconBtn}
              onClick={() => navigate("/settings")}
            >
              <Settings size={20} />
            </div>

            {/* User */}
            <div
              className={styles.userBox}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(!open);
              }}
              ref={dropdownRef}
            >
              <div className={styles.avatar}>
                {getInitial(profile?.fullName)}
              </div>

              <div className={styles.userInfo}>
                <span className={styles.welcome}>Chào mừng trở lại</span>
                <span className={styles.username}>
                  {profile?.fullName || "Người dùng"}
                </span>
              </div>
            </div>

            {/* Dropdown */}
            {open && (
              <div
                className={styles.dropdown}
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={() => navigate("/profile")}>
                  <User size={16} /> Hồ sơ
                </button>

                <button onClick={() => navigate("/orders")}>
                  <ShoppingCart size={16} /> Đơn hàng
                </button>

                <button onClick={() => navigate("/settings")}>
                  <Settings size={16} /> Cài đặt
                </button>

                <button className={styles.logout} onClick={handleLogout}>
                  <LogOut size={16} /> Đăng xuất
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
}

export default UserHeader;
