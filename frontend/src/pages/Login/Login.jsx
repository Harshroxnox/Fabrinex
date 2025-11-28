import { ShoppingBag, Eye, EyeOff } from "lucide-react";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "../../contexts/LoginContext";
import "./Login.css";
import toast from "react-hot-toast";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { login, error, GetRole } = useContext(LoginContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(form);
      if (res.message === "success") {
        toast.success("Login successful!");
        navigate("/");
      } else {
        toast.error("Wrong credentials - User not found");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-left-section">
        <div className="login-logo">
          <div className="login-logo-dots">
            <ShoppingBag />
          </div>
          NOOR
        </div>

        <h1 className="login-main-heading">
          Seamless Login for Exclusive Access
        </h1>

        <p className="login-subtitle">
          Immerse yourself in a hassle-free login journey with our intuitively
          designed login form. Effortlessly access your account.
        </p>
      </div>

      <div className="login-card">
        <h2 className="login-card-title">Admin</h2>

        <div>
          <div className="login-form-group">
            <input
              type="text"
              className="login-form-input"
              placeholder="login"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="login-form-group password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              className="login-form-input password-input"
              placeholder="Password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button onClick={handleSubmit} className="login-button">
            Log in
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default Login;