Mã nhóm: C2SE.26
Tên đề tài: VirtuSpace - Ứng dụng hỗ trợ xem trước và gợi ý bố trí nội thất bằng AI và không gian 3D

Họ tên thành viên:
- Nguyễn Lê Gia Hân
- Nguyễn Phúc Hưng
- Nguyễn Phúc Hưng
- Nguyễn Tú
- Trương Thị Mỹ Quyên

Họ và tên mentor:
- Nguyễn Minh Nhật

Cách cài đặt chương trình:
1. Yêu cầu môi trường:
- Máy tính đã cài Node.js bản LTS.
- Có npm đi kèm Node.js.
- Có Git để tải hoặc cập nhật source code.
- Có trình duyệt web như Google Chrome hoặc Microsoft Edge để chạy giao diện.

2. Mở terminal tại thư mục dự án:
- Di chuyển vào thư mục FE-Cap2.

3. Cài đặt thư viện cho dự án:
- Chạy lệnh: npm install
- Lệnh này sẽ cài toàn bộ dependencies và devDependencies được khai báo trong package.json.

4. Cấu hình biến môi trường nếu cần:
- Dự án có thể chạy ngay với API mặc định đang trỏ đến backend Render.
- Nếu muốn đổi sang backend local hoặc backend khác, tạo file .env hoặc .env.local ở thư mục gốc và thêm:

VITE_API_BASE_URL=https://capstone02.onrender.com
VITE_API_URL=https://capstone02.onrender.com
VITE_AI_LAYOUT_URL=/api/ai-layout/generate

- Giải thích:
  VITE_API_BASE_URL: API chính cho các chức năng đăng nhập, sản phẩm, đơn hàng, dashboard, AI request.
  VITE_API_URL: Base URL dùng để ghép đường dẫn ảnh từ backend.
  VITE_AI_LAYOUT_URL: API dùng để sinh layout AI. Có thể để dạng relative path hoặc thay bằng full URL nếu service AI chạy riêng.

5. Chạy chương trình ở môi trường phát triển:
- Chạy lệnh: npm run dev
- Sau khi chạy xong, Vite sẽ cung cấp địa chỉ local, thường là:
  http://localhost:5173

6. Kiểm tra chất lượng và build dự án:
- Kiểm tra lint: npm run lint
- Build production: npm run build
- Xem bản build local: npm run preview

7. Lưu ý khi chạy dự án:
- Frontend hiện đang phụ thuộc vào backend API.
- Nếu backend không chạy hoặc không truy cập được, các chức năng như đăng nhập, lấy sản phẩm, quản lý đơn hàng, AI Designer, xem dữ liệu admin có thể không hoạt động đúng.

Các tools cần có trên máy:
- Node.js
- npm
- Git
- Visual Studio Code hoặc IDE tương đương
- Google Chrome hoặc Microsoft Edge

Các tools và thư viện chính đang sử dụng trong dự án:
- Vite: công cụ chạy dev server và build frontend.
- React: thư viện xây dựng giao diện người dùng.
- React DOM: render giao diện React lên trình duyệt.
- React Router DOM: quản lý điều hướng giữa các trang.
- Axios: gọi API tới backend.
- Ant Design: thư viện UI component.
- Lucide React: bộ icon dùng trong giao diện.
- React Hook Form: quản lý form.
- Yup và @hookform/resolvers: validate dữ liệu form.
- React Hot Toast và React Toastify: hiển thị thông báo.
- Recharts: vẽ biểu đồ cho trang admin.
- Three.js: xử lý đồ họa 3D.
- @react-three/fiber: tích hợp Three.js với React.
- @react-three/drei: tập hợp tiện ích hỗ trợ cho React Three Fiber.
- ESLint: kiểm tra quy tắc code.

Scripts đang có trong dự án:
- npm run dev: chạy frontend ở chế độ development.
- npm run build: build dự án cho production.
- npm run lint: kiểm tra lỗi lint.
- npm run preview: chạy thử bản build production.
