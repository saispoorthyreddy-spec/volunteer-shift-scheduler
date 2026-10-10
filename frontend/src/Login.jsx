import { useState } from "react";
import api from "./api";
import "./Login.css";

function Login({ onLoginSuccess, goToPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.login({
        email: email.trim(),
        password: password,
      });

      if (onLoginSuccess) {
        onLoginSuccess(res);
      }
    } catch (err) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="login-section">
      <div className="login-card">
        <button
          className="login-brand"
          onClick={() => goToPage && goToPage("home")}
          type="button"
        >
          <span className="login-brand-icon">V</span>
          <span>
            Volunteer<span>Hub</span>
          </span>
        </button>

        <div className="login-heading">
          <p className="login-eyebrow">WELCOME BACK</p>
          <h1>Sign in to your account</h1>
          <p>Continue your volunteering journey and make every hour count.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              autoComplete="email"
              disabled={loading}
              required
            />
          </div>

          <div className="login-form-group">
            <div className="label-with-action">
              <label htmlFor="login-password">Password</label>
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              autoComplete="current-password"
              disabled={loading}
              required
            />
          </div>

          {error && (
            <div className="form-alert error-alert" role="alert">
              <span>⚠️</span> {error}
            </div>
          )}

          <button
            className="login-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Log In →"}
          </button>
        </form>

        <p className="login-register-link">
          Don't have an account?{" "}
          <button
            type="button"
            className="text-link-btn"
            onClick={() => goToPage && goToPage("register")}
          >
            Create an account
          </button>
        </p>

        <p className="login-note">
          Bringing communities and volunteers together.
        </p>
      </div>
    </section>
  );
}

export default Login;
