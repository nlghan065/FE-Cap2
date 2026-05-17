import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  getMyDesignRequestsApi,
  postAiRecommendApi,
} from "../../api/aiRecommendApi";
import { getUserByIdApi } from "../../api/authApi";
import { getMyProjects3DApi } from "../../api/projects3dApi";
import { getProfileApi } from "../../api/profileApi";
import AIDesignerConfigStep from "../../components/user/ai-designer/AIDesignerConfigStep";
import AIDesignerHero from "../../components/user/ai-designer/AIDesignerHero";
import AIDesignerProcessingStep from "../../components/user/ai-designer/AIDesignerProcessingStep";
import AIDesignerProgress from "../../components/user/ai-designer/AIDesignerProgress";
import AIDesignerResultsPanel from "../../components/user/ai-designer/AIDesignerResultsPanel";
import AIDesignerUploadStep from "../../components/user/ai-designer/AIDesignerUploadStep";
import {
  getAiDensityLabel,
  getAiRequestStatusLabel,
  getAiRoomTypeLabel,
  getAiStyleLabel,
} from "../../data/aiDesignerData";
import styles from "../../styles/AIDesigner.module.css";
import { normalizeAiRecommendResult } from "../../utils/aiRecommendResultV2";
import { getErrorMessage } from "../../utils/errorMessage";

const STORAGE_KEY = "aiDesignerData";
const DIMENSION_LIMITS = {
  width: { min: 2, max: 10 },
  length: { min: 2, max: 12 },
  height: { min: 2, max: 4 },
};
const AGE_LIMITS = { min: 1, max: 120 };
const getAuthToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

const getCurrentUserId = () =>
  localStorage.getItem("userId") || sessionStorage.getItem("userId");

const normalizeProjectLinkId = (value) => String(value || "").trim();

const getAiDesignRequestId = (result) =>
  normalizeProjectLinkId(
    result?.id ||
      result?._id ||
      result?.requestId ||
      result?.designRequestId ||
      result?.requestMeta?.id,
  );

const getProject3DLinkId = (project) =>
  normalizeProjectLinkId(
    project?.id || project?._id || project?.projectId || project?.project3DId,
  );

const getProject3DDesignRequestId = (project) =>
  normalizeProjectLinkId(
    project?.designRequestId ||
      project?.sourceDesignRequestId ||
      project?.requestId ||
      project?.designRequest?.id,
  );

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

const calculateAge = (dateValue) => {
  if (!dateValue) return "";

  const birthDate = Array.isArray(dateValue)
    ? new Date(dateValue[0], Number(dateValue[1] || 1) - 1, dateValue[2] || 1)
    : new Date(dateValue);
  if (Number.isNaN(birthDate.getTime())) return "";

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age > 0 ? String(age) : "";
};

const _normalizeGender = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  if (["male", "nam", "m"].includes(normalized)) return "male";
  if (["female", "nu", "nữ", "f"].includes(normalized)) return "female";
  if (["other", "khac", "khác"].includes(normalized)) return "other";

  return "";
};

const getProfileAge = (profile) => {
  if (!profile) return "";

  const directAge = Number(profile.age);
  if (Number.isFinite(directAge) && directAge > 0) {
    return String(directAge);
  }

  return calculateAge(
    profile.dateOfBirth || profile.birthDate || profile.birthday || profile.dob,
  );
};

const normalizeProfileGender = (value) => {
  const normalized = String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (["male", "nam", "m"].includes(normalized)) return "male";
  if (["female", "nu", "f"].includes(normalized)) return "female";
  if (["other", "khac"].includes(normalized)) return "other";

  return "";
};

const getDemographicsFromProfile = (profile) => ({
  gender: normalizeProfileGender(profile?.gender || profile?.user?.gender),
  age:
    getProfileAge(profile) ||
    getProfileAge(profile?.user) ||
    calculateAge(profile?.user?.dateOfBirth || profile?.user?.birthDate),
});

const getHistoryStatusLabel = (status, hasProducts) => {
  if (!status && hasProducts) return getAiRequestStatusLabel('COMPLETED');
  return getAiRequestStatusLabel(status);
};

function AIDesignerPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [userDemographics, setUserDemographics] = useState({
    gender: "",
    age: "",
  });
  const [designHistory, setDesignHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [formData, setFormData] = useState({
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
  });

  const saveToStorage = useCallback((data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Save AI designer data to storage error:", error);
    }
  }, []);

  const loadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Load AI designer data from storage error:", error);
      return null;
    }
  }, []);

  const clearStorage = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Clear AI designer data from storage error:", error);
    }
  }, []);

  const formatHistoryDate = useCallback((value) => {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }, []);

  const mapHistoryItem = useCallback((payload, index) => {
    const normalized = normalizeAiRecommendResult(payload || {});
    const roomTypeLabel = getAiRoomTypeLabel(normalized.roomType);
    const styleLabel = getAiStyleLabel(normalized.style);
    const densityLabel = getAiDensityLabel(normalized.furnitureDensity);
    const previewImage =
      normalized.imageUrl ||
      normalized.products.find((item) => item.imageUrl || item.image)?.imageUrl ||
      normalized.products.find((item) => item.imageUrl || item.image)?.image ||
      "";
    const status =
      payload?.status || normalized.requestMeta?.status || "PENDING";
    const title =
      roomTypeLabel || styleLabel
        ? [roomTypeLabel, styleLabel].filter(Boolean).join(" • ")
        : `Yêu cầu thiết kế ${index + 1}`;
    const subtitleParts = [
      densityLabel || "",
      normalized.products.length
        ? `${normalized.products.length} sản phẩm`
        : "Chưa có sản phẩm",
    ].filter(Boolean);

    return {
      id: normalized.id || `design-history-${index + 1}`,
      title,
      subtitle: subtitleParts.join(" • "),
      previewImage,
      createdAt: normalized.createdAt || payload?.createdAt || null,
      status,
      statusLabel: getHistoryStatusLabel(status, normalized.products.length > 0),
      result: normalized,
    };
  }, []);

  const loadDesignHistory = useCallback(async () => {
    if (!getAuthToken()) {
      setDesignHistory([]);
      return;
    }

    setHistoryLoading(true);

    try {
      const response = await getMyDesignRequestsApi({
        page: 0,
        size: 10,
        sort: "createdAt,desc",
      });
      const historyItems = (response.content || []).map(mapHistoryItem);
      setDesignHistory(historyItems);
    } catch (error) {
      console.error("Load design request history error:", error);
      setDesignHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [mapHistoryItem]);

  const loadProfileDemographics = useCallback(async () => {
    const token = getAuthToken();

    if (!token) {
      setUserDemographics({ gender: "", age: "" });
      return { gender: "", age: "" };
    }

    setProfileLoading(true);

    try {
      const profile = await getProfileApi();
      let demographics = getDemographicsFromProfile(profile);

      if (!demographics.gender || !demographics.age) {
        const userId =
          profile?.userId ||
          profile?.user?.id ||
          profile?.user?._id ||
          getCurrentUserId();

        if (userId) {
          try {
            const user = await getUserByIdApi(userId);
            const userDemographics = getDemographicsFromProfile(user);

            demographics = {
              gender: demographics.gender || userDemographics.gender,
              age: demographics.age || userDemographics.age,
            };
          } catch (error) {
            console.error("Load AI designer user fallback data error:", error);
          }
        }
      }

      setUserDemographics(demographics);
      setFormData((prev) => ({
        ...prev,
        gender: prev.gender || demographics.gender,
        age: prev.age || demographics.age,
      }));

      return demographics;
    } catch (error) {
      console.error("Load AI designer profile data error:", error);
      return { gender: "", age: "" };
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedData = loadFromStorage();
    if (storedData) {
      setStep(storedData.step || 1);
      setUploadedImage(storedData.uploadedImage || null);
      setAiResults(storedData.aiResults || null);
      setFormData(
        storedData.formData || {
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
        },
      );
    }
    loadProfileDemographics();
    loadDesignHistory();
  }, [loadFromStorage, loadProfileDemographics, loadDesignHistory]);

  const applyImage = (fileOrUrl) => {
    setAiResults(null);

    if (typeof fileOrUrl === "string") {
      setUploadedImage(fileOrUrl);
      setUploadedFile(null);
      setStep(2);
      loadProfileDemographics();
      return;
    }

    setUploadedFile(fileOrUrl);

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setUploadedImage(reader.result);
        setStep(2);
        loadProfileDemographics();
      }
    };
    reader.readAsDataURL(fileOrUrl);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh hợp lệ.");
      return;
    }
    applyImage(file);
  };

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Vui lòng thả file ảnh hợp lệ.");
      return;
    }
    applyImage(file);
  }, []);

  const handleGenerateDesign = async () => {
    if (!uploadedFile) {
      toast("Hãy upload ảnh thật từ máy để dùng AI.");
      return;
    }

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
      toast.error("Hãy nhập đầy đủ thông tin.");
      return;
    }

    const w = Number(formData.dimensions.width);
    const l = Number(formData.dimensions.length);
    const h = Number(formData.dimensions.height);

    if (w < 2 || w > 10) {
      toast.error("Width phải từ 2–10m");
      return;
    }
    if (l < 2 || l > 12) {
      toast.error("Length phải từ 2–12m");
      return;
    }
    if (l < w) {
      toast.error(
        "Chiều dài phòng không được ngắn hơn chiều rộng.",
      );
      return;
    }
    if (h < 2 || h > 4) {
      toast.error("Height phải từ 2–4m");
      return;
    }
    const age = Number(formData.age);
    if (age < AGE_LIMITS.min || age > AGE_LIMITS.max) {
      toast.error("Độ tuổi phải từ 1–120");
      return;
    }

    setIsProcessing(true);
    setStep(3);

    try {
      const response = await postAiRecommendApi({
        imageFile: uploadedFile,
        roomType: formData.roomType,
        dimensions: formData.dimensions,
        style: formData.style,
        furnitureDensity: formData.furnitureDensity,
        gender: formData.gender,
        age: formData.age,
      });

      console.log("[AI Design FE] raw source response", response);

      const normalizedResult = normalizeAiRecommendResult({
        ...(response || {}),
        roomType: response?.roomType || formData.roomType,
        style: response?.style || formData.style,
        furnitureDensity:
          response?.furnitureDensity || formData.furnitureDensity,
        gender: response?.gender || formData.gender,
        dimensions: response?.dimensions || formData.dimensions,
      });

      console.log("[AI Design FE] normalized result", normalizedResult);

      setAiResults(normalizedResult);

      if (!normalizedResult.products.length) {
        toast(
          normalizedResult.requestMeta.message ||
            "Yêu cầu thiết kế đã được tạo, AI chưa trả danh sách sản phẩm ngay.",
        );
      }

      loadDesignHistory();
      setStep(4);
    } catch (error) {
      console.error("AI recommend error:", error);
      toast.error(getErrorMessage(error, "Không gọi được AI recommend."));
      setStep(2);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChange = (field, value) => {
    if (field === "age") {
      const normalized = normalizeNumericInput(value, { allowDecimal: false });
      if (normalized === null) return;

      setFormData((prev) => {
        const newFormData = { ...prev, [field]: normalized };
        saveToStorage({
          step,
          uploadedImage,
          aiResults,
          formData: newFormData,
        });
        return newFormData;
      });
      return;
    }

    setFormData((prev) => {
      const newFormData = { ...prev, [field]: value };
      saveToStorage({
        step,
        uploadedImage,
        aiResults,
        formData: newFormData,
      });
      return newFormData;
    });
  };

  const handleDimensionChange = (field, value) => {
    const normalized = normalizeNumericInput(value, { allowDecimal: true });
    if (normalized === null) return;

    setFormData((prev) => {
      const newFormData = {
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [field]: normalized,
        },
      };
      saveToStorage({
        step,
        uploadedImage,
        aiResults,
        formData: newFormData,
      });
      return newFormData;
    });
  };

  const handleDimensionBlur = (field) => {
    const limits = DIMENSION_LIMITS[field];
    if (!limits) return;

    setFormData((prev) => {
      const currentValue = prev.dimensions[field];
      const clampedValue = clampNumericInput(currentValue, {
        ...limits,
        allowDecimal: true,
        decimals: 1,
      });

      const newFormData = {
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [field]: clampedValue,
        },
      };

      saveToStorage({
        step,
        uploadedImage,
        aiResults,
        formData: newFormData,
      });

      return newFormData;
    });
  };

  const handleAgeBlur = () => {
    setFormData((prev) => {
      const clampedAge = clampNumericInput(prev.age, {
        ...AGE_LIMITS,
        allowDecimal: false,
      });
      const newFormData = {
        ...prev,
        age: clampedAge,
      };

      saveToStorage({
        step,
        uploadedImage,
        aiResults,
        formData: newFormData,
      });

      return newFormData;
    });
  };

  const handleReset = () => {
    setStep(1);
    setUploadedImage(null);
    setUploadedFile(null);
    setAiResults(null);
    setIsProcessing(false);
    setFormData({
      roomType: "",
      dimensions: {
        width: "",
        length: "",
        height: "",
      },
      style: "",
      furnitureDensity: "",
      gender: userDemographics.gender,
      age: userDemographics.age,
    });
    clearStorage();
  };

  const handleBackToUpload = () => {
    setStep(1);
    setUploadedImage(null);
    setUploadedFile(null);
    setAiResults(null);
    setIsProcessing(false);
    saveToStorage({
      step: 1,
      uploadedImage: null,
      aiResults: null,
      formData,
    });
  };

  const handleSelectHistory = (historyItem) => {
    const result = historyItem?.result;
    if (!result) return;

    const nextFormData = {
      ...formData,
      roomType: result.roomType || formData.roomType,
      style: result.style || formData.style,
      furnitureDensity: result.furnitureDensity || formData.furnitureDensity,
      gender: result.gender || formData.gender,
      dimensions: {
        width:
          result.roomAnalysis?.width !== undefined &&
          result.roomAnalysis?.width !== null
            ? String(result.roomAnalysis.width)
            : formData.dimensions.width,
        length:
          result.roomAnalysis?.length !== undefined &&
          result.roomAnalysis?.length !== null
            ? String(result.roomAnalysis.length)
            : formData.dimensions.length,
        height:
          result.roomAnalysis?.height !== undefined &&
          result.roomAnalysis?.height !== null
            ? String(result.roomAnalysis.height)
            : formData.dimensions.height,
      },
      age: result.age || formData.age,
    };

    setFormData(nextFormData);
    setUploadedImage(historyItem.previewImage || result.imageUrl || null);
    setUploadedFile(null);
    setAiResults(result);
    setStep(4);
    saveToStorage({
      step: 4,
      uploadedImage: historyItem.previewImage || result.imageUrl || null,
      aiResults: result,
      formData: nextFormData,
    });
  };

  const findLatestProject3DIdByRequest = useCallback(async (requestId) => {
    const normalizedRequestId = normalizeProjectLinkId(requestId);

    if (!normalizedRequestId) {
      return "";
    }

    const projectHistory = await getMyProjects3DApi({
      page: 0,
      size: 100,
      sort: "createdAt,desc",
    });
    const matchedProject = (projectHistory?.content || []).find(
      (project) =>
        getProject3DDesignRequestId(project) === normalizedRequestId,
    );

    return getProject3DLinkId(matchedProject);
  }, []);

  const handleCreate3D = () => {
    if (!aiResults?.products?.length) {
      toast.error("Chưa có danh sách sản phẩm để dựng không gian 3D.");
      return;
    }

    const sourceDesignRequestId = getAiDesignRequestId(aiResults);

    navigate("/viewer", {
      state: {
        aiResults,
        sourceDesignRequestId,
        forceCreate3DProject: true,
      },
    });
  };

  const handleView3DHistory = useCallback(async () => {
    const sourceDesignRequestId = getAiDesignRequestId(aiResults);

    if (!sourceDesignRequestId) {
      toast("Thiết kế này chưa có lịch sử 3D.");
      return;
    }

    try {
      const matchedProjectId = await findLatestProject3DIdByRequest(
        sourceDesignRequestId,
      );

      if (!matchedProjectId) {
        toast("Chưa có lịch sử 3D cho thiết kế này.");
        return;
      }

      navigate(`/viewer/${matchedProjectId}`, {
        state: {
          project3DId: matchedProjectId,
          sourceDesignRequestId,
        },
      });
    } catch (error) {
      console.error("Open 3D history error:", error);
      toast.error("Không tải được lịch sử 3D.");
    }
  }, [aiResults, findLatestProject3DIdByRequest, navigate]);

  const handleAddAllToCart = () => {
    toast("Chưa nối giỏ hàng hàng loạt cho AI recommendation.");
  };

  const handleViewProduct = (product) => {
    if (product?.id && !String(product.id).startsWith("ai-product-")) {
      navigate(`/products/${product.id}`);
      return;
    }

    navigate("/products");
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(price) || 0);

  // Save state changes to storage
  useEffect(() => {
    if (step !== 1 || uploadedImage || aiResults) {
      saveToStorage({
        step,
        uploadedImage,
        aiResults,
        formData,
      });
    }
  }, [step, uploadedImage, aiResults, formData, saveToStorage]);

  return (
    <div className={styles.page} data-page-theme="ai">
      <AIDesignerHero />
      <AIDesignerProgress step={step} />

      <div className={styles.content}>
        {step === 1 && (
          <AIDesignerUploadStep
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            onUploadChange={handleImageUpload}
            historyItems={designHistory}
            historyLoading={historyLoading}
            onSelectHistory={handleSelectHistory}
            formatHistoryDate={formatHistoryDate}
          />
        )}

        {step === 2 && uploadedImage && (
          <AIDesignerConfigStep
            formData={formData}
            onChange={handleChange}
            onDimensionChange={handleDimensionChange}
            onDimensionBlur={handleDimensionBlur}
            onFieldBlur={handleAgeBlur}
            onBackToUpload={handleBackToUpload}
            onGenerate={handleGenerateDesign}
            uploadedImage={uploadedImage}
            loading={isProcessing}
            profileLoading={profileLoading}
            userDemographics={userDemographics}
          />
        )}

        {step === 3 && isProcessing && <AIDesignerProcessingStep />}

        {step === 4 && aiResults && (
          <AIDesignerResultsPanel
            formatPrice={formatPrice}
            onAddAllToCart={handleAddAllToCart}
            onCreate3D={handleCreate3D}
            onReset={handleReset}
            onView3DHistory={handleView3DHistory}
            onViewProduct={handleViewProduct}
            results={aiResults}
          />
        )}
      </div>
    </div>
  );
}

export default AIDesignerPage;
