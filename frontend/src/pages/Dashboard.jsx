import {
  ArrowLeftRight,
  ArrowRight,
  BellRing,
  Check,
  CircleDot,
  Code2,
  CreditCard,
  Database,
  FileText,
  LockKeyhole,
  Monitor,
  RefreshCw,
  ShieldCheck,
  WalletCards,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getWalletTransactions } from "../services/api.js";

function BalanceCard() {
  const navigate = useNavigate();
  const { balance, currency, isAuthenticated } = useAuth();

  const displayBalance =
    isAuthenticated && balance?.available_balance !== undefined
      ? `${balance.available_balance} ${balance.currency || currency}`
      : `---.-- ${currency}`;

  return (
    <article className="summary-card balance-card">
      <div className="card-label-row">
        <div className="icon-box mint">
          <WalletCards size={22} />
        </div>
        <span className="card-label">AVAILABLE BALANCE</span>
      </div>

      <div className="balance-content">
        <div>
          <div className="balance-value">{displayBalance}</div>

          <div className="card-meta">
            <span>Wallet</span>
            <span>Secure ledger</span>
          </div>
        </div>

        <WalletCards
          className="card-watermark balance-watermark"
          size={86}
          strokeWidth={1}
        />
      </div>

      <button
        type="button"
        className="primary-card-action"
        onClick={() => navigate("/wallet")}
      >
        <span>View Wallet</span>
        <ArrowRight size={17} />
      </button>
    </article>
  );
}

function SessionCard() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <article className="summary-card">
      <div className="card-label-row">
        <div className="icon-box solid-green">
          <ShieldCheck size={22} />
        </div>
        <span className="card-label">SECURE SESSION</span>
      </div>

      <h3 className="card-main-title">
        {isAuthenticated ? "Session Active" : "JWT Protected"}
      </h3>

      <div className="security-list">
        <div>
          <span className="check-icon">
            <Check size={13} strokeWidth={3} />
          </span>
          Tenant isolation
        </div>

        <div>
          <span className="check-icon">
            <Check size={13} strokeWidth={3} />
          </span>
          Bearer authentication
        </div>

        <div>
          <span className="check-icon">
            <Check size={13} strokeWidth={3} />
          </span>
          Protected wallet APIs
        </div>
      </div>

      <button
        type="button"
        className={`soft-status ${isAuthenticated ? "connected" : ""}`}
        onClick={() => navigate("/session")}
      >
        {isAuthenticated ? (
          <ShieldCheck size={16} />
        ) : (
          <LockKeyhole size={16} />
        )}
        <span>
          {isAuthenticated ? "Protected connection" : "Session required"}
        </span>
      </button>
    </article>
  );
}

function BudgetCard() {
  const navigate = useNavigate();

  return (
    <article className="summary-card">
      <div className="card-label-row">
        <div className="icon-box amber">
          <BellRing size={22} />
        </div>
        <span className="card-label">BUDGET MONITOR</span>
      </div>

      <div className="card-split-content">
        <div>
          <h3 className="card-main-title">Not configured</h3>

          <div className="detail-stack">
            <span>Threshold</span>
            <strong>--- USD</strong>
            <span>Alert Status</span>
            <strong>—</strong>
          </div>
        </div>

        <div className="mini-bars" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>

      <button
        type="button"
        className="outline-card-action"
        onClick={() => navigate("/budget-alerts")}
      >
        <span>Configure Alert</span>
        <ArrowRight size={16} />
      </button>
    </article>
  );
}

function SubscriptionCard() {
  const navigate = useNavigate();

  return (
    <article className="summary-card">
      <div className="card-label-row">
        <div className="icon-box solid-green">
          <CreditCard size={22} />
        </div>
        <span className="card-label">SUBSCRIPTION</span>
      </div>

      <div className="card-split-content">
        <div>
          <h3 className="card-main-title subscription-title">
            No subscription loaded
          </h3>

          <div className="detail-stack">
            <span>Current Plan</span>
            <strong>—</strong>
            <span>Credits / Period</span>
            <strong>—</strong>
          </div>
        </div>

        <CreditCard
          className="card-watermark subscription-watermark"
          size={78}
          strokeWidth={1}
        />
      </div>

      <button
        type="button"
        className="outline-card-action"
        onClick={() => navigate("/subscription")}
      >
        <span>Manage Subscription</span>
        <ArrowRight size={16} />
      </button>
    </article>
  );
}

function TransactionsPanel() {
  const navigate = useNavigate();
  const { userId, token, isAuthenticated } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    let active = true;

    if (!isAuthenticated || !userId || !token) {
      setTransactions([]);
      setStatus("idle");
      return () => {
        active = false;
      };
    }

    setStatus("loading");

    getWalletTransactions(userId, token)
      .then((data) => {
        if (!active) return;
        setTransactions(Array.isArray(data) ? data.slice(0, 5) : []);
        setStatus("loaded");
      })
      .catch(() => {
        if (!active) return;
        setTransactions([]);
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, token, userId]);

  return (
    <section className="panel transactions-panel">
      <div className="panel-heading">
        <div className="panel-heading-left">
          <ArrowLeftRight className="panel-icon" size={23} />
          <div>
            <h3>RECENT TRANSACTIONS</h3>
            <p>Wallet Activity</p>
          </div>
        </div>

        <button
          type="button"
          className="text-action"
          onClick={() => navigate("/transactions")}
        >
          View All
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="transaction-table">
        <div className="transaction-table-header">
          <span>TYPE</span>
          <span>REFERENCE</span>
          <span>AMOUNT</span>
          <span>CURRENCY</span>
          <span>DATE</span>
        </div>

        {status === "loaded" && transactions.length > 0 ? (
          <div className="transaction-rows">
            {transactions.map((transaction) => (
              <div className="transaction-row" key={transaction.id}>
                <span>{transaction.transaction_type}</span>
                <span>{transaction.reference_id || "—"}</span>
                <span>{transaction.amount}</span>
                <span>{transaction.currency}</span>
                <span>
                  {transaction.created_at
                    ? new Date(transaction.created_at).toLocaleString()
                    : "—"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="transaction-empty">
            {status === "loading" ? (
              <RefreshCw className="spin" size={28} />
            ) : (
              <FileText size={30} strokeWidth={1.7} />
            )}

            <strong>
              {status === "loading"
                ? "Loading wallet activity"
                : status === "error"
                  ? "Unable to load transactions"
                  : isAuthenticated
                    ? "No wallet transactions found"
                    : "No transaction data loaded"}
            </strong>

            <p>
              {isAuthenticated
                ? status === "error"
                  ? "The transaction service could not be retrieved."
                  : "Wallet activity will appear here when available."
                : "Connect a secure session to retrieve wallet transaction activity."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function StatusRow({ icon: Icon, label, status, tone }) {
  return (
    <div className="system-row">
      <div className="system-label">
        <div className="system-icon">
          <Icon size={19} />
        </div>
        <span>{label}</span>
      </div>

      <div className={`system-value ${tone}`}>
        {tone === "green" && <span className="status-dot connected" />}
        {tone === "amber" && <LockKeyhole size={15} />}
        {tone === "blue" && <RefreshCw size={15} />}
        {tone === "red" && <CircleDot size={15} />}
        <span>{status}</span>
      </div>
    </div>
  );
}

function SystemStatus() {
  const { apiStatus, isAuthenticated } = useAuth();

  const apiText =
    apiStatus === "connected"
      ? "Available"
      : apiStatus === "offline"
        ? "Offline"
        : "Checking";

  const apiTone =
    apiStatus === "connected"
      ? "green"
      : apiStatus === "offline"
        ? "red"
        : "blue";

  return (
    <aside className="panel system-panel">
      <div className="system-title">
        <Monitor size={22} />
        <h3>SYSTEM STATUS</h3>
      </div>

      <StatusRow
        icon={CircleDot}
        label="Wallet API"
        status={apiText}
        tone={apiTone}
      />

      <StatusRow
        icon={LockKeyhole}
        label="Authentication"
        status={isAuthenticated ? "Session active" : "Session required"}
        tone={isAuthenticated ? "green" : "amber"}
      />

      <StatusRow
        icon={Database}
        label="Ledger"
        status="Protected"
        tone="green"
      />

      <StatusRow
        icon={Code2}
        label="API"
        status="localhost:8000"
        tone="blue"
      />
    </aside>
  );
}

function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    { label: "Open Wallet", icon: WalletCards, path: "/wallet" },
    {
      label: "Transactions",
      icon: ArrowLeftRight,
      path: "/transactions",
    },
    {
      label: "Budget Alerts",
      icon: BellRing,
      path: "/budget-alerts",
    },
  ];

  return (
    <section className="panel quick-actions-panel">
      <div className="quick-heading">
        <Zap size={21} />
        <h3>QUICK ACTIONS</h3>
      </div>

      <div className="quick-actions-grid">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              type="button"
              className="quick-action"
              key={action.label}
              onClick={() => navigate(action.path)}
            >
              <div className="quick-action-left">
                <span className="quick-action-icon">
                  <Icon size={20} />
                </span>
                <span>{action.label}</span>
              </div>
              <ArrowRight size={18} />
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default function Dashboard() {
  return (
    <main className="dashboard-main">
      <section className="context-banner">
        <div className="context-content">
          <span className="eyebrow">WALLET OPERATIONS</span>
          <h2>Financial control for CyBreach Arena</h2>
          <p>
            Monitor wallet balance, transaction activity, subscription credits
            and budget controls.
          </p>
        </div>

        <div
          className="context-mountain"
          style={{ backgroundImage: "url(/dashboard/mountain.png)" }}
          aria-hidden="true"
        />
      </section>

      <section className="summary-grid">
        <BalanceCard />
        <SessionCard />
        <BudgetCard />
        <SubscriptionCard />
      </section>

      <section className="dashboard-content-grid">
        <div className="dashboard-primary-column">
          <TransactionsPanel />
          <QuickActions />
        </div>

        <SystemStatus />
      </section>
    </main>
  );
}
