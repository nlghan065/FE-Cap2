import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/Admin.module.css";
import { Eye, Pencil, Trash2, Plus, Search } from "lucide-react";
import AdminHeader from "../../layout/admin/AdminHeader";
import AdminMenu from "../../layout/admin/AdminMenu";
import {
  getProductsAdminApi,
  deleteProductAdminApi,
  searchProductsAdminApi,
} from "../../api/productAdminApi";

const ProductsAdmin = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);

      let res;

      if (keyword.trim() !== "") {
        res = await searchProductsAdminApi({
          page,
          size: 10,
          keyword, // 👈 truyền trực tiếp, KHÔNG cần params
        });
      } else {
        res = await getProductsAdminApi({
          page,
          size: 10,
        });
      }

      setProducts(res.content);
      setTotalPages(res.totalPages);
    } catch (e) {
      console.error("Fetch products error:", e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, [page, keyword]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa sản phẩm này?")) return;
    try {
      await deleteProductAdminApi(id);
      fetchProducts();
    } catch (e) {
      console.error("Delete error:", e);
    }
  };

  const renderStock = (p) =>
    p.inStock ? (
      <span className={styles.active}>Còn hàng</span>
    ) : (
      <span className={styles.inactive}>Hết hàng</span>
    );

  return (
    <div className={styles.adminDashboard}>
      <AdminHeader />
      <AdminMenu />

      <div className={styles.container}>
        <div className={styles.topBar}>
          <div className={styles.searchBox}>
            <Search size={16} />
            <input
              placeholder="Tìm sản phẩm..."
              value={keyword}
              onChange={(e) => {
                setPage(0);
                setKeyword(e.target.value);
              }}
            />
          </div>
          <button
            className={styles.exportBtn}
            onClick={() => navigate("/admin/products/create")}
          >
            <Plus size={16} /> Thêm sản phẩm
          </button>
        </div>

        <div className={styles.table}>
          <div className={styles.thead}>
            <span>Sản phẩm</span>
            <span>Giá</span>
            <span>Danh mục</span>

            <span>Vật liệu</span>
            <span>Số lượng</span>
            <span>Kho</span>
            <span>Thao tác</span>
          </div>

          {loading ? (
            <p style={{ padding: 20 }}>Đang tải...</p>
          ) : products.length === 0 ? (
            <p style={{ padding: 20 }}>Không có sản phẩm</p>
          ) : (
            products.map((p) => (
              <div key={p.id} className={styles.row}>
                <div className={styles.productInfo}>
                  <img src={p.images?.[0]} alt="" />
                  <div>
                    <b>{p.name}</b>
                  </div>
                </div>
                <span className={styles.money}>
                  {Number(p.price).toLocaleString("vi-VN")} VND
                </span>
                <span>{p.category || "—"}</span>

                <span>{p.material || "—"}</span>
                <span>{p.stock || 0}</span>
                <span>{renderStock(p)}</span>
                <div className={styles.actions}>
                  <button
                    className={styles.viewBtn}
                    onClick={() => navigate(`/admin/products/${p.id}`)}
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    className={styles.editBtn}
                    onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(p.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.pagination}>
          <button disabled={page === 0} onClick={() => setPage(page - 1)}>
            ←
          </button>
          <span>
            Trang {page + 1} / {totalPages}
          </span>
          <button
            disabled={page === totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductsAdmin;
