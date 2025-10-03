import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { LoginContext } from "./contexts/LoginContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, authChecked } = useContext(LoginContext);

  if (!authChecked) {
    // Wait until auth check is done (can show loader instead)
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
