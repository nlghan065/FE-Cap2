import { Button, Input, Typography, message } from "antd";
import { forgotPasswordApi, resetPasswordApi } from "../../api/authApi";
import styles from "../../styles/Auth.module.css";
import { Link, useNavigate } from "react-router-dom";
import loginBg from "../../assets/login-bg.jpg";
import { useState, useEffect } from "react";

const { Title, Text } = Typography;

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [loading, setLoading] = useState(false);

  const otpCode = otp.join("");

  /* ================= SEND OTP ================= */

  const handleSendOtp = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      return message.error("Vui lòng nhập email");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      return message.error("Email không hợp lệ");
    }

    try {
      setLoading(true);

      await forgotPasswordApi({ email: trimmedEmail });

      setOtp(["", "", "", "", "", ""]);

      message.success("OTP đã gửi về email");

      setStep(2);

      setTimer(60);
      setCanResend(false);

      setTimeout(() => {
        document.getElementById("otp-0")?.focus();
      }, 100);
    } catch {
      message.error("Không gửi được OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ================= OTP INPUT ================= */

  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handlePasteOtp = (e) => {
    const paste = e.clipboardData.getData("text");

    if (!/^[0-9]{6}$/.test(paste)) return;

    const otpArray = paste.split("");

    setOtp(otpArray);

    setTimeout(() => {
      document.getElementById("otp-5").focus();
    }, 0);
  };

  /* ================= VERIFY OTP ================= */

  const handleVerifyOtp = () => {
    if (otpCode.length !== 6) {
      return message.error("Vui lòng nhập đủ 6 số OTP");
    }

    message.success("OTP hợp lệ");

    setStep(3);
  };

  /* ================= PASSWORD VALIDATION ================= */

  const validatePassword = (password) => {
    if (password.length < 6 || password.length > 50) {
      return "Mật khẩu phải từ 6–50 ký tự";
    }

    if (!/[A-Z]/.test(password)) {
      return "Phải có ít nhất 1 chữ hoa";
    }

    if (!/[a-z]/.test(password)) {
      return "Phải có ít nhất 1 chữ thường";
    }

    if (!/[0-9]/.test(password)) {
      return "Phải có ít nhất 1 số";
    }

    return null;
  };

  /* ================= RESET PASSWORD ================= */

  const handleResetPassword = async () => {
    const error = validatePassword(password);

    if (error) {
      return message.error(error);
    }

    if (password !== confirmPassword) {
      return message.error("Mật khẩu xác nhận không khớp");
    }

    try {
      setLoading(true);

      await resetPasswordApi({
        email,
        otp: otpCode,
        newPassword: password.trim(),
      });

      message.success("Đổi mật khẩu thành công");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch {
      message.error("Không thể đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RESEND TIMER ================= */

  useEffect(() => {
    if (step !== 2) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* LEFT */}

        <div className={styles.leftForgot}>
          <img src={loginBg} className={styles.leftBg} />

          <div className={styles.leftContent}>
            <Title className={styles.brand}>VirtuSpace</Title>

            <Title level={2} className={styles.heroTitle}>
              Khôi phục tài khoản
            </Title>

            <Text className={styles.heroDesc}>
              Nhập email để nhận OTP và đặt lại mật khẩu
            </Text>
          </div>
        </div>

        {/* RIGHT */}

        <div className={styles.right}>
          <div className={styles.titleBox}>
            <Title level={3} className={styles.title}>
              Quên mật khẩu
            </Title>

            <p className={styles.subtitle}>
              {step === 1 && "Bước 1/3 • Nhập email để nhận OTP"}
              {step === 2 && "Bước 2/3 • Nhập mã OTP đã gửi"}
              {step === 3 && "Bước 3/3 • Tạo mật khẩu mới"}
            </p>
          </div>

          <div className={styles.form}>
            {/* STEP 1 */}

            {step === 1 && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email</label>

                  <Input
                    className={styles.input}
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <Button
                  className={styles.loginBtn}
                  block
                  loading={loading}
                  disabled={!email}
                  onClick={handleSendOtp}
                >
                  Gửi OTP
                </Button>

                <p className={styles.switch}>
                  Nhớ lại mật khẩu? <Link to="/login">Quay lại Đăng nhập</Link>
                </p>
              </>
            )}

            {/* STEP 2 */}

            {step === 2 && (
              <>
                <Text type="secondary">
                  OTP đã gửi tới <b>{email}</b>
                </Text>

                <div className={styles.otpContainer} onPaste={handlePasteOtp}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      value={digit}
                      maxLength={1}
                      onChange={(e) => handleOtpChange(e.target.value, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className={styles.otpInput}
                    />
                  ))}
                </div>

                <p className={styles.resend}>
                  {canResend ? (
                    <span onClick={handleSendOtp} className={styles.resendBtn}>
                      Gửi lại OTP
                    </span>
                  ) : (
                    <>Gửi lại OTP sau {timer}s</>
                  )}
                </p>

                <Button
                  className={styles.loginBtn}
                  block
                  loading={loading}
                  onClick={handleVerifyOtp}
                >
                  Xác thực OTP
                </Button>
              </>
            )}

            {/* STEP 3 */}

            {step === 3 && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Mật khẩu mới</label>

                  <Input.Password
                    className={styles.input}
                    placeholder="Nhập mật khẩu mới"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Xác nhận mật khẩu</label>

                  <Input.Password
                    className={styles.input}
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <p className={styles.passwordHint}>
                  Mật khẩu 6–50 ký tự gồm chữ hoa, chữ thường và số.
                </p>

                <Button
                  className={styles.loginBtn}
                  block
                  loading={loading}
                  onClick={handleResetPassword}
                >
                  Đổi mật khẩu
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
