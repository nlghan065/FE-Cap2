import { useState } from "react";
import styles from "../../styles/Admin.module.css";

import { LayoutDashboard, ShoppingCart, Package, Users } from "lucide-react";

function AdminMenu() {
  const [active, setActive] = useState("overview");

  const menu = [
    {
      id: "overview",
      label: "Tổng quan",
      icon: <LayoutDashboard size={18} />,
    },
    {
      id: "orders",
      label: "Đơn hàng",
      icon: <ShoppingCart size={18} />,
    },
    {
      id: "products",
      label: "Sản phẩm",
      icon: <Package size={18} />,
    },
    {
      id: "customers",
      label: "Khách hàng",
      icon: <Users size={18} />,
    },
  ];

  return (
    <div className={styles.adminMenu}>
      {menu.map((item) => (
        <button
          key={item.id}
          className={active === item.id ? styles.active : ""}
          onClick={() => setActive(item.id)}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default AdminMenu;
