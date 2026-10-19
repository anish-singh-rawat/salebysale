import { useEffect, useState } from "react";
import { api, inr } from "../api.js";

export function SupplierStock() {
  const [inventory, setInventory] = useState([]);
  const [skus, setSkus] = useState([]);
  const [form, setForm] = useState({ skuId: "", availableQty: 2, minimumPrice: 10000, readyInMinutes: 5, status: "ON" });
  const [msg, setMsg] = useState("");
  const [showSkuBrowser, setShowSkuBrowser] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [a, b] = await Promise.all([api("/supplier/inventory"), api("/catalog/search?q=")]);
      setInventory(a.inventory);
      setSkus(b.skus);
      if (b.skus[0]) setForm((f) => ({ ...f, skuId: f.skuId || b.skus[0]._id }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function save(e) {
    e.preventDefault();
    await api("/supplier/inventory", { method: "POST", body: form });
    setMsg("Stock saved & verified now");
    load();
  }

  async function handleCSVUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split("\n").filter(l => l.trim());
      const headers = lines[0].split(",").map(h => h.trim());
      
      const items = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map(v => v.trim());
        const row = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx];
        });
        
        // Find SKU ID from skuCode
        const sku = skus.find(s => s.skuCode === row.skuCode);
        if (sku) {
          items.push({
            skuId: sku._id,
            availableQty: Number(row.availableQty) || 1,
            minimumPrice: Number(row.minimumPrice) || 10000,
            readyInMinutes: Number(row.readyInMinutes) || 5,
            status: row.status || "ON"
          });
        }
      }
      
      if (items.length > 0) {
        await api("/supplier/inventory/bulk", { method: "POST", body: { items } });
        setMsg(`${items.length} items uploaded successfully`);
        load();
      } else {
        setMsg("No valid items found in CSV");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // Reset input
  }

  async function searchSKUs() {
    const result = await api(`/catalog/search?q=${searchQuery}`);
    setSearchResults(result.skus);
  }

  function selectSKU(sku) {
    setForm({ ...form, skuId: sku._id });
    setShowSkuBrowser(false);
    setSearchQuery("");
    setSearchResults([]);
  }

  if (loading) return <p>Loading…</p>;
  if (error) return <div className='alert'>{error}</div>;

  return (
    <div>
      <h2>Live inventory</h2>
      <p className="muted">Buyer ko sirf available qty, net price, ETA dikhega — aapka naam nahi.</p>
      {msg && <div className="ok">{msg}</div>}
      <form className="card form" onSubmit={save} style={{ marginBottom: 20 }}>
        <div className="grid cols-2">
          <label>
            SKU
            <div style={{ display: "flex", gap: "8px" }}>
              <select value={form.skuId} onChange={(e) => setForm({ ...form, skuId: e.target.value })} style={{ flex: 1 }}>
                {skus.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.brand} {s.model} {s.variant} {s.color}
                  </option>
                ))}
              </select>
              <button type="button" className="btn ghost small" onClick={() => setShowSkuBrowser(!showSkuBrowser)}>
                Browse SKUs
              </button>
            </div>
          </label>
          <label>
            Floor price
            <input type="number" value={form.minimumPrice} onChange={(e) => setForm({ ...form, minimumPrice: Number(e.target.value) })} />
          </label>
          <label>
            Qty
            <input type="number" value={form.availableQty} onChange={(e) => setForm({ ...form, availableQty: Number(e.target.value) })} />
          </label>
          <label>
            Ready in minutes
            <input type="number" value={form.readyInMinutes} onChange={(e) => setForm({ ...form, readyInMinutes: Number(e.target.value) })} />
          </label>
        </div>
        <button className="btn">Upsert stock</button>
      </form>

      {showSkuBrowser && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3>Browse SKUs</h3>
          <div style={{ display: "flex", gap: "8px", marginBottom: 12 }}>
            <input 
              type="text" 
              placeholder="Search brand, model..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1 }}
            />
            <button className="btn small" onClick={searchSKUs}>Search</button>
          </div>
          {searchResults.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>SKU Code</th>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Variant</th>
                  <th>Color</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((sku) => (
                  <tr key={sku._id}>
                    <td>{sku.skuCode}</td>
                    <td>{sku.brand}</td>
                    <td>{sku.model}</td>
                    <td>{sku.variant}</td>
                    <td>{sku.color}</td>
                    <td>
                      <button className="btn ghost small" onClick={() => selectSKU(sku)}>Select</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div className="card" style={{ marginBottom: 20 }}>
        <h3>Bulk upload (CSV)</h3>
        <p className="tiny">Columns: skuCode, availableQty, minimumPrice, readyInMinutes, status</p>
        <input type="file" accept=".csv" onChange={handleCSVUpload} />
      </div>

      <table>
        <thead>
          <tr>
            <th>SKU</th>
            <th>Avail / reserved</th>
            <th>Floor</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {inventory.map((row) => (
            <tr key={row._id}>
              <td>
                {row.skuId?.brand} {row.skuId?.model} {row.skuId?.color}
              </td>
              <td>
                {row.availableQty} / {row.reservedQty}
              </td>
              <td>{inr(row.minimumPrice)}</td>
              <td>
                <span className="badge">{row.status}</span>
              </td>
              <td>
                <button
                  className="btn ghost small"
                  onClick={async () => {
                    await api(`/supplier/inventory/${row._id}`, {
                      method: "PATCH",
                      body: { status: row.status === "ON" ? "OFF" : "ON", verify: true },
                    });
                    load();
                  }}
                >
                  Toggle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {inventory.length === 0 && <p className='muted'>No inventory yet. Add stock above.</p>}
    </div>
  );
}

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
                className="btn teal small" 
                onClick={handlePack}
                disabled={!allChecked}
                style={{ opacity: allChecked ? 1 : 0.5 }}
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
