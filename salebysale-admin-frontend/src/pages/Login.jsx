import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password, { app: "admin" });
      navigate("/app");
      return user;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page-reset" style={{ width: "100%", maxWidth: "100%", margin: 0 }}>
      <div className="auth-split">
        {/* ── Left brand panel ── */}
        <div className="auth-left">
          <Link to="/" className="auth-left-logo" style={{ textDecoration: "none" }}>
            <div className="auth-left-mark">S</div>
            <span className="auth-left-brand-name">SaleBySale</span>
          </Link>

          <div className="admin-badge">
            🔐 Admin Portal
          </div>

          <h2 className="auth-left-tagline">
            Platform control at your fingertips.
          </h2>
          <p className="auth-left-sub">
            Manage orders, verify users, resolve disputes and monitor the entire marketplace — all from one dashboard.
          </p>

          <div className="trust-points">
            <div className="trust-point">
              <div className="trust-point-icon">🛡️</div>
              Authorized personnel only
            </div>
            <div className="trust-point">
              <div className="trust-point-icon">📊</div>
              Real-time analytics &amp; insights
            </div>
            <div className="trust-point">
              <div className="trust-point-icon">⚡</div>
              Full platform oversight
            </div>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="auth-right">
          <div className="auth-card fade-in">
            <h1 className="auth-card-title">Admin Sign In</h1>
            <p className="auth-card-sub">Authorized personnel only</p>

            {error && (
              <div className="auth-error">
                <span>⚠️</span>
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
              {/* Email */}
              <div>
                <label className="auth-label" htmlFor="admin-login-email">Email address</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">📧</span>
                  <input
                    id="admin-login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@salebysale.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="auth-label" htmlFor="admin-login-password">Password</label>
                <div className="auth-input-wrap has-toggle">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    id="admin-login-password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="auth-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="auth-btn-spinner" />
                    Signing in…
                  </>
                ) : (
                  "Sign In →"
                )}
              </button>
            </form>

            <div className="auth-links-row">
              <span>Need access? <Link to="/register">Request account</Link></span>
              <Link to="/login" style={{ color: "#9ca3af", fontWeight: 400 }}>Forgot password?</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
