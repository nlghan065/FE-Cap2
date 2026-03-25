import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

import Dashboard from "./pages/admin/Dashboard1";
import UserManagement from "./pages/admin/Customers";
import CustomerDetail from "./pages/admin/CustomerDetail";
import CustomerEdit from "./pages/admin/CustomerEdit";

import UserLayout from "./layout/user/UserLayout";
import Home from "./pages/user/Home";
import Products from "./pages/user/Products";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

import { DashboardRefreshProvider } from "./context/DashboardRefreshContext";

//  Admin wrapper
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
        {/* ================= AUTH ================= */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ================= PUBLIC USER ================= */}
        <Route element={<UserLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/products" element={<Products />} />

          {/* 👉 sau này thêm */}
          {/* <Route path="/products" element={<Products />} /> */}
          {/* <Route path="/product/:id" element={<ProductDetail />} /> */}
        </Route>

        {/* ================= PROTECTED USER ================= */}
        <Route element={<ProtectedRoute />}>
          <Route element={<UserLayout />}>
            <Route path="/cart" element={<h1>Cart</h1>} />
            <Route path="/orders" element={<h1>Orders</h1>} />
            <Route path="/profile" element={<h1>Profile</h1>} />
            <Route path="/settings" element={<h1>Settings</h1>} />
            <Route path="/checkout" element={<h1>Checkout</h1>} />
          </Route>
        </Route>

        {/* ================= ADMIN ================= */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminWrapper />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/customers" element={<UserManagement />} />
            <Route path="/admin/customers/:id" element={<CustomerDetail />} />
            <Route
              path="/admin/customers/:id/edit"
              element={<CustomerEdit />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
