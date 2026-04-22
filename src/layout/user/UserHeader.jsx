import { useState, useEffect, useRef } from "react";
import {
  User,
  LogOut,
  ShoppingCart,
  Heart,
  LogIn,
  Settings,
  Search,
  ArrowLeft,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { getProfileApi } from "../../api/profileApi";
import { getCartApi } from "../../api/cartApi";
import { getUserByIdApi } from "../../api/authApi";
import { getWishlistApi, normalizeWishlistItems } from "../../api/wishlistApi";
import styles from "../../styles/LayoutUser.module.css";

function UserHeader() {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  const [token, setToken] = useState(
    localStorage.getItem("token") || sessionStorage.getItem("token"),
  );

  const [keyword, setKeyword] = useState("");

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef();
  const role = localStorage.getItem("role") || sessionStorage.getItem("role");
  const isAdminPreview = role === "ADMIN";

  /* ================= SEARCH ================= */
  const handleSearch = () => {
    const value = keyword.trim();

    if (!value) {
      navigate("/products");
      return;
    }

    navigate(`/products?keyword=${encodeURIComponent(value)}`);
  };

  // ✅ chỉ chạy khi đang ở products
  useEffect(() => {
    const timeout = setTimeout(() => {
      // ✅ chỉ chạy ở trang list
      if (location.pathname !== "/products") return;

      if (!keyword.trim()) {
        navigate("/products");
        return;
      }

      navigate(`/products?keyword=${encodeURIComponent(keyword)}`);
    }, 500);

    return () => clearTimeout(timeout);
  }, [keyword, location.pathname]);
  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();

    setToken(null);
    setProfile(null);
    setCartCount(0);
    setWishlistCount(0);

    navigate("/login");
  };

  const handleBackToAdmin = () => {
    navigate("/dashboard");
  };

  /* ================= AVATAR ================= */
  const getInitial = (name) => {
    if (!name) return "U";
    return name.trim().split(" ").slice(-1)[0].charAt(0).toUpperCase();
  };

  const loadAdminProfile = async () => {
    const userId =
      localStorage.getItem("userId") || sessionStorage.getItem("userId");

    if (!userId) {
      return { fullName: "Admin preview" };
    }

    try {
      const data = await getUserByIdApi(userId);

      return {
        fullName: "Admin preview",
        email: data?.email || "",
      };
    } catch (err) {
      console.error("Admin fallback profile error:", err);
      return { fullName: "Admin preview" };
    }
  };

  /* ================= FETCH PROFILE ================= */
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
          setProfile(
            isAdminPreview ? { ...data, fullName: "Admin preview" } : data,
          );
        }
      } catch (err) {
        if (isAdminPreview) {
          const adminProfile = await loadAdminProfile();

          if (isMounted) {
            setProfile(adminProfile);
          }
          return;
        }

        handleLogout();
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [token, isAdminPreview]);

  /* ================= FETCH CART ================= */
  const fetchCart = async () => {
    try {
      const cart = await getCartApi();
      setCartCount(cart?.items?.length || 0);
    } catch (err) {
      console.error("Cart error:", err);
      setCartCount(0);
    }
  };

  const fetchWishlist = async () => {
    const currentToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!currentToken) {
      setWishlistCount(0);
      return;
    }

    try {
      const data = await getWishlistApi();
      setWishlistCount(normalizeWishlistItems(data).length);
    } catch (err) {
      console.error("Wishlist error:", err);
      setWishlistCount(0);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCart();
      fetchWishlist();
    }
  }, [token, isAdminPreview]);

  // ✅ sync toàn app
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCart();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  useEffect(() => {
    const handleWishlistUpdate = () => {
      fetchWishlist();
    };

    window.addEventListener("wishlistUpdated", handleWishlistUpdate);

    return () => {
      window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
    };
  }, []);

  /* ================= CLICK OUTSIDE ================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  /* ================= UI ================= */
  return (
    <header className={styles.header}>
      {/* LEFT */}
      <div className={styles.left} onClick={() => navigate("/home")}>
        <img src="/src/assets/logo.png" className={styles.logo} />
        <div>
          <h2 className={styles.brand}>VirtuSpace</h2>
          <p className={styles.subtitle}>Thiết kế không gian thông minh</p>
        </div>
      </div>

      {/* SEARCH */}
      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Tìm sofa, bàn, ghế..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />

        <button onClick={handleSearch}>
          <Search size={18} />
        </button>
      </div>

      {/* RIGHT */}
      <div className={styles.right}>
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

        {token && (
          <>
            {isAdminPreview && (
              <button
                className={styles.previewBackBtn}
                onClick={handleBackToAdmin}
              >
                <ArrowLeft size={16} />
                Quay lại admin
              </button>
            )}

            {/* WISHLIST */}
            <div
              className={styles.iconBtn}
              onClick={() => navigate("/wishlist")}
              title="Yêu thích"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className={styles.badge}>{wishlistCount}</span>
              )}
            </div>

            {/* CART */}
            <div className={styles.iconBtn} onClick={() => navigate("/cart")}>
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className={styles.badge}>{cartCount}</span>
              )}
            </div>

            {/* PROFILE */}
            <div
              className={styles.iconBtn}
              onClick={() => navigate("/profile")}
            >
              <User size={20} />
            </div>

            {/* SETTINGS */}
            <div
              className={styles.iconBtn}
              onClick={() => navigate("/settings")}
            >
              <Settings size={20} />
            </div>

            {/* USER */}
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

            {/* DROPDOWN */}
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

                <button onClick={() => navigate("/wishlist")}>
                  <Heart size={16} /> Yêu thích
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
