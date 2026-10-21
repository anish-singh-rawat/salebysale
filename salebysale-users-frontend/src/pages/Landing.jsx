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
          </div>
          <div className="lp-nav-links">
            <Link className="lp-nav-ghost" to="/login">Sign In</Link>
            <Link className="lp-nav-cta" to="/register">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="lp-hero">
        {/* Decorative background elements */}
        <div className="lp-hero-orb lp-orb-1" />
        <div className="lp-hero-orb lp-orb-2" />
        <div className="lp-hero-orb lp-orb-3" />
        <div className="lp-hero-grid-bg" />

        <div className="lp-hero-inner">
          {/* LEFT — copy */}
          <div className="lp-hero-copy">
            <div className="lp-eyebrow">
              <span className="lp-eyebrow-dot" />
              India's #1 Mobile B2B Wholesale Platform
            </div>
            <h1 className="lp-h1">
              Connect <span className="lp-gradient-text">Retailers</span> &amp;{" "}
              <span className="lp-gradient-text">Wholesalers</span> Like Never Before
            </h1>
            <p className="lp-hero-sub">
              List your mobile inventory, discover the best wholesale deals, and grow your business — all on one platform that keeps supplier identities confidential.
            </p>
            <div className="lp-hero-btns">
              <Link className="lp-btn-primary" to="/register?role=buyer">
                <span>🛍️</span> Register as Retailer
              </Link>
              <Link className="lp-btn-secondary" to="/register?role=supplier">
                <span>🏭</span> Register as Wholesaler
              </Link>
            </div>
            <div className="lp-hero-trust">
              <div className="lp-trust-item"><span className="lp-trust-check">✓</span> Free to join</div>
              <div className="lp-trust-item"><span className="lp-trust-check">✓</span> Verified sellers only</div>
              <div className="lp-trust-item"><span className="lp-trust-check">✓</span> Secure payments</div>
            </div>
          </div>

          {/* RIGHT — visual mockup */}
          <div className="lp-hero-visual">
            <div className="lp-mockup-glow" />
            {/* Main dashboard card */}
            <div className="lp-mockup-main">
              <div className="lp-mockup-topbar">
                <div className="lp-mockup-dots">
                  <span className="lp-dot lp-dot-r" /><span className="lp-dot lp-dot-y" /><span className="lp-dot lp-dot-g" />
                </div>
                <div className="lp-mockup-url">salebysale.com/dashboard</div>
              </div>
              <div className="lp-mockup-body">
                <div className="lp-mockup-stat-row">
                  <div className="lp-mockup-stat">
                    <div className="lp-mockup-stat-val" style={{color:"#6366f1"}}>₹2.4L</div>
                    <div className="lp-mockup-stat-lbl">Revenue</div>
                  </div>
                  <div className="lp-mockup-stat">
                    <div className="lp-mockup-stat-val" style={{color:"#10b981"}}>124</div>
                    <div className="lp-mockup-stat-lbl">Orders</div>
                  </div>
                  <div className="lp-mockup-stat">
                    <div className="lp-mockup-stat-val" style={{color:"#f59e0b"}}>38</div>
                    <div className="lp-mockup-stat-lbl">Products</div>
                  </div>
                </div>
                <div className="lp-mockup-product-row">
                  <img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=56&h=56&fit=crop&q=80" alt="iPhone" loading="lazy" className="lp-mockup-prod-img" />
                  <div className="lp-mockup-prod-info">
                    <div className="lp-mockup-prod-name">iPhone 14 Pro</div>
                    <div className="lp-mockup-prod-price">₹89,999</div>
                  </div>
                  <div className="lp-mockup-badge lp-badge-green">Active</div>
                </div>
                <div className="lp-mockup-product-row">
                  <img src="https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=56&h=56&fit=crop&q=80" alt="Samsung" loading="lazy" className="lp-mockup-prod-img" />
                  <div className="lp-mockup-prod-info">
                    <div className="lp-mockup-prod-name">Samsung S23 Ultra</div>
                    <div className="lp-mockup-prod-price">₹1,24,999</div>
                  </div>
                  <div className="lp-mockup-badge lp-badge-purple">New</div>
                </div>
                <div className="lp-mockup-product-row">
                  <img src="https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=56&h=56&fit=crop&q=80" alt="OnePlus" loading="lazy" className="lp-mockup-prod-img" />
                  <div className="lp-mockup-prod-info">
                    <div className="lp-mockup-prod-name">OnePlus 11 5G</div>
                    <div className="lp-mockup-prod-price">₹56,999</div>
                  </div>
                  <div className="lp-mockup-badge lp-badge-yellow">Low Stock</div>
                </div>
                <div className="lp-mockup-bar-chart">
                  {[40,65,50,80,70,90,75].map((h,i) => (
                    <div key={i} className="lp-bar" style={{height: h + "%", opacity: 0.6 + i * 0.06}} />
                  ))}
                </div>
              </div>
            </div>
            {/* Floating cards */}
            <div className="lp-float-card lp-float-orders">
              <div className="lp-float-icon">📦</div>
              <div>
                <div className="lp-float-val">124</div>
                <div className="lp-float-lbl">Orders Today</div>
              </div>
            </div>
            <div className="lp-float-card lp-float-verified">
              <div className="lp-float-icon" style={{color:"#10b981"}}>✅</div>
              <div>
                <div className="lp-float-val" style={{color:"#10b981"}}>Verified</div>
                <div className="lp-float-lbl">Seller Badge</div>
              </div>
            </div>
            <div className="lp-float-card lp-float-revenue">
              <div className="lp-float-icon">💰</div>
              <div>
                <div className="lp-float-val">₹2.4L</div>
                <div className="lp-float-lbl">This Month</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <div className="lp-stats-bar">
        <div className="lp-stats-inner">
          {[
            { icon: "📦", val: "10,000+", lbl: "Products Listed" },
            { icon: "🏪", val: "5,000+",  lbl: "Active Sellers" },
            { icon: "🚀", val: "₹50Cr+",  lbl: "GMV Processed" },
            { icon: "⭐", val: "4.9/5",   lbl: "Avg. Rating" },
          ].map((s, i) => (
            <div key={i} className="lp-stat">
              <div className="lp-stat-icon">{s.icon}</div>
              <div className="lp-stat-val">{s.val}</div>
              <div className="lp-stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Brands / Partners strip ── */}
      <div className="lp-partners-strip">
        <span className="lp-partners-label">Trusted by sellers from</span>
        {["Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad", "Ahmedabad", "Pune", "Kolkata"].map(c => (
          <span key={c} className="lp-partner-chip">{c}</span>
        ))}
      </div>

      {/* ── Features ── */}
      <section className="lp-section lp-section-dots">
        <div className="lp-section-head">
          <span className="lp-section-eyebrow">Why SaleBySale</span>
          <h2 className="lp-h2">Everything your business needs</h2>
          <p className="lp-section-sub">One platform built for the entire mobile wholesale supply chain — from discovery to delivery.</p>
        </div>
        <div className="lp-features-grid">
          {[
            { icon: "🔍", title: "Browse Verified Stock",       desc: "Access thousands of verified mobile products from trusted wholesalers. Competitive pricing, always up to date." },
            { icon: "🔐", title: "Confidential Sourcing",       desc: "Supplier identities are kept confidential, protecting relationships and ensuring fair market dynamics." },
            { icon: "⚡", title: "Fast Fulfilment",             desc: "Admin-managed logistics mean orders are sourced, packed, and dispatched without the back-and-forth." },
            { icon: "💳", title: "Secure Payments",            desc: "Every transaction is tracked and secured. Pay with confidence knowing your money is protected end-to-end." },
            { icon: "📦", title: "Inventory Management",       desc: "Suppliers can list, update, and manage inventory in real time. Buyers always see accurate stock availability." },
            { icon: "📊", title: "Business Insights",          desc: "Track your orders, payouts, and performance metrics from a clean, intuitive dashboard built for traders." },
          ].map((f, i) => (
            <div key={i} className="lp-feature-card">
              <div className="lp-feature-icon">{f.icon}</div>
              <h3 className="lp-feature-title">{f.title}</h3>
              <p className="lp-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Product Showcase ── */}
      <section className="lp-section lp-section-gray">
        <div className="lp-section-head">
          <span className="lp-section-eyebrow">Top Products</span>
          <h2 className="lp-h2">Browse Top Wholesale Products</h2>
          <p className="lp-section-sub">Discover the latest smartphones available for bulk ordering on our platform.</p>
        </div>
        <div className="lp-products-grid">
          {[
            { img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=85", brand: "Apple",   name: "iPhone 14 Pro Max",  price: "₹1,09,999", tag: "Bestseller" },
            { img: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=85", brand: "Samsung", name: "Galaxy S23 Ultra",   price: "₹1,24,999", tag: "New Arrival" },
            { img: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&q=85", brand: "OnePlus", name: "OnePlus 11 5G",       price: "₹56,999",   tag: "Hot Deal" },
            { img: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&q=85", brand: "Samsung", name: "Galaxy A54 5G",      price: "₹38,999",   tag: "In Stock" },
          ].map((p, i) => (
            <div key={i} className="lp-product-card">
              <div className="lp-product-img-wrap">
                <img src={p.img} alt={p.name + " wholesale"} loading="lazy" className="lp-product-img" />
                <span className="lp-product-tag">{p.tag}</span>
              </div>
              <div className="lp-product-body">
                <div className="lp-product-brand">{p.brand}</div>
                <div className="lp-product-name">{p.name}</div>
                <div className="lp-product-price">{p.price} <span className="lp-product-unit">/ unit</span></div>
                <Link className="lp-product-btn" to="/register?role=buyer">Order Now →</Link>
              </div>
            </div>
          ))}
        </div>
        <div style={{textAlign:"center", marginTop: 40}}>
          <Link className="lp-btn-outline" to="/register?role=buyer">View All Products →</Link>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="lp-section">
        <div className="lp-section-head">
          <span className="lp-section-eyebrow">How It Works</span>
          <h2 className="lp-h2">From signup to first order in minutes</h2>
          <p className="lp-section-sub">Get started in three simple steps — no complicated setup, no hidden fees.</p>
        </div>
        <div className="lp-steps-grid">
          <div className="lp-step-connector" />
          {[
            { num: "01", icon: "📝", title: "Create Your Account",  desc: "Register as a retailer or wholesaler, complete KYC verification, and get approved by the admin team.", color: "#6366f1" },
            { num: "02", icon: "🛒", title: "Browse & Order",       desc: "Retailers browse live stock and place orders at competitive wholesale prices. Wholesalers list their inventory.", color: "#8b5cf6" },
            { num: "03", icon: "🚚", title: "Fast Delivery",        desc: "Admin coordinates fulfilment, tracks delivery, and handles any disputes — so you can focus on business.", color: "#06b6d4" },
          ].map((s, i) => (
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

      {/* ── Social proof — big quote + testimonials ── */}
      <section className="lp-section lp-section-testimonials">
        <div className="lp-section-head">
          <span className="lp-section-eyebrow">Customer Stories</span>
          <h2 className="lp-h2">Trusted by thousands of businesses</h2>
          <p className="lp-section-sub">Hear from retailers and wholesalers who have grown their business on SaleBySale.</p>
        </div>
        <div className="lp-testimonials-grid">
          {[
            { img: "https://i.pravatar.cc/80?img=11", name: "Rajesh Kumar",   role: "Mobile Retailer, Delhi",             stars: 5, quote: "SaleBySale completely transformed how I source phones. I get the best wholesale prices and delivery is always on time. My profit margins have doubled in 6 months." },
            { img: "https://i.pravatar.cc/80?img=48", name: "Priya Sharma",   role: "Electronics Wholesaler, Mumbai",     stars: 5, quote: "As a wholesaler, I list my stock once and receive orders from hundreds of retailers. The confidentiality feature is a game changer — my competitor can't trace my sources." },
            { img: "https://i.pravatar.cc/80?img=33", name: "Amit Patel",     role: "Mobile Shop Owner, Ahmedabad",       stars: 5, quote: "Incredibly easy to use. I placed my first order within 10 minutes of signing up and my inventory arrived the next day. The platform just works." },
          ].map((t, i) => (
            <div key={i} className="lp-testimonial-card">
              <div className="lp-testimonial-stars">{"⭐".repeat(t.stars)}</div>
              <p className="lp-testimonial-quote">"{t.quote}"</p>
              <div className="lp-testimonial-author">
                <img src={t.img} alt={t.name} loading="lazy" className="lp-testimonial-avatar" />
                <div>
                  <div className="lp-testimonial-name">{t.name}</div>
                  <div className="lp-testimonial-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Split CTA ── */}
      <section className="lp-dual-cta">
        <div className="lp-dual-cta-card lp-dual-cta-buyer">
          <div className="lp-dual-cta-icon">🛍️</div>
          <h3 className="lp-dual-cta-title">I'm a Retailer</h3>
          <p className="lp-dual-cta-desc">Browse verified wholesale stock and place bulk orders at the best prices.</p>
          <Link className="lp-dual-cta-btn lp-dual-btn-white" to="/register?role=buyer">Register as Retailer →</Link>
        </div>
        <div className="lp-dual-cta-divider">or</div>
        <div className="lp-dual-cta-card lp-dual-cta-supplier">
          <div className="lp-dual-cta-icon">🏭</div>
          <h3 className="lp-dual-cta-title">I'm a Wholesaler</h3>
          <p className="lp-dual-cta-desc">List your inventory and sell to thousands of verified retailers across India.</p>
          <Link className="lp-dual-cta-btn lp-dual-btn-outline" to="/register?role=supplier">Register as Wholesaler →</Link>
        </div>
      </section>

      {/* ── Final CTA banner ── */}
      <section className="lp-cta-banner">
        <div className="lp-cta-overlay" />
        <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1400&q=80" alt="Commerce background" loading="lazy" className="lp-cta-bg-img" />
        <div className="lp-cta-content">
          <h2 className="lp-cta-title">Ready to grow your mobile business?</h2>
          <p className="lp-cta-sub">Join thousands of retailers and wholesalers already trading on SaleBySale. Free to join, no hidden fees.</p>
          <div className="lp-cta-btns">
            <Link className="lp-cta-btn-white" to="/register?role=buyer">Get Started Free</Link>
            <Link className="lp-cta-btn-ghost" to="/login">Already a member? Sign in</Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand-col">
            <div className="lp-footer-brand">
              <div className="lp-footer-mark">S</div>
              <span>SaleBySale</span>
            </div>
            <p className="lp-footer-tagline">India's trusted mobile B2B wholesale platform connecting retailers and wholesalers.</p>
          </div>
          <div className="lp-footer-links-col">
            <div className="lp-footer-col-title">Platform</div>
            <Link to="/register?role=buyer">For Retailers</Link>
            <Link to="/register?role=supplier">For Wholesalers</Link>
            <Link to="/login">Sign In</Link>
          </div>
          <div className="lp-footer-links-col">
            <div className="lp-footer-col-title">Company</div>
            <a href="#">About Us</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
          <div className="lp-footer-links-col">
            <div className="lp-footer-col-title">Support</div>
            <a href="#">Help Center</a>
            <a href="#">Contact Us</a>
            <a href="#">Disputes</a>
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
