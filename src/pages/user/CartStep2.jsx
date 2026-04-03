import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CartStep2() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // 👉 lưu tạm (sang step 3 dùng)
    localStorage.setItem("checkout", JSON.stringify(form));

    navigate("/payment"); // bước tiếp
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Thông tin giao hàng</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Tên"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="SĐT"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          placeholder="Địa chỉ"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />

        <button type="submit">Tiếp tục</button>
      </form>
    </div>
  );
}

export default CartStep2;
