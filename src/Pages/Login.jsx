import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth, db } from "./Firebase";
import { doc, getDoc } from "firebase/firestore";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-toastify";
import ReCAPTCHA from "react-google-recaptcha";
import logo from "../assets/logo.png";
import SigninWithGoogle from "./signinwithgoogle";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);
  const [error, setError] = useState("");
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Check for reset password success message from ResetPassword component
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after showing it
      window.history.replaceState({}, document.title);
    }
    
    const rememberedUser = localStorage.getItem("rememberedUser");
    if (rememberedUser) {
      const { email } = JSON.parse(rememberedUser);
      setCredentials((prev) => ({
        ...prev,
        email,
        rememberMe: true,
      }));
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("User signed in:", user);

      if (!user.emailVerified) {
        // Give option to resend verification email
        toast.warning("Please verify your email before logging in.");
        console.warn("Email not verified.");
        return { success: false, user, reason: "unverified" };
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        toast.error("User data not found. Please sign up again.");
        console.warn("Firestore user not found.");
        return { success: false, user: null, reason: "no_data" };
      }

      return { success: true, user, userData: userDoc.data() };
    } catch (error) {
      console.error("Login error:", error);
      
      // Provide more specific error messages
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        return { 
          success: false, 
          user: null, 
          reason: "invalid_credentials",
          error: new Error("Invalid email or password. Please try again.")
        };
      } else if (error.code === "auth/too-many-requests") {
        return {
          success: false,
          user: null,
          reason: "too_many_attempts",
          error: new Error("Too many failed login attempts. Please try again later or reset your password.")
        };
      }
      
      return { success: false, user: null, reason: "auth_error", error };
    }
  };

  const resendVerification = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        credentials.email, 
        credentials.password
      );
      await sendEmailVerification(userCredential.user);
      setEmailVerificationSent(true);
      toast.success("Verification email sent. Please check your inbox.");
    } catch (error) {
      toast.error("Failed to send verification email: " + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setEmailVerificationSent(false);

    if (!captchaValue) {
      toast.error("Please verify that you're not a robot.");
      return;
    }

    setIsLoading(true);
    const { email, password, rememberMe } = credentials;

    try {
      const result = await handleLogin(email, password);
      
      if (!result.success) {
        if (result.reason === "unverified" && result.user) {
          setError("Please verify your email before logging in.");
          setIsLoading(false);
          return;
        }
        throw result.error || new Error(result.reason);
      }

      toast.success(`Welcome back, ${result.userData.fullName || email}!`);
      const token = await result.user.getIdToken();
      localStorage.setItem("authToken", token);

      if (rememberMe) {
        localStorage.setItem("rememberedUser", JSON.stringify({ email }));
      } else {
        localStorage.removeItem("rememberedUser");
      }
      
      console.log("Redirecting to home...");
      navigate("/");
    } catch (err) {
      console.error(err.message);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src={logo} alt="Company Logo" className="login-logo" />
          <h2>Welcome Back</h2>
          <p>Please login to your account</p>
        </div>

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <input
                id="email"
                type="email"
                name="email"
                placeholder="your@email.com"
                value={credentials.email}
                onChange={handleChange}
                required
              />
              <FiMail className="input-icon" />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={handleChange}
                required
                className="password-input"
              />
              <button
                type="button"
                className="password-toggle-fixed"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input
                type="checkbox"
                name="rememberMe"
                checked={credentials.rememberMe}
                onChange={handleChange}
              />
              <span className="remember-me-text">Remember me</span>
            </label>
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>

          <div className="input-group">
            <ReCAPTCHA
              sitekey="6LfoGCArAAAAALTEEYs3y1ETt-dAdex13sjrU2rh"
              onChange={(value) => setCaptchaValue(value)}
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
              {error.includes("verify your email") && !emailVerificationSent && (
                <button 
                  type="button" 
                  onClick={resendVerification}
                  className="resend-verification-button"
                >
                  Resend verification email
                </button>
              )}
              {emailVerificationSent && (
                <p className="verification-sent-message">
                  Verification email sent. Please check your inbox.
                </p>
              )}
            </div>
          )}

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : (
              "Log In"
            )}
          </button>
        </form>

        <div className="separator">
          <span>or</span>
        </div>

        <center>
          <SigninWithGoogle />
        </center>

        <div className="login-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/signup" className="signup-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;