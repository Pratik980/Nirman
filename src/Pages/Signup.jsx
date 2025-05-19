import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification
} from "firebase/auth";
import { auth, db } from "./Firebase"; // Updated import path
import { doc, setDoc } from "firebase/firestore";
import { FiUser, FiMail, FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-toastify";
import ReCAPTCHA from "react-google-recaptcha";
import logo from "../assets/logo.png";
import "react-toastify/dist/ReactToastify.css";
import "./SignUp.css";

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [capVal, setCapVal] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "homeowner",
    agreeToTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const { fullName, email, password, confirmPassword, agreeToTerms, userType } = formData;

    if (!fullName || !email || !password || !confirmPassword) {
      toast.error("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    if (!agreeToTerms) {
      toast.error("You must agree to the terms and conditions");
      setIsLoading(false);
      return;
    }

    if (!capVal) {
      toast.error("Please verify the reCAPTCHA");
      setIsLoading(false);
      return;
    }

    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Send email verification
      await sendEmailVerification(user);

      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullName,
        email,
        userType,
        createdAt: new Date(),
        emailVerified: false
      });

      toast.success("Signup successful! Please check your email to verify your account.");
      navigate("/login");
    } catch (error) {
      console.error("Firebase signup error:", error);
      toast.error(`Signup failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Save Google user to Firestore if new
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        fullName: user.displayName || "",
        email: user.email,
        userType: "homeowner", // default
        createdAt: new Date(),
        emailVerified: true
      }, { merge: true });

      toast.success("Signed in with Google!");
      navigate("/");
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error(`Google sign-in failed: ${error.message}`);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <img src={logo} alt="Company Logo" className="signup-logo" />
          <h2>Create Your Account</h2>
          <p>Join us to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="input-group">
            <label htmlFor="userType">I am signing up as a</label>
            <select
              id="userType"
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              className="user-type-select"
            >
              <option value="homeowner">Homeowner</option>
              <option value="contractor">Contractor</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="fullName">Full Name</label>
            <div className="input-with-icon">
              <input
                type="text"
                name="fullName"
                id="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
              <FiUser className="input-icon" />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <input
                type="email"
                name="email"
                id="email"
                placeholder="you@example.com"
                value={formData.email}
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
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={handleChange}
                minLength="8"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="password-toggle-fixed"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                id="confirmPassword"
                placeholder="Repeat your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                minLength="8"
                required
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="password-toggle-fixed"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="terms-container">
            <div className="terms-checkbox-container">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="terms-checkbox"
              />
            </div>
            <label htmlFor="agreeToTerms" className="terms-label">
              I agree to the <Link to="/terms">Terms of Service</Link> and{" "}
              <Link to="/privacy">Privacy Policy</Link>
            </label>
          </div>

          <div className="recaptcha-container">
            <ReCAPTCHA
              sitekey="6LfoGCArAAAAALTEEYs3y1ETt-dAdex13sjrU2rh"
              onChange={(value) => setCapVal(value)}
            />
          </div>

          <button type="submit" className="signup-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="separator">
          <span>or</span>
        </div>

        <center>
          <button onClick={handleGoogleSignIn} className="google-signin-button">
            Continue with Google
          </button>
        </center>

        <div className="signup-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="login-link">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;