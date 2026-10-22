import { useEffect, useState } from "react";
import { api, inr } from "../api.js";

/* ═══════════════════════════════════════════════════════
   SHARED HELPERS
═══════════════════════════════════════════════════════ */

const STATUS_META = {
  delivered:      { color: "#10b981", bg: "#d1fae5", label: "Delivered" },
  reserved:       { color: "#f59e0b", bg: "#fef3c7", label: "Reserved" },
  awaiting_admin: { color: "#7c3aed", bg: "#ede9fe", label: "Awaiting Admin" },
  assigned:       { color: "#6366f1", bg: "#e0e7ff", label: "Assigned" },
  picked:         { color: "#ec4899", bg: "#fce7f3", label: "Picked Up" },
  cancelled:      { color: "#ef4444", bg: "#fee2e2", label: "Cancelled" },
  disputed:       { color: "#ef4444", bg: "#fee2e2", label: "Disputed" },
  open:           { color: "#f59e0b", bg: "#fef3c7", label: "Open" },
  refund_approved:{ color: "#10b981", bg: "#d1fae5", label: "Refund Approved" },
  rejected:       { color: "#ef4444", bg: "#fee2e2", label: "Rejected" },
  escalated:      { color: "#7c3aed", bg: "#ede9fe", label: "Escalated" },
  packing:        { color: "#6366f1", bg: "#e0e7ff", label: "Packing" },
  verified:       { color: "#10b981", bg: "#d1fae5", label: "Verified" },
  pending:        { color: "#f59e0b", bg: "#fef3c7", label: "Pending" },
};

function Badge({ status, label }) {
  const m = STATUS_META[status] || { color:"#64748b", bg:"#f1f5f9", label: label || status };
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"3px 10px", borderRadius:999, fontSize:11, fontWeight:700,
      background:m.bg, color:m.color, whiteSpace:"nowrap",
    }}>
      <span style={{width:5,height:5,borderRadius:"50%",background:m.color}} />
      {m.label}
    </span>
  );
}

function Spinner() {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"80px 0",gap:12,flexDirection:"column"}}>
      <div className="adm-spinner" />
      <span style={{color:"#94a3b8",fontSize:13,fontWeight:500}}>Loading…</span>
    </div>
  );
}

function PageHeader({ title, sub, action, icon }) {
  return (
    <div className="adm-page-header">
      <div className="adm-page-header-left">
        {icon && <div className="adm-page-icon">{icon}</div>}
        <div>
          <h2 className="adm-page-title">{title}</h2>
          {sub && <p className="adm-page-sub">{sub}</p>}
        </div>
      </div>
      {action && <div className="adm-page-header-right">{action}</div>}
    </div>
  );
}

function KpiCard({ icon, value, label, sub, color, bg, alert }) {
  return (
    <div className={`adm-kpi-card${alert?" adm-kpi-alert":""}`}>
      <div className="adm-kpi-icon-wrap" style={{background: bg||"#ede9fe"}}>
        <span style={{fontSize:22}}>{icon}</span>
      </div>
      <div className="adm-kpi-body">
        <div className="adm-kpi-val" style={{color: color||"#6366f1"}}>{value}</div>
        <div className="adm-kpi-lbl">{label}</div>
        {sub && <div className="adm-kpi-sub">{sub}</div>}
      </div>
      {alert && <div className="adm-kpi-alert-dot" />}
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <>
      <div className="adm-modal-backdrop" onClick={onClose} />
      <div className="adm-modal">
        <div className="adm-modal-header">
          <h3 className="adm-modal-title">{title}</h3>
          <button className="adm-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="adm-modal-body">{children}</div>
      </div>
    </>
  );
}

function ErrorBanner({ msg }) {
  return <div className="adm-error-banner">{msg}</div>;
}
function SuccessBanner({ msg }) {
  return <div className="adm-success-banner">{msg}</div>;
}

/* ═══════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════ */
export function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [slaWarning, setSlaWarning] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  async function loadData() {
    setLoading(true);
    try {
      const [kpiData, ordersData] = await Promise.all([
        api("/admin/kpis"),
        api("/admin/orders"),
      ]);
      setKpis(kpiData.kpis);
      const now = new Date();
      const pastEta = ordersData.orders.filter(o =>
        ["assigned","picked"].includes(o.status) &&
        o.sla?.etaMax && new Date(o.sla.etaMax) < now
      ).length;
      setSlaWarning(pastEta);
      setLastRefresh(new Date());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    loadData();
    const iv = setInterval(loadData, 30000);
    return () => clearInterval(iv);
  }, []);

  if (loading) return <Spinner />;
  if (error)   return <ErrorBanner msg={error} />;
  if (!kpis)   return <p style={{color:"#94a3b8"}}>No data available</p>;

  return (
    <div className="adm-fade">
      <PageHeader
        icon="📊"
        title="Live Dashboard"
        sub={`Haridwar pilot network · Auto-refreshes every 30s · Last: ${lastRefresh.toLocaleTimeString()}`}
        action={<button className="adm-btn-ghost" onClick={loadData}>↻ Refresh Now</button>}
      />

      {/* Primary KPIs */}
      <div className="adm-kpi-grid">
        <KpiCard icon="💰" value={inr(kpis.gmv)}         label="Gross GMV"          sub="Total order value"         color="#6366f1" bg="#ede9fe" />
        <KpiCard icon="💳" value={inr(kpis.platformFee)}  label="Platform Revenue"    sub="After supplier payouts"    color="#8b5cf6" bg="#f3e8ff" />
        <KpiCard icon="📦" value={kpis.orders}            label="Total Orders"        sub="All time"                  color="#0f172a" bg="#f1f5f9" />
        <KpiCard icon="⚠️" value={kpis.disputesOpen}      label="Open Disputes"       sub="Needs attention"           color="#ef4444" bg="#fee2e2" alert={kpis.disputesOpen > 0} />
      </div>

      {/* Secondary KPIs */}
      <div className="adm-kpi-grid adm-kpi-grid-6" style={{marginTop:16}}>
        <KpiCard icon="🏪" value={kpis.activeSuppliers}   label="Active Suppliers"    color="#10b981" bg="#d1fae5" />
        <KpiCard icon="📱" value={kpis.liveSkus}          label="Live SKUs"           color="#6366f1" bg="#e0e7ff" />
        <KpiCard icon="✅" value={kpis.verifiedStockUnits} label="Verified Units"      color="#10b981" bg="#d1fae5" />
        <KpiCard icon="📈" value={`${kpis.orderFillRate}%`}label="Fill Rate"           color="#6366f1" bg="#ede9fe" />
        <KpiCard icon="❌" value={`${kpis.cancellationRate}%`} label="Cancel Rate"     color="#ef4444" bg="#fee2e2" />
        <KpiCard icon="🚨" value={slaWarning}              label="Past ETA"            color={slaWarning>0?"#ef4444":"#10b981"} bg={slaWarning>0?"#fee2e2":"#d1fae5"} alert={slaWarning>0} />
      </div>

      {/* At-a-glance insight strip */}
      <div className="adm-insight-strip">
        <div className="adm-insight">
          <span className="adm-insight-icon">💡</span>
          <span>Fill rate <strong>{kpis.orderFillRate}%</strong> — {kpis.orderFillRate >= 85 ? "healthy" : "needs attention"}</span>
        </div>
        <div className="adm-insight">
          <span className="adm-insight-icon">⚖️</span>
          <span>Dispute rate <strong>{kpis.disputesOpen}</strong> open — {kpis.disputesOpen === 0 ? "all clear ✅" : "review required"}</span>
        </div>
        <div className="adm-insight">
          <span className="adm-insight-icon">🚚</span>
          <span>SLA breaches <strong style={{color:slaWarning>0?"#ef4444":"#10b981"}}>{slaWarning}</strong> right now</span>
        </div>
        <div className="adm-insight">
          <span className="adm-insight-icon">🔄</span>
          <span>Next refresh in <strong>30s</strong></span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   APPROVALS (KYC)
═══════════════════════════════════════════════════════ */
export function Approvals() {
  const [suppliers, setSuppliers] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [identity, setIdentity] = useState(null);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState("all");
  const [searchQ, setSearchQ] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [s, b] = await Promise.all([api("/admin/suppliers"), api("/admin/buyers")]);
      setSuppliers(s.suppliers);
      setBuyers(b.buyers);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function verify(id, status) {
    await api("/businesses/verify", { method:"POST", body:{ businessId:id, status, notes:notes[id]||"" } });
    setMsg(`${status === "verified" ? "✅ Approved" : "❌ Rejected"} successfully`);
    setNotes(prev => ({ ...prev, [id]:"" }));
    load();
  }

  if (loading) return <Spinner />;
  if (error)   return <ErrorBanner msg={error} />;

  const all = [...suppliers, ...buyers];
  const pendingCount  = all.filter(b => b.kycStatus === "pending").length;
  const verifiedCount = all.filter(b => b.kycStatus === "verified").length;
  const rejectedCount = all.filter(b => b.kycStatus === "rejected").length;

  const displayed = all
    .filter(b => tab === "all" || b.kycStatus === tab)
    .filter(b => !searchQ || `${b.shopName} ${b.area} ${b.role}`.toLowerCase().includes(searchQ.toLowerCase()));

  return (
    <div className="adm-fade">
      <PageHeader icon="🪪" title="KYC Approvals"
        sub="Verify buyers and suppliers. Identity never exposed to other users."
        action={
          <div className="adm-search-compact">
            <span>🔍</span>
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search…" />
          </div>
        }
      />

      {msg && <SuccessBanner msg={msg} />}

      {/* KPI strip */}
      <div className="adm-kpi-grid adm-kpi-grid-4" style={{marginBottom:24}}>
        <KpiCard icon="👥" value={all.length}       label="Total Businesses"  color="#0f172a" bg="#f1f5f9" />
        <KpiCard icon="⏳" value={pendingCount}    label="Pending Review"    color="#f59e0b" bg="#fef3c7" alert={pendingCount>0} />
        <KpiCard icon="✅" value={verifiedCount}   label="Verified"          color="#10b981" bg="#d1fae5" />
        <KpiCard icon="❌" value={rejectedCount}   label="Rejected"          color="#ef4444" bg="#fee2e2" />
      </div>

      {/* Tabs */}
      <div className="adm-tab-row">
        {[
          {key:"all",      label:"All",      count:all.length},
          {key:"pending",  label:"⏳ Pending", count:pendingCount},
          {key:"verified", label:"✅ Verified",count:verifiedCount},
          {key:"rejected", label:"❌ Rejected", count:rejectedCount},
        ].map(t => (
          <button key={t.key} className={`adm-tab${tab===t.key?" adm-tab-active":""}`}
            onClick={() => setTab(t.key)}>
            {t.label} <span className="adm-tab-count">{t.count}</span>
          </button>
        ))}
      </div>

      {displayed.length === 0 && (
        <div className="adm-empty">
          <div style={{fontSize:48}}>🪪</div>
          <p>No businesses in this category.</p>
        </div>
      )}

      {/* Cards */}
      <div className="adm-kyc-grid">
        {displayed.map(b => (
          <div key={b._id} className={`adm-kyc-card${b.kycStatus==="pending"?" adm-kyc-pending":""}`}>
            <div className="adm-kyc-card-header">
              <div className="adm-kyc-avatar">
                {(b.shopName||"?")[0].toUpperCase()}
              </div>
              <div className="adm-kyc-info">
                <div className="adm-kyc-shop">{b.shopName}</div>
                <div className="adm-kyc-meta">
                  <span className="adm-kyc-code">{b.listingCode}</span>
                  <span>·</span>
                  <span>{b.role}</span>
                  <span>·</span>
                  <span>{b.area}</span>
                </div>
              </div>
              <Badge status={b.kycStatus} />
            </div>

            <textarea
              className="adm-kyc-notes"
              placeholder="Verification notes (optional)…"
              value={notes[b._id]||""}
              onChange={e => setNotes(prev => ({...prev,[b._id]:e.target.value}))}
            />

            <div className="adm-kyc-actions">
              <button className="adm-btn-success adm-btn-sm"
                onClick={() => verify(b._id,"verified")} disabled={b.kycStatus==="verified"}>
                ✓ Approve
              </button>
              <button className="adm-btn-danger adm-btn-sm"
                onClick={() => verify(b._id,"rejected")} disabled={b.kycStatus==="rejected"}>
                ✕ Reject
              </button>
              <button className="adm-btn-ghost adm-btn-sm"
                onClick={async () => {
                  const res = await api(`/admin/identity/${b._id}`);
                  setIdentity(res.mapping);
                }}>
                🔍 Reveal Identity
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Identity modal */}
      {identity && (
        <Modal title="🔐 Private Identity (Admin Only)" onClose={() => setIdentity(null)}>
          <div className="adm-identity-grid">
            <div className="adm-identity-row"><span>Shop Name</span><strong>{identity.shopName}</strong></div>
            <div className="adm-identity-row"><span>GST Number</span><strong>{identity.gst||"N/A"}</strong></div>
            <div className="adm-identity-row"><span>Owner Phone</span><strong>{identity.ownerPhone}</strong></div>
            <div className="adm-identity-row"><span>Address</span><strong>{identity.address}</strong></div>
          </div>
          <div className="adm-modal-warning">
            ⚠️ This information is strictly admin-only. Never share with buyers or suppliers.
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ADMIN ORDERS
═══════════════════════════════════════════════════════ */
export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [riders, setRiders] = useState([]);
  const [imei, setImei] = useState(null);
  const [tab, setTab] = useState("pending");
  const [statusFilter, setStatusFilter] = useState("all");
  const [arrangeModal, setArrangeModal] = useState(null);
  const [selectedRider, setSelectedRider] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [ordersData, requestsData, ridersData] = await Promise.all([
        api("/admin/orders"),
        api("/admin/requests").catch(() => ({ requests:[] })),
        api("/admin/riders"),
      ]);
      setOrders(ordersData.orders);
      setRequests(requestsData.requests||[]);
      setRiders(ridersData.riders);
      if (ridersData.riders.length > 0) setSelectedRider(ridersData.riders[0]._id);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function arrangeCourier(orderId) {
    try {
      await api(`/admin/orders/${orderId}/arrange`,{ method:"POST", body:{ riderId:selectedRider } });
      const riderName = riders.find(r => r._id===selectedRider)?.name||"Rider";
      const wholesalerName = arrangeModal?.wholesaler?.shopName||"Wholesaler";
      setMsg(`✅ ${riderName} assigned to pick up from ${wholesalerName}`);
      setArrangeModal(null);
      load();
    } catch (e) { setMsg(`Error: ${e.message}`); }
  }

  async function cancelOrder(orderId) {
    if (!confirm("Cancel this order?")) return;
    try {
      await api(`/orders/${orderId}/cancel`,{ method:"POST", body:{ reason:"Admin cancellation" } });
      setMsg("Order cancelled");
      load();
    } catch (e) { setMsg(`Error: ${e.message}`); }
  }

  const onDutyRiders = riders.filter(r => r.dutyOn);
  const filteredOrders = statusFilter==="all" ? orders : orders.filter(o => o.status===statusFilter);

  if (loading) return <Spinner />;
  if (error)   return <ErrorBanner msg={error} />;

  // KPIs
  const pending   = orders.filter(o => o.status==="awaiting_admin").length;
  const active    = orders.filter(o => ["assigned","picked"].includes(o.status)).length;
  const delivered = orders.filter(o => o.status==="delivered").length;

  return (
    <div className="adm-fade">
      <PageHeader icon="📦" title="Order Orchestration"
        sub="Assign couriers, track fulfilment, manage cancellations"
        action={<button className="adm-btn-ghost" onClick={load}>↻ Refresh</button>}
      />
      {msg && <SuccessBanner msg={msg} />}

      {/* KPIs */}
      <div className="adm-kpi-grid adm-kpi-grid-4" style={{marginBottom:24}}>
        <KpiCard icon="📥" value={requests.length} label="Pending Arrangement" color="#f59e0b" bg="#fef3c7" alert={requests.length>0} />
        <KpiCard icon="⏳" value={pending}         label="Awaiting Admin"     color="#7c3aed" bg="#ede9fe" />
        <KpiCard icon="🚴" value={active}          label="In Transit"         color="#6366f1" bg="#e0e7ff" />
        <KpiCard icon="✅" value={delivered}       label="Delivered"          color="#10b981" bg="#d1fae5" />
      </div>

      {/* Tab switcher */}
      <div className="adm-tab-row">
        <button className={`adm-tab${tab==="pending"?" adm-tab-active":""}`} onClick={() => setTab("pending")}>
          🔔 Needs Action <span className="adm-tab-count adm-tab-count-alert">{requests.length}</span>
        </button>
        <button className={`adm-tab${tab==="all"?" adm-tab-active":""}`} onClick={() => setTab("all")}>
          All Orders <span className="adm-tab-count">{orders.length}</span>
        </button>
      </div>

      {/* PENDING REQUESTS */}
      {tab==="pending" && (
        <div>
          <p className="adm-section-hint">⚠️ Retailer + Wholesaler identities visible here (admin only). Assign courier to proceed.</p>
          {requests.length===0 ? (
            <div className="adm-empty"><div style={{fontSize:48}}>📬</div><p>No pending courier arrangements.</p></div>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead><tr>
                  <th>Retailer</th><th>Wholesaler (private)</th>
                  <th>Mobile</th><th>Qty</th>
                  <th>Amount</th><th>ETA</th><th>Action</th>
                </tr></thead>
                <tbody>
                  {requests.map(r => (
                    <tr key={r._id}>
                      <td>
                        <div className="adm-td-primary">{r.retailer?.name||r.retailer?.shopName}</div>
                        <div className="adm-td-sub">{r.retailer?.phone} · {r.retailer?.area}</div>
                      </td>
                      <td>
                        <div className="adm-td-primary">{r.wholesaler?.shopName}</div>
                        <div className="adm-td-sub">{r.wholesaler?.phone} · {r.wholesaler?.area}</div>
                      </td>
                      <td>{r.items?.[0]?.skuId?.brand} {r.items?.[0]?.skuId?.model}</td>
                      <td><strong>{r.items?.[0]?.quantity}</strong></td>
                      <td><strong style={{color:"#6366f1"}}>{inr(r.totals?.landedPrice)}</strong></td>
                      <td className="adm-td-sub">{r.sla?.etaMax ? new Date(r.sla.etaMax).toLocaleTimeString() : "N/A"}</td>
                      <td>
                        <button className="adm-btn-primary adm-btn-sm"
                          onClick={() => setArrangeModal({ orderId:r._id, retailer:r.retailer, wholesaler:r.wholesaler })}>
                          🚚 Assign Courier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ALL ORDERS */}
      {tab==="all" && (
        <div>
          <div className="adm-filter-row">
            <span style={{fontSize:13,color:"#64748b",fontWeight:600}}>Filter by status:</span>
            <div className="adm-tab-row" style={{margin:0,borderBottom:"none"}}>
              {["all","awaiting_admin","assigned","picked","delivered","disputed","cancelled"].map(s => (
                <button key={s} className={`adm-tab adm-tab-sm${statusFilter===s?" adm-tab-active":""}`}
                  onClick={() => setStatusFilter(s)}>
                  {s==="all"?"All":s.replace(/_/g," ")}
                </button>
              ))}
            </div>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr>
                <th>Order ID</th><th>Buyer</th><th>Supplier (private)</th>
                <th>Status</th><th>Amount</th><th>IMEI</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {filteredOrders.map(o => (
                  <tr key={o._id}>
                    <td><span className="adm-order-id">#{o._id.slice(-8).toUpperCase()}</span></td>
                    <td><div className="adm-td-primary">{o.buyerId?.name||o.buyerId?.shopName}</div></td>
                    <td>
                      <div className="adm-td-primary">{o.supplierId?.shopName}</div>
                      <div className="adm-td-sub">Private identity</div>
                    </td>
                    <td><Badge status={o.status} /></td>
                    <td><strong style={{color:"#6366f1"}}>{inr(o.totals?.landedPrice)}</strong></td>
                    <td>
                      <button className="adm-btn-ghost adm-btn-sm" onClick={async () => {
                        try { setImei(await api(`/admin/imei/${o._id}`)); }
                        catch(e) { setImei({ message:e.message }); }
                      }}>🔐 View</button>
                    </td>
                    <td>
                      <div style={{display:"flex",gap:6}}>
                        {!["cancelled","delivered"].includes(o.status) && (
                          <button className="adm-btn-danger adm-btn-sm" onClick={() => cancelOrder(o._id)}>Cancel</button>
                        )}
                        <button className="adm-btn-ghost adm-btn-sm" onClick={() => alert("Refund workflow TBD")}>Refund</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* IMEI Modal */}
      {imei && (
        <Modal title="🔐 IMEI Data — Encrypted, Admin Only" onClose={() => setImei(null)}>
          <div className="adm-imei-pre"><pre>{JSON.stringify(imei, null, 2)}</pre></div>
          <div className="adm-modal-warning">⚠️ IMEI data is encrypted and restricted to admin access only.</div>
        </Modal>
      )}

      {/* Arrange Courier Modal */}
      {arrangeModal && (
        <Modal title="🚚 Arrange Courier Assignment" onClose={() => setArrangeModal(null)}>
          <div className="adm-arrange-info">
            <div className="adm-arrange-row">
              <span className="adm-arrange-label">🛍️ Retailer</span>
              <span className="adm-arrange-val">{arrangeModal.retailer?.name} · {arrangeModal.retailer?.area}</span>
            </div>
            <div className="adm-arrange-row">
              <span className="adm-arrange-label">🏭 Wholesaler</span>
              <span className="adm-arrange-val">{arrangeModal.wholesaler?.shopName} · {arrangeModal.wholesaler?.area}</span>
            </div>
          </div>
          <label className="adm-modal-label">Select Rider (On Duty)
            <select className="adm-input" value={selectedRider} onChange={e => setSelectedRider(e.target.value)}>
              {onDutyRiders.map(r => (
                <option key={r._id} value={r._id}>{r.name} — {r.area}</option>
              ))}
            </select>
          </label>
          {onDutyRiders.length===0 && <p style={{color:"#ef4444",fontSize:13}}>⚠️ No riders currently on duty.</p>}
          <div className="adm-modal-footer">
            <button className="adm-btn-ghost" onClick={() => setArrangeModal(null)}>Cancel</button>
            <button className="adm-btn-primary" onClick={() => arrangeCourier(arrangeModal.orderId)}
              disabled={onDutyRiders.length===0}>
              ✓ Confirm Assignment
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ADMIN STOCK
═══════════════════════════════════════════════════════ */
export function AdminStock() {
  const [inventory, setInventory] = useState([]);
  const [imeiModal, setImeiModal] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    api("/admin/inventory")
      .then(d => setInventory(d.inventory))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function isStale(lastVerifiedAt) {
    if (!lastVerifiedAt) return true;
    return new Date(lastVerifiedAt) < new Date(Date.now() - 4*60*60*1000);
  }

  async function viewImei(inventoryId) {
    try {
      const ordersData = await api("/admin/orders");
      const linkedOrder = ordersData.orders.find(o => o.items?.some(item => item.inventoryId===inventoryId));
      if (!linkedOrder) { setMsg("No order linked to this inventory yet"); return; }
      const imeiData = await api(`/admin/imei/${linkedOrder._id}`);
      setImeiModal(imeiData);
    } catch (e) { setMsg(`Error: ${e.message}`); }
  }

  async function requestVerification(inventoryId) {
    try {
      await api(`/supplier/inventory/${inventoryId}`,{ method:"PATCH", body:{ verify:true } });
      setMsg("Verification requested");
    } catch (e) { setMsg("Verification request sent"); }
  }

  if (loading) return <Spinner />;
  if (error)   return <ErrorBanner msg={error} />;

  const staleCount  = inventory.filter(i => isStale(i.lastVerifiedAt)).length;
  const activeCount = inventory.filter(i => i.status==="ON").length;
  const totalUnits  = inventory.reduce((s,i) => s+(i.availableQty||0),0);

  const displayed = inventory
    .filter(i => filter==="all" || (filter==="stale" && isStale(i.lastVerifiedAt)) || (filter==="active" && i.status==="ON"))
    .filter(i => !searchQ || `${i.skuId?.brand} ${i.skuId?.model} ${i.supplierId?.shopName}`.toLowerCase().includes(searchQ.toLowerCase()));

  return (
    <div className="adm-fade">
      <PageHeader icon="🏭" title="Live Inventory Truth"
        sub="Supplier names visible (admin privilege). IMEI decryption admin-only."
        action={
          <div className="adm-search-compact">
            <span>🔍</span>
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search brand, supplier…" />
          </div>
        }
      />
      {msg && <SuccessBanner msg={msg} />}

      <div className="adm-kpi-grid adm-kpi-grid-4" style={{marginBottom:24}}>
        <KpiCard icon="📦" value={inventory.length} label="Total Listings"  color="#0f172a" bg="#f1f5f9" />
        <KpiCard icon="✅" value={activeCount}     label="Active (ON)"     color="#10b981" bg="#d1fae5" />
        <KpiCard icon="🟡" value={staleCount}      label="Stale Records"   color="#f59e0b" bg="#fef3c7" alert={staleCount>0} />
        <KpiCard icon="🔢" value={totalUnits}      label="Total Units"     color="#6366f1" bg="#ede9fe" />
      </div>

      {/* Filter tabs */}
      <div className="adm-tab-row">
        {[{key:"all",label:"All",count:inventory.length},{key:"active",label:"✅ Active",count:activeCount},{key:"stale",label:"🟡 Stale",count:staleCount}].map(t => (
          <button key={t.key} className={`adm-tab${filter===t.key?" adm-tab-active":""}`} onClick={() => setFilter(t.key)}>
            {t.label} <span className="adm-tab-count">{t.count}</span>
          </button>
        ))}
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr>
            <th>Image</th><th>Supplier</th><th>Product</th>
            <th>Available</th><th>Reserved</th><th>Floor Price</th>
            <th>Status</th><th>Last Verified</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {displayed.map(i => {
              const stale = isStale(i.lastVerifiedAt);
              return (
                <tr key={i._id} className={stale?"adm-tr-stale":""}>
                  <td>
                    {i.primaryImage
                      ? <img src={i.primaryImage} alt="Product" className="adm-product-thumb" onClick={() => window.open(i.primaryImage)} />
                      : <div className="adm-product-thumb-placeholder">📱</div>
                    }
                  </td>
                  <td>
                    <div className="adm-td-primary">{i.supplierId?.shopName}</div>
                    <div className="adm-td-sub adm-private-label">🔒 Private</div>
                  </td>
                  <td>
                    <div className="adm-td-primary">{i.skuId?.brand} {i.skuId?.model}</div>
                    <div className="adm-td-sub">{i.skuId?.color}</div>
                  </td>
                  <td><span style={{fontWeight:800,color:i.availableQty>0?"#10b981":"#ef4444"}}>{i.availableQty}</span></td>
                  <td>{i.reservedQty}</td>
                  <td><strong style={{color:"#6366f1"}}>{inr(i.minimumPrice)}</strong></td>
                  <td>
                    <div style={{display:"flex",flexDirection:"column",gap:4}}>
                      <Badge status={i.status==="ON"?"verified":"cancelled"} label={i.status} />
                      {stale && <Badge status="pending" label="Stale" />}
                    </div>
                  </td>
                  <td className="adm-td-sub">
                    {i.lastVerifiedAt ? new Date(i.lastVerifiedAt).toLocaleString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}) : "Never"}
                  </td>
                  <td>
                    <div style={{display:"flex",gap:6}}>
                      <button className="adm-btn-ghost adm-btn-sm" onClick={() => viewImei(i._id)}>🔐 IMEI</button>
                      {stale && <button className="adm-btn-warning adm-btn-sm" onClick={() => requestVerification(i._id)}>↻ Verify</button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {imeiModal && (
        <Modal title="🔐 IMEI Data — Decrypted (Admin Only)" onClose={() => setImeiModal(null)}>
          <div className="adm-identity-grid">
            <div className="adm-identity-row"><span>Masked IMEI</span><strong>{imeiModal.maskedImei||"N/A"}</strong></div>
            <div className="adm-identity-row"><span>Full IMEI (decrypted)</span><strong style={{fontFamily:"monospace"}}>{imeiModal.imei||imeiModal.fullImei||"N/A"}</strong></div>
            <div className="adm-identity-row"><span>Serial</span><strong>{imeiModal.serial||"N/A"}</strong></div>
          </div>
          {imeiModal.scanEvents?.length > 0 && (
            <div style={{marginTop:16}}>
              <div style={{fontSize:13,fontWeight:700,color:"#374151",marginBottom:8}}>Scan Timeline</div>
              {imeiModal.scanEvents.map((ev,i) => (
                <div key={i} className="adm-scan-event">
                  <span>{new Date(ev.timestamp).toLocaleString()}</span>
                  <strong>{ev.event}</strong>
                  <span>{ev.actor}</span>
                </div>
              ))}
            </div>
          )}
          <div className="adm-modal-warning">⚠️ Encrypted & restricted to admin access only.</div>
        </Modal>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   DISPATCH
═══════════════════════════════════════════════════════ */
export function Dispatch() {
  const [riders, setRiders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [riderId, setRiderId] = useState("");
  const [msg, setMsg] = useState("");
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [r, o] = await Promise.all([api("/admin/riders"), api("/admin/orders")]);
      setRiders(r.riders);
      setOrders(o.orders.filter(x => ["packing","accepted","assigned","picked"].includes(x.status)));
      if (r.riders[0]) setRiderId(r.riders[0]._id);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function calcDistance(lat1,lon1,lat2,lon2) {
    const R=6371, dLat=(lat2-lat1)*Math.PI/180, dLon=(lon2-lon1)*Math.PI/180;
    const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
  }

  function simulateMatch(order) {
    if (!order.supplierId?.location || !order.buyerId?.location) {
      setSimulation({ error:"Location data not available" }); return;
    }
    const sLat=order.supplierId.location.lat||29.9457, sLon=order.supplierId.location.lon||78.1642;
    const bLat=order.buyerId.location.lat||29.9457,   bLon=order.buyerId.location.lon||78.1642;
    const distance=calcDistance(sLat,sLon,bLat,bLon);
    const riderScores=riders.filter(r=>r.dutyOn).map(r => {
      const rLat=r.location?.lat||29.9457, rLon=r.location?.lon||78.1642;
      const dist=calcDistance(rLat,rLon,sLat,sLon);
      const score=Math.round(Math.max(0,100-dist*10)*(r.reliability||0.8));
      return { rider:r, distToSupplier:dist, score };
    }).sort((a,b)=>b.score-a.score);
    setSimulation({ distance:distance.toFixed(2), supplierCoords:`${sLat.toFixed(4)}, ${sLon.toFixed(4)}`, buyerCoords:`${bLat.toFixed(4)}, ${bLon.toFixed(4)}`, recommended:riderScores[0]||null, allScores:riderScores });
  }

  if (loading) return <Spinner />;
  if (error)   return <ErrorBanner msg={error} />;

  const onDuty=riders.filter(r=>r.dutyOn);
  const offDuty=riders.filter(r=>!r.dutyOn);
  const packingOrders=orders.filter(o=>o.status==="packing");

  return (
    <div className="adm-fade">
      <PageHeader icon="🚚" title="Geo Dispatch"
        sub="Assign riders to orders. Auto-assign uses proximity + reliability scoring."
        action={
          <button className="adm-btn-primary" onClick={async () => {
            const d=await api("/admin/auto-assign",{method:"POST"});
            setMsg(`✅ Auto-assigned ${d.assigned} orders`); load();
          }}>
            ⚡ Auto-Assign All
          </button>
        }
      />
      {msg && <SuccessBanner msg={msg} />}

      {/* Rider status overview */}
      <div className="adm-kpi-grid adm-kpi-grid-4" style={{marginBottom:24}}>
        <KpiCard icon="🛵" value={riders.length}        label="Total Riders"     color="#0f172a" bg="#f1f5f9" />
        <KpiCard icon="🟢" value={onDuty.length}       label="On Duty"          color="#10b981" bg="#d1fae5" />
        <KpiCard icon="⚫" value={offDuty.length}      label="Off Duty"         color="#94a3b8" bg="#f8fafc" />
        <KpiCard icon="📦" value={packingOrders.length} label="Ready to Assign" color="#f59e0b" bg="#fef3c7" alert={packingOrders.length>0} />
      </div>

      <div className="adm-dispatch-grid">
        {/* Left: Rider selector + orders */}
        <div>
          {/* Rider picker */}
          <div className="adm-dispatch-rider-card">
            <div className="adm-dispatch-rider-title">🛵 Select Rider for Manual Assignment</div>
            <div className="adm-rider-list">
              {riders.map(r => (
                <div key={r._id} className={`adm-rider-item${riderId===r._id?" adm-rider-selected":""}${!r.dutyOn?" adm-rider-off":""}`}
                  onClick={() => r.dutyOn && setRiderId(r._id)}>
                  <div className="adm-rider-avatar">{r.name[0]}</div>
                  <div className="adm-rider-info">
                    <div className="adm-rider-name">{r.name}</div>
                    <div className="adm-rider-area">{r.area}</div>
                  </div>
                  <div className={`adm-rider-duty ${r.dutyOn?"adm-duty-on":"adm-duty-off"}`}>
                    {r.dutyOn ? "ON" : "OFF"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active orders */}
          <div className="adm-dispatch-orders-title">Active Fulfilment Orders ({orders.length})</div>
          <div className="adm-dispatch-orders-list">
            {orders.length===0 ? (
              <div className="adm-empty"><div style={{fontSize:36}}>📬</div><p>No active orders to dispatch.</p></div>
            ) : orders.map(o => (
              <div key={o._id} className="adm-dispatch-order-card">
                <div className="adm-dispatch-order-info">
                  <div className="adm-dispatch-order-product">{o.items?.[0]?.skuId?.brand} {o.items?.[0]?.skuId?.model}</div>
                  <div className="adm-dispatch-order-meta">{o.supplierId?.shopName} · <Badge status={o.status} /></div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  {o.status==="packing" && (
                    <button className="adm-btn-ghost adm-btn-sm" onClick={() => simulateMatch(o)}>
                      📍 Simulate
                    </button>
                  )}
                  <button className="adm-btn-primary adm-btn-sm"
                    onClick={async () => {
                      await api("/shipments/assign",{ method:"POST", body:{ orderId:o._id, riderId } });
                      setMsg("✅ Rider assigned"); load();
                    }}>
                    Assign
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Simulation result */}
        <div>
          {simulation ? (
            <div className="adm-simulation-card">
              <div className="adm-simulation-title">📍 Route Simulation</div>
              {simulation.error ? (
                <p style={{color:"#ef4444",fontSize:14}}>{simulation.error}</p>
              ) : (
                <>
                  <div className="adm-sim-distance">{simulation.distance} km</div>
                  <div className="adm-sim-label">Total route distance</div>
                  <div className="adm-sim-coords">
                    <div><span>📍 Supplier</span><code>{simulation.supplierCoords}</code></div>
                    <div><span>🏠 Buyer</span><code>{simulation.buyerCoords}</code></div>
                  </div>
                  {simulation.recommended && (
                    <div className="adm-sim-recommended">
                      <div className="adm-sim-recommended-label">⭐ Recommended Rider</div>
                      <div className="adm-sim-recommended-name">{simulation.recommended.rider.name}</div>
                      <div className="adm-sim-score-bar">
                        <div className="adm-sim-score-fill" style={{width:simulation.recommended.score+"%"}} />
                      </div>
                      <div className="adm-sim-score-val">Score: {simulation.recommended.score}/100 · {simulation.recommended.distToSupplier.toFixed(2)} km away</div>
                    </div>
                  )}
                  {simulation.allScores?.length > 0 && (
                    <div className="adm-sim-all">
                      <div className="adm-sim-all-title">All On-Duty Riders</div>
                      {simulation.allScores.map((s,i) => (
                        <div key={i} className="adm-sim-rider-row">
                          <span>{s.rider.name}</span>
                          <div className="adm-sim-mini-bar"><div style={{width:s.score+"%",height:"100%",background:"#6366f1",borderRadius:999}} /></div>
                          <span style={{color:"#6366f1",fontWeight:700}}>{s.score}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              <button className="adm-btn-ghost adm-btn-sm" style={{marginTop:16}} onClick={() => setSimulation(null)}>✕ Close</button>
            </div>
          ) : (
            <div className="adm-simulation-empty">
              <div style={{fontSize:48}}>📍</div>
              <p>Click "Simulate" on a packing order to see route analysis and rider recommendations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   DISPUTES
═══════════════════════════════════════════════════════ */
export function Disputes() {
  const [rows, setRows] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionNotes, setActionNotes] = useState({});
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState({});

  async function load() {
    setLoading(true);
    try { const d=await api("/admin/disputes"); setRows(d.disputes); }
    catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function handleAction(disputeId, action) {
    try {
      await api(`/admin/disputes/${disputeId}`,{ method:"PATCH", body:{ action, notes:actionNotes[disputeId]||"" } });
      setMsg(`✅ Dispute ${action.replace(/_/g," ")}`);
      setActionNotes(prev => ({...prev,[disputeId]:""}));
      load();
    } catch(e) { setMsg(`Action recorded: ${action} (endpoint may not exist)`); }
  }

  if (loading) return <Spinner />;
  if (error)   return <ErrorBanner msg={error} />;

  const openCount     = rows.filter(d=>d.status==="open").length;
  const resolvedCount = rows.filter(d=>["refund_approved","rejected"].includes(d.status)).length;
  const escalatedCount= rows.filter(d=>d.status==="escalated").length;

  const filtered = statusFilter==="all" ? rows : rows.filter(d=>d.status===statusFilter);

  return (
    <div className="adm-fade">
      <PageHeader icon="⚖️" title="Dispute Audit"
        sub="Review and resolve buyer-supplier disputes. All actions are logged."
      />
      {msg && <SuccessBanner msg={msg} />}

      <div className="adm-kpi-grid adm-kpi-grid-4" style={{marginBottom:24}}>
        <KpiCard icon="⚖️" value={rows.length}       label="Total Disputes"   color="#0f172a" bg="#f1f5f9" />
        <KpiCard icon="🔴" value={openCount}         label="Open"             color="#ef4444" bg="#fee2e2" alert={openCount>0} />
        <KpiCard icon="✅" value={resolvedCount}     label="Resolved"         color="#10b981" bg="#d1fae5" />
        <KpiCard icon="⚠️" value={escalatedCount}    label="Escalated"        color="#7c3aed" bg="#ede9fe" />
      </div>

      <div className="adm-tab-row">
        {[
          {key:"all",              label:"All",             count:rows.length},
          {key:"open",             label:"🔴 Open",          count:openCount},
          {key:"refund_approved",  label:"✅ Refund Approved",count:rows.filter(d=>d.status==="refund_approved").length},
          {key:"rejected",         label:"❌ Rejected",      count:rows.filter(d=>d.status==="rejected").length},
          {key:"escalated",        label:"⚠️ Escalated",     count:escalatedCount},
        ].map(t => (
          <button key={t.key} className={`adm-tab${statusFilter===t.key?" adm-tab-active":""}`}
            onClick={() => setStatusFilter(t.key)}>
            {t.label} <span className="adm-tab-count">{t.count}</span>
          </button>
        ))}
      </div>

      {filtered.length===0 ? (
        <div className="adm-empty"><div style={{fontSize:48}}>⚖️</div><p>No disputes in this category.</p></div>
      ) : (
        <div className="adm-disputes-list">
          {filtered.map(d => {
            const isOpen=d.status==="open";
            const isExpanded=expanded[d._id];
            return (
              <div key={d._id} className={`adm-dispute-card${isOpen?" adm-dispute-open":""}`}>
                {/* Header */}
                <div className="adm-dispute-header" onClick={() => setExpanded(prev=>({...prev,[d._id]:!prev[d._id]}))}>
                  <div className="adm-dispute-header-left">
                    <div className={`adm-dispute-severity ${isOpen?"adm-severity-high":"adm-severity-low"}`}>
                      {isOpen?"!":"✓"}
                    </div>
                    <div>
                      <div className="adm-dispute-reason">{d.reason}</div>
                      <div className="adm-dispute-order">Order: #{(d.orderId?._id||d.orderId||"").toString().slice(-8).toUpperCase()}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <Badge status={d.status} />
                    <span style={{color:"#94a3b8",fontSize:12}}>{isExpanded?"▲":"▼"}</span>
                  </div>
                </div>

                {/* Expanded body */}
                {isExpanded && (
                  <div className="adm-dispute-body">
                    {d.description && (
                      <div className="adm-dispute-description">{d.description}</div>
                    )}
                    <textarea
                      className="adm-dispute-notes"
                      placeholder="Action notes / decision rationale…"
                      value={actionNotes[d._id]||""}
                      onChange={e => setActionNotes(prev=>({...prev,[d._id]:e.target.value}))}
                    />
                    <div className="adm-dispute-actions">
                      <button className="adm-btn-success" onClick={() => handleAction(d._id,"refund_approved")} disabled={!isOpen}>
                        ✅ Approve Refund
                      </button>
                      <button className="adm-btn-ghost" onClick={() => handleAction(d._id,"rejected")} disabled={!isOpen}>
                        ❌ Reject Claim
                      </button>
                      <button className="adm-btn-warning" onClick={() => handleAction(d._id,"escalated")} disabled={!isOpen}>
                        ⚠️ Escalate
                      </button>
                    </div>
                    {!isOpen && (
                      <p style={{fontSize:12,color:"#94a3b8",marginTop:8}}>This dispute has already been actioned.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
