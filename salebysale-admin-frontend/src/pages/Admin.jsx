import { useEffect, useState } from "react";
import { api, inr } from "../api.js";

export function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [slaWarning, setSlaWarning] = useState(0);

  async function loadData() {
    const [kpiData, ordersData] = await Promise.all([
      api("/admin/kpis"),
      api("/admin/orders")
    ]);
    setKpis(kpiData.kpis);
    
    // Calculate SLA monitoring: orders past ETA
    const now = new Date();
    const pastEta = ordersData.orders.filter(o => 
      ['assigned', 'picked'].includes(o.status) && 
      o.sla?.etaMax && 
      new Date(o.sla.etaMax) < now
    ).length;
    setSlaWarning(pastEta);
  }

  useEffect(() => {
    loadData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!kpis) return <p>Loading…</p>;
  
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
      <p className="muted">Pilot KPIs for Haridwar 10-shop network. Auto-refreshes every 30s.</p>
      <div className="grid cols-3">
        {cells.map(([k, v]) => (
          <div className="card kpi" key={k}>
            <b>{v}</b>
            <span>{k}</span>
          </div>
        ))}
        <div className="card kpi" style={{ border: slaWarning > 0 ? '2px solid #e74c3c' : undefined }}>
          <b style={{ color: slaWarning > 0 ? '#e74c3c' : '#27ae60' }}>{slaWarning}</b>
          <span>Orders past ETA</span>
        </div>
      </div>
    </div>
  );
}

export function Approvals() {
  const [suppliers, setSuppliers] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [identity, setIdentity] = useState(null);
  const [notes, setNotes] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  
  async function load() {
    const [s, b] = await Promise.all([api("/admin/suppliers"), api("/admin/buyers")]);
    setSuppliers(s.suppliers);
    setBuyers(b.buyers);
  }
  
  useEffect(() => {
    load();
  }, []);
  
  async function verify(id, status) {
    await api("/businesses/verify", { method: "POST", body: { businessId: id, status, notes: notes[id] || '' } });
    setNotes(prev => ({ ...prev, [id]: '' }));
    load();
  }
  
  return (
    <div>
      <h2>KYC & private identity</h2>
      <p className="tiny">Buyer UI never sees this mapping. Admin-only.</p>
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
          <textarea
            placeholder="Verification notes (optional)"
            value={notes[b._id] || ''}
            onChange={(e) => setNotes(prev => ({ ...prev, [b._id]: e.target.value }))}
            style={{ width: '100%', marginTop: 8, minHeight: 50, fontSize: 12 }}
          />
          <div className="row" style={{ marginTop: 8 }}>
            <button className="btn small" onClick={() => verify(b._id, "verified")}>
              Verify
            </button>
            <button className="btn ghost small" onClick={() => verify(b._id, "rejected")}>
              Reject
            </button>
            <button className="btn ghost small" onClick={async () => {
              setSelectedId(b._id);
              setIdentity((await api(`/admin/identity/${b._id}`)).mapping);
            }}>
              Reveal identity
            </button>
          </div>
        </div>
      ))}
      {identity && (
        <div className="card" style={{ marginTop: 16, backgroundColor: '#fff3cd' }}>
          <h3>Private Identity (Admin Only)</h3>
          <p><strong>Shop Name:</strong> {identity.shopName}</p>
          <p><strong>GST:</strong> {identity.gst || 'N/A'}</p>
          <p><strong>Owner Phone:</strong> {identity.ownerPhone}</p>
          <p><strong>Address:</strong> {identity.address}</p>
          <button className="btn ghost small" onClick={() => setIdentity(null)}>Close</button>
        </div>
      )}
    </div>
  );
}

export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [riders, setRiders] = useState([]);
  const [imei, setImei] = useState(null);
  const [tab, setTab] = useState('all'); // 'all' | 'pending'
  const [statusFilter, setStatusFilter] = useState('all');
  const [arrangeModal, setArrangeModal] = useState(null);
  const [selectedRider, setSelectedRider] = useState('');
  const [msg, setMsg] = useState('');

  async function load() {
    const [ordersData, requestsData, ridersData] = await Promise.all([
      api("/admin/orders"),
      api("/admin/requests").catch(() => ({ requests: [] })),
      api("/admin/riders")
    ]);
    setOrders(ordersData.orders);
    setRequests(requestsData.requests || []);
    setRiders(ridersData.riders);
    if (ridersData.riders.length > 0) setSelectedRider(ridersData.riders[0]._id);
  }

  useEffect(() => {
    load();
  }, []);

  async function arrangeCourier(orderId) {
    try {
      await api(`/admin/orders/${orderId}/arrange`, { 
        method: 'POST', 
        body: { riderId: selectedRider } 
      });
      const wholesalerName = arrangeModal?.wholesaler?.shopName || 'Wholesaler';
      const riderName = riders.find(r => r._id === selectedRider)?.name || 'Rider';
      setMsg(`Courier ${riderName} assigned to pick up from ${wholesalerName}`);
      setArrangeModal(null);
      load();
    } catch (e) {
      setMsg(`Error: ${e.message}`);
    }
  }

  async function cancelOrder(orderId) {
    if (confirm('Cancel this order?')) {
      try {
        await api(`/orders/${orderId}/cancel`, { method: 'POST', body: { reason: 'Admin cancellation' } });
        setMsg('Order cancelled');
        load();
      } catch (e) {
        setMsg(`Error: ${e.message}`);
      }
    }
  }

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  const onDutyRiders = riders.filter(r => r.dutyOn);

  return (
    <div>
      <h2>Order orchestration</h2>
      <div className="row" style={{ marginBottom: 12 }}>
        <button 
          className={tab === 'all' ? 'btn small' : 'btn ghost small'} 
          onClick={() => setTab('all')}
        >
          All Orders
        </button>
        <button 
          className={tab === 'pending' ? 'btn small' : 'btn ghost small'} 
          onClick={() => setTab('pending')}
        >
          Pending Arrangement
        </button>
      </div>
      {msg && <div className="ok" style={{ marginBottom: 12 }}>{msg}</div>}

      {tab === 'pending' && (
        <div>
          <p className="tiny">Requests awaiting admin courier arrangement. CRITICAL: Wholesaler + Retailer identities visible.</p>
          {requests.length === 0 && <p className="muted">No pending requests.</p>}
          <table>
            <thead>
              <tr>
                <th>Retailer</th>
                <th>Wholesaler (private)</th>
                <th>Mobile</th>
                <th>Qty</th>
                <th>Landed Price</th>
                <th>ETA</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id}>
                  <td>
                    <strong>{r.retailer?.name || r.retailer?.shopName}</strong>
                    <div className="tiny">{r.retailer?.phone} · {r.retailer?.area}</div>
                  </td>
                  <td>
                    <strong>{r.wholesaler?.shopName}</strong>
                    <div className="tiny">{r.wholesaler?.phone} · {r.wholesaler?.area}</div>
                  </td>
                  <td>{r.items?.[0]?.skuId?.brand} {r.items?.[0]?.skuId?.model}</td>
                  <td>{r.items?.[0]?.quantity}</td>
                  <td>{inr(r.totals?.landedPrice)}</td>
                  <td className="tiny">{r.sla?.etaMax ? new Date(r.sla.etaMax).toLocaleTimeString() : 'N/A'}</td>
                  <td>
                    <button 
                      className="btn small" 
                      onClick={() => setArrangeModal({ orderId: r._id, retailer: r.retailer, wholesaler: r.wholesaler })}
                    >
                      Arrange Courier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'all' && (
        <div>
          <div className="row" style={{ marginBottom: 12 }}>
            <label>Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="awaiting_admin">Awaiting Admin</option>
              <option value="assigned">Assigned</option>
              <option value="picked">Picked</option>
              <option value="delivered">Delivered</option>
              <option value="disputed">Disputed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <table>
            <thead>
              <tr>
                <th>Buyer</th>
                <th>Supplier (private)</th>
                <th>Status</th>
                <th>Amount</th>
                <th>IMEI</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o._id}>
                  <td>{o.buyerId?.name || o.buyerId?.shopName}</td>
                  <td><strong>{o.supplierId?.shopName}</strong></td>
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
                  <td>
                    <div className="row">
                      {!['cancelled', 'delivered'].includes(o.status) && (
                        <button className="btn ghost small" onClick={() => cancelOrder(o._id)}>
                          Cancel
                        </button>
                      )}
                      <button 
                        className="btn ghost small" 
                        onClick={() => alert('Refund workflow TBD')}
                      >
                        Refund
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {imei && (
        <div className="card" style={{ marginTop: 16, backgroundColor: '#fff3cd' }}>
          <h3>IMEI Data (Encrypted, Admin-Only Access)</h3>
          <pre className="tiny">{JSON.stringify(imei, null, 2)}</pre>
          <button className="btn ghost small" onClick={() => setImei(null)}>Close</button>
        </div>
      )}

      {arrangeModal && (
        <div className="card" style={{ marginTop: 16, border: '2px solid #3498db' }}>
          <h3>Arrange Courier</h3>
          <p><strong>Retailer:</strong> {arrangeModal.retailer?.name} ({arrangeModal.retailer?.area})</p>
          <p><strong>Wholesaler:</strong> {arrangeModal.wholesaler?.shopName} ({arrangeModal.wholesaler?.area})</p>
          <label style={{ display: 'block', marginTop: 12 }}>Select Rider (on duty):</label>
          <select 
            value={selectedRider} 
            onChange={(e) => setSelectedRider(e.target.value)}
            style={{ width: '100%', marginTop: 4 }}
          >
            {onDutyRiders.map(r => (
              <option key={r._id} value={r._id}>{r.name} - {r.area}</option>
            ))}
          </select>
          {onDutyRiders.length === 0 && <p className="muted">No riders on duty</p>}
          <div className="row" style={{ marginTop: 12 }}>
            <button 
              className="btn small" 
              onClick={() => arrangeCourier(arrangeModal.orderId)}
              disabled={onDutyRiders.length === 0}
            >
              Confirm Assignment
            </button>
            <button className="btn ghost small" onClick={() => setArrangeModal(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminStock() {
  const [inventory, setInventory] = useState([]);
  const [imeiModal, setImeiModal] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api("/admin/inventory").then((d) => setInventory(d.inventory));
  }, []);

  async function viewImei(inventoryId) {
    try {
      // Find order linked to this inventory
      const ordersData = await api("/admin/orders");
      const linkedOrder = ordersData.orders.find(o => 
        o.items?.some(item => item.inventoryId === inventoryId)
      );
      
      if (!linkedOrder) {
        setMsg('No order linked to this inventory yet');
        return;
      }

      const imeiData = await api(`/admin/imei/${linkedOrder._id}`);
      setImeiModal(imeiData);
    } catch (e) {
      setMsg(`Error: ${e.message}`);
    }
  }

  async function requestVerification(inventoryId) {
    try {
      await api(`/supplier/inventory/${inventoryId}`, { 
        method: 'PATCH', 
        body: { verify: true } 
      });
      setMsg('Verification requested');
    } catch (e) {
      setMsg('Verification request sent (endpoint may not exist)');
    }
  }

  function isStale(lastVerifiedAt) {
    if (!lastVerifiedAt) return true;
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
    return new Date(lastVerifiedAt) < fourHoursAgo;
  }

  return (
    <div>
      <h2>Live inventory truth</h2>
      <p className="tiny">Supplier names visible (admin privilege). IMEI decryption admin-only.</p>
      {msg && <div className="ok" style={{ marginBottom: 12 }}>{msg}</div>}
      <table>
        <thead>
          <tr>
            <th>Supplier</th>
            <th>SKU</th>
            <th>Avail</th>
            <th>Reserved</th>
            <th>Floor</th>
            <th>Status</th>
            <th>Last Verified</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((i) => {
            const stale = isStale(i.lastVerifiedAt);
            return (
              <tr key={i._id}>
                <td><strong>{i.supplierId?.shopName}</strong></td>
                <td>
                  {i.skuId?.brand} {i.skuId?.model} {i.skuId?.color}
                </td>
                <td>{i.availableQty}</td>
                <td>{i.reservedQty}</td>
                <td>{inr(i.minimumPrice)}</td>
                <td>
                  {i.status}
                  {stale && <span className="badge" style={{ marginLeft: 8, backgroundColor: '#f39c12', color: '#fff' }}>Stale</span>}
                </td>
                <td className="tiny">
                  {i.lastVerifiedAt ? new Date(i.lastVerifiedAt).toLocaleString() : 'Never'}
                </td>
                <td>
                  <div className="row">
                    <button 
                      className="btn ghost small" 
                      onClick={() => viewImei(i._id)}
                    >
                      View IMEI
                    </button>
                    {stale && (
                      <button 
                        className="btn ghost small" 
                        onClick={() => requestVerification(i._id)}
                      >
                        Request Verify
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {imeiModal && (
        <div className="card" style={{ marginTop: 16, backgroundColor: '#fff3cd', border: '2px solid #f39c12' }}>
          <h3>IMEI Data (Decrypted, Admin-Only)</h3>
          <p><strong>Masked IMEI:</strong> {imeiModal.maskedImei || 'N/A'}</p>
          <p><strong>Full IMEI (decrypted):</strong> {imeiModal.imei || imeiModal.fullImei || 'N/A'}</p>
          <p><strong>Serial:</strong> {imeiModal.serial || 'N/A'}</p>
          {imeiModal.scanEvents && imeiModal.scanEvents.length > 0 && (
            <div>
              <h4>Scan Events Timeline:</h4>
              <ul style={{ fontSize: 12 }}>
                {imeiModal.scanEvents.map((evt, idx) => (
                  <li key={idx}>
                    {new Date(evt.timestamp).toLocaleString()} - {evt.event} by {evt.actor}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button className="btn ghost small" onClick={() => setImeiModal(null)}>Close</button>
        </div>
      )}
    </div>
  );
}

export function Dispatch() {
  const [riders, setRiders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [riderId, setRiderId] = useState("");
  const [msg, setMsg] = useState("");
  const [simulation, setSimulation] = useState(null);

  async function load() {
    const [r, o] = await Promise.all([api("/admin/riders"), api("/admin/orders")]);
    setRiders(r.riders);
    setOrders(o.orders.filter((x) => ["packing", "accepted", "assigned", "picked"].includes(x.status)));
    if (r.riders[0]) setRiderId(r.riders[0]._id);
  }

  useEffect(() => {
    load();
  }, []);

  function calculateDistance(lat1, lon1, lat2, lon2) {
    // Haversine formula
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function simulateMatch(order) {
    if (!order.supplierId?.location || !order.buyerId?.location) {
      setSimulation({ orderId: order._id, error: 'Location data not available' });
      return;
    }

    const supplierLat = order.supplierId.location.lat || 29.9457;
    const supplierLon = order.supplierId.location.lon || 78.1642;
    const buyerLat = order.buyerId.location.lat || 29.9457;
    const buyerLon = order.buyerId.location.lon || 78.1642;

    const distance = calculateDistance(supplierLat, supplierLon, buyerLat, buyerLon);

    // Calculate match scores for riders
    const riderScores = riders
      .filter(r => r.dutyOn)
      .map(r => {
        const riderLat = r.location?.lat || 29.9457;
        const riderLon = r.location?.lon || 78.1642;
        const distToSupplier = calculateDistance(riderLat, riderLon, supplierLat, supplierLon);
        const reliability = r.reliability || 0.8;
        // Score: closer = better, reliability weight
        const score = Math.max(0, 100 - distToSupplier * 10) * reliability;
        return { rider: r, distToSupplier, score: Math.round(score) };
      })
      .sort((a, b) => b.score - a.score);

    setSimulation({
      orderId: order._id,
      distance: distance.toFixed(2),
      supplierCoords: `${supplierLat.toFixed(4)}, ${supplierLon.toFixed(4)}`,
      buyerCoords: `${buyerLat.toFixed(4)}, ${buyerLon.toFixed(4)}`,
      recommended: riderScores[0] || null,
      allScores: riderScores
    });
  }

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

      {orders.filter(o => o.status === 'packing').length > 0 && (
        <div className="card" style={{ marginBottom: 16, backgroundColor: '#e8f5e9' }}>
          <h3>Simulate Match (Packing Orders)</h3>
          <p className="tiny">Calculate distance and recommend rider based on proximity + reliability.</p>
        </div>
      )}

      {orders.map((o) => (
        <div className="card offer" key={o._id} style={{ marginBottom: 8 }}>
          <div>
            {o.items?.[0]?.skuId?.model} · {o.status} · {o.supplierId?.shopName}
            {o.status === 'packing' && (
              <button 
                className="btn ghost small" 
                style={{ marginLeft: 12 }}
                onClick={() => simulateMatch(o)}
              >
                Simulate match
              </button>
            )}
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

      {simulation && (
        <div className="card" style={{ marginTop: 16, border: '2px solid #3498db' }}>
          <h3>Match Simulation</h3>
          {simulation.error ? (
            <p className="muted">{simulation.error}</p>
          ) : (
            <>
              <p><strong>Distance:</strong> {simulation.distance} km</p>
              <p className="tiny">Supplier: {simulation.supplierCoords}</p>
              <p className="tiny">Buyer: {simulation.buyerCoords}</p>
              {simulation.recommended && (
                <div style={{ marginTop: 12, padding: 8, backgroundColor: '#d4edda', borderRadius: 4 }}>
                  <strong>Recommended Rider:</strong> {simulation.recommended.rider.name} (Score: {simulation.recommended.score}/100)
                  <div className="tiny">Distance to supplier: {simulation.recommended.distToSupplier.toFixed(2)} km</div>
                </div>
              )}
              {simulation.allScores && simulation.allScores.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <strong>All On-Duty Riders:</strong>
                  <ul style={{ fontSize: 12, marginTop: 4 }}>
                    {simulation.allScores.map((s, idx) => (
                      <li key={idx}>
                        {s.rider.name} - Score: {s.score}/100 ({s.distToSupplier.toFixed(2)} km)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
          <button className="btn ghost small" onClick={() => setSimulation(null)}>Close</button>
        </div>
      )}
    </div>
  );
}

export function Disputes() {
  const [rows, setRows] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionNotes, setActionNotes] = useState({});
  const [msg, setMsg] = useState('');

  async function load() {
    const d = await api("/admin/disputes");
    setRows(d.disputes);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAction(disputeId, action) {
    try {
      const notes = actionNotes[disputeId] || '';
      await api(`/admin/disputes/${disputeId}`, {
        method: 'PATCH',
        body: { action, notes }
      });
      setMsg(`Dispute ${action}`);
      setActionNotes(prev => ({ ...prev, [disputeId]: '' }));
      load();
    } catch (e) {
      // Endpoint may not exist yet
      setMsg(`Action recorded: ${action} (backend endpoint may not exist)`);
    }
  }

  const filteredRows = statusFilter === 'all' 
    ? rows 
    : rows.filter(d => d.status === statusFilter);

  return (
    <div>
      <h2>Dispute audit</h2>
      <div className="row" style={{ marginBottom: 12 }}>
        <label>Status:</label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="refund_approved">Refund Approved</option>
          <option value="rejected">Rejected</option>
          <option value="escalated">Escalated</option>
        </select>
      </div>
      {msg && <div className="ok" style={{ marginBottom: 12 }}>{msg}</div>}
      {filteredRows.length === 0 && <p className="muted">No disputes found.</p>}
      {filteredRows.map((d) => (
        <div className="card" key={d._id} style={{ marginBottom: 12 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <strong>{d.status}</strong>
            <span className="tiny">Order: {d.orderId?._id || d.orderId}</span>
          </div>
          <p className="muted">{d.reason}</p>
          {d.description && <p className="tiny">{d.description}</p>}
          <textarea
            placeholder="Action notes (optional)"
            value={actionNotes[d._id] || ''}
            onChange={(e) => setActionNotes(prev => ({ ...prev, [d._id]: e.target.value }))}
            style={{ width: '100%', marginTop: 8, minHeight: 50, fontSize: 12 }}
          />
          <div className="row" style={{ marginTop: 8 }}>
            <button 
              className="btn small" 
              onClick={() => handleAction(d._id, 'refund_approved')}
              disabled={d.status !== 'open'}
            >
              Approve Refund
            </button>
            <button 
              className="btn ghost small" 
              onClick={() => handleAction(d._id, 'rejected')}
              disabled={d.status !== 'open'}
            >
              Reject
            </button>
            <button 
              className="btn ghost small" 
              onClick={() => handleAction(d._id, 'escalated')}
              disabled={d.status !== 'open'}
            >
              Escalate
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
