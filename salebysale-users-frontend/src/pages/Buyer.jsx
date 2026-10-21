import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, inr } from "../api.js";
import { useCart } from "../CartContext.jsx";

const PAGE_SIZE = 20;

/* ─── Status config ──────────────────────────────────────── */
const STATUS_META = {
  delivered:      { cls: "status-delivered",      label: "Delivered",        color: "#10b981", bg: "#d1fae5" },
  reserved:       { cls: "status-reserved",       label: "Order Placed",     color: "#f59e0b", bg: "#fef3c7" },
  awaiting_admin: { cls: "status-awaiting_admin", label: "Payment Review",   color: "#7c3aed", bg: "#ede9fe" },
  assigned:       { cls: "status-assigned",       label: "Rider Assigned",   color: "#6366f1", bg: "#e0e7ff" },
  picked:         { cls: "status-picked",         label: "Picked Up",        color: "#ec4899", bg: "#fce7f3" },
  cancelled:      { cls: "status-cancelled",      label: "Cancelled",        color: "#ef4444", bg: "#fee2e2" },
  disputed:       { cls: "status-disputed",       label: "Disputed",         color: "#ef4444", bg: "#fee2e2" },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] || { label: status?.replace(/_/g, " "), color: "#64748b", bg: "#f1f5f9" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700,
      background: m.bg, color: m.color, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.color, flexShrink: 0 }} />
      {m.label}
    </span>
  );
}

function LoadingScreen({ text = "Loading…" }) {
  return (
    <div className="db-loading">
      <div className="db-spinner" />
      <p className="db-loading-text">{text}</p>
    </div>
  );
}

function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="db-empty">
      <div className="db-empty-icon">{icon}</div>
      <h3 className="db-empty-title">{title}</h3>
      <p className="db-empty-desc">{desc}</p>
      {action}
    </div>
  );
}

/* ─── ProductCard ───────────────────────────────────────── */
const PHONE_IMAGES = [
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=80",
  "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=300&q=80",
  "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&q=80",
  "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=300&q=80",
];

function ProductCard({ sku, idx }) {
  const navigate = useNavigate();
  const img = PHONE_IMAGES[idx % PHONE_IMAGES.length];
  return (
    <div className="db-product-card" onClick={() => navigate(`/app/product/${sku._id}`)}>
      <div className="db-product-img-wrap">
        <img src={img} alt={sku.model} loading="lazy" className="db-product-img" />
        {sku.warranty && (
          <span className="db-product-warranty-badge">{sku.warranty}</span>
        )}
      </div>
      <div className="db-product-body">
        <div className="db-product-brand">{sku.brand}</div>
        <div className="db-product-title">{sku.model}</div>
        {(sku.variant || sku.color) && (
          <div className="db-product-sub">{[sku.variant, sku.color].filter(Boolean).join(" · ")}</div>
        )}
        <div className="db-product-footer">
          <span className="db-product-cta">View Details →</span>
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
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ page: pg, limit: PAGE_SIZE });
      if (search) params.set("q", search);
      const data = await api(`/catalog?${params}`);
      setSkus(data.skus); setTotal(data.total); setPages(data.pages);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  function handleSearch(e) { e.preventDefault(); setQ(inputVal); setPage(1); }
  useEffect(() => { loadCatalog(q, page); }, [q, page]);

  return (
    <div className="db-fade">
      {/* Page header */}
      <div className="db-page-header">
        <div>
          <h2 className="db-page-title">Browse Products</h2>
          <p className="db-page-sub">Verified listings · Supplier identity stays private</p>
        </div>
        {totalItems > 0 && (
          <button className="db-cart-btn" onClick={() => navigate("/app/cart")}>
            🛒 Cart
            <span className="db-cart-badge">{totalItems}</span>
          </button>
        )}
      </div>

      {/* Search bar */}
      <div className="db-search-wrap">
        <form onSubmit={handleSearch} className="db-search-form">
          <div className="db-search-icon">🔍</div>
          <input
            className="db-search-input"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Search by brand, model, color, variant…"
          />
          <button className="db-search-btn" type="submit">Search</button>
          {q && (
            <button className="db-search-clear" type="button"
              onClick={() => { setInputVal(""); setQ(""); setPage(1); }}>✕</button>
          )}
        </form>
        {!loading && (
          <div className="db-results-count">
            {total} product{total !== 1 ? "s" : ""}{q ? ` matching "${q}"` : " available"}
          </div>
        )}
      </div>

      {error && <div className="db-error-banner">{error}</div>}

      {/* Suggested brands quick-filter */}
      {!q && !loading && (
        <div className="db-brand-chips">
          {["Apple", "Samsung", "OnePlus", "Vivo", "Oppo", "Realme", "Xiaomi", "Nothing"].map(b => (
            <button key={b} className="db-brand-chip"
              onClick={() => { setInputVal(b); setQ(b); setPage(1); }}>
              {b}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <LoadingScreen text="Loading products…" />
      ) : skus.length === 0 ? (
        <EmptyState icon="📦" title="No products found"
          desc={q ? `No results for "${q}". Try a different search.` : "Check back soon for new listings."}
          action={q && <button className="db-btn-primary" onClick={() => { setInputVal(""); setQ(""); }}>Clear Search</button>}
        />
      ) : (
        <div className="db-products-grid">
          {skus.map((s, i) => <ProductCard key={s._id} sku={s} idx={i} />)}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="db-pagination">
          <button className="db-page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
            <button key={p} className={`db-page-btn${p === page ? " db-page-active" : ""}`}
              onClick={() => setPage(p)}>{p}</button>
          ))}
          <button className="db-page-btn" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next →</button>
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
      .then(d => { setOrders(d.orders); setFilteredOrders(d.orders); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setFilteredOrders(statusFilter ? orders.filter(o => o.status === statusFilter) : orders);
  }, [statusFilter, orders]);

  const statuses = ["reserved", "awaiting_admin", "assigned", "picked", "delivered", "disputed", "cancelled"];

  if (loading) return <LoadingScreen text="Loading your orders…" />;
  if (error) return <div className="db-error-banner">{error}</div>;

  const totalOrders = orders.length;
  const pendingCount = orders.filter(o => ["reserved", "awaiting_admin"].includes(o.status)).length;
  const inTransitCount = orders.filter(o => ["assigned", "picked"].includes(o.status)).length;
  const deliveredCount = orders.filter(o => o.status === "delivered").length;
  const totalSpend = orders.filter(o => o.status === "delivered")
    .reduce((s, o) => s + (o.totals?.landedPrice || 0), 0);

  return (
    <div className="db-fade">
      <div className="db-page-header">
        <div>
          <h2 className="db-page-title">My Orders</h2>
          <p className="db-page-sub">{orders.length} order{orders.length !== 1 ? "s" : ""} total</p>
        </div>
      </div>

      {/* KPI strip */}
      {orders.length > 0 && (
        <div className="db-kpi-strip">
          <div className="db-kpi-card">
            <div className="db-kpi-icon" style={{background:"#ede9fe"}}>📋</div>
            <div><div className="db-kpi-val">{totalOrders}</div><div className="db-kpi-lbl">Total Orders</div></div>
          </div>
          <div className="db-kpi-card">
            <div className="db-kpi-icon" style={{background:"#fef3c7"}}>⏳</div>
            <div><div className="db-kpi-val" style={{color:"#f59e0b"}}>{pendingCount}</div><div className="db-kpi-lbl">Pending</div></div>
          </div>
          <div className="db-kpi-card">
            <div className="db-kpi-icon" style={{background:"#e0e7ff"}}>🚴</div>
            <div><div className="db-kpi-val" style={{color:"#6366f1"}}>{inTransitCount}</div><div className="db-kpi-lbl">In Transit</div></div>
          </div>
          <div className="db-kpi-card">
            <div className="db-kpi-icon" style={{background:"#d1fae5"}}>✅</div>
            <div><div className="db-kpi-val" style={{color:"#10b981"}}>{deliveredCount}</div><div className="db-kpi-lbl">Delivered</div></div>
          </div>
          <div className="db-kpi-card">
            <div className="db-kpi-icon" style={{background:"#f3e8ff"}}>💰</div>
            <div><div className="db-kpi-val" style={{color:"#8b5cf6",fontSize:16}}>{inr(totalSpend)}</div><div className="db-kpi-lbl">Total Spent</div></div>
          </div>
        </div>
      )}

      {/* Status filter tabs */}
      <div className="db-tab-row">
        <button className={`db-tab${statusFilter===""?" db-tab-active":""}`} onClick={() => setStatusFilter("")}>
          All <span className="db-tab-count">{orders.length}</span>
        </button>
        {statuses.map(st => {
          const count = orders.filter(o => o.status === st).length;
          if (count === 0) return null;
          const m = STATUS_META[st];
          return (
            <button key={st} className={`db-tab${statusFilter===st?" db-tab-active":""}`}
              onClick={() => setStatusFilter(st)}
              style={statusFilter===st ? {background:m?.bg, color:m?.color, borderColor:m?.color+"40"} : {}}>
              {m?.label || st.replace(/_/g," ")} <span className="db-tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Empty states */}
      {orders.length === 0 && (
        <EmptyState icon="🛒" title="No orders yet"
          desc="Browse our catalog and place your first order."
          action={<Link to="/app/search" className="db-btn-primary">Browse Products →</Link>}
        />
      )}
      {orders.length > 0 && filteredOrders.length === 0 && (
        <EmptyState icon="🔍" title="No orders match this filter"
          desc="Try selecting a different status."
          action={<button className="db-btn-ghost" onClick={() => setStatusFilter("")}>Show All Orders</button>}
        />
      )}

      {/* Orders list */}
      <div className="db-orders-list">
        {filteredOrders.map(o => {
          const sku = o.items?.[0]?.skuId;
          const m = STATUS_META[o.status] || {};
          return (
            <div key={o._id} className="db-order-card">
              <div className="db-order-card-left">
                <div className="db-order-icon" style={{background: m.bg || "#f1f5f9"}}>📱</div>
                <div className="db-order-info">
                  <div className="db-order-title">
                    {sku?.brand} {sku?.model}
                    {sku?.color && <span className="db-order-color">· {sku.color}</span>}
                  </div>
                  <div className="db-order-id">Order #{o._id.slice(-8).toUpperCase()}</div>
                  <div className="db-order-date">
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : ""}
                  </div>
                </div>
              </div>
              <div className="db-order-card-right">
                <div className="db-order-amount">{inr(o.totals?.landedPrice)}</div>
                <StatusBadge status={o.status} />
                <Link to={`/app/orders/${o._id}`} className="db-order-track-btn">
                  Track Order →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── BuyerOrder — Order Tracking Detail ────────────────── */
export function BuyerOrder() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [reason, setReason] = useState("Wrong IMEI / DOA");
  const [cancelReason, setCancelReason] = useState("");
  const [msg, setMsg] = useState("");
  const [etaRemaining, setEtaRemaining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [otpCopied, setOtpCopied] = useState(false);

  async function load() {
    setLoading(true);
    try { const d = await api(`/orders/${id}`); setOrder(d.order); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    if (!order) return;
    if (["assigned","picked"].includes(order.status)) {
      const etaMax = order.sla?.etaMax;
      if (etaMax && order.events) {
        const ev = order.events.find(e => e.name === order.status);
        if (ev) {
          const elapsed = Math.floor((Date.now() - new Date(ev.at)) / 60000);
          setEtaRemaining(Math.max(0, etaMax - elapsed));
        }
      }
    }
  }, [order]);

  if (loading) return <LoadingScreen text="Loading order details…" />;
  if (error)   return <div className="db-error-banner">{error}</div>;
  if (!order)  return <div className="db-error-banner">Order not found</div>;

  const sku = order.items?.[0]?.skuId;
  const canCancel = ["reserved", "awaiting_admin"].includes(order.status);

  const statusSteps = [
    { key: "reserved",       label: "Order Placed",     icon: "📝" },
    { key: "awaiting_admin", label: "Payment Confirmed", icon: "💳" },
    { key: "assigned",       label: "Rider Assigned",   icon: "🏍️" },
    { key: "picked",         label: "Picked Up",        icon: "📦" },
    { key: "delivered",      label: "Delivered",        icon: "✅" },
  ];
  const currentStep = statusSteps.findIndex(s => s.key === order.status);

  return (
    <div className="db-fade">
      {/* Breadcrumb */}
      <div className="db-breadcrumb">
        <Link to="/app/orders" className="db-back-btn">← Back to Orders</Link>
        <span className="db-breadcrumb-sep">/</span>
        <span className="db-breadcrumb-current">Order #{id.slice(-8).toUpperCase()}</span>
      </div>

      {/* Order header */}
      <div className="db-order-detail-header">
        <div>
          <h2 className="db-page-title">Order #{id.slice(-8).toUpperCase()}</h2>
          <p className="db-page-sub">
            {sku?.brand} {sku?.model} {sku?.color ? `· ${sku.color}` : ""}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Progress stepper */}
      {!["cancelled","disputed"].includes(order.status) && (
        <div className="db-stepper-card">
          <div className="db-stepper-title">Order Progress</div>
          <div className="db-stepper">
            {statusSteps.map((step, i) => {
              const done = i <= currentStep;
              const active = i === currentStep;
              return (
                <React.Fragment key={step.key}>
                  <div className="db-step">
                    <div className={`db-step-dot${done?" db-step-done":""}${active?" db-step-active":""}`}>
                      {done ? "✓" : step.icon}
                    </div>
                    <div className={`db-step-label${done?" db-step-label-done":""}`}>{step.label}</div>
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div className={`db-step-line${i < currentStep?" db-step-line-done":""}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {etaRemaining !== null && (
            <div className="db-eta-banner">
              <span>🕐</span> Estimated arrival in <strong>{etaRemaining} minutes</strong>
            </div>
          )}
        </div>
      )}

      {/* Two-column layout */}
      <div className="db-detail-grid">
        {/* Left col */}
        <div className="db-detail-col">
          {/* Product summary */}
          <div className="db-detail-card">
            <div className="db-detail-card-header">
              <span className="db-detail-card-icon">📱</span>
              <h3 className="db-detail-card-title">Product Summary</h3>
              <span className="db-verified-chip">✓ SBS Verified</span>
            </div>
            <div className="db-detail-card-body">
              <div className="db-product-summary">
                <div className="db-product-summary-img">📱</div>
                <div>
                  <div className="db-product-summary-name">{sku?.brand} {sku?.model}</div>
                  <div className="db-product-summary-variant">{[sku?.variant, sku?.color].filter(Boolean).join(" · ")}</div>
                </div>
              </div>
              <div className="db-detail-rows">
                <div className="db-detail-row">
                  <span>Total Paid</span>
                  <strong style={{color:"#6366f1", fontSize:20}}>{inr(order.totals?.landedPrice)}</strong>
                </div>
                <div className="db-detail-row">
                  <span>ETA Window</span>
                  <strong>{order.sla?.etaMin}–{order.sla?.etaMax} min</strong>
                </div>
                <div className="db-detail-row">
                  <span>Status</span>
                  <StatusBadge status={order.status} />
                </div>
                {etaRemaining !== null && (
                  <div className="db-detail-row">
                    <span>ETA Remaining</span>
                    <strong style={{color:"#f59e0b"}}>{etaRemaining} min</strong>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* OTP box */}
          {order.tracking?.deliveryOtp && (
            <div className="db-otp-card">
              <div className="db-otp-header">
                <span>🔑</span>
                <div>
                  <div className="db-otp-title">Delivery OTP</div>
                  <div className="db-otp-hint">Share only with your rider at the door</div>
                </div>
              </div>
              <div className="db-otp-code">{order.tracking.deliveryOtp}</div>
              <button className={`db-otp-copy-btn${otpCopied?" db-otp-copied":""}`}
                onClick={() => {
                  navigator.clipboard.writeText(order.tracking.deliveryOtp);
                  setOtpCopied(true);
                  setTimeout(() => setOtpCopied(false), 2000);
                }}>
                {otpCopied ? "✓ Copied!" : "📋 Copy OTP"}
              </button>
            </div>
          )}
        </div>

        {/* Right col */}
        <div className="db-detail-col">
          {/* Timeline */}
          <div className="db-detail-card">
            <div className="db-detail-card-header">
              <span className="db-detail-card-icon">🕐</span>
              <h3 className="db-detail-card-title">Order Timeline</h3>
            </div>
            <div className="db-detail-card-body">
              {(order.events || []).length === 0 ? (
                <p style={{color:"#94a3b8", fontSize:14}}>No events recorded yet.</p>
              ) : (
                <div className="db-timeline">
                  {(order.events || []).map((e, i) => (
                    <div key={i} className="db-timeline-item">
                      <div className="db-timeline-dot" />
                      <div className="db-timeline-content">
                        <div className="db-timeline-name">{e.name.replace(/([a-z])([A-Z])/g,"$1 $2")}</div>
                        <div className="db-timeline-time">{new Date(e.at).toLocaleString("en-IN")}</div>
                        {e.note && <div className="db-timeline-note">{e.note}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cancel order */}
          {canCancel && (
            <div className="db-action-card db-action-danger">
              <div className="db-action-card-header">
                <span>❌</span>
                <div>
                  <div className="db-action-title">Cancel Order</div>
                  <div className="db-action-sub">Only available before admin processes your order</div>
                </div>
              </div>
              <input className="db-action-input" value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation (required)" />
              <button className="db-btn-danger" onClick={async () => {
                try {
                  await api(`/orders/${id}/cancel`, { method: "POST", body: { reason: cancelReason } });
                  setMsg("Order cancelled successfully.");
                  load();
                } catch (err) { setMsg(`Error: ${err.message}`); }
              }}>
                Cancel This Order
              </button>
            </div>
          )}

          {/* Dispute */}
          <div className="db-action-card db-action-warning">
            <div className="db-action-card-header">
              <span>⚖️</span>
              <div>
                <div className="db-action-title">Raise a Dispute</div>
                <div className="db-action-sub">Admin will review and respond within 24h</div>
              </div>
            </div>
            <input className="db-action-input" value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Describe the issue…" />
            <button className="db-btn-warning" onClick={async () => {
              try {
                await api(`/orders/${id}/dispute`, { method: "POST", body: { reason } });
                setMsg("Dispute opened — admin will review shortly.");
                load();
              } catch (err) { setMsg(`Error: ${err.message}`); }
            }}>
              Open Dispute
            </button>
          </div>

          {msg && (
            <div className={msg.startsWith("Error") ? "db-error-banner" : "db-success-banner"}>
              {msg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
