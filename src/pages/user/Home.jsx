import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  FolderKanban,
  Heart,
  PackageCheck,
  Plus,
  Sparkles,
} from "lucide-react";
import { getProfileApi } from "../../api/profileApi";
import { getOrdersApi } from "../../api/orderApi";
import styles from "../../styles/Home.module.css";

const projectStats = {
  activeProjects: 12,
  favoriteProducts: 48,
};

const recentProjects = [
  {
    id: "vinhome-living-room",
    title: "Căn hộ Vinhome - Phòng khách",
    updatedAt: "Cập nhật 2 giờ trước",
    type: "Không gian 3D",
    status: "Đang chỉnh sửa",
    statusTone: "draft",
    action: "Tiếp tục",
  },
  {
    id: "master-bedroom",
    title: "Phòng ngủ Master - Minimalist",
    updatedAt: "Cập nhật hôm qua",
    type: "Bản Render",
    status: "Đã hoàn thành",
    statusTone: "done",
    action: "Tiếp tục",
  },
];

function Home() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("Tu");
  const [activeOrders, setActiveOrders] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadHomeData = async () => {
      const [profileResult, ordersResult] = await Promise.allSettled([
        getProfileApi(),
        getOrdersApi(0, 20),
      ]);

      if (!isMounted) return;

      if (profileResult.status === "fulfilled") {
        const name = profileResult.value?.fullName?.trim();

        if (name) {
          const nameParts = name.split(/\s+/);
          setFirstName(nameParts[nameParts.length - 1]);
        }
      }

      if (ordersResult.status === "fulfilled") {
        const orders =
          ordersResult.value?.data?.content || ordersResult.value?.content || [];

        const inProgressOrders = orders.filter((order) =>
          ["PENDING", "CONFIRMED", "SHIPPING"].includes(order.status),
        );

        setActiveOrders(inProgressOrders.length);
      }
    };

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = [
    {
      label: "Dự án đang thực hiện",
      value: String(projectStats.activeProjects).padStart(2, "0"),
      icon: FolderKanban,
      tone: "blue",
    },
    {
      label: "Đơn hàng đang giao",
      value: String(activeOrders).padStart(2, "0"),
      icon: PackageCheck,
      tone: "orange",
    },
    {
      label: "Sản phẩm yêu thích",
      value: String(projectStats.favoriteProducts).padStart(2, "0"),
      icon: Heart,
      tone: "violet",
    },
  ];

  const handleCreateProject = () => {
    navigate("/ai-designer");
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.kicker}>Trang chủ người dùng</p>
          <h1>Chào {firstName}, hôm nay bạn muốn làm gì?</h1>
          <p className={styles.subtitle}>
            Tiếp tục công việc hoặc tạo một không gian hoàn toàn mới.
          </p>
        </div>

        <button className={styles.primaryButton} onClick={handleCreateProject}>
          <Plus size={18} />
          Tạo dự án mới
        </button>
      </section>

      <section className={styles.statsGrid}>
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <article key={item.label} className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles[item.tone]}`}>
                <Icon size={18} />
              </div>

              <div>
                <strong className={styles.statValue}>{item.value}</strong>
                <p className={styles.statLabel}>{item.label}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Dự án gần đây</h2>
            <p>Tiếp tục từ nơi bạn đã dừng hoặc bắt đầu một ý tưởng mới.</p>
          </div>

          <button className={styles.linkButton} onClick={handleCreateProject}>
            Xem tất cả
            <ArrowRight size={16} />
          </button>
        </div>

        <div className={styles.projectGrid}>
          {recentProjects.map((project, index) => (
            <article key={project.id} className={styles.projectCard}>
              <div className={styles.projectVisual}>
                <span
                  className={`${styles.projectStatus} ${styles[project.statusTone]}`}
                >
                  {project.status}
                </span>

                <div className={styles.previewLayer}>
                  <div
                    className={`${styles.previewShape} ${
                      index === 0 ? styles.previewWide : styles.previewTall
                    }`}
                  />
                  <div className={styles.previewShapeSmall} />
                </div>
              </div>

              <div className={styles.projectBody}>
                <div>
                  <h3>{project.title}</h3>
                  <p>
                    {project.updatedAt} • {project.type}
                  </p>
                </div>

                <button
                  className={styles.projectAction}
                  onClick={handleCreateProject}
                >
                  {project.action}
                </button>
              </div>
            </article>
          ))}

          <button className={styles.createCard} onClick={handleCreateProject}>
            <div className={styles.createIcon}>
              <Plus size={22} />
            </div>
            <strong>Bắt đầu dự án mới</strong>
            <span>Upload ảnh phòng hoặc chọn kích thước 3D</span>
            <div className={styles.createHint}>
              <Sparkles size={16} />
              Khởi tạo với AI Designer
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}

export default Home;
