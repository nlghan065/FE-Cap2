import { History, Image as ImageIcon, Upload } from "lucide-react";
import styles from "../../../styles/AIDesigner.module.css";

function AIDesignerUploadStep({
  onDrop,
  onDragOver,
  onUploadChange,
  historyItems = [],
  historyLoading = false,
  onSelectHistory,
  formatHistoryDate,
}) {
  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeading}>
        <span>01</span>
        <h2>Tải ảnh căn phòng</h2>
        <p>
          Tải ảnh thật từ máy để hệ thống AI phân tích và trả về gợi ý nội thất.
        </p>
      </div>

      <div
        className={styles.uploadCard}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <label className={styles.uploadLabel}>
          <div className={styles.uploadIcon}>
            <ImageIcon size={34} />
          </div>
          <strong>Kéo thả ảnh vào đây</strong>
          <span>Hoặc bấm để chọn file từ máy của bạn.</span>
          <input
            className={styles.hiddenInput}
            type="file"
            accept="image/*"
            onChange={onUploadChange}
          />
          <span className={styles.primaryButton}>
            <Upload size={18} />
            <span>Chọn ảnh</span>
          </span>
        </label>
      </div>

      <div className={styles.historySection}>
        <div className={styles.historyHeader}>
          <div>
            <h3>Lịch sử thiết kế</h3>
            <p>Xem lại các yêu cầu AI gần đây của bạn.</p>
          </div>
          <span className={styles.historyBadge}>
            <History size={15} />
            <span>{historyItems.length}</span>
          </span>
        </div>

        {historyLoading ? (
          <p className={styles.historyState}>Đang tải lịch sử thiết kế...</p>
        ) : historyItems.length > 0 ? (
          <div className={styles.sampleGrid}>
            {historyItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`${styles.sampleCard} ${styles.historyCard}`}
                onClick={() => onSelectHistory?.(item)}
              >
                {item.previewImage ? (
                  <img src={item.previewImage} alt={item.title} />
                ) : (
                  <div className={styles.historyCardFallback}>
                    <ImageIcon size={28} />
                  </div>
                )}
                <div className={styles.historyCardBody}>
                  <strong>{item.title}</strong>
                  <span>{item.subtitle}</span>
                  <small>
                    {item.statusLabel}
                    {item.createdAt
                      ? ` • ${formatHistoryDate?.(item.createdAt) || ""}`
                      : ""}
                  </small>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className={styles.historyState}>Bạn chưa có lịch sử thiết kế.</p>
        )}
      </div>
    </div>
  );
}

export default AIDesignerUploadStep;
