import { Button, Input, Typography, Checkbox, message } from "antd";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import loginBg from "../../assets/login-bg.jpg";
import { loginApi } from "../../api/authApi";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../styles/Auth.module.css";
import {
  forgotPasswordApi,
  verifyOtpApi,
  resetPasswordApi,
} from "../../api/authApi";

const { Title, Text } = Typography;

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

function Login() {
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      remember: false,
    },
  });

  const onSubmit = async (data) => {
    try {
      const { remember, ...loginData } = data;

      const res = await loginApi(loginData);

      const token = res?.data?.token;
      const role = res?.data?.role;

      console.log("ROLE:", role);
      console.log(res.data);

      if (token) {
        if (remember) {
          localStorage.setItem("token", token);
          localStorage.setItem("role", role);
        } else {
          sessionStorage.setItem("token", token);
          sessionStorage.setItem("role", role);
        }
      }

      message.success("Đăng nhập thành công!");

      if (role === "ADMIN") {
        navigate("/dashboard");
      } else {
        navigate("/home");
      }
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      message.error("Email hoặc mật khẩu không đúng");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* LEFT */}
        {/* LEFT */}

        <div className={styles.left}>
          <img src={loginBg} alt="background" className={styles.leftBg} />

          <div className={styles.leftContent}>
            <Title className={styles.brand}>VirtuSpace</Title>

            <Title level={2} className={styles.heroTitle}>
              Mở khóa không gian sáng tạo của bạn
            </Title>

            <Text className={styles.heroDesc}>
              Đăng nhập để tiếp tục hành trình thiết kế nội thất cùng trợ lý AI
              và không gian 3D.
            </Text>

            <div className={styles.featureTags}>
              <span>AI Visualizer</span>
              <span>3D Workspace</span>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className={styles.right}>
          <Title level={3} className={styles.title}>
            Chào mừng trở lại
          </Title>

          <Text type="secondary">
            Vui lòng nhập thông tin để truy cập vào VirtuSpace.
          </Text>

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            {/* EMAIL */}
            <label>ĐỊA CHỈ EMAIL</label>

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="name@gmail.com"
                  size="large"
                  className={styles.input}
                />
              )}
            />

            <p className={styles.error}>{errors.email?.message}</p>

            {/* PASSWORD */}
            <label>MẬT KHẨU</label>

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  size="large"
                  className={styles.input}
                />
              )}
            />

            <p className={styles.error}>{errors.password?.message}</p>

            {/* REMEMBER + FORGOT */}
            <div className={styles.options}>
              <Controller
                name="remember"
                control={control}
                render={({ field }) => (
                  <Checkbox {...field} checked={field.value}>
                    Ghi nhớ đăng nhập
                  </Checkbox>
                )}
              />

              <Link to="/forgot-password" className={styles.forgot}>
                Quên mật khẩu?
              </Link>
            </div>

            {/* LOGIN */}
            <Button
              htmlType="submit"
              size="large"
              block
              className={styles.loginBtn}
            >
              ĐĂNG NHẬP
            </Button>

            {/* REGISTER */}
            <p className={styles.switch}>
              Chưa có tài khoản? <Link to="/register">Đăng ký miễn phí</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
