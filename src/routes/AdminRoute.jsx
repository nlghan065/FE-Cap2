import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const role = localStorage.getItem("role") || sessionStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "ADMIN") {
    return <Navigate to="/home" replace />;
  }

  return children;
}

export default AdminRoute;
