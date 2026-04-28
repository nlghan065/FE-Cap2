import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { postAiRecommendApi } from "../../api/aiRecommendApi";
import { getUserByIdApi } from "../../api/authApi";
import { getProfileApi } from "../../api/profileApi";
import AIDesignerConfigStep from "../../components/user/ai-designer/AIDesignerConfigStep";
import AIDesignerHero from "../../components/user/ai-designer/AIDesignerHero";
import AIDesignerProcessingStep from "../../components/user/ai-designer/AIDesignerProcessingStep";
import AIDesignerProgress from "../../components/user/ai-designer/AIDesignerProgress";
import AIDesignerResultsPanel from "../../components/user/ai-designer/AIDesignerResultsPanel";
import AIDesignerUploadStep from "../../components/user/ai-designer/AIDesignerUploadStep";
import styles from "../../styles/AIDesigner.module.css";
import { normalizeAiRecommendResult } from "../../utils/aiRecommendResultV2";

const getAuthToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

const getCurrentUserId = () =>
  localStorage.getItem("userId") || sessionStorage.getItem("userId");

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

const normalizeGender = (value) => {
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
    profile.dateOfBirth ||
      profile.birthDate ||
      profile.birthday ||
      profile.dob,
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
    loadProfileDemographics();
  }, [loadProfileDemographics]);

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
      toast.error("Hãy nhập đầy đủ thông tin request.");
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

      const normalizedResult = normalizeAiRecommendResult(response || {});

      console.log("[AI Design FE] normalized result", normalizedResult);

      setAiResults(normalizedResult);

      if (!normalizedResult.products.length) {
        toast(
          normalizedResult.requestMeta.message ||
            "Yêu cầu thiết kế đã được tạo, AI chưa trả danh sách sản phẩm ngay.",
        );
      }

      setStep(4);
    } catch (error) {
      console.error("AI recommend error:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không gọi được AI recommend.",
      );
      setStep(2);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDimensionChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [field]: value,
      },
    }));
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
  };

  const handleView3D = () => {
    if (!aiResults?.products?.length) {
      toast.error("Chưa có danh sách sản phẩm để dựng không gian 3D.");
      return;
    }

    navigate("/viewer", {
      state: {
        aiResults,
      },
    });
  };

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

  return (
    <div className={styles.page}>
      <AIDesignerHero />
      <AIDesignerProgress step={step} />

      <div className={styles.content}>
        {step === 1 && (
          <AIDesignerUploadStep
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            onUploadChange={handleImageUpload}
          />
        )}

        {step === 2 && uploadedImage && (
          <AIDesignerConfigStep
            formData={formData}
            onChange={handleChange}
            onDimensionChange={handleDimensionChange}
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

export default AIDesignerPage;
