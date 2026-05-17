import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Html,
  OrbitControls,
  PerspectiveCamera,
  RoundedBox,
} from "@react-three/drei";
import {
  ArrowLeft,
  ChevronRight,
  Home,
  LampFloor,
  Lock,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { PCFShadowMap } from "three";
import styles from "../../styles/Viewer3D.module.css";

const ROOM_PRESETS = {
  living: {
    id: "living",
    label: "Phòng khách",
    roomType: "Living Room",
    reasoning:
      "Layout mẫu ưu tiên trục nhìn từ sofa tới bàn trà và kệ TV, đúng tinh thần viewer thật.",
    items: [
      {
        id: "living-sofa",
        name: "Sofa góc chữ L",
        category: "Sofa",
        color: "#c2855b",
        image:
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
        size: [2.25, 0.78, 0.94],
        position: [-1.1, 0.39, 1.15],
        rotation: [0, Math.PI / 7, 0],
        price: 18900000,
        note: "AI đặt ở góc sâu để mở trục nhìn vào trung tâm phòng.",
      },
      {
        id: "living-table",
        name: "Bàn trà gỗ sáng",
        category: "Bàn nước",
        color: "#ba8d60",
        image:
          "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=900&q=80",
        size: [1.02, 0.28, 0.6],
        position: [0.05, 0.14, 0.7],
        rotation: [0, 0.08, 0],
        price: 4290000,
        note: "Giữ khoảng cách di chuyển đều giữa sofa, rug và kệ TV.",
      },
      {
        id: "living-rug",
        name: "Thảm trung tâm",
        category: "Thảm",
        color: "#d7ccb9",
        image:
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
        size: [2.8, 0.03, 2.1],
        position: [0.05, 0.02, 0.6],
        rotation: [0, 0, 0],
        price: 2190000,
        note: "Neo khu vực tiếp khách để camera nhìn vào có điểm nhấn rõ.",
      },
      {
        id: "living-lamp",
        name: "Đèn đứng Bắc Âu",
        category: "Đèn trang trí",
        color: "#3d4349",
        image:
          "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80",
        size: [0.22, 1.5, 0.22],
        position: [1.5, 0.75, 1.25],
        rotation: [0, 0, 0],
        price: 2890000,
        note: "Điểm sáng phụ cho không khí buổi tối và tăng chiều cao thị giác.",
      },
      {
        id: "living-tv",
        name: "Kệ TV tối giản",
        category: "Tủ tivi",
        color: "#8e6844",
        image:
          "https://images.unsplash.com/photo-1519947486511-46149fa0a254?auto=format&fit=crop&w=900&q=80",
        size: [1.8, 0.55, 0.42],
        position: [0.15, 0.28, -1.95],
        rotation: [0, 0, 0],
        price: 6490000,
        note: "Canh giữa trục nhìn chính khi người dùng xoay camera.",
      },
    ],
  },
  bedroom: {
    id: "bedroom",
    label: "Phòng ngủ",
    roomType: "Bedroom",
    reasoning:
      "Layout mẫu ưu tiên trục giường, tab đầu giường và tủ đứng để giống logic Viewer 3D thật.",
    items: [
      {
        id: "bed-bed",
        name: "Giường bọc nệm",
        category: "Giường",
        color: "#c8b6a1",
        image:
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
        size: [2.05, 0.7, 2.3],
        position: [0, 0.35, 0.9],
        rotation: [0, Math.PI, 0],
        price: 21400000,
        note: "AI đẩy giường vào trục trung tâm để giữ hai lối đi hai bên.",
      },
      {
        id: "bed-nightstand",
        name: "Tab đầu giường",
        category: "Bàn đầu giường",
        color: "#a97855",
        image:
          "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=900&q=80",
        size: [0.5, 0.48, 0.42],
        position: [1.45, 0.24, 1.15],
        rotation: [0, 0.02, 0],
        price: 2590000,
        note: "Nằm đúng tầm với và làm bệ cho đèn bàn.",
      },
      {
        id: "bed-lamp",
        name: "Đèn ngủ",
        category: "Đèn trang trí",
        color: "#4d5860",
        image:
          "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80",
        size: [0.18, 0.62, 0.18],
        position: [1.45, 0.78, 1.15],
        rotation: [0, 0, 0],
        price: 1490000,
        note: "Đèn nhỏ để người xem hiểu viewer không chỉ có khối lớn.",
      },
      {
        id: "bed-wardrobe",
        name: "Tủ áo đứng",
        category: "Tủ áo",
        color: "#8e6844",
        image:
          "https://images.unsplash.com/photo-1519947486511-46149fa0a254?auto=format&fit=crop&w=900&q=80",
        size: [1.2, 1.95, 0.56],
        position: [-1.75, 0.98, -1.5],
        rotation: [0, Math.PI / 2, 0],
        price: 8290000,
        note: "Tạo khối đứng ở cạnh phòng để cân bằng với giường nằm ngang.",
      },
      {
        id: "bed-rug",
        name: "Thảm cuối giường",
        category: "Thảm",
        color: "#d7cfbf",
        image:
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
        size: [1.6, 0.03, 1.15],
        position: [0, 0.02, -0.75],
        rotation: [0, 0, 0],
        price: 1890000,
        note: "Giữ nhịp bố cục và tạo chiều sâu khi zoom gần.",
      },
    ],
  },
};

const PAGE_STYLE = {
  "--viewer-available-height": "calc(100vh - 170px)",
};

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(price) || 0);
}

function formatDimensions(size) {
  return `${size[0].toFixed(2)} x ${size[2].toFixed(2)} x ${size[1].toFixed(2)} cm`;
}

function RoomObject({ item, onSelect, selected }) {
  return (
    <group
      position={item.position}
      rotation={item.rotation}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(item.id);
      }}
    >
      <RoundedBox
        args={item.size}
        radius={0.05}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={selected ? "#d97706" : item.color}
          roughness={0.6}
          metalness={0.08}
        />
      </RoundedBox>

      {selected && (
        <Html center position={[0, item.size[1] / 2 + 0.3, 0]}>
          <div className={`${styles.sceneLabel} ${styles.sceneLabelActive}`}>
            <span>{item.category}</span>
            <strong>{item.name}</strong>
          </div>
        </Html>
      )}
    </group>
  );
}

function DemoScene({ lightsOn, room, selectedId, onSelect }) {
  const wallColor = lightsOn ? "#f6f1e8" : "#ddd7cf";
  const floorColor = lightsOn ? "#d7bc98" : "#aa8e6d";

  return (
    <>
      <PerspectiveCamera makeDefault position={[5.2, 4.1, 6.1]} />
      <OrbitControls enablePan={false} maxDistance={10} minDistance={4.4} />

      <ambientLight intensity={lightsOn ? 1.05 : 0.35} />
      <directionalLight
        castShadow
        intensity={lightsOn ? 1.35 : 0.35}
        position={[4, 6, 4]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {lightsOn && <pointLight intensity={1.4} position={[1.7, 2.2, 1.2]} />}

      <mesh
        position={[0, -0.02, 0]}
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color={floorColor} />
      </mesh>

      <mesh position={[0, 1.9, -2.45]} receiveShadow>
        <boxGeometry args={[8, 3.8, 0.12]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      <mesh
        position={[-2.45, 1.9, 0]}
        receiveShadow
        rotation={[0, Math.PI / 2, 0]}
      >
        <boxGeometry args={[8, 3.8, 0.12]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      {room.items.map((item) => (
        <RoomObject
          key={item.id}
          item={item}
          onSelect={onSelect}
          selected={selectedId === item.id}
        />
      ))}
    </>
  );
}

function ViewerDemo() {
  const location = useLocation();
  const navigate = useNavigate();
  const demoResult = location.state?.demoResult || null;
  const initialRoomKey =
    demoResult?.roomType === "Bedroom" ? "bedroom" : "living";

  const [roomKey, setRoomKey] = useState(initialRoomKey);
  const [lightsOn, setLightsOn] = useState(true);
  const [selectedId, setSelectedId] = useState(
    ROOM_PRESETS[initialRoomKey].items[0].id,
  );

  const room = ROOM_PRESETS[roomKey];
  const selectedItem =
    room.items.find((item) => item.id === selectedId) || room.items[0];
  const totalPrice = room.items.reduce(
    (sum, item) => sum + (Number(item.price) || 0),
    0,
  );

  const handleRoomChange = (nextRoomKey) => {
    setRoomKey(nextRoomKey);
    setSelectedId(ROOM_PRESETS[nextRoomKey].items[0].id);
  };

  const handleLockedAction = (label) => {
    toast.error(`Vui lòng đăng nhập để ${label}.`);
  };

  return (
    <div className={styles.page} style={PAGE_STYLE}>
      <header className={styles.toolbar}>
        <div className={styles.toolbarMain}>
          <button
            className={styles.iconButton}
            onClick={() => navigate("/ai-demo")}
            title="Quay lại AI Demo"
            type="button"
          >
            <ArrowLeft size={19} />
          </button>
          <div>
            <span className={styles.kicker}>
              <Sparkles size={14} />
              AI 3D Viewer Demo
            </span>
            <h1>Không gian 3D</h1>
          </div>
        </div>

        <div className={styles.toolbarActions}>
          <button
            className={styles.iconButton}
            onClick={() => setSelectedId(room.items[0].id)}
            title="Reset món đang chọn"
            type="button"
          >
            <RotateCcw size={18} />
          </button>
          <button
            className={styles.iconButton}
            onClick={() => setLightsOn((current) => !current)}
            title="Bật tắt đèn"
            type="button"
          >
            <LampFloor size={18} />
          </button>
          <button
            className={styles.iconButton}
            onClick={() =>
              handleRoomChange(roomKey === "living" ? "bedroom" : "living")
            }
            title="Đổi phòng mẫu"
            type="button"
          >
            <Home size={18} />
          </button>
          <button
            className={styles.cartButton}
            onClick={() => handleLockedAction("xuất 3D")}
            type="button"
          >
            <Lock size={18} />
            <span>Xuất 3D</span>
          </button>
        </div>
      </header>

      <main className={styles.viewerShell}>
        <section className={styles.canvasPanel}>
          <Canvas
            shadows={{ type: PCFShadowMap }}
            dpr={[1, 1.5]}
            onPointerMissed={() => setSelectedId("")}
          >
            <DemoScene
              lightsOn={lightsOn}
              onSelect={setSelectedId}
              room={room}
              selectedId={selectedId}
            />
          </Canvas>

          <div className={styles.sceneStats}>
            <div>
              <Home size={17} />
              <span>{room.label}</span>
            </div>
            <div className={styles.sceneStatsMeta}>
              <span className={styles.sceneStatsLabel}>AI layout</span>
              <strong>
                {room.items.length}/{room.items.length} vị trí AI
              </strong>
              <small className={styles.sceneStatsHint}>
                Click object để xem chi tiết
              </small>
              <small className={styles.sceneStatsHint}>
                {lightsOn ? "Đèn đang bật" : "Đèn đang tắt"}
              </small>
            </div>
          </div>
        </section>

        <aside className={styles.sidePanel}>
          <section className={styles.summaryBlock}>
            <span>Tổng giá trị</span>
            <strong>{formatPrice(demoResult?.totalPrice || totalPrice)}</strong>
            <p>
              {demoResult?.style
                ? `Demo này đang nối từ AI Designer với style ${demoResult.style}.`
                : room.reasoning}
            </p>
          </section>

          <section className={styles.detailBlock}>
            {selectedItem?.image && (
              <img src={selectedItem.image} alt={selectedItem.name} />
            )}
            <div className={styles.detailMeta}>
              <span>{selectedItem?.category}</span>
              <strong className={styles.aiPlacementChip}>AI placed</strong>
            </div>
            <h2>{selectedItem?.name}</h2>
            <strong>{formatPrice(selectedItem?.price)}</strong>
            <p>{selectedItem?.note}</p>
            <dl>
              <div>
                <dt>Kích thước</dt>
                <dd>{formatDimensions(selectedItem?.size || [0, 0, 0])}</dd>
              </div>
            </dl>
            <div className={styles.detailActions}>
              <button
                type="button"
                onClick={() =>
                  navigate("/ai-demo", {
                    state: {
                      demoResult,
                    },
                  })
                }
              >
                Xem lại AI Demo
                <ChevronRight size={16} />
              </button>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={() => handleLockedAction("lưu bố cục 3D")}
              >
                <Lock size={16} />
                Lưu bố cục
              </button>
            </div>
          </section>

          <section className={styles.productList}>
            <h3>Phòng mẫu</h3>
            {Object.values(ROOM_PRESETS).map((preset) => (
              <button
                key={preset.id}
                className={preset.id === roomKey ? styles.activeItem : ""}
                onClick={() => handleRoomChange(preset.id)}
                type="button"
              >
                <span>{preset.label}</span>
                <strong>Demo</strong>
              </button>
            ))}
          </section>

          <section className={styles.productList}>
            <h3>Danh sách sản phẩm</h3>
            {room.items.map((item) => (
              <button
                key={item.id}
                className={item.id === selectedId ? styles.activeItem : ""}
                onClick={() => setSelectedId(item.id)}
                type="button"
              >
                <span>{item.name}</span>
                <strong>AI placed</strong>
              </button>
            ))}
          </section>
        </aside>
      </main>
    </div>
  );
}

export default ViewerDemo;
