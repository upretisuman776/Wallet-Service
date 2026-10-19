import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ApiError,
  checkApiHealth,
  getWalletBalance,
} from "../services/api.js";

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  userId: "wallet_user_id",
  token: "wallet_access_token",
  currency: "wallet_currency",
};

function readStoredSession() {
  return {
    userId: sessionStorage.getItem(STORAGE_KEYS.userId) || "",
    token: sessionStorage.getItem(STORAGE_KEYS.token) || "",
    currency: sessionStorage.getItem(STORAGE_KEYS.currency) || "USD",
  };
}

function getAuthenticationMessage(error) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "The access token is invalid or has expired.";
    }

    if (error.status === 403) {
      return "This token is not authorized to access the selected tenant.";
    }

    if (error.status === 404) {
      return "No wallet was found for this tenant and currency.";
    }

    if (error.status === 0) {
      return "The Pod Alpha Wallet Service is unavailable.";
    }

    return error.message;
  }

  return "Unable to establish a secure wallet session.";
}

export function AuthProvider({ children }) {
  const initialSession = useMemo(() => readStoredSession(), []);

  const [userId, setUserId] = useState(initialSession.userId);
  const [token, setToken] = useState(initialSession.token);
  const [currency, setCurrencyState] = useState(initialSession.currency);

  const [sessionStatus, setSessionStatus] = useState(
    initialSession.userId && initialSession.token ? "validating" : "disconnected",
  );

  const [sessionError, setSessionError] = useState("");
  const [balance, setBalance] = useState(null);
  const [apiStatus, setApiStatus] = useState("checking");

  const refreshApiHealth = useCallback(async () => {
    setApiStatus("checking");

    try {
      await checkApiHealth();
      setApiStatus("connected");
      return true;
    } catch {
      setApiStatus("offline");
      return false;
    }
  }, []);

  const validateSession = useCallback(
    async ({
      userId: nextUserId,
      token: nextToken,
      currency: nextCurrency = "USD",
      persist = true,
    }) => {
      const cleanUserId = nextUserId.trim();
      const cleanToken = nextToken.trim();
      const cleanCurrency = nextCurrency.trim().toUpperCase();

      if (!cleanUserId) {
        const message = "Enter your User / Tenant ID.";
        setSessionError(message);
        return { ok: false, message };
      }

      if (!cleanToken) {
        const message = "Paste your JWT access token.";
        setSessionError(message);
        return { ok: false, message };
      }

      setSessionStatus("validating");
      setSessionError("");

      try {
        const walletBalance = await getWalletBalance(
          cleanUserId,
          cleanCurrency,
          cleanToken,
        );

        setUserId(cleanUserId);
        setToken(cleanToken);
        setCurrencyState(cleanCurrency);
        setBalance(walletBalance);
        setSessionStatus("connected");

        if (persist) {
          sessionStorage.setItem(STORAGE_KEYS.userId, cleanUserId);
          sessionStorage.setItem(STORAGE_KEYS.token, cleanToken);
          sessionStorage.setItem(STORAGE_KEYS.currency, cleanCurrency);
        }

        return { ok: true, balance: walletBalance };
      } catch (error) {
        const message = getAuthenticationMessage(error);

        setSessionStatus("disconnected");
        setSessionError(message);
        setBalance(null);

        if (persist) {
          sessionStorage.removeItem(STORAGE_KEYS.userId);
          sessionStorage.removeItem(STORAGE_KEYS.token);
        }

        return { ok: false, message };
      }
    },
    [],
  );

  const disconnect = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEYS.userId);
    sessionStorage.removeItem(STORAGE_KEYS.token);
    sessionStorage.removeItem(STORAGE_KEYS.currency);

    setUserId("");
    setToken("");
    setCurrencyState("USD");
    setBalance(null);
    setSessionError("");
    setSessionStatus("disconnected");
  }, []);

  const setCurrency = useCallback((nextCurrency) => {
    const cleanCurrency = nextCurrency.toUpperCase();

    setCurrencyState(cleanCurrency);

    if (sessionStorage.getItem(STORAGE_KEYS.token)) {
      sessionStorage.setItem(STORAGE_KEYS.currency, cleanCurrency);
    }
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!userId || !token || sessionStatus !== "connected") {
      setBalance(null);
      return null;
    }

    try {
      const walletBalance = await getWalletBalance(userId, currency, token);
      setBalance(walletBalance);
      return walletBalance;
    } catch (error) {
      if (error instanceof ApiError && [401, 403].includes(error.status)) {
        disconnect();
      }

      throw error;
    }
  }, [currency, disconnect, sessionStatus, token, userId]);

  useEffect(() => {
    refreshApiHealth();
  }, [refreshApiHealth]);

  useEffect(() => {
    if (!initialSession.userId || !initialSession.token) {
      return;
    }

    validateSession({
      userId: initialSession.userId,
      token: initialSession.token,
      currency: initialSession.currency,
      persist: false,
    });
  }, [initialSession, validateSession]);

  const value = useMemo(
    () => ({
      userId,
      token,
      currency,
      balance,
      apiStatus,
      sessionStatus,
      sessionError,
      isAuthenticated: sessionStatus === "connected",
      isConnecting: sessionStatus === "validating",
      validateSession,
      disconnect,
      setCurrency,
      refreshBalance,
      refreshApiHealth,
    }),
    [
      apiStatus,
      balance,
      currency,
      disconnect,
      refreshApiHealth,
      refreshBalance,
      sessionError,
      sessionStatus,
      setCurrency,
      token,
      userId,
      validateSession,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
