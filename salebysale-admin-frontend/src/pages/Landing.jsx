import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="hero-bg">
      <header className="topbar">
        <div className="brand">
          <div className="mark">S</div>
          <div>
            SELL BY SELL
            <div className="tag">Haridwar · Hyperlocal B2B · Express</div>
          </div>
        </div>
        <div className="row">
          <Link className="btn ghost" to="/login">
            Sign in
          </Link>
          <Link className="btn" to="/register">
            Join the network
          </Link>
        </div>
      </header>
      <div className="wrap">
        <section className="hero">
          <div>
            <div className="pills">
              <span className="pill">2.0 · Oct 2026</span>
              <span className="pill">Verified B2B</span>
              <span className="pill">One Network · Every Store · More Sales</span>
            </div>
            <h1>
              Haridwar mobile retailers ke liye
              <span className="gold"> live stock</span> & express delivery.
            </h1>
            <p className="lede">
              Stock kisi ke bhi ho, sale aapki hogi. Buyer ko sirf SELL BY SELL listing, net price aur ETA dikhega —
              asli supplier identity chhupi rahegi.
            </p>
            <div className="row" style={{ marginTop: 24 }}>
              <Link className="btn" to="/login">
                Open buyer / shop apps
              </Link>
              <Link className="btn ghost" to="/register">
                Onboard a dukaan
              </Link>
            </div>
          </div>
          <div className="card">
            <h3>Order journey</h3>
            <ol className="stat-list">
              <li>
                <span>1. Search verified SKU</span>
                <strong>OPPO A58 8/128</strong>
              </li>
              <li>
                <span>2. Matching engine</span>
                <strong>price · ETA · rider</strong>
              </li>
              <li>
                <span>3. Reserve 3–5 min</span>
                <strong>atomic lock</strong>
              </li>
              <li>
                <span>4. Pickup OTP → delivery OTP</span>
                <strong>sealed box</strong>
              </li>
              <li>
                <span>5. Settlement</span>
                <strong>T+1 after POD</strong>
              </li>
            </ol>
          </div>
        </section>
        <div className="grid cols-4">
          {[
            ["Supplier portal", "KYC, stock ON/OFF, floor price, accept, pack, payouts"],
            ["Retailer app", "Search, landed price, ETA, prepaid, tracking, dispute"],
            ["Rider app", "Duty, map task, OTP, photo proof, failed reason"],
            ["Admin console", "Approvals, private identity, dispatch, SLA, fraud"],
          ].map(([t, d]) => (
            <div className="card" key={t}>
              <h3>{t}</h3>
              <p className="muted">{d}</p>
            </div>
          ))}
        </div>
        <p className="tiny" style={{ marginTop: 28 }}>
          Demo logins after seed: admin@sellbysell.com, supplier1@sellbysell.com, buyer@sellbysell.com,
          rider@sellbysell.com · password Demo@123
        </p>
      </div>
    </div>
  );
}
