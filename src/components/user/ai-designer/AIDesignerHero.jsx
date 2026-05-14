import { Sparkles } from "lucide-react";
import styles from "../../../styles/AIDesigner.module.css";

function AIDesignerHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroBadge}>
          <Sparkles size={16} />
          <span>Xưởng thiết kế AI</span>
        </div>
        <h1>Thiết kế nội thất bằng AI</h1>
        <p>
          Tải ảnh căn phòng, chọn phong cách và để AI dựng nhanh một phương án
          bố trí sản phẩm rõ ràng, dễ mua và dễ mở rộng sang 3D.
        </p>
      </div>
    </section>
  );
}

export default AIDesignerHero;
