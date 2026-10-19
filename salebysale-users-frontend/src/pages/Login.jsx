import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

const demos = [
  ["Admin", "admin@sellbysell.com"],
  ["Supplier · Shiv Ganga", "supplier1@sellbysell.com"],
  ["Buyer retailer", "buyer@sellbysell.com"],
  ["Rider", "rider@sellbysell.com"],
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("buyer@sellbysell.com");
  const [password, setPassword] = useState("Demo@123");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const user = await login(email, password, { app: 'users' });
      navigate("/app");
      return user;
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="hero-bg">
      <div className="wrap" style={{ maxWidth: 480 }}>
        <Link to="/" className="brand" style={{ margin: "32px 0" }}>
          <div className="mark">S</div> SELL BY SELL
        </Link>
        <div className="card">
          <h2>Sign in</h2>
          <p className="muted">Prepaid verified network — Haridwar pilot.</p>
          {error && <div className="alert">{error}</div>}
          <form className="form" onSubmit={onSubmit}>
            <label>
              Email
              <input value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label>
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <button className="btn" type="submit">
              Enter network
            </button>
          </form>
          <div className="grid" style={{ marginTop: 16 }}>
            {demos.map(([label, mail]) => (
              <button key={mail} className="btn ghost small" type="button" onClick={() => setEmail(mail)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
