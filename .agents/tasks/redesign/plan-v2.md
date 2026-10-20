# Implementation Plan — Buyer & Supplier Dashboard Redesign (v2)

## Constraints (non-negotiable)
- React + Vite. **No new npm packages.** Icons = emoji or inline SVG only.
- Files to touch: `src/pages/Buyer.jsx`, `src/pages/Supplier.jsx`, `src/styles.css`.
- DO NOT modify: Layout.jsx, api.js, auth.jsx, CartContext.jsx, any other page, any backend file.
- Keep every existing API call and all data logic 100% intact.
- Pages render inside `<main className="main">` — no sidebar, no top nav added.
- Existing CSS variables stay unchanged; only additions are allowed in styles.css.

---

## Part 1 — CSS Additions in `src/styles.css`

Append the following new utility classes and micro-animation keyframes at the end of styles.css.
Do NOT modify any existing rule.

### 1a. New CSS variables (append inside `:root` block)
```
--success-light: #d1fae5;
--warning-light: #fef3c7;
--danger-light: #fee2e2;
--radius-lg: 12px;
--radius-xl: 16px;
--shadow-md: 0 4px 16px rgba(0,0,0,0.10);
--shadow-lg: 0 8px 32px rgba(37,99,235,0.13);
--transition: all 200ms ease-in-out;
```

### 1b. New utility classes to append to styles.css

```css
/* ── Dashboard page header ── */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
  gap: 16px;
  flex-wrap: wrap;
}
.page-header h2 { margin: 0 0 4px; font-size: 22px; }
.page-header p   { margin: 0; }

/* ── KPI stat strip ── */
.stat-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}
.stat-card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 16px 18px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.stat-card .stat-icon {
  font-size: 28px;
  line-height: 1;
  margin-bottom: 2px;
}
.stat-card .stat-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--primary);
  line-height: 1;
}
.stat-card .stat-label {
  font-size: 12px;
  color: var(--muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.stat-card.success .stat-value { color: var(--success); }
.stat-card.warning .stat-value { color: var(--warning); }
.stat-card.danger  .stat-value { color: var(--danger); }

/* ── Section card with header ── */
.section-card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
  margin-bottom: 20px;
}
.section-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--line);
  background: var(--bg2);
  gap: 12px;
  flex-wrap: wrap;
}
.section-card-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}
.section-card-body { padding: 20px; }

/* ── Empty state ── */
.empty-state {
  text-align: center;
  padding: 56px 20px;
}
.empty-state .empty-icon { font-size: 56px; margin-bottom: 14px; }
.empty-state h4 { margin: 0 0 6px; font-size: 16px; }
.empty-state p  { color: var(--muted); font-size: 14px; margin-bottom: 18px; }

/* ── Product card (BuyerSearch grid) ── */
.product-card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: var(--transition);
  box-shadow: var(--shadow);
}
.product-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-3px);
  border-color: var(--primary);
}
.product-card-img {
  width: 100%;
  height: 156px;
  background: linear-gradient(135deg, #eff6ff 0%, #f1f5f9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  flex-shrink: 0;
}
.product-card-body {
  padding: 14px 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.product-card-brand {
  font-size: 11px;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.product-card-title { font-weight: 700; font-size: 15px; line-height: 1.3; }
.product-card-sub   { font-size: 13px; color: var(--muted); }
.product-card-footer {
  margin-top: auto;
  padding-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.product-card-cta {
  font-size: 13px;
  font-weight: 700;
  color: var(--primary);
  display: flex;
  align-items: center;
  gap: 3px;
}

/* ── Search bar ── */
.search-bar {
  display: flex;
  gap: 8px;
  margin: 16px 0 20px;
}
.search-bar input { flex: 1; height: 46px; font-size: 15px; }
.search-bar .btn  { height: 46px; padding: 0 20px; }

/* ── Pagination ── */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 28px;
  flex-wrap: wrap;
}
.pagination .page-btn {
  min-width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: var(--card);
  color: var(--text);
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
  padding: 0 10px;
}
.pagination .page-btn:hover   { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }
.pagination .page-btn.active  { background: var(--primary); color: #fff; border-color: var(--primary); }
.pagination .page-btn:disabled { opacity: 0.4; cursor: default; }
.pagination .page-btn:disabled:hover { border-color: var(--line); color: var(--text); background: var(--card); }

/* ── Order row card (BuyerOrders list) ── */
.order-row {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 14px 18px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  transition: var(--transition);
}
.order-row:hover { box-shadow: var(--shadow-md); border-color: var(--primary); }
.order-row-icon {
  width: 48px; height: 48px;
  border-radius: 10px;
  background: var(--primary-light);
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; flex-shrink: 0;
}
.order-row-info   { flex: 1; min-width: 0; }
.order-row-title  { font-weight: 700; font-size: 14px; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.order-row-meta   { font-size: 12px; color: var(--muted); }
.order-row-right  { text-align: right; flex-shrink: 0; }
.order-row-price  { font-weight: 700; color: var(--primary); margin-bottom: 6px; font-size: 15px; }

/* ── Status badge variants ── */
.badge.status-delivered { background: var(--success-light); color: var(--success); }
.badge.status-reserved  { background: var(--warning-light); color: var(--warning); }
.badge.status-assigned,
.badge.status-awaiting_admin { background: #ede9fe; color: #7c3aed; }
.badge.status-picked          { background: #fce7f3; color: #db2777; }
.badge.status-cancelled,
.badge.status-disputed        { background: var(--danger-light); color: var(--danger); }

/* ── Order stepper ── */
.stepper {
  display: flex;
  align-items: center;
}
.stepper-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.stepper-dot {
  width: 30px; height: 30px;
  border-radius: 50%;
  background: var(--bg2);
  border: 2px solid var(--line);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; color: var(--muted);
  transition: var(--transition);
}
.stepper-dot.done   { background: var(--primary); border-color: var(--primary); color: #fff; }
.stepper-dot.active { box-shadow: 0 0 0 4px var(--primary-light); }
.stepper-label {
  font-size: 11px; text-align: center; white-space: nowrap;
  color: var(--muted); font-weight: 400;
}
.stepper-label.done { color: var(--primary); font-weight: 600; }
.stepper-line {
  flex: 1;
  height: 2px;
  background: var(--line);
  margin: 0 4px;
  margin-bottom: 20px;
  transition: var(--transition);
}
.stepper-line.done { background: var(--primary); }

/* ── OTP display ── */
.otp-box {
  margin-top: 18px;
  padding: 18px;
  background: var(--primary-light);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(37,99,235,0.2);
  text-align: center;
}
.otp-box .otp-hint { font-size: 12px; color: var(--primary); margin-bottom: 6px; font-weight: 600; }
.otp-box .otp      { font-size: 32px; letter-spacing: 0.35em; color: var(--primary); font-weight: 700; }

/* ── Timeline ── */
.timeline { border-left: 2px solid var(--primary-light); padding-left: 18px; margin-left: 10px; }
.timeline-item { position: relative; margin-bottom: 18px; }
.timeline-dot {
  position: absolute;
  left: -25px;
  top: 3px;
  width: 13px; height: 13px;
  border-radius: 50%;
  background: var(--primary);
  border: 2px solid var(--bg);
}
.timeline-name  { font-weight: 600; font-size: 14px; }
.timeline-time  { font-size: 12px; color: var(--muted); }
.timeline-note  { font-size: 12px; color: var(--text); margin-top: 2px; }

/* ── Action box (dispute / cancel) ── */
.action-box {
  padding: 16px;
  border-radius: var(--radius-lg);
  border: 1px solid;
  margin-top: 14px;
}
.action-box.danger-box {
  background: var(--danger-light);
  border-color: #fca5a5;
}
.action-box h4 { margin: 0 0 10px; font-size: 14px; }
.action-box input { margin-bottom: 10px; }

/* ── Supplier order card ── */
.supplier-order-card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 18px 20px;
  margin-bottom: 14px;
  box-shadow: var(--shadow);
  transition: var(--transition);
}
.supplier-order-card:hover { box-shadow: var(--shadow-md); }
.supplier-order-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  gap: 10px;
  flex-wrap: wrap;
}
.soc-product { font-weight: 700; font-size: 15px; }
.soc-payout  { font-size: 13px; color: var(--muted); margin-top: 2px; }
.soc-timer   { font-size: 13px; color: var(--danger); font-weight: 700; }

/* ── Checklist ── */
.checklist { display: grid; gap: 8px; margin: 12px 0; }
.checklist label {
  display: flex; align-items: center; gap: 10px;
  font-size: 14px; color: var(--text);
  cursor: pointer; padding: 8px 12px;
  background: var(--bg2); border-radius: 8px;
  border: 1px solid var(--line);
  transition: var(--transition);
}
.checklist label:has(input:checked) { background: var(--success-light); border-color: var(--success); color: var(--success); }
.checklist input[type="checkbox"] { width: 16px; height: 16px; accent-color: var(--success); cursor: pointer; flex-shrink: 0; }

/* ── IMEI row ── */
.imei-row { display: flex; gap: 10px; align-items: center; margin-top: 12px; }
.imei-row input { flex: 1; font-family: monospace; letter-spacing: 0.05em; }

/* ── Image upload zone ── */
.upload-zone {
  border: 2px dashed var(--primary);
  border-radius: var(--radius-lg);
  padding: 32px;
  text-align: center;
  background: rgba(219,234,254,0.12);
  cursor: pointer;
  transition: var(--transition);
}
.upload-zone:hover { background: rgba(219,234,254,0.3); }
.upload-zone .upload-icon { font-size: 44px; margin-bottom: 10px; }
.upload-zone p.upload-title { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
.upload-zone p.upload-hint  { font-size: 13px; color: var(--muted); }

/* ── Image thumbnail grid ── */
.img-thumb-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 14px; margin-top: 16px; }
.img-thumb {
  position: relative;
  border: 2px solid var(--line);
  border-radius: 10px;
  overflow: hidden;
  background: white;
  box-shadow: var(--shadow);
}
.img-thumb.primary-thumb { border-color: var(--primary); box-shadow: 0 4px 12px rgba(37,99,235,0.2); }
.img-thumb img { width: 100%; height: 130px; object-fit: cover; display: block; }
.img-thumb .thumb-badge {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: rgba(37,99,235,0.88); color: #fff;
  font-size: 10px; font-weight: 700; text-align: center; padding: 3px 0;
  letter-spacing: 0.06em;
}
.img-thumb .thumb-btn {
  position: absolute; top: 6px;
  border: none; border-radius: 6px; padding: 3px 7px;
  font-size: 16px; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.18);
  line-height: 1;
}
.img-thumb .thumb-star {
  left: 6px;
  background: white; color: var(--muted);
}
.img-thumb.primary-thumb .thumb-star { background: #fbbf24; color: white; }
.img-thumb .thumb-del { right: 6px; background: var(--danger); color: white; }

/* ── Add product form sections ── */
.form-section {
  background: white;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 20px;
  margin-bottom: 20px;
}
.form-section-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 16px;
  display: flex; align-items: center; gap: 8px;
}

/* ── Inventory table ── */
.inv-table-wrap { overflow-x: auto; }
.inv-table-wrap table { min-width: 600px; }

/* ── Payouts filter bar ── */
.filter-bar {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 18px; flex-wrap: wrap;
}
.filter-bar label { font-size: 13px; color: var(--muted); display: flex; align-items: center; gap: 6px; }
.filter-bar select { min-width: 140px; height: 38px; font-size: 14px; }

/* ── Payout summary strip ── */
.payout-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 22px;
}
.payout-summary-item {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 14px 18px;
  box-shadow: var(--shadow);
}
.payout-summary-item .ps-label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; }
.payout-summary-item .ps-value { font-size: 20px; font-weight: 700; color: var(--primary); }
.payout-summary-item.earned .ps-value  { color: var(--success); }
.payout-summary-item.pending .ps-value { color: var(--warning); }

/* ── Inline alert/ok variants ── */
.inline-success {
  background: var(--success-light);
  border: 1px solid var(--success);
  color: #065f46;
  border-radius: var(--radius);
  padding: 10px 14px;
  font-size: 14px;
}
.inline-error {
  background: var(--danger-light);
  border: 1px solid var(--danger);
  color: #dc2626;
  border-radius: var(--radius);
  padding: 10px 14px;
  font-size: 14px;
}

/* ── Loading skeleton pulse ── */
@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.45; } }
.skeleton {
  background: var(--bg2);
  border-radius: var(--radius);
  animation: pulse 1.5s ease-in-out infinite;
}

/* ── Fade-in ── */
@keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
.fade-in { animation: fadeIn 0.22s ease-out both; }

/* ── Responsive: collapse stat-strip to 2 cols on medium ── */
@media (max-width: 700px) {
  .stat-strip { grid-template-columns: repeat(2, 1fr); }
  .grid.cols-3 { grid-template-columns: repeat(2, 1fr); }
  .page-header { flex-direction: column; align-items: stretch; }
  .page-header .btn { width: 100%; text-align: center; }
}
@media (max-width: 480px) {
  .stat-strip { grid-template-columns: 1fr 1fr; }
  .grid.cols-3 { grid-template-columns: 1fr; }
}
```

---

## Part 2 — Shared Helper Components (defined at top of each file)

### 2a. `StatusBadge` — define once, use in both files

Place a small `StatusBadge` helper near the top of **Buyer.jsx** (before `BuyerSearch`).
Also copy (or define) the identical helper near the top of **Supplier.jsx**.

```jsx
// Maps order status strings to CSS modifier class names
const STATUS_CLASS = {
  delivered: "status-delivered",
  reserved: "status-reserved",
  awaiting_admin: "status-assigned",
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
```

### 2b. `LoadingScreen` helper (use in place of bare `<p>Loading…</p>`)

Define once in each file:
```jsx
function LoadingScreen({ text = "Loading…" }) {
  return (
    <div style={{ padding: "60px 0", textAlign: "center" }}>
      <div className="spinner" style={{ margin: "0 auto 14px" }} />
      <p className="muted">{text}</p>
    </div>
  );
}
```

---

## Part 3 — Component-by-component Redesign

### Item 1 — `styles.css`: Append all new CSS

**File:** `src/styles.css`

Append everything from Part 1 (new CSS variables addition inside `:root` + all new classes) to the end of the file. Do not change any existing rule.

**Verify:** `cd salebysale-users-frontend && npm run build` — zero errors.

---

### Item 2 — `Buyer.jsx` — `BuyerSearch` redesign

**What to do:**

Keep identical state, `loadCatalog`, `handleSearch`, `useEffect` hooks — only change JSX.

**New structure:**

```
<div className="fade-in">
  {/* Page header row */}
  <div className="page-header">
    <div>
      <h2>Browse Products</h2>
      <p className="muted">Verified listings · Supplier identity stays private</p>
    </div>
    {totalItems > 0 &&
      <button className="btn small" onClick={() => navigate("/app/cart")} style={{ position:"relative" }}>
        🛒 Cart
        <span style={{ position:"absolute", top:-6, right:-6, background:"var(--danger)", color:"#fff",
          borderRadius:"50%", width:18, height:18, fontSize:11, fontWeight:700,
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          {totalItems}
        </span>
      </button>
    }
  </div>

  {/* Error */}
  {error && <div className="inline-error" style={{ marginBottom:14 }}>{error}</div>}

  {/* Search bar */}
  <div className="search-bar">
    <input value={inputVal} onChange={e => setInputVal(e.target.value)}
      placeholder="Search brand, model, color…" onKeyDown={e => e.key==="Enter" && handleSearch(e)} />
    <button className="btn" onClick={handleSearch}>Search</button>
    {q && <button className="btn ghost" onClick={() => { setInputVal(""); setQ(""); setPage(1); }}>✕ Clear</button>}
  </div>

  {/* Results count */}
  {!loading && <p className="muted" style={{ marginBottom:16, fontSize:14 }}>
    {total} product{total!==1?"s":""}{q ? ` for "${q}"` : ""}
  </p>}

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
    <div className="grid cols-3" style={{ gap:16 }}>
      {skus.map(s => <ProductCard key={s._id} sku={s} />)}
    </div>
  )}

  {/* Pagination */}
  {pages > 1 && (
    <div className="pagination">
      <button className="page-btn" disabled={page<=1} onClick={() => setPage(p=>p-1)}>← Prev</button>
      {Array.from({length:pages},(_,i)=>i+1).map(p => (
        <button key={p} className={`page-btn${p===page?" active":""}`} onClick={() => setPage(p)}>{p}</button>
      ))}
      <button className="page-btn" disabled={page>=pages} onClick={() => setPage(p=>p+1)}>Next →</button>
    </div>
  )}
</div>
```

**`ProductCard` redesign** (still local to Buyer.jsx, still takes `sku` prop, still navigates to `/app/product/${sku._id}`):

```jsx
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
          <span style={{ display:"inline-block", fontSize:11, padding:"2px 9px",
            borderRadius:999, background:"var(--primary-light)", color:"var(--primary)",
            fontWeight:600, alignSelf:"flex-start", marginTop:4 }}>
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
```

**File:** `src/pages/Buyer.jsx`
**Verify:** `npm run build` — no errors; visually card grid is clean with hover lift.

---

### Item 3 — `Buyer.jsx` — `BuyerOrders` redesign

Keep all state, useEffect, filter logic. Replace only the JSX.

**New structure:**

```
<div className="fade-in">
  <div className="page-header">
    <div>
      <h2>My Orders</h2>
      <p className="muted">{orders.length} order{orders.length!==1?"s":""} total</p>
    </div>
    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
      style={{ height:40, minWidth:160, fontSize:14 }}>
      <option value="">All Status</option>
      {statuses.map(st => <option key={st} value={st}>{st.replace(/_/g," ")}</option>)}
    </select>
  </div>

  {error && <div className="inline-error">{error}</div>}

  {/* Empty state (no orders at all) */}
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
      <p><button className="btn ghost small" onClick={() => setStatusFilter("")}>Clear filter</button></p>
    </div>
  )}

  {/* Orders list */}
  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
    {filteredOrders.map(o => {
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
          <Link to={`/app/orders/${o._id}`} className="btn ghost small"
            onClick={e => e.stopPropagation()}>
            Track →
          </Link>
        </div>
      );
    })}
  </div>
</div>
```

**File:** `src/pages/Buyer.jsx`
**Verify:** `npm run build` — no errors.

---

### Item 4 — `Buyer.jsx` — `BuyerOrder` (tracking detail) redesign

Keep ALL state, useEffect hooks, `load()`, `canCancel`, `statusSteps`, `currentStep` logic.
Replace only the render JSX.

**New structure:**

```
<div className="fade-in">
  {/* Breadcrumb row */}
  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:22 }}>
    <Link to="/app/orders" className="btn ghost small">← Back to Orders</Link>
    <h2 style={{ margin:0, fontSize:18 }}>Order #{id.slice(-8).toUpperCase()}</h2>
  </div>

  {/* Progress stepper */}
  {!["cancelled","disputed"].includes(order.status) && (
    <div className="section-card" style={{ marginBottom:20 }}>
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
              <React.Fragment key={step.key}>
                <div className="stepper-step">
                  <div className={`stepper-dot${done?" done":""}${active?" active":""}`}>
                    {done ? "✓" : i+1}
                  </div>
                  <div className={`stepper-label${done?" done":""}`}>{step.label}</div>
                </div>
                {i < statusSteps.length-1 && (
                  <div className={`stepper-line${i < currentStep?" done":""}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  )}

  {/* Two-column detail grid */}
  <div className="grid cols-2" style={{ gap:20 }}>

    {/* Left: Order summary card */}
    <div className="section-card">
      <div className="section-card-header">
        <h3>📱 Product Summary</h3>
        <span style={{ fontSize:11, fontWeight:700, padding:"2px 10px", borderRadius:999,
          background:"var(--primary-light)", color:"var(--primary)" }}>
          SBS Verified
        </span>
      </div>
      <div className="section-card-body">
        <h3 style={{ margin:"0 0 4px" }}>{sku?.brand} {sku?.model}</h3>
        <p className="muted" style={{ margin:"0 0 18px" }}>{[sku?.variant, sku?.color].filter(Boolean).join(" · ")}</p>
        <ul className="stat-list">
          <li><span>Total Paid</span><strong style={{ color:"var(--primary)", fontSize:18 }}>{inr(order.totals?.landedPrice)}</strong></li>
          <li><span>ETA Band</span><strong>{order.sla?.etaMin}–{order.sla?.etaMax} min</strong></li>
          <li><span>Status</span>
            <strong>
              <span style={{ display:"inline-block", width:8, height:8, borderRadius:"50%",
                background: order.status==="delivered" ? "var(--success)" : "var(--warning)",
                marginRight:6 }} />
              {order.status?.replace(/_/g," ")}
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
          {(order.events||[]).map((e, i) => (
            <div key={i} className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-name">{e.name.replace(/([a-z])([A-Z])/g,"$1 $2")}</div>
              <div className="timeline-time">{new Date(e.at).toLocaleString()}</div>
              {e.note && <div className="timeline-note">{e.note}</div>}
            </div>
          ))}
        </div>

        {canCancel && (
          <div className="action-box danger-box">
            <h4 style={{ color:"var(--danger)" }}>Cancel Order</h4>
            <input value={cancelReason} onChange={e => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation" />
            <button className="btn danger small" onClick={async () => {
              try {
                await api(`/orders/${id}/cancel`, { method:"POST", body:{ reason:cancelReason } });
                setMsg("Order cancelled successfully"); load();
              } catch(err) { setMsg(`Error: ${err.message}`); }
            }}>Cancel Order</button>
          </div>
        )}

        <div className="action-box danger-box">
          <h4 style={{ color:"var(--danger)" }}>Raise Dispute</h4>
          <input value={reason} onChange={e => setReason(e.target.value)} />
          <button className="btn danger small" onClick={async () => {
            try {
              await api(`/orders/${id}/dispute`, { method:"POST", body:{ reason } });
              setMsg("Dispute opened — admin will review shortly."); load();
            } catch(err) { setMsg(`Error: ${err.message}`); }
          }}>Open Dispute</button>
        </div>

        {msg && (
          <div className={msg.startsWith("Error") ? "inline-error" : "inline-success"} style={{ marginTop:12 }}>
            {msg}
          </div>
        )}
      </div>
    </div>
  </div>
</div>
```

Note: add `import React from "react"` at the top of Buyer.jsx if not already present, because `React.Fragment` is used explicitly in the stepper. Alternatively replace `React.Fragment` with `<>…</>` fragment syntax (no import needed with React 17+). Prefer the fragment shorthand `<>…</>` to avoid the import.

**File:** `src/pages/Buyer.jsx`
**Verify:** `npm run build` — no errors.

---

### Item 5 — `Supplier.jsx` — `SupplierStock` redesign

All state, API calls, `saveProduct`, `handleImageUpload`, `removeImage`, `load` are **unchanged**.
Only the return JSX changes.

**Loading state:** replace `<div style={{...}}><p>Loading your inventory...</p></div>` with `<LoadingScreen text="Loading your inventory…" />`.

**Main return JSX structure:**

```
<div className="fade-in">
  {/* Page header */}
  <div className="page-header">
    <div>
      <h2>My Inventory</h2>
      <p className="muted">Add mobile phones. Buyers see products — your identity stays private.</p>
    </div>
    <button className="btn" onClick={() => { setShowAddForm(!showAddForm); setError(""); setMsg(""); }}>
      {showAddForm ? "✕ Cancel" : "+ Add Product"}
    </button>
  </div>

  {/* Inline feedback */}
  {msg   && <div className="inline-success" style={{ marginBottom:14 }}>{msg}</div>}
  {error && <div className="inline-error"   style={{ marginBottom:14 }}>{error}</div>}

  {/* Add product form (collapsible) */}
  {showAddForm && (
    <div className="section-card" style={{ marginBottom:24, borderColor:"var(--primary)", borderWidth:2 }}>
      <div className="section-card-header" style={{ background:"var(--primary-light)" }}>
        <h3 style={{ color:"var(--primary)" }}>➕ Add New Mobile Phone</h3>
      </div>
      <div className="section-card-body">
        <form onSubmit={saveProduct}>

          {/* Section 1: Phone details */}
          <div className="form-section">
            <div className="form-section-title"><span>📱</span> Mobile Phone Details</div>
            <div className="grid cols-2" style={{ gap:14 }}>
              <label>Brand <span style={{color:"var(--danger)"}}>*</span>
                <input type="text" value={newProduct.brand}
                  onChange={e => setNewProduct({...newProduct, brand:e.target.value})}
                  placeholder="e.g. Apple, Samsung, OnePlus" required />
              </label>
              <label>Model <span style={{color:"var(--danger)"}}>*</span>
                <input type="text" value={newProduct.model}
                  onChange={e => setNewProduct({...newProduct, model:e.target.value})}
                  placeholder="e.g. iPhone 15 Pro, Galaxy S24" required />
              </label>
              <label>RAM
                <input type="text" value={newProduct.ram}
                  onChange={e => setNewProduct({...newProduct, ram:e.target.value})}
                  placeholder="e.g. 8GB, 12GB" />
              </label>
              <label>Storage
                <input type="text" value={newProduct.storage}
                  onChange={e => setNewProduct({...newProduct, storage:e.target.value})}
                  placeholder="e.g. 128GB, 256GB" />
              </label>
              <label>Color <span style={{color:"var(--danger)"}}>*</span>
                <input type="text" value={newProduct.color}
                  onChange={e => setNewProduct({...newProduct, color:e.target.value})}
                  placeholder="e.g. Midnight Black, Gold" required />
              </label>
              <label>Warranty
                <select value={newProduct.warranty}
                  onChange={e => setNewProduct({...newProduct, warranty:e.target.value})}>
                  <option value="Brand 1 Year">Brand 1 Year</option>
                  <option value="Brand 2 Years">Brand 2 Years</option>
                  <option value="Extended Warranty">Extended Warranty</option>
                  <option value="No Warranty">No Warranty</option>
                </select>
              </label>
            </div>
            <label style={{ marginTop:10 }}>Variant / Configuration (optional)
              <input type="text" value={newProduct.variant}
                onChange={e => setNewProduct({...newProduct, variant:e.target.value})}
                placeholder="e.g. 8GB/128GB — leave blank to auto-generate" />
            </label>
          </div>

          {/* Section 2: Pricing & stock */}
          <div className="form-section">
            <div className="form-section-title"><span>💰</span> Pricing & Stock</div>
            <div className="grid cols-2" style={{ gap:14 }}>
              <label>Available Quantity <span style={{color:"var(--danger)"}}>*</span>
                <input type="number" value={newProduct.availableQty} min="1" required
                  onChange={e => setNewProduct({...newProduct, availableQty:Number(e.target.value)})} />
              </label>
              <label>Your Price (₹) <span style={{color:"var(--danger)"}}>*</span>
                <input type="number" value={newProduct.minimumPrice} min="1000" required
                  onChange={e => setNewProduct({...newProduct, minimumPrice:Number(e.target.value)})} />
              </label>
              <label>Ready in (minutes)
                <input type="number" value={newProduct.readyInMinutes} min="5"
                  onChange={e => setNewProduct({...newProduct, readyInMinutes:Number(e.target.value)})} />
              </label>
              <label>Status
                <select value={newProduct.status}
                  onChange={e => setNewProduct({...newProduct, status:e.target.value})}>
                  <option value="ON">ON — Available</option>
                  <option value="OFF">OFF — Not available</option>
                </select>
              </label>
            </div>
          </div>

          {/* Section 3: Images */}
          <div className="form-section">
            <div className="form-section-title"><span>📸</span> Product Images (recommended)</div>
            <p style={{ fontSize:13, color:"var(--muted)", marginBottom:14 }}>
              Up to 5 images · max 2 MB each · JPG/PNG/WEBP
            </p>
            <div className="upload-zone" onClick={() => document.getElementById("imageUpload").click()}>
              <div className="upload-icon">📸</div>
              <p className="upload-title">Click to upload</p>
              <p className="upload-hint">Or drag & drop — JPG, PNG, WEBP</p>
              <input id="imageUpload" type="file" accept="image/jpeg,image/png,image/webp"
                multiple onChange={handleImageUpload} style={{ display:"none" }} />
            </div>
            {images.length > 0 && (
              <>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:16, marginBottom:4 }}>
                  <span style={{ fontSize:13, fontWeight:600 }}>Uploaded ({images.length}/5)</span>
                  <span className="tiny">Tap ⭐ to set primary</span>
                </div>
                <div className="img-thumb-grid">
                  {images.map((img, idx) => (
                    <div key={idx} className={`img-thumb${primaryImageIndex===idx?" primary-thumb":""}`}>
                      <img src={img} alt={`Product ${idx+1}`} />
                      <button type="button" className="thumb-btn thumb-star"
                        onClick={e => { e.stopPropagation(); setPrimaryImageIndex(idx); }}
                        title={primaryImageIndex===idx ? "Primary image" : "Set as primary"}>
                        {primaryImageIndex===idx ? "⭐" : "☆"}
                      </button>
                      <button type="button" className="thumb-btn thumb-del"
                        onClick={e => { e.stopPropagation(); removeImage(idx); }}
                        title="Remove image">✕</button>
                      {primaryImageIndex===idx && <div className="thumb-badge">PRIMARY</div>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Submit row */}
          <div style={{ display:"flex", gap:12, justifyContent:"flex-end" }}>
            <button type="button" className="btn ghost"
              onClick={() => { setShowAddForm(false); setImages([]); setPrimaryImageIndex(0); setError(""); setMsg(""); }}
              disabled={uploading}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={uploading}
              style={{ minWidth:200, opacity:uploading?0.6:1 }}>
              {uploading ? "Adding…" : "✓ Add to Inventory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )}

  {/* Inventory table */}
  <div className="section-card">
    <div className="section-card-header">
      <h3>📋 Inventory ({inventory.length} {inventory.length===1?"product":"products"})</h3>
    </div>
    <div className="section-card-body" style={{ padding: inventory.length===0 ? 0 : "0" }}>
      {inventory.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h4>No products yet</h4>
          <p>Add your first mobile phone to start selling.</p>
          <button className="btn" onClick={() => setShowAddForm(true)}>+ Add First Product</button>
        </div>
      ) : (
        <div className="inv-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Image</th><th>Product</th><th>Available</th>
                <th>Reserved</th><th>Your Price</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((row, index) => (
                <tr key={row._id} style={{ backgroundColor: index%2===0 ? "white" : "var(--bg2)" }}>
                  <td style={{ width:110, minWidth:110 }}>
                    <ImageGallery images={row.images||[]} primaryImage={row.primaryImage}
                      height={85} showThumbs={false} />
                    {(row.images?.length > 1) && (
                      <div className="tiny" style={{ textAlign:"center", marginTop:2 }}>{row.images.length} photos</div>
                    )}
                  </td>
                  <td>
                    <strong style={{ display:"block", marginBottom:3 }}>{row.skuId?.brand} {row.skuId?.model}</strong>
                    <span className="tiny">{row.skuId?.variant} · {row.skuId?.color}</span>
                  </td>
                  <td>
                    <span style={{ fontSize:15, fontWeight:700,
                      color: row.availableQty>0 ? "var(--success)" : "var(--danger)" }}>
                      {row.availableQty}
                    </span>
                  </td>
                  <td className="tiny">{row.reservedQty||0}</td>
                  <td><strong style={{ color:"var(--primary)" }}>{inr(row.minimumPrice)}</strong></td>
                  <td>
                    <span className={`badge ${row.status==="ON" ? "success" : "bad"}`}>{row.status}</span>
                  </td>
                  <td>
                    <button className="btn ghost small"
                      onClick={async () => {
                        try {
                          await api(`/supplier/inventory/${row._id}`, {
                            method:"PATCH", body:{ status: row.status==="ON"?"OFF":"ON", verify:true }
                          });
                          load();
                        } catch(e) { setError(e.message); }
                      }}
                      style={{ minWidth:80 }}>
                      {row.status==="ON" ? "Turn OFF" : "Turn ON"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
</div>
```

**File:** `src/pages/Supplier.jsx`
**Verify:** `npm run build` — no errors.

---

### Item 6 — `Supplier.jsx` — `OrderCard` (local helper) redesign

`OrderCard` is a private component, not exported. Keep ALL state, `useEffect` timer, `handleAccept`, `handleReject`, `handlePack`, `handlePhotoChange` — only change JSX.

**New JSX:**

```jsx
return (
  <div className="supplier-order-card fade-in">
    <div className="supplier-order-card-header">
      <div>
        <div className="soc-product">
          {order.items?.[0]?.skuId?.brand} {order.items?.[0]?.skuId?.model}
        </div>
        <div className="soc-payout">Payout {inr(order.totals?.supplierPayout)} · buyer identity not shared</div>
        {timeLeft && <div className="soc-timer">⏱ {timeLeft}</div>}
      </div>
      <StatusBadge status={order.status} />
    </div>

    {/* Accept / Reject */}
    {["reserved","awaiting_accept"].includes(order.status) && (
      <div className="row" style={{ gap:10, marginTop:4 }}>
        <button className="btn success small" onClick={handleAccept}>✓ Accept</button>
        <button className="btn ghost small"   onClick={handleReject}>✕ Reject</button>
      </div>
    )}

    {/* Packing checklist + IMEI */}
    {["accepted","paid"].includes(order.status) && (
      <div style={{ marginTop:12 }}>
        <div className="checklist">
          <label>
            <input type="checkbox" checked={checklist.sealedBox}
              onChange={e => setChecklist({...checklist, sealedBox:e.target.checked})} />
            Sealed box verified
          </label>
          <label>
            <input type="checkbox" checked={checklist.imeiScanned}
              onChange={e => setChecklist({...checklist, imeiScanned:e.target.checked})} />
            IMEI / serial label scanned
          </label>
          <label>
            <input type="checkbox" checked={checklist.noTampering}
              onChange={e => setChecklist({...checklist, noTampering:e.target.checked})} />
            No tampering signs
          </label>
        </div>

        <label style={{ fontSize:13, color:"var(--muted)", marginBottom:6, display:"block" }}>
          Box photo
        </label>
        <input type="file" accept="image/*" onChange={handlePhotoChange}
          style={{ marginBottom: photoPreview ? 8 : 0 }} />
        {photoPreview && (
          <img src={photoPreview} alt="Preview"
            style={{ maxWidth:180, marginTop:6, display:"block", borderRadius:8 }} />
        )}

        <div className="imei-row">
          <input value={imei} onChange={e => setImei(e.target.value)} placeholder="IMEI" />
          <button className="btn small" onClick={handlePack}
            disabled={!allChecked}
            style={{ opacity:allChecked?1:0.5, flexShrink:0 }}>
            Seal & Pack
          </button>
        </div>
      </div>
    )}
  </div>
);
```

**File:** `src/pages/Supplier.jsx`
**Verify:** `npm run build` — no errors.

---

### Item 7 — `Supplier.jsx` — `SupplierOrders` redesign

Keep all state, `load`, `useEffect`. Replace JSX.

```jsx
return (
  <div className="fade-in">
    <div className="page-header">
      <div>
        <h2>Incoming Orders</h2>
        <p className="tiny">Accept deadline ~5 min. Packing requires IMEI (encrypted, restricted).</p>
      </div>
      <button className="btn ghost small" onClick={load}>↻ Refresh</button>
    </div>

    {error && <div className="inline-error" style={{ marginBottom:14 }}>{error}</div>}

    {orders.length === 0 ? (
      <div className="empty-state">
        <div className="empty-icon">📬</div>
        <h4>No incoming orders</h4>
        <p>New orders from buyers will appear here.</p>
      </div>
    ) : (
      <div>
        {orders.map(o => <OrderCard key={o._id} order={o} onUpdate={load} />)}
      </div>
    )}
  </div>
);
```

**File:** `src/pages/Supplier.jsx`
**Verify:** `npm run build` — no errors.

---

### Item 8 — `Supplier.jsx` — `SupplierPayouts` redesign

Keep all state, `useEffect`, filter logic. Replace JSX.

**Compute summary totals inside the component** (derived from `allRows` — no new API calls):
```js
const totalEarned  = allRows.filter(r => r.status==="paid").reduce((s,r) => s + (r.payout||0), 0);
const totalPending = allRows.filter(r => r.status==="pending"||r.status==="eligible").reduce((s,r) => s + (r.payout||0), 0);
```

**New JSX:**

```jsx
return (
  <div className="fade-in">
    <div className="page-header">
      <div>
        <h2>Payout Ledger</h2>
        <p className="muted">T+1 after proof of delivery. Pilot uses delivery-triggered eligibility.</p>
      </div>
    </div>

    {/* Summary strip */}
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

    {/* Filter */}
    <div className="filter-bar">
      <label>
        Filter by status:
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="eligible">Eligible</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
        </select>
      </label>
    </div>

    {/* Table */}
    <div className="section-card">
      <div className="section-card-header">
        <h3>💳 Settlements ({rows.length})</h3>
      </div>
      <div style={{ overflowX:"auto" }}>
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
                <th>Landed Price</th>
                <th>Platform Fee</th>
                <th>Delivery Charge</th>
                <th>Net Payout</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r._id}>
                  <td style={{ fontFamily:"monospace", fontSize:13 }}>
                    ...{String(r.orderId).slice(-8).toUpperCase()}
                  </td>
                  <td>{inr(r.landedPrice || r.payout + r.platformFee + (r.deliveryCharge||0))}</td>
                  <td className="muted">{inr(r.platformFee)}</td>
                  <td className="muted">{inr(r.deliveryCharge||0)}</td>
                  <td><strong style={{ color:"var(--success)" }}>{inr(r.payout)}</strong></td>
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
```

**File:** `src/pages/Supplier.jsx`
**Verify:** `npm run build` — no errors.

---

## Part 4 — Implementation Order (dependency-safe)

All items leave the build in a buildable state when completed:

1. **Item 1** — Append CSS to `styles.css`. New classes available for all components.
2. **Item 2** — Redesign `BuyerSearch` + `ProductCard` in `Buyer.jsx`. Add `StatusBadge` and `LoadingScreen` helpers at top of file.
3. **Item 3** — Redesign `BuyerOrders` in `Buyer.jsx`. Uses `StatusBadge` already added.
4. **Item 4** — Redesign `BuyerOrder` in `Buyer.jsx`. Uses `StatusBadge` already added.
5. **Item 5** — Redesign `SupplierStock` in `Supplier.jsx`. Add `StatusBadge` and `LoadingScreen` helpers at top of file.
6. **Item 6** — Redesign `OrderCard` (private) in `Supplier.jsx`. Uses `StatusBadge` already added.
7. **Item 7** — Redesign `SupplierOrders` in `Supplier.jsx`.
8. **Item 8** — Redesign `SupplierPayouts` in `Supplier.jsx`.

After all 8 items: **final build + preview check.**

---

## Part 5 — Build Verification Command

```bash
cd /Users/mac/freeLancing/salebysale/salebysale-users-frontend
npm run build
```

Expected outcome: **vite build exits with code 0**, dist/ directory written, no TypeScript/JSX errors in console.

For visual inspection after build:
```bash
npm run preview
```
Open http://localhost:4173 and navigate through Buyer Search, My Orders, an Order detail, Supplier Inventory, Incoming Orders, and Payouts.

---

## Design Decisions & Rationale

| Decision | Rationale |
|---|---|
| Use CSS classes over inline styles | The codebase mixes both. New classes go in styles.css following existing `.card`, `.badge`, `.btn` pattern; this keeps JSX clean and classes reusable. |
| `section-card` + `section-card-header` wrapper pattern | Gives every panel a consistent header stripe (used across admin pages in most real dashboards). Visual hierarchy without new components. |
| `stat-strip` / `payout-summary` derived from existing data | No new API calls. Totals are computed client-side from data already fetched, satisfying the "presentation layer only" constraint. |
| Stepper uses pure CSS classes | Replaces 40 lines of ad-hoc inline styles with 6 class names, easier to maintain. |
| `StatusBadge` helper not in a separate file | Avoids creating new files. Defined at the top of each file that needs it — two small duplications are acceptable to stay within the "no new files" constraint. |
| No icon library — emoji + inline SVG | Constraint is explicit. Emoji renders well on all platforms; no flash of missing icons. |
| `fade-in` on page root | Single 220ms keyframe gives each view a crisp entrance. Zero cost, no library. |
| Pagination uses `.page-btn` instead of `.btn` | Pagination buttons need square/fixed dimensions and active state that conflicts with the `.btn` pill shape. Dedicated class keeps styles orthogonal. |
| Checklist uses `:has()` CSS for checked style | Modern CSS, supported in all browsers since 2023. Eliminates the need for JS class toggling on each checkbox row. |
