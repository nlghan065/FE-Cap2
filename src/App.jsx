import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

import Dashboard from "./pages/admin/Dashboard1";
import UserManagement from "./pages/admin/Customers";
import CustomerDetail from "./pages/admin/CustomerDetail";
import CustomerEdit from "./pages/admin/CustomerEdit";
import ProductsAdmin from "./pages/admin/ProductsAdmin";

import ProductEdit from "./pages/admin/ProductEdit";
import AdminProductDetail from "./pages/admin/ProductDetail";
import ProductCreate from "./pages/admin/ProductCreate";
import OrdersAdmin from "./pages/admin/OrdersAdmin";
import OrderDetail from "./pages/admin/OrderDetail";
import OrderEdit from "./pages/admin/OrderEdit";
import ReviewsAdmin from "./pages/admin/ReviewsAdmin";

import UserLayout from "./layout/user/UserLayout";
import Home from "./pages/user/Home";
import Landing from "./pages/user/Landing";
import AIDemo from "./pages/user/AIDemo";
import ViewerDemo from "./pages/user/3DDemo";
import Products from "./pages/user/Products";
import ProductDetail from "./pages/user/ProductDetail";
import AIDesignerPage from "./pages/user/AIDesignerPage";
import Viewer3DPage from "./pages/user/Viewer3DPage";
import Cart from "./pages/user/Cart";
import CartStep2 from "./pages/user/CartStep2";
import CartStep3 from "./pages/user/CartStep3";
import PaymentResult from "./pages/user/PaymentResult";
import Wishlist from "./pages/user/Wishlist";
import Profile from "./pages/user/Profile";

import OrderSuccess from "./pages/user/OrderSuccess";
import OrderFail from "./pages/user/OrderFail";
import Orders from "./pages/user/Orders";
import OrderDetailPage from "./pages/user/OrderDetailPage";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

import { DashboardRefreshProvider } from "./context/DashboardRefreshContext";
import { Toaster } from "react-hot-toast";

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
      <Toaster position="top-right" />
      <Routes>
        {/* ================= AUTH ================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ================= PUBLIC USER ================= */}
        <Route element={<UserLayout />}>
          <Route index element={<Landing />} />
          <Route path="/landing" element={<Navigate to="/" replace />} />
          <Route path="/ai-demo" element={<AIDemo />} />
          <Route path="/viewer-demo" element={<ViewerDemo />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
        </Route>

        {/* ================= PROTECTED USER ================= */}
        <Route element={<ProtectedRoute />}>
          <Route element={<UserLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/ai-designer" element={<AIDesignerPage />} />
            <Route path="/ai-design" element={<AIDesignerPage />} />
            <Route path="/viewer" element={<Viewer3DPage />} />
            <Route path="/viewer/:projectId" element={<Viewer3DPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/cart2" element={<CartStep2 />} />
            <Route path="/payment" element={<CartStep3 />} />
            <Route path="/payment-result" element={<PaymentResult />} />

            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/order-fail" element={<OrderFail />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* ================= ADMIN ================= */}
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
            <Route path="/admin/reviews" element={<ReviewsAdmin />} />
          </Route>
          <Route path="/admin/products" element={<ProductsAdmin />} />
          <Route path="/admin/products/:id" element={<AdminProductDetail />} />
          <Route path="/admin/products/:id/edit" element={<ProductEdit />} />
          <Route path="/admin/products/create" element={<ProductCreate />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
