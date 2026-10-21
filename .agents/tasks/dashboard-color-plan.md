# Implementation Plan: Apply Indigo/Purple Design Language to Dashboard Pages

## Summary of findings

### Color audit — auth/landing pages use:
- `#6366f1` — indigo primary (replaces `#2563eb`)
- `#4f46e5` — indigo dark (used in hover states / gradients on landing)
- `#8b5cf6` — purple secondary
- `#ede9fe` — purple-light (replaces `#dbeafe` blue-light)
- `linear-gradient(135deg, #6366f1, #8b5cf6)` — primary gradient (`.auth-left`, `.auth-btn`, `.hero-btn-primary`, `.landing-nav-btn`, `.register-mark`, `.step-number`, `.cta-banner`, etc.)
- `linear-gradient(145deg, #6366f1 0%, #8b5cf6 100%)` — auth-left sidebar exact
- `rgba(99,102,241,0.12)` — indigo focus ring / hover fill
- `rgba(99,102,241,0.35)` — button hover shadow

### Current dashboard state (what is wrong):
Both `styles.css` files have `:root` variables still set to the old blue palette:
```
--primary: #2563eb       ← must become #6366f1
--primary-dark: #1e40af  ← must become #4f46e5
--primary-light: #dbeafe ← must become #ede9fe
```
The `.topbar, .nav` and `.mark` backgrounds reference `var(--primary-dark)` and `var(--primary)` respectively — they will update automatically once the variables are changed.
The `.side` sidebar uses `var(--bg2)` (grey) — needs an indigo gradient.
The `.side a.active` uses `var(--primary-light)` fill — needs white background with indigo text on the gradient sidebar.
The `--shadow-lg` in users styles.css still has `rgba(37,99,235,0.13)` (blue) — needs `rgba(99,102,241,0.13)`.
The `.btn:hover` shadow is `rgba(37, 99, 235, 0.3)` — needs `rgba(99,102,241,0.3)`.
The `.otp-box` border is `rgba(37,99,235,0.2)` — needs `rgba(99,102,241,0.2)`.
The `.img-thumb.primary-thumb` shadow is `rgba(37,99,235,0.2)` — needs `rgba(99,102,241,0.2)`.
The `.img-thumb .thumb-badge` background is `rgba(37,99,235,0.88)` — needs `rgba(99,102,241,0.88)`.
The `.upload-zone` fill is `rgba(219,234,254,0.12)` (blue tint) — needs `rgba(237,233,254,0.12)` (purple tint).

### Admin Buyer.jsx / Supplier.jsx state:
Both files use bare `.card`, `.alert`, `.ok`, `.btn`, `table`, `h2`, etc. from the base CSS — no inline color overrides. They are unstyled clones of the old minimal UI. They need a full redesign matching the users-frontend pattern (page-header, stat-strip, stat-card, section-card, pill-tabs, order-row, supplier-order-card, etc.) while all JS logic stays unchanged.

### Layout.jsx (both frontends):
The `.side` (sidebar) gets its look entirely from CSS. The JSX itself only adds `style={{ display: "flex", flexDirection: "column" }}`. No JSX change needed in Layout — only CSS changes.

---

## Steps

- [ ] 1. Update CSS variables and raw color values in **users-frontend** `styles.css`

  Change exactly these values in the `:root` block and throughout the file:

  **In `:root` (first block):**
  ```
  --primary: #2563eb       →  --primary: #6366f1
  --primary-dark: #1e40af  →  --primary-dark: #4f46e5
  --primary-light: #dbeafe →  --primary-light: #ede9fe
  ```

  **In `/* Dashboard Redesign additions */` second `:root` block:**
  ```
  --shadow-lg: 0 8px 32px rgba(37,99,235,0.13)  →  --shadow-lg: 0 8px 32px rgba(99,102,241,0.13)
  ```

  **Other raw hex/rgba values in the file** (find-and-replace each):
  | Find | Replace | Location |
  |------|---------|----------|
  | `rgba(37, 99, 235, 0.3)` | `rgba(99,102,241,0.3)` | `.btn:hover` shadow |
  | `rgba(37,99,235,0.2)` | `rgba(99,102,241,0.2)` | `.otp-box` border, `.img-thumb.primary-thumb` shadow |
  | `rgba(37,99,235,0.88)` | `rgba(99,102,241,0.88)` | `.img-thumb .thumb-badge` bg |
  | `rgba(219,234,254,0.12)` | `rgba(237,233,254,0.12)` | `.upload-zone` bg |
  | `rgba(219,234,254,0.3)` | `rgba(237,233,254,0.3)` | `.upload-zone:hover` bg |
  | `linear-gradient(135deg, #eff6ff 0%, #f1f5f9 100%)` | `linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)` | `.product-card-img` bg |
  | `#dbeafe` (any remaining literal) | `#ede9fe` | any stray occurrences |

  File: `salebysale-users-frontend/src/styles.css`

  Verify: `cd /Users/mac/freeLancing/salebysale/salebysale-users-frontend && npm run build` — must exit 0 with no errors.

---

- [ ] 2. Update CSS variables and raw color values in **admin-frontend** `styles.css`

  Apply the identical variable and color replacements from Step 1 to the admin CSS file. The admin `styles.css` does not have the Dashboard Redesign additions block, so only the `:root` variables and the handful of raw rgba values in the auth/landing sections need updating:

  **In `:root`:**
  ```
  --primary: #2563eb       →  --primary: #6366f1
  --primary-dark: #1e40af  →  --primary-dark: #4f46e5
  --primary-light: #dbeafe →  --primary-light: #ede9fe
  ```

  **Other raw values in admin styles.css** (search and replace):
  | Find | Replace | Location |
  |------|---------|----------|
  | `rgba(37, 99, 235, 0.3)` | `rgba(99,102,241,0.3)` | `.btn:hover` shadow |

  File: `salebysale-admin-frontend/src/styles.css`

  Verify: `cd /Users/mac/freeLancing/salebysale/salebysale-admin-frontend && npm run build` — must exit 0.

---

- [ ] 3. Add indigo/purple sidebar styles and dashboard utility classes to **users-frontend** `styles.css`

  APPEND the following block at the end of `salebysale-users-frontend/src/styles.css`. Do NOT remove or modify existing rules.

  ```css
  /* ── Indigo/Purple Dashboard Theme ── */

  /* Sidebar: indigo→purple gradient, matching auth-left */
  .side {
    background: linear-gradient(160deg, #6366f1 0%, #8b5cf6 100%) !important;
    border-right: none !important;
  }

  /* Brand mark inside sidebar */
  .side .brand {
    color: #ffffff;
  }
  .side .mark {
    background: rgba(255,255,255,0.22) !important;
    backdrop-filter: blur(4px);
  }
  .side .tag {
    color: rgba(255,255,255,0.7);
  }

  /* Nav links: white text on gradient */
  .side a,
  .side button.linkish {
    color: rgba(255,255,255,0.85) !important;
    background: none !important;
  }

  /* Active/hover: white pill with indigo text */
  .side a.active,
  .side a:hover,
  .side button.linkish:hover {
    background: rgba(255,255,255,0.92) !important;
    color: #6366f1 !important;
    font-weight: 600;
  }

  /* Sign-out button inside sidebar */
  .side .btn.ghost {
    border-color: rgba(255,255,255,0.4) !important;
    color: #ffffff !important;
    background: transparent !important;
  }
  .side .btn.ghost:hover {
    background: rgba(255,255,255,0.15) !important;
  }

  /* User info text */
  .side .tiny {
    color: rgba(255,255,255,0.7) !important;
  }

  /* Stat card: 3px top accent border in indigo */
  .stat-card {
    border-top: 3px solid #6366f1 !important;
  }
  .stat-card.success { border-top-color: var(--success) !important; }
  .stat-card.warning { border-top-color: var(--warning) !important; }
  .stat-card.danger  { border-top-color: var(--danger)  !important; }

  /* Stat icon circle */
  .stat-card .stat-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, #f5f3ff, #ede9fe);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    margin-bottom: 4px;
  }
  .stat-card.success .stat-icon { background: linear-gradient(135deg, #d1fae5, #a7f3d0); }
  .stat-card.warning .stat-icon { background: linear-gradient(135deg, #fef3c7, #fde68a); }
  .stat-card.danger  .stat-icon { background: linear-gradient(135deg, #fee2e2, #fecaca); }

  /* Primary .btn: indigo gradient matching auth-btn */
  .btn:not(.ghost):not(.success):not(.danger) {
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important;
    color: #ffffff !important;
  }
  .btn:not(.ghost):not(.success):not(.danger):hover {
    background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%) !important;
    box-shadow: 0 4px 12px rgba(99,102,241,0.35) !important;
  }

  /* Page header h2 accent */
  .page-header h2 {
    color: #111827;
  }

  /* Section card header: subtle indigo tint */
  .section-card-header {
    background: linear-gradient(135deg, #f5f3ff 0%, #faf5ff 100%) !important;
    border-bottom-color: #ede9fe !important;
  }

  /* Table header: indigo gradient */
  th {
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important;
  }

  /* Topbar / nav: indigo gradient */
  .topbar, .nav {
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important;
  }

  /* Order row hover accent */
  .order-row:hover {
    border-color: #6366f1 !important;
    box-shadow: 0 4px 16px rgba(99,102,241,0.10) !important;
  }

  /* Product card hover accent */
  .product-card:hover {
    border-color: #6366f1 !important;
    box-shadow: 0 8px 32px rgba(99,102,241,0.13) !important;
  }

  /* Pagination active page: indigo */
  .pagination .page-btn.active {
    background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
  }

  /* Pill tab active: indigo */
  .pill-tab.active {
    background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
    border-color: #6366f1 !important;
  }

  /* OTP box: indigo tint */
  .otp-box {
    background: var(--primary-light);
    border-color: rgba(99,102,241,0.2);
  }

  /* Stepper done dot: indigo */
  .stepper-dot.done {
    background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
    border-color: #6366f1 !important;
  }

  /* Timeline dot: indigo */
  .timeline-dot {
    background: #6366f1 !important;
  }
  .timeline {
    border-left-color: #ede9fe !important;
  }

  /* Upload zone: indigo dashed border */
  .upload-zone {
    border-color: #6366f1 !important;
  }

  /* Payout summary value (default primary) */
  .payout-summary-item .ps-value {
    color: #6366f1 !important;
  }
  ```

  File: `salebysale-users-frontend/src/styles.css`

  Verify: `cd /Users/mac/freeLancing/salebysale/salebysale-users-frontend && npm run build` — must exit 0.

---

- [ ] 4. Add indigo/purple sidebar styles and dashboard utility classes to **admin-frontend** `styles.css`

  The admin `styles.css` currently has no "Dashboard Redesign additions" block. Two things are needed:
  (a) Copy the `/* Dashboard Redesign additions */` block from the users styles.css verbatim (stat-strip, stat-card, section-card, etc.) because the admin dashboard JSX in Step 6 will use those classes.
  (b) Append the same indigo theme block from Step 3.

  APPEND the following to the END of `salebysale-admin-frontend/src/styles.css`:

  ```css
  /* ── Dashboard Redesign additions (ported from users-frontend) ── */

  :root {
    --success-light: #d1fae5;
    --warning-light: #fef3c7;
    --danger-light: #fee2e2;
    --radius-lg: 12px;
    --radius-xl: 16px;
    --shadow-md: 0 4px 16px rgba(0,0,0,0.10);
    --shadow-lg: 0 8px 32px rgba(99,102,241,0.13);
    --transition: all 200ms ease-in-out;
  }

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

  .stat-strip {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
    margin-bottom: 24px;
  }
  .stat-card {
    background: var(--card);
    border: 1px solid var(--line);
    border-top: 3px solid #6366f1;
    border-radius: var(--radius-lg);
    padding: 16px 18px;
    box-shadow: var(--shadow);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .stat-card.success { border-top-color: var(--success); }
  .stat-card.warning { border-top-color: var(--warning); }
  .stat-card.danger  { border-top-color: var(--danger); }
  .stat-card .stat-icon {
    width: 40px; height: 40px; border-radius: 10px;
    background: linear-gradient(135deg, #f5f3ff, #ede9fe);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; margin-bottom: 4px;
  }
  .stat-card.success .stat-icon { background: linear-gradient(135deg, #d1fae5, #a7f3d0); }
  .stat-card.warning .stat-icon { background: linear-gradient(135deg, #fef3c7, #fde68a); }
  .stat-card.danger  .stat-icon { background: linear-gradient(135deg, #fee2e2, #fecaca); }
  .stat-card .stat-value { font-size: 22px; font-weight: 700; color: var(--primary); line-height: 1; }
  .stat-card .stat-label { font-size: 12px; color: var(--muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; }
  .stat-card.success .stat-value { color: var(--success); }
  .stat-card.warning .stat-value { color: var(--warning); }
  .stat-card.danger  .stat-value { color: var(--danger); }

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
    border-bottom: 1px solid #ede9fe;
    background: linear-gradient(135deg, #f5f3ff 0%, #faf5ff 100%);
    gap: 12px;
    flex-wrap: wrap;
  }
  .section-card-header h3 { margin: 0; font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
  .section-card-body { padding: 20px; }

  .empty-state { text-align: center; padding: 56px 20px; }
  .empty-state .empty-icon { font-size: 56px; margin-bottom: 14px; }
  .empty-state h4 { margin: 0 0 6px; font-size: 16px; }
  .empty-state p  { color: var(--muted); font-size: 14px; margin-bottom: 18px; }

  .search-bar { display: flex; gap: 8px; margin: 16px 0 20px; }
  .search-bar input { flex: 1; height: 46px; font-size: 15px; }
  .search-bar .btn  { height: 46px; padding: 0 20px; }

  .pill-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
  .pill-tab {
    border: 1px solid var(--line); background: var(--bg2); color: var(--muted);
    border-radius: 999px; padding: 6px 16px; font-size: 13px; font-weight: 500; cursor: pointer;
    transition: all 200ms ease-in-out;
  }
  .pill-tab:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }
  .pill-tab.active { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border-color: #6366f1; }

  .order-row {
    display: flex; gap: 14px; align-items: center; padding: 14px 18px;
    background: var(--card); border: 1px solid var(--line); border-radius: var(--radius-lg);
    transition: all 200ms ease-in-out;
  }
  .order-row:hover { box-shadow: 0 4px 16px rgba(99,102,241,0.10); border-color: #6366f1; }
  .order-row-icon { width: 48px; height: 48px; border-radius: 10px; background: var(--primary-light); display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
  .order-row-info { flex: 1; min-width: 0; }
  .order-row-title { font-weight: 700; font-size: 14px; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .order-row-meta { font-size: 12px; color: var(--muted); }
  .order-row-right { text-align: right; flex-shrink: 0; }
  .order-row-price { font-weight: 700; color: var(--primary); margin-bottom: 6px; font-size: 15px; }

  .supplier-order-card {
    background: var(--card); border: 1px solid var(--line); border-radius: var(--radius-lg);
    padding: 18px 20px; margin-bottom: 14px; box-shadow: var(--shadow);
    transition: all 200ms ease-in-out;
  }
  .supplier-order-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.10); }
  .supplier-order-card-header {
    display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 10px; gap: 10px; flex-wrap: wrap;
  }
  .soc-product { font-weight: 700; font-size: 15px; }
  .soc-payout  { font-size: 13px; color: var(--muted); margin-top: 2px; }
  .soc-timer   { font-size: 13px; color: var(--danger); font-weight: 700; }

  .payout-summary {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 12px; margin-bottom: 22px;
  }
  .payout-summary-item {
    background: var(--card); border: 1px solid var(--line);
    border-top: 3px solid #6366f1; border-radius: var(--radius-lg);
    padding: 14px 18px; box-shadow: var(--shadow);
  }
  .payout-summary-item .ps-label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; }
  .payout-summary-item .ps-value { font-size: 20px; font-weight: 700; color: #6366f1; }
  .payout-summary-item.earned  .ps-value { color: var(--success); }
  .payout-summary-item.pending .ps-value { color: var(--warning); }

  .inline-success {
    background: var(--success-light); border: 1px solid var(--success); color: #065f46;
    border-radius: var(--radius); padding: 10px 14px; font-size: 14px;
  }
  .inline-error {
    background: var(--danger-light); border: 1px solid var(--danger); color: #dc2626;
    border-radius: var(--radius); padding: 10px 14px; font-size: 14px;
  }

  .badge.status-delivered { background: var(--success-light); color: var(--success); }
  .badge.status-reserved  { background: var(--warning-light); color: var(--warning); }
  .badge.status-assigned,
  .badge.status-awaiting_admin { background: #ede9fe; color: #7c3aed; }
  .badge.status-picked          { background: #fce7f3; color: #db2777; }
  .badge.status-cancelled,
  .badge.status-disputed        { background: var(--danger-light); color: var(--danger); }

  .inv-table-wrap { overflow-x: auto; }
  .inv-table-wrap table { min-width: 600px; }

  .filter-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }
  .filter-bar label { font-size: 13px; color: var(--muted); display: flex; align-items: center; gap: 6px; }
  .filter-bar select { min-width: 140px; height: 38px; font-size: 14px; }

  @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  .fade-in { animation: fadeIn 0.22s ease-out both; }

  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.45; } }
  .skeleton { background: var(--bg2); border-radius: var(--radius); animation: pulse 1.5s ease-in-out infinite; }

  @media (max-width: 700px) {
    .stat-strip { grid-template-columns: repeat(2, 1fr); }
    .page-header { flex-direction: column; align-items: stretch; }
    .page-header .btn { width: 100%; text-align: center; }
  }

  /* Sticky bottom action bar for mobile */
  .sticky-bottom {
    position: sticky; bottom: 0; background: var(--card);
    padding: 16px; border-top: 1px solid var(--line);
    z-index: 10; box-shadow: 0 -4px 12px rgba(0,0,0,0.1);
  }

  /* Loading spinner */
  .spinner {
    width: 40px; height: 40px;
    border: 4px solid var(--primary-light);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  /* ── Indigo/Purple Dashboard Theme ── */

  .side {
    background: linear-gradient(160deg, #6366f1 0%, #8b5cf6 100%) !important;
    border-right: none !important;
  }
  .side .brand { color: #ffffff; }
  .side .mark {
    background: rgba(255,255,255,0.22) !important;
    backdrop-filter: blur(4px);
  }
  .side .tag { color: rgba(255,255,255,0.7); }
  .side a,
  .side button.linkish {
    color: rgba(255,255,255,0.85) !important;
    background: none !important;
  }
  .side a.active,
  .side a:hover,
  .side button.linkish:hover {
    background: rgba(255,255,255,0.92) !important;
    color: #6366f1 !important;
    font-weight: 600;
  }
  .side .btn.ghost {
    border-color: rgba(255,255,255,0.4) !important;
    color: #ffffff !important;
    background: transparent !important;
  }
  .side .btn.ghost:hover { background: rgba(255,255,255,0.15) !important; }
  .side .tiny { color: rgba(255,255,255,0.7) !important; }

  .btn:not(.ghost):not(.success):not(.danger) {
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important;
    color: #ffffff !important;
  }
  .btn:not(.ghost):not(.success):not(.danger):hover {
    background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%) !important;
    box-shadow: 0 4px 12px rgba(99,102,241,0.35) !important;
  }

  th {
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important;
  }

  .topbar, .nav {
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important;
  }
  ```

  File: `salebysale-admin-frontend/src/styles.css`

  Verify: `cd /Users/mac/freeLancing/salebysale/salebysale-admin-frontend && npm run build` — must exit 0.

---

- [ ] 5. Rewrite **admin-frontend** `Buyer.jsx` using the indigo design components

  **ALL JS logic, state, API calls, and handlers must remain byte-for-byte identical.** Only the JSX markup (return value) changes.

  **BuyerSearch** — replace the bare `<div>` + `<form>` + `<div className="grid cols-2">` template with:
  - Outer `<div className="fade-in">`
  - `<div className="page-header">` with `<h2>Model Search</h2>` + muted subtitle
  - `{error && <div className="inline-error">…</div>}`
  - `<form className="search-bar" onSubmit={search}>` — same handlers, add `className="search-bar"` wrapper, input gets `flex:1 / height:46px`, button gets `className="btn"`
  - Results: replace `<div className="grid cols-2">` with `<div className="grid cols-2" style={{gap:16}}>` and each `<button className="card">` becomes:
    ```jsx
    <button key={s._id} className="product-card" onClick={() => availability(s._id)} style={{ textAlign: "left", cursor: "pointer" }}>
      <div className="product-card-img">📱</div>
      <div className="product-card-body">
        <div className="product-card-brand">{s.brand}</div>
        <div className="product-card-title">{s.model}</div>
        <div className="product-card-sub">{[s.variant, s.color, s.warranty].filter(Boolean).join(" · ")}</div>
        <div className="product-card-footer"><span className="product-card-cta">Check availability →</span></div>
      </div>
    </button>
    ```
  - Offers block: same logic, wrap each offer in `<div className="section-card">` with `<div className="section-card-header"><h3>…</h3></div>` and `<div className="section-card-body offer">` containing the price, meta, and `<button className="btn">Pay & reserve</button>`

  **BuyerOrders** — replace the bare table with:
  - Outer `<div className="fade-in">`
  - `<div className="page-header"><div><h2>Orders</h2></div></div>`
  - Replace `<table>` with a list of `<div className="order-row">` cards:
    ```jsx
    {orders.map(o => (
      <div key={o._id} className="order-row">
        <div className="order-row-icon">📱</div>
        <div className="order-row-info">
          <div className="order-row-title">{o.items?.[0]?.listingLabel}</div>
          <div className="order-row-meta">Order #{o._id.slice(-8).toUpperCase()}</div>
        </div>
        <div className="order-row-right">
          <div className="order-row-price">{inr(o.totals?.landedPrice)}</div>
          <span className={`badge ${STATUS_CLASS[o.status] || ""}`}>{o.status}</span>
        </div>
        <Link to={`/app/orders/${o._id}`} className="btn ghost small">Track →</Link>
      </div>
    ))}
    ```
  - Add the `STATUS_CLASS` map and a `StatusBadge` helper at the top of the file (same map as users-frontend Buyer.jsx)

  **BuyerOrder** — replace the two bare `<div className="card">` blocks with:
  - Outer `<div className="fade-in">`
  - Breadcrumb row: `<Link to="/app/orders" className="btn ghost small">← Back</Link>` + `<h2 style={{margin:0,fontSize:18}}>Order #{id.slice(-8).toUpperCase()}</h2>`
  - Left card → `<div className="section-card">` with `<div className="section-card-header"><h3>📱 Product Summary</h3></div>` + `<div className="section-card-body">` containing the existing stat-list and OTP
  - Right card → `<div className="section-card">` with `<div className="section-card-header"><h3>🕐 Events</h3></div>` + `<div className="section-card-body">` containing the existing events list and dispute form
  - OTP block: wrap in `<div className="otp-box"><div className="otp-hint">…</div><div className="otp">{order.tracking.deliveryOtp}</div></div>`
  - Message: `{msg && <div className="inline-success" style={{marginTop:12}}>{msg}</div>}`

  File: `salebysale-admin-frontend/src/pages/Buyer.jsx`

  Verify: `cd /Users/mac/freeLancing/salebysale/salebysale-admin-frontend && npm run build` — must exit 0 with no type/import errors.

---

- [ ] 6. Rewrite **admin-frontend** `Supplier.jsx` using the indigo design components

  **ALL JS logic, state, API calls, and handlers must remain byte-for-byte identical.** Only the JSX markup (return value) changes.

  **SupplierStock** — replace bare `<div>` template with:
  - Outer `<div className="fade-in">`
  - `<div className="page-header">` with `<h2>Live Inventory</h2>` + muted subtitle
  - `{msg && <div className="inline-success" …>}` replacing `.ok`
  - Form: wrap existing `<form className="card form">` → `<div className="section-card"><div className="section-card-header"><h3>➕ Add / Update Stock</h3></div><div className="section-card-body"><form className="form" onSubmit={save}>…</form></div></div>` — all inputs/selects/buttons unchanged
  - Inventory table: wrap in `<div className="section-card"><div className="section-card-header"><h3>📋 Inventory</h3></div><div className="inv-table-wrap"><table>…</table></div></div>`
  - Add `<div className="stat-strip">` stat cards above the form for total/active/reserved counts (compute client-side exactly as users-frontend SupplierStock does: `inventory.filter(r=>r.status==="ON").length`, etc.)

  **SupplierOrders** — replace bare `<div>` cards with:
  - Outer `<div className="fade-in">`
  - `<div className="page-header">` header
  - Each order: replace `<div className="card">` → `<div className="supplier-order-card fade-in">`
    - Header: `<div className="supplier-order-card-header"><div><div className="soc-product">…</div><div className="soc-payout">…</div></div><span className="badge">{o.status}</span></div>`
    - Accept/reject row: unchanged buttons but use `className="btn success small"` and `className="btn ghost small"`
    - Pack row: unchanged input + button

  **SupplierPayouts** — replace bare table with:
  - Outer `<div className="fade-in">`
  - `<div className="page-header">` header
  - Payout summary strip using `<div className="payout-summary">` with three `<div className="payout-summary-item">` cards for total/earned/pending (compute the same totals as users-frontend SupplierPayouts does)
  - Pill tabs for status filtering (add `statusFilter` + `allRows` state, same pattern as users-frontend)
  - Table wrapped in `<div className="section-card"><div className="section-card-header"><h3>💳 Settlements</h3></div><div style={{overflowX:"auto"}}><table>…</table></div></div>`
  - Table columns: Order · Landed Price · Platform Fee · Net Payout · Status (same data, new columns for landedPrice and deliveryCharge are optional; include if already available from `r` object — check `r.landedPrice`, `r.platformFee`, `r.payout`)

  File: `salebysale-admin-frontend/src/pages/Supplier.jsx`

  Verify: `cd /Users/mac/freeLancing/salebysale/salebysale-admin-frontend && npm run build` — must exit 0.

---

- [ ] 7. Final build verification for both frontends

  Run both builds and confirm clean output:

  ```
  cd /Users/mac/freeLancing/salebysale/salebysale-users-frontend && npm run build
  cd /Users/mac/freeLancing/salebysale/salebysale-admin-frontend && npm run build
  ```

  Expected: both exit 0, no errors in the output. Warnings about chunk size are acceptable.

---

## What must NOT change

- All `useState`, `useEffect`, `useCallback`, `api(...)` calls, `inr(...)` calls, form submit handlers, event handlers, and routing (`Link`, `useNavigate`, `useParams`) in all four JSX files.
- The admin `BuyerSearch` query-parameter API calls (`/catalog/search?q=`, `/inventory/availability?sku_id=`, `/orders` POST).
- The admin `SupplierStock` `load()` function that calls both `/supplier/inventory` and `/catalog/search?q=` in parallel.
- The admin `SupplierOrders` single shared `imei` state (it is intentional in that file).
- The `Layout.jsx` files in both frontends — sidebar menu items, NavLink targets, logout handler all stay as-is. The indigo sidebar appearance comes entirely from CSS overrides in Steps 3/4.
- The users-frontend `Buyer.jsx` and `Supplier.jsx` JSX structure — these are already using the new design components. Only their CSS variable values update via Steps 1 and 3.

## Color reference cheat-sheet

| Token | Old blue | New indigo/purple |
|---|---|---|
| `--primary` | `#2563eb` | `#6366f1` |
| `--primary-dark` | `#1e40af` | `#4f46e5` |
| `--primary-light` | `#dbeafe` | `#ede9fe` |
| Primary gradient | n/a | `linear-gradient(135deg, #6366f1, #8b5cf6)` |
| Sidebar gradient | n/a | `linear-gradient(160deg, #6366f1 0%, #8b5cf6 100%)` |
| Focus ring | `rgba(37,99,235,…)` | `rgba(99,102,241,…)` |
| Button shadow | `rgba(37, 99, 235, 0.3)` | `rgba(99,102,241,0.3)` |
| Secondary purple | n/a | `#8b5cf6` |
