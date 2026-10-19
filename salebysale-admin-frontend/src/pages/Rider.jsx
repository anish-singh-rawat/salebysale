import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";

export default function Rider() {
  const { user, refresh } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const d = await api("/shipments/mine");
    setShipments(d.shipments);
  }
  useEffect(() => {
    load();
  }, []);

  async function duty(on) {
    await api("/riders/duty", { method: "POST", body: { on, lat: 29.94, lng: 78.14 } });
    refresh();
  }

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
      {msg && <div className="ok">{msg}</div>}
      {shipments.map((s) => (
        <div className="card" key={s._id} style={{ marginBottom: 12 }}>
          <span className="badge">{s.status}</span>
          <p>
            Pickup: {s.pickup?.shopName} · {s.pickup?.address}
          </p>
          <p>Drop: buyer retailer (OTP at destination)</p>
          <p className="tiny">Demo pickup OTP: {s.demoPickupOtp} · delivery OTP from buyer</p>
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
              <button
                className="btn teal small"
                onClick={async () => {
                  await api(`/shipments/${s._id}/deliver`, { method: "POST", body: { otp, photoUrl: "demo" } });
                  setMsg("Delivered · settlement eligible");
                  load();
                }}
              >
                Confirm delivery
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
