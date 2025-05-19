import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import Programs from "./components/Programs/Programs";
import Title from "./components/Title/Title";
import Contact from "./components/Contact/Contact";
import Footer from "./components/Footer/Footer";
import SignUp from "./Pages/Signup";
import Login from "./Pages/Login";
import ForgotPassword from "./Pages/ForgetPassword";
import ResetPassword from "./Pages/ResetPassword"; // Added import for ResetPassword
import TenderForm from "./Pages/TenderForm";
import TenderDashboard from "./Pages/TenderDashboard";
import ViewProjectStatus from "./Pages/ViewProjectStatus";
import MaterialListing from "./Pages/MaterialListing";
import CostEstimator from "./Pages/CostEstimator";
import VerifyEmail from "./Pages/VerifyEmail";

const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbarRoutes = ["/signup", "/login", "/forgot-password", "/reset-password"];

  return (
    <>
      {!hideNavbarRoutes.includes(location.pathname) && <Navbar />}
      {children}
      {!hideNavbarRoutes.includes(location.pathname) && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Home Route */}
          <Route
            path="/"
            element={
              <>
                <Hero />
                <div className="container">
                  <Title subTitle="Our Services" title="What We Offer" />
                  <Programs />
                  <Title subTitle="Contact Us" title="Get in Touch" />
                  <Contact />
                </div>
              </>
            }
          />

          {/* Auth Routes */}
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/view-project-status" element={<ViewProjectStatus />} />
          <Route path="/material-listing" element={<MaterialListing />} />

          {/* Tender Routes */}
          <Route
            path="/tender"
            element={
              <div className="container">
                <TenderForm />
              </div>
            }
          />

          <Route
            path="/tender-dashboard"
            element={
              <div className="container">
                <TenderDashboard />
              </div>
            }
          />

          {/* Cost Estimator Route */}
          <Route
            path="/cost-estimator"
            element={
              <div className="container">
                <CostEstimator />
              </div>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;