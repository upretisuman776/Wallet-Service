import { ShieldCheck } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";

const pageMetadata = {
  "/": {
    title: "Dashboard",
    subtitle: "Wallet operations and account overview",
  },
  "/session": {
    title: "Secure Session",
    subtitle: "Connect to Pod Alpha Wallet Service",
  },
  "/wallet": {
    title: "Wallet",
    subtitle: "Wallet balance, funding and ledger operations",
  },
  "/transactions": {
    title: "Transactions",
    subtitle: "Wallet transaction and audit activity",
  },
  "/subscription": {
    title: "Subscription",
    subtitle: "Subscription and wallet credit management",
  },
  "/currency": {
    title: "Currency",
    subtitle: "Currency rates and conversion",
  },
  "/budget-alerts": {
    title: "Budget Alerts",
    subtitle: "Wallet threshold monitoring and alerts",
  },
};

export default function AppLayout() {
  const location = useLocation();

  const metadata =
    pageMetadata[location.pathname] || pageMetadata["/"];

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="workspace">
        <Header title={metadata.title} subtitle={metadata.subtitle} />

        <Outlet />

        <footer className="app-footer">
          <div>
            <span>CyBreach Arena</span>
            <span className="footer-dot">•</span>
            <span>Pod Alpha Wallet Service</span>
          </div>

          <div>
            <span>Secure Wallet Infrastructure</span>
            <ShieldCheck size={15} />
          </div>
        </footer>
      </div>
    </div>
  );
}
