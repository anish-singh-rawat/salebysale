import { useEffect, useState } from "react";
import { api, inr } from "../api.js";

export function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  useEffect(() => {
    setLoading(true);
    api("/admin/kpis")
      .then((d) => setKpis(d.kpis))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  
  if (loading) return <p>Loading…</p>;
  if (error) return <div className='alert'>{error}</div>;
  if (!kpis) return <p className='muted'>No data available</p>;
  
  const cells = [
    ["Active suppliers", kpis.activeSuppliers],
    ["Live SKUs", kpis.liveSkus],
    ["Verified stock units", kpis.verifiedStockUnits],
    ["Orders", kpis.orders],
    ["Fill rate %", kpis.orderFillRate],
    ["Cancel %", kpis.cancellationRate],
    ["GMV", inr(kpis.gmv)],
    ["Gross platform fee", inr(kpis.platformFee)],
    ["Open disputes", kpis.disputesOpen],
  ];
  return (
    <div>
      <h2>Live dashboard</h2>
      <p className="muted">Pilot KPIs for Haridwar 10-shop network.</p>
      <div className="grid cols-3">
        {cells.map(([k, v]) => (
          <div className="card kpi" key={k}>
            <b>{v}</b>
            <span>{k}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Approvals() {
  const [suppliers, setSuppliers] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [identity, setIdentity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  async function load() {
    setLoading(true);
    try {
      const [s, b] = await Promise.all([api("/admin/suppliers"), api("/admin/buyers")]);
      setSuppliers(s.suppliers);
      setBuyers(b.buyers);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function verify(id, status) {
    await api("/businesses/verify", { method: "POST", body: { businessId: id, status } });
    load();
  }
  
  if (loading) return <p>Loading…</p>;
  if (error) return <div className='alert'>{error}</div>;
  
  return (
    <div>
      <h2>KYC & private identity</h2>
      <p className="tiny">Buyer UI never sees this mapping. Admin-only.</p>
      {[...suppliers, ...buyers].length === 0 && <p className='muted'>No pending KYC requests</p>}
      {[...suppliers, ...buyers].map((b) => (
        <div className="card offer" key={b._id} style={{ marginBottom: 8 }}>
          <div>
            <strong>
              {b.shopName} · {b.listingCode}
            </strong>
            <div className="tiny">
              {b.role} · {b.kycStatus} · {b.area}
            </div>
          </div>
          <div className="row">
            <button className="btn small" onClick={() => verify(b._id, "verified")}>
              Verify
            </button>
            <button className="btn ghost small" onClick={async () => setIdentity((await api(`/admin/identity/${b._id}`)).mapping)}>
              Reveal identity
            </button>
          </div>
        </div>
      ))}
      {identity && (
        <div className="card">
          <pre className="tiny">{JSON.stringify(identity, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [imei, setImei] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  useEffect(() => {
    setLoading(true);
    api("/admin/orders")
      .then((d) => setOrders(d.orders))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  
  if (loading) return <p>Loading…</p>;
  if (error) return <div className='alert'>{error}</div>;
  
  return (
    <div>
      <h2>Order orchestration</h2>
      {orders.length === 0 && <p className='muted'>No orders yet</p>}
      <table>
        <thead>
          <tr>
            <th>Buyer</th>
            <th>Supplier (private)</th>
            <th>Status</th>
            <th>Amount</th>
            <th>IMEI</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>{o.buyerId?.name}</td>
              <td>{o.supplierId?.shopName}</td>
              <td>{o.status}</td>
              <td>{inr(o.totals?.landedPrice)}</td>
              <td>
                <button
                  className="btn ghost small"
                  onClick={async () => {
                    try {
                      setImei(await api(`/admin/imei/${o._id}`));
                    } catch (e) {
                      setImei({ message: e.message });
                    }
                  }}
                >
                  Restricted
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {imei && <pre className="card tiny">{JSON.stringify(imei, null, 2)}</pre>}
    </div>
  );
}

export function AdminStock() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  useEffect(() => {
    setLoading(true);
    api("/admin/inventory")
      .then((d) => setInventory(d.inventory))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  
  if (loading) return <p>Loading…</p>;
  if (error) return <div className='alert'>{error}</div>;
  
  return (
    <div>
      <h2>Live inventory truth</h2>
      {inventory.length === 0 && <p className='muted'>No inventory yet</p>}
      <table>
        <thead>
          <tr>
            <th>Supplier</th>
            <th>SKU</th>
            <th>Avail</th>
            <th>Reserved</th>
            <th>Floor</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((i) => (
            <tr key={i._id}>
              <td>{i.supplierId?.shopName}</td>
              <td>
                {i.skuId?.brand} {i.skuId?.model} {i.skuId?.color}
              </td>
              <td>{i.availableQty}</td>
              <td>{i.reservedQty}</td>
              <td>{inr(i.minimumPrice)}</td>
              <td>{i.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Dispatch() {
  const [riders, setRiders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [riderId, setRiderId] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  async function load() {
    setLoading(true);
    try {
      const [r, o] = await Promise.all([api("/admin/riders"), api("/admin/orders")]);
      setRiders(r.riders);
      setOrders(o.orders.filter((x) => ["packing", "accepted", "assigned", "picked"].includes(x.status)));
      if (r.riders[0]) setRiderId(r.riders[0]._id);
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
      <h2>Geo dispatch</h2>
      <div className="row" style={{ marginBottom: 12 }}>
        <select value={riderId} onChange={(e) => setRiderId(e.target.value)}>
          {riders.map((r) => (
            <option key={r._id} value={r._id}>
              {r.name} {r.dutyOn ? "(ON)" : "(OFF)"}
            </option>
          ))}
        </select>
        <button
          className="btn ghost"
          onClick={async () => {
            const d = await api("/admin/auto-assign", { method: "POST" });
            setMsg(`Auto-assigned ${d.assigned}`);
            load();
          }}
        >
          Auto-assign packing orders
        </button>
      </div>
      {msg && <div className="ok">{msg}</div>}
      {orders.length === 0 && <p className='muted'>No orders for dispatch</p>}
      {orders.map((o) => (
        <div className="card offer" key={o._id} style={{ marginBottom: 8 }}>
          <div>
            {o.items?.[0]?.skuId?.model} · {o.status} · {o.supplierId?.shopName}
          </div>
          <button
            className="btn small"
            onClick={async () => {
              await api("/shipments/assign", { method: "POST", body: { orderId: o._id, riderId } });
              setMsg("Rider assigned");
              load();
            }}
          >
            Assign rider
          </button>
        </div>
      ))}
    </div>
  );
}

export function Disputes() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  useEffect(() => {
    setLoading(true);
    api("/admin/disputes")
      .then((d) => setRows(d.disputes))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  
  if (loading) return <p>Loading…</p>;
  if (error) return <div className='alert'>{error}</div>;
  
  return (
    <div>
      <h2>Dispute audit</h2>
      {rows.map((d) => (
        <div className="card" key={d._id}>
          <strong>{d.status}</strong>
          <p className="muted">{d.reason}</p>
        </div>
      ))}
      {!rows.length && <p className="muted">No open disputes.</p>}
    </div>
  );
}
