import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

const menus = {
  buyer: [
    ["Search stock", "/app/search"],
    ["My orders", "/app/orders"],
  ],
  supplier: [
    ["Inventory", "/app/stock"],
    ["Incoming orders", "/app/incoming"],
    ["Payouts", "/app/payouts"],
  ],
  rider: [
    ["Duty & tasks", "/app/rides"],
  ],
  admin: [
    ["Live dashboard", "/app/dashboard"],
    ["Approvals", "/app/approvals"],
    ["Orders", "/app/admin-orders"],
    ["Inventory", "/app/admin-stock"],
    ["Dispatch", "/app/dispatch"],
    ["Disputes", "/app/disputes"],
  ],
};

export default function Layout() {
  const { user, business, logout } = useAuth();
  const navigate = useNavigate();
  const items = menus[user?.role] || [];

  return (
    <div className="layout">
      <aside className="side" style={{ display: "flex", flexDirection: "column" }}>
        <div className="brand">
          <div className="mark">S</div>
          <div>
            SELL BY SELL
            <div className="tag">{user?.role}</div>
          </div>
        </div>
        <nav>
          {items.map(([label, to]) => (
            <NavLink key={to} to={to}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div style={{ marginTop: "auto", paddingTop: 24 }}>
          <div className="tiny">{user?.name}</div>
          <div className="tiny">{business?.shopName || user?.email}</div>
          <button
            className="btn ghost small"
            style={{ marginTop: 12 }}
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
