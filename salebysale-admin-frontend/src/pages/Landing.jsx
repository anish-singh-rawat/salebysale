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
      <section className="landing-hero admin-hero-gradient">
        <div className="landing-blob landing-blob-1" />
        <div className="landing-blob landing-blob-2" />
        <div className="landing-blob landing-blob-3" />
        <div className="hero-split">
          {/* LEFT: text */}
          <div className="hero-split-left">
            <div className="admin-hero-badge">🔐 Admin Portal</div>
            <h1 className="hero-headline">SaleBySale <span className="hero-headline-gradient">Admin Portal</span></h1>
            <p className="hero-sub">Manage your platform with confidence. Control orders, verify users, resolve disputes, and monitor performance — all from one powerful dashboard.</p>
            <div className="hero-cta-row">
              <Link className="hero-btn-primary" to="/login">🔐 Access Admin Dashboard</Link>
            </div>
            <div className="hero-trust-row">
              <span>✅ Real-time Analytics</span>
              <span>✅ Secure Access</span>
              <span>✅ Full Control</span>
            </div>
          </div>
          {/* RIGHT: admin dashboard mockup */}
          <div className="hero-split-right">
            <div className="hero-visual-blob" />
            <div className="admin-dashboard-mockup">
              <div className="adm-mockup-header">
                <div className="adm-mockup-dot adm-dot-red" />
                <div className="adm-mockup-dot adm-dot-yellow" />
                <div className="adm-mockup-dot adm-dot-green" />
                <span className="adm-mockup-title">SaleBySale Admin Dashboard</span>
              </div>
              <div className="adm-mockup-metrics">
                <div className="adm-mini-metric">
                  <div className="adm-mini-metric-value">247</div>
                  <div className="adm-mini-metric-label">Orders Today</div>
                </div>
                <div className="adm-mini-metric adm-metric-green">
                  <div className="adm-mini-metric-value">₹4.2L</div>
                  <div className="adm-mini-metric-label">Revenue</div>
                </div>
                <div className="adm-mini-metric adm-metric-purple">
                  <div className="adm-mini-metric-value">1,842</div>
                  <div className="adm-mini-metric-label">Users</div>
                </div>
              </div>
              <div className="adm-mockup-chart">
                <div className="adm-chart-label">Weekly Orders</div>
                <div className="adm-chart-bars">
                  <div className="adm-bar" style={{height: "40%"}}><span>M</span></div>
                  <div className="adm-bar" style={{height: "65%"}}><span>T</span></div>
                  <div className="adm-bar" style={{height: "50%"}}><span>W</span></div>
                  <div className="adm-bar" style={{height: "80%"}}><span>T</span></div>
                  <div className="adm-bar" style={{height: "60%"}}><span>F</span></div>
                  <div className="adm-bar adm-bar-today" style={{height: "95%"}}><span>S</span></div>
                  <div className="adm-bar" style={{height: "45%"}}><span>S</span></div>
                </div>
              </div>
              <div className="adm-mockup-table">
                <div className="adm-table-row adm-table-header">
                  <span>Order</span><span>Status</span><span>Amount</span>
                </div>
                <div className="adm-table-row">
                  <span>#4521</span>
                  <span className="adm-status-badge adm-status-delivered">Delivered</span>
                  <span>₹28,999</span>
                </div>
                <div className="adm-table-row">
                  <span>#4520</span>
                  <span className="adm-status-badge adm-status-pending">Pending</span>
                  <span>₹15,499</span>
                </div>
                <div className="adm-table-row">
                  <span>#4519</span>
                  <span className="adm-status-badge adm-status-processing">Processing</span>
                  <span>₹42,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Platform Metrics ── */}
      <section className="landing-section" style={{background: "#f9fafb"}}>
        <div className="landing-section-center">
          <span className="landing-section-eyebrow">Platform Overview</span>
          <h2 className="landing-section-title">Real-time platform metrics</h2>
          <p className="landing-section-sub">A snapshot of today's platform activity across orders, users, and revenue.</p>
        </div>
        <div className="admin-metrics-grid">
          <div className="admin-metric-card">
            <div className="admin-metric-icon">📦</div>
            <div className="admin-metric-value">247</div>
            <div className="admin-metric-label">Orders Today</div>
            <div className="admin-metric-trend admin-trend-up">↑ +12% vs yesterday</div>
          </div>
          <div className="admin-metric-card">
            <div className="admin-metric-icon">👥</div>
            <div className="admin-metric-value">1,842</div>
            <div className="admin-metric-label">Active Users</div>
            <div className="admin-metric-trend admin-trend-up">↑ +8% this week</div>
          </div>
          <div className="admin-metric-card">
            <div className="admin-metric-icon">💰</div>
            <div className="admin-metric-value">₹4.2L</div>
            <div className="admin-metric-label">Today's Revenue</div>
            <div className="admin-metric-trend admin-trend-up">↑ +18% vs yesterday</div>
          </div>
          <div className="admin-metric-card">
            <div className="admin-metric-icon">⚠️</div>
            <div className="admin-metric-value">3</div>
            <div className="admin-metric-label">Open Disputes</div>
            <div className="admin-metric-trend admin-trend-down">↓ -2 from yesterday</div>
          </div>
        </div>
      </section>

      {/* ── Admin Capabilities ── */}
      <section className="landing-section">
        <div className="landing-section-center">
          <span className="landing-section-eyebrow">Admin Capabilities</span>
          <h2 className="landing-section-title">Full platform control</h2>
          <p className="landing-section-sub">Every tool you need to run the SaleBySale marketplace efficiently and fairly.</p>
        </div>
        <div className="admin-cap-grid">
          <div className="admin-cap-card admin-cap-card-enhanced">
            <div className="admin-cap-icon-circle">📦</div>
            <h3 className="admin-cap-title">Order Management</h3>
            <p className="admin-cap-desc">Process, track, and manage all marketplace orders from creation through to final delivery.</p>
          </div>
          <div className="admin-cap-card admin-cap-card-enhanced">
            <div className="admin-cap-icon-circle">🪪</div>
            <h3 className="admin-cap-title">User Verification</h3>
            <p className="admin-cap-desc">KYC approvals for buyers and suppliers, manage user status, and maintain a trusted network.</p>
          </div>
          <div className="admin-cap-card admin-cap-card-enhanced">
            <div className="admin-cap-icon-circle">⚖️</div>
            <h3 className="admin-cap-title">Dispute Resolution</h3>
            <p className="admin-cap-desc">Handle conflicts, process refunds, and maintain a fair marketplace for all participants.</p>
          </div>
          <div className="admin-cap-card admin-cap-card-enhanced">
            <div className="admin-cap-icon-circle">📊</div>
            <h3 className="admin-cap-title">Analytics Dashboard</h3>
            <p className="admin-cap-desc">Monitor platform performance, revenue trends, and operational metrics in real time.</p>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="landing-section landing-section-dots" style={{background: "#f9fafb"}}>
        <div className="landing-section-center">
          <span className="landing-section-eyebrow">Why Choose Us</span>
          <h2 className="landing-section-title">Built for marketplace operators</h2>
          <p className="landing-section-sub">Everything you need to run a high-growth B2B marketplace, right out of the box.</p>
        </div>
        <div className="why-grid">
          <div className="why-card">
            <div className="why-icon">🚀</div>
            <h3 className="why-title">Lightning Fast</h3>
            <p className="why-desc">Sub-second dashboard loads. Real-time order updates. No lag when managing high-volume trading days.</p>
          </div>
          <div className="why-card">
            <div className="why-icon">🔒</div>
            <h3 className="why-title">Enterprise Security</h3>
            <p className="why-desc">Role-based access, audit logs, encrypted data storage, and supplier identity protection baked in.</p>
          </div>
          <div className="why-card">
            <div className="why-icon">📈</div>
            <h3 className="why-title">Grows With You</h3>
            <p className="why-desc">From 10 to 10,000 orders a day, the platform scales automatically without manual intervention.</p>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="cta-banner cta-banner-image cta-banner-admin">
        <div className="cta-banner-overlay" />
        <div className="cta-banner-content">
          <h2 className="cta-banner-title">Ready to manage the platform?</h2>
          <p className="cta-banner-sub">Sign in to your admin account to access the full dashboard.</p>
          <div className="cta-banner-btns">
            <Link className="cta-banner-btn-white" to="/login">Admin Sign In</Link>
          </div>
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
