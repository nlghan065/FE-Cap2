import styles from "../../styles/Admin.module.css";
import { NavLink } from "react-router-dom";

import { LayoutDashboard, ShoppingCart, Package, Users } from "lucide-react";

function AdminMenu() {
  const menu = [
    {
      id: "overview",
      label: "Tổng quan",
      icon: <LayoutDashboard size={18} />,
      path: "/dashboard",
    },
    {
      id: "orders",
      label: "Đơn hàng",
      icon: <ShoppingCart size={18} />,
      path: "/admin/orders",
    },
    {
      id: "products",
      label: "Sản phẩm",
      icon: <Package size={18} />,
      path: "/admin/products",
    },
    {
      id: "customers",
      label: "Khách hàng",
      icon: <Users size={18} />,
      path: "/admin/customers",
    },
  ];

  return (
    <div className={styles.adminMenu}>
      {menu.map((item) => (
        <NavLink
          key={item.id}
          to={item.path}
          className={({ isActive }) => (isActive ? styles.active : "")}
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}

export default AdminMenu;
