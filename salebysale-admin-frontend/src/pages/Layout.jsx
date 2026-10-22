import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

const NAV_ITEMS = [
  { label: "Dashboard",   to: "/app/dashboard",    icon: "📊" },
  { label: "Approvals",   to: "/app/approvals",    icon: "🪪" },
  { label: "Orders",      to: "/app/admin-orders", icon: "📦" },
  { label: "Inventory",   to: "/app/admin-stock",  icon: "🏭" },
  { label: "Dispatch",    to: "/app/dispatch",     icon: "🚚" },
  { label: "Disputes",    to: "/app/disputes",     icon: "⚖️"  },
];

export default function Layout() {
  const { user, business, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="adm-layout">
      {/* ── Sidebar ── */}
      <aside className="adm-sidebar">
        {/* Brand */}
        <div className="adm-sidebar-brand">
          <div className="adm-sidebar-mark">S</div>
          <div>
            <div className="adm-sidebar-name">SaleBySale</div>
            <div className="adm-sidebar-role">Admin Portal</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="adm-nav">
          <div className="adm-nav-section-label">Main Menu</div>
          {NAV_ITEMS.map(({ label, to, icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              "adm-nav-link" + (isActive ? " adm-nav-active" : "")
            }>
              <span className="adm-nav-icon">{icon}</span>
              <span className="adm-nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="adm-sidebar-footer">
          <div className="adm-sidebar-avatar">
            {(user?.name || user?.email || "A")[0].toUpperCase()}
          </div>
          <div className="adm-sidebar-user-info">
            <div className="adm-sidebar-user-name">{user?.name || "Admin"}</div>
            <div className="adm-sidebar-user-email">{business?.shopName || user?.email}</div>
          </div>
          <button className="adm-logout-btn" title="Sign out"
            onClick={() => { logout(); navigate("/"); }}>
            ↩
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="adm-main-wrap">
        {/* Top bar */}
        <header className="adm-topbar">
          <div className="adm-topbar-left">
            <div className="adm-topbar-breadcrumb">SaleBySale Admin</div>
          </div>
          <div className="adm-topbar-right">
            <div className="adm-topbar-live">
              <span className="adm-live-dot" />
              Live
            </div>
            <div className="adm-topbar-user">
              <div className="adm-topbar-avatar">
                {(user?.name || "A")[0].toUpperCase()}
              </div>
              <span className="adm-topbar-username">{user?.name || "Admin"}</span>
            </div>
          </div>
        </header>

        <main className="adm-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
