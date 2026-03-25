import UserHeader from "./UserHeader";
import UserMenu from "./UserMenu";
import styles from "../../styles/LayoutUser.module.css";
import { Outlet } from "react-router-dom";

function UserLayout() {
  return (
    <div className={styles.layout}>
      <UserHeader />
      <UserMenu />

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}

export default UserLayout;
