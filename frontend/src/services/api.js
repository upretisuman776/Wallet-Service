const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") ||
  "http://localhost:8000";

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function request(path, options = {}) {
  const { token, headers = {}, ...fetchOptions } = options;

  const requestHeaders = new Headers(headers);

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  if (
    fetchOptions.body &&
    !(fetchOptions.body instanceof FormData) &&
    !requestHeaders.has("Content-Type")
  ) {
    requestHeaders.set("Content-Type", "application/json");
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      headers: requestHeaders,
    });
  } catch {
    throw new ApiError(
      "Unable to reach the Pod Alpha Wallet Service.",
      0,
      null,
    );
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`;

    if (data && typeof data === "object" && data.detail) {
      message =
        typeof data.detail === "string"
          ? data.detail
          : JSON.stringify(data.detail);
    }

    throw new ApiError(message, response.status, data);
  }

  return data;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export async function checkApiHealth() {
  return request("/");
}

export async function getWalletBalance(userId, currency, token) {
  const encodedUserId = encodeURIComponent(userId);
  const encodedCurrency = encodeURIComponent(currency);

  return request(
    `/wallet/balance/${encodedUserId}?currency=${encodedCurrency}`,
    { token },
  );
}

export async function getWalletTransactions(userId, token) {
  const encodedUserId = encodeURIComponent(userId);

  return request(`/wallet/transactions/${encodedUserId}`, { token });
}
