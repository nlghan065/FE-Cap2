import { Button, Input, Typography, message, Select, DatePicker } from "antd";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import dayjs from "dayjs";

import { registerApi, getCitiesApi, getWardsApi } from "../../api/authApi";

import styles from "../../styles/Auth.module.css";

const { Title, Text } = Typography;

/* ================= VALIDATION ================= */

const schema = yup.object({
  fullName: yup.string().required("Nhập họ tên"),

  email: yup.string().email("Email không hợp lệ").required("Nhập email"),

  phoneNumber: yup
    .string()
    .required("Nhập số điện thoại")
    .matches(/^[0-9]{9,11}$/, "Số điện thoại không hợp lệ"),

  birthDate: yup.date().required("Chọn ngày sinh"),

  address: yup.string().required("Nhập địa chỉ"),

  city: yup.string().required("Chọn thành phố"),

  ward: yup.string().required("Chọn phường"),

  password: yup
    .string()
    .min(6, "Mật khẩu ít nhất 6 ký tự")
    .max(50, "Mật khẩu tối đa 50 ký tự")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      "Mật khẩu phải có chữ hoa, chữ thường và số",
    )
    .required("Nhập mật khẩu"),

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

  /* PASSWORD CHECK REALTIME */

  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
  });

  const checkPassword = (value) => {
    setPasswordChecks({
      length: value.length >= 6 && value.length <= 50,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      number: /\d/.test(value),
    });
  };

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

  /* ================= LOAD CITIES ================= */

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const cityData = await getCitiesApi();
        setCities(cityData);
      } catch (error) {
        console.error("Load cities error:", error);
        setCities([]);
      }
    };

    fetchCities();
  }, []);

  /* ================= LOAD WARDS ================= */

  useEffect(() => {
    if (!selectedCity) return;

    const fetchWards = async () => {
      try {
        const wardData = await getWardsApi(selectedCity);
        setWards(wardData);

        setValue("ward", "");
      } catch (error) {
        console.error("Load wards error:", error);
        setWards([]);
      }
    };

    fetchWards();
  }, [selectedCity, setValue]);

  /* ================= SUBMIT ================= */

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const payload = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phoneNumber,
        birthDate: dayjs(data.birthDate).format("YYYY-MM-DD"),
        address: data.address,
        cityId: data.city,
        wardId: data.ward,
        password: data.password,
      };

      console.log("REGISTER PAYLOAD:", payload);

      await registerApi(payload);

      message.success("Đăng ký thành công!");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      console.error(error);

      if (error.response) {
        message.error(error.response.data.message || "Lỗi server");
      } else {
        message.error("Không kết nối được server");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* LEFT */}

        <div className={styles.left}>
          <Title level={3} style={{ color: "white" }}>
            Mở khóa không gian sáng tạo của bạn
          </Title>

          <Text style={{ color: "white" }}>
            Chọn 2 phong cách bạn yêu thích nhất
          </Text>
        </div>

        {/* RIGHT */}

        <div className={styles.right}>
          <Title level={3}>Tạo tài khoản</Title>

          <form onSubmit={handleSubmit(onSubmit)} className={styles.formGrid}>
            {/* FULL NAME */}

            <div>
              <Controller
                name="fullName"
                control={control}
                render={({ field }) => (
                  <Input placeholder="Họ và tên" {...field} />
                )}
              />
              <p className={styles.error}>{errors.fullName?.message}</p>
            </div>

            {/* EMAIL */}

            <div>
              <Controller
                name="email"
                control={control}
                render={({ field }) => <Input placeholder="Email" {...field} />}
              />
              <p className={styles.error}>{errors.email?.message}</p>
            </div>

            {/* PHONE */}

            <div>
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <Input placeholder="Số điện thoại" {...field} />
                )}
              />
              <p className={styles.error}>{errors.phoneNumber?.message}</p>
            </div>

            {/* BIRTH DATE */}

            <div>
              <Controller
                name="birthDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    style={{ width: "100%" }}
                    placeholder="Ngày sinh"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(date) => field.onChange(date)}
                  />
                )}
              />
              <p className={styles.error}>{errors.birthDate?.message}</p>
            </div>

            {/* ADDRESS FULL WIDTH */}

            <div className={styles.fullWidth}>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <Input placeholder="Địa chỉ cụ thể" {...field} />
                )}
              />
              <p className={styles.error}>{errors.address?.message}</p>
            </div>

            {/* CITY */}

            <div>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <Select
                    placeholder="Thành phố"
                    style={{ width: "100%" }}
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                  >
                    {cities.map((city) => (
                      <Select.Option key={city.id} value={city.id}>
                        {city.name}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              />
              <p className={styles.error}>{errors.city?.message}</p>
            </div>

            {/* WARD */}

            <div>
              <Controller
                name="ward"
                control={control}
                render={({ field }) => (
                  <Select
                    placeholder="Phường / Xã"
                    style={{ width: "100%" }}
                    value={field.value}
                    disabled={!selectedCity}
                    onChange={(value) => field.onChange(value)}
                  >
                    {wards.map((ward) => (
                      <Select.Option key={ward.id} value={ward.id}>
                        {ward.name}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              />
              <p className={styles.error}>{errors.ward?.message}</p>
            </div>

            {/* PASSWORD */}

            <div>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input.Password placeholder="Mật khẩu" {...field} />
                )}
              />
              <p className={styles.error}>{errors.password?.message}</p>
            </div>

            {/* CONFIRM PASSWORD */}

            <div>
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <Input.Password placeholder="Nhập lại mật khẩu" {...field} />
                )}
              />
              <p className={styles.error}>{errors.confirmPassword?.message}</p>
            </div>

            {/* SUBMIT */}

            <div className={styles.fullWidth}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                className={styles.loginBtn}
              >
                Đăng ký
              </Button>

              <p style={{ marginTop: 15 }}>
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
