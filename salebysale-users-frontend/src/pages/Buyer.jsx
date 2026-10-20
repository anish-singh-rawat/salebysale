import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, inr } from "../api.js";
import { useCart } from "../CartContext.jsx";

const PAGE_SIZE = 20;

/* ─── Shared helpers ────────────────────────────────────── */

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

function LoadingScreen({ text = "Loading…" }) {
  return (
    <div style={{ padding: "60px 0", textAlign: "center" }}>
      <div className="spinner" style={{ margin: "0 auto 14px" }} />
      <p className="muted">{text}</p>
    </div>
  );
}

/* ─── ProductCard ───────────────────────────────────────── */
function ProductCard({ sku }) {
  const navigate = useNavigate();
  return (
    <div className="product-card" onClick={() => navigate(`/app/product/${sku._id}`)}>
      <div className="product-card-img">📱</div>
      <div className="product-card-body">
        <div className="product-card-brand">{sku.brand}</div>
        <div className="product-card-title">{sku.model}</div>
        <div className="product-card-sub">{[sku.variant, sku.color].filter(Boolean).join(" · ")}</div>
        {sku.warranty && (
          <span style={{
            display: "inline-block", fontSize: 11, padding: "2px 9px",
            borderRadius: 999, background: "var(--primary-light)", color: "var(--primary)",
            fontWeight: 600, alignSelf: "flex-start", marginTop: 4,
          }}>
            {sku.warranty}
          </span>
        )}
        <div className="product-card-footer">
          <span className="product-card-cta">View details →</span>
        </div>
      </div>
    </div>
  );
}

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
    <div className="fade-in">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h2>Browse Products</h2>
          <p className="muted">Verified listings · Supplier identity stays private</p>
        </div>
        {totalItems > 0 && (
          <button className="btn small" onClick={() => navigate("/app/cart")} style={{ position: "relative" }}>
            🛒 Cart
            <span style={{
              position: "absolute", top: -6, right: -6,
              background: "var(--danger)", color: "#fff",
              borderRadius: "50%", width: 18, height: 18,
              fontSize: 11, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {totalItems}
            </span>
          </button>
        )}
      </div>

      {error && <div className="inline-error" style={{ marginBottom: 14 }}>{error}</div>}

      {/* Search bar */}
      <form onSubmit={handleSearch} className="search-bar">
        <input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Search brand, model, color…"
        />
        <button className="btn" type="submit">Search</button>
        {q && (
          <button className="btn ghost" type="button" onClick={() => { setInputVal(""); setQ(""); setPage(1); }}>
            ✕ Clear
          </button>
        )}
      </form>

      {/* Results count */}
      {!loading && (
        <p className="muted" style={{ marginBottom: 16, fontSize: 14 }}>
          {total} product{total !== 1 ? "s" : ""}{q ? ` for "${q}"` : ""}
        </p>
      )}

      {/* Grid / empty / loading */}
      {loading ? (
        <LoadingScreen text="Loading products…" />
      ) : skus.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h4>No products found</h4>
          <p>{q ? `No results for "${q}"` : "Check back soon for new listings."}</p>
        </div>
      ) : (
        <div className="grid cols-3" style={{ gap: 16 }}>
          {skus.map((s) => <ProductCard key={s._id} sku={s} />)}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button key={p} className={`page-btn${p === page ? " active" : ""}`} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button className="page-btn" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}
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

  if (loading) return <LoadingScreen text="Loading orders…" />;
  if (error) return <div className="inline-error">{error}</div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2>My Orders</h2>
          <p className="muted">{orders.length} order{orders.length !== 1 ? "s" : ""} total</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ height: 40, minWidth: 160, fontSize: 14 }}
        >
          <option value="">All Status</option>
          {statuses.map((st) => (
            <option key={st} value={st}>{st.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      {/* Empty state — no orders at all */}
      {orders.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h4>No orders yet</h4>
          <p>Find something you like and place your first order.</p>
          <Link to="/app/search" className="btn">Browse Products</Link>
        </div>
      )}

      {/* Empty after filter */}
      {orders.length > 0 && filteredOrders.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h4>No orders match this filter</h4>
          <p>
            <button className="btn ghost small" onClick={() => setStatusFilter("")}>Clear filter</button>
          </p>
        </div>
      )}

      {/* Orders list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filteredOrders.map((o) => {
          const sku = o.items?.[0]?.skuId;
          return (
            <div key={o._id} className="order-row">
              <div className="order-row-icon">📱</div>
              <div className="order-row-info">
                <div className="order-row-title">{sku?.brand} {sku?.model} {sku?.color}</div>
                <div className="order-row-meta">Order #{o._id.slice(-8).toUpperCase()}</div>
              </div>
              <div className="order-row-right">
                <div className="order-row-price">{inr(o.totals?.landedPrice)}</div>
                <StatusBadge status={o.status} />
              </div>
              <Link
                to={`/app/orders/${o._id}`}
                className="btn ghost small"
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

  if (loading) return <LoadingScreen text="Loading order…" />;
  if (error) return <div className="inline-error">{error}</div>;
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
    <div className="fade-in">
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
        <Link to="/app/orders" className="btn ghost small">← Back to Orders</Link>
        <h2 style={{ margin: 0, fontSize: 18 }}>Order #{id.slice(-8).toUpperCase()}</h2>
      </div>

      {/* Progress stepper */}
      {!["cancelled", "disputed"].includes(order.status) && (
        <div className="section-card" style={{ marginBottom: 20 }}>
          <div className="section-card-header">
            <h3>📦 Order Progress</h3>
            <StatusBadge status={order.status} />
          </div>
          <div className="section-card-body">
            <div className="stepper">
              {statusSteps.map((step, i) => {
                const done = i <= currentStep;
                const active = i === currentStep;
                return (
                  <>
                    <div key={step.key} className="stepper-step">
                      <div className={`stepper-dot${done ? " done" : ""}${active ? " active" : ""}`}>
                        {done ? "✓" : i + 1}
                      </div>
                      <div className={`stepper-label${done ? " done" : ""}`}>{step.label}</div>
                    </div>
                    {i < statusSteps.length - 1 && (
                      <div className={`stepper-line${i < currentStep ? " done" : ""}`} />
                    )}
                  </>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Two-column detail grid */}
      <div className="grid cols-2" style={{ gap: 20 }}>
        {/* Left: Order summary */}
        <div className="section-card">
          <div className="section-card-header">
            <h3>📱 Product Summary</h3>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 999,
              background: "var(--primary-light)", color: "var(--primary)",
            }}>
              SBS Verified
            </span>
          </div>
          <div className="section-card-body">
            <h3 style={{ margin: "0 0 4px" }}>{sku?.brand} {sku?.model}</h3>
            <p className="muted" style={{ margin: "0 0 18px" }}>{[sku?.variant, sku?.color].filter(Boolean).join(" · ")}</p>
            <ul className="stat-list">
              <li>
                <span>Total Paid</span>
                <strong style={{ color: "var(--primary)", fontSize: 18 }}>{inr(order.totals?.landedPrice)}</strong>
              </li>
              <li>
                <span>ETA Band</span>
                <strong>{order.sla?.etaMin}–{order.sla?.etaMax} min</strong>
              </li>
              <li>
                <span>Status</span>
                <strong>
                  <span style={{
                    display: "inline-block", width: 8, height: 8, borderRadius: "50%",
                    background: order.status === "delivered" ? "var(--success)" : "var(--warning)",
                    marginRight: 6,
                  }} />
                  {order.status?.replace(/_/g, " ")}
                </strong>
              </li>
              {etaRemaining !== null && (
                <li><span>ETA Remaining</span><strong>{etaRemaining} min</strong></li>
              )}
            </ul>

            {order.tracking?.deliveryOtp && (
              <div className="otp-box">
                <div className="otp-hint">🔑 Delivery OTP — share only with rider at your door</div>
                <div className="otp">{order.tracking.deliveryOtp}</div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Timeline + actions */}
        <div className="section-card">
          <div className="section-card-header"><h3>🕐 Timeline</h3></div>
          <div className="section-card-body">
            <div className="timeline">
              {(order.events || []).map((e, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-name">{e.name.replace(/([a-z])([A-Z])/g, "$1 $2")}</div>
                  <div className="timeline-time">{new Date(e.at).toLocaleString()}</div>
                  {e.note && <div className="timeline-note">{e.note}</div>}
                </div>
              ))}
            </div>

            {canCancel && (
              <div className="action-box danger-box">
                <h4 style={{ color: "var(--danger)" }}>Cancel Order</h4>
                <input
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Reason for cancellation"
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

            <div className="action-box danger-box">
              <h4 style={{ color: "var(--danger)" }}>Raise Dispute</h4>
              <input value={reason} onChange={(e) => setReason(e.target.value)} />
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
              <div className={msg.startsWith("Error") ? "inline-error" : "inline-success"} style={{ marginTop: 12 }}>
                {msg}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
