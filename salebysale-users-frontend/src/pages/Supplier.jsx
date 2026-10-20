import { useEffect, useState } from "react";
import { api, inr } from "../api.js";
import ImageGallery from "../components/ImageGallery.jsx";

/* ─── Shared helpers ────────────────────────────────────── */

const STATUS_CLASS = {
  delivered: "status-delivered",
  reserved: "status-reserved",
  awaiting_admin: "status-awaiting_admin",
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

function LoadingScreen({ text = "Loading…" }) {
  return (
    <div style={{ padding: "60px 0", textAlign: "center" }}>
      <div className="spinner" style={{ margin: "0 auto 14px" }} />
      <p className="muted">{text}</p>
    </div>
  );
}

/* ─── SupplierStock ─────────────────────────────────────── */
export function SupplierStock() {
  const [inventory, setInventory] = useState([]);

  const [newProduct, setNewProduct] = useState({
    brand: "",
    model: "",
    variant: "",
    ram: "",
    storage: "",
    color: "",
    warranty: "Brand 1 Year",
    availableQty: 1,
    minimumPrice: 10000,
    readyInMinutes: 30,
    status: "ON",
  });

  const [images, setImages] = useState([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await api("/supplier/inventory");
      setInventory(data.inventory);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function saveProduct(e) {
    e.preventDefault();

    if (!newProduct.brand || !newProduct.model || !newProduct.color) {
      setError("Please fill in Brand, Model, and Color fields");
      return;
    }

    setUploading(true);
    setMsg("");
    setError("");

    try {
      const skuCode = `${newProduct.brand}-${newProduct.model}-${newProduct.variant || "BASE"}-${newProduct.color}`
        .replace(/\s+/g, "-").toUpperCase();

      const skuData = {
        skuCode,
        brand: newProduct.brand,
        model: newProduct.model,
        variant: newProduct.variant || `${newProduct.ram || ""}/${newProduct.storage || ""}`.trim() || "Standard",
        ram: newProduct.ram,
        storage: newProduct.storage,
        color: newProduct.color,
        warranty: newProduct.warranty,
        condition: "new_sealed",
        region: "India",
      };

      const skuRes = await api("/catalog", { method: "POST", body: skuData });
      const sku = skuRes.sku;

      const inventoryBody = {
        skuId: sku._id,
        availableQty: newProduct.availableQty,
        minimumPrice: newProduct.minimumPrice,
        readyInMinutes: newProduct.readyInMinutes,
        status: newProduct.status,
        images,
        primaryImage: images[primaryImageIndex] || null,
      };

      await api("/supplier/inventory", { method: "POST", body: inventoryBody });

      setMsg("✅ Product added to your inventory successfully!");
      setNewProduct({
        brand: "", model: "", variant: "", ram: "", storage: "", color: "",
        warranty: "Brand 1 Year", availableQty: 1, minimumPrice: 10000,
        readyInMinutes: 30, status: "ON",
      });
      setImages([]);
      setPrimaryImageIndex(0);
      setShowAddForm(false);
      load();
    } catch (e) {
      setError(e.message || "Failed to add product");
    } finally {
      setUploading(false);
    }
  }

  function handleImageUpload(e) {
    const files = Array.from(e.target.files).slice(0, 5 - images.length);

    if (images.length + files.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }

    files.forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        setError(`${file.name} exceeds 2MB limit`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages((prev) => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  }

  function removeImage(idx) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    if (primaryImageIndex === idx) setPrimaryImageIndex(0);
    if (primaryImageIndex > idx) setPrimaryImageIndex(primaryImageIndex - 1);
  }

  if (loading) return <LoadingScreen text="Loading your inventory…" />;

  return (
    <div className="fade-in">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h2>My Inventory</h2>
          <p className="muted">Add mobile phones. Buyers see products — your identity stays private.</p>
        </div>
        <button
          className="btn"
          onClick={() => { setShowAddForm(!showAddForm); setError(""); setMsg(""); }}
        >
          {showAddForm ? "✕ Cancel" : "+ Add Product"}
        </button>
      </div>

      {/* Inline feedback */}
      {msg   && <div className="inline-success" style={{ marginBottom: 14 }}>{msg}</div>}
      {error && <div className="inline-error"   style={{ marginBottom: 14 }}>{error}</div>}

      {/* Add product form */}
      {showAddForm && (
        <div className="section-card" style={{ marginBottom: 24, borderColor: "var(--primary)", borderWidth: 2 }}>
          <div className="section-card-header" style={{ background: "var(--primary-light)" }}>
            <h3 style={{ color: "var(--primary)" }}>➕ Add New Mobile Phone</h3>
          </div>
          <div className="section-card-body">
            <form onSubmit={saveProduct}>

              {/* Section 1: Phone details */}
              <div className="form-section">
                <div className="form-section-title"><span>📱</span> Mobile Phone Details</div>
                <div className="grid cols-2" style={{ gap: 14 }}>
                  <label>Brand <span style={{ color: "var(--danger)" }}>*</span>
                    <input type="text" value={newProduct.brand}
                      onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                      placeholder="e.g. Apple, Samsung, OnePlus" required />
                  </label>
                  <label>Model <span style={{ color: "var(--danger)" }}>*</span>
                    <input type="text" value={newProduct.model}
                      onChange={(e) => setNewProduct({ ...newProduct, model: e.target.value })}
                      placeholder="e.g. iPhone 15 Pro, Galaxy S24" required />
                  </label>
                  <label>RAM
                    <input type="text" value={newProduct.ram}
                      onChange={(e) => setNewProduct({ ...newProduct, ram: e.target.value })}
                      placeholder="e.g. 8GB, 12GB" />
                  </label>
                  <label>Storage
                    <input type="text" value={newProduct.storage}
                      onChange={(e) => setNewProduct({ ...newProduct, storage: e.target.value })}
                      placeholder="e.g. 128GB, 256GB" />
                  </label>
                  <label>Color <span style={{ color: "var(--danger)" }}>*</span>
                    <input type="text" value={newProduct.color}
                      onChange={(e) => setNewProduct({ ...newProduct, color: e.target.value })}
                      placeholder="e.g. Midnight Black, Gold" required />
                  </label>
                  <label>Warranty
                    <select value={newProduct.warranty}
                      onChange={(e) => setNewProduct({ ...newProduct, warranty: e.target.value })}>
                      <option value="Brand 1 Year">Brand 1 Year</option>
                      <option value="Brand 2 Years">Brand 2 Years</option>
                      <option value="Extended Warranty">Extended Warranty</option>
                      <option value="No Warranty">No Warranty</option>
                    </select>
                  </label>
                </div>
                <label style={{ marginTop: 10 }}>Variant / Configuration (optional)
                  <input type="text" value={newProduct.variant}
                    onChange={(e) => setNewProduct({ ...newProduct, variant: e.target.value })}
                    placeholder="e.g. 8GB/128GB — leave blank to auto-generate" />
                </label>
              </div>

              {/* Section 2: Pricing & stock */}
              <div className="form-section">
                <div className="form-section-title"><span>💰</span> Pricing & Stock</div>
                <div className="grid cols-2" style={{ gap: 14 }}>
                  <label>Available Quantity <span style={{ color: "var(--danger)" }}>*</span>
                    <input type="number" value={newProduct.availableQty} min="1" required
                      onChange={(e) => setNewProduct({ ...newProduct, availableQty: Number(e.target.value) })} />
                  </label>
                  <label>Your Price (₹) <span style={{ color: "var(--danger)" }}>*</span>
                    <input type="number" value={newProduct.minimumPrice} min="1000" required
                      onChange={(e) => setNewProduct({ ...newProduct, minimumPrice: Number(e.target.value) })} />
                  </label>
                  <label>Ready in (minutes)
                    <input type="number" value={newProduct.readyInMinutes} min="5"
                      onChange={(e) => setNewProduct({ ...newProduct, readyInMinutes: Number(e.target.value) })} />
                  </label>
                  <label>Status
                    <select value={newProduct.status}
                      onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value })}>
                      <option value="ON">ON — Available</option>
                      <option value="OFF">OFF — Not available</option>
                    </select>
                  </label>
                </div>
              </div>

              {/* Section 3: Images */}
              <div className="form-section">
                <div className="form-section-title"><span>📸</span> Product Images (recommended)</div>
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>
                  Up to 5 images · max 2 MB each · JPG/PNG/WEBP
                </p>
                <div className="upload-zone" onClick={() => document.getElementById("imageUpload").click()}>
                  <div className="upload-icon">📸</div>
                  <p className="upload-title">Click to upload</p>
                  <p className="upload-hint">Or drag & drop — JPG, PNG, WEBP</p>
                  <input id="imageUpload" type="file" accept="image/jpeg,image/png,image/webp"
                    multiple onChange={handleImageUpload} style={{ display: "none" }} />
                </div>
                {images.length > 0 && (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>Uploaded ({images.length}/5)</span>
                      <span className="tiny">Tap ⭐ to set primary</span>
                    </div>
                    <div className="img-thumb-grid">
                      {images.map((img, idx) => (
                        <div key={idx} className={`img-thumb${primaryImageIndex === idx ? " primary-thumb" : ""}`}>
                          <img src={img} alt={`Product ${idx + 1}`} />
                          <button type="button" className="thumb-btn thumb-star"
                            onClick={(e) => { e.stopPropagation(); setPrimaryImageIndex(idx); }}
                            title={primaryImageIndex === idx ? "Primary image" : "Set as primary"}>
                            {primaryImageIndex === idx ? "⭐" : "☆"}
                          </button>
                          <button type="button" className="thumb-btn thumb-del"
                            onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                            title="Remove image">✕</button>
                          {primaryImageIndex === idx && <div className="thumb-badge">PRIMARY</div>}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Submit row */}
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button type="button" className="btn ghost"
                  onClick={() => { setShowAddForm(false); setImages([]); setPrimaryImageIndex(0); setError(""); setMsg(""); }}
                  disabled={uploading}>
                  Cancel
                </button>
                <button type="submit" className="btn" disabled={uploading}
                  style={{ minWidth: 200, opacity: uploading ? 0.6 : 1 }}>
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
          <h3>📋 Inventory ({inventory.length} {inventory.length === 1 ? "product" : "products"})</h3>
        </div>
        <div className="section-card-body" style={{ padding: inventory.length === 0 ? 0 : "0" }}>
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
                    <tr key={row._id} style={{ backgroundColor: index % 2 === 0 ? "white" : "var(--bg2)" }}>
                      <td style={{ width: 110, minWidth: 110 }}>
                        <ImageGallery images={row.images || []} primaryImage={row.primaryImage}
                          height={85} showThumbs={false} />
                        {(row.images?.length > 1) && (
                          <div className="tiny" style={{ textAlign: "center", marginTop: 2 }}>{row.images.length} photos</div>
                        )}
                      </td>
                      <td>
                        <strong style={{ display: "block", marginBottom: 3 }}>{row.skuId?.brand} {row.skuId?.model}</strong>
                        <span className="tiny">{row.skuId?.variant} · {row.skuId?.color}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: 15, fontWeight: 700,
                          color: row.availableQty > 0 ? "var(--success)" : "var(--danger)" }}>
                          {row.availableQty}
                        </span>
                      </td>
                      <td className="tiny">{row.reservedQty || 0}</td>
                      <td><strong style={{ color: "var(--primary)" }}>{inr(row.minimumPrice)}</strong></td>
                      <td>
                        <span className={`badge ${row.status === "ON" ? "success" : "bad"}`}>{row.status}</span>
                      </td>
                      <td>
                        <button className="btn ghost small"
                          onClick={async () => {
                            try {
                              await api(`/supplier/inventory/${row._id}`, {
                                method: "PATCH", body: { status: row.status === "ON" ? "OFF" : "ON", verify: true },
                              });
                              load();
                            } catch (e) { setError(e.message); }
                          }}
                          style={{ minWidth: 80 }}>
                          {row.status === "ON" ? "Turn OFF" : "Turn ON"}
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
  );
}

/* ─── OrderCard (private helper) ───────────────────────── */
function OrderCard({ order, onUpdate }) {
  const [imei, setImei] = useState("356938035643809");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [checklist, setChecklist] = useState({
    sealedBox: false,
    imeiScanned: false,
    noTampering: false,
  });
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (["reserved", "awaiting_accept"].includes(order.status) && order.acceptDeadline) {
      const interval = setInterval(() => {
        const now = Date.now();
        const deadline = new Date(order.acceptDeadline).getTime();
        const diff = deadline - now;

        if (diff <= 0) {
          setTimeLeft("Expired");
          clearInterval(interval);
        } else {
          const mins = Math.floor(diff / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          setTimeLeft(`${mins}m ${secs}s remaining`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [order.status, order.acceptDeadline]);

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (event) => { setPhotoPreview(event.target.result); };
    reader.readAsDataURL(file);
  }

  async function handleAccept() {
    await api(`/supplier/orders/${order._id}/accept`, { method: "POST" });
    onUpdate();
  }

  async function handleReject() {
    await api(`/supplier/orders/${order._id}/reject`, { method: "POST", body: { reason: "Out of stock" } });
    onUpdate();
  }

  async function handlePack() {
    const body = { imei, serial: imei };
    if (photoPreview) body.photoUrl = photoPreview;
    await api(`/supplier/orders/${order._id}/pack`, { method: "POST", body });
    onUpdate();
  }

  const allChecked = checklist.sealedBox && checklist.imeiScanned && checklist.noTampering;

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
      {["reserved", "awaiting_accept"].includes(order.status) && (
        <div className="row" style={{ gap: 10, marginTop: 4 }}>
          <button className="btn success small" onClick={handleAccept}>✓ Accept</button>
          <button className="btn ghost small" onClick={handleReject}>✕ Reject</button>
        </div>
      )}

      {/* Packing checklist + IMEI */}
      {["accepted", "paid"].includes(order.status) && (
        <div style={{ marginTop: 12 }}>
          <div className="checklist">
            <label>
              <input type="checkbox" checked={checklist.sealedBox}
                onChange={(e) => setChecklist({ ...checklist, sealedBox: e.target.checked })} />
              Sealed box verified
            </label>
            <label>
              <input type="checkbox" checked={checklist.imeiScanned}
                onChange={(e) => setChecklist({ ...checklist, imeiScanned: e.target.checked })} />
              IMEI / serial label scanned
            </label>
            <label>
              <input type="checkbox" checked={checklist.noTampering}
                onChange={(e) => setChecklist({ ...checklist, noTampering: e.target.checked })} />
              No tampering signs
            </label>
          </div>

          <label style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6, display: "block" }}>
            Box photo
          </label>
          <input type="file" accept="image/*" onChange={handlePhotoChange}
            style={{ marginBottom: photoPreview ? 8 : 0 }} />
          {photoPreview && (
            <img src={photoPreview} alt="Preview"
              style={{ maxWidth: 180, marginTop: 6, display: "block", borderRadius: 8 }} />
          )}

          <div className="imei-row">
            <input value={imei} onChange={(e) => setImei(e.target.value)} placeholder="IMEI" />
            <button className="btn small" onClick={handlePack}
              disabled={!allChecked}
              style={{ opacity: allChecked ? 1 : 0.5, flexShrink: 0 }}>
              Seal & Pack
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── SupplierOrders ────────────────────────────────────── */
export function SupplierOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const d = await api("/supplier/orders");
      setOrders(d.orders);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingScreen text="Loading orders…" />;
  if (error) return <div className="inline-error">{error}</div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2>Incoming Orders</h2>
          <p className="tiny">Accept deadline ~5 min. Packing requires IMEI (encrypted, restricted).</p>
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
          {orders.map((o) => <OrderCard key={o._id} order={o} onUpdate={load} />)}
        </div>
      )}
    </div>
  );
}

/* ─── SupplierPayouts ───────────────────────────────────── */
export function SupplierPayouts() {
  const [rows, setRows] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api("/supplier/settlements")
      .then((d) => { setAllRows(d.settlements); setRows(d.settlements); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (statusFilter === "all") {
      setRows(allRows);
    } else {
      setRows(allRows.filter((r) => r.status === statusFilter));
    }
  }, [statusFilter, allRows]);

  if (loading) return <LoadingScreen text="Loading payouts…" />;
  if (error) return <div className="inline-error">{error}</div>;

  const totalEarned  = allRows.filter((r) => r.status === "paid").reduce((s, r) => s + (r.payout || 0), 0);
  const totalPending = allRows.filter((r) => r.status === "pending" || r.status === "eligible").reduce((s, r) => s + (r.payout || 0), 0);

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
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
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
                  <th>Landed Price</th>
                  <th>Platform Fee</th>
                  <th>Delivery Charge</th>
                  <th>Net Payout</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id}>
                    <td style={{ fontFamily: "monospace", fontSize: 13 }}>
                      ...{String(r.orderId).slice(-8).toUpperCase()}
                    </td>
                    <td>{inr(r.landedPrice || r.payout + r.platformFee + (r.deliveryCharge || 0))}</td>
                    <td className="muted">{inr(r.platformFee)}</td>
                    <td className="muted">{inr(r.deliveryCharge || 0)}</td>
                    <td><strong style={{ color: "var(--success)" }}>{inr(r.payout)}</strong></td>
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
