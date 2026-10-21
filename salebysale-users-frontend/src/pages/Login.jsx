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
      const user = await login(email, password, { app: "users" });
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

          <h2 className="auth-left-tagline">
            The smarter way to trade mobiles wholesale.
          </h2>
          <p className="auth-left-sub">
            Connect retailers and wholesalers on one trusted platform. Transparent pricing, fast fulfilment, zero hassle.
          </p>

          <div className="trust-points">
            <div className="trust-point">
              <div className="trust-point-icon">✓</div>
              10,000+ products listed
            </div>
            <div className="trust-point">
              <div className="trust-point-icon">✓</div>
              Verified suppliers only
            </div>
            <div className="trust-point">
              <div className="trust-point-icon">✓</div>
              Secure &amp; fast payments
            </div>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="auth-right">
          <div className="auth-card fade-in">
            <h1 className="auth-card-title">Welcome back</h1>
            <p className="auth-card-sub">Sign in to your SaleBySale account</p>

            {error && (
              <div className="auth-error">
                <span>⚠️</span>
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
              {/* Email */}
              <div>
                <label className="auth-label" htmlFor="login-email">Email address</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">📧</span>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="auth-label" htmlFor="login-password">Password</label>
                <div className="auth-input-wrap has-toggle">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    id="login-password"
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
              <span>Don't have an account? <Link to="/register">Register</Link></span>
              <Link to="/login" style={{ color: "#9ca3af", fontWeight: 400 }}>Forgot password?</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
