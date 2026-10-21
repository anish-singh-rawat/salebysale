import { useEffect, useState } from "react";
import { api, inr } from "../api.js";
import ImageGallery from "../components/ImageGallery.jsx";

/* ─── Status config ──────────────────────────────────────── */
const STATUS_META = {
  delivered:      { label: "Delivered",       color: "#10b981", bg: "#d1fae5" },
  reserved:       { label: "New Order",        color: "#f59e0b", bg: "#fef3c7" },
  awaiting_admin: { label: "Payment Review",  color: "#7c3aed", bg: "#ede9fe" },
  assigned:       { label: "Rider Assigned",  color: "#6366f1", bg: "#e0e7ff" },
  picked:         { label: "Picked Up",       color: "#ec4899", bg: "#fce7f3" },
  cancelled:      { label: "Cancelled",       color: "#ef4444", bg: "#fee2e2" },
  disputed:       { label: "Disputed",        color: "#ef4444", bg: "#fee2e2" },
  paid:           { label: "Paid",            color: "#10b981", bg: "#d1fae5" },
  eligible:       { label: "Eligible",        color: "#6366f1", bg: "#e0e7ff" },
  pending:        { label: "Pending",         color: "#f59e0b", bg: "#fef3c7" },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] || { label: status?.replace(/_/g," "), color:"#64748b", bg:"#f1f5f9" };
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"4px 12px", borderRadius:999, fontSize:12, fontWeight:700,
      background:m.bg, color:m.color, whiteSpace:"nowrap",
    }}>
      <span style={{width:6,height:6,borderRadius:"50%",background:m.color,flexShrink:0}} />
      {m.label}
    </span>
  );
}

function LoadingScreen({ text = "Loading…" }) {
  return (
    <div className="db-loading">
      <div className="db-spinner" />
      <p className="db-loading-text">{text}</p>
    </div>
  );
}

function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="db-empty">
      <div className="db-empty-icon">{icon}</div>
      <h3 className="db-empty-title">{title}</h3>
      <p className="db-empty-desc">{desc}</p>
      {action}
    </div>
  );
}

/* ─── SupplierStock ─────────────────────────────────────── */
export function SupplierStock() {
  const [inventory, setInventory] = useState([]);
  const [newProduct, setNewProduct] = useState({
    brand:"", model:"", variant:"", ram:"", storage:"", color:"",
    warranty:"Brand 1 Year", availableQty:1, minimumPrice:10000,
    readyInMinutes:30, status:"ON",
  });
  const [images, setImages] = useState([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [viewMode, setViewMode] = useState("table"); // "table" | "grid"

  async function load() {
    setLoading(true);
    try { const data = await api("/supplier/inventory"); setInventory(data.inventory); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function saveProduct(e) {
    e.preventDefault();
    if (!newProduct.brand || !newProduct.model || !newProduct.color) {
      setError("Please fill in Brand, Model, and Color fields"); return;
    }
    setUploading(true); setMsg(""); setError("");
    try {
      const skuCode = `${newProduct.brand}-${newProduct.model}-${newProduct.variant||"BASE"}-${newProduct.color}`
        .replace(/\s+/g,"-").toUpperCase();
      const skuData = {
        skuCode, brand:newProduct.brand, model:newProduct.model,
        variant:newProduct.variant||`${newProduct.ram||""}/${newProduct.storage||""}`.trim()||"Standard",
        ram:newProduct.ram, storage:newProduct.storage, color:newProduct.color,
        warranty:newProduct.warranty, condition:"new_sealed", region:"India",
      };
      const skuRes = await api("/catalog", { method:"POST", body:skuData });
      await api("/supplier/inventory", { method:"POST", body:{
        skuId:skuRes.sku._id, availableQty:newProduct.availableQty,
        minimumPrice:newProduct.minimumPrice, readyInMinutes:newProduct.readyInMinutes,
        status:newProduct.status, images, primaryImage:images[primaryImageIndex]||null,
      }});
      setMsg("✅ Product listed successfully!");
      setNewProduct({ brand:"",model:"",variant:"",ram:"",storage:"",color:"",
        warranty:"Brand 1 Year",availableQty:1,minimumPrice:10000,readyInMinutes:30,status:"ON" });
      setImages([]); setPrimaryImageIndex(0); setShowAddForm(false); load();
    } catch (e) { setError(e.message||"Failed to add product"); }
    finally { setUploading(false); }
  }

  function handleImageUpload(e) {
    const files = Array.from(e.target.files).slice(0, 5 - images.length);
    if (images.length + files.length > 5) { setError("Maximum 5 images allowed"); return; }
    files.forEach(file => {
      if (file.size > 2 * 1024 * 1024) { setError(`${file.name} exceeds 2MB`); return; }
      const reader = new FileReader();
      reader.onload = ev => setImages(prev => [...prev, ev.target.result]);
      reader.readAsDataURL(file);
    });
  }
  function removeImage(idx) {
    setImages(prev => prev.filter((_,i) => i!==idx));
    if (primaryImageIndex===idx) setPrimaryImageIndex(0);
    if (primaryImageIndex>idx) setPrimaryImageIndex(primaryImageIndex-1);
  }

  if (loading) return <LoadingScreen text="Loading your inventory…" />;

  const activeCount   = inventory.filter(r => r.status==="ON").length;
  const totalReserved = inventory.reduce((s,r) => s+(r.reservedQty||0),0);
  const totalAvailable= inventory.reduce((s,r) => s+(r.availableQty||0),0);
  const filtered = searchQ
    ? inventory.filter(r =>
        `${r.skuId?.brand} ${r.skuId?.model} ${r.skuId?.color}`.toLowerCase().includes(searchQ.toLowerCase()))
    : inventory;

  return (
    <div className="db-fade">
      {/* Page header */}
      <div className="db-page-header">
        <div>
          <h2 className="db-page-title">My Inventory</h2>
          <p className="db-page-sub">List mobile phones · Your identity stays private from buyers</p>
        </div>
        <button className="db-btn-primary" onClick={() => { setShowAddForm(true); setError(""); setMsg(""); }}>
          + List New Product
        </button>
      </div>

      {msg   && <div className="db-success-banner">{msg}</div>}
      {error && <div className="db-error-banner">{error}</div>}

      {/* KPI strip */}
      <div className="db-kpi-strip">
        <div className="db-kpi-card">
          <div className="db-kpi-icon" style={{background:"#ede9fe"}}>📦</div>
          <div><div className="db-kpi-val">{inventory.length}</div><div className="db-kpi-lbl">Total Products</div></div>
        </div>
        <div className="db-kpi-card">
          <div className="db-kpi-icon" style={{background:"#d1fae5"}}>✅</div>
          <div><div className="db-kpi-val" style={{color:"#10b981"}}>{activeCount}</div><div className="db-kpi-lbl">Active (ON)</div></div>
        </div>
        <div className="db-kpi-card">
          <div className="db-kpi-icon" style={{background:"#fef3c7"}}>🔒</div>
          <div><div className="db-kpi-val" style={{color:"#f59e0b"}}>{totalReserved}</div><div className="db-kpi-lbl">Reserved</div></div>
        </div>
        <div className="db-kpi-card">
          <div className="db-kpi-icon" style={{background:"#e0e7ff"}}>🟢</div>
          <div><div className="db-kpi-val" style={{color:"#6366f1"}}>{totalAvailable}</div><div className="db-kpi-lbl">Available Units</div></div>
        </div>
      </div>

      {/* Slide-in Add Product Panel */}
      {showAddForm && (
        <>
          <div className="db-panel-backdrop" onClick={() => { setShowAddForm(false); setImages([]); setPrimaryImageIndex(0); setError(""); setMsg(""); }} />
          <div className="db-slide-panel">
            <div className="db-panel-header">
              <div>
                <h3 className="db-panel-title">➕ List New Mobile Phone</h3>
                <p className="db-panel-sub">Fill in the details below to add to your inventory</p>
              </div>
              <button className="db-panel-close" onClick={() => { setShowAddForm(false); setImages([]); setPrimaryImageIndex(0); setError(""); setMsg(""); }}>✕</button>
            </div>

            {msg   && <div className="db-success-banner">{msg}</div>}
            {error && <div className="db-error-banner">{error}</div>}

            <form onSubmit={saveProduct} className="db-panel-form">
              {/* Section 1 */}
              <div className="db-form-section">
                <div className="db-form-section-label">📱 Phone Details</div>
                <div className="db-form-grid-2">
                  <label className="db-label">Brand <span className="db-required">*</span>
                    <input className="db-input" value={newProduct.brand}
                      onChange={e => setNewProduct({...newProduct,brand:e.target.value})}
                      placeholder="e.g. Apple, Samsung, OnePlus" required />
                  </label>
                  <label className="db-label">Model <span className="db-required">*</span>
                    <input className="db-input" value={newProduct.model}
                      onChange={e => setNewProduct({...newProduct,model:e.target.value})}
                      placeholder="e.g. iPhone 15 Pro, Galaxy S24" required />
                  </label>
                  <label className="db-label">RAM
                    <input className="db-input" value={newProduct.ram}
                      onChange={e => setNewProduct({...newProduct,ram:e.target.value})}
                      placeholder="e.g. 8GB, 12GB" />
                  </label>
                  <label className="db-label">Storage
                    <input className="db-input" value={newProduct.storage}
                      onChange={e => setNewProduct({...newProduct,storage:e.target.value})}
                      placeholder="e.g. 128GB, 256GB" />
                  </label>
                  <label className="db-label">Color <span className="db-required">*</span>
                    <input className="db-input" value={newProduct.color}
                      onChange={e => setNewProduct({...newProduct,color:e.target.value})}
                      placeholder="e.g. Midnight Black, Gold" required />
                  </label>
                  <label className="db-label">Warranty
                    <select className="db-input" value={newProduct.warranty}
                      onChange={e => setNewProduct({...newProduct,warranty:e.target.value})}>
                      <option value="Brand 1 Year">Brand 1 Year</option>
                      <option value="Brand 2 Years">Brand 2 Years</option>
                      <option value="Extended Warranty">Extended Warranty</option>
                      <option value="No Warranty">No Warranty</option>
                    </select>
                  </label>
                </div>
                <label className="db-label" style={{marginTop:10}}>Variant / Config (optional)
                  <input className="db-input" value={newProduct.variant}
                    onChange={e => setNewProduct({...newProduct,variant:e.target.value})}
                    placeholder="e.g. 8GB/128GB — leave blank to auto-generate from RAM+Storage" />
                </label>
              </div>

              {/* Section 2 */}
              <div className="db-form-section">
                <div className="db-form-section-label">💰 Pricing & Stock</div>
                <div className="db-form-grid-2">
                  <label className="db-label">Available Quantity <span className="db-required">*</span>
                    <input className="db-input" type="number" value={newProduct.availableQty} min="1" required
                      onChange={e => setNewProduct({...newProduct,availableQty:Number(e.target.value)})} />
                  </label>
                  <label className="db-label">Your Price (₹) <span className="db-required">*</span>
                    <input className="db-input" type="number" value={newProduct.minimumPrice} min="1000" required
                      onChange={e => setNewProduct({...newProduct,minimumPrice:Number(e.target.value)})} />
                  </label>
                  <label className="db-label">Ready in (minutes)
                    <input className="db-input" type="number" value={newProduct.readyInMinutes} min="5"
                      onChange={e => setNewProduct({...newProduct,readyInMinutes:Number(e.target.value)})} />
                  </label>
                  <label className="db-label">Listing Status
                    <select className="db-input" value={newProduct.status}
                      onChange={e => setNewProduct({...newProduct,status:e.target.value})}>
                      <option value="ON">🟢 ON — Available to buyers</option>
                      <option value="OFF">⚫ OFF — Hidden from buyers</option>
                    </select>
                  </label>
                </div>
              </div>

              {/* Section 3: Images */}
              <div className="db-form-section">
                <div className="db-form-section-label">📸 Product Images</div>
                <p className="db-form-hint">Up to 5 images · max 2MB each · JPG/PNG/WEBP</p>
                <div className="db-upload-zone" onClick={() => document.getElementById("imgUp").click()}>
                  <div className="db-upload-icon">📸</div>
                  <div className="db-upload-title">Click to upload images</div>
                  <div className="db-upload-hint">or drag & drop — JPG, PNG, WEBP</div>
                  <input id="imgUp" type="file" accept="image/jpeg,image/png,image/webp"
                    multiple onChange={handleImageUpload} style={{display:"none"}} />
                </div>
                {images.length > 0 && (
                  <div className="db-img-thumbs">
                    {images.map((img, idx) => (
                      <div key={idx} className={`db-img-thumb${primaryImageIndex===idx?" db-img-primary":""}`}>
                        <img src={img} alt={`Upload ${idx+1}`} />
                        <button type="button" className="db-thumb-star"
                          onClick={e => { e.stopPropagation(); setPrimaryImageIndex(idx); }}
                          title="Set as primary">
                          {primaryImageIndex===idx ? "⭐" : "☆"}
                        </button>
                        <button type="button" className="db-thumb-del"
                          onClick={e => { e.stopPropagation(); removeImage(idx); }}>✕</button>
                        {primaryImageIndex===idx && <div className="db-thumb-primary-badge">PRIMARY</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="db-panel-footer">
                <button type="button" className="db-btn-ghost"
                  onClick={() => { setShowAddForm(false); setImages([]); setPrimaryImageIndex(0); }}
                  disabled={uploading}>Cancel</button>
                <button type="submit" className="db-btn-primary" disabled={uploading}
                  style={{minWidth:180, opacity:uploading?0.65:1}}>
                  {uploading ? "⏳ Adding…" : "✓ Add to Inventory"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Search + view toggle */}
      {inventory.length > 0 && (
        <div className="db-inv-toolbar">
          <div className="db-inv-search-wrap">
            <span className="db-inv-search-icon">🔍</span>
            <input className="db-inv-search" value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Search your inventory…" />
            {searchQ && <button className="db-inv-search-clear" onClick={() => setSearchQ("")}>✕</button>}
          </div>
          <div className="db-view-toggle">
            <button className={`db-view-btn${viewMode==="table"?" active":""}`} onClick={() => setViewMode("table")}>≡ Table</button>
            <button className={`db-view-btn${viewMode==="grid"?" active":""}`} onClick={() => setViewMode("grid")}>⊞ Grid</button>
          </div>
        </div>
      )}

      {/* Inventory */}
      {inventory.length === 0 ? (
        <EmptyState icon="📦" title="No products listed yet"
          desc="Add your first mobile phone to start receiving orders from buyers."
          action={<button className="db-btn-primary" onClick={() => setShowAddForm(true)}>+ List First Product</button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔍" title="No products match your search"
          desc="Try a different keyword."
          action={<button className="db-btn-ghost" onClick={() => setSearchQ("")}>Clear Search</button>}
        />
      ) : viewMode === "grid" ? (
        /* Grid view */
        <div className="db-inv-grid">
          {filtered.map(row => (
            <div key={row._id} className="db-inv-grid-card">
              <div className="db-inv-card-img-wrap">
                <ImageGallery images={row.images||[]} primaryImage={row.primaryImage} height={120} showThumbs={false} />
                <span className={`db-inv-status-dot ${row.status==="ON"?"db-inv-on":"db-inv-off"}`}>
                  {row.status==="ON" ? "🟢 ON" : "⚫ OFF"}
                </span>
              </div>
              <div className="db-inv-card-body">
                <div className="db-inv-card-brand">{row.skuId?.brand}</div>
                <div className="db-inv-card-name">{row.skuId?.model}</div>
                <div className="db-inv-card-variant">{row.skuId?.variant} · {row.skuId?.color}</div>
                <div className="db-inv-card-price">{inr(row.minimumPrice)}</div>
                <div className="db-inv-card-stock">
                  <span style={{color:"#10b981"}}>Avail: {row.availableQty}</span>
                  <span style={{color:"#f59e0b"}}>Res: {row.reservedQty||0}</span>
                </div>
                <button className={`db-inv-toggle-btn ${row.status==="ON"?"db-toggle-off":"db-toggle-on"}`}
                  onClick={async () => {
                    try { await api(`/supplier/inventory/${row._id}`,{method:"PATCH",body:{status:row.status==="ON"?"OFF":"ON",verify:true}}); load(); }
                    catch (e) { setError(e.message); }
                  }}>
                  {row.status==="ON" ? "Turn OFF" : "Turn ON"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table view */
        <div className="db-inv-table-wrap">
          <table className="db-inv-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product</th>
                <th>Available</th>
                <th>Reserved</th>
                <th>Your Price</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={row._id} className={i%2===0?"db-tr-even":"db-tr-odd"}>
                  <td>
                    <div style={{width:80}}>
                      <ImageGallery images={row.images||[]} primaryImage={row.primaryImage} height={70} showThumbs={false} />
                    </div>
                  </td>
                  <td>
                    <div className="db-inv-product-name">{row.skuId?.brand} {row.skuId?.model}</div>
                    <div className="db-inv-product-sub">{row.skuId?.variant} · {row.skuId?.color}</div>
                  </td>
                  <td>
                    <span className="db-inv-qty" style={{color:row.availableQty>0?"#10b981":"#ef4444"}}>
                      {row.availableQty}
                    </span>
                  </td>
                  <td><span className="db-inv-qty-muted">{row.reservedQty||0}</span></td>
                  <td><span className="db-inv-price">{inr(row.minimumPrice)}</span></td>
                  <td>
                    <span style={{
                      display:"inline-flex",alignItems:"center",gap:5,
                      padding:"4px 10px",borderRadius:999,fontSize:12,fontWeight:700,
                      background:row.status==="ON"?"#d1fae5":"#f1f5f9",
                      color:row.status==="ON"?"#059669":"#94a3b8",
                    }}>
                      {row.status==="ON" ? "🟢 ON" : "⚫ OFF"}
                    </span>
                  </td>
                  <td>
                    <button className={`db-inv-action-btn ${row.status==="ON"?"db-action-off":"db-action-on"}`}
                      onClick={async () => {
                        try { await api(`/supplier/inventory/${row._id}`,{method:"PATCH",body:{status:row.status==="ON"?"OFF":"ON",verify:true}}); load(); }
                        catch (e) { setError(e.message); }
                      }}>
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
  );
}

/* ─── OrderCard (private helper) ───────────────────────── */
function OrderCard({ order, onUpdate }) {
  const [imei, setImei] = useState("356938035643809");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [checklist, setChecklist] = useState({ sealedBox:false, imeiScanned:false, noTampering:false });
  const [timeLeft, setTimeLeft] = useState("");
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (["reserved","awaiting_accept"].includes(order.status) && order.acceptDeadline) {
      const interval = setInterval(() => {
        const diff = new Date(order.acceptDeadline).getTime() - Date.now();
        if (diff <= 0) { setTimeLeft("Expired"); clearInterval(interval); }
        else {
          const mins = Math.floor(diff/60000);
          const secs = Math.floor((diff%60000)/1000);
          setTimeLeft(`${mins}m ${secs}s`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [order.status, order.acceptDeadline]);

  function handlePhotoChange(e) {
    const file = e.target.files[0]; if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = ev => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  async function handleAccept() { await api(`/supplier/orders/${order._id}/accept`,{method:"POST"}); onUpdate(); }
  async function handleReject() { await api(`/supplier/orders/${order._id}/reject`,{method:"POST",body:{reason:"Out of stock"}}); onUpdate(); }
  async function handlePack() {
    const body = { imei, serial:imei };
    if (photoPreview) body.photoUrl = photoPreview;
    await api(`/supplier/orders/${order._id}/pack`,{method:"POST",body}); onUpdate();
  }

  const allChecked = checklist.sealedBox && checklist.imeiScanned && checklist.noTampering;
  const isNew = ["reserved","awaiting_accept"].includes(order.status);
  const isPacking = ["accepted","paid"].includes(order.status);
  const sku = order.items?.[0]?.skuId;
  const m = STATUS_META[order.status] || {};

  return (
    <div className={`db-soc ${isNew?"db-soc-new":""}`}>
      {/* Card header */}
      <div className="db-soc-header" onClick={() => setExpanded(!expanded)}>
        <div className="db-soc-left">
          <div className="db-soc-icon" style={{background:m.bg||"#f1f5f9"}}>📱</div>
          <div>
            <div className="db-soc-product">{sku?.brand} {sku?.model} {sku?.color ? `· ${sku.color}` : ""}</div>
            <div className="db-soc-payout">Payout {inr(order.totals?.supplierPayout)} · Buyer identity private</div>
            <div className="db-soc-id">Order #{order._id.slice(-8).toUpperCase()}</div>
          </div>
        </div>
        <div className="db-soc-right">
          <StatusBadge status={order.status} />
          {timeLeft && (
            <div className={`db-soc-timer ${timeLeft==="Expired"?"db-timer-expired":"db-timer-live"}`}>
              ⏱ {timeLeft}
            </div>
          )}
          <span className="db-soc-chevron">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* Expandable body */}
      {expanded && (
        <div className="db-soc-body">
          {/* Accept / Reject */}
          {isNew && (
            <div className="db-soc-actions">
              <div className="db-soc-action-info">
                {timeLeft && <span>⏰ Accept within {timeLeft} or order auto-cancels</span>}
              </div>
              <div className="db-soc-action-btns">
                <button className="db-btn-success" onClick={handleAccept}>✓ Accept Order</button>
                <button className="db-btn-ghost" onClick={handleReject}>✕ Reject</button>
              </div>
            </div>
          )}

          {/* Packing flow */}
          {isPacking && (
            <div className="db-soc-packing">
              <div className="db-packing-title">📦 Packing Checklist</div>
              <div className="db-checklist">
                {[
                  { key:"sealedBox",   label:"Sealed box verified" },
                  { key:"imeiScanned", label:"IMEI / serial label scanned" },
                  { key:"noTampering", label:"No tampering signs detected" },
                ].map(item => (
                  <label key={item.key} className={`db-check-item${checklist[item.key]?" db-check-done":""}`}>
                    <input type="checkbox" checked={checklist[item.key]}
                      onChange={e => setChecklist({...checklist,[item.key]:e.target.checked})} />
                    <span>{checklist[item.key] ? "✓" : "○"} {item.label}</span>
                  </label>
                ))}
              </div>

              <div className="db-soc-imei-section">
                <label className="db-label">IMEI Number
                  <div className="db-imei-row">
                    <input className="db-input db-imei-input" value={imei}
                      onChange={e => setImei(e.target.value)} placeholder="15-digit IMEI" />
                    <button className="db-btn-primary" onClick={handlePack}
                      disabled={!allChecked} style={{opacity:allChecked?1:0.4, flexShrink:0}}>
                      {allChecked ? "✓ Seal & Pack" : "Complete checklist first"}
                    </button>
                  </div>
                </label>
              </div>

              <label className="db-label">Box Photo (optional)
                <div className="db-photo-upload" onClick={() => document.getElementById(`photo-${order._id}`).click()}>
                  {photoPreview
                    ? <img src={photoPreview} alt="Box" className="db-photo-preview" />
                    : <><span className="db-upload-icon">📷</span><span>Click to add box photo</span></>
                  }
                  <input id={`photo-${order._id}`} type="file" accept="image/*"
                    onChange={handlePhotoChange} style={{display:"none"}} />
                </div>
              </label>
            </div>
          )}

          {/* Completed state */}
          {!isNew && !isPacking && (
            <div className="db-soc-done">
              <span style={{fontSize:28}}>
                {order.status==="delivered"?"✅":order.status==="cancelled"?"❌":"📋"}
              </span>
              <p>This order is <strong>{m.label || order.status}</strong>.</p>
              {order.status==="delivered" && (
                <p className="db-soc-payout-note">💰 Payout {inr(order.totals?.supplierPayout)} will be processed T+1</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── SupplierOrders ────────────────────────────────────── */
export function SupplierOrders() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try { const d = await api("/supplier/orders"); setOrders(d.orders); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  if (loading) return <LoadingScreen text="Loading incoming orders…" />;
  if (error)   return <div className="db-error-banner">{error}</div>;

  const newCount = orders.filter(o => ["reserved","awaiting_accept"].includes(o.status)).length;
  const packingCount = orders.filter(o => ["accepted","paid"].includes(o.status)).length;
  const doneCount = orders.filter(o => o.status==="delivered").length;

  const filtered = statusFilter==="all" ? orders
    : statusFilter==="new" ? orders.filter(o => ["reserved","awaiting_accept"].includes(o.status))
    : statusFilter==="packing" ? orders.filter(o => ["accepted","paid"].includes(o.status))
    : orders.filter(o => o.status===statusFilter);

  return (
    <div className="db-fade">
      <div className="db-page-header">
        <div>
          <h2 className="db-page-title">Incoming Orders</h2>
          <p className="db-page-sub">Accept within ~5 min · Packing requires IMEI (encrypted)</p>
        </div>
        <button className="db-btn-ghost" onClick={load}>↻ Refresh</button>
      </div>

      {/* KPI strip */}
      {orders.length > 0 && (
        <div className="db-kpi-strip">
          <div className="db-kpi-card">
            <div className="db-kpi-icon" style={{background:"#ede9fe"}}>📥</div>
            <div><div className="db-kpi-val">{orders.length}</div><div className="db-kpi-lbl">Total Orders</div></div>
          </div>
          <div className="db-kpi-card">
            <div className="db-kpi-icon" style={{background:"#fef3c7"}}>🆕</div>
            <div><div className="db-kpi-val" style={{color:"#f59e0b"}}>{newCount}</div><div className="db-kpi-lbl">New Orders</div></div>
          </div>
          <div className="db-kpi-card">
            <div className="db-kpi-icon" style={{background:"#e0e7ff"}}>📦</div>
            <div><div className="db-kpi-val" style={{color:"#6366f1"}}>{packingCount}</div><div className="db-kpi-lbl">Packing</div></div>
          </div>
          <div className="db-kpi-card">
            <div className="db-kpi-icon" style={{background:"#d1fae5"}}>✅</div>
            <div><div className="db-kpi-val" style={{color:"#10b981"}}>{doneCount}</div><div className="db-kpi-lbl">Delivered</div></div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="db-tab-row">
        {[
          {key:"all",     label:"All Orders",    count:orders.length},
          {key:"new",     label:"🔔 New",         count:newCount},
          {key:"packing", label:"📦 Packing",     count:packingCount},
          {key:"delivered",label:"✅ Delivered",  count:doneCount},
        ].map(t => (
          <button key={t.key} className={`db-tab${statusFilter===t.key?" db-tab-active":""}`}
            onClick={() => setStatusFilter(t.key)}>
            {t.label} <span className="db-tab-count">{t.count}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📬" title="No orders here"
          desc={statusFilter==="all" ? "New orders from buyers will appear here." : "No orders in this category."}
          action={statusFilter!=="all" && <button className="db-btn-ghost" onClick={() => setStatusFilter("all")}>Show All</button>}
        />
      ) : (
        <div className="db-soc-list">
          {filtered.map(o => <OrderCard key={o._id} order={o} onUpdate={load} />)}
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
      .then(d => { setAllRows(d.settlements); setRows(d.settlements); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setRows(statusFilter==="all" ? allRows : allRows.filter(r => r.status===statusFilter));
  }, [statusFilter, allRows]);

  if (loading) return <LoadingScreen text="Loading payout ledger…" />;
  if (error)   return <div className="db-error-banner">{error}</div>;

  const totalEarned  = allRows.filter(r => r.status==="paid").reduce((s,r) => s+(r.payout||0),0);
  const totalPending = allRows.filter(r => ["pending","eligible"].includes(r.status)).reduce((s,r) => s+(r.payout||0),0);
  const totalRecords = allRows.length;

  return (
    <div className="db-fade">
      <div className="db-page-header">
        <div>
          <h2 className="db-page-title">Payout Ledger</h2>
          <p className="db-page-sub">T+1 after proof of delivery · Delivery-triggered eligibility</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="db-kpi-strip">
        <div className="db-kpi-card">
          <div className="db-kpi-icon" style={{background:"#ede9fe"}}>📋</div>
          <div><div className="db-kpi-val">{totalRecords}</div><div className="db-kpi-lbl">Total Records</div></div>
        </div>
        <div className="db-kpi-card">
          <div className="db-kpi-icon" style={{background:"#d1fae5"}}>💰</div>
          <div><div className="db-kpi-val" style={{color:"#10b981",fontSize:16}}>{inr(totalEarned)}</div><div className="db-kpi-lbl">Total Earned</div></div>
        </div>
        <div className="db-kpi-card">
          <div className="db-kpi-icon" style={{background:"#fef3c7"}}>⏳</div>
          <div><div className="db-kpi-val" style={{color:"#f59e0b",fontSize:16}}>{inr(totalPending)}</div><div className="db-kpi-lbl">Pending</div></div>
        </div>
        <div className="db-kpi-card">
          <div className="db-kpi-icon" style={{background:"#e0e7ff"}}>📈</div>
          <div>
            <div className="db-kpi-val" style={{color:"#6366f1",fontSize:14}}>
              {totalEarned>0 ? Math.round((totalEarned/(totalEarned+totalPending))*100)+"%" : "—"}
            </div>
            <div className="db-kpi-lbl">Completion Rate</div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="db-tab-row">
        {["all","eligible","paid","pending"].map(st => (
          <button key={st} className={`db-tab${statusFilter===st?" db-tab-active":""}`}
            onClick={() => setStatusFilter(st)}>
            {st==="all" ? "All" : st.charAt(0).toUpperCase()+st.slice(1)}
            <span className="db-tab-count">
              {st==="all" ? allRows.length : allRows.filter(r=>r.status===st).length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      {rows.length === 0 ? (
        <EmptyState icon="💳" title="No settlements yet"
          desc="Completed orders will appear here as payouts become eligible."
        />
      ) : (
        <div className="db-payout-table-wrap">
          <table className="db-payout-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Landed Price</th>
                <th>Platform Fee</th>
                <th>Delivery</th>
                <th>Net Payout</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r._id} className={i%2===0?"db-tr-even":"db-tr-odd"}>
                  <td><span className="db-payout-order-id">#{String(r.orderId).slice(-8).toUpperCase()}</span></td>
                  <td>{inr(r.landedPrice||r.payout+r.platformFee+(r.deliveryCharge||0))}</td>
                  <td><span className="db-payout-fee">{inr(r.platformFee)}</span></td>
                  <td><span className="db-payout-fee">{inr(r.deliveryCharge||0)}</span></td>
                  <td><span className="db-payout-net">{inr(r.payout)}</span></td>
                  <td><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
