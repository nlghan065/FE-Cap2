import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Grid,
  Html,
  OrbitControls,
  PerspectiveCamera,
  RoundedBox,
} from "@react-three/drei";
import {
  ArrowLeft,
  Box,
  ChevronRight,
  Home,
  Loader2,
  Maximize2,
  RotateCcw,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";

import { addToCartApi } from "../../api/cartApi";
import { resolveImageUrl } from "../../utils/imageUrl";
import styles from "../../styles/Viewer3D.module.css";

const CATEGORY_TYPES = [
  {
    keys: ["sofa", "ghe", "chair", "armchair"],
    type: "seat",
    color: "#b96f4a",
  },
  {
    keys: ["ban", "table", "desk"],
    type: "table",
    color: "#9a6a43",
  },
  {
    keys: ["giuong", "bed"],
    type: "bed",
    color: "#d8c7ad",
  },
  {
    keys: ["tu", "cabinet", "wardrobe", "shelf", "ke"],
    type: "storage",
    color: "#8f6f52",
  },
  {
    keys: ["den", "lamp", "light"],
    type: "lamp",
    color: "#30323a",
  },
  {
    keys: ["cay", "plant"],
    type: "plant",
    color: "#2f6f4f",
  },
];

const ROOM_POSITIONS = [
  [-1.8, 0, 1.45],
  [0.25, 0, 0.1],
  [1.8, 0, -1.35],
  [-2.1, 0, -1.65],
  [2.1, 0, 1.35],
  [0, 0, -2.15],
  [-0.2, 0, 2.2],
  [2.35, 0, -0.1],
];

const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const getProductId = (product) =>
  product?.id || product?._id || product?.productId || product?.product?.id;

const getItemType = (product) => {
  const source = normalizeText(`${product?.category || ""} ${product?.name || ""}`);
  return (
    CATEGORY_TYPES.find((item) => item.keys.some((key) => source.includes(key))) ||
    CATEGORY_TYPES[0]
  );
};

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(price) || 0);

function Room({ dimensions }) {
  const width = Number(dimensions?.width) || 4.5;
  const length = Number(dimensions?.length) || 5.5;
  const height = Number(dimensions?.height) || 3;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color="#eee7dc" roughness={0.82} />
      </mesh>

      <mesh position={[0, height / 2, -length / 2]} receiveShadow>
        <boxGeometry args={[width, height, 0.08]} />
        <meshStandardMaterial color="#fbfaf6" roughness={0.9} />
      </mesh>

      <mesh position={[-width / 2, height / 2, 0]} receiveShadow>
        <boxGeometry args={[0.08, height, length]} />
        <meshStandardMaterial color="#f5f2eb" roughness={0.9} />
      </mesh>
    </group>
  );
}

function ProductLabel({ item, selected }) {
  return (
    <Html center distanceFactor={8} position={[0, selected ? 1.65 : 1.35, 0]}>
      <div className={`${styles.sceneLabel} ${selected ? styles.sceneLabelActive : ""}`}>
        <span>{item.name}</span>
        <strong>{formatPrice(item.price)}</strong>
      </div>
    </Html>
  );
}

function FurnitureModel({ item, selected, onSelect }) {
  const groupRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const active = selected || hovered;

  useFrame((state) => {
    if (!groupRef.current || !active) return;
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2.4) * 0.025;
  });

  return (
    <group
      ref={groupRef}
      position={item.position}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(item);
      }}
      onPointerOut={() => setHovered(false)}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
    >
      {item.type === "table" && (
        <>
          <mesh castShadow position={[0, 0.48, 0]}>
            <cylinderGeometry args={[0.55, 0.55, 0.09, 48]} />
            <meshStandardMaterial color={item.color} roughness={0.46} />
          </mesh>
          <mesh castShadow position={[0, 0.23, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 0.45, 24]} />
            <meshStandardMaterial color="#5d4431" roughness={0.5} />
          </mesh>
          <mesh castShadow position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.38, 0.38, 0.08, 32]} />
            <meshStandardMaterial color="#5d4431" roughness={0.55} />
          </mesh>
        </>
      )}

      {item.type === "seat" && (
        <>
          <RoundedBox castShadow args={[1.9, 0.38, 0.92]} radius={0.08} position={[0, 0.42, 0]}>
            <meshStandardMaterial color={item.color} roughness={0.68} />
          </RoundedBox>
          <RoundedBox castShadow args={[1.95, 0.86, 0.22]} radius={0.07} position={[0, 0.86, -0.42]}>
            <meshStandardMaterial color={item.color} roughness={0.72} />
          </RoundedBox>
          <RoundedBox castShadow args={[0.22, 0.68, 0.95]} radius={0.06} position={[-1.08, 0.66, 0]}>
            <meshStandardMaterial color={item.color} roughness={0.7} />
          </RoundedBox>
          <RoundedBox castShadow args={[0.22, 0.68, 0.95]} radius={0.06} position={[1.08, 0.66, 0]}>
            <meshStandardMaterial color={item.color} roughness={0.7} />
          </RoundedBox>
        </>
      )}

      {item.type === "bed" && (
        <>
          <RoundedBox castShadow args={[1.65, 0.34, 2.15]} radius={0.08} position={[0, 0.36, 0]}>
            <meshStandardMaterial color={item.color} roughness={0.78} />
          </RoundedBox>
          <RoundedBox castShadow args={[1.78, 0.96, 0.16]} radius={0.05} position={[0, 0.74, -1.12]}>
            <meshStandardMaterial color="#8a684d" roughness={0.62} />
          </RoundedBox>
          <RoundedBox castShadow args={[0.62, 0.12, 0.38]} radius={0.05} position={[-0.38, 0.62, -0.72]}>
            <meshStandardMaterial color="#fffaf0" roughness={0.85} />
          </RoundedBox>
          <RoundedBox castShadow args={[0.62, 0.12, 0.38]} radius={0.05} position={[0.38, 0.62, -0.72]}>
            <meshStandardMaterial color="#fffaf0" roughness={0.85} />
          </RoundedBox>
        </>
      )}

      {item.type === "storage" && (
        <>
          <RoundedBox castShadow args={[1.15, 1.35, 0.42]} radius={0.04} position={[0, 0.68, 0]}>
            <meshStandardMaterial color={item.color} roughness={0.58} />
          </RoundedBox>
          <mesh castShadow position={[-0.28, 0.67, 0.23]}>
            <boxGeometry args={[0.03, 0.92, 0.03]} />
            <meshStandardMaterial color="#e7d6bd" roughness={0.35} />
          </mesh>
          <mesh castShadow position={[0.28, 0.67, 0.23]}>
            <boxGeometry args={[0.03, 0.92, 0.03]} />
            <meshStandardMaterial color="#e7d6bd" roughness={0.35} />
          </mesh>
        </>
      )}

      {item.type === "lamp" && (
        <>
          <mesh castShadow position={[0, 1, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 1.8, 18]} />
            <meshStandardMaterial color="#282a30" metalness={0.42} roughness={0.32} />
          </mesh>
          <mesh castShadow position={[0, 0.28, 0]}>
            <coneGeometry args={[0.34, 0.48, 32]} />
            <meshStandardMaterial color={item.color} roughness={0.36} />
          </mesh>
          <pointLight color="#fff1c2" distance={4.2} intensity={active ? 1.4 : 0.85} position={[0, 0.2, 0]} />
        </>
      )}

      {item.type === "plant" && (
        <>
          <mesh castShadow position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.18, 0.14, 0.32, 24]} />
            <meshStandardMaterial color="#9b5f3d" roughness={0.7} />
          </mesh>
          {[0, 1, 2, 3, 4].map((index) => (
            <mesh
              castShadow
              key={index}
              position={[
                Math.cos(index * 1.25) * 0.16,
                0.43 + index * 0.045,
                Math.sin(index * 1.25) * 0.16,
              ]}
            >
              <sphereGeometry args={[0.13, 18, 18]} />
              <meshStandardMaterial color={item.color} roughness={0.72} />
            </mesh>
          ))}
        </>
      )}

      {active && (
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.76, 0.84, 48]} />
          <meshBasicMaterial color="#0f766e" opacity={0.45} transparent />
        </mesh>
      )}

      {selected && <ProductLabel item={item} selected={selected} />}
    </group>
  );
}

function Scene({ items, roomDimensions, selectedId, onSelect }) {
  return (
    <>
      <PerspectiveCamera makeDefault fov={48} position={[4.8, 3.6, 5.6]} />
      <OrbitControls
        enableDamping
        makeDefault
        maxDistance={9}
        maxPolarAngle={Math.PI / 2.05}
        minDistance={2.8}
        target={[0, 0.45, 0]}
      />
      <ambientLight intensity={0.72} />
      <directionalLight castShadow intensity={1.45} position={[4, 6, 3]} />
      <Room dimensions={roomDimensions} />
      <Grid
        args={[8, 8]}
        cellColor="#d5cec2"
        cellSize={0.5}
        fadeDistance={9}
        fadeStrength={1}
        position={[0, 0.012, 0]}
        sectionColor="#a39889"
        sectionSize={1}
      />
      {items.map((item) => (
        <FurnitureModel
          item={item}
          key={item.id}
          onSelect={onSelect}
          selected={String(selectedId) === String(item.id)}
        />
      ))}
      <ContactShadows blur={2.8} far={4.5} opacity={0.34} position={[0, 0.02, 0]} scale={7} />
      <Environment preset="apartment" />
    </>
  );
}

function Viewer3DPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const aiResults = location.state?.aiResults || null;
  const [selectedId, setSelectedId] = useState(null);
  const [addingCart, setAddingCart] = useState(false);

  const products = useMemo(
    () => (Array.isArray(aiResults?.products) ? aiResults.products : []),
    [aiResults],
  );

  const sceneItems = useMemo(
    () =>
      products.map((product, index) => {
        const meta = getItemType(product);
        return {
          ...product,
          id: getProductId(product) || `viewer-item-${index + 1}`,
          color: product?.colors?.[0] || meta.color,
          image: resolveImageUrl(product?.imageUrl || product?.image),
          position: product?.position
            ? [product.position.x || 0, product.position.y || 0, product.position.z || 0]
            : ROOM_POSITIONS[index % ROOM_POSITIONS.length],
          type: meta.type,
        };
      }),
    [products],
  );

  const selectedItem =
    sceneItems.find((item) => String(item.id) === String(selectedId)) ||
    sceneItems[0] ||
    null;

  const totalPrice = sceneItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  const handleSelect = (item) => {
    setSelectedId(item.id);
  };

  const handleAddAllToCart = async () => {
    const realItems = sceneItems.filter((item) => !String(item.id).startsWith("ai-product-"));

    if (!realItems.length) {
      toast.error("Danh sách AI chưa có productId thật để thêm vào giỏ.");
      return;
    }

    setAddingCart(true);
    try {
      await Promise.all(
        realItems.map((item) =>
          addToCartApi({
            productId: item.id,
            quantity: 1,
          }),
        ),
      );
      window.dispatchEvent(new Event("cartUpdated"));
      toast.success("Đã thêm sản phẩm vào giỏ hàng.");
      navigate("/cart");
    } catch (error) {
      console.error("Add AI products to cart error:", error);
      toast.error(error?.response?.data?.message || "Không thêm được vào giỏ hàng.");
    } finally {
      setAddingCart(false);
    }
  };

  if (!sceneItems.length) {
    return (
      <div className={styles.emptyPage}>
        <div className={styles.emptyPanel}>
          <Box size={42} />
          <h1>Chưa có dữ liệu 3D</h1>
          <p>Hãy tạo thiết kế bằng AI Designer để viewer dựng không gian từ response thật của API.</p>
          <button type="button" onClick={() => navigate("/ai-designer")}>
            Mở AI Designer
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.toolbar}>
        <div className={styles.toolbarMain}>
          <button className={styles.iconButton} onClick={() => navigate(-1)} title="Quay lại" type="button">
            <ArrowLeft size={19} />
          </button>
          <div>
            <span className={styles.kicker}>
              <Sparkles size={14} />
              AI 3D Viewer
            </span>
            <h1>Không gian 3D từ API thật</h1>
          </div>
        </div>

        <div className={styles.toolbarActions}>
          <button className={styles.iconButton} title="Reset góc nhìn" type="button">
            <RotateCcw size={18} />
          </button>
          <button className={styles.iconButton} title="Toàn màn hình" type="button">
            <Maximize2 size={18} />
          </button>
          <button className={styles.cartButton} disabled={addingCart} onClick={handleAddAllToCart} type="button">
            {addingCart ? <Loader2 className={styles.spin} size={18} /> : <ShoppingCart size={18} />}
            <span>Mua tất cả</span>
          </button>
        </div>
      </header>

      <main className={styles.viewerShell}>
        <section className={styles.canvasPanel}>
          <Canvas shadows dpr={[1, 1.7]}>
            <Suspense fallback={null}>
              <Scene
                items={sceneItems}
                onSelect={handleSelect}
                roomDimensions={aiResults?.roomAnalysis}
                selectedId={selectedItem?.id}
              />
            </Suspense>
          </Canvas>

          <div className={styles.sceneStats}>
            <div>
              <Home size={17} />
              <span>{aiResults?.roomType || "Không gian AI"}</span>
            </div>
            <strong>{sceneItems.length} sản phẩm</strong>
          </div>
        </section>

        <aside className={styles.sidePanel}>
          <section className={styles.summaryBlock}>
            <span>Tổng giá trị</span>
            <strong>{formatPrice(totalPrice)}</strong>
            <p>{aiResults?.reasoning || "Viewer đang dùng danh sách sản phẩm từ kết quả AI recommend."}</p>
          </section>

          {selectedItem && (
            <section className={styles.detailBlock}>
              {selectedItem.image && (
                <img src={selectedItem.image} alt={selectedItem.name} />
              )}
              <span>{selectedItem.category || selectedItem.type}</span>
              <h2>{selectedItem.name}</h2>
              <strong>{formatPrice(selectedItem.price)}</strong>
              <p>{selectedItem.reason || "Sản phẩm phù hợp với cấu hình phòng đã chọn."}</p>
              <dl>
                <div>
                  <dt>Chất liệu</dt>
                  <dd>{selectedItem.materials || "Chưa có dữ liệu"}</dd>
                </div>
                <div>
                  <dt>Kích thước</dt>
                  <dd>{selectedItem.dimensionsText || "Chưa có dữ liệu"}</dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={() =>
                  selectedItem.id && !String(selectedItem.id).startsWith("ai-product-")
                    ? navigate(`/products/${selectedItem.id}`)
                    : navigate("/products")
                }
              >
                Xem chi tiết sản phẩm
                <ChevronRight size={16} />
              </button>
            </section>
          )}

          <section className={styles.productList}>
            <h3>Danh sách sản phẩm</h3>
            {sceneItems.map((item) => (
              <button
                className={String(item.id) === String(selectedItem?.id) ? styles.activeItem : ""}
                key={item.id}
                onClick={() => handleSelect(item)}
                type="button"
              >
                <span>{item.name}</span>
                <strong>{formatPrice(item.price)}</strong>
              </button>
            ))}
          </section>
        </aside>
      </main>
    </div>
  );
}

export default Viewer3DPage;
