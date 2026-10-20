import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="hero-bg">
      <header className="topbar">
        <div className="brand">
          <div className="mark">S</div>
          <div>SaleBySale Admin Portal</div>
        </div>
        <div className="row">
          <Link className="btn" to="/login">
            Admin Sign In
          </Link>
        </div>
      </header>
      <div className="wrap">
        <section className="hero">
          <div>
            <h1>
              SaleBySale <span className="primary">Admin Portal</span>
            </h1>
            <p className="lede">
              Manage the entire marketplace ecosystem. Control orders, verify users, resolve disputes, and monitor platform performance.
            </p>
            <div className="row" style={{ marginTop: 32 }}>
              <Link className="btn" to="/login">
                Admin Sign In
              </Link>
            </div>
          </div>
          <div className="card">
            <h3>Admin Capabilities</h3>
            <ul className="stat-list">
              <li>
                <span>Orders</span>
                <strong>Manage & track all orders</strong>
              </li>
              <li>
                <span>Users</span>
                <strong>KYC & verification</strong>
              </li>
              <li>
                <span>Disputes</span>
                <strong>Resolution & refunds</strong>
              </li>
              <li>
                <span>Analytics</span>
                <strong>Platform insights</strong>
              </li>
            </ul>
          </div>
        </section>
        <div className="grid cols-4" style={{ marginTop: 48 }}>
          <div className="card">
            <h3>Order Management</h3>
            <p className="muted">Process and track all marketplace orders from creation to delivery</p>
          </div>
          <div className="card">
            <h3>User Verification</h3>
            <p className="muted">KYC approvals for buyers and suppliers, manage user status</p>
          </div>
          <div className="card">
            <h3>Dispute Resolution</h3>
            <p className="muted">Handle conflicts, process refunds, and maintain fair marketplace</p>
          </div>
          <div className="card">
            <h3>Analytics Dashboard</h3>
            <p className="muted">Monitor platform performance, revenue, and operational metrics</p>
          </div>
        </div>
      </div>
    </div>
  );
}
