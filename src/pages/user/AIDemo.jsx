import { useState } from "react";
import { Image as ImageIcon, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AIDesignerConfigStep from "../../components/user/ai-designer/AIDesignerConfigStep";
import AIDesignerHero from "../../components/user/ai-designer/AIDesignerHero";
import AIDesignerProcessingStep from "../../components/user/ai-designer/AIDesignerProcessingStep";
import AIDesignerProgress from "../../components/user/ai-designer/AIDesignerProgress";
import AIDesignerResultsPanel from "../../components/user/ai-designer/AIDesignerResultsPanel";
import styles from "../../styles/AIDesigner.module.css";

const DIMENSION_LIMITS = {
  width: { min: 2, max: 10 },
  length: { min: 2, max: 12 },
  height: { min: 2, max: 4 },
};

const AGE_LIMITS = { min: 1, max: 120 };

const INITIAL_FORM_DATA = {
  roomType: "",
  dimensions: {
    width: "",
    length: "",
    height: "",
  },
  style: "",
  furnitureDensity: "",
  gender: "",
  age: "",
};

const SAMPLE_ROOMS = [
  {
    id: "sample-living",
    title: "Phòng khách mẫu",
    roomType: "Living Room",
    image:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
    dimensions: { width: "4.8", length: "5.8", height: "3" },
  },
  {
    id: "sample-bedroom",
    title: "Phòng ngủ mẫu",
    roomType: "Bedroom",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    dimensions: { width: "4.2", length: "5.2", height: "2.9" },
  },
];

const DEMO_STYLE_PRESETS = {
  Modern: {
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    products: [
      {
        id: "demo-modern-1",
        name: "Sofa góc chữ L màu be",
        category: "Sofa",
        price: 18900000,
        aiScore: 96,
        image:
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
        dimensions: { width: 260, depth: 160, height: 84 },
        reason: "Tạo khu tiếp khách rõ ràng và cân đối với phòng khách hiện đại.",
      },
      {
        id: "demo-modern-2",
        name: "Bàn trà gỗ sáng",
        category: "Bàn nước",
        price: 4290000,
        aiScore: 92,
        image:
          "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=900&q=80",
        dimensions: { width: 120, depth: 60, height: 42 },
        reason: "Giữ trung tâm bố cục gọn và đủ khoảng di chuyển.",
      },
      {
        id: "demo-modern-3",
        name: "Đèn thả tuyến tính",
        category: "Đèn trang trí",
        price: 3590000,
        aiScore: 88,
        image:
          "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80",
        dimensions: { width: 110, depth: 20, height: 35 },
        reason: "Tăng điểm nhấn ánh sáng mà không làm phòng bị nặng.",
      },
      {
        id: "demo-modern-4",
        name: "Kệ TV tối giản",
        category: "Tủ tivi",
        price: 6490000,
        aiScore: 90,
        image:
          "https://images.unsplash.com/photo-1519947486511-46149fa0a254?auto=format&fit=crop&w=900&q=80",
        dimensions: { width: 180, depth: 42, height: 55 },
        reason: "Phù hợp mặt tường chính và dễ nối sang trải nghiệm 3D.",
      },
    ],
  },
  Scandinavian: {
    image:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
    products: [
      {
        id: "demo-scandi-1",
        name: "Sofa vải sáng chân gỗ",
        category: "Sofa",
        price: 17200000,
        aiScore: 95,
        image:
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
        dimensions: { width: 230, depth: 95, height: 86 },
        reason: "Tạo cảm giác sáng và mềm hơn cho không gian sinh hoạt.",
      },
      {
        id: "demo-scandi-2",
        name: "Bàn trà oval Bắc Âu",
        category: "Bàn nước",
        price: 3980000,
        aiScore: 91,
        image:
          "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=900&q=80",
        dimensions: { width: 118, depth: 62, height: 40 },
        reason: "Đường cong giúp bố cục đỡ cứng và phù hợp tông Bắc Âu.",
      },
      {
        id: "demo-scandi-3",
        name: "Đèn đứng thân gỗ",
        category: "Đèn trang trí",
        price: 2890000,
        aiScore: 87,
        image:
          "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80",
        dimensions: { width: 38, depth: 38, height: 160 },
        reason: "Thêm ánh sáng mềm ở góc phòng mà không lấn không gian.",
      },
      {
        id: "demo-scandi-4",
        name: "Kệ mở màu kem",
        category: "Kệ trang trí",
        price: 5120000,
        aiScore: 89,
        image:
          "https://images.unsplash.com/photo-1519947486511-46149fa0a254?auto=format&fit=crop&w=900&q=80",
        dimensions: { width: 140, depth: 36, height: 180 },
        reason: "Giữ tổng thể nhẹ và có thêm không gian decor nhỏ.",
      },
    ],
  },
  Minimal: {
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    products: [
      {
        id: "demo-minimal-1",
        name: "Sofa 2 chỗ khối vuông",
        category: "Sofa",
        price: 15400000,
        aiScore: 94,
        image:
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
        dimensions: { width: 210, depth: 92, height: 82 },
        reason: "Giữ trục nhìn thoáng và hợp ngôn ngữ tối giản.",
      },
      {
        id: "demo-minimal-2",
        name: "Bàn trà thấp đen nhám",
        category: "Bàn nước",
        price: 3690000,
        aiScore: 90,
        image:
          "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=900&q=80",
        dimensions: { width: 110, depth: 55, height: 36 },
        reason: "Giữ khối thấp để phòng trông rộng và sạch hơn.",
      },
      {
        id: "demo-minimal-3",
        name: "Đèn cây mảnh",
        category: "Đèn trang trí",
        price: 2490000,
        aiScore: 85,
        image:
          "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80",
        dimensions: { width: 30, depth: 30, height: 155 },
        reason: "Đủ công năng chiếu sáng nhưng không làm rối hình khối.",
      },
      {
        id: "demo-minimal-4",
        name: "Kệ TV âm thấp",
        category: "Tủ tivi",
        price: 5980000,
        aiScore: 88,
        image:
          "https://images.unsplash.com/photo-1519947486511-46149fa0a254?auto=format&fit=crop&w=900&q=80",
        dimensions: { width: 170, depth: 40, height: 48 },
        reason: "Đồng bộ với sofa thấp và giúp mặt tường chính gọn hơn.",
      },
    ],
  },
};

const normalizeNumericInput = (value, { allowDecimal = true } = {}) => {
  const normalized = String(value ?? "").replace(",", ".");

  if (!normalized.trim()) {
    return "";
  }

  const pattern = allowDecimal ? /^\d*\.?\d*$/ : /^\d*$/;
  if (!pattern.test(normalized)) {
    return null;
  }

  return normalized;
};

const clampNumericInput = (
  value,
  { min, max, allowDecimal = true, decimals = 1 },
) => {
  const normalized = normalizeNumericInput(value, { allowDecimal });

  if (normalized === null || normalized === "") {
    return normalized === null ? "" : normalized;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    return "";
  }

  const clamped = Math.min(max, Math.max(min, parsed));

  if (!allowDecimal) {
    return String(Math.round(clamped));
  }

  return String(Number(clamped.toFixed(decimals)));
};

function AIDemo() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const handleApplyImage = (image, sampleMeta = null) => {
    setUploadedImage(image);
    setAiResults(null);
    setFormData((prev) => ({
      ...prev,
      roomType: sampleMeta?.roomType || prev.roomType,
      dimensions: sampleMeta?.dimensions || prev.dimensions,
    }));
    setStep(2);
  };

  const handleUploadChange = (event) => {
    const file = event.target.files?.[0];

    if (!file || !file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh hợp lệ.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        handleApplyImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];

    if (!file || !file.type.startsWith("image/")) {
      toast.error("Vui lòng thả file ảnh hợp lệ.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        handleApplyImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (field, value) => {
    if (field === "age") {
      const normalized = normalizeNumericInput(value, { allowDecimal: false });
      if (normalized === null) return;

      setFormData((prev) => ({ ...prev, [field]: normalized }));
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDimensionChange = (field, value) => {
    const normalized = normalizeNumericInput(value, { allowDecimal: true });
    if (normalized === null) return;

    setFormData((prev) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [field]: normalized,
      },
    }));
  };

  const handleDimensionBlur = (field) => {
    const limits = DIMENSION_LIMITS[field];
    if (!limits) return;

    setFormData((prev) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [field]: clampNumericInput(prev.dimensions[field], {
          ...limits,
          allowDecimal: true,
          decimals: 1,
        }),
      },
    }));
  };

  const handleAgeBlur = () => {
    setFormData((prev) => ({
      ...prev,
      age: clampNumericInput(prev.age, {
        ...AGE_LIMITS,
        allowDecimal: false,
      }),
    }));
  };

  const buildDemoResults = () => {
    const preset = DEMO_STYLE_PRESETS[formData.style] || DEMO_STYLE_PRESETS.Modern;
    const products = preset.products.map((item) => ({
      ...item,
      imageUrl: item.image,
    }));
    const totalPrice = products.reduce(
      (sum, item) => sum + (Number(item.price) || 0),
      0,
    );

    return {
      roomType: formData.roomType,
      style: formData.style,
      furnitureDensity: formData.furnitureDensity,
      gender: formData.gender,
      age: formData.age,
      imageUrl: preset.image,
      totalPrice,
      requestMeta: {
        status: "COMPLETED",
        id: "demo-request-ai",
      },
      roomAnalysis: {
        width: Number(formData.dimensions.width) || 0,
        length: Number(formData.dimensions.length) || 0,
        height: Number(formData.dimensions.height) || 0,
      },
      products,
    };
  };

  const handleGenerate = () => {
    if (
      !formData.roomType ||
      !formData.style ||
      !formData.furnitureDensity ||
      !formData.gender ||
      !String(formData.age).trim() ||
      !String(formData.dimensions.width).trim() ||
      !String(formData.dimensions.length).trim() ||
      !String(formData.dimensions.height).trim()
    ) {
      toast.error("Hãy nhập đầy đủ thông tin trước khi tạo demo.");
      return;
    }

    setIsProcessing(true);
    setStep(3);

    window.setTimeout(() => {
      setAiResults(buildDemoResults());
      setIsProcessing(false);
      setStep(4);
      toast.success("Đã tạo AI demo sample.");
    }, 900);
  };

  const handleReset = () => {
    setStep(1);
    setUploadedImage(null);
    setAiResults(null);
    setIsProcessing(false);
    setFormData(INITIAL_FORM_DATA);
  };

  const handleView3D = () => {
    navigate("/viewer-demo", {
      state: {
        demoResult: aiResults,
      },
    });
  };

  const handleAddAllToCart = () => {
    toast.error("Vui lòng đăng nhập để thêm thiết kế AI vào giỏ hàng.");
  };

  const handleViewProduct = () => {
    toast("Đây là sản phẩm mẫu trong AI demo.");
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(price) || 0);

  return (
    <div className={styles.page} data-page-theme="ai">
      <AIDesignerHero />
      <AIDesignerProgress step={step} />

      <div className={styles.content}>
        {step === 1 && (
          <div className={styles.stepContainer}>
            <div className={styles.stepHeading}>
              <span>01</span>
              <h2>Tải ảnh căn phòng</h2>
              <p>
                Demo dùng cùng bố cục với AI Designer thật: upload ảnh trước, cấu
                hình sau và xem kết quả theo đúng flow.
              </p>
            </div>

            <div
              className={styles.uploadCard}
              onDrop={handleDrop}
              onDragOver={(event) => event.preventDefault()}
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
                  onChange={handleUploadChange}
                />
                <span className={styles.primaryButton}>
                  <Upload size={18} />
                  <span>Chọn ảnh</span>
                </span>
              </label>
            </div>

            <div className={styles.stepHeading}>
              <h2>Phòng mẫu demo</h2>
              <p>Chọn nhanh một ảnh mẫu nếu bạn chỉ muốn xem flow demo.</p>
            </div>

            <div className={styles.sampleGrid}>
              {SAMPLE_ROOMS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  className={styles.sampleCard}
                  onClick={() =>
                    handleApplyImage(sample.image, {
                      roomType: sample.roomType,
                      dimensions: sample.dimensions,
                    })
                  }
                >
                  <img src={sample.image} alt={sample.title} />
                  <span>{sample.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && uploadedImage && (
          <AIDesignerConfigStep
            formData={formData}
            loading={isProcessing}
            onBackToUpload={() => {
              setStep(1);
              setUploadedImage(null);
            }}
            onChange={handleChange}
            onDimensionBlur={handleDimensionBlur}
            onDimensionChange={handleDimensionChange}
            onFieldBlur={handleAgeBlur}
            onGenerate={handleGenerate}
            profileLoading={false}
            uploadedImage={uploadedImage}
            userDemographics={{ gender: "", age: "" }}
          />
        )}

        {step === 3 && isProcessing && <AIDesignerProcessingStep />}

        {step === 4 && aiResults && (
          <AIDesignerResultsPanel
            formatPrice={formatPrice}
            onAddAllToCart={handleAddAllToCart}
            onReset={handleReset}
            onView3D={handleView3D}
            onViewProduct={handleViewProduct}
            results={aiResults}
          />
        )}
      </div>
    </div>
  );
}

export default AIDemo;
