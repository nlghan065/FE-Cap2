import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

import Dashboard from "./pages/admin/Dashboard1";
import UserManagement from "./pages/admin/Customers";
import CustomerDetail from "./pages/admin/CustomerDetail";
import CustomerEdit from "./pages/admin/CustomerEdit";
import OrdersAdmin from "./pages/admin/OrdersAdmin";
import OrderDetail from "./pages/admin/OrderDetail";
import OrderEdit from "./pages/admin/OrderEdit";

import Home from "./pages/user/Home";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

import { DashboardRefreshProvider } from "./context/DashboardRefreshContext";

// wrapper riêng cho admin
function AdminWrapper() {
  return (
    <DashboardRefreshProvider>
      <Outlet />
    </DashboardRefreshProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* AUTH */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* USER */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
        </Route>

        {/* ADMIN */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminWrapper />}>
            {/* DASHBOARD */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* CUSTOMERS */}
            <Route path="/admin/customers" element={<UserManagement />} />
            <Route path="/admin/customers/:id" element={<CustomerDetail />} />
            <Route
              path="/admin/customers/:id/edit"
              element={<CustomerEdit />}
            />

            {/* ORDERS */}
            <Route path="/admin/orders" element={<OrdersAdmin />} />
            <Route path="/admin/orders/:id" element={<OrderDetail />} />
            <Route path="/admin/orders/:id/edit" element={<OrderEdit />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
