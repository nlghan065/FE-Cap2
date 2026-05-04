import { NavLink } from "react-router-dom";
import { Home, Store, Sparkles, Box, ShoppingCart, Heart } from "lucide-react";
import styles from "../../styles/LayoutUser.module.css";

function UserMenu() {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const homePath = token ? "/home" : "/";

  const menu = [
    {
      label: "Trang chủ",
<<<<<<< HEAD
      path: homePath,
=======
      path: "/",
>>>>>>> 1e9902e2d63983cd0b2ec34f0030bb33f770d53d
      icon: <Home size={18} />,
    },
    {
      label: "Cửa hàng",
      path: "/products", // 👉 nếu chưa có thì để "/home" cũng được
      icon: <Store size={18} />,
    },
    {
      label: "AI Designer",
      path: "/ai-designer",
      icon: <Sparkles size={18} />,
    },
    {
      label: "3D Viewer",
      path: "/viewer",
      icon: <Box size={18} />,
    },
  ];

  // 👉 thêm khi login
  if (token) {
    menu.push({
      label: "Yêu thích",
      path: "/wishlist",
      icon: <Heart size={18} />,
    });

    menu.push({
      label: "Đơn hàng",
      path: "/orders",
      icon: <ShoppingCart size={18} />,
    });
  }

  return (
    <div className={styles.menuWrapper}>
      {menu.map((item, index) => (
        <NavLink
          key={index}
          to={item.path}
          end={item.path === "/" || item.path === "/home"}
          className={({ isActive }) =>
            isActive ? `${styles.menuItem} ${styles.active}` : styles.menuItem
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
