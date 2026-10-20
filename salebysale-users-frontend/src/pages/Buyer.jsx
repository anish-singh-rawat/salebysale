import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, inr } from "../api.js";
import { useCart } from "../CartContext.jsx";

const PAGE_SIZE = 20;

/* ─── BuyerSearch ───────────────────────────────────────── */
export function BuyerSearch() {
  const [q, setQ] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [skus, setSkus] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { totalItems } = useCart();

  async function loadCatalog(search, pg) {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: pg, limit: PAGE_SIZE });
      if (search) params.set("q", search);
      const data = await api(`/catalog?${params}`);
      setSkus(data.skus);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    setQ(inputVal);
    setPage(1);
  }

  useEffect(() => {
    loadCatalog(q, page);
  }, [q, page]);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>Browse Products</h2>
          <p className="muted">Verified listings. Supplier identity stays private.</p>
        </div>
        {totalItems > 0 && (
          <button className="btn small" onClick={() => navigate("/app/cart")} style={{ position: "relative" }}>
            🛒 Cart
            <span
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                background: "var(--danger)",
                color: "#fff",
                borderRadius: "50%",
                width: 18,
                height: 18,
                fontSize: 11,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {totalItems}
            </span>
          </button>
        )}
      </div>

      {error && <div className="alert" style={{ marginBottom: 12 }}>{error}</div>}

      {/* Search bar */}
      <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, margin: "16px 0" }}>
        <input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Search brand, model, color…"
          style={{ flex: 1 }}
        />
        <button className="btn" type="submit">Search</button>
        {q && (
          <button
            className="btn ghost"
            type="button"
            onClick={() => { setInputVal(""); setQ(""); setPage(1); }}
          >
            Clear
          </button>
        )}
      </form>

      {/* Results count */}
      {!loading && (
        <p className="muted" style={{ marginBottom: 12 }}>
          {total} product{total !== 1 ? "s" : ""}{q ? ` for "${q}"` : ""}
        </p>
      )}

      {/* Product grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div className="spinner" style={{ margin: "0 auto 12px" }} />
          <p className="muted">Loading products…</p>
        </div>
      ) : skus.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
          <p className="muted">No products found{q ? ` for "${q}"` : ""}.</p>
        </div>
      ) : (
        <div className="grid cols-3" style={{ gap: 16 }}>
          {skus.map((s) => (
            <ProductCard key={s._id} sku={s} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 24 }}>
          <button className="btn ghost small" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            ← Prev
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`btn small${p === page ? "" : " ghost"}`}
              onClick={() => setPage(p)}
              style={{ minWidth: 36 }}
            >
              {p}
            </button>
          ))}
          <button className="btn ghost small" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── ProductCard ───────────────────────────────────────── */
function ProductCard({ sku }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/app/product/${sku._id}`)}
      className="card"
      style={{
        padding: 0,
        overflow: "hidden",
        cursor: "pointer",
        transition: "box-shadow 0.15s, transform 0.15s",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(37,99,235,0.15)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "";
        e.currentTarget.style.transform = "";
      }}
    >
      {/* Image area */}
      <div
        style={{
          width: "100%",
          height: 160,
          background: "linear-gradient(135deg, #eff6ff, #f1f5f9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 56,
        }}
      >
        📱
      </div>

      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {sku.brand}
        </div>
        <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", lineHeight: 1.3 }}>
          {sku.model}
        </div>
        <div className="muted" style={{ fontSize: 13 }}>
          {[sku.variant, sku.color].filter(Boolean).join(" · ")}
        </div>

        {sku.warranty && (
          <span
            style={{
              display: "inline-block",
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 999,
              background: "var(--primary-light)",
              color: "var(--primary)",
              fontWeight: 600,
              alignSelf: "flex-start",
              marginTop: 2,
            }}
          >
            {sku.warranty}
          </span>
        )}

        <div
          style={{
            marginTop: "auto",
            paddingTop: 10,
            fontSize: 13,
            color: "var(--primary)",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          View details →
        </div>
      </div>
    </div>
  );
}

/* ─── BuyerOrders ───────────────────────────────────────── */
export function BuyerOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api("/orders")
      .then((d) => { setOrders(d.orders); setFilteredOrders(d.orders); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setFilteredOrders(statusFilter ? orders.filter((o) => o.status === statusFilter) : orders);
  }, [statusFilter, orders]);

  const statuses = ["reserved", "awaiting_admin", "assigned", "picked", "delivered", "disputed", "cancelled"];

  if (loading) return <p>Loading…</p>;
  if (error) return <div className="alert">{error}</div>;
  if (orders.length === 0) return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
      <p className="muted" style={{ marginBottom: 16 }}>No orders yet</p>
      <Link to="/app/search" className="btn">Browse Products</Link>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2>My Orders</h2>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          {statuses.map((st) => <option key={st} value={st}>{st}</option>)}
        </select>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filteredOrders.map((o) => {
          const sku = o.items?.[0]?.skuId;
          const statusColors = {
            delivered: "#10b981", reserved: "#f59e0b", awaiting_admin: "#3b82f6",
            assigned: "#8b5cf6", picked: "#ec4899", cancelled: "#ef4444", disputed: "#ef4444",
          };
          return (
            <div
              key={o._id}
              style={{
                display: "flex",
                gap: 16,
                padding: 16,
                background: "var(--card)",
                border: "1px solid var(--line)",
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  background: "#f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  flexShrink: 0,
                }}
              >
                📱
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
                  {sku?.brand} {sku?.model} {sku?.color}
                </div>
                <div className="tiny">Order #{o._id.slice(-8).toUpperCase()}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontWeight: 700, color: "var(--primary)", marginBottom: 4 }}>
                  {inr(o.totals?.landedPrice)}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: `${statusColors[o.status] || "#6b7280"}22`,
                    color: statusColors[o.status] || "#6b7280",
                  }}
                >
                  {o.status}
                </span>
              </div>
              <Link
                to={`/app/orders/${o._id}`}
                className="btn ghost small"
                style={{ flexShrink: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                Track →
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── BuyerOrder (tracking detail) ──────────────────────── */
export function BuyerOrder() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [reason, setReason] = useState("Wrong IMEI / DOA");
  const [cancelReason, setCancelReason] = useState("");
  const [msg, setMsg] = useState("");
  const [etaRemaining, setEtaRemaining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const d = await api(`/orders/${id}`);
      setOrder(d.order);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    if (!order) return;
    if (["assigned", "picked"].includes(order.status)) {
      const etaMax = order.sla?.etaMax;
      if (etaMax && order.events) {
        const ev = order.events.find((e) => e.name === order.status);
        if (ev) {
          const elapsed = Math.floor((Date.now() - new Date(ev.at)) / 60000);
          setEtaRemaining(Math.max(0, etaMax - elapsed));
        }
      }
    }
  }, [order]);

  if (loading) return <div style={{ padding: "40px 0", textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>;
  if (error) return <div className="alert">{error}</div>;
  if (!order) return <p className="muted">Order not found</p>;

  const sku = order.items?.[0]?.skuId;
  const canCancel = ["reserved", "awaiting_admin"].includes(order.status);

  const statusSteps = [
    { key: "reserved", label: "Order Placed" },
    { key: "awaiting_admin", label: "Payment Confirmed" },
    { key: "assigned", label: "Rider Assigned" },
    { key: "picked", label: "Picked Up" },
    { key: "delivered", label: "Delivered" },
  ];
  const currentStep = statusSteps.findIndex((s) => s.key === order.status);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <Link to="/app/orders" className="btn ghost small">← Orders</Link>
        <h2 style={{ margin: 0 }}>Order #{id.slice(-8).toUpperCase()}</h2>
      </div>

      {/* Progress stepper */}
      {!["cancelled", "disputed"].includes(order.status) && (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--line)",
            borderRadius: 10,
            padding: "20px 24px",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            {statusSteps.map((step, i) => {
              const done = i <= currentStep;
              const active = i === currentStep;
              return (
                <div key={step.key} style={{ display: "flex", alignItems: "center", flex: i < statusSteps.length - 1 ? 1 : 0 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: done ? "var(--primary)" : "var(--bg2)",
                        border: `2px solid ${done ? "var(--primary)" : "var(--line)"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: done ? "#fff" : "var(--muted)",
                        fontSize: 13,
                        fontWeight: 700,
                        boxShadow: active ? "0 0 0 4px var(--primary-light)" : "none",
                      }}
                    >
                      {done ? "✓" : i + 1}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: active ? 700 : 400,
                        color: done ? "var(--primary)" : "var(--muted)",
                        textAlign: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {step.label}
                    </div>
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div
                      style={{
                        flex: 1,
                        height: 2,
                        background: i < currentStep ? "var(--primary)" : "var(--line)",
                        margin: "0 4px",
                        marginBottom: 20,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid cols-2" style={{ gap: 20 }}>
        {/* Order summary */}
        <div className="card">
          <div
            style={{
              display: "inline-block",
              fontSize: 11,
              fontWeight: 700,
              padding: "2px 10px",
              borderRadius: 999,
              background: "var(--primary-light)",
              color: "var(--primary)",
              marginBottom: 10,
            }}
          >
            SELL BY SELL verified stock
          </div>
          <h2 style={{ margin: "0 0 4px" }}>
            {sku?.brand} {sku?.model}
          </h2>
          <p className="muted" style={{ margin: "0 0 16px" }}>
            {[sku?.variant, sku?.color].filter(Boolean).join(" · ")}
          </p>
          <ul className="stat-list">
            <li><span>Total Paid</span><strong style={{ color: "var(--primary)", fontSize: 18 }}>{inr(order.totals?.landedPrice)}</strong></li>
            <li><span>ETA Band</span><strong>{order.sla?.etaMin}–{order.sla?.etaMax} min</strong></li>
            <li><span>Status</span>
              <strong>
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: order.status === "delivered" ? "var(--success)" : "var(--warning)", marginRight: 6 }} />
                {order.status}
              </strong>
            </li>
            {etaRemaining !== null && (
              <li><span>ETA Remaining</span><strong>{etaRemaining} min</strong></li>
            )}
          </ul>

          {order.tracking?.deliveryOtp && (
            <div
              style={{
                marginTop: 16,
                padding: "14px 16px",
                background: "var(--primary-light)",
                borderRadius: 8,
                textAlign: "center",
              }}
            >
              <div className="tiny" style={{ marginBottom: 4 }}>
                🔑 Delivery OTP — share only with rider at your door
              </div>
              <div className="otp">{order.tracking.deliveryOtp}</div>
            </div>
          )}
        </div>

        {/* Timeline + actions */}
        <div className="card">
          <h3 style={{ margin: "0 0 16px" }}>Timeline</h3>
          <div style={{ borderLeft: "2px solid var(--primary-light)", paddingLeft: 16, marginLeft: 8 }}>
            {(order.events || []).map((e, i) => (
              <div key={i} style={{ position: "relative", marginBottom: 16 }}>
                <div
                  style={{
                    position: "absolute",
                    left: -22,
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: "var(--primary)",
                    border: "2px solid var(--bg)",
                  }}
                />
                <div style={{ fontWeight: 600, fontSize: 14 }}>{e.name.replace(/([a-z])([A-Z])/g, "$1 $2")}</div>
                <div className="tiny">{new Date(e.at).toLocaleString()}</div>
                {e.note && <div className="tiny" style={{ marginTop: 2, color: "var(--text)" }}>{e.note}</div>}
              </div>
            ))}
          </div>

          {canCancel && (
            <div
              style={{
                marginTop: 20,
                padding: 14,
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 8,
              }}
            >
              <h4 style={{ margin: "0 0 8px", color: "var(--danger)", fontSize: 14 }}>Cancel Order</h4>
              <input
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation"
                style={{ marginBottom: 8 }}
              />
              <button
                className="btn danger small"
                onClick={async () => {
                  try {
                    await api(`/orders/${id}/cancel`, { method: "POST", body: { reason: cancelReason } });
                    setMsg("Order cancelled successfully");
                    load();
                  } catch (err) {
                    setMsg(`Error: ${err.message}`);
                  }
                }}
              >
                Cancel Order
              </button>
            </div>
          )}

          <div
            style={{
              marginTop: 16,
              padding: 14,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 8,
            }}
          >
            <h4 style={{ margin: "0 0 8px", color: "var(--danger)", fontSize: 14 }}>Raise Dispute</h4>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{ marginBottom: 8 }}
            />
            <button
              className="btn danger small"
              onClick={async () => {
                try {
                  await api(`/orders/${id}/dispute`, { method: "POST", body: { reason } });
                  setMsg("Dispute opened — admin will review shortly.");
                  load();
                } catch (err) {
                  setMsg(`Error: ${err.message}`);
                }
              }}
            >
              Open Dispute
            </button>
          </div>

          {msg && (
            <div
              className={msg.startsWith("Error") ? "alert" : "ok"}
              style={{ marginTop: 12 }}
            >
              {msg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
