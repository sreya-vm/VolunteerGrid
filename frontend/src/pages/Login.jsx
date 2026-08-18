import { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    // Temporary frontend-only login
    alert("Login successful! Backend authentication will be connected later.");
  };

  return (
    <div className="login-page">

      {/* Left Section */}
      <div className="login-left">
        <div className="brand">
          <div className="brand-icon">V</div>
          <span>VolunteerGrid</span>
        </div>

        <div className="welcome-content">
          <h1>Connect. Volunteer. Make an Impact.</h1>

          <p>
            Discover meaningful volunteering opportunities and connect
            with organizations making a difference.
          </p>

          <div className="features">
            <div className="feature">
              <span>✓</span>
              <p>Discover volunteering opportunities</p>
            </div>

            <div className="feature">
              <span>✓</span>
              <p>Connect with verified NGOs</p>
            </div>

            <div className="feature">
              <span>✓</span>
              <p>Track your applications</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="login-right">
        <div className="login-card">

          <h2>Welcome Back</h2>

          <p className="login-subtitle">
            Login to continue to VolunteerGrid
          </p>

          <form onSubmit={handleLogin}>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <div className="password-label">
                <label htmlFor="password">Password</label>

                <Link to="/forgot-password">
                  Forgot Password?
                </Link>
              </div>

              <div className="password-container">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  className="show-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button type="submit" className="login-button">
              Login
            </button>

          </form>

          {/* Register */}
          <div className="register-section">
            <p>Don't have an account?</p>

            <div className="register-buttons">
              <Link to="/register/user">
                Register as Volunteer
              </Link>

              <Link to="/register/ngo">
                Register as NGO
              </Link>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Login;