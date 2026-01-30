import React, { useState } from "react";
import { loginPageStyles } from "../assets/dummyStyles";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { ArrowLeft, Eye, EyeOff, Lock, User } from "lucide-react";
import { useCart } from "../CartContext";
import axios from "axios";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { loadCart } = useCart();

  const API_BASE = "http://localhost:4000";

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic form validation
    if (!email || !password) {
      toast.error("Please fill in all fields.", {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
      });
      return;
    }

    if (!rememberMe) {
      toast.error("You must agree to remember me.", {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
      });
      return;
    }

    setSubmitting(true);

    try {
      const resp = await axios.post(
        `${API_BASE}/api/auth/login`,
        {
          email: email.trim().toLowerCase(),
          password,
        },
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      const data = resp.data;
      console.log(data);

      if (data && data.token) {
        if (rememberMe) {
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("user", JSON.stringify(data.user ?? {}));
          localStorage.setItem("isLoggedIn", "true");
        } else {
          sessionStorage.setItem("authToken", data.token);
          sessionStorage.setItem("user", JSON.stringify(data.user ?? {}));
          sessionStorage.setItem("isLoggedIn", "true");
        }

        try {
          window.dispatchEvent(
            new CustomEvent("autoChanged", { detail: { loggedIn: true } }),
          );
        } catch (err) {
          // ignore
        }

        // Show success toast
        toast.success("Login successful!", {
          position: "top-right",
          autoClose: 1200,
          theme: "light",
        });

        // Redirect to home after short delay so user sees the toast
        setTimeout(() => {
          navigate("/");
        }, 1250);
      } else {
        toast.error(data.message || "Unpexted error coming from the server", {
          postion: "top-right",
          autoClose: 4000,
          theme: "light",
        });
      }
    } catch (err) {
      const serverMsg = err?.response?.data?.message;
      const status = err?.response?.status;

      if (status === 401) {
        toast.error(serverMsg || "Invalid email or password.", {
          position: "top-right",
          autoClose: 4000,
          theme: "light",
        });
      } else if (status === 409) {
        toast.error(serverMsg || "Conflict: user exists.", {
          position: "top-right",
          autoClose: 4000,
          theme: "light",
        });
      } else if (serverMsg) {
        toast.error(serverMsg, {
          position: "top-right",
          autoClose: 4000,
          theme: "light",
        });
      } else {
        toast.error("Server error. Please try again later.", {
          position: "top-right",
          autoClose: 4000,
          theme: "light",
        });
      }
      console.error("Login error:", err?.response ?? err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={loginPageStyles.pageContainer}
      style={{ fontFamily: "'Playfair Display', serif" }}
    >
      <ToastContainer />
      <div className={loginPageStyles.mainContent}>
        <button
          onClick={() => navigate("/")}
          className={loginPageStyles.backButton}
        >
          <ArrowLeft className="h-5 w-5 text-gray-800" />
          <span className={loginPageStyles.backButtonText}>Back to Home</span>
        </button>

        {/* main card */}
        <div className={loginPageStyles.loginCard}>
          <div className={loginPageStyles.decorativeTopLeft}></div>
          <div className={loginPageStyles.decorativeBottomRight}></div>

          <h2 className={loginPageStyles.cardTitle}>Welcome Back</h2>
          <p className={loginPageStyles.cardSubtitle}>
            Sign in to your account
          </p>

          <form onSubmit={handleSubmit}>
            <div className={loginPageStyles.formField}>
              <label htmlFor="email" className={loginPageStyles.formLabel}>
                Email
              </label>
              <div className={loginPageStyles.inputContainer}>
                <div className={loginPageStyles.inputIconContainer}>
                  <User className={loginPageStyles.inputIcon} />
                </div>
                <input
                  type="email"
                  id="email"
                  className={loginPageStyles.inputBase}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div className={loginPageStyles.formField}>
              <label htmlFor="password" className={loginPageStyles.formLabel}>
                Password
              </label>
              <div className={loginPageStyles.inputContainer}>
                <div className={loginPageStyles.inputIconContainer}>
                  <Lock className={loginPageStyles.inputIcon} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className={loginPageStyles.passwordInputBase}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={submitting}
                />

                <button
                  type="button"
                  className={loginPageStyles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className={loginPageStyles.inputIcon} />
                  ) : (
                    <Eye className={loginPageStyles.inputIcon} />
                  )}
                </button>
              </div>
            </div>

            <div className={loginPageStyles.rememberMeContainer}>
              <div className={loginPageStyles.checkboxContainer}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  className={loginPageStyles.checkbox}
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  disabled={submitting}
                />
              </div>
              <div className={loginPageStyles.checkboxLabelContainer}>
                <label
                  htmlFor="rememberMe"
                  className={loginPageStyles.checkboxLabel}
                >
                  Remember Me{" "}
                  <span className={loginPageStyles.requiredStar}>*</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className={`${loginPageStyles.submitButton} ${submitting ? loginPageStyles.submitButtonDisabled : ""}`}
            >
              {submitting ? "Sign in..." : "Login"}
            </button>
          </form>

          <div className={loginPageStyles.signupContainer}>
            <span className={loginPageStyles.signupText}>
              Don't have an account?{" "}
            </span>
            <a href="/signup" className={loginPageStyles.signupLink}>
              Sign up
            </a>
          </div>
        </div>
      </div>

      {/* Add font import */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');`}
      </style>
    </div>
  );
};

export default LoginPage;
