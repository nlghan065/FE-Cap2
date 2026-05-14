import { Button, Input, Typography, Select, DatePicker, message } from "antd";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import loginBg from "../../assets/login-bg.png";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import dayjs from "dayjs";

import { registerApi, getCitiesApi, getWardsApi } from "../../api/authApi";

import styles from "../../styles/Auth.module.css";
import { getErrorMessage } from "../../utils/errorMessage";

const { Title, Text } = Typography;

/* ================= VALIDATION ================= */

const schema = yup.object({
  fullName: yup
    .string()
    .required("Nhập họ tên")
    .min(2, "Ít nhất 2 ký tự")
    .max(100, "Tối đa 100 ký tự")
    .matches(/^[\p{L}\s]+$/u, "Chỉ chứa chữ cái và khoảng trắng"),

  gender: yup
    .string()
    .oneOf(["male", "female", "other"])
    .required("Chọn giới tính"),

  phoneNumber: yup
    .string()
    .required("Nhập số điện thoại")
    .matches(/^[0-9]{9,11}$/, "SĐT không hợp lệ"),

  birthDate: yup
    .date()
    .required("Chọn ngày sinh")
    .max(new Date(), "Ngày sinh phải trong quá khứ"),

  email: yup.string().email("Email không hợp lệ").required("Nhập email"),

  address: yup.string().required("Nhập địa chỉ"),

  city: yup.string().required("Chọn thành phố"),

  ward: yup.string().required("Chọn phường"),

  password: yup
    .string()
    .required("Nhập mật khẩu")
    .min(6, "Ít nhất 6 ký tự")
    .max(50, "Tối đa 50 ký tự")
    .matches(/[a-z]/, "Phải có chữ thường")
    .matches(/[A-Z]/, "Phải có chữ hoa")
    .matches(/[0-9]/, "Phải có số"),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Mật khẩu không khớp")
    .required("Nhập lại mật khẩu"),
});

function Register() {
  const navigate = useNavigate();

  const [cities, setCities] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const selectedCity = watch("city");

  /* LOAD CITY */

  useEffect(() => {
    const fetchCities = async () => {
      const data = await getCitiesApi();
      setCities(data || []);
    };

    fetchCities();
  }, []);

  /* LOAD WARD */

  useEffect(() => {
    if (!selectedCity) return;

    const fetchWards = async () => {
      const data = await getWardsApi(selectedCity);
      setWards(data || []);
      setValue("ward", "");
    };

    fetchWards();
  }, [selectedCity, setValue]);

  /* SUBMIT */

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const cityObj = cities.find((c) => c.id === data.city);
      const wardObj = wards.find((w) => w.id === data.ward);

      const payload = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phoneNumber,
        gender: data.gender,
        dateOfBirth: dayjs(data.birthDate).format("YYYY-MM-DD"),
        address: data.address,
        city: cityObj?.name,
        ward: wardObj?.name,
        password: data.password,
      };

      await registerApi(payload);

      message.success("Đăng ký thành công!");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      message.error(getErrorMessage(err, "Lỗi máy chủ. Vui lòng thử lại."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* LEFT */}

        <div className={styles.left}>
          <img src={loginBg} alt="background" className={styles.leftBg} />

          <div className={styles.leftContent}>
            <Title className={styles.brand}>VirtuSpace</Title>

            <Title level={2} className={styles.heroTitle}>
              Thiết kế không gian mơ ước của bạn
            </Title>

            <Text className={styles.heroDesc}>
              Tạo tài khoản để bắt đầu trải nghiệm thiết kế nội thất với AI và
              không gian 3D.
            </Text>

            <div className={styles.featureGrid}>
              <div className={styles.featureBox}>
                <div className={styles.featureIcon}>⚡</div>
                <div>
                  <b>AI Design</b>
                  <p>Thiết kế nội thất bằng AI</p>
                </div>
              </div>

              <div className={styles.featureBox}>
                <div className={styles.featureIcon}>🧱</div>
                <div>
                  <b>3D Visualization</b>
                  <p>Xem không gian 3D trực quan</p>
                </div>
              </div>

              <div className={styles.featureBox}>
                <div className={styles.featureIcon}>📐</div>
                <div>
                  <b>Smart Layout</b>
                  <p>Gợi ý bố cục phòng tự động</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}

        <div className={styles.right}>
          <div className={styles.titleBox}>
            <Title level={3} className={styles.title}>
              Tạo tài khoản
            </Title>

            <p className={styles.subtitle}>
              Cung cấp thông tin để AI tối ưu hóa Studio của bạn.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className={styles.formGrid}>
            {/* HỌ TÊN */}

            <div>
              <label className={styles.label}>HỌ VÀ TÊN</label>
              <Controller
                name="fullName"
                control={control}
                render={({ field }) => (
                  <Input placeholder="Nguyễn Văn A" {...field} />
                )}
              />
              <p className={styles.error}>{errors.fullName?.message}</p>
            </div>

            {/* GIỚI TÍNH */}

            <div>
              <label className={styles.label}>GIỚI TÍNH</label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select
                    placeholder="Chọn giới tính"
                    style={{ width: "100%" }}
                    value={field.value}
                    onChange={(v) => field.onChange(v)}
                  >
                    <Select.Option value="male">Nam</Select.Option>
                    <Select.Option value="female">Nữ</Select.Option>
                    <Select.Option value="other">Khác</Select.Option>
                  </Select>
                )}
              />
              <p className={styles.error}>{errors.gender?.message}</p>
            </div>

            {/* PHONE */}

            <div>
              <label className={styles.label}>SỐ ĐIỆN THOẠI</label>
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <Input placeholder="0901234567" {...field} />
                )}
              />
              <p className={styles.error}>{errors.phoneNumber?.message}</p>
            </div>

            {/* BIRTH */}

            <div>
              <label className={styles.label}>NGÀY SINH</label>
              <Controller
                name="birthDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    style={{ width: "100%" }}
                    disabledDate={(current) =>
                      current && current > dayjs().endOf("day")
                    }
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(date) => field.onChange(date)}
                  />
                )}
              />
              <p className={styles.error}>{errors.birthDate?.message}</p>
            </div>

            {/* EMAIL FULL */}

            <div className={styles.fullWidth}>
              <label className={styles.label}>EMAIL</label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input placeholder="name@email.com" {...field} />
                )}
              />
              <p className={styles.error}>{errors.email?.message}</p>
            </div>

            {/* ADDRESS */}

            <div className={styles.fullWidth}>
              <label className={styles.label}>ĐỊA CHỈ</label>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <Input placeholder="Số nhà, đường..." {...field} />
                )}
              />
              <p className={styles.error}>{errors.address?.message}</p>
            </div>

            {/* CITY */}

            <div>
              <label className={styles.label}>THÀNH PHỐ</label>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <Select
                    placeholder="Chọn thành phố"
                    style={{ width: "100%" }}
                    value={field.value}
                    onChange={(v) => field.onChange(v)}
                  >
                    {cities.map((c) => (
                      <Select.Option key={c.id} value={c.id}>
                        {c.name}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              />
              <p className={styles.error}>{errors.city?.message}</p>
            </div>

            {/* WARD */}

            <div>
              <label className={styles.label}>PHƯỜNG</label>
              <Controller
                name="ward"
                control={control}
                render={({ field }) => (
                  <Select
                    placeholder="Chọn phường"
                    disabled={!selectedCity}
                    style={{ width: "100%" }}
                    value={field.value}
                    onChange={(v) => field.onChange(v)}
                  >
                    {wards.map((w) => (
                      <Select.Option key={w.id} value={w.id}>
                        {w.name}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              />
              <p className={styles.error}>{errors.ward?.message}</p>
            </div>

            {/* PASSWORD */}

            <div>
              <label className={styles.label}>MẬT KHẨU</label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => <Input.Password {...field} />}
              />

              <p className={styles.error}>{errors.password?.message}</p>
            </div>

            {/* CONFIRM */}

            <div>
              <label className={styles.label}>NHẬP LẠI MẬT KHẨU</label>
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => <Input.Password {...field} />}
              />
              <p className={styles.error}>{errors.confirmPassword?.message}</p>
            </div>
            <p className={styles.passwordHint}>
              Yêu cầu mật khẩu: 6–50 ký tự, gồm chữ hoa (A-Z), chữ thường (a-z)
              và số (0-9).
            </p>
            {/* BUTTON */}

            <div className={styles.fullWidth}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className={styles.loginBtn}
              >
                Đăng ký
              </Button>

              <p className={styles.switch}>
                Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
