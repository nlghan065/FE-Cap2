import { Loader2, Wand2 } from "lucide-react";
import styles from "../../../styles/AIDesigner.module.css";
import {
  AI_DENSITY_OPTIONS,
  AI_GENDER_OPTIONS,
  AI_ROOM_TYPES,
  AI_STYLE_OPTIONS,
} from "../../../data/aiDesignerData";

function AIDesignerConfigStep({
  uploadedImage,
  formData,
  onChange,
  onDimensionChange,
  onGenerate,
  loading,
}) {
  const isDisabled =
    loading ||
    !formData.roomType ||
    !formData.style ||
    !formData.furnitureDensity ||
    !formData.gender ||
    !String(formData.age).trim() ||
    !String(formData.dimensions.width).trim() ||
    !String(formData.dimensions.length).trim() ||
    !String(formData.dimensions.height).trim();

  return (
    <div className={styles.configLayout}>
      <div className={styles.previewPanel}>
        <div className={styles.stepHeading}>
          <span>02</span>
          <h2>Xác nhận đầu vào</h2>
          <p>Kiểm tra ảnh upload và chọn hướng thiết kế trước khi AI xử lý.</p>
        </div>

        <div className={styles.previewCard}>
          <img src={uploadedImage} alt="Uploaded room" />
        </div>
      </div>

      <div className={styles.formPanel}>
        <div className={styles.formSection}>
          <h3>Thông tin request</h3>

          <div className={styles.inputGrid}>
            <label className={styles.inputField}>
              <span>Room type</span>
              <select
                value={formData.roomType}
                onChange={(event) => onChange("roomType", event.target.value)}
              >
                <option value="">Chọn loại phòng</option>
                {AI_ROOM_TYPES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.inputField}>
              <span>Style</span>
              <select
                value={formData.style}
                onChange={(event) => onChange("style", event.target.value)}
              >
                <option value="">Chọn phong cách</option>
                {AI_STYLE_OPTIONS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.inputField}>
              <span>Furniture density</span>
              <select
                value={formData.furnitureDensity}
                onChange={(event) =>
                  onChange("furnitureDensity", event.target.value)
                }
              >
                <option value="">Chọn mật độ nội thất</option>
                {AI_DENSITY_OPTIONS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.inputField}>
              <span>Gender</span>
              <select
                value={formData.gender}
                onChange={(event) => onChange("gender", event.target.value)}
              >
                <option value="">Chọn giới tính</option>
                {AI_GENDER_OPTIONS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className={styles.formSection}>
          <h3>Kích thước phòng và độ tuổi</h3>

          <div className={styles.inputGrid}>
            <label className={styles.inputField}>
              <span>Width (m)</span>
              <input
                min="1"
                step="0.1"
                type="number"
                value={formData.dimensions.width}
                onChange={(event) =>
                  onDimensionChange("width", event.target.value)
                }
              />
            </label>

            <label className={styles.inputField}>
              <span>Length (m)</span>
              <input
                min="1"
                step="0.1"
                type="number"
                value={formData.dimensions.length}
                onChange={(event) =>
                  onDimensionChange("length", event.target.value)
                }
              />
            </label>

            <label className={styles.inputField}>
              <span>Height (m)</span>
              <input
                min="1"
                step="0.1"
                type="number"
                value={formData.dimensions.height}
                onChange={(event) =>
                  onDimensionChange("height", event.target.value)
                }
              />
            </label>

            <label className={styles.inputField}>
              <span>Age</span>
              <input
                min="1"
                step="1"
                type="number"
                value={formData.age}
                onChange={(event) => onChange("age", event.target.value)}
              />
            </label>
          </div>
        </div>

        <button
          className={styles.generateButton}
          onClick={onGenerate}
          type="button"
          disabled={isDisabled}
        >
          {loading ? (
            <Loader2 size={18} className={styles.spinningIcon} />
          ) : (
            <Wand2 size={18} />
          )}
          <span>{loading ? "Đang tạo..." : "AI Generate Design"}</span>
        </button>
      </div>
    </div>
  );
}

export default AIDesignerConfigStep;
