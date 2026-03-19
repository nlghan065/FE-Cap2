import { useEffect, useState } from "react";
import styles from "../../styles/Admin.module.css";
import { getBestSellingProductsApi } from "../../api/dashboardApi";
import { Trophy, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

function TopProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async () => {
    try {
      setRefreshing(true);

      const res = await getBestSellingProductsApi(5);

      const mapped = (res || []).map((p, index) => ({
        _id: p.id,
        productId: p.id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        image: p.image,
        sold: p.soldCount,
        rank: index + 1,
      }));

      setProducts(mapped);
    } catch (error) {
      console.error("Lỗi lấy sản phẩm:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // load lần đầu + auto refresh
  useEffect(() => {
    fetchProducts();

    const interval = setInterval(() => {
      fetchProducts();
    }, 30000); // 30 giây

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    fetchProducts();
  };

  const formatMoney = (value) => {
    if (!value) return "0 ₫";
    return Number(value).toLocaleString("vi-VN") + " ₫";
  };

  if (loading) {
    return <div className={styles.card}>Đang tải...</div>;
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.title}>
          <div className={styles.icon}>
            <Trophy size={18} />
          </div>
          <h3>Top sản phẩm bán chạy</h3>
          <button
            onClick={handleReset}
            disabled={refreshing}
            className={styles.resetBtn}
          >
            <RotateCcw size={16} />
            {refreshing ? "Đang cập nhật..." : ""}
          </button>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          {/* Reset button */}

          <Link to="/admin/orders" className={styles.viewAll}>
            Xem sản phẩm →
          </Link>
        </div>
      </div>

      <div className={styles.topProducts}>
        {products.length === 0 ? (
          <p>Không có dữ liệu</p>
        ) : (
          products.map((product, index) => (
            <div
              key={product._id || product.productId || index}
              className={`${styles.productItem} ${
                product.rank === 1 ? styles.top1 : ""
              }`}
            >
              <div className={styles.productLeft}>
                <img
                  src={product.image || "/images/default.jpg"}
                  alt={product.name}
                  onError={(e) => (e.target.src = "/images/default.jpg")}
                />

                <div>
                  <h4>
                    #{product.rank} {product.name}
                  </h4>

                  <p>
                    Đã bán: <span>{product.sold || 0}</span>
                  </p>
                </div>
              </div>

              <div className={styles.productRight}>
                <strong>{formatMoney(product.price)}</strong>
                <p>Kho: {product.stock ?? "N/A"}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TopProducts;
