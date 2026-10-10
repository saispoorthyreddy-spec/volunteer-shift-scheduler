import { useState } from "react";
import api from "./api";
import "./Auth.css";

function Register({ onLoginSuccess, goToPage }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "VOLUNTEER",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (formData.fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.register({
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });

      setSuccessMessage("Account created successfully! Redirecting...");
      if (onLoginSuccess) {
        onLoginSuccess(res);
      }
    } catch (err) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="register-section">
      <div className="register-card">
        <button
          className="register-brand"
          onClick={() => goToPage && goToPage("home")}
          type="button"
        >
          <span className="register-brand-icon">V</span>
          <span>
            Volunteer<span>Hub</span>
          </span>
        </button>

        <div className="register-heading">
          <p className="register-eyebrow">JOIN OUR COMMUNITY</p>
          <h1>Create your account</h1>
          <p>Start volunteering, discover events, and make a difference.</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="e.g. Sarah Jenkins"
              value={formData.fullName}
              onChange={handleChange}
              autoComplete="name"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">I want to join as</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="VOLUNTEER">Volunteer (Explore & join shifts)</option>
              <option value="ORGANIZER">Event Organizer (Create & manage events)</option>
            </select>
          </div>

          <div className="form-row-grid">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Min. 8 characters"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={8}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={loading}
                required
              />
            </div>
          </div>

          {error && (
            <div className="form-alert error-alert" role="alert">
              <span>⚠️</span> {error}
            </div>
          )}

          {successMessage && (
            <div className="form-alert success-alert" role="status">
              <span>✓</span> {successMessage}
            </div>
          )}

          <button
            type="submit"
            className="register-submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account →"}
          </button>
        </form>

        <p className="register-footer">
          Already have an account?{" "}
          <button
            type="button"
            className="text-link-btn"
            onClick={() => goToPage && goToPage("login")}
          >
            Log in
          </button>
        </p>

        <p className="register-terms">
          By joining, you agree to VolunteerHub's terms of service and community guidelines.
        </p>
      </div>
    </section>
  );
}

export default Register;
