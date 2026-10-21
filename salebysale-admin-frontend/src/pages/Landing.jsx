import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="lp-root" style={{ width: "100%", maxWidth: "100%", margin: 0, overflowX: "hidden" }}>

      {/* ── Navbar ── */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <div className="lp-brand">
            <div className="lp-brand-mark">S</div>
            <span className="lp-brand-name">SaleBySale</span>
            <span className="lp-admin-chip">Admin Portal</span>
          </div>
          <div className="lp-nav-links">
            <Link className="lp-nav-cta" to="/login">🔐 Admin Sign In</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="lp-hero lp-hero-admin">
        <div className="lp-hero-orb lp-orb-1" />
        <div className="lp-hero-orb lp-orb-2" />
        <div className="lp-hero-orb lp-orb-3" />
        <div className="lp-hero-grid-bg" />

        <div className="lp-hero-inner">
          {/* LEFT */}
          <div className="lp-hero-copy">
            <div className="lp-eyebrow">
              <span className="lp-eyebrow-dot" />
              Secure Admin Control Centre
            </div>
            <h1 className="lp-h1">
              Manage Your{" "}
              <span className="lp-gradient-text">Marketplace</span>{" "}
              with Confidence
            </h1>
            <p className="lp-hero-sub">
              One powerful dashboard to control orders, verify users, resolve disputes, manage inventory, and monitor platform performance — all in real time.
            </p>
            <div className="lp-hero-btns">
              <Link className="lp-btn-primary" to="/login">
                🔐 Access Dashboard
              </Link>
            </div>
            <div className="lp-hero-trust">
              <div className="lp-trust-item"><span className="lp-trust-check">✓</span> Real-time analytics</div>
              <div className="lp-trust-item"><span className="lp-trust-check">✓</span> Secure role-based access</div>
              <div className="lp-trust-item"><span className="lp-trust-check">✓</span> Full platform control</div>
            </div>
          </div>

          {/* RIGHT — rich admin dashboard mockup */}
          <div className="lp-hero-visual">
            <div className="lp-mockup-glow" />
            <div className="lp-mockup-main lp-mockup-admin">
              <div className="lp-mockup-topbar">
                <div className="lp-mockup-dots">
                  <span className="lp-dot lp-dot-r" /><span className="lp-dot lp-dot-y" /><span className="lp-dot lp-dot-g" />
                </div>
                <div className="lp-mockup-url">salebysale.com/admin</div>
              </div>
              <div className="lp-mockup-body">
                {/* Stat row */}
                <div className="lp-mockup-stat-row">
                  <div className="lp-mockup-stat"><div className="lp-mockup-stat-val" style={{color:"#6366f1"}}>247</div><div className="lp-mockup-stat-lbl">Orders</div></div>
                  <div className="lp-mockup-stat"><div className="lp-mockup-stat-val" style={{color:"#10b981"}}>₹4.2L</div><div className="lp-mockup-stat-lbl">Revenue</div></div>
                  <div className="lp-mockup-stat"><div className="lp-mockup-stat-val" style={{color:"#f59e0b"}}>1,842</div><div className="lp-mockup-stat-lbl">Users</div></div>
                </div>
                {/* Mini bar chart */}
                <div className="lp-admin-chart-label">Weekly Revenue</div>
                <div className="lp-admin-chart">
                  {[
                    {h:35,d:"M"},{h:55,d:"T"},{h:45,d:"W"},{h:72,d:"T"},{h:60,d:"F"},{h:88,d:"S"},{h:40,d:"S"}
                  ].map((b,i) => (
                    <div key={i} className="lp-admin-bar-wrap">
                      <div className={"lp-admin-bar" + (i===5?" lp-admin-bar-active":"")} style={{height: b.h+"%"}} />
                      <span className="lp-admin-bar-lbl">{b.d}</span>
                    </div>
                  ))}
                </div>
                {/* Orders table */}
                <div className="lp-admin-table">
                  <div className="lp-admin-table-head">
                    <span>Order</span><span>Buyer</span><span>Status</span><span>Amount</span>
                  </div>
                  {[
                    {id:"#4521",buyer:"Rahul M.",status:"Delivered",amt:"₹28,999",sc:"green"},
                    {id:"#4520",buyer:"Sneha K.",status:"Pending",  amt:"₹15,499",sc:"yellow"},
                    {id:"#4519",buyer:"Amit P.", status:"Processing",amt:"₹42,000",sc:"blue"},
                  ].map(r => (
                    <div key={r.id} className="lp-admin-table-row">
                      <span className="lp-admin-order-id">{r.id}</span>
                      <span>{r.buyer}</span>
                      <span className={"lp-admin-status lp-status-"+r.sc}>{r.status}</span>
                      <span className="lp-admin-amount">{r.amt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Floating cards */}
            <div className="lp-float-card lp-float-orders" style={{animationDelay:"0s"}}>
              <div className="lp-float-icon">📦</div>
              <div><div className="lp-float-val">247</div><div className="lp-float-lbl">Orders Today</div></div>
            </div>
            <div className="lp-float-card lp-float-verified" style={{animationDelay:"1.4s"}}>
              <div className="lp-float-icon" style={{color:"#10b981"}}>✅</div>
              <div><div className="lp-float-val" style={{color:"#10b981"}}>Secure</div><div className="lp-float-lbl">Admin Access</div></div>
            </div>
            <div className="lp-float-card lp-float-revenue" style={{animationDelay:"2.7s"}}>
              <div className="lp-float-icon">💰</div>
              <div><div className="lp-float-val">₹4.2L</div><div className="lp-float-lbl">Today's GMV</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Live Stats Bar ── */}
      <div className="lp-stats-bar">
        <div className="lp-stats-inner">
          {[
            { icon: "📦", val: "10,000+", lbl: "Orders Processed" },
            { icon: "👥", val: "5,000+",  lbl: "Verified Users" },
            { icon: "💰", val: "₹50Cr+",  lbl: "Total GMV" },
            { icon: "⚡", val: "99.9%",   lbl: "Platform Uptime" },
          ].map((s,i) => (
            <div key={i} className="lp-stat">
              <div className="lp-stat-icon">{s.icon}</div>
              <div className="lp-stat-val">{s.val}</div>
              <div className="lp-stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Real-time Metrics Cards ── */}
      <section className="lp-section lp-section-gray">
        <div className="lp-section-head">
          <span className="lp-section-eyebrow">Live Platform Metrics</span>
          <h2 className="lp-h2">Your platform at a glance</h2>
          <p className="lp-section-sub">Real-time numbers refreshed every minute — always know what's happening on your marketplace.</p>
        </div>
        <div className="lp-admin-metrics-grid">
          {[
            { icon:"📦", val:"247",   lbl:"Orders Today",       trend:"↑ +12%", up:true,  color:"#6366f1", bg:"#ede9fe" },
            { icon:"👥", val:"1,842", lbl:"Active Users",        trend:"↑ +8%",  up:true,  color:"#10b981", bg:"#d1fae5" },
            { icon:"💰", val:"₹4.2L", lbl:"Today's Revenue",     trend:"↑ +18%", up:true,  color:"#8b5cf6", bg:"#f3e8ff" },
            { icon:"⚠️", val:"3",     lbl:"Open Disputes",       trend:"↓ -2",   up:false, color:"#f59e0b", bg:"#fef3c7" },
            { icon:"✅", val:"28",    lbl:"KYC Pending",          trend:"↓ -5",   up:false, color:"#06b6d4", bg:"#cffafe" },
            { icon:"🚚", val:"94%",   lbl:"On-time Delivery",    trend:"↑ +3%",  up:true,  color:"#10b981", bg:"#d1fae5" },
            { icon:"🏪", val:"312",   lbl:"Active Suppliers",    trend:"↑ +6%",  up:true,  color:"#6366f1", bg:"#ede9fe" },
            { icon:"🛍️", val:"1,530", lbl:"Active Buyers",       trend:"↑ +11%", up:true,  color:"#8b5cf6", bg:"#f3e8ff" },
          ].map((m,i) => (
            <div key={i} className="lp-admin-metric-card">
              <div className="lp-admin-metric-icon-wrap" style={{background: m.bg, color: m.color}}>
                <span style={{fontSize:22}}>{m.icon}</span>
              </div>
              <div className="lp-admin-metric-val" style={{color: m.color}}>{m.val}</div>
              <div className="lp-admin-metric-lbl">{m.lbl}</div>
              <div className={"lp-admin-metric-trend " + (m.up ? "lp-trend-up" : "lp-trend-down")}>{m.trend} vs yesterday</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Admin Capabilities ── */}
      <section className="lp-section lp-section-dots">
        <div className="lp-section-head">
          <span className="lp-section-eyebrow">Admin Capabilities</span>
          <h2 className="lp-h2">Full platform control in one place</h2>
          <p className="lp-section-sub">Every tool you need to run the SaleBySale marketplace efficiently, fairly, and at scale.</p>
        </div>
        <div className="lp-features-grid">
          {[
            { icon:"📦", title:"Order Management",      desc:"Process, assign, track, and manage every marketplace order from creation through final delivery. Full audit trail included." },
            { icon:"🪪", title:"User Verification",     desc:"KYC approval for buyers and suppliers, manage user status, flag suspicious accounts, and maintain a trusted verified network." },
            { icon:"⚖️", title:"Dispute Resolution",    desc:"Handle conflicts between buyers and sellers, process refunds, issue decisions, and maintain a fair marketplace for all parties." },
            { icon:"📊", title:"Analytics & Reports",   desc:"Monitor platform performance, revenue trends, conversion rates, and operational KPIs — all visualised in real time." },
            { icon:"🏭", title:"Supplier Management",   desc:"Approve new suppliers, review product listings, manage stock visibility, and enforce listing quality standards." },
            { icon:"💳", title:"Payment & Settlements", desc:"Track all transactions, manage payout schedules to suppliers, reconcile payments, and handle refund workflows." },
          ].map((c,i) => (
            <div key={i} className="lp-feature-card">
              <div className="lp-feature-icon">{c.icon}</div>
              <h3 className="lp-feature-title">{c.title}</h3>
              <p className="lp-feature-desc">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Activity Timeline ── */}
      <section className="lp-section lp-section-gray">
        <div className="lp-section-head">
          <span className="lp-section-eyebrow">Platform Activity</span>
          <h2 className="lp-h2">Everything that happens, visible to you</h2>
          <p className="lp-section-sub">A live activity feed keeps you on top of every important event across the marketplace.</p>
        </div>
        <div className="lp-admin-activity-wrap">
          <div className="lp-admin-activity-card">
            <div className="lp-activity-header">
              <span className="lp-activity-title">📋 Recent Activity</span>
              <span className="lp-activity-live"><span className="lp-live-dot"/>Live</span>
            </div>
            {[
              { icon:"✅", color:"#10b981", bg:"#d1fae5", msg:"New supplier approved — Rajesh Electronics, Delhi",       time:"2m ago" },
              { icon:"📦", color:"#6366f1", bg:"#ede9fe", msg:"Order #4521 dispatched — iPhone 14 Pro × 2",              time:"5m ago" },
              { icon:"⚠️", color:"#f59e0b", bg:"#fef3c7", msg:"Dispute raised on Order #4518 — Under review",           time:"12m ago" },
              { icon:"🪪", color:"#06b6d4", bg:"#cffafe", msg:"KYC submitted — Priya Sharma, Mobile Retailer Mumbai",    time:"18m ago" },
              { icon:"💰", color:"#8b5cf6", bg:"#f3e8ff", msg:"Settlement processed — ₹1,24,500 to 8 suppliers",        time:"34m ago" },
              { icon:"🚚", color:"#10b981", bg:"#d1fae5", msg:"Order #4515 delivered — Confirmed by buyer",              time:"41m ago" },
              { icon:"🆕", color:"#6366f1", bg:"#ede9fe", msg:"New product listed — Samsung Galaxy S24 Ultra 256GB",     time:"1h ago" },
              { icon:"🔐", color:"#ef4444", bg:"#fee2e2", msg:"Suspicious login attempt blocked — Account secured",      time:"2h ago" },
            ].map((a,i) => (
              <div key={i} className="lp-activity-row">
                <div className="lp-activity-icon-wrap" style={{background:a.bg, color:a.color}}>{a.icon}</div>
                <div className="lp-activity-msg">{a.msg}</div>
                <div className="lp-activity-time">{a.time}</div>
              </div>
            ))}
          </div>

          {/* Side stats */}
          <div className="lp-admin-side-stats">
            <div className="lp-side-stat-card">
              <div className="lp-side-stat-title">Order Status Breakdown</div>
              {[
                { lbl:"Delivered",   val:148, pct:60, color:"#10b981" },
                { lbl:"Processing",  val:62,  pct:25, color:"#6366f1" },
                { lbl:"Pending",     val:30,  pct:12, color:"#f59e0b" },
                { lbl:"Cancelled",   val:7,   pct:3,  color:"#ef4444" },
              ].map((s,i) => (
                <div key={i} className="lp-side-stat-row">
                  <div className="lp-side-stat-top">
                    <span className="lp-side-stat-lbl">{s.lbl}</span>
                    <span className="lp-side-stat-val">{s.val}</span>
                  </div>
                  <div className="lp-side-stat-bar-bg">
                    <div className="lp-side-stat-bar-fill" style={{width: s.pct+"%", background: s.color}} />
                  </div>
                </div>
              ))}
            </div>

            <div className="lp-side-stat-card">
              <div className="lp-side-stat-title">User Registrations (7 days)</div>
              <div className="lp-mini-chart">
                {[12,18,14,22,19,28,24].map((h,i) => (
                  <div key={i} className="lp-mini-bar-wrap">
                    <div className="lp-mini-bar" style={{height: (h/28*100)+"%"}} />
                    <span className="lp-mini-bar-lbl">{["M","T","W","T","F","S","S"][i]}</span>
                  </div>
                ))}
              </div>
              <div className="lp-mini-chart-total">137 new users this week <span className="lp-trend-up-inline">↑ +22%</span></div>
            </div>

            <div className="lp-side-stat-card lp-quick-actions">
              <div className="lp-side-stat-title">Quick Actions</div>
              <Link to="/login" className="lp-quick-action-btn">📋 Review Pending KYC (28)</Link>
              <Link to="/login" className="lp-quick-action-btn">⚠️ Resolve Open Disputes (3)</Link>
              <Link to="/login" className="lp-quick-action-btn">💰 Process Settlements</Link>
              <Link to="/login" className="lp-quick-action-btn">📦 Manage Orders</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── How Admin Workflow Works ── */}
      <section className="lp-section">
        <div className="lp-section-head">
          <span className="lp-section-eyebrow">Admin Workflow</span>
          <h2 className="lp-h2">How the platform operates</h2>
          <p className="lp-section-sub">A streamlined workflow keeps the marketplace running smoothly from user onboarding to final settlement.</p>
        </div>
        <div className="lp-steps-grid lp-steps-4">
          <div className="lp-step-connector lp-step-connector-4" />
          {[
            { num:"01", icon:"🪪", title:"Verify Users",         desc:"Review KYC submissions, approve or reject buyers and suppliers, and maintain a trusted marketplace.",   color:"#6366f1" },
            { num:"02", icon:"📦", title:"Process Orders",       desc:"Assign orders to verified suppliers, track fulfilment status, and coordinate with riders for delivery.", color:"#8b5cf6" },
            { num:"03", icon:"⚖️", title:"Resolve Disputes",     desc:"Review raised disputes, gather evidence from both parties, issue decisions, and process any refunds.",   color:"#06b6d4" },
            { num:"04", icon:"💰", title:"Settle Payments",      desc:"Calculate supplier earnings, deduct platform fees, and process batch settlements on schedule.",         color:"#10b981" },
          ].map((s,i) => (
            <div key={i} className="lp-step">
              <div className="lp-step-num-wrap" style={{"--sc": s.color}}>
                <div className="lp-step-num">{s.num}</div>
              </div>
              <div className="lp-step-emoji">{s.icon}</div>
              <h3 className="lp-step-title">{s.title}</h3>
              <p className="lp-step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Security & Trust ── */}
      <section className="lp-section lp-section-dark">
        <div className="lp-section-head">
          <span className="lp-section-eyebrow lp-eyebrow-light">Security & Compliance</span>
          <h2 className="lp-h2 lp-h2-light">Enterprise-grade security, built in</h2>
          <p className="lp-section-sub lp-sub-light">Every sensitive action is protected, logged, and auditable.</p>
        </div>
        <div className="lp-security-grid">
          {[
            { icon:"🔐", title:"Role-Based Access",        desc:"Fine-grained permissions ensure admins only see and do what their role permits. No over-privileged accounts." },
            { icon:"📝", title:"Full Audit Logs",          desc:"Every action — approval, rejection, edit, delete — is timestamped and logged for complete accountability." },
            { icon:"🔒", title:"Encrypted Data",           desc:"All user data, payment info, and supplier identities are encrypted at rest and in transit." },
            { icon:"🛡️", title:"Supplier Confidentiality", desc:"Supplier identities are never exposed to buyers — protecting business relationships across the marketplace." },
            { icon:"🚨", title:"Anomaly Detection",        desc:"Suspicious login attempts and unusual activity patterns are flagged and blocked automatically." },
            { icon:"📋", title:"Compliance Ready",         desc:"Platform operations follow data protection best practices, with exportable audit trails for compliance review." },
          ].map((s,i) => (
            <div key={i} className="lp-security-card">
              <div className="lp-security-icon">{s.icon}</div>
              <h3 className="lp-security-title">{s.title}</h3>
              <p className="lp-security-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why SaleBySale Admin ── */}
      <section className="lp-section lp-section-gray">
        <div className="lp-section-head">
          <span className="lp-section-eyebrow">Why SaleBySale</span>
          <h2 className="lp-h2">Built for marketplace operators</h2>
          <p className="lp-section-sub">Everything you need to run a high-growth B2B marketplace, right out of the box.</p>
        </div>
        <div className="lp-why-grid">
          {[
            { icon:"🚀", title:"Lightning Fast",        desc:"Sub-second dashboard loads. Real-time order updates. No lag on high-volume trading days." },
            { icon:"📈", title:"Scales Automatically",  desc:"From 10 to 10,000 orders a day, the platform handles growth without manual intervention." },
            { icon:"🎯", title:"Designed for India",    desc:"Built specifically for Indian B2B mobile commerce — GST, COD, regional logistics all handled." },
          ].map((w,i) => (
            <div key={i} className="lp-why-card">
              <div className="lp-why-icon">{w.icon}</div>
              <h3 className="lp-why-title">{w.title}</h3>
              <p className="lp-why-desc">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="lp-cta-banner">
        <div className="lp-cta-overlay" />
        <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1400&q=80" alt="Analytics dashboard background" loading="lazy" className="lp-cta-bg-img" />
        <div className="lp-cta-content">
          <h2 className="lp-cta-title">Ready to manage the platform?</h2>
          <p className="lp-cta-sub">Sign in to your admin account and get full control of the SaleBySale marketplace.</p>
          <div className="lp-cta-btns">
            <Link className="lp-cta-btn-white" to="/login">🔐 Access Admin Dashboard</Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand-col">
            <div className="lp-footer-brand">
              <div className="lp-footer-mark">S</div>
              <span>SaleBySale Admin</span>
            </div>
            <p className="lp-footer-tagline">The control centre for India's leading mobile B2B wholesale marketplace.</p>
          </div>
          <div className="lp-footer-links-col">
            <div className="lp-footer-col-title">Admin</div>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Register</Link>
          </div>
          <div className="lp-footer-links-col">
            <div className="lp-footer-col-title">Platform</div>
            <a href="#">Order Management</a>
            <a href="#">User Verification</a>
            <a href="#">Dispute Resolution</a>
          </div>
          <div className="lp-footer-links-col">
            <div className="lp-footer-col-title">Legal</div>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Security</a>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <span>© {new Date().getFullYear()} SaleBySale. All rights reserved.</span>
          <span>Made with ❤️ in India</span>
        </div>
      </footer>
    </div>
  );
}
