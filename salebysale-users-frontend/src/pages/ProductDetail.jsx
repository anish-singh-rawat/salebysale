import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api, inr } from "../api.js";
import { useCart } from "../CartContext.jsx";
import ImageGallery from "../components/ImageGallery.jsx";

/* ─── helpers ─────────────────────────────────────────── */
function StatusDot({ on }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: on ? "var(--success)" : "#d1d5db",
        marginRight: 5,
      }}
    />
  );
}

function Tag({ children, color = "var(--primary-light)", text = "var(--primary)" }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: color,
        color: text,
      }}
    >
      {children}
    </span>
  );
}

function InfoRow({ label, value }) {
  return (
    <tr>
      <td
        style={{
          padding: "9px 0",
          color: "var(--muted)",
          fontSize: 14,
          width: "38%",
          borderBottom: "1px solid var(--line)",
          verticalAlign: "top",
        }}
      >
        {label}
      </td>
      <td
        style={{
          padding: "9px 0 9px 12px",
          fontSize: 14,
          fontWeight: 500,
          borderBottom: "1px solid var(--line)",
        }}
      >
        {value || "—"}
      </td>
    </tr>
  );
}

/* ─── OfferCard ────────────────────────────────────────── */
function OfferCard({ offer, selected, onSelect }) {
  return (
    <div
      onClick={onSelect}
      style={{
        border: `2px solid ${selected ? "var(--primary)" : "var(--line)"}`,
        borderRadius: 10,
        padding: "14px 16px",
        cursor: "pointer",
        background: selected ? "var(--primary-light)" : "var(--card)",
        transition: "all 0.15s",
        position: "relative",
      }}
    >
      {selected && (
        <span
          style={{
            position: "absolute",
            top: -10,
            right: 12,
            background: "var(--primary)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 999,
          }}
        >
          ✓ Selected
        </span>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "var(--primary)" }}>
            {inr(offer.pricing.landedPrice)}
          </div>
          <div className="tiny" style={{ marginTop: 3 }}>
            Delivery {inr(offer.pricing.deliveryCharge)} · Tax {inr(offer.pricing.tax ?? 0)}
          </div>
        </div>
        <Tag>{offer.availableQty} in stock</Tag>
      </div>
      <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Tag color="#f0fdf4" text="var(--success)">
          <StatusDot on />
          {offer.riderAvailable !== false ? "Rider available" : "Rider offline"}
        </Tag>
        <Tag color="#fff7ed" text="#c2410c">
          ⏱ ETA {offer.eta?.etaMin}–{offer.eta?.etaMax} min
        </Tag>
        <Tag color="#f5f3ff" text="#7c3aed">
          📦 Ready in {offer.readyInMinutes} min
        </Tag>
      </div>
      <div className="tiny" style={{ marginTop: 8 }}>
        {offer.returnPolicy}
      </div>
    </div>
  );
}

/* ─── main page ───────────────────────────────────────── */
export default function ProductDetail() {
  const { skuId } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart, totalItems } = useCart();

  const [sku, setSku] = useState(null);
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [offersLoading, setOffersLoading] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [addedMsg, setAddedMsg] = useState("");
  const [error, setError] = useState("");

  // load SKU + availability in parallel
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        // SKU from catalog search by id isn't a direct route, so we use availability
        // which returns sku + offers together
        setOffersLoading(true);
        const data = await api(`/inventory/availability?sku_id=${skuId}`);
        if (cancelled) return;
        setSku(data.sku);
        setOffers(data.offers || []);
        if (data.offers?.length) setSelectedOffer(data.offers[0]);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setOffersLoading(false);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [skuId]);

  // primary images come from selectedOffer; fallback to any offer
  const displayImages =
    selectedOffer?.images?.length
      ? selectedOffer.images
      : offers.flatMap((o) => o.images || []).slice(0, 5);
  const displayPrimary = selectedOffer?.primaryImage || offers[0]?.primaryImage || null;

  const inCartAlready = cart.some((c) => c.inventoryId === selectedOffer?.inventoryId);
  const maxQty = selectedOffer?.availableQty || 1;

  async function handleBuyNow() {
    if (!selectedOffer) return;
    setCheckingOut(true);
    setError("");
    try {
      const created = await api("/orders", {
        method: "POST",
        body: { inventoryId: selectedOffer.inventoryId, qty },
      });
      const paid = await api(`/orders/${created.order._id}/confirm`, { method: "POST" });
      navigate(`/app/orders/${paid.order._id}`);
    } catch (e) {
      setError(e.message);
      setCheckingOut(false);
    }
  }

  function handleAddToCart() {
    if (!selectedOffer) return;
    addToCart(selectedOffer.inventoryId, selectedOffer);
    setAddedMsg("Added to cart!");
    setTimeout(() => setAddedMsg(""), 2500);
  }

  /* ── loading / error states ── */
  if (loading) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center" }}>
        <div className="spinner" style={{ margin: "0 auto 16px" }} />
        <p className="muted">Loading product…</p>
      </div>
    );
  }

  if (error && !sku) {
    return (
      <div style={{ padding: "40px 0" }}>
        <div className="alert">{error}</div>
        <button className="btn ghost" style={{ marginTop: 12 }} onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="tiny" style={{ marginBottom: 16, display: "flex", gap: 6, alignItems: "center" }}>
        <Link to="/app/search" style={{ color: "var(--primary)" }}>Browse</Link>
        <span style={{ color: "var(--muted)" }}>›</span>
        <span>{sku?.brand}</span>
        <span style={{ color: "var(--muted)" }}>›</span>
        <span>{sku?.model}</span>
      </div>

      {/* Top layout: images + info */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(280px, 420px) 1fr",
          gap: 32,
          alignItems: "flex-start",
        }}
      >
        {/* ── LEFT: image gallery ── */}
        <div style={{ position: "sticky", top: 80 }}>
          <ImageGallery
            images={displayImages}
            primaryImage={displayPrimary}
            height={340}
            showThumbs={true}
          />
        </div>

        {/* ── RIGHT: product info + actions ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Title */}
          <div>
            <Tag>{sku?.condition === "new_sealed" ? "✦ Brand New Sealed" : sku?.condition}</Tag>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                margin: "10px 0 6px",
                lineHeight: 1.3,
                color: "var(--text)",
              }}
            >
              {sku?.brand} {sku?.model}
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 15, margin: 0 }}>
              {[sku?.variant, sku?.color, sku?.warranty].filter(Boolean).join(" · ")}
            </p>
          </div>

          {/* Price */}
          {selectedOffer ? (
            <div
              style={{
                padding: "16px 20px",
                background: "linear-gradient(135deg, #eff6ff, #fff)",
                border: "1px solid var(--primary-light)",
                borderRadius: 10,
              }}
            >
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>
                Landed price (incl. delivery + tax)
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: "var(--primary)", lineHeight: 1 }}>
                {inr(selectedOffer.pricing.landedPrice)}
              </div>
              <div className="tiny" style={{ marginTop: 6 }}>
                Supplier price {inr(selectedOffer.pricing.supplierPayout ?? 0)} + Delivery{" "}
                {inr(selectedOffer.pricing.deliveryCharge)} + Fee {inr(selectedOffer.pricing.platformFee ?? 0)}
              </div>
            </div>
          ) : (
            <div style={{ padding: "16px 20px", background: "#f9fafb", borderRadius: 10 }}>
              <p className="muted" style={{ margin: 0 }}>
                No verified stock available right now.
              </p>
            </div>
          )}

          {/* Qty selector */}
          {selectedOffer && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 14, color: "var(--muted)" }}>Quantity:</span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid var(--line)",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  style={{
                    width: 36,
                    height: 36,
                    border: "none",
                    background: "var(--bg2)",
                    fontSize: 18,
                    fontWeight: 700,
                    cursor: "pointer",
                    color: "var(--text)",
                  }}
                >
                  −
                </button>
                <span
                  style={{
                    width: 44,
                    textAlign: "center",
                    fontWeight: 700,
                    fontSize: 16,
                    color: "var(--text)",
                  }}
                >
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  style={{
                    width: 36,
                    height: 36,
                    border: "none",
                    background: "var(--bg2)",
                    fontSize: 18,
                    fontWeight: 700,
                    cursor: "pointer",
                    color: "var(--text)",
                  }}
                >
                  +
                </button>
              </div>
              <span className="tiny">{maxQty} available</span>
            </div>
          )}

          {/* CTA buttons */}
          {selectedOffer && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {error && <div className="alert">{error}</div>}
              {addedMsg && (
                <div className="ok" style={{ textAlign: "center", fontWeight: 600 }}>
                  🛒 {addedMsg}
                </div>
              )}

              <button
                className="btn"
                onClick={handleBuyNow}
                disabled={checkingOut}
                style={{
                  fontSize: 16,
                  padding: "14px",
                  background: "var(--warning)",
                  fontWeight: 700,
                  letterSpacing: 0.3,
                }}
              >
                {checkingOut ? "Placing order…" : "⚡ Buy Now"}
              </button>

              <button
                className="btn ghost"
                onClick={handleAddToCart}
                disabled={inCartAlready}
                style={{ fontSize: 16, padding: "14px", fontWeight: 700 }}
              >
                {inCartAlready ? "✓ In Cart" : "🛒 Add to Cart"}
              </button>

              {totalItems > 0 && (
                <button
                  className="btn ghost small"
                  onClick={() => navigate("/app/cart")}
                  style={{ textAlign: "center", color: "var(--primary)" }}
                >
                  View Cart ({totalItems} item{totalItems !== 1 ? "s" : ""}) →
                </button>
              )}
            </div>
          )}

          {/* Trust badges */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginTop: 4,
            }}
          >
            {[
              ["🔒", "Verified Stock", "Supplier identity protected"],
              ["↩️", "DOA Policy", "48-hr sealed-box return"],
              ["🚴", "Fast Delivery", `ETA ${selectedOffer?.eta?.etaMin ?? "—"}–${selectedOffer?.eta?.etaMax ?? "—"} min`],
              ["📋", "Invoice Ready", "GST invoice on delivery"],
            ].map(([icon, title, sub]) => (
              <div
                key={title}
                style={{
                  padding: "10px 12px",
                  border: "1px solid var(--line)",
                  borderRadius: 8,
                  background: "var(--bg2)",
                }}
              >
                <div style={{ fontSize: 18, marginBottom: 3 }}>{icon}</div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{title}</div>
                <div className="tiny">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Offers section ── */}
      {offers.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h2 style={{ marginBottom: 16, fontSize: 18 }}>
            📦 Available Offers ({offers.length})
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 14,
            }}
          >
            {offers.map((o) => (
              <OfferCard
                key={o.inventoryId}
                offer={o}
                selected={selectedOffer?.inventoryId === o.inventoryId}
                onSelect={() => {
                  setSelectedOffer(o);
                  setQty(1);
                  setError("");
                  setAddedMsg("");
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Specs table ── */}
      <div style={{ marginTop: 40 }}>
        <h2 style={{ marginBottom: 16, fontSize: 18 }}>📱 Specifications</h2>
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--line)",
            borderRadius: 10,
            overflow: "hidden",
            padding: "0 20px",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <InfoRow label="Brand" value={sku?.brand} />
              <InfoRow label="Model" value={sku?.model} />
              <InfoRow label="Variant" value={sku?.variant} />
              <InfoRow label="RAM" value={sku?.ram} />
              <InfoRow label="Storage" value={sku?.storage} />
              <InfoRow label="Color" value={sku?.color} />
              <InfoRow label="Warranty" value={sku?.warranty} />
              <InfoRow label="Condition" value={sku?.condition === "new_sealed" ? "New (Sealed Box)" : sku?.condition} />
              <InfoRow label="Region" value={sku?.region} />
              <InfoRow label="SKU Code" value={sku?.skuCode} />
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Policy section ── */}
      <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div
          style={{
            padding: 20,
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 10,
          }}
        >
          <h3 style={{ margin: "0 0 10px", fontSize: 15, color: "#166534" }}>↩️ Return Policy</h3>
          <p style={{ margin: 0, fontSize: 14, color: "#166534" }}>
            Dead-on-arrival or wrong IMEI can be returned within 48 hours with original sealed box intact.
            Admin verifies and initiates refund.
          </p>
        </div>
        <div
          style={{
            padding: 20,
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: 10,
          }}
        >
          <h3 style={{ margin: "0 0 10px", fontSize: 15, color: "var(--primary-dark)" }}>🔒 Privacy Policy</h3>
          <p style={{ margin: 0, fontSize: 14, color: "var(--primary-dark)" }}>
            Supplier identity is never revealed to buyers. All transactions are logged and audited.
            Your data is only used to facilitate delivery.
          </p>
        </div>
      </div>

      <div style={{ marginTop: 32, textAlign: "center" }}>
        <button className="btn ghost" onClick={() => navigate("/app/search")}>
          ← Back to Browse
        </button>
      </div>
    </div>
  );
}
