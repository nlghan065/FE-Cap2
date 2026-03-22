import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminHeader from "../../layout/admin/AdminHeader";
import AdminMenu from "../../layout/admin/AdminMenu";
import {
  getProfileByIdApi,
  updateProfileApi,
} from "../../api/adminCustomerApi";
import styles from "../../styles/Admin.module.css";
import { Select } from "antd";
import { getCitiesApi, getWardsApi } from "../../api/authApi";

const CustomerEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [cities, setCities] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    if (id) fetchCustomer();
  }, [id]);
  useEffect(() => {
    const fetchCities = async () => {
      const data = await getCitiesApi();
      setCities(data || []);
    };
    fetchCities();
  }, []);

  useEffect(() => {
    if (!selectedCity) return;

    const fetchWards = async () => {
      const data = await getWardsApi(selectedCity);
      setWards(data || []);
    };

    fetchWards();
  }, [selectedCity]);

  useEffect(() => {
    if (customer && cities.length > 0) {
      const foundCity = cities.find((c) => c.name === customer.city);
      if (foundCity) {
        setSelectedCity(foundCity.id);
      }
    }
  }, [customer, cities]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const data = await getProfileByIdApi(id);
      setCustomer(data);
    } catch (err) {
      console.error(err);
      setError("Không tải được dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setCustomer((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validate = () => {
    if (!customer.fullName) return "Tên không được để trống";
    if (customer.phone && !/^[0-9]{9,11}$/.test(customer.phone)) {
      return "Số điện thoại không hợp lệ";
    }
    return "";
  };

  const handleSave = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        fullName: customer.fullName,
        phone: customer.phone,
        gender: customer.gender,
        dateOfBirth: customer.dateOfBirth?.split("T")[0],
        city: customer.city,
        ward: customer.ward,
        address: customer.address,
      };

      console.log("SEND:", payload);

      await updateProfileApi(customer.id, payload);

      navigate(`/admin/customers/${customer.id}`);
    } catch (e) {
      console.error("ERROR:", e.response?.data || e);
      setError(e.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!customer) return <div>Không tìm thấy khách hàng</div>;

  return (
    <div className={styles.adminDashboard}>
      <AdminHeader />
      <AdminMenu />

      <div className={styles.profileWrapper}>
        <div className={styles.layoutGrid}>
          {/* LEFT */}
          <div className={styles.leftPanel}>
            <div className={styles.profileTop}>
              <div className={styles.avatarBox}>
                {customer.fullName?.charAt(0).toUpperCase()}
              </div>

              <div>
                <h2>Chỉnh sửa khách hàng</h2>
                <p>{customer.email}</p>
              </div>
            </div>

            {error && <p className={styles.errorText}>{error}</p>}

            <div className={styles.section}>
              <h3>Thông tin cá nhân</h3>

              <div className={styles.infoGrid}>
                <div>
                  <label>Họ tên</label>
                  <input
                    value={customer.fullName || ""}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                  />
                </div>

                <div>
                  <label>Số điện thoại</label>
                  <input
                    value={customer.phone || ""}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </div>

                <div>
                  <label>Giới tính</label>
                  <select
                    value={customer.gender || ""}
                    onChange={(e) => handleChange("gender", e.target.value)}
                  >
                    <option value="">-- Chọn --</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div>
                  <label>Ngày sinh</label>
                  <input
                    type="date"
                    value={
                      customer.dateOfBirth
                        ? customer.dateOfBirth.split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      handleChange("dateOfBirth", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label>Thành phố</label>
                  <Select
                    style={{ width: "100%" }}
                    placeholder="Chọn thành phố"
                    value={selectedCity}
                    onChange={(value) => {
                      setSelectedCity(value);

                      const cityObj = cities.find((c) => c.id === value);

                      handleChange("city", cityObj?.name);
                      handleChange("ward", ""); // reset ward
                    }}
                  >
                    {cities.map((c) => (
                      <Select.Option key={c.id} value={c.id}>
                        {c.name}
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label>Phường</label>
                  <Select
                    style={{ width: "100%" }}
                    placeholder="Chọn phường"
                    disabled={!selectedCity}
                    value={
                      wards.find((w) => w.name === customer.ward)?.id ||
                      undefined
                    }
                    onChange={(value) => {
                      const wardObj = wards.find((w) => w.id === value);
                      handleChange("ward", wardObj?.name);
                    }}
                  >
                    {wards.map((w) => (
                      <Select.Option key={w.id} value={w.id}>
                        {w.name}
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                <div className={styles.full}>
                  <label>Địa chỉ</label>
                  <input
                    value={customer.address || ""}
                    onChange={(e) => handleChange("address", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className={styles.editActions}>
              <button
                className={styles.saveBtn}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Đang lưu..." : "💾 Lưu"}
              </button>

              <button className={styles.cancelBtn} onClick={() => navigate(-1)}>
                Hủy
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className={styles.rightPanel}>
            <div className={styles.section}>
              <h3>Thông tin hệ thống</h3>

              <div className={styles.statsColumn}>
                <div className={styles.statCard}>
                  <span>Email</span>
                  <h3>{customer.email}</h3>
                </div>

                <div className={styles.statCard}>
                  <span>ID</span>
                  <h3>{customer.id}</h3>
                </div>
              </div>
            </div>

            <button
              className={styles.backBtn}
              onClick={() => navigate(`/admin/customers/${customer.id}`)}
            >
              ← Quay lại chi tiết
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerEdit;
