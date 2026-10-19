import {
  Bell,
  ChevronDown,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

function getApiLabel(status) {
  if (status === "connected") return "Connected";
  if (status === "offline") return "Offline";
  return "Checking";
}

export default function Header({ title, subtitle }) {
  const navigate = useNavigate();
  const {
    apiStatus,
    currency,
    setCurrency,
    isAuthenticated,
    userId,
    disconnect,
  } = useAuth();

  const [sessionMenuOpen, setSessionMenuOpen] = useState(false);

  function handleDisconnect() {
    disconnect();
    setSessionMenuOpen(false);
    navigate("/session");
  }

  return (
    <header className="top-header">
      <div className="header-title">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="header-controls">
        <div className={`api-status-control ${apiStatus}`}>
          <div className="api-status-indicator">
            <span className={`api-status-pulse ${apiStatus}`} />
          </div>

          <div>
            <span>API Status</span>
            <strong>
              <span className={`tiny-dot ${apiStatus}`} />
              {getApiLabel(apiStatus)}
            </strong>
          </div>
        </div>

        <label className="header-button currency-button">
          <select
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
            aria-label="Currency"
          >
            <option value="USD">USD</option>
          </select>
          <ChevronDown size={15} />
        </label>

        <span className="header-separator" />

        <button
          type="button"
          className="notification-button"
          aria-label="Notifications"
        >
          <Bell size={21} />
        </button>

        <span className="header-separator" />

        <div className="session-control">
          <button
            type="button"
            className={`header-button session-button ${
              isAuthenticated ? "session-active" : ""
            }`}
            onClick={() => {
              if (!isAuthenticated) {
                navigate("/session");
                return;
              }

              setSessionMenuOpen((current) => !current);
            }}
          >
            {isAuthenticated ? (
              <ShieldCheck size={18} />
            ) : (
              <LockKeyhole size={18} />
            )}

            <span>{isAuthenticated ? "Session Active" : "Secure Session"}</span>
            <ChevronDown size={15} />
          </button>

          {isAuthenticated && sessionMenuOpen && (
            <div className="session-dropdown">
              <span className="session-dropdown-label">SECURE SESSION</span>

              <div className="session-dropdown-row">
                <span>Tenant</span>
                <strong title={userId}>{userId}</strong>
              </div>

              <div className="session-dropdown-row">
                <span>Currency</span>
                <strong>{currency}</strong>
              </div>

              <button type="button" onClick={handleDisconnect}>
                Disconnect Session
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
