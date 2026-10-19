import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, inr } from "../api.js";
import { useCart } from "../CartContext.jsx";

export function BuyerSearch() {
  const [q, setQ] = useState("OPPO A58");
  const [skus, setSkus] = useState([]);
  const [filteredSkus, setFilteredSkus] = useState([]);
  const [offers, setOffers] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [offersLoading, setOffersLoading] = useState(false);
  const navigate = useNavigate();
  const { cart, addToCart, clearCart } = useCart();

  // Filters
  const [filterBrand, setFilterBrand] = useState("");
  const [filterRAM, setFilterRAM] = useState("");
  const [filterStorage, setFilterStorage] = useState("");
  const [filterColor, setFilterColor] = useState("");

  async function search(e) {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api(`/catalog/search?q=${encodeURIComponent(q)}`);
      setSkus(data.skus);
      setFilteredSkus(data.skus);
      setOffers(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function availability(skuId) {
    setError("");
    setOffersLoading(true);
    try {
      const data = await api(`/inventory/availability?sku_id=${skuId}`);
      setOffers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setOffersLoading(false);
    }
  }

  async function checkout() {
    if (cart.length === 0) return;
    setLoading(true);
    setError("");
    try {
      // For now, checkout first item in cart
      const item = cart[0];
      const created = await api("/orders", { method: "POST", body: { inventoryId: item.inventoryId, qty: item.qty } });
      const paid = await api(`/orders/${created.order._id}/confirm`, { method: "POST" });
      clearCart();
      navigate(`/app/orders/${paid.order._id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  // Client-side filtering
  useEffect(() => {
    let filtered = skus;
    if (filterBrand) {
      filtered = filtered.filter((s) => s.brand === filterBrand);
    }
    if (filterRAM) {
      filtered = filtered.filter((s) => s.variant && s.variant.includes(filterRAM));
    }
    if (filterStorage) {
      filtered = filtered.filter((s) => s.variant && s.variant.includes(filterStorage));
    }
    if (filterColor) {
      filtered = filtered.filter((s) => s.color === filterColor);
    }
    setFilteredSkus(filtered);
  }, [filterBrand, filterRAM, filterStorage, filterColor, skus]);

  useEffect(() => {
    search();
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error) return <div className='alert'>{error}</div>;

  // Extract unique filter values
  const brands = [...new Set(skus.map((s) => s.brand))];
  const rams = [...new Set(skus.map((s) => s.variant).filter(Boolean).flatMap((v) => v.match(/\d+GB/g) || []))];
  const storages = [...new Set(skus.map((s) => s.variant).filter(Boolean).flatMap((v) => v.match(/\d+GB|\d+TB/g) || []))];
  const colors = [...new Set(skus.map((s) => s.color))];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Model search</h2>
        {cart.length > 0 && (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span className="badge">{cart.length} item(s) in cart</span>
            <button className="btn small" onClick={checkout} disabled={loading}>
              {loading ? "Processing..." : "Checkout"}
            </button>
          </div>
        )}
      </div>
      <p className="muted">Sirf available, verified, sell-worthy listings. Supplier naam nahi dikhega.</p>
      {error && <div className="alert">{error}</div>}
      <form className="row" onSubmit={search} style={{ margin: "16px 0" }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Brand / model / color" style={{ flex: 1 }} />
        <button className="btn">Search</button>
      </form>

      {/* Filters */}
      {skus.length > 0 && (
        <div className="row" style={{ marginBottom: 16 }}>
          <select value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)}>
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <select value={filterRAM} onChange={(e) => setFilterRAM(e.target.value)}>
            <option value="">All RAM</option>
            {rams.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select value={filterStorage} onChange={(e) => setFilterStorage(e.target.value)}>
            <option value="">All Storage</option>
            {storages.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          <select value={filterColor} onChange={(e) => setFilterColor(e.target.value)}>
            <option value="">All Colors</option>
            {colors.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      )}

      {filteredSkus.length === 0 && skus.length > 0 && <p className='muted'>No products match selected filters.</p>}
      {skus.length === 0 && <p className='muted'>No products found. Try different search.</p>}

      <div className="grid cols-2">
        {filteredSkus.map((s) => (
          <button key={s._id} className="card" onClick={() => availability(s._id)} style={{ textAlign: "left" }}>
            <strong>
              {s.brand} {s.model}
            </strong>
            <div className="muted">
              {s.variant} · {s.color} · {s.warranty}
            </div>
          </button>
        ))}
      </div>
      {offers && (
        <div style={{ marginTop: 24 }}>
          <h3>
            {offers.sku.brand} {offers.sku.model} {offers.sku.color}
          </h3>
          {!offers.offers.length && <p className="muted">Is variant ka verified stock abhi nahi hai.</p>}
          <div className="grid">
            {offers.offers.map((o) => (
              <div className="card offer" key={o.inventoryId}>
                <div>
                  <div className="badge">{o.listingLabel}</div>
                  <h3 style={{ margin: "8px 0" }}>{inr(o.pricing.landedPrice)} landed</h3>
                  <div className="tiny">
                    ETA {o.eta.etaMin}–{o.eta.etaMax} min · {o.km} km · {o.availableQty} unit · ready {o.readyInMinutes} min
                  </div>
                  <div className="tiny">
                    Floor+margin {inr(o.pricing.supplierPayout)} · fee {inr(o.pricing.platformFee)} · delivery{" "}
                    {inr(o.pricing.deliveryCharge)}
                  </div>
                </div>
                <button className="btn" onClick={() => addToCart(o.inventoryId)}>
                  Add to cart
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function BuyerOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api("/orders")
      .then((d) => {
        setOrders(d.orders);
        setFilteredOrders(d.orders);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (statusFilter) {
      setFilteredOrders(orders.filter((o) => o.status === statusFilter));
    } else {
      setFilteredOrders(orders);
    }
  }, [statusFilter, orders]);

  const statuses = ["reserved", "awaiting_admin", "assigned", "picked", "delivered", "disputed", "cancelled"];

  if (loading) return <p>Loading…</p>;
  if (error) return <div className='alert'>{error}</div>;
  if (orders.length === 0) return <p className='muted'>No orders yet</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2>Orders</h2>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          {statuses.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>Listing</th>
            <th>Status</th>
            <th>Amount</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((o) => (
            <tr key={o._id}>
              <td>{o.items?.[0]?.listingLabel}</td>
              <td>
                <span className="badge">{o.status}</span>
              </td>
              <td>{inr(o.totals?.landedPrice)}</td>
              <td>
                <Link to={`/app/orders/${o._id}`}>Track</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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

  async function cancelOrder() {
    try {
      await api(`/orders/${id}/cancel`, { method: "POST", body: { reason: cancelReason } });
      setMsg("Order cancelled successfully");
      load();
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  // Calculate ETA countdown
  useEffect(() => {
    if (!order) return;
    if (order.status === "assigned" || order.status === "picked") {
      const etaMax = order.sla?.etaMax;
      if (etaMax && order.events) {
        const statusEvent = order.events.find((e) => e.name === order.status);
        if (statusEvent) {
          const elapsed = Math.floor((Date.now() - new Date(statusEvent.at)) / 60000);
          const remaining = etaMax - elapsed;
          setEtaRemaining(remaining > 0 ? remaining : 0);
        }
      }
    }
  }, [order]);

  if (loading) return <p>Loading…</p>;
  if (error) return <div className='alert'>{error}</div>;
  if (!order) return <p className='muted'>Order not found</p>;

  const sku = order.items?.[0]?.skuId;
  const canCancel = order.status === "reserved" || order.status === "awaiting_admin";

  return (
    <div className="grid cols-2">
      <div className="card">
        <div className="badge">{order.items?.[0]?.listingLabel}</div>
        <h2>
          {sku?.brand} {sku?.model} {sku?.color}
        </h2>
        <p className="muted">Supplier public identity hidden. Invoice/legal mapping admin-only.</p>
        <ul className="stat-list">
          <li>
            <span>Landed</span>
            <strong>{inr(order.totals?.landedPrice)}</strong>
          </li>
          <li>
            <span>ETA band</span>
            <strong>
              {order.sla?.etaMin}–{order.sla?.etaMax} min
            </strong>
          </li>
          <li>
            <span>Status</span>
            <strong>{order.status}</strong>
          </li>
          {etaRemaining !== null && (
            <li>
              <span>ETA remaining</span>
              <strong>{etaRemaining} min</strong>
            </li>
          )}
        </ul>
        {order.tracking?.deliveryOtp && (
          <div style={{ marginTop: 16 }}>
            <div className="tiny">Delivery OTP (share only with rider at drop)</div>
            <div className="otp">{order.tracking.deliveryOtp}</div>
          </div>
        )}
      </div>
      <div className="card">
        <h3>Events Timeline</h3>
        <div style={{ borderLeft: "2px solid var(--line)", paddingLeft: 16, marginLeft: 8 }}>
          {(order.events || []).map((e, i) => (
            <div key={i} style={{ position: "relative", marginBottom: 16 }}>
              <div
                style={{
                  position: "absolute",
                  left: -22,
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "var(--gold)",
                  border: "2px solid var(--bg)",
                }}
              />
              <div style={{ fontWeight: 600 }}>{e.name}</div>
              <div className="tiny">{new Date(e.at).toLocaleString()}</div>
            </div>
          ))}
        </div>

        {canCancel && (
          <div style={{ marginTop: 24 }}>
            <label>
              Cancel reason
              <input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Reason for cancellation" />
            </label>
            <button className="btn danger small" onClick={cancelOrder} style={{ marginTop: 8 }}>
              Cancel order
            </button>
          </div>
        )}

        <div style={{ marginTop: 24 }}>
          <label>
            Dispute
            <input value={reason} onChange={(e) => setReason(e.target.value)} />
          </label>
          <button
            className="btn danger small"
            onClick={async () => {
              await api(`/orders/${id}/dispute`, { method: "POST", body: { reason } });
              setMsg("Dispute opened");
              load();
            }}
            style={{ marginTop: 8 }}
          >
            Open dispute
          </button>
        </div>
        {msg && <div className={msg.startsWith("Error") ? "alert" : "ok"} style={{ marginTop: 12 }}>{msg}</div>}
      </div>
    </div>
  );
}
