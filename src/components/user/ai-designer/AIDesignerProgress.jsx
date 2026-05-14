import { Check, Settings, Upload, Wand2 } from "lucide-react";
import styles from "../../../styles/AIDesigner.module.css";

const STEPS = [
  { id: 1, title: "Tải ảnh", icon: Upload },
  { id: 2, title: "Cấu hình", icon: Settings },
  { id: 3, title: "AI xử lý", icon: Wand2 },
  { id: 4, title: "Kết quả", icon: Check },
];

function AIDesignerProgress({ step }) {
  return (
    <div className={styles.progressShell}>
      <div className={styles.progressBar}>
        {STEPS.map((item, index) => {
          const Icon = item.icon;
          const isActive = step >= item.id;
          const isPassed = step > item.id;

          return (
            <div className={styles.progressItemWrap} key={item.id}>
              <div className={styles.progressItem}>
                <div
                  className={`${styles.progressCircle} ${
                    isActive ? styles.progressCircleActive : ""
                  }`}
                >
                  <Icon size={18} />
                </div>
                <span
                  className={`${styles.progressLabel} ${
                    isActive ? styles.progressLabelActive : ""
                  }`}
                >
                  {item.title}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`${styles.progressLine} ${
                    isPassed ? styles.progressLineActive : ""
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AIDesignerProgress;
