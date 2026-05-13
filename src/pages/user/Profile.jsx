import { useEffect, useState } from "react";
import {
  User,
  Phone,
  MapPin,
  CalendarDays,
  Edit2,
  Save,
  X,
} from "lucide-react";
import { getProfileApi } from "../../api/profileApi";
import { updateProfileApi } from "../../api/adminCustomerApi";
import { getCitiesApi, getWardsApi } from "../../api/authApi";
import styles from "../../styles/Profile.module.css";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const mapGender = (value) => {
  if (!value) return "-";
  const normalized = String(value).toLowerCase();
  if (normalized === "male") return "Nam";
  if (normalized === "female") return "Nữ";
  return value;
};

function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    ward: "",
    gender: "",
    dateOfBirth: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [cities, setCities] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getProfileApi();
        setProfile(data);
      } catch (err) {
        console.error("Load profile error:", err);
        setError("Không tải được thông tin hồ sơ. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (!profile) return;

    setForm({
      fullName: profile.fullName || "",
      phone: profile.phone || "",
      address: profile.address || "",
      city: profile.city || "",
      ward: profile.ward || "",
      gender: profile.gender || "",
      dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split("T")[0] : "",
    });

    // Set selectedCity when profile loads
    if (profile.city && cities.length > 0) {
      const found = cities.find((c) => c.name === profile.city);
      if (found) {
        setSelectedCity(found.id);
      }
    }
  }, [profile, cities]);

  // Load cities on mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const data = await getCitiesApi();
        setCities(data || []);
      } catch (err) {
        console.error("Load cities error:", err);
      }
    };
    fetchCities();
  }, []);

  // Load wards when city changes
  useEffect(() => {
    if (!selectedCity) {
      setWards([]);
      return;
    }

    const fetchWards = async () => {
      try {
        const data = await getWardsApi(selectedCity);
        setWards(data || []);
      } catch (err) {
        console.error("Load wards error:", err);
        setWards([]);
      }
    };

    fetchWards();
  }, [selectedCity]);

  // Set selectedCity when form.city changes
  useEffect(() => {
    if (!form.city || cities.length === 0) return;

    const found = cities.find((c) => c.name === form.city);
    if (found) {
      setSelectedCity(found.id);
    } else {
      setSelectedCity("");
    }
  }, [form.city, cities]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleCancel = () => {
    if (profile) {
      setForm({
        fullName: profile.fullName || "",
        phone: profile.phone || "",
        address: profile.address || "",
        city: profile.city || "",
        ward: profile.ward || "",
        gender: profile.gender || "",
        dateOfBirth: profile.dateOfBirth
          ? profile.dateOfBirth.split("T")[0]
          : "",
      });
      // Reset selectedCity based on profile.city
      if (profile.city && cities.length > 0) {
        const found = cities.find((c) => c.name === profile.city);
        setSelectedCity(found?.id || "");
      }
    }
    setEditing(false);
    setError("");
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    setError("");

    const payload = {
      fullName: form.fullName,
      phone: form.phone,
      address: form.address,
      city: form.city,
      ward: form.ward,
      gender: form.gender,
      dateOfBirth: form.dateOfBirth || null,
    };

    try {
      const id = profile.id || profile._id;
      const response = await updateProfileApi(id, payload);
      const updatedProfile = response?.data?.data || { ...profile, ...payload };
      setProfile(updatedProfile);
      setEditing(false);
    } catch (err) {
      console.error("Update profile error:", err);
      setError(
        err?.response?.data?.message ||
          "Cập nhật thất bại. Vui lòng kiểm tra lại.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Đang tải thông tin hồ sơ...</div>;
  }

  if (error && !profile) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!profile) {
    return <div className={styles.empty}>Không có thông tin hồ sơ.</div>;
  }

  return (
    <div className={styles.profilePage}>
      <header className={styles.profileHeader}>
        <div className={styles.profileBadge}>
          <User size={24} />
        </div>
        <div>
          <p className={styles.profileTitle}>Hồ sơ người dùng</p>
          <span className={styles.profileSubtitle}>
            Xem và cập nhật thông tin cá nhân của bạn.
          </span>
        </div>
      </header>

      <section className={styles.profileCard}>
        <div className={styles.cardHeader}>
          <div>
            <p className={styles.cardTitle}>Thông tin hồ sơ</p>
            <span className={styles.cardSubtitle}>
              Chỉnh sửa thông tin cá nhân của bạn nếu cần.
            </span>
          </div>
          <button
            type="button"
            className={styles.editButton}
            onClick={() => (editing ? handleCancel() : setEditing(true))}
          >
            {editing ? <X size={16} /> : <Edit2 size={16} />}
            {editing ? "Hủy" : "Chỉnh sửa"}
          </button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        {editing ? (
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Họ và tên</label>
              <input
                className={styles.input}
                value={form.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Số điện thoại</label>
              <input
                className={styles.input}
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Giới tính</label>
              <select
                className={styles.input}
                value={form.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
              >
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Ngày sinh</label>
              <input
                type="date"
                className={styles.input}
                value={form.dateOfBirth}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
              />
            </div>
            <div className={styles.formGroupFull}>
              <label>Địa chỉ</label>
              <input
                className={styles.input}
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Thành phố</label>
              <select
                className={styles.input}
                value={selectedCity}
                onChange={(e) => {
                  const cityId = e.target.value;
                  setSelectedCity(cityId);
                  const cityObj = cities.find((c) => c.id === cityId);
                  handleChange("city", cityObj?.name || "");
                  handleChange("ward", ""); // reset ward
                }}
              >
                <option value="">Chọn thành phố</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Phường</label>
              <select
                className={styles.input}
                value={wards.find((w) => w.name === form.ward)?.id || ""}
                onChange={(e) => {
                  const wardId = e.target.value;
                  const wardObj = wards.find((w) => w.id === wardId);
                  handleChange("ward", wardObj?.name || "");
                }}
                disabled={!selectedCity}
              >
                <option value="">Chọn phường</option>
                {wards.map((ward) => (
                  <option key={ward.id} value={ward.id}>
                    {ward.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.saveButton}
                onClick={handleSave}
                disabled={saving}
              >
                <Save size={16} /> {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.profileGrid}>
            <div className={styles.profileItem}>
              <span className={styles.label}>Họ và tên</span>
              <p className={styles.value}>{profile.fullName || "-"}</p>
            </div>
            <div className={styles.profileItem}>
              <span className={styles.label}>Số điện thoại</span>
              <p className={styles.value}>{profile.phone || "-"}</p>
            </div>
            <div className={styles.profileItem}>
              <span className={styles.label}>Địa chỉ</span>
              <p className={styles.value}>{profile.address || "-"}</p>
            </div>
            <div className={styles.profileItem}>
              <span className={styles.label}>Thành phố</span>
              <p className={styles.value}>{profile.city || "-"}</p>
            </div>
            <div className={styles.profileItem}>
              <span className={styles.label}>Phường</span>
              <p className={styles.value}>{profile.ward || "-"}</p>
            </div>
            <div className={styles.profileItem}>
              <span className={styles.label}>Giới tính</span>
              <p className={styles.value}>{mapGender(profile.gender)}</p>
            </div>
            <div className={styles.profileItem}>
              <span className={styles.label}>Ngày sinh</span>
              <p className={styles.value}>{formatDate(profile.dateOfBirth)}</p>
            </div>
          </div>
        )}
      </section>

      <section className={styles.extraSection}>
        <div className={styles.extraCard}>
          <Phone size={16} />
          <div>
            <p>Liên hệ</p>
            <strong>{profile.phone || "Chưa cập nhật"}</strong>
          </div>
        </div>
        <div className={styles.extraCard}>
          <MapPin size={16} />
          <div>
            <p>Địa chỉ hiện tại</p>
            <strong>
              {profile.address || "-"}, {profile.ward || "-"},{" "}
              {profile.city || "-"}
            </strong>
          </div>
        </div>
        <div className={styles.extraCard}>
          <CalendarDays size={16} />
          <div>
            <p>Ngày sinh</p>
            <strong>{formatDate(profile.dateOfBirth)}</strong>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Profile;
