import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="landing-root auth-page-reset" style={{ width: "100%", maxWidth: "100%", margin: 0 }}>
      {/* ── Top nav ── */}
      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <div className="landing-nav-mark">S</div>
          SaleBySale
        </div>
        <div className="landing-nav-links">
          <Link className="landing-nav-btn-ghost" to="/login">Sign In</Link>
          <Link className="landing-nav-btn" to="/register">Join Now</Link>
        </div>
      </nav>

      {/* ── Hero — split layout ── */}
      <section className="landing-hero landing-hero-gradient">
        <div className="landing-blob landing-blob-1" />
        <div className="landing-blob landing-blob-2" />
        <div className="landing-blob landing-blob-3" />
        <div className="hero-split">
          {/* LEFT: text */}
          <div className="hero-split-left">
            <div className="hero-eyebrow"><span>🚀</span> India's Trusted Mobile B2B Platform</div>
            <h1 className="hero-headline">Connect <span className="hero-headline-gradient">Retailers &amp; Wholesalers</span><br />Like Never Before</h1>
            <p className="hero-sub">List your mobile inventory, find the best wholesale deals, and grow your business — all on one platform that keeps supplier identities confidential.</p>
            <div className="hero-cta-row">
              <Link className="hero-btn-primary" to="/register?role=buyer">🛍️ Register as Retailer</Link>
              <Link className="hero-btn-ghost" to="/register?role=supplier">🏭 Register as Wholesaler</Link>
            </div>
            <div className="hero-trust-row">
              <span>✅ 10,000+ Products</span>
              <span>✅ Verified Sellers</span>
              <span>✅ Secure Payments</span>
            </div>
          </div>
          {/* RIGHT: floating product card mockups */}
          <div className="hero-split-right">
            <div className="hero-visual-blob" />
            <div className="hero-cards-stack">
              <div className="hero-product-card hero-product-card-back">
                <img src="https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=300&q=80" alt="Samsung Galaxy smartphone" loading="lazy" className="hero-product-img" />
                <div className="hero-product-info">
                  <div className="hero-product-name">Samsung Galaxy S23</div>
                  <div className="hero-product-price">₹28,999</div>
                </div>
              </div>
              <div className="hero-product-card hero-product-card-front">
                <img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=80" alt="iPhone smartphone product listing" loading="lazy" className="hero-product-img" />
                <div className="hero-product-info">
                  <div className="hero-product-name">iPhone 14 Pro</div>
                  <div className="hero-product-price">₹89,999</div>
                  <button className="hero-product-btn">Add to Cart</button>
                </div>
              </div>
              <div className="hero-floating-badge hero-badge-orders">📦 124 Orders Today</div>
              <div className="hero-floating-badge hero-badge-verified">✅ Verified Seller</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div className="stats-strip">
        <div className="stat-item">
          <div className="stat-item-icon">📦</div>
          <div className="stat-item-value">10,000+</div>
          <div className="stat-item-label">Products Listed</div>
        </div>
        <div className="stat-item">
          <div className="stat-item-icon">🏪</div>
          <div className="stat-item-value">5,000+</div>
          <div className="stat-item-label">Active Sellers</div>
        </div>
        <div className="stat-item">
          <div className="stat-item-icon">⚡</div>
          <div className="stat-item-value">99.9%</div>
          <div className="stat-item-label">Platform Uptime</div>
        </div>
        <div className="stat-item">
          <div className="stat-item-icon">🔒</div>
          <div className="stat-item-value">24h</div>
          <div className="stat-item-label">Fast Delivery</div>
        </div>
      </div>

      {/* ── Features ── */}
      <section className="landing-section landing-section-dots">
        <div className="landing-section-center">
          <span className="landing-section-eyebrow">Why SaleBySale</span>
          <h2 className="landing-section-title">Everything your business needs</h2>
          <p className="landing-section-sub">
            One platform built for the entire mobile wholesale supply chain — from discovery to delivery.
          </p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-card-icon">🔍</div>
            <h3 className="feature-card-title">Browse Verified Stock</h3>
            <p className="feature-card-desc">
              Access thousands of verified mobile products from trusted wholesalers. Competitive pricing, always up to date.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-card-icon">🔐</div>
            <h3 className="feature-card-title">Confidential Sourcing</h3>
            <p className="feature-card-desc">
              Supplier identities are kept confidential, protecting relationships and ensuring fair market dynamics for all parties.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-card-icon">⚡</div>
            <h3 className="feature-card-title">Fast Fulfilment</h3>
            <p className="feature-card-desc">
              Admin-managed logistics mean your orders are sourced, packed, and dispatched without the back-and-forth.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-card-icon">💳</div>
            <h3 className="feature-card-title">Secure Payments</h3>
            <p className="feature-card-desc">
              Every transaction is tracked and secured. Pay with confidence knowing your money is protected end-to-end.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-card-icon">📦</div>
            <h3 className="feature-card-title">Inventory Management</h3>
            <p className="feature-card-desc">
              Suppliers can list, update, and manage inventory in real time. Buyers always see accurate stock availability.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-card-icon">📊</div>
            <h3 className="feature-card-title">Business Insights</h3>
            <p className="feature-card-desc">
              Track your orders, payouts, and performance metrics from a clean, intuitive dashboard built for traders.
            </p>
          </div>
        </div>
      </section>

      {/* ── Product Showcase ── */}
      <section className="landing-section landing-section-showcase">
        <div className="landing-section-center">
          <span className="landing-section-eyebrow">Top Products</span>
          <h2 className="landing-section-title">Browse Top Products</h2>
          <p className="landing-section-sub">Discover the latest smartphones available for wholesale ordering on our platform.</p>
        </div>
        <div className="showcase-grid">
          <div className="showcase-card">
            <div className="showcase-img-wrap">
              <img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80" alt="iPhone smartphone wholesale" loading="lazy" className="showcase-img" />
            </div>
            <div className="showcase-card-body">
              <div className="showcase-brand">Apple</div>
              <div className="showcase-name">iPhone 14 Pro Max</div>
              <div className="showcase-price">₹1,09,999</div>
              <Link className="showcase-btn" to="/register?role=buyer">Order Now</Link>
            </div>
          </div>
          <div className="showcase-card">
            <div className="showcase-img-wrap">
              <img src="https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80" alt="Samsung Galaxy smartphone wholesale" loading="lazy" className="showcase-img" />
            </div>
            <div className="showcase-card-body">
              <div className="showcase-brand">Samsung</div>
              <div className="showcase-name">Galaxy S23 Ultra</div>
              <div className="showcase-price">₹1,24,999</div>
              <Link className="showcase-btn" to="/register?role=buyer">Order Now</Link>
            </div>
          </div>
          <div className="showcase-card">
            <div className="showcase-img-wrap">
              <img src="https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80" alt="Android smartphone wholesale listing" loading="lazy" className="showcase-img" />
            </div>
            <div className="showcase-card-body">
              <div className="showcase-brand">OnePlus</div>
              <div className="showcase-name">OnePlus 11 5G</div>
              <div className="showcase-price">₹56,999</div>
              <Link className="showcase-btn" to="/register?role=buyer">Order Now</Link>
            </div>
          </div>
          <div className="showcase-card">
            <div className="showcase-img-wrap">
              <img src="https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80" alt="Samsung Galaxy phone wholesale" loading="lazy" className="showcase-img" />
            </div>
            <div className="showcase-card-body">
              <div className="showcase-brand">Samsung</div>
              <div className="showcase-name">Galaxy A54 5G</div>
              <div className="showcase-price">₹38,999</div>
              <Link className="showcase-btn" to="/register?role=buyer">Order Now</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="landing-section-alt">
        <div className="landing-section-center">
          <span className="landing-section-eyebrow">How It Works</span>
          <h2 className="landing-section-title">Three simple steps to start trading</h2>
          <p className="landing-section-sub">
            Get from registration to your first order in minutes.
          </p>
        </div>
        <div className="how-steps">
          <div className="how-step">
            <div className="step-number">1</div>
            <span className="how-step-emoji">📝</span>
            <h3 className="how-step-title">Create Your Account</h3>
            <p className="how-step-desc">
              Register as a retailer or wholesaler, complete KYC verification, and get approved by the admin team.
            </p>
          </div>
          <div className="how-step">
            <div className="step-number">2</div>
            <span className="how-step-emoji">🛒</span>
            <h3 className="how-step-title">Browse &amp; Order</h3>
            <p className="how-step-desc">
              Retailers browse live stock and place orders at competitive wholesale prices. Wholesalers list their inventory.
            </p>
          </div>
          <div className="how-step">
            <div className="step-number">3</div>
            <span className="how-step-emoji">🚚</span>
            <h3 className="how-step-title">Fast Delivery</h3>
            <p className="how-step-desc">
              Admin coordinates fulfilment, tracks delivery, and handles any disputes — so you can focus on business.
            </p>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="landing-section landing-section-testimonials">
        <div className="landing-section-center">
          <span className="landing-section-eyebrow">Social Proof</span>
          <h2 className="landing-section-title">Trusted by thousands of businesses</h2>
          <p className="landing-section-sub">Hear from retailers and wholesalers who have grown their business on SaleBySale.</p>
        </div>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
            <p className="testimonial-quote">"SaleBySale has completely transformed how I source phones for my shop. I get the best wholesale prices and delivery is always on time."</p>
            <div className="testimonial-author">
              <img src="https://i.pravatar.cc/60?img=1" alt="Rajesh Kumar, Mobile Retailer" loading="lazy" className="testimonial-avatar" />
              <div>
                <div className="testimonial-name">Rajesh Kumar</div>
                <div className="testimonial-role">Mobile Retailer, Delhi</div>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
            <p className="testimonial-quote">"As a wholesaler, I can now list my stock once and receive orders from hundreds of retailers. The confidentiality feature is a game changer."</p>
            <div className="testimonial-author">
              <img src="https://i.pravatar.cc/60?img=2" alt="Priya Sharma, Electronics Wholesaler" loading="lazy" className="testimonial-avatar" />
              <div>
                <div className="testimonial-name">Priya Sharma</div>
                <div className="testimonial-role">Electronics Wholesaler, Mumbai</div>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
            <p className="testimonial-quote">"The platform is incredibly easy to use. I placed my first order within 10 minutes of signing up and my inventory arrived the next day."</p>
            <div className="testimonial-author">
              <img src="https://i.pravatar.cc/60?img=3" alt="Amit Patel, Mobile Shop Owner" loading="lazy" className="testimonial-avatar" />
              <div>
                <div className="testimonial-name">Amit Patel</div>
                <div className="testimonial-role">Mobile Shop Owner, Ahmedabad</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="cta-banner cta-banner-image">
        <div className="cta-banner-overlay" />
        <div className="cta-banner-content">
          <h2 className="cta-banner-title">Ready to grow your mobile business?</h2>
          <p className="cta-banner-sub">Join thousands of retailers and wholesalers already trading on SaleBySale.</p>
          <div className="cta-banner-btns">
            <Link className="cta-banner-btn-white" to="/register?role=buyer">Register as Retailer</Link>
            <Link className="cta-banner-btn-outline" to="/register?role=supplier">Register as Wholesaler</Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-footer-brand">
          <div className="landing-footer-mark">S</div>
          SaleBySale
        </div>
        <div className="landing-footer-links">
          <Link to="/login">Sign In</Link>
          <Link to="/register">Register</Link>
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
