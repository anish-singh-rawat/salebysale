import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    role: "buyer",
    name: "",
    email: "",
    phone: "",
    password: "Demo@123",
    shopName: "",
    gst: "",
    address: "",
    area: "Jwalapur",
  });
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/app");
    } catch (err) {
      setError(err.message);
    }
  }

  // Password strength
  const pwLen = form.password.length;
  const pwStrength = pwLen === 0 ? 0 : pwLen < 6 ? 1 : pwLen <= 10 ? 2 : 3;
  const pwStrengthColor = ["#e5e7eb", "#ef4444", "#f59e0b", "#10b981"][pwStrength];
  const pwStrengthWidth = ["0%", "33%", "66%", "100%"][pwStrength];
  const pwStrengthLabel = ["", "Weak", "Medium", "Strong"][pwStrength];

  return (
    <div
      className="register-page auth-page-reset"
      style={{ width: "100%", maxWidth: "100%", margin: 0 }}
    >
      <div className="register-card">
        {/* Brand header */}
        <Link to="/" className="register-brand" style={{ textDecoration: "none" }}>
          <div className="register-mark">S</div>
          <div>
            <div className="register-title">Onboard dukaan</div>
            <div className="register-sub">Submit your KYC to get started</div>
          </div>
        </Link>

        {error && (
          <div className="auth-error" style={{ marginBottom: 16 }}>
            <span>⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 0 }}>
          {/* Role selector */}
          <p className="section-header">Account Type</p>
          <div className="role-toggle">
            <div
              className={`role-card${form.role === "buyer" ? " active" : ""}`}
              onClick={() => setForm({ ...form, role: "buyer" })}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setForm({ ...form, role: "buyer" })}
              aria-pressed={form.role === "buyer"}
            >
              <span className="role-card-icon">🛍️</span>
              <span className="role-card-label">Retailer</span>
              <span className="role-card-sub">Buyer / Retailer</span>
            </div>
            <div
              className={`role-card${form.role === "supplier" ? " active" : ""}`}
              onClick={() => setForm({ ...form, role: "supplier" })}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setForm({ ...form, role: "supplier" })}
              aria-pressed={form.role === "supplier"}
            >
              <span className="role-card-icon">🏭</span>
              <span className="role-card-label">Wholesaler</span>
              <span className="role-card-sub">Supplier / Wholesaler</span>
            </div>
          </div>

          {/* Account Details */}
          <p className="section-header">Account Details</p>
          <div className="register-form-grid" style={{ marginBottom: 14 }}>
            <div>
              <label className="register-label" htmlFor="admin-reg-name">Full Name</label>
              <div className="register-input-wrap">
                <span className="register-input-icon">👤</span>
                <input
                  id="admin-reg-name"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Your full name"
                  required
                />
              </div>
            </div>
            <div>
              <label className="register-label" htmlFor="admin-reg-phone">Phone Number</label>
              <div className="register-input-wrap">
                <span className="register-input-icon">📱</span>
                <input
                  id="admin-reg-phone"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label className="register-label" htmlFor="admin-reg-email">Email Address</label>
            <div className="register-input-wrap">
              <span className="register-input-icon">📧</span>
              <input
                id="admin-reg-email"
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: 6 }}>
            <label className="register-label" htmlFor="admin-reg-password">Password</label>
            <div className="register-input-wrap">
              <span className="register-input-icon">🔒</span>
              <input
                id="admin-reg-password"
                type="password"
                value={form.password}
                onChange={set("password")}
                placeholder="Create a password"
              />
            </div>
            {/* Password strength indicator */}
            <div className="pw-strength-bar">
              <div
                className="pw-strength-fill"
                style={{ width: pwStrengthWidth, background: pwStrengthColor }}
              />
            </div>
            {pwStrength > 0 && (
              <div style={{ fontSize: 11, marginTop: 4, color: pwStrengthColor, fontWeight: 600 }}>
                {pwStrengthLabel} password
              </div>
            )}
          </div>

          {/* Business Info — only when not rider */}
          {form.role !== "rider" && (
            <>
              <p className="section-header">Business Information</p>
              <div style={{ marginBottom: 14 }}>
                <label className="register-label" htmlFor="admin-reg-shop">Shop Name</label>
                <div className="register-input-wrap">
                  <span className="register-input-icon">🏪</span>
                  <input
                    id="admin-reg-shop"
                    value={form.shopName}
                    onChange={set("shopName")}
                    placeholder="Your shop or business name"
                  />
                </div>
              </div>
              <div className="register-form-grid" style={{ marginBottom: 14 }}>
                <div>
                  <label className="register-label" htmlFor="admin-reg-gst">GST Number</label>
                  <div className="register-input-wrap">
                    <span className="register-input-icon">📋</span>
                    <input
                      id="admin-reg-gst"
                      value={form.gst}
                      onChange={set("gst")}
                      placeholder="GST (optional)"
                    />
                  </div>
                </div>
                <div>
                  <label className="register-label" htmlFor="admin-reg-area">Area</label>
                  <div className="register-input-wrap">
                    <span className="register-input-icon">📍</span>
                    <input
                      id="admin-reg-area"
                      value={form.area}
                      onChange={set("area")}
                      placeholder="Area / locality"
                    />
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label className="register-label" htmlFor="admin-reg-address">Address</label>
                <div className="register-input-wrap">
                  <span className="register-input-icon">🏠</span>
                  <input
                    id="admin-reg-address"
                    value={form.address}
                    onChange={set("address")}
                    placeholder="Full business address"
                  />
                </div>
              </div>
            </>
          )}

          {/* Terms */}
          <div className="register-terms" style={{ marginBottom: 20, marginTop: 8 }}>
            <div className="register-check" aria-hidden="true">
              <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                <path d="M1 4L4.5 7.5L11 1" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>I agree to the <a href="#" style={{ color: "#6366f1" }}>Terms of Service</a> and <a href="#" style={{ color: "#6366f1" }}>Privacy Policy</a></span>
          </div>

          <button type="submit" className="auth-btn">
            Submit KYC (pending admin) →
          </button>
        </form>

        <div className="auth-links-row" style={{ marginTop: 20 }}>
          <span>Already have an account? <Link to="/login">Sign In</Link></span>
        </div>
      </div>
    </div>
  );
}
