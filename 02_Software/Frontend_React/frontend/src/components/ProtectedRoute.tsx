import type { JSX } from "react";
import { Navigate, Outlet } from "react-router-dom";


interface ProtectedRouteProps {
  role?: "student" | "teacher";
}

export default function ProtectedRoute({ role }: ProtectedRouteProps): JSX.Element {
  const token = localStorage.getItem("token");


  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      if (payload.role !== role) {
        return <Navigate to={payload.role === "student" ? "/student" : "/teacher"} replace />;
      }
    } catch (e) {
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
}