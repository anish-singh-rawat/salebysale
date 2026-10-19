import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, inr } from "../api.js";

export function BuyerSearch() {
  const [q, setQ] = useState("OPPO A58");
  const [skus, setSkus] = useState([]);
  const [offers, setOffers] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function search(e) {
    e?.preventDefault();
    setError("");
    try {
      const data = await api(`/catalog/search?q=${encodeURIComponent(q)}`);
      setSkus(data.skus);
      setOffers(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function availability(skuId) {
    setError("");
    try {
      const data = await api(`/inventory/availability?sku_id=${skuId}`);
      setOffers(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function buy(inventoryId) {
    const created = await api("/orders", { method: "POST", body: { inventoryId, qty: 1 } });
    const paid = await api(`/orders/${created.order._id}/confirm`, { method: "POST" });
    navigate(`/app/orders/${paid.order._id}`);
  }

  useEffect(() => {
    search();
  }, []);

  return (
    <div>
      <h2>Model search</h2>
      <p className="muted">Sirf available, verified, sell-worthy listings. Supplier naam nahi dikhega.</p>
      {error && <div className="alert">{error}</div>}
      <form className="row" onSubmit={search} style={{ margin: "16px 0" }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Brand / model / color" style={{ flex: 1 }} />
        <button className="btn">Search</button>
      </form>
      <div className="grid cols-2">
        {skus.map((s) => (
          <button key={s._id} className="card" onClick={() => availability(s._id)} style={{ textAlign: "left" }}>
            <strong>
              {s.brand} {s.model}
            </strong>
            <div className="muted">
              {s.variant} · {s.color} · {s.warranty}
            </div>
          </button>
        ))}
      </div>
      {offers && (
        <div style={{ marginTop: 24 }}>
          <h3>
            {offers.sku.brand} {offers.sku.model} {offers.sku.color}
          </h3>
          {!offers.offers.length && <p className="muted">Is variant ka verified stock abhi nahi hai.</p>}
          <div className="grid">
            {offers.offers.map((o) => (
              <div className="card offer" key={o.inventoryId}>
                <div>
                  <div className="badge">{o.listingLabel}</div>
                  <h3 style={{ margin: "8px 0" }}>{inr(o.pricing.landedPrice)} landed</h3>
                  <div className="tiny">
                    ETA {o.eta.etaMin}–{o.eta.etaMax} min · {o.km} km · {o.availableQty} unit · ready {o.readyInMinutes} min
                  </div>
                  <div className="tiny">
                    Floor+margin {inr(o.pricing.supplierPayout)} · fee {inr(o.pricing.platformFee)} · delivery{" "}
                    {inr(o.pricing.deliveryCharge)}
                  </div>
                </div>
                <button className="btn" onClick={() => buy(o.inventoryId)}>
                  Pay & reserve
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function BuyerOrders() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    api("/orders").then((d) => setOrders(d.orders));
  }, []);
  return (
    <div>
      <h2>Orders</h2>
      <table>
        <thead>
          <tr>
            <th>Listing</th>
            <th>Status</th>
            <th>Amount</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>{o.items?.[0]?.listingLabel}</td>
              <td>
                <span className="badge">{o.status}</span>
              </td>
              <td>{inr(o.totals?.landedPrice)}</td>
              <td>
                <Link to={`/app/orders/${o._id}`}>Track</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BuyerOrder() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [reason, setReason] = useState("Wrong IMEI / DOA");
  const [msg, setMsg] = useState("");

  async function load() {
    const d = await api(`/orders/${id}`);
    setOrder(d.order);
  }
  useEffect(() => {
    load();
  }, [id]);

  if (!order) return <p>Loading…</p>;
  const sku = order.items?.[0]?.skuId;
  return (
    <div className="grid cols-2">
      <div className="card">
        <div className="badge">{order.items?.[0]?.listingLabel}</div>
        <h2>
          {sku?.brand} {sku?.model} {sku?.color}
        </h2>
        <p className="muted">Supplier public identity hidden. Invoice/legal mapping admin-only.</p>
        <ul className="stat-list">
          <li>
            <span>Landed</span>
            <strong>{inr(order.totals?.landedPrice)}</strong>
          </li>
          <li>
            <span>ETA band</span>
            <strong>
              {order.sla?.etaMin}–{order.sla?.etaMax} min
            </strong>
          </li>
          <li>
            <span>Status</span>
            <strong>{order.status}</strong>
          </li>
        </ul>
        {order.tracking?.deliveryOtp && (
          <div>
            <div className="tiny">Delivery OTP (share only with rider at drop)</div>
            <div className="otp">{order.tracking.deliveryOtp}</div>
          </div>
        )}
      </div>
      <div className="card">
        <h3>Events</h3>
        {(order.events || []).map((e, i) => (
          <div key={i} className="tiny">
            {e.name} · {new Date(e.at).toLocaleTimeString()}
          </div>
        ))}
        <label style={{ marginTop: 16 }}>
          Dispute
          <input value={reason} onChange={(e) => setReason(e.target.value)} />
        </label>
        <button
          className="btn danger small"
          onClick={async () => {
            await api(`/orders/${id}/dispute`, { method: "POST", body: { reason } });
            setMsg("Dispute opened");
            load();
          }}
        >
          Open dispute
        </button>
        {msg && <div className="ok">{msg}</div>}
      </div>
    </div>
  );
}
