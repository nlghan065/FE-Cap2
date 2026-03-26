import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

import Dashboard from "./pages/admin/Dashboard1";
import UserManagement from "./pages/admin/Customers";
import CustomerDetail from "./pages/admin/CustomerDetail";
import CustomerEdit from "./pages/admin/CustomerEdit";
import ProductsAdmin from "./pages/admin/ProductsAdmin";

import ProductEdit from "./pages/admin/ProductEdit";
import ProductCreate from "./pages/admin/ProductCreate";

import Home from "./pages/user/Home";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

import { DashboardRefreshProvider } from "./context/DashboardRefreshContext";
import ProductDetail from "./pages/admin/ProductDetail";

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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/customers" element={<UserManagement />} />
            <Route path="/admin/customers/:id" element={<CustomerDetail />} />
            <Route
              path="/admin/customers/:id/edit"
              element={<CustomerEdit />}
            />
          </Route>
          <Route path="/admin/products" element={<ProductsAdmin />} />
          <Route path="/admin/products/:id" element={<ProductDetail />} />

          <Route path="/admin/products/:id/edit" element={<ProductEdit />} />
          <Route path="/admin/products/create" element={<ProductCreate />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
