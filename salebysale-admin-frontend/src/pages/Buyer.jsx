import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, inr } from "../api.js";

/* ── Shared helpers ── */
const STATUS_CLASS = {
  delivered: "status-delivered",
  reserved: "status-reserved",
  awaiting_admin: "status-awaiting_admin",
  assigned: "status-assigned",
  picked: "status-picked",
  cancelled: "status-cancelled",
  disputed: "status-disputed",
};

function StatusBadge({ status }) {
  return (
    <span className={`badge ${STATUS_CLASS[status] || ""}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}

/* ── BuyerSearch ── */
export function BuyerSearch() {
  // ── All JS logic unchanged ──
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

  // ── JSX redesigned ──
  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2>Model Search</h2>
          <p className="muted">Verified, sell-worthy listings — supplier identity stays private.</p>
        </div>
      </div>

      {error && <div className="inline-error" style={{ marginBottom: 14 }}>{error}</div>}

      <form className="search-bar" onSubmit={search}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Brand / model / color"
          style={{ flex: 1 }}
        />
        <button className="btn" type="submit">Search</button>
      </form>

      {skus.length > 0 && (
        <div className="grid cols-2" style={{ gap: 16 }}>
          {skus.map((s) => (
            <button
              key={s._id}
              className="product-card"
              onClick={() => availability(s._id)}
              style={{ textAlign: "left", cursor: "pointer", border: "none" }}
            >
              <div className="product-card-img">📱</div>
              <div className="product-card-body">
                <div className="product-card-brand">{s.brand}</div>
                <div className="product-card-title">{s.model}</div>
                <div className="product-card-sub">{[s.variant, s.color, s.warranty].filter(Boolean).join(" · ")}</div>
                <div className="product-card-footer">
                  <span className="product-card-cta">Check availability →</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {offers && (
        <div style={{ marginTop: 24 }}>
          <div className="page-header" style={{ marginBottom: 14 }}>
            <h3 style={{ margin: 0 }}>
              {offers.sku.brand} {offers.sku.model} {offers.sku.color}
            </h3>
          </div>

          {!offers.offers.length && (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h4>No stock available</h4>
              <p>Is variant ka verified stock abhi nahi hai.</p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {offers.offers.map((o) => (
              <div className="section-card" key={o.inventoryId}>
                <div className="section-card-header">
                  <h3>
                    <span className="badge">{o.listingLabel}</span>
                    <span style={{ marginLeft: 10, fontWeight: 700, color: "var(--primary)" }}>
                      {inr(o.pricing.landedPrice)} landed
                    </span>
                  </h3>
                </div>
                <div className="section-card-body offer">
                  <div>
                    <div className="muted" style={{ fontSize: 13, marginBottom: 4 }}>
                      ETA {o.eta.etaMin}–{o.eta.etaMax} min · {o.km} km · {o.availableQty} unit · ready {o.readyInMinutes} min
                    </div>
                    <div className="muted" style={{ fontSize: 13 }}>
                      Floor+margin {inr(o.pricing.supplierPayout)} · fee {inr(o.pricing.platformFee)} · delivery{" "}
                      {inr(o.pricing.deliveryCharge)}
                    </div>
                  </div>
                  <button className="btn" onClick={() => buy(o.inventoryId)}>
                    Pay &amp; reserve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── BuyerOrders ── */
export function BuyerOrders() {
  // ── All JS logic unchanged ──
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    api("/orders").then((d) => setOrders(d.orders));
  }, []);

  // ── JSX redesigned ──
  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2>Orders</h2>
          <p className="muted">{orders.length} order{orders.length !== 1 ? "s" : ""} total</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h4>No orders yet</h4>
          <p>Orders will appear here once buyers place them.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {orders.map((o) => (
            <div key={o._id} className="order-row">
              <div className="order-row-icon">📱</div>
              <div className="order-row-info">
                <div className="order-row-title">{o.items?.[0]?.listingLabel}</div>
                <div className="order-row-meta">Order #{o._id.slice(-8).toUpperCase()}</div>
              </div>
              <div className="order-row-right">
                <div className="order-row-price">{inr(o.totals?.landedPrice)}</div>
                <StatusBadge status={o.status} />
              </div>
              <Link to={`/app/orders/${o._id}`} className="btn ghost small">Track →</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── BuyerOrder ── */
export function BuyerOrder() {
  // ── All JS logic unchanged ──
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

  if (!order) return <p className="muted" style={{ padding: 24 }}>Loading…</p>;
  const sku = order.items?.[0]?.skuId;

  // ── JSX redesigned ──
  return (
    <div className="fade-in">
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
        <Link to="/app/orders" className="btn ghost small">← Back</Link>
        <h2 style={{ margin: 0, fontSize: 18 }}>Order #{id.slice(-8).toUpperCase()}</h2>
      </div>

      <div className="grid cols-2" style={{ gap: 20 }}>
        {/* Left: Product summary */}
        <div className="section-card">
          <div className="section-card-header">
            <h3>📱 Product Summary</h3>
            <span className="badge">{order.items?.[0]?.listingLabel}</span>
          </div>
          <div className="section-card-body">
            <h3 style={{ margin: "0 0 4px" }}>
              {sku?.brand} {sku?.model} {sku?.color}
            </h3>
            <p className="muted" style={{ margin: "0 0 18px", fontSize: 13 }}>
              Supplier public identity hidden. Invoice/legal mapping admin-only.
            </p>
            <ul className="stat-list">
              <li>
                <span>Landed</span>
                <strong style={{ color: "var(--primary)" }}>{inr(order.totals?.landedPrice)}</strong>
              </li>
              <li>
                <span>ETA band</span>
                <strong>{order.sla?.etaMin}–{order.sla?.etaMax} min</strong>
              </li>
              <li>
                <span>Status</span>
                <strong><StatusBadge status={order.status} /></strong>
              </li>
            </ul>

            {order.tracking?.deliveryOtp && (
              <div className="otp-box">
                <div className="otp-hint">🔑 Delivery OTP — share only with rider at drop</div>
                <div className="otp">{order.tracking.deliveryOtp}</div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Events + dispute */}
        <div className="section-card">
          <div className="section-card-header"><h3>🕐 Events</h3></div>
          <div className="section-card-body">
            <div className="timeline">
              {(order.events || []).map((e, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-name">{e.name}</div>
                  <div className="timeline-time">{new Date(e.at).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>

            <div className="action-box danger-box" style={{ marginTop: 16 }}>
              <h4 style={{ color: "var(--danger)" }}>Raise Dispute</h4>
              <input value={reason} onChange={(e) => setReason(e.target.value)} />
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
            </div>

            {msg && (
              <div className="inline-success" style={{ marginTop: 12 }}>{msg}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
