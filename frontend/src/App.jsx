import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout.jsx";
import ComingSoon from "./pages/ComingSoon.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import SecureSession from "./pages/SecureSession.jsx";
import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />

        <Route path="session" element={<SecureSession />} />

        <Route
          path="wallet"
          element={
            <ComingSoon
              eyebrow="WALLET"
              title="Wallet Operations"
              description="Balance, deposit, withdrawal and secure ledger operations."
            />
          }
        />

        <Route
          path="transactions"
          element={
            <ComingSoon
              eyebrow="TRANSACTIONS"
              title="Transaction Activity"
              description="Wallet transactions and audit activity."
            />
          }
        />

        <Route
          path="subscription"
          element={
            <ComingSoon
              eyebrow="SUBSCRIPTION"
              title="Subscription Management"
              description="Subscription tiers, renewal, cancellation and wallet credits."
            />
          }
        />

        <Route
          path="currency"
          element={
            <ComingSoon
              eyebrow="CURRENCY"
              title="Currency Operations"
              description="Currency rates and wallet value conversion."
            />
          }
        />

        <Route
          path="budget-alerts"
          element={
            <ComingSoon
              eyebrow="BUDGET ALERTS"
              title="Budget Monitoring"
              description="Wallet threshold configuration and budget alert status."
            />
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
