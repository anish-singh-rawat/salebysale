import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const user = await login(email, password, { app: 'admin' });
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
          <h2>Admin Panel Login</h2>
          <p className="muted">Authorized personnel only — SaleBySale Management.</p>
          {error && <div className="alert">{error}</div>}
          <form className="form" onSubmit={onSubmit}>
            <label>
              Email
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="admin@salebysale.com"
                required
              />
            </label>
            <label>
              Password
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter your password"
                required
              />
            </label>
            <button className="btn" type="submit">
              Login to Admin Panel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
