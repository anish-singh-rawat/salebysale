import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";

export default function Rider() {
  const { user, refresh } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");
  const [photoFile, setPhotoFile] = useState({});
  const [photoPreview, setPhotoPreview] = useState({});
  const [failedReason, setFailedReason] = useState({});
  const [showFailForm, setShowFailForm] = useState({});
  const [failNotes, setFailNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const d = await api("/shipments/mine");
      setShipments(d.shipments);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function duty(on) {
    await api("/riders/duty", { method: "POST", body: { on, lat: 29.94, lng: 78.14 } });
    refresh();
  }

  const deliveredCount = shipments.filter((s) => s.status === "delivered").length;
  const earnings = deliveredCount * 50;

  async function handlePhotoChange(shipmentId, e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      setPhotoFile({ ...photoFile, [shipmentId]: base64 });
      setPhotoPreview({ ...photoPreview, [shipmentId]: base64 });
    };
    reader.readAsDataURL(file);
  }

  async function handleMarkFailed(shipmentId) {
    const reason = failedReason[shipmentId] || "Other";
    const notes = failNotes[shipmentId] || "";
    await api(`/shipments/${shipmentId}/fail`, {
      method: "POST",
      body: { reason, notes },
    });
    setMsg("Shipment marked as failed");
    setShowFailForm({ ...showFailForm, [shipmentId]: false });
    setFailedReason({ ...failedReason, [shipmentId]: "" });
    setFailNotes({ ...failNotes, [shipmentId]: "" });
    load();
  }

  if (loading) return <p>Loading…</p>;
  if (error) return <div className='alert'>{error}</div>;

  return (
    <div>
      <h2>Rider duty</h2>
      <div className="card" style={{ marginBottom: 16 }}>
        <p>
          Status: <strong>{user?.dutyOn ? "ON duty" : "OFF duty"}</strong>
        </p>
        <div className="row">
          <button className="btn" onClick={() => duty(true)}>
            Duty ON
          </button>
          <button className="btn ghost" onClick={() => duty(false)}>
            Duty OFF
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Earnings</h3>
        <p>
          <strong>
            {deliveredCount} deliveries · ₹{earnings} earned
          </strong>
        </p>
      </div>

      {msg && <div className="ok">{msg}</div>}
      {shipments.length === 0 && <p className='muted'>No shipments yet. Turn duty ON to receive assignments.</p>}
      {shipments.map((s) => (
        <div className="card" key={s._id} style={{ marginBottom: 12 }}>
          <span className="badge">{s.status}</span>
          <p>
            Pickup: {s.pickup?.shopName} · {s.pickup?.address}
          </p>
          <p>Drop: buyer retailer (OTP at destination)</p>
          <p className="tiny">Demo pickup OTP: {s.demoPickupOtp} · delivery OTP from buyer</p>

          {s.status === "assigned" && (
            <p>
              <a
                href={`https://www.google.com/maps?q=${encodeURIComponent(s.pickup?.address || "")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#06c", textDecoration: "underline" }}
              >
                Open in Maps
              </a>
            </p>
          )}

          <div className="row">
            <input placeholder="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
            {s.status === "assigned" && (
              <button
                className="btn small"
                onClick={async () => {
                  await api(`/shipments/${s._id}/pickup`, { method: "POST", body: { otp } });
                  setMsg("Picked");
                  load();
                }}
              >
                Confirm pickup
              </button>
            )}
            {s.status === "picked" && (
              <>
                <button
                  className="btn teal small"
                  onClick={async () => {
                    const photoUrl = photoFile[s._id] || "demo";
                    await api(`/shipments/${s._id}/deliver`, {
                      method: "POST",
                      body: { otp, photoUrl, notes: "" },
                    });
                    setMsg("Delivered · settlement eligible");
                    setPhotoFile({ ...photoFile, [s._id]: null });
                    setPhotoPreview({ ...photoPreview, [s._id]: null });
                    load();
                  }}
                >
                  Confirm delivery
                </button>
                <button
                  className="btn ghost small"
                  onClick={() => {
                    setShowFailForm({ ...showFailForm, [s._id]: !showFailForm[s._id] });
                  }}
                >
                  Mark failed
                </button>
              </>
            )}
          </div>

          {s.status === "picked" && (
            <div style={{ marginTop: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 14 }}>Upload photo proof:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoChange(s._id, e)}
                style={{ marginBottom: 8 }}
              />
              {photoPreview[s._id] && (
                <div style={{ marginTop: 8 }}>
                  <img
                    src={photoPreview[s._id]}
                    alt="Preview"
                    style={{ maxWidth: 200, maxHeight: 200, border: "1px solid #ddd" }}
                  />
                </div>
              )}
            </div>
          )}

          {s.status === "picked" && showFailForm[s._id] && (
            <div style={{ marginTop: 12, padding: 12, backgroundColor: "#fff3cd", borderRadius: 4 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 14 }}>Reason:</label>
              <select
                value={failedReason[s._id] || "Other"}
                onChange={(e) => setFailedReason({ ...failedReason, [s._id]: e.target.value })}
                style={{ marginBottom: 8, padding: 6, width: "100%" }}
              >
                <option value="Customer unavailable">Customer unavailable</option>
                <option value="Wrong address">Wrong address</option>
                <option value="Damaged box">Damaged box</option>
                <option value="Other">Other</option>
              </select>
              <label style={{ display: "block", marginBottom: 4, fontSize: 14 }}>Notes:</label>
              <textarea
                value={failNotes[s._id] || ""}
                onChange={(e) => setFailNotes({ ...failNotes, [s._id]: e.target.value })}
                placeholder="Additional details..."
                style={{ marginBottom: 8, padding: 6, width: "100%", minHeight: 60 }}
              />
              <div className="row">
                <button className="btn small" onClick={() => handleMarkFailed(s._id)}>
                  Submit
                </button>
                <button
                  className="btn ghost small"
                  onClick={() => setShowFailForm({ ...showFailForm, [s._id]: false })}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
