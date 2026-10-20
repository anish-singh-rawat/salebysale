import { useEffect, useState } from "react";
import { api, inr } from "../api.js";
import ImageGallery from "../components/ImageGallery.jsx";

export function SupplierStock() {
  const [inventory, setInventory] = useState([]);
  
  // New product form (manual entry)
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
    status: "ON"
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

  useEffect(() => {
    load();
  }, []);

  async function saveProduct(e) {
    e.preventDefault();
    
    // Validate required fields
    if (!newProduct.brand || !newProduct.model || !newProduct.color) {
      setError("Please fill in Brand, Model, and Color fields");
      return;
    }

    setUploading(true);
    setMsg("");
    setError("");
    
    try {
      // First, create or find the SKU
      const skuCode = `${newProduct.brand}-${newProduct.model}-${newProduct.variant || "BASE"}-${newProduct.color}`.replace(/\s+/g, "-").toUpperCase();
      
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
        region: "India"
      };

      // Create SKU in catalog (or get existing)
      const skuRes = await api("/catalog", { method: "POST", body: skuData });
      const sku = skuRes.sku;

      // Now add to inventory
      const inventoryBody = {
        skuId: sku._id,
        availableQty: newProduct.availableQty,
        minimumPrice: newProduct.minimumPrice,
        readyInMinutes: newProduct.readyInMinutes,
        status: newProduct.status,
        images,
        primaryImage: images[primaryImageIndex] || null
      };

      await api("/supplier/inventory", { method: "POST", body: inventoryBody });
      
      setMsg("✅ Product added to your inventory successfully!");
      
      // Reset form
      setNewProduct({
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
        status: "ON"
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

    files.forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        setError(`${file.name} exceeds 2MB limit`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages(prev => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  }

  function removeImage(idx) {
    setImages(prev => prev.filter((_, i) => i !== idx));
    if (primaryImageIndex === idx) setPrimaryImageIndex(0);
    if (primaryImageIndex > idx) setPrimaryImageIndex(primaryImageIndex - 1);
  }

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}><p>Loading your inventory...</p></div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ marginBottom: "8px" }}>My Inventory</h2>
          <p className="muted">Add your mobile phones with images. Buyers see products but your identity stays private.</p>
        </div>
        <button 
          className="btn" 
          onClick={() => {
            setShowAddForm(!showAddForm);
            setError("");
            setMsg("");
          }}
          style={{ minWidth: "160px" }}
        >
          {showAddForm ? "✕ Cancel" : "+ Add Product"}
        </button>
      </div>

      {msg && (
        <div className="card" style={{ backgroundColor: "#d1fae5", border: "1px solid #10b981", color: "#047857", marginBottom: "20px", padding: "12px 16px" }}>
          {msg}
        </div>
      )}
      
      {error && (
        <div className="card" style={{ backgroundColor: "#fee2e2", border: "1px solid #ef4444", color: "#dc2626", marginBottom: "20px", padding: "12px 16px" }}>
          {error}
        </div>
      )}

      {showAddForm && (
        <div className="card" style={{ marginBottom: "24px", backgroundColor: "#f8fafc", border: "2px solid var(--primary)" }}>
          <h3 style={{ marginBottom: "20px", color: "var(--primary)", fontSize: "20px" }}>
            ➕ Add New Mobile Phone
          </h3>
          
          <form onSubmit={saveProduct}>
            {/* Step 1: Basic Product Information */}
            <div style={{ marginBottom: "24px", padding: "20px", backgroundColor: "white", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
              <h4 style={{ marginBottom: "16px", fontSize: "16px", color: "#374151", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px" }}>📱</span> Mobile Phone Details
              </h4>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <label>
                  <span style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500 }}>
                    Brand <span style={{ color: "#ef4444" }}>*</span>
                  </span>
                  <input 
                    type="text"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    placeholder="e.g., Apple, Samsung, OnePlus"
                    required
                    style={{ height: "44px", fontSize: "15px" }}
                  />
                  <span style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px", display: "block" }}>
                    Phone manufacturer
                  </span>
                </label>

                <label>
                  <span style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500 }}>
                    Model <span style={{ color: "#ef4444" }}>*</span>
                  </span>
                  <input 
                    type="text"
                    value={newProduct.model}
                    onChange={(e) => setNewProduct({ ...newProduct, model: e.target.value })}
                    placeholder="e.g., iPhone 14 Pro Max, Galaxy S23"
                    required
                    style={{ height: "44px", fontSize: "15px" }}
                  />
                  <span style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px", display: "block" }}>
                    Phone model name
                  </span>
                </label>

                <label>
                  <span style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500 }}>
                    RAM
                  </span>
                  <input 
                    type="text"
                    value={newProduct.ram}
                    onChange={(e) => setNewProduct({ ...newProduct, ram: e.target.value })}
                    placeholder="e.g., 8GB, 12GB"
                    style={{ height: "44px", fontSize: "15px" }}
                  />
                  <span style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px", display: "block" }}>
                    Memory size
                  </span>
                </label>

                <label>
                  <span style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500 }}>
                    Storage
                  </span>
                  <input 
                    type="text"
                    value={newProduct.storage}
                    onChange={(e) => setNewProduct({ ...newProduct, storage: e.target.value })}
                    placeholder="e.g., 128GB, 256GB, 512GB"
                    style={{ height: "44px", fontSize: "15px" }}
                  />
                  <span style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px", display: "block" }}>
                    Internal storage
                  </span>
                </label>

                <label>
                  <span style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500 }}>
                    Color <span style={{ color: "#ef4444" }}>*</span>
                  </span>
                  <input 
                    type="text"
                    value={newProduct.color}
                    onChange={(e) => setNewProduct({ ...newProduct, color: e.target.value })}
                    placeholder="e.g., Midnight Black, Blue, Gold"
                    required
                    style={{ height: "44px", fontSize: "15px" }}
                  />
                  <span style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px", display: "block" }}>
                    Phone color
                  </span>
                </label>

                <label>
                  <span style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500 }}>
                    Warranty
                  </span>
                  <select
                    value={newProduct.warranty}
                    onChange={(e) => setNewProduct({ ...newProduct, warranty: e.target.value })}
                    style={{ height: "44px", fontSize: "15px" }}
                  >
                    <option value="Brand 1 Year">Brand 1 Year</option>
                    <option value="Brand 2 Years">Brand 2 Years</option>
                    <option value="Extended Warranty">Extended Warranty</option>
                    <option value="No Warranty">No Warranty</option>
                  </select>
                  <span style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px", display: "block" }}>
                    Warranty coverage
                  </span>
                </label>
              </div>

              <label style={{ display: "block" }}>
                <span style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500 }}>
                  Variant/Configuration (Optional)
                </span>
                <input 
                  type="text"
                  value={newProduct.variant}
                  onChange={(e) => setNewProduct({ ...newProduct, variant: e.target.value })}
                  placeholder="e.g., 8GB/128GB or leave blank for auto-generation"
                  style={{ height: "44px", fontSize: "15px" }}
                />
                <span style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px", display: "block" }}>
                  Leave blank to auto-generate from RAM/Storage
                </span>
              </label>
            </div>

            {/* Step 2: Pricing & Stock */}
            <div style={{ marginBottom: "24px", padding: "20px", backgroundColor: "white", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
              <h4 style={{ marginBottom: "16px", fontSize: "16px", color: "#374151", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px" }}>💰</span> Pricing & Stock Details
              </h4>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <label>
                  <span style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500 }}>
                    Available Quantity <span style={{ color: "#ef4444" }}>*</span>
                  </span>
                  <input 
                    type="number"
                    value={newProduct.availableQty}
                    onChange={(e) => setNewProduct({ ...newProduct, availableQty: Number(e.target.value) })}
                    min="1"
                    required
                    style={{ height: "44px", fontSize: "15px" }}
                    placeholder="How many units?"
                  />
                  <span style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px", display: "block" }}>
                    Number of units in stock
                  </span>
                </label>

                <label>
                  <span style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500 }}>
                    Your Price (₹) <span style={{ color: "#ef4444" }}>*</span>
                  </span>
                  <input 
                    type="number"
                    value={newProduct.minimumPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, minimumPrice: Number(e.target.value) })}
                    min="1000"
                    required
                    style={{ height: "44px", fontSize: "15px" }}
                    placeholder="e.g., 25000"
                  />
                  <span style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px", display: "block" }}>
                    Your wholesale price per unit
                  </span>
                </label>

                <label>
                  <span style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500 }}>
                    Ready in (minutes)
                  </span>
                  <input 
                    type="number"
                    value={newProduct.readyInMinutes}
                    onChange={(e) => setNewProduct({ ...newProduct, readyInMinutes: Number(e.target.value) })}
                    min="5"
                    style={{ height: "44px", fontSize: "15px" }}
                    placeholder="e.g., 30"
                  />
                  <span style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px", display: "block" }}>
                    How quickly can you pack it?
                  </span>
                </label>

                <label>
                  <span style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500 }}>
                    Status
                  </span>
                  <select 
                    value={newProduct.status}
                    onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value })}
                    style={{ height: "44px", fontSize: "15px" }}
                  >
                    <option value="ON">ON (Available for sale)</option>
                    <option value="OFF">OFF (Not available)</option>
                  </select>
                  <span style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px", display: "block" }}>
                    Availability status
                  </span>
                </label>
              </div>
            </div>

            {/* Step 3: Product Images */}
            <div style={{ marginBottom: "24px", padding: "20px", backgroundColor: "white", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
              <h4 style={{ marginBottom: "16px", fontSize: "16px", color: "#374151", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px" }}>📸</span> Product Images (Recommended)
              </h4>
              <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "16px" }}>
                Upload clear photos to attract more buyers. Maximum 5 images, 2MB each.
              </p>
              
              <div 
                style={{ 
                  border: "2px dashed var(--primary)", 
                  borderRadius: "12px", 
                  padding: "32px", 
                  textAlign: "center",
                  backgroundColor: "#dbeafe20",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onClick={() => document.getElementById("imageUpload").click()}
              >
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>📸</div>
                <p style={{ fontSize: "16px", fontWeight: 500, color: "#374151", marginBottom: "4px" }}>
                  Click to upload or drag and drop
                </p>
                <p style={{ fontSize: "13px", color: "#6b7280" }}>
                  JPG, PNG or WEBP (Max 2MB per image, up to 5 images)
                </p>
                <input 
                  id="imageUpload"
                  type="file" 
                  accept="image/jpeg,image/png,image/webp" 
                  multiple 
                  onChange={handleImageUpload} 
                  style={{ display: "none" }}
                />
              </div>

              {images.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                      Uploaded Images ({images.length}/5)
                    </span>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      Click star to set as primary image
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "16px" }}>
                    {images.map((img, idx) => (
                      <div 
                        key={idx} 
                        style={{ 
                          position: "relative", 
                          border: primaryImageIndex === idx ? "3px solid var(--primary)" : "2px solid #e5e7eb", 
                          borderRadius: "12px", 
                          overflow: "hidden",
                          backgroundColor: "white",
                          boxShadow: primaryImageIndex === idx ? "0 4px 12px rgba(37, 99, 235, 0.2)" : "0 1px 3px rgba(0,0,0,0.1)"
                        }}
                      >
                        <img 
                          src={img} 
                          alt={`Product ${idx+1}`} 
                          style={{ 
                            width: "100%", 
                            height: "140px", 
                            objectFit: "cover"
                          }} 
                        />
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); setPrimaryImageIndex(idx); }}
                          style={{ 
                            position: "absolute", 
                            top: 8, 
                            left: 8, 
                            backgroundColor: primaryImageIndex === idx ? "#fbbf24" : "white",
                            color: primaryImageIndex === idx ? "white" : "#6b7280",
                            border: "none",
                            borderRadius: "6px",
                            padding: "4px 8px",
                            fontSize: "18px",
                            cursor: "pointer",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                          }}
                          title={primaryImageIndex === idx ? "Primary image" : "Set as primary"}
                        >
                          {primaryImageIndex === idx ? "⭐" : "☆"}
                        </button>
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                          style={{ 
                            position: "absolute", 
                            top: 8, 
                            right: 8, 
                            backgroundColor: "#ef4444",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            padding: "4px 8px",
                            fontSize: "16px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                          }}
                          title="Remove image"
                        >
                          ✕
                        </button>
                        {primaryImageIndex === idx && (
                          <div style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: "rgba(37, 99, 235, 0.9)",
                            color: "white",
                            padding: "4px 8px",
                            fontSize: "11px",
                            fontWeight: "600",
                            textAlign: "center"
                          }}>
                            PRIMARY IMAGE
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button 
                type="button" 
                className="btn ghost"
                onClick={() => {
                  setShowAddForm(false);
                  setImages([]);
                  setPrimaryImageIndex(0);
                  setError("");
                  setMsg("");
                }}
                disabled={uploading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn"
                disabled={uploading}
                style={{ 
                  minWidth: "200px",
                  opacity: uploading ? 0.6 : 1
                }}
              >
                {uploading ? "Adding Product..." : "✓ Add to Inventory"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inventory Table */}
      <div className="card">
        <h3 style={{ marginBottom: "16px", fontSize: "18px" }}>
          📋 Current Inventory ({inventory.length} {inventory.length === 1 ? 'product' : 'products'})
        </h3>
        
        {inventory.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>📦</div>
            <h4 style={{ marginBottom: "8px", color: "#374151" }}>No products in inventory yet</h4>
            <p className="muted" style={{ marginBottom: "20px" }}>Start by adding your first mobile phone</p>
            <button className="btn" onClick={() => setShowAddForm(true)}>+ Add Your First Product</button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr style={{ backgroundColor: "var(--primary-dark)", color: "white" }}>
                  <th style={{ color: "white" }}>Image</th>
                  <th style={{ color: "white" }}>Product</th>
                  <th style={{ color: "white" }}>Available</th>
                  <th style={{ color: "white" }}>Reserved</th>
                  <th style={{ color: "white" }}>Your Price</th>
                  <th style={{ color: "white" }}>Status</th>
                  <th style={{ color: "white" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((row, index) => (
                  <tr key={row._id} style={{ backgroundColor: index % 2 === 0 ? "white" : "#f9fafb" }}>
                    <td style={{ width: 120, minWidth: 120 }}>
                      <ImageGallery
                        images={row.images || []}
                        primaryImage={row.primaryImage}
                        height={90}
                        showThumbs={false}
                      />
                      {(row.images?.length > 1) && (
                        <div style={{ fontSize: 11, color: "#6b7280", textAlign: "center", marginTop: 3 }}>
                          {row.images.length} photos
                        </div>
                      )}
                    </td>
                    <td>
                      <strong style={{ display: "block", marginBottom: "4px" }}>
                        {row.skuId?.brand} {row.skuId?.model}
                      </strong>
                      <span style={{ fontSize: "13px", color: "#6b7280" }}>
                        {row.skuId?.variant} • {row.skuId?.color}
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        fontSize: "16px", 
                        fontWeight: "600",
                        color: row.availableQty > 0 ? "#10b981" : "#ef4444"
                      }}>
                        {row.availableQty}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "14px", color: "#6b7280" }}>
                        {row.reservedQty || 0}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: "#2563eb" }}>{inr(row.minimumPrice)}</strong>
                    </td>
                    <td>
                      <span 
                        className="badge" 
                        style={{ 
                          backgroundColor: row.status === "ON" ? "#d1fae5" : "#fee2e2",
                          color: row.status === "ON" ? "#047857" : "#dc2626",
                          fontWeight: "600"
                        }}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn ghost small"
                        onClick={async () => {
                          try {
                            await api(`/supplier/inventory/${row._id}`, {
                              method: "PATCH",
                              body: { status: row.status === "ON" ? "OFF" : "ON", verify: true },
                            });
                            load();
                          } catch (e) {
                            setError(e.message);
                          }
                        }}
                        style={{ minWidth: "90px" }}
                      >
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
  );
}

// Keep existing SupplierOrders and SupplierPayouts components
function OrderCard({ order, onUpdate }) {
  const [imei, setImei] = useState("356938035643809");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [checklist, setChecklist] = useState({
    sealedBox: false,
    imeiScanned: false,
    noTampering: false
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
    reader.onload = (event) => {
      setPhotoPreview(event.target.result);
    };
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
    if (photoPreview) {
      body.photoUrl = photoPreview;
    }
    await api(`/supplier/orders/${order._id}/pack`, { method: "POST", body });
    onUpdate();
  }

  const allChecked = checklist.sealedBox && checklist.imeiScanned && checklist.noTampering;

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <strong>
          {order.items?.[0]?.skuId?.brand} {order.items?.[0]?.skuId?.model}
        </strong>
        <span className="badge">{order.status}</span>
      </div>
      <div className="tiny">
        Payout {inr(order.totals?.supplierPayout)} · buyer identity not required for packing
      </div>
      {timeLeft && <div className="tiny" style={{ color: "#ff6b6b", fontWeight: "bold" }}>{timeLeft}</div>}
      
      <div style={{ marginTop: 10 }}>
        {["reserved", "awaiting_accept"].includes(order.status) && (
          <div className="row">
            <button className="btn small" onClick={handleAccept}>Accept</button>
            <button className="btn ghost small" onClick={handleReject}>Reject</button>
          </div>
        )}
        
        {["accepted", "paid"].includes(order.status) && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4 }}>
                <input 
                  type="checkbox" 
                  checked={checklist.sealedBox}
                  onChange={(e) => setChecklist({...checklist, sealedBox: e.target.checked})}
                />
                {" "}Sealed box verified
              </label>
              <label style={{ display: "block", marginBottom: 4 }}>
                <input 
                  type="checkbox" 
                  checked={checklist.imeiScanned}
                  onChange={(e) => setChecklist({...checklist, imeiScanned: e.target.checked})}
                />
                {" "}IMEI/serial label scanned
              </label>
              <label style={{ display: "block", marginBottom: 4 }}>
                <input 
                  type="checkbox" 
                  checked={checklist.noTampering}
                  onChange={(e) => setChecklist({...checklist, noTampering: e.target.checked})}
                />
                {" "}No tampering signs
              </label>
            </div>
            
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: "13px" }}>Box photo</label>
              <input type="file" accept="image/*" onChange={handlePhotoChange} />
              {photoPreview && (
                <img src={photoPreview} alt="Preview" style={{ maxWidth: "200px", marginTop: 8, display: "block" }} />
              )}
            </div>
            
            <div className="row" style={{ alignItems: "center", gap: "8px" }}>
              <input 
                value={imei} 
                onChange={(e) => setImei(e.target.value)}
                placeholder="IMEI"
                style={{ flex: 1 }}
              />
              <button 
                className="btn small" 
                onClick={handlePack}
                disabled={!allChecked}
                style={{ opacity: allChecked ? 1 : 0.5, backgroundColor: "var(--primary)" }}
              >
                Seal & pack
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
  
  useEffect(() => {
    load();
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error) return <div className='alert'>{error}</div>;

  return (
    <div>
      <h2>Incoming orders</h2>
      <p className="tiny">Accept deadline ~5 min. Packing requires IMEI (encrypted, restricted).</p>
      {orders.length === 0 && <p className='muted'>No orders yet</p>}
      {orders.map((o) => (
        <OrderCard key={o._id} order={o} onUpdate={load} />
      ))}
    </div>
  );
}

export function SupplierPayouts() {
  const [rows, setRows] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  useEffect(() => {
    setLoading(true);
    api("/supplier/settlements")
      .then((d) => {
        setAllRows(d.settlements);
        setRows(d.settlements);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (statusFilter === "all") {
      setRows(allRows);
    } else {
      setRows(allRows.filter(r => r.status === statusFilter));
    }
  }, [statusFilter, allRows]);

  if (loading) return <p>Loading…</p>;
  if (error) return <div className='alert'>{error}</div>;

  return (
    <div>
      <h2>Payout ledger</h2>
      <p className="muted">Rule: T+1 after proof of delivery. Pilot uses delivery-triggered eligibility.</p>
      
      <div style={{ marginBottom: 12 }}>
        <label>
          Status filter:{" "}
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="eligible">Eligible</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </label>
      </div>

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
              <td>{r.orderId}</td>
              <td>{inr(r.landedPrice || r.payout + r.platformFee + (r.deliveryCharge || 0))}</td>
              <td>{inr(r.platformFee)}</td>
              <td>{inr(r.deliveryCharge || 0)}</td>
              <td>{inr(r.payout)}</td>
              <td><span className="badge">{r.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className='muted'>No settlements yet</p>}
    </div>
  );
}
