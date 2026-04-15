import { Eye, Palette, ShoppingCart, Sparkles, Wand2 } from "lucide-react";

import styles from "../../../styles/AIDesigner.module.css";

function AIDesignerResultsStep({
  results,
  formatPrice,
  onReset,
  onView3D,
  onAddAllToCart,
  onViewProduct,
}) {
  return (
    <div className={styles.resultsContainer}>
      <section className={styles.summaryHero}>
        <div>
          <div className={styles.summaryBadge}>
            <Sparkles size={16} />
            <span>AI Completed</span>
          </div>
          <h2>Phương án thiết kế đã sẵn sàng</h2>
          <p>
            AI đã chọn {results.products.length} sản phẩm theo phong cách và mật
            độ bạn chọn.
          </p>
        </div>

        <div className={styles.summaryPrice}>
          <span>Tổng chi phí dự kiến</span>
          <strong>{formatPrice(results.totalPrice)}</strong>
        </div>
      </section>

      <div className={styles.resultsGrid}>
        <aside className={styles.resultsSidebar}>
          <div className={styles.infoCard}>
            <h3>Đánh giá AI</h3>
            <ul className={styles.recommendationList}>
              {results.recommendations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className={styles.infoCard}>
            <h3>
              <Palette size={16} />
              <span>Bảng màu</span>
            </h3>
            <div className={styles.paletteList}>
              {results.colorPalette.map((item) => (
                <div className={styles.paletteItem} key={item.name}>
                  <span
                    className={styles.paletteSwatch}
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <strong>{item.name}</strong>
                    <small>{item.percentage}% diện tích</small>
                  </div>
                  <code>{item.color}</code>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.infoCard}>
            <h3>Thông số phòng</h3>
            <div className={styles.analysisGrid}>
              {Object.entries(results.roomAnalysis).map(([key, value]) => (
                <div className={styles.analysisItem} key={key}>
                  <span>{key}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className={styles.productGrid}>
          {hasProducts ? (
            results.products.map((product) => (
              <article className={styles.resultProductCard} key={product.id}>
                <div className={styles.productMedia}>
                  <img
                    src={product.imageUrl || product.image}
                    alt={product.name}
                  />
                  <span className={styles.productScore}>
                    {product.aiScore || 0}% fit
                  </span>
                  <span className={styles.resultCategoryPill}>
                    {product.category}
                  </span>
                </div>

                <div className={styles.productBody}>
                  <div className={styles.productMeta}>
                    <span>{product.category}</span>
                    <h3>{product.name}</h3>
                    <strong>{formatPrice(product.price || 0)}</strong>
                  </div>

                  <div className={styles.productSpecs}>
                    <p>
                      {product.reason ||
                        product.reasoning ||
                        "Sản phẩm phù hợp với không gian đã chọn."}
                    </p>
                    <small>Chất liệu: {product.materials || "Chưa có"}</small>
                    <small>
                      Kích thước:{" "}
                      {product.dimensions
                        ? `${product.dimensions.width ?? "-"} x ${product.dimensions.depth ?? "-"} x ${product.dimensions.height ?? "-"} cm`
                        : "Chưa có"}
                    </small>

                    {product.styles?.length > 0 && (
                      <small>Style: {product.styles.join(", ")}</small>
                    )}

                    {product.colors?.length > 0 && (
                      <div className={styles.resultColorRow}>
                        {product.colors.slice(0, 6).map((color) => (
                          <span
                            className={styles.resultColorDot}
                            key={color}
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    className={styles.resultDetailButton}
                    onClick={() => onViewProduct(product)}
                    type="button"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </article>
            ))
          ) : (
            <article className={styles.resultInfoCard}>
              <h3>AI chưa trả sản phẩm ngay</h3>
              <p>
                Request đã được tạo thành công. Khi backend xử lý xong và trả về
                danh sách sản phẩm, phần này sẽ hiển thị các gợi ý nội thất.
              </p>
            </article>
          )}
        </section>
      </div>

      <div className={styles.actionBar}>
        <button
          className={styles.primaryButton}
          onClick={onView3D}
          type="button"
        >
          <Eye size={18} />
          <span>Xem không gian 3D</span>
        </button>
        <button
          className={styles.secondaryButton}
          onClick={onAddAllToCart}
          type="button"
        >
          <ShoppingCart size={18} />
          <span>Thêm tất cả vào giỏ</span>
        </button>
        <button className={styles.ghostButton} onClick={onReset} type="button">
          <Wand2 size={18} />
          <span>Thiết kế lại</span>
        </button>
      </div>
    </div>
  );
}

export default AIDesignerResultsStep;
