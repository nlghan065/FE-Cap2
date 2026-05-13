import { ArrowLeft, Loader2, Wand2 } from "lucide-react";
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
  onDimensionBlur,
  onFieldBlur,
  onBackToUpload,
  onGenerate,
  loading,
  profileLoading,
  userDemographics,
}) {
  const dimensionRules = {
    width: {
      label: "Chiều rộng phòng",
      min: 2,
      max: 10,
      helper: "Nhập chiều rộng trong khoảng 2m - 10m.",
    },
    length: {
      label: "Chiều dài phòng",
      min: 2,
      max: 12,
      helper: "Nhập chiều dài trong khoảng 2m - 12m.",
    },
    height: {
      label: "Chiều cao phòng",
      min: 2,
      max: 4,
      helper: "Nhập chiều cao trong khoảng 2m - 4m.",
    },
  };
  const ageRule = {
    min: 1,
    max: 120,
    helper: "Nhập độ tuổi trong khoảng 1 - 120.",
  };

  const getNumericValue = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const getDimensionHint = (field) => {
    const rule = dimensionRules[field];
    const value = formData.dimensions[field];

    if (!String(value).trim()) {
      return {
        text: rule.helper,
        invalid: false,
      };
    }

    const numericValue = getNumericValue(value);
    if (numericValue === null) {
      return {
        text: `${rule.label} phải là số hợp lệ từ ${rule.min}m - ${rule.max}m.`,
        invalid: true,
      };
    }

    if (numericValue < rule.min) {
      return {
        text: `${rule.label} tối thiểu ${rule.min}m.`,
        invalid: true,
      };
    }

    if (numericValue > rule.max) {
      return {
        text: `${rule.label} tối đa ${rule.max}m.`,
        invalid: true,
      };
    }

    return {
      text: `Hợp lệ: ${rule.min}m - ${rule.max}m.`,
      invalid: false,
    };
  };

  const getAgeHint = () => {
    if (!String(formData.age).trim()) {
      return {
        text: ageRule.helper,
        invalid: false,
      };
    }

    const numericValue = getNumericValue(formData.age);
    if (numericValue === null) {
      return {
        text: `Độ tuổi phải là số hợp lệ từ ${ageRule.min} - ${ageRule.max}.`,
        invalid: true,
      };
    }

    if (numericValue < ageRule.min || numericValue > ageRule.max) {
      return {
        text: `Độ tuổi phải từ ${ageRule.min} - ${ageRule.max}.`,
        invalid: true,
      };
    }

    return {
      text: `Hợp lệ: ${ageRule.min} - ${ageRule.max} tuổi.`,
      invalid: false,
    };
  };

  const widthHint = getDimensionHint("width");
  const lengthHint = getDimensionHint("length");
  const heightHint = getDimensionHint("height");
  const ageHint = getAgeHint();
  const isDisabled =
    loading ||
    !formData.roomType ||
    !formData.style ||
    !formData.furnitureDensity ||
    !formData.gender ||
    !String(formData.age).trim() ||
    !String(formData.dimensions.width).trim() ||
    !String(formData.dimensions.length).trim() ||
    !String(formData.dimensions.height).trim() ||
    widthHint.invalid ||
    lengthHint.invalid ||
    heightHint.invalid ||
    ageHint.invalid;

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

        <button
          type="button"
          className={styles.previewBackButton}
          onClick={onBackToUpload}
        >
          <ArrowLeft size={16} />
          <span>Chọn lại ảnh</span>
        </button>
      </div>

      <div className={styles.formPanel}>
        <div className={styles.formSection}>
          <h3>Thông tin </h3>
          <p className={styles.profileNotice}>
            {profileLoading
              ? "Đang lấy giới tính và độ tuổi từ hồ sơ người dùng..."
              : userDemographics?.gender || userDemographics?.age
                ? "Giới tính và độ tuổi đã được tự động lấy từ hồ sơ người dùng. Bạn vẫn có thể chỉnh lại trước khi gửi AI."
                : "Chưa có dữ liệu giới tính/độ tuổi trong hồ sơ, hãy nhập thủ công để AI tối ưu gợi ý."}
          </p>

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
              <span>Chiều rộng phòng (m)</span>
              <input
                min="2"
                max="10"
                step="0.1"
                type="number"
                value={formData.dimensions.width}
                aria-invalid={widthHint.invalid}
                onChange={(event) =>
                  onDimensionChange("width", event.target.value)
                }
                onBlur={() => onDimensionBlur?.("width")}
              />
              <small
                className={`${styles.inputHint} ${widthHint.invalid ? styles.inputHintError : ""}`}
              >
                {widthHint.text}
              </small>
            </label>

            <label className={styles.inputField}>
              <span>Chiều dài phòng (m)</span>
              <input
                min="2"
                max="12"
                step="0.1"
                type="number"
                value={formData.dimensions.length}
                aria-invalid={lengthHint.invalid}
                onChange={(event) =>
                  onDimensionChange("length", event.target.value)
                }
                onBlur={() => onDimensionBlur?.("length")}
              />
              <small
                className={`${styles.inputHint} ${lengthHint.invalid ? styles.inputHintError : ""}`}
              >
                {lengthHint.text}
              </small>
            </label>

            <label className={styles.inputField}>
              <span>Chiều cao phòng (m)</span>
              <input
                min="2"
                max="4"
                step="0.1"
                type="number"
                value={formData.dimensions.height}
                aria-invalid={heightHint.invalid}
                onChange={(event) =>
                  onDimensionChange("height", event.target.value)
                }
                onBlur={() => onDimensionBlur?.("height")}
              />
              <small
                className={`${styles.inputHint} ${heightHint.invalid ? styles.inputHintError : ""}`}
              >
                {heightHint.text}
              </small>
            </label>

            <label className={styles.inputField}>
              <span>Độ tuổi</span>
              <input
                min="1"
                max="120"
                step="1"
                type="number"
                value={formData.age}
                aria-invalid={ageHint.invalid}
                onChange={(event) => onChange("age", event.target.value)}
                onBlur={() => onFieldBlur?.("age")}
              />
              <small
                className={`${styles.inputHint} ${ageHint.invalid ? styles.inputHintError : ""}`}
              >
                {ageHint.text}
              </small>
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
