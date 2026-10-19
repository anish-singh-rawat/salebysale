import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Layout from "./pages/Layout.jsx";
import { BuyerOrder, BuyerOrders, BuyerSearch } from "./pages/Buyer.jsx";
import { SupplierOrders, SupplierPayouts, SupplierStock } from "./pages/Supplier.jsx";
import Rider from "./pages/Rider.jsx";
import { AdminOrders, AdminStock, Approvals, Dashboard, Dispatch, Disputes } from "./pages/Admin.jsx";

function homeFor(role) {
  if (role === "buyer") return "/app/search";
  if (role === "supplier") return "/app/stock";
  if (role === "rider") return "/app/rides";
  return "/app/dashboard";
}

function Guard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p style={{ padding: 40 }}>Loading session…</p>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RoleHome() {
  const { user } = useAuth();
  return <Navigate to={homeFor(user.role)} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/app"
        element={
          <Guard>
            <Layout />
          </Guard>
        }
      >
        <Route index element={<RoleHome />} />
        <Route path="search" element={<BuyerSearch />} />
        <Route path="orders" element={<BuyerOrders />} />
        <Route path="orders/:id" element={<BuyerOrder />} />
        <Route path="stock" element={<SupplierStock />} />
        <Route path="incoming" element={<SupplierOrders />} />
        <Route path="payouts" element={<SupplierPayouts />} />
        <Route path="rides" element={<Rider />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="approvals" element={<Approvals />} />
        <Route path="admin-orders" element={<AdminOrders />} />
        <Route path="admin-stock" element={<AdminStock />} />
        <Route path="dispatch" element={<Dispatch />} />
        <Route path="disputes" element={<Disputes />} />
      </Route>
    </Routes>
  );
}
