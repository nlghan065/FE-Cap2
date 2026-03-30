import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { searchProductsApi } from "../../api/productApi";
import styles from "../../styles/Products.module.css";
import { ShoppingCart, Search } from "lucide-react";

const PAGE_SIZE = 20;

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const keywordParam = searchParams.get("keyword") || "";
  const categoryParam = searchParams.get("category") || "";
  const stockParam = searchParams.get("inStock") || "";
  const minPriceParam = searchParams.get("minPrice") || "";
  const maxPriceParam = searchParams.get("maxPrice") || "";
  const sortBy = searchParams.get("sortBy") || "";
  const sortDir = searchParams.get("sortDir") || "";

  const minPrice = minPriceParam ? Number(minPriceParam) : 0;
  const maxPrice = maxPriceParam ? Number(maxPriceParam) : Infinity;
  /* ================= MAP DATA ================= */
  const mapProduct = (p) => {
    const stock = p.stock ?? 0;
    let availabilityText = "Hết hàng";

    if (stock > 0 && stock <= 5) availabilityText = `Sắp hết (${stock})`;
    else if (stock > 5) availabilityText = `Còn ${stock} sản phẩm`;

    return {
      ...p,
      image: p.images?.[0] || "/no-image.png",
      rating: p.avgRating || 0,
      reviews: p.reviewCount || 0,
      sold: p.soldCount || 0,
      colorHex: p.color?.hex || "#ccc",
      stock,
      availabilityText,
    };
  };

  /* ================= FETCH PRODUCTS ================= */
  const fetchProducts = async () => {
    setLoading(true);
    const res = await searchProductsApi({
      page,
      size: PAGE_SIZE,
      keyword: keywordParam,
      category: categoryParam,
      minPrice: minPriceParam,
      maxPrice: maxPriceParam,
      inStock: stockParam,
      sortBy,
      sortDir,
    });
    setProducts(res.content.map(mapProduct));
    setTotalPages(res.totalPages);
    setLoading(false);
  };

  useEffect(() => {
    const timeout = setTimeout(fetchProducts, 200);
    return () => clearTimeout(timeout);
  }, [
    page,
    categoryParam,
    keywordParam,
    stockParam,
    minPriceParam,
    maxPriceParam,
    sortBy,
    sortDir,
  ]);

  /* ================= FETCH CATEGORY ================= */
  const CACHE_KEY = "categories_cache_v2";

  useEffect(() => {
    const cached = sessionStorage.getItem(CACHE_KEY);

    if (cached) {
      try {
        const data = JSON.parse(cached);
        setCategories(data.categories || []);

        return;
      } catch (e) {}
    }

    const fetchCategories = async () => {
      const res = await searchProductsApi({
        page: 5, // 👈 giờ mới có tác dụng
        size: 100,
      });

      const set = new Set();

      res.content.forEach((p) => {
        if (!p.category) return;
        set.add(p.category);
      });

      const data = {
        categories: Array.from(set),
      };

      sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));

      setCategories(data.categories);
    };

    fetchCategories();
  }, []);
  /* ================= ACTION ================= */
  const updateFilter = (newParams) => {
    setPage(0);
    if (newParams.category) {
      sessionStorage.removeItem(CACHE_KEY);
    }
    const current = Object.fromEntries(searchParams);
    const merged = { ...current, ...newParams };

    // loại bỏ key rỗng
    Object.keys(merged).forEach((k) => {
      if (merged[k] === "" || merged[k] === null || merged[k] === undefined)
        delete merged[k];
    });

    setSearchParams(merged);
  };

  const clearFilter = () => {
    setPage(0);
    setSearchParams({});
  };

  const visibleCount = 3;
  const visibleCategories = showAllCategories
    ? categories
    : categories.slice(0, visibleCount);

  const isFilterEmpty =
    !categoryParam &&
    !stockParam &&
    !minPriceParam &&
    !maxPriceParam &&
    !sortBy &&
    !sortDir;

  /* ================= CART HANDLER ================= */
  const addToCart = (item) => {
    console.log("Add to cart:", item);
    // TODO: implement actual cart logic
  };

  /* ================= UI ================= */
  return (
    <div className={styles.wrapper}>
      {/* SIDEBAR */}
      <div className={styles.sidebar}>
        <h3>Danh mục</h3>
        <div
          className={`${styles.categoryList} ${
            showAllCategories ? styles.showAll : ""
          }`}
        >
          {visibleCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => updateFilter({ category: cat })}
              className={categoryParam === cat ? styles.active : ""}
            >
              <span>{cat}</span>
            </button>
          ))}
        </div>
        {categories.length > visibleCount && (
          <button
            className={styles.showMoreBtn}
            onClick={() => setShowAllCategories(!showAllCategories)}
          >
            {showAllCategories
              ? "▲ Thu gọn"
              : `▼ Xem thêm (${categories.length - visibleCount})`}
          </button>
        )}

        <h3>Kho hàng</h3>
        <button
          onClick={() => updateFilter({ inStock: "true" })}
          className={stockParam === "true" ? styles.active : ""}
        >
          Còn hàng
        </button>
        <button
          onClick={() => updateFilter({ inStock: "false" })}
          className={stockParam === "false" ? styles.active : ""}
        >
          Hết hàng
        </button>

        <h3>Giá</h3>
        <button
          onClick={() => updateFilter({ minPrice: 0, maxPrice: 5000000 })}
          className={
            minPrice === 0 && maxPrice === 5000000 ? styles.active : ""
          }
        >
          Dưới 5tr
        </button>
        <button
          onClick={() =>
            updateFilter({ minPrice: 5000000, maxPrice: 15000000 })
          }
          className={
            minPrice === 5000000 && maxPrice === 15000000 ? styles.active : ""
          }
        >
          5tr - 15tr
        </button>
        <button
          onClick={() => updateFilter({ minPrice: 15000000, maxPrice: "" })}
          className={minPrice === 15000000 ? styles.active : ""}
        >
          Trên 15tr
        </button>

        <h3>Sắp xếp</h3>
        <button
          onClick={() => updateFilter({ sortBy: "price", sortDir: "asc" })}
          className={
            sortBy === "price" && sortDir === "asc" ? styles.active : ""
          }
        >
          Giá tăng
        </button>
        <button
          onClick={() => updateFilter({ sortBy: "price", sortDir: "desc" })}
          className={
            sortBy === "price" && sortDir === "desc" ? styles.active : ""
          }
        >
          Giá giảm
        </button>

        <button
          onClick={clearFilter}
          disabled={isFilterEmpty}
          className={`${styles.clearBtn} ${!isFilterEmpty ? styles.enabled : ""}`}
        >
          Xóa lọc
        </button>
      </div>

      {/* CONTENT */}
      <div className={styles.content}>
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div className={styles.grid}>
            {products.map((item) => (
              <div
                key={item.id}
                className={styles.card}
                onClick={() => navigate(`/products/${item.id}`)}
              >
                <div className={styles.imageWrap}>
                  <img src={item.image} alt={item.name} />
                  <div
                    className={styles.cartBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item);
                    }}
                  >
                    <ShoppingCart size={18} />
                  </div>
                </div>

                <div className={styles.info}>
                  <div className={styles.name}>{item.name}</div>
                  <div className={styles.desc}>
                    {item.description?.slice(0, 60)}
                  </div>
                  <div className={styles.priceWrap}>
                    <span className={styles.price}>
                      {item.price?.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div
                    className={
                      item.stock === 0
                        ? styles.out
                        : item.stock <= 5
                          ? styles.lowStock
                          : styles.stock
                    }
                  >
                    {item.availabilityText}
                  </div>
                  <div className={styles.ratingSold}>
                    <span className={styles.rating}>
                      ⭐ {item.rating.toFixed(1)}
                    </span>
                    <span className={styles.sold}>| Đã bán {item.sold}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        <div className={styles.pagination}>
          <button disabled={page === 0} onClick={() => setPage(page - 1)}>
            ←
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={page === i ? styles.activePage : ""}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}

export default Products;
