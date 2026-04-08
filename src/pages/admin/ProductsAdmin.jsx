import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Input riêng cho gõ mượt
  const [keywordInput, setKeywordInput] = useState(
    searchParams.get("query") || "",
  );

  // ================= UPDATE FILTER =================
  const updateFilter = (newParams) => {
    setPage(0);
    const merged = { ...Object.fromEntries(searchParams), ...newParams };
    Object.keys(merged).forEach((k) => {
      if (merged[k] === "" || merged[k] === null || merged[k] === undefined)
        delete merged[k];
    });
    setSearchParams(merged);
  };

  // ================= CLEAR FILTER =================
  const clearFilter = () => {
    setPage(0);
    setSearchParams({});
    setKeywordInput("");
  };

  // ================= FETCH PRODUCTS =================
  useEffect(() => {
    const delay = setTimeout(async () => {
      try {
        setLoading(true);

        const params = {
          page,
          size: 10,
          keyword: searchParams.get("query") || undefined,
          category: searchParams.get("category") || undefined,
          material: searchParams.get("material") || undefined,
          minPrice: searchParams.get("minPrice")
            ? Number(searchParams.get("minPrice"))
            : undefined,
          maxPrice: searchParams.get("maxPrice")
            ? Number(searchParams.get("maxPrice"))
            : undefined,
          inStock:
            searchParams.get("inStock") === "true"
              ? true
              : searchParams.get("inStock") === "false"
                ? false
                : undefined,
          sortBy: searchParams.get("sortBy") || undefined,
          sortDir: searchParams.get("sortDir") || undefined,
        };

        // Nếu có query hoặc filter → search
        const hasFilter = Object.values(params).some((v) => v !== undefined);

        const res = hasFilter
          ? await searchProductsAdminApi(params)
          : await getProductsAdminApi({ page, size: 10 });

        setProducts(res.content || []);
        setTotalPages(res.totalPages || 1);

        // dynamic categories & materials
        setCategories([
          ...new Set(res.content.map((p) => p.category).filter(Boolean)),
        ]);
        setMaterials([
          ...new Set(res.content.map((p) => p.material).filter(Boolean)),
        ]);
      } catch (e) {
        console.error("Fetch products error:", e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [
    page,
    searchParams.get("query"),
    searchParams.get("category"),
    searchParams.get("material"),
    searchParams.get("inStock"),
    searchParams.get("sortBy"),
    searchParams.get("sortDir"),
  ]);

  // ================= KEYWORD INPUT DEBOUNCE =================
  useEffect(() => {
    const timeout = setTimeout(() => {
      updateFilter({ query: keywordInput.trim() });
    }, 500);
    return () => clearTimeout(timeout);
  }, [keywordInput]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  // ================= DELETE PRODUCT =================
  const handleDelete = async (id) => {
    if (!window.confirm("Xóa sản phẩm này?")) return;
    await deleteProductAdminApi(id);
    setPage(0); // reset về trang đầu sau khi xóa
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
          {/* SEARCH */}
          <div className={styles.searchBox}>
            <Search size={16} />
            <input
              placeholder="Tìm sản phẩm..."
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
            />
          </div>

          {/* FILTER */}
          <div className={styles.filterBar}>
            {/* CATEGORY */}
            <select
              value={searchParams.get("category") || ""}
              onChange={(e) => updateFilter({ category: e.target.value })}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* STOCK */}
            <select
              value={searchParams.get("inStock") || ""}
              onChange={(e) => updateFilter({ inStock: e.target.value })}
            >
              <option value="">Tất cả kho</option>
              <option value="true">Còn hàng</option>
              <option value="false">Hết hàng</option>
            </select>

            {/* SORT PRICE */}
            <select
              value={searchParams.get("sortDir") || ""}
              onChange={(e) =>
                updateFilter({ sortBy: "price", sortDir: e.target.value })
              }
            >
              <option value="">Sắp xếp theo giá</option>
              <option value="asc">Thấp → Cao</option>
              <option value="desc">Cao → Thấp</option>
            </select>

            <button className={styles.resetBtn} onClick={clearFilter}>
              Reset
            </button>
          </div>

          {/* ADD PRODUCT */}
          <button
            className={styles.exportBtn}
            onClick={() => navigate("/admin/products/create")}
          >
            <Plus size={16} /> Thêm sản phẩm
          </button>
        </div>

        {/* TABLE */}
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
                  <button onClick={() => navigate(`/admin/products/${p.id}`)}>
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                  >
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(p.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* PAGINATION */}
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
