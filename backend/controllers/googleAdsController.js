import GoogleAdsToken from "../models/GoogleAdsToken.js";
import OnDemandProductReport from "../models/OnDemandProductReport.js";
import KeywordSearchTermReport from "../models/KeywordSearchTermReport.js";
import { getGoogleAdsClient, refreshGoogleToken } from "../utils/googleAdsClient.js";
import logger from "../config/logger.js";

const REDIRECT_URI =
  process.env.GOOGLE_ADS_REDIRECT_URI ||
  process.env.REDIRECT_URI ||
  `${process.env.BACKEND_API_URL || "http://localhost:5000/api"}/google-ads/callback`;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:8080";

async function exchangeCodeForTokens(code) {
  logger.debug("Exchanging code for tokens...");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  const text = await res.text();
  logger.debug("Token response status:", res.status);
  logger.debug("Token response body:", text);

  if (!res.ok) {
    throw new Error(`Token exchange failed: ${text}`);
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(`Invalid JSON from Google: ${text}`);
  }

  return data;
}

// async function listAccessibleCustomers(accessToken, refreshToken) {
//   logger.debug("Calling listAccessibleCustomers with tokens...");
//   logger.debug(`Access token length: ${accessToken?.length || 0}, Refresh token: ${refreshToken ? 'YES' : 'NO'}`);
  
//   // Skip library - use REST API directly with the access token
//   return await listAccessibleCustomersViaRest(accessToken);
// }

// async function listAccessibleCustomersViaRest(accessToken) {
//   logger.debug("🔍 Calling listAccessibleCustomers via REST API...");
//   logger.debug(`Access token length: ${accessToken?.length || 0}`);
//   logger.debug(`Developer token present: ${process.env.GOOGLE_ADS_DEVELOPER_TOKEN ? 'YES' : 'NO'}`);
  
//   const headers = {
//     Authorization: `Bearer ${accessToken}`,
//     "Content-Type": "application/json",
//   };
  
//   if (process.env.GOOGLE_ADS_DEVELOPER_TOKEN) {
//     headers["developer-token"] = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
//   }
  
//   // Try the search endpoint with a simple GAQL query
//   // This is the correct way to query Google Ads API
//   const urls = [
//     {
//       url: "https://googleads.googleapis.com/v15/customers/me/googleAds:search",
//       body: {
//         query: `SELECT customer.id FROM customer LIMIT 100`
//       }
//     },
//     {
//       url: "https://googleads.googleapis.com/v14/customers/me/googleAds:search",
//       body: {
//         query: `SELECT customer.id FROM customer LIMIT 100`
//       }
//     },
//     {
//       url: "https://googleads.googleapis.com/v13/customers/me/googleAds:search",
//       body: {
//         query: `SELECT customer.id FROM customer LIMIT 100`
//       }
//     }
//   ];
  
//   let lastError = null;
  
//   for (const endpoint of urls) {
//     try {
//       logger.debug(`📡 Trying: ${endpoint.url}`);
      
//       const resp = await fetch(endpoint.url, {
//         method: "POST",
//         headers,
//         body: JSON.stringify(endpoint.body),
//       });

//       const text = await resp.text();
//       logger.debug(`Status: ${resp.status}, Body length: ${text.length}`);
      
//       if (text.length > 0 && text.length < 1000) {
//         logger.debug(`Response: ${text}`);
//       } else if (text.length > 0) {
//         logger.debug(`Response (first 500): ${text.substring(0, 500)}`);
//       }

//       if (resp.ok) {
//         logger.info(`✅ Success with ${endpoint.url}`);
//         try {
//           const data = JSON.parse(text);
//           logger.debug(`Retrieved data:`, data);
//           return data;
//         } catch (parseErr) {
//           logger.warn(`Failed to parse response: ${parseErr.message}`);
//           lastError = parseErr;
//           continue;
//         }
//       } else {
//         lastError = new Error(`${resp.status} ${text.substring(0, 100)}`);
//       }
//     } catch (fetchError) {
//       logger.debug(`Fetch error: ${fetchError.message}`);
//       lastError = fetchError;
//     }
//   }
  
//   logger.error(`❌ All endpoints failed. Last error: ${lastError?.message || 'Unknown'}`);
//   throw new Error(`Google Ads API failed: ${lastError?.message || 'All endpoints returned errors'}`);
// }

async function listAccessibleCustomers(accessToken) {
  logger.info("📞 Calling listAccessibleCustomers...");

  const url = "https://googleads.googleapis.com/v20/customers:listAccessibleCustomers";

  const res = await fetch(url, {
    method: "GET",  // GET request - no body allowed
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "developer-token": process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    },
    // Remove the body: JSON.stringify({}) line completely!
  });

  const text = await res.text();
  logger.debug("📥 Google Ads response status:", res.status);
  logger.debug("📥 Google Ads response body:", text);

  if (!res.ok) {
    throw new Error(`listAccessibleCustomers failed (${res.status}): ${text}`);
  }

  const data = JSON.parse(text);
  logger.info("✅ Successfully retrieved customer IDs:", data);
  return data; // contains resourceNames[]
}
async function listAccessibleCustomersViaRest(accessToken) {
  const loginId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;

  if (!loginId) {
    throw new Error("Missing GOOGLE_ADS_LOGIN_CUSTOMER_ID");
  }

  const url = `https://googleads.googleapis.com/v15/customers/${loginId}/googleAds:search`;

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "developer-token": process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    "Content-Type": "application/json",
  };

  const body = {
    query: `
      SELECT
        customer_client.id,
        customer_client.descriptive_name,
        customer_client.level,
        customer_client.manager
      FROM customer_client
      WHERE customer_client.status = 'ENABLED'
      ORDER BY customer_client.level
    `,
  };

  const resp = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const text = await resp.text();

  if (!resp.ok) {
    throw new Error(`Google Ads API error: ${resp.status} - ${text}`);
  }

  return JSON.parse(text);
}
export const getAuthUrl = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    logger.info("Generating auth URL for user:", userId);

    const state = Buffer.from(JSON.stringify({ userId })).toString("base64");

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&response_type=code` +
      `&scope=https://www.googleapis.com/auth/adwords` +
      `&access_type=offline` +
      `&prompt=consent` +
      `&incognito=1` +
      `&state=${state}`;

    res.json({ authorizeUrl: authUrl });
  } catch (error) {
    logger.error("getAuthUrl Error:", error);
    res.status(500).json({ error: "Failed to generate auth URL" });
  }
};

export const handleCallback = async (req, res) => {
  const { code, state, error } = req.query;

  logger.debug("OAuth callback received:", { code: !!code, state: !!state, error });

  if (error) {
    logger.error("OAuth error from Google:", error);
    return res.redirect(`${FRONTEND_URL}/dashboard?error=oauth_error`);
  }

  if (!code || !state) {
    return res.redirect(`${FRONTEND_URL}/dashboard?error=missing_code`);
  }

  try {
    const { userId } = JSON.parse(Buffer.from(state, "base64").toString());
    logger.debug("Decoded userId from state:", userId);

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);
    logger.debug("Tokens received:", {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expires_in: tokens.expires_in,
    });

    // Save tokens first
    await GoogleAdsToken.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        expiryDate: new Date(Date.now() + (tokens.expires_in || 3600) * 1000),
      },
      { upsert: true, new: true }
    );

    logger.info("Tokens saved to DB");

    // Now get customer IDs and save them
    try {
      const customersData = await listAccessibleCustomers(tokens.access_token);
      logger.info("✅ Customer data received:", customersData);
      
      const resourceNames = customersData.resourceNames || [];
      if (resourceNames.length > 0) {
        // Extract customer ID from first resource (usually the main account)
        const rootCustomerId = resourceNames[0].split("/")[1];
        
        // Update token document with customer info
        await GoogleAdsToken.findOneAndUpdate(
          { user: userId },
          {
            rootCustomerId: rootCustomerId,
            isManager: resourceNames.length > 1,
            allCustomerIds: resourceNames.map(rn => rn.split("/")[1])
          }
        );
        
        logger.info(`✅ Saved ${resourceNames.length} customer IDs for user`);
      }
    } catch (listError) {
      // Log the FULL error details
      logger.error("❌ Failed to list customers:", {
        message: listError.message,
        stack: listError.stack,
        // If it's an HTTP error with response
        response: listError.response?.data,
        status: listError.response?.status
      });
      // Don't fail - user can still be "connected" even if this fails
    }

    return res.redirect(`${FRONTEND_URL}/dashboard?success=connected`);
  } catch (err) {
    logger.error("FATAL OAuth callback error:", err.message, err.stack);
    return res.redirect(`${FRONTEND_URL}/dashboard?error=callback_failed`);
  }
};

// 1 hour. Connections rarely change minute-to-minute; this is a cache for the
// "list of accounts I can see" view, not for actual ad metrics.
const CONNECTIONS_CACHE_TTL_MS = 60 * 60 * 1000;

export const getConnections = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const tokenDoc = await GoogleAdsToken.findOne({ user: userId });

    if (!tokenDoc) {
      return res.json({
        connections: [],
        clientAccounts: [],
        hierarchy: {},
        hasConnection: false,
      });
    }

    // Cache hit? Return cached payload without hitting Google Ads API.
    // Bypass with { refresh: true } in body, or ?refresh=1.
    const forceRefresh = req.body?.refresh === true || req.query?.refresh === "1";
    const cache = tokenDoc.connectionsCache;
    if (
      !forceRefresh &&
      cache?.cachedAt &&
      Date.now() - new Date(cache.cachedAt).getTime() < CONNECTIONS_CACHE_TTL_MS &&
      cache?.connections &&
      cache.connections.length > 0
    ) {
      logger.info(`Returning cached connections for user ${userId} (${cache.connections.length} accounts, age ${Math.round((Date.now() - new Date(cache.cachedAt).getTime()) / 1000)}s)`);
      return res.json({
        connections: cache.connections,
        clientAccounts: cache.clientAccounts || [],
        managerAccounts: cache.managerAccounts || [],
        hierarchy: cache.hierarchy || {},
        hasConnection: true,
        cached: true,
        cachedAt: cache.cachedAt,
      });
    }

    // refresh access token if needed
    let accessToken = tokenDoc.accessToken;
    if (!accessToken || Date.now() > new Date(tokenDoc.expiryDate).getTime() - 60000) {
      if (!tokenDoc.refreshToken) {
        // token exists but can't refresh
        return res.json({
          connections: [],
          clientAccounts: [],
          hierarchy: {},
          hasConnection: true,
        });
      }
      try {
        const newTokens = await refreshGoogleToken(tokenDoc.refreshToken);
        tokenDoc.accessToken = newTokens.access_token;
        tokenDoc.expiryDate = new Date(Date.now() + newTokens.expires_in * 1000);
        await tokenDoc.save();
        accessToken = tokenDoc.accessToken;
      } catch (err) {
        logger.error("Token refresh failed in getConnections:", err);
        return res.json({
          connections: [],
          clientAccounts: [],
          hierarchy: {},
          hasConnection: true,
        });
      }
    }

    // ensure rootCustomerId known
    if (!tokenDoc.rootCustomerId) {
      try {
        const customersData = await listAccessibleCustomers(accessToken);
        const resourceNames = customersData.resourceNames || [];
        tokenDoc.rootCustomerId = resourceNames.length > 0 ? resourceNames[0].split("/")[1] : null;
        tokenDoc.isManager = resourceNames.length > 1;
        tokenDoc.allCustomerIds = resourceNames.map(rn => rn.split("/")[1]);
        await tokenDoc.save();
      } catch (err) {
        logger.warn("Could not determine rootCustomerId:", err);
      }
    }

    // allow fetching connections for a specific manager (manager_id passed from frontend)
    const { rootCustomerId, isManager } = tokenDoc;
    const overrideManagerId = req.body?.manager_id || req.query?.manager_id || null;
    const managerToQuery = overrideManagerId || rootCustomerId;

    // if not manager → single account response
    if (!isManager) {
      const accountId = rootCustomerId || tokenDoc.customerId || null;
      if (!accountId) {
        return res.json({
          connections: [],
          clientAccounts: [],
          hierarchy: {},
          hasConnection: true,
        });
      }
      const single = {
        id: accountId,
        customer_id: accountId,
        account_name: `Account ${accountId}`,
        is_manager_account: false,
      };
      return res.json({
        connections: [single],
        clientAccounts: [single],
        hierarchy: { managerAccounts: [], clientAccounts: [single] },
        hasConnection: true,
      });
    }

    // manager (MCC) → run GAQL on customer_client
    if (!rootCustomerId) {
      return res.json({
        connections: [],
        clientAccounts: [],
        hierarchy: {},
        hasConnection: true,
      });
    }

    // create client with refresh token and login_customer_id = managerToQuery
    const client = getGoogleAdsClient(tokenDoc.refreshToken || tokenDoc.accessToken, managerToQuery, managerToQuery);

    logger.info(`Querying customer_client for MCC ${managerToQuery}`);

    const gaql = `
      SELECT
        customer_client.id,
        customer_client.descriptive_name,
        customer_client.manager,
        customer_client.level
      FROM customer_client
      WHERE customer_client.status = 'ENABLED'
      ORDER BY customer_client.level
    `;

    let rows = [];
    try {
      const resp = await client.query(gaql);
      if (Array.isArray(resp)) rows = resp;
      else if (Array.isArray(resp.results)) rows = resp.results;
      else if (resp && typeof resp[Symbol.iterator] === "function") rows = Array.from(resp);
      else rows = [];
      logger.info(`GAQL query returned ${rows.length} rows`);
    } catch (err) {
      // Detailed error so we can debug what Google rejected.
      // (Don't return empty here — we still want to fall back to allCustomerIds
      // below so the user sees their accounts even if the customer_client
      // query failed for this MCC.)
      const detail = err?.errors?.[0]?.message || err?.errors?.[0]?.error_code || err?.message || String(err);
      logger.error(
        `GAQL customer_client query failed for managerToQuery=${managerToQuery} | ` +
        `code=${err?.code || err?.errors?.[0]?.error_code || "?"} | ` +
        `msg=${detail?.toString().slice(0, 300)}`
      );
      // rows stays [] — we'll just skip GAQL data and use allCustomerIds below
    }

    // Build connections list, starting from any accounts GAQL returned
    // (these include nice descriptive names when available).
    const seen = new Map(); // id -> connection object

    for (const row of rows) {
      const clientData = row.customerClient || row.customer_client || row;
      const idRaw = clientData?.id ?? clientData?.resource_name ?? null;
      const id = idRaw ? String(idRaw).replace("customers/", "").trim() : null;
      if (!id) continue;
      const name = clientData?.descriptive_name ?? clientData?.descriptiveName ?? `Account ${id}`;
      const managerFlag = clientData?.manager ?? clientData?.manager_account ?? false;
      const level = clientData?.level ?? null;
      seen.set(id, { id, customer_id: id, account_name: name, is_manager_account: !!managerFlag, level });
    }

    // Merge in every directly-accessible customer that GAQL didn't list.
    // listAccessibleCustomers can return separate top-level accounts that aren't
    // children of rootCustomerId's MCC, so we'd lose them otherwise.
    if (tokenDoc.allCustomerIds && tokenDoc.allCustomerIds.length > 0) {
      for (const id of tokenDoc.allCustomerIds) {
        if (seen.has(id)) continue;
        seen.set(id, {
          id,
          customer_id: id,
          account_name: `Account ${id}`,
          is_manager_account: false,
          level: null,
        });
      }
    }

    // For every account we only have an ID for, fetch its real name + manager flag in parallel.
    // Each account is queried with login_customer_id == its own id (no MCC needed for direct access).
    const refreshTokenForLookup = tokenDoc.refreshToken || tokenDoc.accessToken;
    const accountsNeedingName = Array.from(seen.values()).filter(
      (acc) => /^Account \d+$/.test(acc.account_name)
    );

    if (refreshTokenForLookup && accountsNeedingName.length > 0) {
      logger.info(`Fetching names for ${accountsNeedingName.length} accounts in parallel`);
      await Promise.all(
        accountsNeedingName.map(async (acc) => {
          try {
            const c = getGoogleAdsClient(refreshTokenForLookup, acc.id, acc.id);
            const result = await c.query(
              "SELECT customer.descriptive_name, customer.manager FROM customer LIMIT 1"
            );
            const rowsArr = Array.isArray(result)
              ? result
              : Array.isArray(result?.results)
              ? result.results
              : [];
            const cust = rowsArr[0]?.customer || rowsArr[0];
            if (cust?.descriptive_name) {
              acc.account_name = cust.descriptive_name;
            } else if (cust?.descriptiveName) {
              acc.account_name = cust.descriptiveName;
            }
            const isManager = cust?.manager ?? cust?.manager_account;
            if (typeof isManager === "boolean") acc.is_manager_account = isManager;
          } catch (err) {
            logger.warn(`Name lookup failed for ${acc.id}: ${err.message?.slice(0, 120)}`);
          }
        })
      );
    }

    // Build hierarchy { mccId: [childCustomerIds] } so the frontend can show
    // sub-accounts when an MCC is selected. Query each manager in parallel.
    const hierarchy = {};
    const managers = Array.from(seen.values()).filter((a) => a.is_manager_account);

    if (refreshTokenForLookup && managers.length > 0) {
      logger.info(`Fetching children for ${managers.length} manager accounts in parallel`);
      await Promise.all(
        managers.map(async (mgr) => {
          try {
            const c = getGoogleAdsClient(refreshTokenForLookup, mgr.id, mgr.id);
            const result = await c.query(`
              SELECT customer_client.id, customer_client.descriptive_name, customer_client.manager, customer_client.level
              FROM customer_client
              WHERE customer_client.status = 'ENABLED'
            `);
            const childRows = Array.isArray(result)
              ? result
              : Array.isArray(result?.results)
              ? result.results
              : [];

            const childIds = [];
            for (const row of childRows) {
              const cd = row.customerClient || row.customer_client || row;
              const idRaw = cd?.id ?? cd?.resource_name ?? null;
              const childId = idRaw ? String(idRaw).replace("customers/", "").trim() : null;
              if (!childId || childId === mgr.id) continue; // skip the manager itself
              const childName = cd?.descriptive_name ?? cd?.descriptiveName ?? `Account ${childId}`;
              const childIsManager = !!(cd?.manager ?? cd?.manager_account);

              childIds.push(childId);

              // Add the child to seen so it appears in connections too (with name).
              // Don't overwrite a directly-accessible top-level entry.
              if (!seen.has(childId)) {
                seen.set(childId, {
                  id: childId,
                  customer_id: childId,
                  account_name: childName,
                  is_manager_account: childIsManager,
                  level: cd?.level ?? null,
                });
              } else {
                // upgrade name if we still had a placeholder
                const existing = seen.get(childId);
                if (/^Account \d+$/.test(existing.account_name) && childName) {
                  existing.account_name = childName;
                }
              }
            }
            hierarchy[mgr.id] = childIds;
          } catch (err) {
            logger.warn(`Children lookup failed for MCC ${mgr.id}: ${err.message?.slice(0, 120)}`);
            hierarchy[mgr.id] = [];
          }
        })
      );
    }

    const connections = Array.from(seen.values());
    const clientAccounts = connections.filter((acc) => !acc.is_manager_account);
    const managerAccounts = connections.filter((acc) => acc.is_manager_account);

    logger.info(`Returning ${connections.length} total accounts (${clientAccounts.length} clients, ${managerAccounts.length} managers)`);

    // Persist to MongoDB cache so the next /connections call (within TTL) skips
    // all the Google Ads API hits. Only cache when we actually got data —
    // empty arrays from a rate-limited fetch would just keep showing nothing.
    if (connections.length > 0) {
      try {
        tokenDoc.connectionsCache = {
          connections,
          clientAccounts,
          managerAccounts,
          hierarchy,
          cachedAt: new Date(),
        };
        await tokenDoc.save();
      } catch (cacheErr) {
        logger.warn(`Failed to write connections cache: ${cacheErr.message}`);
      }
    }

    return res.json({
      connections,
      clientAccounts,
      managerAccounts,
      hierarchy,
      hasConnection: true,
      cached: false,
    });
  } catch (error) {
    logger.error("getConnections Error:", error);
    return res.status(500).json({ error: "Failed to load connections" });
  }
};

export const getCampaigns = async (req, res) => {
  const { customer_id } = req.body;
  const userId = req.user._id || req.user.id;

  if (!customer_id) return res.status(400).json({ error: "Missing customer_id" });

  try {
    const tokenDoc = await GoogleAdsToken.findOne({ user: userId });
    if (!tokenDoc) return res.status(401).json({ error: "Not connected" });

    if (!tokenDoc.accessToken || Date.now() > new Date(tokenDoc.expiryDate).getTime() - 60000) {
      if (!tokenDoc.refreshToken) return res.status(401).json({ error: "No refresh token, please reconnect" });
      const newTokens = await refreshGoogleToken(tokenDoc.refreshToken);
      tokenDoc.accessToken = newTokens.access_token;
      tokenDoc.expiryDate = new Date(Date.now() + newTokens.expires_in * 1000);
      await tokenDoc.save();
    }

    const client = getGoogleAdsClient(tokenDoc.refreshToken || tokenDoc.accessToken, customer_id, tokenDoc.rootCustomerId);

    const query = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.start_date,
        campaign.end_date,
        campaign.advertising_channel_type,
        campaign.serving_status
      FROM campaign
      WHERE campaign.status IN ('ENABLED', 'PAUSED')
    `;

    const resp = await client.query(query);
    let rows;
    if (Array.isArray(resp)) rows = resp;
    else if (Array.isArray(resp.results)) rows = resp.results;
    else rows = resp;

    const campaigns = (rows || []).map((r) => {
      const campaignObj = r.campaign || r.campaign || r;
      return { campaign: campaignObj };
    });

    const accountName = `Account ${customer_id}`;
    res.json({ campaigns, accountName });
  } catch (error) {
    logger.error("getCampaigns Error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch campaigns" });
  }
};

export const checkConnection = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const tokenDoc = await GoogleAdsToken.findOne({ user: userId });
    res.json({ hasConnection: !!tokenDoc });
  } catch (error) {
    logger.error("checkConnection Error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const disconnectGoogleAds = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    // Delete OAuth tokens AND every cached report for this user.
    // Disconnecting from Google Ads should fully wipe the local copy of their data.
    const [tokenRes, productRes, keywordRes] = await Promise.all([
      GoogleAdsToken.deleteOne({ user: userId }),
      OnDemandProductReport.deleteMany({ user: userId }),
      KeywordSearchTermReport.deleteMany({ user: userId }),
    ]);
    logger.info(
      `Disconnected user ${userId}: removed ${tokenRes.deletedCount} token doc, ` +
      `${productRes.deletedCount} product reports, ${keywordRes.deletedCount} keyword reports`
    );
    res.json({
      success: true,
      deletedProductReports: productRes.deletedCount,
      deletedKeywordReports: keywordRes.deletedCount,
    });
  } catch (error) {
    logger.error("disconnectGoogleAds Error:", error);
    res.status(500).json({ error: error.message });
  }
};
