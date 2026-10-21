import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="landing-root auth-page-reset" style={{ width: "100%", maxWidth: "100%", margin: 0 }}>
      {/* ── Top nav ── */}
      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <div className="landing-nav-mark">S</div>
          SaleBySale Admin
        </div>
        <div className="landing-nav-links">
          <Link className="landing-nav-btn" to="/login">Admin Sign In</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="landing-hero">
        {/* Animated background blobs */}
        <div className="landing-blob landing-blob-1" />
        <div className="landing-blob landing-blob-2" />
        <div className="landing-blob landing-blob-3" />

        <div className="hero-content">
          <div className="admin-hero-badge">
            🔐 Admin Portal
          </div>
          <h1 className="hero-headline">
            SaleBySale{" "}
            <span className="hero-headline-gradient">Admin Portal</span>
          </h1>
          <p className="hero-sub">
            Manage your platform with confidence. Control orders, verify users, resolve disputes, and monitor performance — all from one powerful dashboard.
          </p>
          <div className="hero-cta-row">
            <Link className="hero-btn-primary" to="/login">
              🔐 Access Admin Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── Platform Metrics ── */}
      <section className="landing-section" style={{ background: "#f9fafb" }}>
        <div className="landing-section-center">
          <span className="landing-section-eyebrow">Platform Overview</span>
          <h2 className="landing-section-title">Real-time platform metrics</h2>
          <p className="landing-section-sub">
            A snapshot of today's platform activity across orders, users, and revenue.
          </p>
        </div>
        <div className="admin-metrics-grid">
          <div className="admin-metric-card">
            <div className="admin-metric-icon">📦</div>
            <div className="admin-metric-value">247</div>
            <div className="admin-metric-label">Orders Today</div>
          </div>
          <div className="admin-metric-card">
            <div className="admin-metric-icon">👥</div>
            <div className="admin-metric-value">1,842</div>
            <div className="admin-metric-label">Active Users</div>
          </div>
          <div className="admin-metric-card">
            <div className="admin-metric-icon">💰</div>
            <div className="admin-metric-value">₹4.2L</div>
            <div className="admin-metric-label">Today's Revenue</div>
          </div>
          <div className="admin-metric-card">
            <div className="admin-metric-icon">⚠️</div>
            <div className="admin-metric-value">3</div>
            <div className="admin-metric-label">Open Disputes</div>
          </div>
        </div>
      </section>

      {/* ── Admin Capabilities ── */}
      <section className="landing-section">
        <div className="landing-section-center">
          <span className="landing-section-eyebrow">Admin Capabilities</span>
          <h2 className="landing-section-title">Full platform control</h2>
          <p className="landing-section-sub">
            Every tool you need to run the SaleBySale marketplace efficiently and fairly.
          </p>
        </div>
        <div className="admin-cap-grid">
          <div className="admin-cap-card">
            <span className="admin-cap-icon">📦</span>
            <h3 className="admin-cap-title">Order Management</h3>
            <p className="admin-cap-desc">
              Process, track, and manage all marketplace orders from creation through to final delivery.
            </p>
          </div>
          <div className="admin-cap-card">
            <span className="admin-cap-icon">🪪</span>
            <h3 className="admin-cap-title">User Verification</h3>
            <p className="admin-cap-desc">
              KYC approvals for buyers and suppliers, manage user status, and maintain a trusted network.
            </p>
          </div>
          <div className="admin-cap-card">
            <span className="admin-cap-icon">⚖️</span>
            <h3 className="admin-cap-title">Dispute Resolution</h3>
            <p className="admin-cap-desc">
              Handle conflicts, process refunds, and maintain a fair marketplace for all participants.
            </p>
          </div>
          <div className="admin-cap-card">
            <span className="admin-cap-icon">📊</span>
            <h3 className="admin-cap-title">Analytics Dashboard</h3>
            <p className="admin-cap-desc">
              Monitor platform performance, revenue trends, and operational metrics in real time.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="cta-banner">
        <h2 className="cta-banner-title">Ready to manage the platform?</h2>
        <p className="cta-banner-sub">
          Sign in to your admin account to access the full dashboard.
        </p>
        <div className="cta-banner-btns">
          <Link className="cta-banner-btn-white" to="/login">
            Admin Sign In
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-footer-brand">
          <div className="landing-footer-mark">S</div>
          SaleBySale Admin Portal
        </div>
        <div className="landing-footer-links">
          <Link to="/login">Sign In</Link>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
        <div className="landing-footer-copy">
          © {new Date().getFullYear()} SaleBySale. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
