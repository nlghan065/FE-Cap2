import { useEffect, useState } from "react";
import { getOrdersApi, cancelOrderApi } from "../../api/orderApi";

function OrderHistory() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const res = await getOrdersApi(0, 10);
    setOrders(res.data.data.content || []);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const cancelOrder = async (id) => {
    await cancelOrderApi(id);
    fetchOrders();
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Đơn hàng của tôi</h2>

      {orders.map((o) => (
        <div
          key={o.id}
          style={{ borderBottom: "1px solid #ddd", marginBottom: 10 }}
        >
          <p>Mã: {o.id}</p>
          <p>Trạng thái: {o.status}</p>
          <p>Tổng tiền: {o.totalPrice}</p>

          {o.status === "PENDING" && (
            <button onClick={() => cancelOrder(o.id)}>Huỷ đơn</button>
          )}
        </div>
      ))}
    </div>
  );
}

export default OrderHistory;
