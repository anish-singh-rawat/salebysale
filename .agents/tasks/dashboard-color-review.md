# Indigo/Purple Brand Identity Ported to Dashboard Pages

Both frontends' dashboard pages (Buyer.jsx and Supplier.jsx) and their shared styles.css files were updated to replace the old blue palette with the indigo/purple identity already established on the auth and landing pages. The strategy is two-layered: the `:root` CSS variables were updated to indigo values, and a dedicated "Indigo/Purple Dashboard Theme" block at the bottom of each stylesheet applies `!important` overrides to the sidebar, buttons, table headers, topbar, stat cards, and interactive elements. All JS handlers, state machines, and API calls are structurally unchanged across both frontends.

**Watch for:** The users-frontend `.tag` global baseline sets `color: var(--muted)` (gray), but `.side .tag` overrides it to `rgba(255,255,255,0.7)`. This works because `.side` context wins specificity, but the baseline definition is inconsistent between the two stylesheets — confirmed. The admin-frontend has `.tag` set to `rgba(255,255,255,0.7)` globally at the baseline level, meaning any `.tag` element outside the sidebar would also render white-on-white in certain contexts. Additionally, `index.css` in both frontends still defines `--accent: #2563eb`, but since `index.css` is never imported, this is dead code with no runtime effect.

**Verdict**: APPROVED

---

## High-level view

Both `:root` blocks now define `--primary: #6366f1`, `--primary-dark: #4f46e5`, and `--primary-light: #ede9fe`, fully replacing the old blue tokens. Every component that consumes these variables — `.btn`, `.badge`, `.pill`, focus rings, stepper dots, timeline dots, OTP boxes, pagination — inherits the indigo identity without touching component-level JSX.

The sidebar gets an indigo→purple gradient (`linear-gradient(160deg, #6366f1 0%, #8b5cf6 100%)`) matching the auth-left panel exactly. Nav item states use white-pill-on-gradient for active and semi-transparent white for hover, which is visually coherent with the auth/landing vocabulary. Both stylesheets apply this identically.

Stat cards carry a 3px indigo top border as the brand accent, with a light indigo icon container (`linear-gradient(135deg, #f5f3ff, #ede9fe)`). Variant states (success/warning/danger) correctly override both border and icon background. The JSX in all four page files uses `<div className="stat-card">`, `<div className="stat-card success">`, etc., which binds cleanly.

Primary buttons are overridden via `.btn:not(.ghost):not(.success):not(.danger)` to use the indigo gradient. The selector correctly excludes ghost, success, and danger variants — these keep their original semantics. The override uses `!important`, which is a smell in long-lived code but acceptable here as a targeted theming layer that doesn't bleed into component logic.

All JavaScript — fetch calls, state setters, event handlers, form validation, the countdown timer in SupplierOrders (users), the checklist gate before Seal & Pack, the OTP copy handler in BuyerOrder, and the status filter logic in SupplierPayouts — is identical to the prior version. No behavioral change is present in the JSX diffs.

The admin-frontend `.tag` baseline is defined as white (`rgba(255,255,255,0.7)`) at the global `:root` level rather than scoped to `.side`. If a `.tag` element ever appears outside a sidebar context in the admin app, it will render near-invisible against a white background.

---

<details>
<summary>Issues (2)</summary>

1. **Admin `.tag` leaks outside sidebar** — `users-frontend/styles.css` line 50 sets `.tag { color: var(--muted); }` (gray), then `.side .tag` overrides to white. The `admin-frontend/styles.css` line 50 sets the global `.tag { color: rgba(255,255,255,0.7); }` — no scoping to `.side`. Any `.tag` element outside the sidebar in the admin frontend will render near-invisible on a white background. Scope the override to `.side .tag` in admin styles.css (line 50).

2. **`index.css` residual blue variables** — `salebysale-users-frontend/src/index.css` and `salebysale-admin-frontend/src/index.css` both define `--accent: #2563eb` (old blue). These files are not imported anywhere (confirmed: `main.jsx` imports only `styles.css`), so they have no runtime effect today. They are a maintenance hazard if either file gets imported in future. Remove or update them to avoid confusion.

</details>

---

<details>
<summary>Details</summary>

## Sidebar gradient and nav item states

Active state (`rgba(255,255,255,0.92)` pill with `#6366f1` text) and hover state share the same CSS rule, so there is no distinct hover feedback for non-active items — confirmed pattern, not a regression.

The users-frontend has `.tag { color: var(--muted); }` at line 50, then a later `.side .tag { color: rgba(255,255,255,0.7); }` scoped override — cascade resolves correctly. The admin-frontend has `.tag { color: rgba(255,255,255,0.7); }` at line 50 globally — any `.tag` outside a sidebar in the admin app renders near-invisible on a white background. **Confirmed concern, see Issues.**

## Button gradient selector correctness

The `!important` override selector `.btn:not(.ghost):not(.success):not(.danger)` correctly excludes ghost, success, and danger variants. The users-frontend Supplier.jsx disabled-button pattern — `<button className="btn" disabled={uploading}>` with an inline `opacity` toggle — correctly dims over the gradient without class conflicts.

## Stat card accent

Both stylesheets define `border-top: 3px solid #6366f1` on `.stat-card`, with color overrides for contextual variants. The icon container background is `linear-gradient(135deg, #f5f3ff, #ede9fe)` for the default; success/warning/danger variants use green/amber/red fills. JSX in all four page files applies class names with no hardcoded colors in the component layer.

## Logic preservation

The only changes in Buyer.jsx and Supplier.jsx for both frontends are new CSS class names applied in JSX. All `async`/`await` API calls, `useEffect` dependency arrays, `useState` initializers, event handlers, and conditional rendering logic are unchanged.

Specific verifications:
- Users Supplier.jsx: countdown timer (`setInterval` on `order.acceptDeadline`), checklist gate (`allChecked`), image upload with 5-image cap and 2MB guard, `removeImage` index correction — all intact.
- Users Buyer.jsx: OTP clipboard handler with auto-reset, `etaRemaining` calculation from order events, `statusFilter` → `filteredOrders` derived state, `canCancel` gate — all intact.
- Admin Buyer.jsx: `availability()` + `buy()` two-step sequential API purchase flow, search on mount — intact.
- Admin Supplier.jsx: single shared `imei` state across all order cards (pre-existing design choice, not introduced here) — intact.

## Responsiveness

Both stylesheets use fluid layout primitives throughout:
- `stat-strip`: `grid-template-columns: repeat(auto-fit, minmax(140px, 1fr))` — collapses gracefully to 2 columns at 700px, 1 column at 480px
- `layout` (sidebar + main): `grid-template-columns: 240px 1fr` collapses to single column at 900px
- `page-header`: `flex-wrap: wrap` with a column fallback at ≤700px; the CTA button goes full-width
- `.slide-panel` (Add Product): `width: min(600px, 100vw)` — safe on 375px
- No hardcoded pixel widths that would break narrow viewports were introduced. The `inv-table-wrap` uses `overflow-x: auto` with `min-width: 600px` on the table — correct approach.

## Test coverage

No automated tests exist for these UI components. The visual correctness of the theming is only verifiable through manual browser inspection. There are no unit tests for the CSS class bindings or the component rendering paths.

## Build results

Per the coder's recorded build output, both `salebysale-users-frontend` and `salebysale-admin-frontend` compiled without errors or warnings after these changes.

</details>

---

<details>
<summary>File map</summary>

| File | What changed |
|---|---|
| `salebysale-users-frontend/src/styles.css` | `:root` variables updated to indigo; "Indigo/Purple Dashboard Theme" block added with sidebar gradient, button override, stat card accent, table/topbar overrides |
| `salebysale-users-frontend/src/pages/Buyer.jsx` | JSX restructured with new CSS class names (`stat-strip`, `stat-card`, `section-card`, `order-row`, `pill-tabs`, stepper, etc.); all JS logic unchanged |
| `salebysale-users-frontend/src/pages/Supplier.jsx` | JSX restructured with `stat-strip`, `section-card`, `supplier-order-card`, `slide-panel`, image upload zone, checklist; all JS logic unchanged |
| `salebysale-admin-frontend/src/styles.css` | Same `:root` update and theme block as users-frontend; `.tag` global baseline differs (see Issues) |
| `salebysale-admin-frontend/src/pages/Buyer.jsx` | JSX restructured with `search-bar`, `product-card`, `section-card`, `order-row`; all JS logic unchanged |
| `salebysale-admin-frontend/src/pages/Supplier.jsx` | JSX restructured with `stat-strip`, `section-card`, `supplier-order-card`, `pill-tabs`; all JS logic unchanged |

</details>
