import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { useCart } from "../CartContext.jsx";

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
  const { cart } = useCart();

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
            <NavLink key={to} to={to} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{label}</span>
              {to === "/app/search" && cart.length > 0 && (
                <span className="badge" style={{ marginLeft: 8 }}>
                  {cart.length}
                </span>
              )}
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
