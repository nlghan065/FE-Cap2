import {
  ChevronRight,
  Eye,
  Palette,
  ShoppingCart,
  Sparkles,
  Wand2,
} from "lucide-react";
import styles from "../../../styles/AIDesigner.module.css";

function AIDesignerResultsPanel({
  results,
  formatPrice,
  onReset,
  onView3D,
  onAddAllToCart,
  onViewProduct,
}) {
  const hasProducts =
    Array.isArray(results.products) && results.products.length > 0;

  const requestStatus = results.requestMeta?.status || "PENDING";
  const averagePrice = hasProducts
    ? Math.round(
        results.totalPrice / Math.max(results.products.length, 1) / 1000000,
      )
    : 0;

  return (
    <div className={styles.resultsContainer}>
      <section className={styles.resultHero}>
        <div className={styles.resultHeroOverlay} />
        <div className={styles.resultHeroContent}>
          <div className={styles.resultHeroMain}>
            <div className={styles.summaryBadge}>
              <Sparkles size={16} />
              <span>{hasProducts ? "AI Completed" : "Request Created"}</span>
            </div>

            <h2 className={styles.resultHeroTitle}>
              {hasProducts
                ? "Thiết kế hoàn tất"
                : "Yêu cầu thiết kế đã được tạo"}
            </h2>

            <p className={styles.resultHeroText}>
              {hasProducts
                ? `AI đã phân tích và chọn ${results.products.length} sản phẩm phù hợp cho không gian ${results.roomType || "bạn đã chọn"}.`
                : results.requestMeta?.message ||
                  "Backend đã nhận request, nhưng chưa trả danh sách sản phẩm ngay."}
            </p>

            <div className={styles.resultHeroStats}>
              <div className={styles.resultHeroStat}>
                <span>Chiều rộng</span>
                <strong>
                  {results.roomAnalysis?.width
                    ? `${results.roomAnalysis.width} m`
                    : "Chưa có"}
                </strong>
              </div>
              <div className={styles.resultHeroStat}>
                <span>Chiều dài</span>
                <strong>
                  {results.roomAnalysis?.length
                    ? `${results.roomAnalysis.length} m`
                    : "Chưa có"}
                </strong>
              </div>
              <div className={styles.resultHeroStat}>
                <span>Chiều cao</span>
                <strong>
                  {results.roomAnalysis?.height
                    ? `${results.roomAnalysis.height} m`
                    : "Chưa có"}
                </strong>
              </div>
            </div>
          </div>

          <div className={styles.resultHeroPriceCard}>
            <Sparkles size={16} />
            <span>
              {hasProducts ? "Tổng giá trị dự kiến" : "Trạng thái request"}
            </span>
            <strong>
              {hasProducts ? formatPrice(results.totalPrice) : requestStatus}
            </strong>
            {hasProducts && <small>~{averagePrice}M / sản phẩm</small>}
          </div>
        </div>
      </section>

      <div className={styles.resultColumns}>
        <aside className={styles.resultSidebar}>
          {!!results.roomAnalysis?.reasoning && (
            <div className={styles.resultInfoCard}>
              <h3 className={styles.resultCardTitle}>
                <span className={styles.resultCardIconGreen}>
                  <Sparkles size={16} />
                </span>
                <span>Đánh giá AI</span>
              </h3>
              <p>{results.roomAnalysis.reasoning}</p>
            </div>
          )}

          {!!results.imageUrl && (
            <div className={styles.resultInfoCard}>
              <h3 className={styles.resultCardTitle}>Ảnh thiết kế</h3>
              <img
                src={results.imageUrl}
                alt="AI design result"
                className={styles.resultPreviewImage}
              />
            </div>
          )}

          {!!results.colorPalette?.length && (
            <div className={styles.resultInfoCard}>
              <h3 className={styles.resultCardTitle}>
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
          )}

          <div className={styles.resultInfoCard}>
            <h3 className={styles.resultCardTitle}>Thông số phòng</h3>
            <div className={styles.analysisGrid}>
              <div className={styles.analysisItem}>
                <span>Room type</span>
                <strong>{results.roomType || "Chưa có"}</strong>
              </div>
              <div className={styles.analysisItem}>
                <span>Style</span>
                <strong>{results.style || "Chưa có"}</strong>
              </div>
              <div className={styles.analysisItem}>
                <span>Density</span>
                <strong>{results.furnitureDensity || "Chưa có"}</strong>
              </div>
              <div className={styles.analysisItem}>
                <span>Gender</span>
                <strong>{results.gender || "Chưa có"}</strong>
              </div>
            </div>
          </div>

          {!hasProducts && (
            <div className={styles.resultInfoCard}>
              <h3 className={styles.resultCardTitle}>Thông tin request</h3>
              <div className={styles.analysisGrid}>
                <div className={styles.analysisItem}>
                  <span>Request ID</span>
                  <strong>{results.requestMeta?.id || "Chưa có"}</strong>
                </div>
                <div className={styles.analysisItem}>
                  <span>Status</span>
                  <strong>{requestStatus}</strong>
                </div>
              </div>
            </div>
          )}
        </aside>

        <section className={styles.resultProductSection}>
          <div className={styles.resultProductHeader}>
            <h3 className={styles.resultCardTitle}>
              <ShoppingCart size={18} />
              <span>
                Danh sách sản phẩm{" "}
                {hasProducts ? `(${results.products.length})` : ""}
              </span>
            </h3>
          </div>

          <div className={styles.resultProductScroller}>
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
                  Request đã được tạo thành công. Khi backend xử lý xong và trả
                  về danh sách sản phẩm, phần này sẽ hiển thị các gợi ý nội
                  thất.
                </p>
              </article>
            )}
          </div>
        </section>
      </div>

      <div className={styles.resultActionBar}>
        {hasProducts && (
          <>
            <button
              className={styles.resultActionPrimary}
              onClick={onView3D}
              type="button"
            >
              <Eye size={18} />
              <span>Xem không gian 3D</span>
              <ChevronRight size={16} />
            </button>
            <button
              className={styles.resultActionSecondary}
              onClick={onAddAllToCart}
              type="button"
            >
              <ShoppingCart size={18} />
              <span>Thêm tất cả vào giỏ</span>
            </button>
          </>
        )}

        <button
          className={styles.resultActionGhost}
          onClick={onReset}
          type="button"
        >
          <Wand2 size={18} />
          <span>Thiết kế lại</span>
        </button>
      </div>
    </div>
  );
}

export default AIDesignerResultsPanel;
