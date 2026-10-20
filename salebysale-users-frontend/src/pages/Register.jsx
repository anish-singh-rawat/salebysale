import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    role: "buyer",
    name: "",
    email: "",
    phone: "",
    password: "Demo@123",
    shopName: "",
    gst: "",
    address: "",
    area: "Jwalapur",
  });
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/app");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="hero-bg">
      <div className="wrap" style={{ maxWidth: 640 }}>
        <Link to="/" className="brand" style={{ margin: "32px 0" }}>
          <div className="mark">S</div> Join SaleBySale Network
        </Link>
        <div className="card">
          {error && <div className="alert">{error}</div>}
          <form className="form" onSubmit={onSubmit}>
            <label>
              Role
              <select value={form.role} onChange={set("role")}>
                <option value="buyer">Retailer (Buyer)</option>
                <option value="supplier">Wholesaler (Supplier)</option>
              </select>
            </label>
            <div className="grid cols-2">
              <label>
                Name
                <input value={form.name} onChange={set("name")} required />
              </label>
              <label>
                Phone
                <input value={form.phone} onChange={set("phone")} required />
              </label>
            </div>
            <label>
              Email
              <input value={form.email} onChange={set("email")} required />
            </label>
            {form.role !== "rider" && (
              <>
                <label>
                  Shop name
                  <input value={form.shopName} onChange={set("shopName")} />
                </label>
                <div className="grid cols-2">
                  <label>
                    GST
                    <input value={form.gst} onChange={set("gst")} />
                  </label>
                  <label>
                    Area
                    <input value={form.area} onChange={set("area")} />
                  </label>
                </div>
                <label>
                  Address
                  <input value={form.address} onChange={set("address")} />
                </label>
              </>
            )}
            <label>
              Password
              <input type="password" value={form.password} onChange={set("password")} />
            </label>
            <button className="btn" type="submit">
              Submit Registration
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
