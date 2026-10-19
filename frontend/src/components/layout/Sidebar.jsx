import {
  ArrowLeftRight,
  BellRing,
  CircleDot,
  Coins,
  CreditCard,
  LayoutDashboard,
  LockKeyhole,
  WalletCards,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/" },
  { label: "Secure Session", icon: LockKeyhole, to: "/session" },
  { label: "Wallet", icon: WalletCards, to: "/wallet" },
  { label: "Transactions", icon: ArrowLeftRight, to: "/transactions" },
  { label: "Subscription", icon: CreditCard, to: "/subscription" },
  { label: "Currency", icon: Coins, to: "/currency" },
  { label: "Budget Alerts", icon: BellRing, to: "/budget-alerts" },
];

function BrandMark() {
  return (
    <div className="brand-mark" aria-hidden="true">
      <span>C</span>
    </div>
  );
}

function getStatusText(apiStatus) {
  if (apiStatus === "connected") return "API Connected";
  if (apiStatus === "offline") return "API Offline";
  return "Checking API";
}

export default function Sidebar() {
  const { apiStatus } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="brand">
          <BrandMark />

          <div>
            <div className="brand-name">CYBREACH</div>
            <div className="brand-arena">ARENA</div>
          </div>
        </div>

        <p className="brand-subtitle">Wallet &amp; Credit Operations</p>

        <nav className="sidebar-navigation" aria-label="Main navigation">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                <Icon size={21} strokeWidth={1.9} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div
          className="sidebar-mountain"
          style={{ backgroundImage: "url(/dashboard/mountain.png)" }}
          aria-hidden="true"
        />

        <div className="pod-card">
          <div className="pod-heading">
            <div className="pod-icon">
              <CircleDot size={18} />
            </div>

            <div>
              <strong>POD ALPHA</strong>
              <span>Wallet Service</span>
            </div>
          </div>

          <div className={`pod-status ${apiStatus}`}>
            <span className={`status-dot ${apiStatus}`} />
            <span>{getStatusText(apiStatus)}</span>
          </div>

          <span className="pod-version">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
