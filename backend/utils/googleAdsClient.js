// backend/utils/googleAdsClient.js
import { GoogleAdsApi } from "google-ads-api";

/**
 * Create Google Ads client for the given customer context.
 *
 * token: refresh token (preferred) OR access token (falls back)
 * customerId: the customer account ID to query (string, required)
 * loginCustomerId: the manager/root customer id to use as login_customer_id (string, optional for MCC)
 *
 * This returns a "Customer" client instance that exposes .query()/.search()/.report() depending on library.
 */
export const getGoogleAdsClient = (token, customerId = null, loginCustomerId = null) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_ADS_DEVELOPER_TOKEN) {
    throw new Error("Missing Google Ads env variables");
  }

  const api = new GoogleAdsApi({
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  });

  // Ensure customerId and loginCustomerId are always strings
  const cid = customerId ? String(customerId) : undefined;
  const lcid = loginCustomerId ? String(loginCustomerId) : undefined;

  // Always require a client account ID for MCC
  return api.Customer({
    customer_id: cid,
    refresh_token: token,
    login_customer_id: lcid, // MCC ID if needed (pass raw string)
  });
};
/**
 * Refresh OAuth tokens using the Google token endpoint.
 * Returns the JSON response { access_token, expires_in, scope, token_type, ... }
 */
export async function refreshGoogleToken(refreshToken) {
  if (!refreshToken) throw new Error("refreshToken is required");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    // include API details in error for debugging
    throw new Error(`Refresh token failed: ${JSON.stringify(data)}`);
  }
  return data;
}
