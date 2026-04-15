import { Image as ImageIcon, Upload } from "lucide-react";
import styles from "../../../styles/AIDesigner.module.css";

function AIDesignerUploadStep({ onDrop, onDragOver, onUploadChange }) {
  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeading}>
        <span>01</span>
        <h2>Upload ảnh căn phòng</h2>
        <p>
          Tải ảnh thật từ máy để backend AI phân tích và trả về gợi ý nội thất.
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
    </div>
  );
}

export default AIDesignerUploadStep;
