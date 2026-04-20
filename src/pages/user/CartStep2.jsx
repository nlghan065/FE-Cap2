import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../../styles/Cart.module.css";
import { getCartApi } from "../../api/cartApi";
import { getProfileApi } from "../../api/profileApi";
import { updateProfileApi } from "../../api/adminCustomerApi";
import {
  User,
  ShoppingCart,
  CreditCard,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { getCitiesApi, getWardsApi } from "../../api/authApi";

function CartStep2() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role") || sessionStorage.getItem("role");
  const isAdminPreview = role === "ADMIN";

  // ================= STATE =================
  const [profileId, setProfileId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    ward: "",
    wardId: "",
    note: "",
  });

  const [errors, setErrors] = useState({});
  const [cart, setCart] = useState([]);
  const [shipping, setShipping] = useState(0);
  const [cities, setCities] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");

  const formatPrice = (p) => p.toLocaleString("vi-VN") + " đ";

  const calculateShipping = (subtotal) => (subtotal > 500000 ? 0 : 300000);

  // ================= VALIDATE =================
  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Nhập họ tên";

    if (!form.phone.trim()) newErrors.phone = "Nhập SĐT";
    else if (!/^[0-9]{9,11}$/.test(form.phone))
      newErrors.phone = "SĐT không hợp lệ";

    if (!form.email.trim()) newErrors.email = "Nhập email";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Email không hợp lệ";

    if (!form.address.trim()) newErrors.address = "Nhập địa chỉ";
    if (!selectedCity) newErrors.city = "Chọn tỉnh";
    if (!form.wardId) newErrors.ward = "Chọn phường";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ================= LOAD =================
  useEffect(() => {
    fetchProfile();
    fetchCart();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getProfileApi();

      setProfileId(data.id);

      setForm({
        name: data.fullName || "",
        phone: data.phone || "",
        email: data.email || "",
        address: data.address || "",
        city: data.city || "",
        ward: data.ward || "",
        wardId: "",
        note: "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCart = async () => {
    try {
      const data = await getCartApi();
      setCart(data.items || []);
      setShipping(calculateShipping(data.totalPrice || 0));
    } catch (err) {
      console.error(err);

      if (!isAdminPreview) {
        alert("Không thể tải giỏ hàng");
      }

      setCart([]);
      setShipping(0);
    }
  };

  // ================= CITY =================
  useEffect(() => {
    getCitiesApi().then((data) => setCities(data || []));
  }, []);

  useEffect(() => {
    if (!form.city || cities.length === 0) return;

    const found = cities.find((c) => c.name === form.city);
    if (found) setSelectedCity(found.id);
  }, [form.city, cities]);

  // ================= WARD =================
  useEffect(() => {
    if (!selectedCity) return;

    getWardsApi(selectedCity).then((data) => setWards(data || []));
  }, [selectedCity]);

  useEffect(() => {
    if (!form.ward || wards.length === 0) return;

    const found = wards.find((w) => w.name === form.ward);
    if (found) {
      setForm((prev) => ({
        ...prev,
        wardId: found.id,
      }));
    }
  }, [wards]);

  // ================= HANDLER =================
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (profileId) {
        const payload = {
          fullName: form.name,
          phone: form.phone,
          address: form.address,
          city: form.city,
          ward: form.ward,
        };

        console.log("UPDATE PROFILE payload:", payload);
        console.log("profileId:", profileId);

        await updateProfileApi(profileId, payload);
      }

      localStorage.setItem("checkout", JSON.stringify(form));
      navigate("/payment");
    } catch (err) {
      console.error("Update profile error:", err);
      console.log("Response data:", err.response?.data);
      alert(err.response?.data?.message || "Cập nhật thất bại");
    }
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal + shipping;

  const currentStep =
    location.pathname === "/cart" ? 1 : location.pathname === "/cart2" ? 2 : 3;

  // ================= UI =================
  return (
    <div className={styles.container}>
      {/* STEPS */}
      <div className={styles.steps}>
        <div className={styles.stepItem}>
          <div className={`${styles.circle} ${styles.done}`}>
            <ShoppingCart size={16} />
          </div>
          <span className={styles.labelActive}>Giỏ hàng</span>
        </div>

        <div className={`${styles.line} ${styles.lineActive}`} />

        <div className={styles.stepItem}>
          <div className={`${styles.circle} ${styles.active}`}>
            <User size={16} />
          </div>
          <span className={styles.labelActive}>Thông tin</span>
        </div>

        <div className={styles.line} />

        <div className={styles.stepItem}>
          <div className={styles.circle}>
            <CreditCard size={16} />
          </div>
          <span className={styles.labelInactive}>Thanh toán</span>
        </div>
      </div>
      <h2 className={styles.titlegh}>Thông tin giao hàng</h2>

      <div className={styles.wrapper}>
        {/* FORM */}
        <form className={styles.cartList} onSubmit={handleSubmit}>
          <div className={styles.formCard}>
            {/* NAME */}
            <div className={styles.formGroup}>
              <label>
                Họ và tên <span className={styles.required}>*</span>
              </label>
              <input
                className={errors.name ? styles.inputError : ""}
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
              {errors.name && <p className={styles.error}>{errors.name}</p>}
            </div>

            {/* PHONE + EMAIL */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>
                  SĐT <span className={styles.required}>*</span>
                </label>
                <input
                  className={errors.phone ? styles.inputError : ""}
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
                {errors.phone && <p className={styles.error}>{errors.phone}</p>}
              </div>

              <div className={styles.formGroup}>
                <label>
                  Email <span className={styles.required}>*</span>
                </label>
                <input
                  className={errors.email ? styles.inputError : ""}
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
                {errors.email && <p className={styles.error}>{errors.email}</p>}
              </div>
            </div>

            {/* ADDRESS */}
            <div className={styles.formGroup}>
              <label>
                Địa chỉ <span className={styles.required}>*</span>
              </label>
              <input
                className={errors.address ? styles.inputError : ""}
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
              {errors.address && (
                <p className={styles.error}>{errors.address}</p>
              )}
            </div>

            {/* CITY + WARD */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>
                  Tỉnh <span className={styles.required}>*</span>
                </label>
                <select
                  className={errors.city ? styles.inputError : ""}
                  value={selectedCity}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedCity(value);

                    const cityObj = cities.find((c) => c.id === value);
                    handleChange("city", cityObj?.name);
                    handleChange("ward", "");
                    handleChange("wardId", "");
                  }}
                >
                  <option value="">Chọn Tỉnh</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.city && <p className={styles.error}>{errors.city}</p>}
              </div>

              <div className={styles.formGroup}>
                <label>
                  Phường <span className={styles.required}>*</span>
                </label>
                <select
                  className={errors.ward ? styles.inputError : ""}
                  disabled={!selectedCity}
                  value={form.wardId}
                  onChange={(e) => {
                    const wardId = e.target.value;
                    const wardObj = wards.find((w) => w.id === wardId);

                    setForm((prev) => ({
                      ...prev,
                      ward: wardObj?.name,
                      wardId,
                    }));

                    setErrors((prev) => ({ ...prev, ward: "" }));
                  }}
                >
                  <option value="">Chọn Phường</option>
                  {wards.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
                {errors.ward && <p className={styles.error}>{errors.ward}</p>}
              </div>
            </div>

            {/* NOTE */}
            <div className={styles.formGroup}>
              <label>Ghi chú</label>
              <textarea
                placeholder="Ví dụ: giao giờ hành chính..."
                value={form.note}
                onChange={(e) => handleChange("note", e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => navigate("/cart")}
            >
              Quay lại
            </button>

            <button type="submit" className={styles.checkoutBtn}>
              Tiếp tục
            </button>
          </div>
        </form>

        {/* SUMMARY */}
        <div className={styles.summary}>
          <h3 className={styles.summaryTitle}>Tóm tắt đơn hàng</h3>

          {cart.map((item) => (
            <div key={item.productId} className={styles.summaryItemBig}>
              <div>
                {item.productName} x{item.quantity}
              </div>
              <div>{formatPrice(item.price * item.quantity)}</div>
            </div>
          ))}

          <hr />

          <div className={styles.summaryRow}>
            <span>Tạm tính</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <div className={styles.summaryRow}>
            <span>Phí ship</span>
            <span>{formatPrice(shipping)}</span>
          </div>

          <div className={styles.totalBig}>
            <span>Tổng</span>
            <span>{formatPrice(total)}</span>
          </div>

          <div className={styles.boxGreen}>
            <Truck size={18} />
            <div>
              <b>Miễn phí vận chuyển</b>
              <span>Đơn từ 500.000₫</span>
            </div>
          </div>

          <div className={styles.boxBlue}>
            <ShieldCheck size={18} />
            <div>
              <b>Bảo hành 24 tháng</b>
              <span>Đổi trả 7 ngày</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartStep2;
