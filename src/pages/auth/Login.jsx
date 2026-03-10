import { Button, Input, Typography, message } from "antd";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { loginApi } from "../../api/authApi";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../styles/Auth.module.css";

const { Title, Text } = Typography;

/* ================= VALIDATION ================= */

const schema = yup.object({
  email: yup
    .string()
    .email("Email không hợp lệ")
    .required("Vui lòng nhập email"),

  password: yup
    .string()
    .min(6, "Mật khẩu ít nhất 6 ký tự")
    .required("Vui lòng nhập mật khẩu"),
});

/* ================= COMPONENT ================= */

function Login() {
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  /* ================= SUBMIT ================= */

  const onSubmit = async (data) => {
    console.log("===== LOGIN SUBMIT =====");
    console.log("Data gửi lên BE:", data);

    try {
      const res = await loginApi(data);

      console.log("===== RESPONSE FROM BE =====");
      console.log(res);

      // lưu token nếu backend trả về
      if (res?.token) {
        localStorage.setItem("token", res.token);
        console.log("Token đã lưu:", res.token);
      }

      message.success("Đăng nhập thành công!");

      // chuyển trang sau login
      navigate("/");
    } catch (error) {
      console.log("===== LOGIN ERROR =====");

      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Data:", error.response.data);
      } else {
        console.log("Error:", error.message);
      }

      message.error("Email hoặc mật khẩu không đúng");
    }
  };

  /* ================= UI ================= */

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* LEFT SIDE */}

        <div className={styles.left}>
          <Title level={2} style={{ color: "white" }}>
            VirtuSpace
          </Title>

          <Text style={{ color: "white", fontSize: 16 }}>
            Mở khóa không gian sáng tạo của bạn với AI.
          </Text>
        </div>

        {/* RIGHT SIDE */}

        <div className={styles.right}>
          <Title level={3}>Chào mừng trở lại</Title>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* EMAIL */}

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Địa chỉ email" size="large" />
              )}
            />

            <p className={styles.error}>{errors.email?.message}</p>

            {/* PASSWORD */}

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  placeholder="Mật khẩu"
                  size="large"
                />
              )}
            />

            <p className={styles.error}>{errors.password?.message}</p>

            {/* FORGOT PASSWORD */}

            <div className={styles.forgot}>
              <Link to="/forgot-password">Quên mật khẩu?</Link>
            </div>

            {/* LOGIN BUTTON */}

            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              className={styles.loginBtn}
            >
              Đăng nhập
            </Button>

            {/* REGISTER */}

            <p className={styles.switch}>
              Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
