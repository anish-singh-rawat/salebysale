import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="hero-bg">
      <header className="topbar">
        <div className="brand">
          <div className="mark">S</div>
          <div>SaleBySale</div>
        </div>
        <div className="row">
          <Link className="btn ghost" to="/login">
            Sign in
          </Link>
          <Link className="btn" to="/register">
            Join Now
          </Link>
        </div>
      </header>
      <div className="wrap">
        <section className="hero">
          <div>
            <h1>
              Connect Retailers & <span className="primary">Wholesalers</span>
            </h1>
            <p className="lede">
              List your mobile inventory or find the best wholesale deals. SaleBySale connects buyers and sellers while keeping supplier identities confidential.
            </p>
            <div className="row" style={{ marginTop: 32 }}>
              <Link className="btn" to="/register?role=buyer">
                Register as Retailer
              </Link>
              <Link className="btn ghost" to="/register?role=supplier">
                Register as Wholesaler
              </Link>
            </div>
          </div>
          <div className="card">
            <h3>How It Works</h3>
            <ol className="stat-list">
              <li>
                <span>Retailers</span>
                <strong>Browse available stock</strong>
              </li>
              <li>
                <span>Place orders</span>
                <strong>Competitive pricing</strong>
              </li>
              <li>
                <span>Admin manages</span>
                <strong>Sourcing & delivery</strong>
              </li>
              <li>
                <span>Fast fulfillment</span>
                <strong>Secure payments</strong>
              </li>
            </ol>
          </div>
        </section>
        <div className="grid cols-2" style={{ marginTop: 48 }}>
          <div className="card">
            <h3>For Retailers</h3>
            <ul className="stat-list">
              <li>
                <span>✓</span>
                <strong>Browse verified stock</strong>
              </li>
              <li>
                <span>✓</span>
                <strong>Competitive prices</strong>
              </li>
              <li>
                <span>✓</span>
                <strong>Fast delivery</strong>
              </li>
            </ul>
          </div>
          <div className="card">
            <h3>For Wholesalers</h3>
            <ul className="stat-list">
              <li>
                <span>✓</span>
                <strong>List your inventory</strong>
              </li>
              <li>
                <span>✓</span>
                <strong>Reach more retailers</strong>
              </li>
              <li>
                <span>✓</span>
                <strong>Secure payments</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
