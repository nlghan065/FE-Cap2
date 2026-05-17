import {
  ChevronRight,
  Eye,
  History,
  Palette,
  ShoppingCart,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  getAiDensityLabel,
  getAiGenderLabel,
  getAiRequestStatusLabel,
  getAiRoomTypeLabel,
  getAiStyleLabel,
} from "../../../data/aiDesignerData";
import styles from "../../../styles/AIDesigner.module.css";

function AIDesignerResultsPanel({
  results,
  formatPrice,
  onReset,
  onCreate3D,
  onView3DHistory,
  onAddAllToCart,
  onViewProduct,
}) {
  const hasProducts =
    Array.isArray(results.products) && results.products.length > 0;

  const requestStatus = results.requestMeta?.status || "PENDING";
  const requestStatusLabel = getAiRequestStatusLabel(requestStatus);
  const roomTypeLabel = getAiRoomTypeLabel(results.roomType, "Chưa có");
  const styleLabel = getAiStyleLabel(results.style, "Chưa có");
  const densityLabel = getAiDensityLabel(results.furnitureDensity, "Chưa có");
  const genderLabel = getAiGenderLabel(results.gender, "Chưa có");
  const averagePrice = hasProducts
    ? Math.round(
        results.totalPrice / Math.max(results.products.length, 1) / 1000000,
      )
    : 0;
  const resultSidebarRef = useRef(null);
  const [productPanelHeight, setProductPanelHeight] = useState(null);

  useEffect(() => {
    const sidebar = resultSidebarRef.current;
    if (!sidebar) return undefined;

    const updateProductPanelHeight = () => {
      const isStackedLayout = window.matchMedia("(max-width: 1024px)").matches;

      if (isStackedLayout) {
        setProductPanelHeight(null);
        return;
      }

      const nextHeight = Math.ceil(sidebar.getBoundingClientRect().height);
      setProductPanelHeight((currentHeight) =>
        currentHeight === nextHeight ? currentHeight : nextHeight,
      );
    };

    updateProductPanelHeight();

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateProductPanelHeight)
        : null;

    resizeObserver?.observe(sidebar);
    window.addEventListener("resize", updateProductPanelHeight);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateProductPanelHeight);
    };
  }, [results]);

  const productPanelStyle = productPanelHeight
    ? { height: `${productPanelHeight}px` }
    : undefined;

  return (
    <div className={styles.resultsContainer}>
      <section className={styles.resultHero}>
        <div className={styles.resultHeroOverlay} />
        <div className={styles.resultHeroContent}>
          <div className={styles.resultHeroMain}>
            <div className={styles.summaryBadge}>
              <Sparkles size={16} />
              <span>{hasProducts ? "AI hoàn tất" : "Yêu cầu đã được tạo"}</span>
            </div>

            <h2 className={styles.resultHeroTitle}>
              {hasProducts
                ? "Thiết kế hoàn tất"
                : "Yêu cầu thiết kế đã được tạo"}
            </h2>

            <p className={styles.resultHeroText}>
              {hasProducts
                ? `AI đã phân tích và chọn ${results.products.length} sản phẩm phù hợp cho không gian ${roomTypeLabel || "bạn đã chọn"}.`
                : results.requestMeta?.message ||
                  "Hệ thống đã nhận yêu cầu, nhưng chưa trả danh sách sản phẩm ngay."}
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
              {hasProducts ? "Tổng giá trị dự kiến" : "Trạng thái yêu cầu"}
            </span>
            <strong>
              {hasProducts
                ? formatPrice(results.totalPrice)
                : requestStatusLabel}
            </strong>
            {hasProducts && <small>~{averagePrice}M / sản phẩm</small>}
          </div>
        </div>
      </section>

      <div className={styles.resultColumns}>
        <aside className={styles.resultSidebar} ref={resultSidebarRef}>
          {!!results.roomAnalysis?.reasoning && (
            <div
              className={`${styles.resultInfoCard} ${styles.resultReviewCard}`}
            >
              <h3 className={styles.resultCardTitle}>
                <span className={styles.resultCardIconGreen}>
                  <Sparkles size={16} />
                </span>
                <span>Đánh giá AI</span>
              </h3>
              <div className={styles.resultReviewContent}>
                <p>{results.roomAnalysis.reasoning}</p>
              </div>
            </div>
          )}

          {!!results.reasoningDetails &&
            Object.keys(results.reasoningDetails).length > 0 && (
              <div className={styles.resultInfoCard}>
                <h3 className={styles.resultCardTitle}>
                  <span className={styles.resultCardIconGreen}>
                    <Sparkles size={16} />
                  </span>
                  <span>Chi tiết đánh giá</span>
                </h3>
                <div className={styles.analysisGrid}>
                  {results.reasoningDetails.styleJustification && (
                    <div className={styles.analysisItem}>
                      <span>Phong cách</span>
                      <p>{results.reasoningDetails.styleJustification}</p>
                    </div>
                  )}
                  {results.reasoningDetails.colorJustification && (
                    <div className={styles.analysisItem}>
                      <span>Màu sắc</span>
                      <p>{results.reasoningDetails.colorJustification}</p>
                    </div>
                  )}
                  {results.reasoningDetails.densityJustification && (
                    <div className={styles.analysisItem}>
                      <span>Mật độ nội thất</span>
                      <p>{results.reasoningDetails.densityJustification}</p>
                    </div>
                  )}
                  {results.reasoningDetails.userProfileNote && (
                    <div className={styles.analysisItem}>
                      <span>Cá nhân hóa</span>
                      <p>{results.reasoningDetails.userProfileNote}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          {!!results.imageUrl && (
            <div className={styles.resultInfoCard}>
              <h3 className={styles.resultCardTitle}>Ảnh thiết kế</h3>
              <img
                src={results.imageUrl}
                alt="Kết quả thiết kế AI"
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
                <span>Loại phòng</span>
                <strong>{roomTypeLabel}</strong>
              </div>
              <div className={styles.analysisItem}>
                <span>Phong cách</span>
                <strong>{styleLabel}</strong>
              </div>
              <div className={styles.analysisItem}>
                <span>Mật độ nội thất</span>
                <strong>{densityLabel}</strong>
              </div>
              <div className={styles.analysisItem}>
                <span>Giới tính</span>
                <strong>{genderLabel}</strong>
              </div>
            </div>
          </div>

          {!hasProducts && (
            <div className={styles.resultInfoCard}>
              <h3 className={styles.resultCardTitle}>Thông tin</h3>
              <div className={styles.analysisGrid}>
                <div className={styles.analysisItem}>
                  <span>Mã yêu cầu</span>
                  <strong>{results.requestMeta?.id || "Chưa có"}</strong>
                </div>
                <div className={styles.analysisItem}>
                  <span>Trạng thái</span>
                  <strong>{requestStatusLabel}</strong>
                </div>
              </div>
            </div>
          )}
        </aside>

        <section
          className={styles.resultProductSection}
          style={productPanelStyle}
        >
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
                      {product.aiScore || 0}% phù hợp
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

                      {product.styles?.length > 0 && (
                        <small>
                          Phong cách:{" "}
                          {product.styles
                            .map((style) => getAiStyleLabel(style))
                            .join(", ")}
                        </small>
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
                  Yêu cầu đã được tạo thành công. Khi hệ thống xử lý xong và trả
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
              onClick={onCreate3D}
              type="button"
            >
              <Eye size={18} />
              <span>Tạo không gian 3D</span>
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
            <button
              className={styles.resultActionGhost}
              onClick={onView3DHistory}
              type="button"
            >
              <History size={18} />
              <span>Xem lại lịch sử 3D</span>
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
