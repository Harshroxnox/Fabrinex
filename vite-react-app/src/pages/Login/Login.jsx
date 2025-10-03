import { ShoppingBag } from "lucide-react";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "../../contexts/LoginContext";
import "./Login.css"; // switched to normal CSS
import toast from "react-hot-toast";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login, error, GetRole } = useContext(LoginContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(form); // wait for the promise to resolve
      if (res.message === "success") {
        toast.success("Login successful!");
        navigate("/admin");
      } else {
        toast.error("Wrong credentials - User not found");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
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
              placeholder="username"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="login-form-group">
            <input
              type="password"
              className="login-form-input"
              placeholder="Password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
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
