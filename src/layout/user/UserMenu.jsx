import { NavLink, useLocation } from "react-router-dom";
import { Home, Store, Sparkles, Box, ShoppingCart, Heart } from "lucide-react";
import styles from "../../styles/LayoutUser.module.css";

function UserMenu() {
  const location = useLocation();
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const homePath = token ? "/home" : "/";

  const menu = [
    {
      key: "home",
      label: "Trang chủ",
      path: homePath,
      icon: <Home size={18} />,
    },
    {
      key: "products",
      label: "Cửa hàng",
      path: "/products",
      icon: <Store size={18} />,
    },
    {
      key: "ai",
      label: "AI Designer",
      path: token ? "/ai-designer" : "/ai-demo",
      icon: <Sparkles size={18} />,
    },
    {
      key: "viewer",
      label: "3D Viewer",
      path: token ? "/viewer" : "/viewer-demo",
      icon: <Box size={18} />,
    },
  ];

  // Thêm mục khi đã đăng nhập
  if (token) {
    menu.push({
      key: "wishlist",
      label: "Yêu thích",
      path: "/wishlist",
      icon: <Heart size={18} />,
    });

    menu.push({
      key: "orders",
      label: "Đơn hàng",
      path: "/orders",
      icon: <ShoppingCart size={18} />,
    });
  }

  const isMenuItemActive = (item) => {
    if (item.key === "home") {
      return location.pathname === homePath;
    }

    if (item.path === "/products") {
      return (
        location.pathname === "/products" ||
        location.pathname.startsWith("/products/")
      );
    }

    if (item.path === "/orders") {
      return (
        location.pathname === "/orders" ||
        location.pathname.startsWith("/orders/")
      );
    }

    return location.pathname === item.path;
  };

  return (
    <div className={styles.menuWrapper}>
      {menu.map((item) => (
        <NavLink
          key={item.key}
          to={item.path}
          end={item.path === "/" || item.path === "/home"}
          className={
            isMenuItemActive(item)
              ? `${styles.menuItem} ${styles.active}`
              : styles.menuItem
          }
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}

export default UserMenu;
