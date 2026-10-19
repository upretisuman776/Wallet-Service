import {
  ArrowRight,
  Box,
  Check,
  CircleAlert,
  Database,
  DollarSign,
  Eye,
  EyeOff,
  Globe2,
  LockKeyhole,
  Server,
  Share2,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getApiBaseUrl } from "../services/api.js";

function apiStatusLabel(status) {
  if (status === "connected") return "API Available";
  if (status === "offline") return "Offline";
  return "Checking";
}

export default function SecureSession() {
  const navigate = useNavigate();

  const {
    userId,
    token,
    currency,
    apiStatus,
    isAuthenticated,
    isConnecting,
    sessionError,
    validateSession,
    disconnect,
  } = useAuth();

  const [formUserId, setFormUserId] = useState(userId);
  const [formToken, setFormToken] = useState(token);
  const [formCurrency, setFormCurrency] = useState(currency || "USD");
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    setFormUserId(userId);
    setFormToken(token);
    setFormCurrency(currency || "USD");
  }, [currency, token, userId]);

  async function handleSubmit(event) {
    event.preventDefault();

    const result = await validateSession({
      userId: formUserId,
      token: formToken,
      currency: formCurrency,
    });

    if (result.ok) {
      navigate("/");
    }
  }

  function handleDisconnect() {
    disconnect();
    setFormUserId("");
    setFormToken("");
    setFormCurrency("USD");
  }

  return (
    <main className="dashboard-main secure-session-main">
      <section className="context-banner secure-context-banner">
        <div className="context-content">
          <span className="eyebrow">SECURE ACCESS</span>
          <h2>Connect to Pod Alpha Wallet Service</h2>
          <p>
            Authenticate your wallet session using a secure Bearer JWT issued
            for your tenant.
          </p>
        </div>

        <div
          className="context-mountain"
          style={{ backgroundImage: "url(/dashboard/mountain.png)" }}
          aria-hidden="true"
        />
      </section>

      <section className="secure-session-grid">
        <article className="panel secure-form-card">
          <div className="secure-card-heading">
            <div className="large-mint-icon">
              <LockKeyhole size={26} />
            </div>

            <div>
              <h3>SECURE WALLET SESSION</h3>
              <p>
                Enter your tenant details and access token to connect to Pod
                Alpha.
              </p>
            </div>
          </div>

          {isAuthenticated && (
            <div className="session-success-box">
              <ShieldCheck size={21} />

              <div>
                <strong>SESSION ACTIVE</strong>
                <span>Tenant verified through the protected wallet API.</span>
              </div>

              <div className="success-checks">
                <span>
                  <Check size={14} /> Bearer authentication
                </span>
                <span>
                  <Check size={14} /> Tenant isolation
                </span>
                <span>
                  <Check size={14} /> Protected wallet APIs
                </span>
              </div>
            </div>
          )}

          {sessionError && (
            <div className="session-error-box" role="alert">
              <CircleAlert size={20} />

              <div>
                <strong>Authentication failed</strong>
                <span>{sessionError}</span>
              </div>
            </div>
          )}

          <form className="secure-session-form" onSubmit={handleSubmit}>
            <label className="secure-field">
              <span>User / Tenant ID</span>

              <div className="secure-input">
                <UserRound size={19} />
                <input
                  type="text"
                  value={formUserId}
                  onChange={(event) => setFormUserId(event.target.value)}
                  placeholder="e.g. integration_user_123"
                  autoComplete="off"
                  disabled={isConnecting}
                />
              </div>
            </label>

            <label className="secure-field">
              <span>Access Token (JWT)</span>

              <div className="secure-input">
                <LockKeyhole size={18} />

                <input
                  type={showToken ? "text" : "password"}
                  value={formToken}
                  onChange={(event) => setFormToken(event.target.value)}
                  placeholder="Paste your JWT access token"
                  autoComplete="off"
                  disabled={isConnecting}
                />

                <button
                  type="button"
                  className="token-visibility"
                  onClick={() => setShowToken((current) => !current)}
                  aria-label={showToken ? "Hide token" : "Show token"}
                >
                  {showToken ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>

              <small>
                Paste your short-lived JWT access token issued for your tenant.
              </small>
            </label>

            <label className="secure-field currency-field">
              <span>Default Currency</span>

              <div className="secure-input secure-select">
                <DollarSign size={19} />

                <select
                  value={formCurrency}
                  onChange={(event) => setFormCurrency(event.target.value)}
                  disabled={isConnecting}
                >
                  <option value="USD">USD</option>
                </select>
              </div>
            </label>

            {isAuthenticated ? (
              <div className="connected-action-row">
                <button
                  type="submit"
                  className="connect-session-button"
                  disabled={isConnecting}
                >
                  <ShieldCheck size={19} />
                  <span>
                    {isConnecting ? "Validating..." : "Validate Session"}
                  </span>
                  <ArrowRight size={19} />
                </button>

                <button
                  type="button"
                  className="disconnect-session-button"
                  onClick={handleDisconnect}
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                type="submit"
                className="connect-session-button"
                disabled={isConnecting}
              >
                <LockKeyhole size={19} />
                <span>
                  {isConnecting
                    ? "Connecting..."
                    : "Connect Secure Session"}
                </span>
                {!isConnecting && <ArrowRight size={19} />}
              </button>
            )}
          </form>
        </article>

        <article className="panel connection-security-card">
          <div className="secure-card-heading">
            <div className="large-mint-icon">
              <ShieldCheck size={27} />
            </div>

            <div>
              <h3>CONNECTION SECURITY</h3>
              <p>Current connection and API information.</p>
            </div>
          </div>

          <div className="connection-info">
            <div className="connection-row">
              <span className="connection-icon">
                <Globe2 size={20} />
              </span>
              <span className="connection-label">API Endpoint</span>
              <strong>{getApiBaseUrl()}</strong>
            </div>

            <div className="connection-row">
              <span className="connection-icon">
                <ShieldCheck size={20} />
              </span>
              <span className="connection-label">Authentication</span>
              <strong>Bearer JWT</strong>
            </div>

            <div className="connection-row">
              <span className="connection-icon">
                <Database size={20} />
              </span>
              <span className="connection-label">Tenant Protection</span>
              <strong className="positive-value">Enabled</strong>
            </div>

            <div className="connection-row">
              <span className="connection-icon">
                <Share2 size={20} />
              </span>
              <span className="connection-label">Transport</span>
              <strong>API Connection</strong>
            </div>
          </div>

          <div className="service-section">
            <span className="service-eyebrow">SERVICE</span>

            <div className="service-box">
              <div className="service-name">
                <span className="connection-icon">
                  <Box size={20} />
                </span>
                <strong>Pod Alpha Wallet Service</strong>
              </div>

              <div className={`service-health ${apiStatus}`}>
                <span className={`status-dot ${apiStatus}`} />
                {apiStatusLabel(apiStatus)}
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="panel protected-access-panel">
        <div className="protected-access-heading">
          <div className="large-mint-icon">
            <Server size={23} />
          </div>

          <div>
            <h3>PROTECTED ACCESS</h3>
            <p>
              Your session credentials are stored in this browser session and
              used to access protected wallet APIs.
            </p>
          </div>
        </div>

        <div className="protected-access-grid">
          <div className="protected-item">
            <span className="protected-icon">
              <ShieldCheck size={25} />
            </span>
            <div>
              <strong>JWT Authentication</strong>
              <span>Secure bearer token access</span>
            </div>
          </div>

          <div className="protected-item">
            <span className="protected-icon">
              <UsersRound size={25} />
            </span>
            <div>
              <strong>Tenant Isolation</strong>
              <span>Access limited to your tenant</span>
            </div>
          </div>

          <div className="protected-item">
            <span className="protected-icon">
              <Database size={25} />
            </span>
            <div>
              <strong>Protected Wallet APIs</strong>
              <span>Secure ledger and transactions</span>
            </div>
          </div>

          <div className="protected-item">
            <span className="protected-icon">
              <LockKeyhole size={25} />
            </span>
            <div>
              <strong>Session Based</strong>
              <span>Stored in browser session only</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
