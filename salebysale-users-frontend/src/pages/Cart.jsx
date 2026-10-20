import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, inr } from "../api.js";
import { useCart } from "../CartContext.jsx";

export default function Cart() {
  const { cart, removeFromCart, updateQty, clearCart, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    if (cart.length === 0) return;
    setLoading(true);
    setError("");
    try {
      // Place + confirm orders sequentially (one per cart item)
      let lastOrderId = null;
      for (const item of cart) {
        const created = await api("/orders", {
          method: "POST",
          body: { inventoryId: item.inventoryId, qty: item.qty },
        });
        const paid = await api(`/orders/${created.order._id}/confirm`, { method: "POST" });
        lastOrderId = paid.order._id;
      }
      clearCart();
      navigate(`/app/orders/${lastOrderId}`);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }

  if (cart.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>🛒</div>
        <h2 style={{ marginBottom: 8 }}>Your cart is empty</h2>
        <p className="muted" style={{ marginBottom: 24 }}>Browse products and add them to your cart.</p>
        <Link to="/app/search" className="btn">Browse Products</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>🛒 Cart ({totalItems} item{totalItems !== 1 ? "s" : ""})</h2>
        <button
          className="btn ghost small"
          onClick={clearCart}
          style={{ color: "var(--danger)", borderColor: "var(--danger)" }}
        >
          Clear cart
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "flex-start" }}>
        {/* Items list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {cart.map((item) => (
            <div
              key={item.inventoryId}
              style={{
                display: "flex",
                gap: 16,
                padding: 16,
                background: "var(--card)",
                border: "1px solid var(--line)",
                borderRadius: 10,
                alignItems: "flex-start",
              }}
            >
              {/* Thumbnail */}
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 8,
                  overflow: "hidden",
                  flexShrink: 0,
                  background: "#f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                }}
              >
                {item.primaryImage ? (
                  <img
                    src={item.primaryImage}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  "📱"
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>
                  {item.brand} {item.model}
                </div>
                <div className="tiny" style={{ marginBottom: 8 }}>
                  {[item.variant, item.color].filter(Boolean).join(" · ")}
                </div>

                {/* Qty controls */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      border: "1px solid var(--line)",
                      borderRadius: 6,
                      overflow: "hidden",
                    }}
                  >
                    <button
                      onClick={() => updateQty(item.inventoryId, item.qty - 1)}
                      style={{
                        width: 30,
                        height: 30,
                        border: "none",
                        background: "var(--bg2)",
                        fontSize: 16,
                        cursor: "pointer",
                        color: "var(--text)",
                      }}
                    >
                      −
                    </button>
                    <span style={{ width: 36, textAlign: "center", fontWeight: 700, fontSize: 14 }}>
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.inventoryId, item.qty + 1)}
                      style={{
                        width: 30,
                        height: 30,
                        border: "none",
                        background: "var(--bg2)",
                        fontSize: 16,
                        cursor: "pointer",
                        color: "var(--text)",
                      }}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.inventoryId)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--danger)",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                      padding: 0,
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Price */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "var(--primary)" }}>
                  {inr(item.landedPrice * item.qty)}
                </div>
                {item.qty > 1 && (
                  <div className="tiny">{inr(item.landedPrice)} each</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div
          style={{
            position: "sticky",
            top: 80,
            padding: 20,
            background: "var(--card)",
            border: "1px solid var(--line)",
            borderRadius: 10,
          }}
        >
          <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>Order Summary</h3>

          <ul className="stat-list" style={{ marginBottom: 16 }}>
            <li>
              <span>Items ({totalItems})</span>
              <strong>{inr(totalPrice)}</strong>
            </li>
            <li>
              <span>Delivery</span>
              <strong style={{ color: "var(--success)" }}>Included</strong>
            </li>
            <li>
              <span>Total</span>
              <strong style={{ fontSize: 18, color: "var(--primary)" }}>{inr(totalPrice)}</strong>
            </li>
          </ul>

          {error && <div className="alert" style={{ marginBottom: 12 }}>{error}</div>}

          <button
            className="btn"
            onClick={handleCheckout}
            disabled={loading}
            style={{
              width: "100%",
              padding: 14,
              fontSize: 16,
              fontWeight: 700,
              background: "var(--warning)",
            }}
          >
            {loading ? "Placing orders…" : "⚡ Place Order"}
          </button>

          <Link
            to="/app/search"
            style={{
              display: "block",
              textAlign: "center",
              marginTop: 12,
              color: "var(--primary)",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            ← Continue Shopping
          </Link>

          {/* Trust */}
          <div
            style={{
              marginTop: 16,
              padding: "10px 0 0",
              borderTop: "1px solid var(--line)",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {["🔒 Secure verified transaction", "📋 GST invoice provided", "↩️ 48-hr DOA return policy"].map(
              (t) => (
                <div key={t} className="tiny" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {t}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
