import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getProductsApi } from "../../api/productApi";
import styles from "../../styles/Products.module.css";

const PAGE_SIZE = 20;

function Products() {
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [page, setPage] = useState(0);
  const [totalFiltered, setTotalFiltered] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const styleParam = searchParams.get("style") || "";
  const categoryParam = searchParams.get("category") || "";
  const stockParam = searchParams.get("stock") || "";
  const priceParam = searchParams.get("price") || "";

  const navigate = useNavigate();

  /* ================= FETCH ================= */
  const fetchAllProducts = async () => {
    let all = [];
    let page = 0;
    let last = false;

    while (!last) {
      const res = await getProductsApi(page, 50);
      all = [...all, ...(res?.content || [])];
      last = res?.last;
      page++;
    }

    return all;
  };

  /* ================= BUILD STYLE ================= */
  const buildCollections = (products) => {
    const map = {};
    products.forEach((item) => {
      item.styles?.forEach((style) => {
        if (!map[style]) {
          map[style] = { title: style, count: 0 };
        }
        map[style].count++;
      });
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  };

  /* ================= FILTER ================= */
  const applyFilter = (data) => {
    let filtered = data;

    if (styleParam) {
      filtered = filtered.filter((p) => p.styles?.includes(styleParam));
    }

    if (categoryParam) {
      filtered = filtered.filter((p) => p.category === categoryParam);
    }

    if (stockParam) {
      filtered = filtered.filter((p) =>
        stockParam === "in" ? p.inStock : !p.inStock,
      );
    }

    if (priceParam) {
      if (priceParam === "low") {
        filtered = filtered.filter((p) => p.price < 5000000);
      } else if (priceParam === "mid") {
        filtered = filtered.filter(
          (p) => p.price >= 5000000 && p.price <= 15000000,
        );
      } else {
        filtered = filtered.filter((p) => p.price > 15000000);
      }
    }

    setTotalFiltered(filtered.length);

    const start = page * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    setProducts(filtered.slice(start, end));
  };

  /* ================= INIT ================= */
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const all = await fetchAllProducts();
      setAllProducts(all);
      setCollections(buildCollections(all));
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    applyFilter(allProducts);
  }, [styleParam, categoryParam, stockParam, priceParam, page]);

  /* ================= ACTION ================= */
  const updateFilter = (newParams) => {
    setPage(0);
    setSearchParams({
      style: styleParam,
      category: categoryParam,
      stock: stockParam,
      price: priceParam,
      ...newParams,
    });
  };

  const clearFilter = () => {
    setPage(0);
    setSearchParams({});
  };

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE);

  const startItem = totalFiltered === 0 ? 0 : page * PAGE_SIZE + 1;

  const endItem = Math.min((page + 1) * PAGE_SIZE, totalFiltered);

  /* ================= SCROLL TOP ================= */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  /* ================= UI ================= */
  return (
    <div className={styles.wrapper}>
      {/* ===== SIDEBAR ===== */}
      <div className={styles.sidebar}>
        <h3>Danh mục</h3>
        {["Sofa", "Bàn", "Giường", "Đèn"].map((cat) => (
          <button
            key={cat}
            onClick={() => updateFilter({ category: cat })}
            className={categoryParam === cat ? styles.active : ""}
          >
            {cat}
          </button>
        ))}

        <h3>Kho hàng</h3>
        <button onClick={() => updateFilter({ stock: "in" })}>Còn hàng</button>
        <button onClick={() => updateFilter({ stock: "out" })}>Hết hàng</button>

        <h3>Giá</h3>
        <button onClick={() => updateFilter({ price: "low" })}>Dưới 5tr</button>
        <button onClick={() => updateFilter({ price: "mid" })}>
          5tr - 15tr
        </button>
        <button onClick={() => updateFilter({ price: "high" })}>
          Trên 15tr
        </button>

        <button onClick={clearFilter} className={styles.clear}>
          Xóa lọc
        </button>
      </div>

      {/* ===== CONTENT ===== */}
      <div className={styles.content}>
        {/* STYLE FILTER */}
        {/* <div className={styles.styleFilter}>
          {collections.map((item) => (
            <button
              key={item.title}
              onClick={() => updateFilter({ style: item.title })}
              className={`${styles.filterBtn} ${
                styleParam === item.title ? styles.active : ""
              }`}
            >
              {item.title}
            </button>
          ))}
        </div> */}

        {/* GRID */}
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
                <img src={item.images?.[0]} />
                <h3>{item.name}</h3>
                <p>{item.priceFormatted}</p>
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
