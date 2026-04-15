import { Loader2, Wand2 } from "lucide-react";
import styles from "../../../styles/AIDesigner.module.css";

function AIDesignerProcessingStep() {
  return (
    <div className={styles.processingCard}>
      <div className={styles.processingIcon}>
        <Loader2 className={styles.spin} size={34} />
      </div>
      <h2>AI đang phân tích không gian</h2>
      <p>
        Hệ thống đang đọc bố cục phòng, ánh sáng, mật độ nội thất và dựng đề
        xuất sản phẩm phù hợp.
      </p>
      <div className={styles.processingList}>
        <div>
          <Wand2 size={16} />
          <span>Phân tích ảnh phòng</span>
        </div>
        <div>
          <Wand2 size={16} />
          <span>Chọn nhóm sản phẩm phù hợp</span>
        </div>
        <div>
          <Wand2 size={16} />
          <span>Tối ưu bố cục và ngân sách</span>
        </div>
      </div>
    </div>
  );
}

export default AIDesignerProcessingStep;
