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
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
