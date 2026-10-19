import { useEffect, useState } from "react";
import { api, inr } from "../api.js";

export function SupplierStock() {
  const [inventory, setInventory] = useState([]);
  const [skus, setSkus] = useState([]);
  const [form, setForm] = useState({ skuId: "", availableQty: 2, minimumPrice: 10000, readyInMinutes: 5, status: "ON" });
  const [msg, setMsg] = useState("");

  async function load() {
    const [a, b] = await Promise.all([api("/supplier/inventory"), api("/catalog/search?q=")]);
    setInventory(a.inventory);
    setSkus(b.skus);
    if (b.skus[0]) setForm((f) => ({ ...f, skuId: f.skuId || b.skus[0]._id }));
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

  return (
    <div>
      <h2>Live inventory</h2>
      <p className="muted">Buyer ko sirf available qty, net price, ETA dikhega — aapka naam nahi.</p>
      {msg && <div className="ok">{msg}</div>}
      <form className="card form" onSubmit={save} style={{ marginBottom: 20 }}>
        <div className="grid cols-2">
          <label>
            SKU
            <select value={form.skuId} onChange={(e) => setForm({ ...form, skuId: e.target.value })}>
              {skus.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.brand} {s.model} {s.variant} {s.color}
                </option>
              ))}
            </select>
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
    </div>
  );
}

export function SupplierOrders() {
  const [orders, setOrders] = useState([]);
  const [imei, setImei] = useState("356938035643809");
  async function load() {
    const d = await api("/supplier/orders");
    setOrders(d.orders);
  }
  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h2>Incoming orders</h2>
      <p className="tiny">Accept deadline ~5 min. Packing requires IMEI (encrypted, restricted).</p>
      {orders.map((o) => (
        <div className="card" key={o._id} style={{ marginBottom: 12 }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <strong>
              {o.items?.[0]?.skuId?.brand} {o.items?.[0]?.skuId?.model}
            </strong>
            <span className="badge">{o.status}</span>
          </div>
          <div className="tiny">Payout {inr(o.totals?.supplierPayout)} · buyer identity not required for packing</div>
          <div className="row" style={{ marginTop: 10 }}>
            {["reserved", "awaiting_accept"].includes(o.status) && (
              <>
                <button className="btn small" onClick={async () => { await api(`/supplier/orders/${o._id}/accept`, { method: "POST" }); load(); }}>
                  Accept
                </button>
                <button className="btn ghost small" onClick={async () => { await api(`/supplier/orders/${o._id}/reject`, { method: "POST", body: { reason: "Out of stock" } }); load(); }}>
                  Reject
                </button>
              </>
            )}
            {["accepted", "paid"].includes(o.status) && (
              <>
                <input value={imei} onChange={(e) => setImei(e.target.value)} />
                <button className="btn teal small" onClick={async () => { await api(`/supplier/orders/${o._id}/pack`, { method: "POST", body: { imei, serial: imei } }); load(); }}>
                  Seal & pack
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SupplierPayouts() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    api("/supplier/settlements").then((d) => setRows(d.settlements));
  }, []);
  return (
    <div>
      <h2>Payout ledger</h2>
      <p className="muted">Rule: T+1 after proof of delivery. Pilot uses delivery-triggered eligibility.</p>
      <table>
        <thead>
          <tr>
            <th>Order</th>
            <th>Payout</th>
            <th>Fee</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r._id}>
              <td>{r.orderId}</td>
              <td>{inr(r.payout)}</td>
              <td>{inr(r.platformFee)}</td>
              <td>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
