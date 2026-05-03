import { Navigate } from "react-router-dom";

const GlobalRoleGuard = ({ children }) => {
  let user;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default GlobalRoleGuard;
