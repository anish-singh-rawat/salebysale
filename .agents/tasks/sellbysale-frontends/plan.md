# Implementation Plan: SELL BY SELL Frontend Applications

## Executive Summary

Complete two React (Vite) frontend applications for SELL BY SELL, a hyperlocal B2B mobile marketplace. The backend at http://localhost:5050 is read-only. Both frontends share identical code structure (auth.jsx, api.js, styles.css) but serve different user groups:

- **salebysale-users-frontend** (port 5173): Multi-role app for Buyers (retailers), Suppliers (wholesalers), Riders
- **salebysale-admin-frontend** (port 5174 recommended): Admin/owner console only

**CRITICAL PRIVACY REQUIREMENT**: Buyers MUST NEVER see supplier names/identities. Only "SELL BY SELL verified stock" listings with model details, landed price, ETA, and quantity. Supplier anonymity enforced at all costs in buyer-facing UI.

---

## API Contract Reference

### Confirmed Backend Endpoints (from /Users/mac/freeLancing/salebysale/salebysale-backend/routes)

| Page/Feature | Endpoint | Method | Request Body | Response Fields | Privacy Notes |
|--------------|----------|--------|--------------|-----------------|---------------|
| **Auth & Registration** |
| Login | `/auth/login` | POST | `{ email, password, app: "users"/"admin" }` | `{ token, user, business }` | app="users" blocks admin/rider; app="admin" blocks buyer/supplier |
| Register | `/auth/register` | POST | `{ name, email, phone, password, role, shopName, gst, address, area, lat, lng }` | `{ token, user }` | Creates Business for supplier/buyer |
| Me | `/auth/me` | GET | - | `{ user, business }` | Current session |
| **Buyer (Retailer)** |
| Search catalog | `/catalog/search?q=<query>` | GET | - | `{ skus: [{_id, brand, model, variant, color, ram, storage, warranty}] }` | NO supplier data |
| Check availability | `/inventory/availability?sku_id=<id>` | GET | - | `{ sku, offers: [{ inventoryId, listingLabel: "SELL BY SELL verified stock", pricing: {landedPrice, deliveryCharge, tax}, availableQty, eta: {etaMin, etaMax}, returnPolicy }] }` | **listingLabel hides supplier identity** |
| Create order | `/orders` | POST | `{ inventoryId, qty: 1 }` | `{ order: sanitized (no supplierId) }` | order.items[].listingLabel = "SELL BY SELL verified stock" |
| Confirm payment | `/orders/:id/confirm` | POST | - | `{ order }` | Status → awaiting_admin; triggers admin request queue |
| List my orders | `/orders` | GET | - | `{ orders: [sanitized] }` | NO supplier names |
| Order detail | `/orders/:id` | GET | - | `{ order: {items, totals, sla, tracking: {deliveryOtp, status, eta}, events} }` | tracking.deliveryOtp for rider verification |
| Dispute order | `/orders/:id/dispute` | POST | `{ reason }` | `{ dispute }` | Opens dispute |
| **Supplier (Wholesaler)** |
| List inventory | `/supplier/inventory` | GET | - | `{ inventory: [{_id, skuId, availableQty, reservedQty, minimumPrice, readyInMinutes, status, lastVerifiedAt}] }` | Own inventory only |
| Upsert stock | `/supplier/inventory` | POST | `{ skuId, availableQty, minimumPrice, readyInMinutes, status }` | `{ inventory }` | Creates/updates with verification timestamp |
| Toggle stock | `/supplier/inventory/:id` | PATCH | `{ status, verify: true }` | `{ inventory }` | ON/OFF toggle |
| Bulk upload | `/supplier/inventory/bulk` | POST | `{ items: [{skuCode, availableQty, minimumPrice, readyInMinutes, status}] }` | `{ count, inventory }` | CSV processing |
| Incoming orders | `/supplier/orders` | GET | - | `{ orders: [full order with buyer masked] }` | Buyer contact NOT exposed |
| Accept order | `/supplier/orders/:id/accept` | POST | - | `{ order }` | 3-5 min deadline |
| Reject order | `/supplier/orders/:id/reject` | POST | `{ reason }` | `{ order }` | Releases reservation |
| Pack order (IMEI) | `/supplier/orders/:id/pack` | POST | `{ imei, serial }` | `{ order, message }` | **IMEI encrypted** before sending; status → packing |
| Settlements | `/supplier/settlements` | GET | - | `{ settlements: [{orderId, payout, platformFee, status}] }` | T+1 payouts |
| **Rider** |
| Toggle duty | `/riders/duty` | POST | `{ on: true/false, lat, lng, label }` | `{ dutyOn, location }` | Updates user.dutyOn |
| My shipments | `/shipments/mine` | GET | - | `{ shipments: [{_id, orderId, status, pickup: {lat, lng, address, shopName}, drop: {lat, lng, address, shopName}, demoPickupOtp, demoDeliveryOtp, timestamps}] }` | pickup/drop addresses visible |
| Confirm pickup | `/shipments/:id/pickup` | POST | `{ otp }` | `{ shipment }` | Verifies pickupOtp; status → picked |
| Confirm delivery | `/shipments/:id/deliver` | POST | `{ otp, photoUrl, notes }` | `{ shipment, orderId }` | Verifies deliveryOtp; triggers settlement; status → delivered → settled |
| Mark failed | `/shipments/:id/fail` | POST | `{ reason }` | `{ shipment }` | Status → failed |
| **Admin** |
| KPIs dashboard | `/admin/kpis` | GET | - | `{ kpis: {activeSuppliers, liveSkus, verifiedStockUnits, orders, orderFillRate, cancellationRate, gmv, platformFee, disputesOpen} }` | Live metrics |
| Supplier KYC list | `/admin/suppliers` | GET | - | `{ suppliers: [{_id, shopName, listingCode, role, kycStatus, area, ownerId}] }` | **Private identity mapping** |
| Buyer KYC list | `/admin/buyers` | GET | - | `{ buyers: [{_id, shopName, listingCode, role, kycStatus, area, ownerId}] }` | **Private identity mapping** |
| Verify business | `/businesses/verify` | POST | `{ businessId, status: "verified"/"rejected" }` | `{ business }` | Admin-only KYC |
| Reveal identity | `/admin/identity/:supplierId` | GET | - | `{ mapping: {listingCode, shopName, gst, address, owner, phone, email} }` | **Restricted admin-only** |
| All orders | `/admin/orders` | GET | - | `{ orders: [full with buyerId, supplierId names] }` | **Both identities visible** |
| **Admin requests (CORE FLOW)** | `/admin/requests` | GET | - | `{ requests: [{id, status, mobile, qty, totals, sla, retailer: {name, shopName, phone, area, address}, wholesaler: {shopName, listingCode, gst, area, address, phone}}] }` | **Orders awaiting_admin/reserved; exposes wholesaler + retailer** |
| **Arrange courier** | `/admin/orders/:id/arrange` | POST | `{ riderId }` | `{ order, shipment, wholesaler }` | **Admin assigns courier; status → assigned** |
| Live inventory (all) | `/admin/inventory` | GET | - | `{ inventory: [with supplierId.shopName] }` | **Supplier names visible** |
| Riders list | `/admin/riders` | GET | - | `{ riders: [{_id, name, dutyOn, status, location}] }` | Duty status |
| Auto-assign packing | `/admin/auto-assign` | POST | - | `{ assigned: count }` | Batch assign packing orders to on-duty riders |
| Assign rider | `/shipments/assign` | POST | `{ orderId, riderId }` | `{ shipment }` | Manual dispatch |
| Disputes | `/admin/disputes` | GET | - | `{ disputes: [{_id, orderId, raisedBy, reason, status}] }` | Audit trail |
| IMEI (restricted) | `/admin/imei/:orderId` | GET | - | `{ masked, imei, serial, scanEvents }` | **Decrypted IMEI; admin-only** |
| Audit logs | `/admin/audit` | GET | - | `{ logs }` | Last 200 events |
| Master catalog | `/admin/catalog` | GET | - | `{ skus }` | All SKUs |
| Create SKU | `/admin/catalog` | POST | `{ brand, model, variant, ram, storage, color, warranty, condition, skuCode }` | `{ sku }` | Admin adds SKUs |

---

## Privacy Enforcement Checklist

| Component | Rule | Enforcement Method |
|-----------|------|-------------------|
| **BuyerSearch** (/app/search) | NEVER show supplier name | Display `o.listingLabel` ("SELL BY SELL verified stock") only; no `supplierId` fields rendered |
| **BuyerOrders** (/app/orders) | NEVER show supplier name | Display `o.items[0].listingLabel` only |
| **BuyerOrder** (/app/orders/:id) | NEVER show supplier name | Display `order.items[0].listingLabel`; show "Supplier public identity hidden. Invoice/legal mapping admin-only." |
| **SupplierOrders** (/app/incoming) | NEVER show buyer contact | Display order totals, SKU; no `buyerId.phone` or `buyerId.email` rendered |
| **SupplierPayouts** (/app/payouts) | Order ID only | Display `orderId` (not buyer name) |
| **AdminOrders** (/app/admin-orders) | SHOW both identities | Render `o.buyerId.name` AND `o.supplierId.shopName` (admin privilege) |
| **AdminStock** (/app/admin-stock) | SHOW supplier names | Render `i.supplierId.shopName` for each inventory row |
| **Approvals** (/app/approvals) | SHOW private mapping | Render `business.shopName`, `business.gst`, owner name (admin privilege) |
| **Dispatch** (/app/dispatch) | SHOW supplier for routing | Render `o.supplierId.shopName` for pickup address context |

---

## Implementation Tasks (Ordered by Dependency)

### Phase 1: Fix Admin Frontend Port Conflict + Role Enforcement

**Current Issue**: Both frontends use port 5173; admin-frontend needs separate port and strict role guards.

- [ ] **1. Fix salebysale-admin-frontend vite.config.js port**
  - **What**: Change `server.port` from 5173 to 5174 in `/Users/mac/freeLancing/salebysale/salebysale-admin-frontend/vite.config.js` to avoid conflict with users-frontend.
  - **Files**: `/Users/mac/freeLancing/salebysale/salebysale-admin-frontend/vite.config.js`
  - **Verify**: Run `npm run dev` in admin-frontend; confirm it starts on http://localhost:5174 without error.

- [ ] **2. Add app parameter to Login.jsx in both frontends**
  - **What**: Modify Login.jsx in BOTH frontends to pass `app: "users"` (users-frontend) or `app: "admin"` (admin-frontend) in the `/auth/login` POST body. Backend enforces role segregation: users-frontend blocks admin/rider; admin-frontend blocks buyer/supplier.
  - **Files**: 
    - `/Users/mac/freeLancing/salebysale/salebysale-users-frontend/src/pages/Login.jsx` (add `app: "users"`)
    - `/Users/mac/freeLancing/salebysale/salebysale-admin-frontend/src/pages/Login.jsx` (add `app: "admin"`)
  - **Verify**: Attempt buyer login on admin-frontend → should fail with 403. Attempt admin login on users-frontend → should fail with 403.

- [ ] **3. Remove buyer/supplier/rider pages from admin-frontend**
  - **What**: Admin-frontend should NOT expose buyer/supplier/rider routes. Delete or stub out Buyer.jsx, Supplier.jsx imports in `/Users/mac/freeLancing/salebysale/salebysale-admin-frontend/src/App.jsx`; remove `/app/search`, `/app/orders`, `/app/stock`, `/app/incoming`, `/app/payouts`, `/app/rides` routes. Keep only admin routes: `/app/dashboard`, `/app/approvals`, `/app/admin-orders`, `/app/admin-stock`, `/app/dispatch`, `/app/disputes`.
  - **Files**: `/Users/mac/freeLancing/salebysale/salebysale-admin-frontend/src/App.jsx`
  - **Verify**: Navigate to http://localhost:5174/app/search → 404 or redirect.

---

### Phase 2: Buyer (Retailer) Features — Users Frontend

**Files**: `/Users/mac/freeLancing/salebysale/salebysale-users-frontend/src/pages/Buyer.jsx`

- [ ] **4. Extend BuyerSearch with filters (brand, RAM, storage, color)**
  - **What**: Add filter UI (dropdowns/checkboxes) above the search results grid. On filter change, re-call `/catalog/search?q=<query>` and client-side filter `skus` by selected brand, RAM, storage, color. Existing search works; add client-side filtering for UX (backend search is substring-based).
  - **Privacy**: Already enforced — `/catalog/search` returns only SKU data (no supplier). `/inventory/availability` returns `listingLabel: "SELL BY SELL verified stock"` (no supplier name).
  - **Verify**: Filter by brand → grid updates; select OPPO A58 → availability shows "SELL BY SELL verified stock" label, NO supplier name.

- [ ] **5. Add cart state + prepaid checkout to BuyerSearch**
  - **What**: Replace direct `buy(inventoryId)` with: (a) "Add to cart" button → stores `{inventoryId, qty: 1}` in React state; (b) cart badge in nav shows count; (c) "Checkout" button → calls `POST /orders { inventoryId, qty: 1 }` (reserved), then `POST /orders/:id/confirm` (payment authorized, status → awaiting_admin), then navigates to `/app/orders/:id`. Show loading spinner during API calls; show error alert on failure.
  - **Files**: `/Users/mac/freeLancing/salebysale/salebysale-users-frontend/src/pages/Buyer.jsx` (BuyerSearch component)
  - **Verify**: Add item to cart → badge shows "1"; click Checkout → loading spinner → redirects to order detail page with status "awaiting_admin".

- [ ] **6. Enhance BuyerOrders with filters (status, date range)**
  - **What**: Add status filter dropdown (all, reserved, awaiting_admin, assigned, picked, delivered, disputed, cancelled) above the table; filter `orders` array client-side. Optionally add date range picker (use native `<input type="date">`).
  - **Privacy**: Already enforced — `sanitizeOrder` in backend strips `supplierId`; only `listingLabel` shown.
  - **Files**: `/Users/mac/freeLancing/salebysale/salebysale-users-frontend/src/pages/Buyer.jsx` (BuyerOrders component)
  - **Verify**: Filter by "delivered" → table shows only delivered orders.

- [ ] **7. Enhance BuyerOrder detail with delivery tracking timeline**
  - **What**: Display `order.events` as a vertical timeline (CSS: left border + dots). Show `order.tracking.deliveryOtp` prominently (existing). Add "Cancel order" button (POST `/orders/:id/cancel { reason }`) for orders in "reserved" or "awaiting_admin" status. Show ETA countdown if status is "assigned" or "picked" (calculate from `order.sla.etaMax` - current time).
  - **Files**: `/Users/mac/freeLancing/salebysale/salebysale-users-frontend/src/pages/Buyer.jsx` (BuyerOrder component)
  - **Privacy**: Already enforced — "Supplier public identity hidden" message displayed.
  - **Verify**: Order detail page shows timeline with timestamps; Cancel button visible for reserved orders; deliveryOtp shown for assigned/picked orders.

---

### Phase 3: Supplier (Wholesaler) Features — Users Frontend

**Files**: `/Users/mac/freeLancing/salebysale/salebysale-users-frontend/src/pages/Supplier.jsx`

- [ ] **8. Add CSV bulk upload to SupplierStock**
  - **What**: Add file input `<input type="file" accept=".csv" />` below the form. On file select, parse CSV client-side (use FileReader + split/map; expect columns: skuCode, availableQty, minimumPrice, readyInMinutes, status). Call `POST /supplier/inventory/bulk { items: [...] }`. Show success message with count; reload inventory list.
  - **Files**: `/Users/mac/freeLancing/salebysale/salebysale-users-frontend/src/pages/Supplier.jsx` (SupplierStock component)
  - **Verify**: Upload CSV with 3 SKUs → success message "3 items uploaded"; table refreshes with new stock.

- [ ] **9. Add SKU mapping helper to SupplierStock**
  - **What**: Add a modal/expandable section that displays the full SKU catalog (GET `/catalog/search?q=`) with skuCode, brand, model, variant, color. Supplier can search/filter to find the correct skuId to use in the stock form. Clicking a SKU auto-fills the form's skuId dropdown.
  - **Files**: `/Users/mac/freeLancing/salebysale/salebysale-users-frontend/src/pages/Supplier.jsx` (SupplierStock component)
  - **Verify**: Click "Browse SKUs" → modal shows catalog; click a SKU → form's skuId dropdown updates.

- [ ] **10. Add countdown timer + photo upload to SupplierOrders**
  - **What**: For orders with status "reserved" or "awaiting_accept", display countdown from `order.acceptDeadline` (backend sets 5 min). Use `setInterval` to update every second; show "2m 34s remaining". For "accepted" or "paid" orders, add photo upload field (use `<input type="file" accept="image/*">`; convert to base64 or upload to a temp storage URL if available; for MVP, send `photoUrl: "data:image/...base64..."` in `/supplier/orders/:id/pack { imei, serial, photoUrl }`). Show preview of uploaded photo.
  - **Files**: `/Users/mac/freeLancing/salebysale/salebysale-users-frontend/src/pages/Supplier.jsx` (SupplierOrders component)
  - **Security**: Encrypt IMEI before sending — use browser crypto: `await crypto.subtle.encrypt(...)` OR send plaintext and rely on backend encryption (backend already encrypts via `encryptSecret`). For simplicity, send plaintext IMEI; backend handles encryption.
  - **Verify**: Order countdown shows "4m 59s"; Accept → countdown stops; enter IMEI + upload photo → Pack button → order status "packing".

- [ ] **11. Add packing checklist to SupplierOrders**
  - **What**: When order status is "accepted" or "paid", show checklist above the IMEI input: [ ] Sealed box verified, [ ] IMEI/serial label scanned, [ ] No tampering signs. Use `<input type="checkbox">`. Require all checked before enabling "Seal & pack" button.
  - **Files**: `/Users/mac/freeLancing/salebysale/salebysale-users-frontend/src/pages/Supplier.jsx` (SupplierOrders component)
  - **Verify**: Checkboxes unchecked → Pack button disabled; check all → Pack button enabled.

- [ ] **12. Enhance SupplierPayouts with commission breakdown**
  - **What**: Add columns to the table: `Landed Price`, `Platform Fee`, `Delivery Charge`, `Net Payout`. Fetch from `/supplier/settlements`; display `inr(r.payout)`, `inr(r.platformFee)`, `inr(r.deliveryCharge || 0)`. Add filter by status (eligible, paid, pending).
  - **Files**: `/Users/mac/freeLancing/salebysale/salebysale-users-frontend/src/pages/Supplier.jsx` (SupplierPayouts component)
  - **Verify**: Table shows 4 columns; filter by "eligible" → only eligible settlements visible.

---

### Phase 4: Rider Features — Users Frontend

**Files**: `/Users/mac/freeLancing/salebysale/salebysale-users-frontend/src/pages/Rider.jsx`

- [ ] **13. Add map navigation placeholder + earnings tracker to Rider**
  - **What**: For each shipment with status "assigned", show pickup address + "Open in Maps" link (`<a href={"https://www.google.com/maps?q=" + encodeURIComponent(s.pickup.address)} target="_blank">`). Add earnings section: fetch `/shipments/mine`, filter by status "delivered", calculate total (assume ₹50 per delivery; backend doesn't expose rider earnings in pilot, so hardcode or add a `riderFee` field to shipment response if backend supports it). Display total earnings + count.
  - **Files**: `/Users/mac/freeLancing/salebysale/salebysale-users-frontend/src/pages/Rider.jsx`
  - **Verify**: Assigned shipment shows "Open in Maps" link; earnings section shows "5 deliveries · ₹250 earned" (demo).

- [ ] **14. Add photo proof upload to Rider delivery**
  - **What**: For shipments with status "picked", add `<input type="file" accept="image/*">` above the "Confirm delivery" button. Convert to base64 or send URL. Pass `photoUrl` in `POST /shipments/:id/deliver { otp, photoUrl, notes }`. Show preview of uploaded photo. Require photo before enabling delivery button (or make optional with warning).
  - **Files**: `/Users/mac/freeLancing/salebysale/salebysale-users-frontend/src/pages/Rider.jsx`
  - **Verify**: Picked shipment → upload photo → preview shown; enter delivery OTP → Confirm delivery → shipment status "delivered".

- [ ] **15. Add failed delivery flow to Rider**
  - **What**: For shipments with status "picked", add "Mark failed" button. On click, show dropdown with reasons (Customer unavailable, Wrong address, Damaged box, Other). Call `POST /shipments/:id/fail { reason }`. Show confirmation message.
  - **Files**: `/Users/mac/freeLancing/salebysale/salebysale-users-frontend/src/pages/Rider.jsx`
  - **Verify**: Click "Mark failed" → select reason → shipment status "failed"; order status "disputed".

---

### Phase 5: Admin Features — Admin Frontend (CRITICAL PRIVACY REVERSAL)

**Context**: Admin sees EVERYTHING — supplier names, buyer names, IMEI, GST, addresses. This is the private identity layer.

**Files**: `/Users/mac/freeLancing/salebysale/salebysale-admin-frontend/src/pages/Admin.jsx`

- [ ] **16. Enhance Dashboard with real-time refresh + SLA monitoring**
  - **What**: Dashboard already calls `/admin/kpis`. Add auto-refresh every 30 seconds (`setInterval`). Add SLA monitoring card: fetch `/admin/orders`, filter by status "assigned" or "picked", calculate how many are past ETA (`order.sla.etaMax`); show "3 orders past ETA" in red badge.
  - **Files**: `/Users/mac/freeLancing/salebysale/salebysale-admin-frontend/src/pages/Admin.jsx` (Dashboard component)
  - **Verify**: Dashboard updates every 30s; SLA card shows overdue orders.

- [ ] **17. Enhance Approvals with GST verification notes + private identity reveal**
  - **What**: Already shows "Reveal identity" button → calls `/admin/identity/:supplierId`. Add notes textarea to verify/reject action: `<textarea placeholder="Verification notes">`. Pass notes in `POST /businesses/verify { businessId, status, notes }` (backend may need minor update to accept notes; if not supported, store client-side or skip). Display GST number, address, owner phone in the reveal modal.
  - **Privacy**: ADMIN SEES ALL — this is the authorized private identity layer.
  - **Files**: `/Users/mac/freeLancing/salebysale/salebysale-admin-frontend/src/pages/Admin.jsx` (Approvals component)
  - **Verify**: Click "Reveal identity" → modal shows shopName, GST, owner phone, address; Verify button accepts notes.

- [ ] **18. CORE FEATURE: Add admin order arrangement flow to AdminOrders (GET /admin/requests → POST /admin/orders/:id/arrange)**
  - **What**: This is THE key admin workflow: retailer orders → request arrives at admin → admin sees wholesaler name → admin arranges courier. 
    - (a) Add new tab/section in AdminOrders: "Pending Arrangement" (fetch `GET /admin/requests` — orders with status "awaiting_admin" or "reserved", exposes `wholesaler: {shopName, gst, area, address, phone}` and `retailer: {name, shopName, phone, area, address}`).
    - (b) Display table: Retailer | Wholesaler | Mobile | Qty | Landed Price | ETA | Actions.
    - (c) "Arrange Courier" button → opens modal with rider dropdown (fetch `/admin/riders`, filter by `dutyOn: true`). Select rider → call `POST /admin/orders/:id/arrange { riderId }` → order status → "assigned", shipment created.
    - (d) Show success message: "Courier <rider.name> assigned to pick up from <wholesaler.shopName>".
  - **Privacy**: ADMIN SEES BOTH — wholesaler.shopName AND retailer.name visible in this UI only.
  - **Files**: `/Users/mac/freeLancing/salebysale/salebysale-admin-frontend/src/pages/Admin.jsx` (AdminOrders component)
  - **Verify**: Pending Arrangement tab shows requests with wholesaler + retailer names; Arrange Courier → select rider → request disappears from pending, appears in All Orders with status "assigned".

- [ ] **19. Enhance AdminOrders with order orchestration controls (cancel, refund)**
  - **What**: Add action column to All Orders table: Cancel button (POST `/orders/:id/cancel { reason }` with admin auth), Refund button (placeholder — backend refund workflow not fully implemented in pilot; show alert "Refund workflow TBD"). Add order status filter (all, awaiting_admin, assigned, picked, delivered, disputed, cancelled).
  - **Files**: `/Users/mac/freeLancing/salebysale/salebysale-admin-frontend/src/pages/Admin.jsx` (AdminOrders component)
  - **Verify**: Click Cancel on awaiting_admin order → order status "cancelled"; filter by "delivered" → only delivered orders shown.

- [ ] **20. Enhance AdminStock with IMEI tracking modal**
  - **What**: AdminStock already shows supplier names. Add "View IMEI" button for each inventory row (enabled only if an order exists for that inventoryId). On click, fetch the orderId linked to that inventory, then call `GET /admin/imei/:orderId` → show modal with `{ masked, imei, serial, scanEvents }`. Display scan events timeline (supplier packed, rider picked).
  - **Privacy**: IMEI is decrypted admin-only access; restricted to admin role.
  - **Files**: `/Users/mac/freeLancing/salebysale/salebysale-admin-frontend/src/pages/Admin.jsx` (AdminStock component)
  - **Verify**: Click "View IMEI" → modal shows masked IMEI, full IMEI (admin-only), serial, scan events.

- [ ] **21. Add stock verification prompts to AdminStock**
  - **What**: Fetch inventory, check `lastVerifiedAt` timestamp. If > 4 hours ago, show yellow "Stale" badge. Add "Request verification" button → calls `PATCH /supplier/inventory/:id { verify: true }` (sends notification to supplier to re-verify stock; backend may need webhook/notification system; for MVP, just update `lastVerifiedAt` and show "Verification requested" message).
  - **Files**: `/Users/mac/freeLancing/salebysale/salebysale-admin-frontend/src/pages/Admin.jsx` (AdminStock component)
  - **Verify**: Stale inventory shows yellow badge; Request verification → badge clears, lastVerifiedAt updates.

- [ ] **22. Enhance Dispatch with matching engine simulation (distance/price/rider availability)**
  - **What**: Dispatch already has manual assign + auto-assign. Add "Simulate match" section: for each pending order (status "packing"), calculate distance from supplier to buyer (use haversine formula with lat/lng from order.supplierId.location and order.buyerId.location; or display raw lat/lng). Show recommended rider based on: (a) dutyOn: true, (b) closest to supplier pickup, (c) reliability score (hardcode or use user.reliability if backend supports). Display match score (0-100) next to each rider in dropdown.
  - **Files**: `/Users/mac/freeLancing/salebysale/salebysale-admin-frontend/src/pages/Admin.jsx` (Dispatch component)
  - **Verify**: Packing order shows "Recommended: Rider A (score 85, 2.3 km)"; manual assign overrides recommendation.

- [ ] **23. Enhance Disputes with resolution workflow**
  - **What**: Disputes component fetches `/admin/disputes`. Add action buttons per dispute: "Approve refund" (updates dispute status to "refund_approved"; backend may need endpoint), "Reject" (status → "rejected"), "Escalate" (status → "escalated"). Add notes textarea for each action. Filter by status (open, refund_approved, rejected, escalated).
  - **Files**: `/Users/mac/freeLancing/salebysale/salebysale-admin-frontend/src/pages/Admin.jsx` (Disputes component)
  - **Verify**: Dispute shows buttons; Approve refund → status "refund_approved"; filter by "open" → only open disputes shown.

---

### Phase 6: Mobile Responsiveness + Loading/Error States (Cross-Cutting)

- [ ] **24. Add loading spinners + error alerts to all async pages**
  - **What**: Every component that calls `api(...)` must: (a) show loading spinner (`<p>Loading…</p>` or CSS spinner) while `loading === true`; (b) catch errors and display `<div className="alert">{error.message}</div>`; (c) handle empty states (e.g., "No orders yet" when `orders.length === 0`). Pattern: `const [data, setData] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); useEffect(() => { setLoading(true); api(...).then(d => setData(d)).catch(e => setError(e.message)).finally(() => setLoading(false)); }, []);`
  - **Files**: ALL page components in both frontends (Buyer.jsx, Supplier.jsx, Rider.jsx, Admin.jsx, Login.jsx, Register.jsx)
  - **Verify**: Simulate network delay (Chrome DevTools throttling) → loading spinner shows; simulate 500 error (backend down) → error alert shows; empty orders list → "No orders yet" message.

- [ ] **25. Add mobile-responsive CSS breakpoints for buyer/rider flows**
  - **What**: Existing `styles.css` has `@media (max-width: 900px)` for grid collapse. Add Android-first optimizations: (a) larger tap targets for buttons (min 44x44px on mobile); (b) stack offer cards vertically on mobile (`.offer { grid-template-columns: 1fr; }` already in CSS); (c) sticky bottom action bar for checkout/payment buttons on mobile (use `position: sticky; bottom: 0;`); (d) collapse filters into expandable accordion on mobile.
  - **Files**: `/Users/mac/freeLancing/salebysale/salebysale-users-frontend/src/styles.css`, `/Users/mac/freeLancing/salebysale/salebysale-admin-frontend/src/styles.css` (if changes needed)
  - **Verify**: Open buyer search on mobile viewport (390px width) → filters collapsible, cards stacked, checkout button sticky at bottom.

---

### Phase 7: Build Verification + Final Integration Test

- [ ] **26. Build both frontends and verify no errors**
  - **What**: Run `npm run build` in `/Users/mac/freeLancing/salebysale/salebysale-users-frontend` and `/Users/mac/freeLancing/salebysale/salebysale-admin-frontend`. Both must complete without TypeScript/ESLint errors. Record output in commit message. No test framework exists; build success is the gate. If build fails, fix errors (likely unused imports, missing dependencies, or JSX syntax issues).
  - **Files**: Both frontend root directories
  - **Verify**: `npm run build` exits with code 0; `dist/` folder created in both apps.

- [ ] **27. End-to-end order journey verification**
  - **What**: Manual test of the complete flow:
    1. **Buyer (users-frontend)**: Register as buyer → search "OPPO A58" → check availability → verify "SELL BY SELL verified stock" label (NO supplier name) → add to cart → checkout → payment authorized → order status "awaiting_admin".
    2. **Admin (admin-frontend)**: Login as admin → navigate to AdminOrders "Pending Arrangement" tab → verify wholesaler name + retailer name visible → select on-duty rider → Arrange Courier → order status "assigned".
    3. **Supplier (users-frontend)**: Login as supplier → Incoming orders → Accept order → enter IMEI + upload photo → Pack → order status "packing" (then auto-assigned by admin flow, so status → "assigned").
    4. **Rider (users-frontend)**: Login as rider → Duty ON → see assigned shipment → enter pickup OTP → Confirm pickup → status "picked" → enter delivery OTP → Confirm delivery → status "delivered" → settlement eligible.
    5. **Buyer (users-frontend)**: Refresh order detail → status "delivered" → delivery OTP matches → no supplier name visible anywhere.
  - **Constraints**: DO NOT modify backend; use existing API exactly as documented.
  - **Verify**: Full journey completes; privacy enforced at every step (buyer NEVER sees supplier name); admin DOES see supplier name; IMEI encrypted in transit (backend handles encryption).

---

## Privacy Enforcement Summary (Non-Negotiable)

### Buyer-Facing UI (users-frontend, role: buyer)
- **NEVER** render `supplierId`, `supplierId.shopName`, `supplierId.gst`, `supplierId.address`, `supplierId.ownerId`.
- **ALWAYS** render `listingLabel: "SELL BY SELL verified stock"` instead of supplier identity.
- **SHOW**: model details, landed price, ETA, available quantity, return policy, delivery OTP (for rider verification).
- **Files enforcing**: `/Users/mac/freeLancing/salebysale/salebysale-users-frontend/src/pages/Buyer.jsx` (BuyerSearch, BuyerOrders, BuyerOrder components).

### Supplier-Facing UI (users-frontend, role: supplier)
- **NEVER** render `buyerId.email`, `buyerId.phone`, `buyerBusinessId.address` (buyer contact not needed for packing).
- **SHOW**: order totals, SKU, payout amount, pickup OTP (when rider assigned).
- **Files enforcing**: `/Users/mac/freeLancing/salebysale/salebysale-users-frontend/src/pages/Supplier.jsx` (SupplierOrders component).

### Admin-Facing UI (admin-frontend, role: admin)
- **SHOW EVERYTHING**: supplier names, buyer names, GST, addresses, phone numbers, IMEI (decrypted), settlement details.
- **Justification**: Admin orchestrates the marketplace; requires full identity mapping for logistics, KYC, disputes, invoicing.
- **Files**: `/Users/mac/freeLancing/salebysale/salebysale-admin-frontend/src/pages/Admin.jsx` (ALL admin components).

---

## Technical Constraints (Critical)

1. **DO NOT MODIFY BACKEND**: `/Users/mac/freeLancing/salebysale/salebysale-backend` is read-only. All backend route files are reference only.
2. **Keep frontends separate**: No cross-imports between `/Users/mac/freeLancing/salebysale/salebysale-users-frontend` and `/Users/mac/freeLancing/salebysale/salebysale-admin-frontend`.
3. **Use existing patterns**: `useAuth` (auth.jsx), `api()` + `inr` (api.js), styles.css classes, App.jsx route structure, Layout.jsx menus.
4. **No new UI libraries**: Use React + existing CSS only (no Material-UI, Ant Design, etc.) unless absolutely necessary.
5. **Mobile-first for buyer/rider**: Android viewport (390px) must be fully usable.
6. **Build verification gate**: Both apps must run `npm run build` without errors before marking complete.

---

## Verification Commands (Post-Implementation)

```bash
# Users frontend build
cd /Users/mac/freeLancing/salebysale/salebysale-users-frontend
npm run build
# Expected: dist/ folder created, exit code 0

# Admin frontend build
cd /Users/mac/freeLancing/salebysale/salebysale-admin-frontend
npm run build
# Expected: dist/ folder created, exit code 0

# Dev servers (separate terminals)
cd /Users/mac/freeLancing/salebysale/salebysale-users-frontend && npm run dev  # http://localhost:5173
cd /Users/mac/freeLancing/salebysale/salebysale-admin-frontend && npm run dev   # http://localhost:5174
cd /Users/mac/freeLancing/salebysale/salebysale-backend && npm start            # http://localhost:5050

# Manual E2E test (follow Phase 7, task 27)
```

---

## Deliverables Checklist

- [ ] Users-frontend: Buyer search with filters, cart, checkout, order tracking (NO supplier names)
- [ ] Users-frontend: Supplier stock management, bulk upload, incoming orders with IMEI packing, payouts
- [ ] Users-frontend: Rider duty toggle, pickup/delivery with OTP + photo, failed delivery, earnings
- [ ] Admin-frontend: Dashboard with KPIs + SLA monitoring
- [ ] Admin-frontend: Approvals with private identity reveal
- [ ] Admin-frontend: **CORE FLOW**: GET /admin/requests (exposes wholesaler name) → POST /admin/orders/:id/arrange (assigns courier)
- [ ] Admin-frontend: Order orchestration (cancel, refund placeholders)
- [ ] Admin-frontend: Live inventory with supplier names + IMEI tracking
- [ ] Admin-frontend: Dispatch with matching simulation
- [ ] Admin-frontend: Disputes with resolution workflow
- [ ] Loading/error states on all async pages
- [ ] Mobile-responsive (Android-first for buyer/rider)
- [ ] Both frontends build successfully (`npm run build` passes)
- [ ] Privacy enforced: buyer UI NEVER shows supplier names; admin UI DOES show supplier names

---

## Final Notes

- **Admin order arrangement flow** (task 18) is the centerpiece: retailer orders → admin sees wholesaler name → admin arranges courier. This is the reason admin-frontend exists.
- **Supplier anonymity** in buyer UI is the non-negotiable privacy rule. Verify by visual inspection: search "supplier" in Buyer.jsx — zero matches in rendered JSX.
- **IMEI encryption**: Supplier sends plaintext IMEI; backend encrypts via `encryptSecret` before storing. Admin can decrypt via `/admin/imei/:orderId`. Rider never sees IMEI.
- **No backend modifications**: If a feature seems to require a backend change (e.g., rider earnings tracking), either hardcode client-side (demo data) or note as "MVP limitation — backend support pending" and skip.

This plan is grounded in the actual codebase (explored auth.jsx, api.js, styles.css, all page components, all backend route files) and the exact backend API contracts. Follow it task by task; verify after each task.
