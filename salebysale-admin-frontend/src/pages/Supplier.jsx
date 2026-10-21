import { useEffect, useState } from "react";
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
  eligible: "status-reserved",
  paid: "status-delivered",
  pending: "status-assigned",
};

function StatusBadge({ status }) {
  return (
    <span className={`badge ${STATUS_CLASS[status] || ""}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}

/* ── SupplierStock ── */
export function SupplierStock() {
  // ── All JS logic unchanged ──
  const [inventory, setInventory] = useState([]);
  const [skus, setSkus] = useState([]);
  const [form, setForm] = useState({ skuId: "", availableQty: 2, minimumPrice: 10000, readyInMinutes: 5, status: "ON" });
  const [msg, setMsg] = useState("");

  async function load() {
    const [a, b] = await Promise.all([api("/supplier/inventory"), api("/catalog/search?q=")]);
    setInventory(a.inventory);
    setSkus(b.skus);
    if (b.skus[0]) setForm((f) => ({ ...f, skuId: f.skuId || b.skus[0]._id }));
  }
  useEffect(() => {
    load();
  }, []);

  async function save(e) {
    e.preventDefault();
    await api("/supplier/inventory", { method: "POST", body: form });
    setMsg("Stock saved & verified now");
    load();
  }

  // Client-side KPI stats
  const activeCount = inventory.filter((r) => r.status === "ON").length;
  const totalReserved = inventory.reduce((s, r) => s + (r.reservedQty || 0), 0);
  const totalAvailable = inventory.reduce((s, r) => s + (r.availableQty || 0), 0);

  // ── JSX redesigned ──
  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2>Live Inventory</h2>
          <p className="muted">Buyer ko sirf available qty, net price, ETA dikhega — aapka naam nahi.</p>
        </div>
      </div>

      {msg && <div className="inline-success" style={{ marginBottom: 14 }}>{msg}</div>}

      {/* Stat strip */}
      {inventory.length > 0 && (
        <div className="stat-strip">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-value">{inventory.length}</div>
            <div className="stat-label">Total Products</div>
          </div>
          <div className="stat-card success">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{activeCount}</div>
            <div className="stat-label">Active (ON)</div>
          </div>
          <div className="stat-card warning">
            <div className="stat-icon">🔒</div>
            <div className="stat-value">{totalReserved}</div>
            <div className="stat-label">Reserved</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🟢</div>
            <div className="stat-value">{totalAvailable}</div>
            <div className="stat-label">Available</div>
          </div>
        </div>
      )}

      {/* Add/Update form */}
      <div className="section-card" style={{ marginBottom: 20 }}>
        <div className="section-card-header">
          <h3>➕ Add / Update Stock</h3>
        </div>
        <div className="section-card-body">
          <form className="form" onSubmit={save}>
            <div className="grid cols-2">
              <label>
                SKU
                <select value={form.skuId} onChange={(e) => setForm({ ...form, skuId: e.target.value })}>
                  {skus.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.brand} {s.model} {s.variant} {s.color}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Floor price
                <input type="number" value={form.minimumPrice} onChange={(e) => setForm({ ...form, minimumPrice: Number(e.target.value) })} />
              </label>
              <label>
                Qty
                <input type="number" value={form.availableQty} onChange={(e) => setForm({ ...form, availableQty: Number(e.target.value) })} />
              </label>
              <label>
                Ready in minutes
                <input type="number" value={form.readyInMinutes} onChange={(e) => setForm({ ...form, readyInMinutes: Number(e.target.value) })} />
              </label>
            </div>
            <button className="btn" type="submit">Upsert stock</button>
          </form>
        </div>
      </div>

      {/* Inventory table */}
      <div className="section-card">
        <div className="section-card-header">
          <h3>📋 Inventory</h3>
        </div>
        <div className="inv-table-wrap">
          {inventory.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h4>No inventory yet</h4>
              <p>Add stock using the form above.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Avail / reserved</th>
                  <th>Floor</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {inventory.map((row) => (
                  <tr key={row._id}>
                    <td>
                      <strong>{row.skuId?.brand} {row.skuId?.model}</strong>
                      <div className="muted" style={{ fontSize: 12 }}>{row.skuId?.color}</div>
                    </td>
                    <td>
                      {row.availableQty} / {row.reservedQty}
                    </td>
                    <td><strong style={{ color: "var(--primary)" }}>{inr(row.minimumPrice)}</strong></td>
                    <td>
                      <span className={`badge ${row.status === "ON" ? "success" : "bad"}`}>{row.status}</span>
                    </td>
                    <td>
                      <button
                        className="btn ghost small"
                        onClick={async () => {
                          await api(`/supplier/inventory/${row._id}`, {
                            method: "PATCH",
                            body: { status: row.status === "ON" ? "OFF" : "ON", verify: true },
                          });
                          load();
                        }}
                      >
                        Toggle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── SupplierOrders ── */
export function SupplierOrders() {
  // ── All JS logic unchanged ──
  const [orders, setOrders] = useState([]);
  const [imei, setImei] = useState("356938035643809");
  async function load() {
    const d = await api("/supplier/orders");
    setOrders(d.orders);
  }
  useEffect(() => {
    load();
  }, []);

  // ── JSX redesigned ──
  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2>Incoming Orders</h2>
          <p className="muted">Accept deadline ~5 min. Packing requires IMEI (encrypted, restricted).</p>
        </div>
        <button className="btn ghost small" onClick={load}>↻ Refresh</button>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📬</div>
          <h4>No incoming orders</h4>
          <p>New orders from buyers will appear here.</p>
        </div>
      ) : (
        <div>
          {orders.map((o) => (
            <div className="supplier-order-card fade-in" key={o._id}>
              <div className="supplier-order-card-header">
                <div>
                  <div className="soc-product">
                    {o.items?.[0]?.skuId?.brand} {o.items?.[0]?.skuId?.model}
                  </div>
                  <div className="soc-payout">Payout {inr(o.totals?.supplierPayout)} · buyer identity not required for packing</div>
                </div>
                <StatusBadge status={o.status} />
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                {["reserved", "awaiting_accept"].includes(o.status) && (
                  <>
                    <button
                      className="btn success small"
                      onClick={async () => { await api(`/supplier/orders/${o._id}/accept`, { method: "POST" }); load(); }}
                    >
                      ✓ Accept
                    </button>
                    <button
                      className="btn ghost small"
                      onClick={async () => { await api(`/supplier/orders/${o._id}/reject`, { method: "POST", body: { reason: "Out of stock" } }); load(); }}
                    >
                      ✕ Reject
                    </button>
                  </>
                )}
                {["accepted", "paid"].includes(o.status) && (
                  <>
                    <input
                      value={imei}
                      onChange={(e) => setImei(e.target.value)}
                      style={{ flex: 1, minWidth: 200 }}
                    />
                    <button
                      className="btn small"
                      onClick={async () => { await api(`/supplier/orders/${o._id}/pack`, { method: "POST", body: { imei, serial: imei } }); load(); }}
                    >
                      Seal &amp; pack
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── SupplierPayouts ── */
export function SupplierPayouts() {
  // ── All JS logic unchanged ──
  const [rows, setRows] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  useEffect(() => {
    api("/supplier/settlements").then((d) => {
      setAllRows(d.settlements);
      setRows(d.settlements);
    });
  }, []);

  useEffect(() => {
    if (statusFilter === "all") {
      setRows(allRows);
    } else {
      setRows(allRows.filter((r) => r.status === statusFilter));
    }
  }, [statusFilter, allRows]);

  const totalEarned  = allRows.filter((r) => r.status === "paid").reduce((s, r) => s + (r.payout || 0), 0);
  const totalPending = allRows.filter((r) => r.status === "pending" || r.status === "eligible").reduce((s, r) => s + (r.payout || 0), 0);

  // ── JSX redesigned ──
  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2>Payout Ledger</h2>
          <p className="muted">Rule: T+1 after proof of delivery. Pilot uses delivery-triggered eligibility.</p>
        </div>
      </div>

      {/* Payout summary strip */}
      <div className="payout-summary">
        <div className="payout-summary-item">
          <div className="ps-label">Total Records</div>
          <div className="ps-value">{allRows.length}</div>
        </div>
        <div className="payout-summary-item earned">
          <div className="ps-label">Total Earned</div>
          <div className="ps-value">{inr(totalEarned)}</div>
        </div>
        <div className="payout-summary-item pending">
          <div className="ps-label">Pending</div>
          <div className="ps-value">{inr(totalPending)}</div>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="pill-tabs">
        {["all", "eligible", "paid", "pending"].map((st) => (
          <button
            key={st}
            className={`pill-tab${statusFilter === st ? " active" : ""}`}
            onClick={() => setStatusFilter(st)}
          >
            {st === "all" ? "All" : st.charAt(0).toUpperCase() + st.slice(1)}
          </button>
        ))}
      </div>

      {/* Settlements table */}
      <div className="section-card">
        <div className="section-card-header">
          <h3>💳 Settlements ({rows.length})</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          {rows.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💳</div>
              <h4>No settlements</h4>
              <p>Complete orders will appear here.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Payout</th>
                  <th>Fee</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id}>
                    <td style={{ fontFamily: "monospace", fontSize: 13 }}>...{String(r.orderId).slice(-8).toUpperCase()}</td>
                    <td><strong style={{ color: "var(--success)" }}>{inr(r.payout)}</strong></td>
                    <td className="muted">{inr(r.platformFee)}</td>
                    <td><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
