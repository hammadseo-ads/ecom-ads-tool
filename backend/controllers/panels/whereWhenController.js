// Panel 7 · Where & When Ads Show
// -----------------------------------------------------------------------
// Three sub-parts:
//   7a. Devices — cost / conv / ROAS broken down by Mobile / Desktop / Tablet
//       per campaign. Flags any device performing at <50% of the campaign
//       average or >2x.
//   7b. Day × Hour heatmap — LINKS OUT to the existing /dashboard/heatmap
//       page (fully-built already). We don't re-fetch the heatmap here —
//       the audit panel just points at it. Would be wasteful to duplicate
//       the 168-cell grid inline.
//   7c. PMax channel breakdown — cost per network (Search / YouTube Search /
//       YouTube Watch / Display / Discovery / Gmail) using v23+
//       segments.ad_network_type. This is the biggest new bit of PMax
//       visibility Google added recently.

import GoogleAdsToken from "../../models/GoogleAdsToken.js";
import { getGoogleAdsClient, refreshGoogleToken } from "../../utils/googleAdsClient.js";
import { enumName, CHANNEL_TYPE, DEVICE, AD_NETWORK_TYPE } from "../../utils/googleAdsEnums.js";

const formatCustomerId = (id) =>
  id ? String(id).replace(/customers\//g, "").replace(/-/g, "").trim() : "";
const num = (v) => Number(v ?? 0) || 0;
const toArray = (resp) => {
  if (!resp) return [];
  if (Array.isArray(resp)) return resp;
  if (Array.isArray(resp.results)) return resp.results;
  if (typeof resp[Symbol.iterator] === "function") return Array.from(resp);
  return [];
};
const candidateLogins = (tokenDoc, customerId) => [
  null,
  ...(tokenDoc.allCustomerIds || [])
    .map(formatCustomerId)
    .filter((id) => id && id !== customerId),
];
const isAuthError = (msg) =>
  /permission|not allowed|authorization|access|customer not enabled/i.test(msg || "");
const withLoginRetry = async (tokenDoc, customerId, fn) => {
  let lastErr = null;
  for (const login of candidateLogins(tokenDoc, customerId)) {
    try { return await fn(login); }
    catch (err) {
      lastErr = err;
      const msg = err?.errors?.[0]?.message || err.message || "";
      if (!isAuthError(msg)) throw err;
    }
  }
  throw lastErr || new Error("All login_customer_id candidates failed");
};
const fmtDate = (d) => new Date(d).toISOString().split("T")[0];

// ---------- devices ----------
const buildDevicesQuery = (start, end) => `
  SELECT
    campaign.id,
    campaign.name,
    campaign.advertising_channel_type,
    segments.device,
    metrics.impressions,
    metrics.clicks,
    metrics.cost_micros,
    metrics.conversions,
    metrics.conversions_value
  FROM campaign
  WHERE segments.date BETWEEN '${start}' AND '${end}'
    AND campaign.status IN ('ENABLED', 'PAUSED')
`;

const fetchDevices = async (tokenDoc, customerId, loginCustomerId, start, end) => {
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const resp = await client.query(buildDevicesQuery(start, end));
  const byCampaign = new Map();
  for (const row of toArray(resp)) {
    const c = row.campaign || {};
    const s = row.segments || {};
    const m = row.metrics || {};
    const cid = String(c.id || "");
    if (!cid) continue;
    const device = enumName(DEVICE, s.device) || "UNKNOWN";
    const entry = byCampaign.get(cid) || {
      campaign_id: cid,
      campaign_name: c.name || `Campaign ${cid}`,
      channel_type: enumName(CHANNEL_TYPE, c.advertising_channel_type ?? c.advertisingChannelType),
      by_device: {},
    };
    const d = entry.by_device[device] || { impressions: 0, clicks: 0, cost: 0, conversions: 0, conversions_value: 0 };
    d.impressions += num(m.impressions);
    d.clicks += num(m.clicks);
    d.cost += num(m.cost_micros ?? m.costMicros) / 1e6;
    d.conversions += num(m.conversions);
    d.conversions_value += num(m.conversions_value ?? m.conversionsValue);
    entry.by_device[device] = d;
    byCampaign.set(cid, entry);
  }
  // Derive CTR / CPA / ROAS + averages
  const rows = Array.from(byCampaign.values()).map((c) => {
    const devices = Object.entries(c.by_device).map(([device, d]) => ({
      device,
      ...d,
      ctr: d.impressions > 0 ? (d.clicks / d.impressions) * 100 : 0,
      average_cpc: d.clicks > 0 ? d.cost / d.clicks : 0,
      cost_per_conversion: d.conversions > 0 ? d.cost / d.conversions : 0,
      roas: d.cost > 0 ? d.conversions_value / d.cost : 0,
      conv_rate: d.clicks > 0 ? (d.conversions / d.clicks) * 100 : 0,
    }));
    const totalCost = devices.reduce((s, d) => s + d.cost, 0);
    const totalConv = devices.reduce((s, d) => s + d.conversions, 0);
    const campaignAvgCPA = totalConv > 0 ? totalCost / totalConv : 0;
    return {
      campaign_id: c.campaign_id,
      campaign_name: c.campaign_name,
      channel_type: c.channel_type,
      total_cost: totalCost,
      total_conversions: totalConv,
      campaign_avg_cpa: campaignAvgCPA,
      devices,
    };
  });
  rows.sort((a, b) => b.total_cost - a.total_cost);
  return rows;
};

// ---------- PMax network breakdown ----------
// v23+ `segments.ad_network_type` is the field Google exposed to crack
// open the PMax black box. Cost / clicks / conversions per network.
const buildPMaxNetworkQuery = (start, end) => `
  SELECT
    campaign.id,
    campaign.name,
    segments.ad_network_type,
    metrics.impressions,
    metrics.clicks,
    metrics.cost_micros,
    metrics.conversions,
    metrics.conversions_value
  FROM campaign
  WHERE segments.date BETWEEN '${start}' AND '${end}'
    AND campaign.advertising_channel_type = 'PERFORMANCE_MAX'
    AND campaign.status IN ('ENABLED', 'PAUSED')
`;

const fetchPMaxNetworks = async (tokenDoc, customerId, loginCustomerId, start, end) => {
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const resp = await client.query(buildPMaxNetworkQuery(start, end));
  const byCampaign = new Map();
  for (const row of toArray(resp)) {
    const c = row.campaign || {};
    const s = row.segments || {};
    const m = row.metrics || {};
    const cid = String(c.id || "");
    if (!cid) continue;
    const network = enumName(AD_NETWORK_TYPE, s.ad_network_type ?? s.adNetworkType) || "UNKNOWN";
    const entry = byCampaign.get(cid) || {
      campaign_id: cid,
      campaign_name: c.name || `Campaign ${cid}`,
      by_network: {},
    };
    const n = entry.by_network[network] || { impressions: 0, clicks: 0, cost: 0, conversions: 0, conversions_value: 0 };
    n.impressions += num(m.impressions);
    n.clicks += num(m.clicks);
    n.cost += num(m.cost_micros ?? m.costMicros) / 1e6;
    n.conversions += num(m.conversions);
    n.conversions_value += num(m.conversions_value ?? m.conversionsValue);
    entry.by_network[network] = n;
    byCampaign.set(cid, entry);
  }
  return Array.from(byCampaign.values()).map((c) => {
    const networks = Object.entries(c.by_network).map(([network, n]) => ({
      network,
      ...n,
      roas: n.cost > 0 ? n.conversions_value / n.cost : 0,
    }));
    const totalCost = networks.reduce((s, n) => s + n.cost, 0);
    return {
      campaign_id: c.campaign_id,
      campaign_name: c.campaign_name,
      total_cost: totalCost,
      networks: networks.map((n) => ({ ...n, cost_share: totalCost > 0 ? n.cost / totalCost : 0 })),
    };
  }).sort((a, b) => b.total_cost - a.total_cost);
};

// ---------- flag engine ----------
const buildFlags = ({ devices, pmax_networks }) => {
  const flags = [];

  // Device performance outliers within a campaign
  for (const c of devices) {
    if (c.total_conversions < 5) continue; // not enough signal
    const campAvgROAS = c.total_cost > 0
      ? c.devices.reduce((s, d) => s + d.conversions_value, 0) / c.total_cost
      : 0;
    for (const d of c.devices) {
      if (d.cost < 25) continue; // ignore tiny device slices
      if (d.conversions === 0 && d.cost > 100) {
        flags.push({
          code: "device_zero_conv",
          severity: "warn",
          target_type: "campaign",
          target_id: c.campaign_id,
          target_name: c.campaign_name,
          message: `${d.device} spent $${d.cost.toFixed(2)} in this campaign with 0 conversions. Candidate for -100% bid adjustment on manual-bid campaigns.`,
          meta: { device: d.device, cost: d.cost, conversions: 0 },
        });
        continue;
      }
      if (campAvgROAS > 0 && d.roas > 0 && d.roas < campAvgROAS * 0.5) {
        flags.push({
          code: "device_underperforming",
          severity: "info",
          target_type: "campaign",
          target_id: c.campaign_id,
          target_name: c.campaign_name,
          message: `${d.device} ROAS ${d.roas.toFixed(2)} is <50% of campaign avg ${campAvgROAS.toFixed(2)}.`,
          meta: { device: d.device, device_roas: d.roas, campaign_avg_roas: campAvgROAS },
        });
      }
    }
  }

  // PMax network waste
  for (const c of pmax_networks) {
    for (const n of c.networks) {
      if (n.cost < 100) continue;
      if (n.conversions === 0) {
        flags.push({
          code: "pmax_network_zero_conv",
          severity: "warn",
          target_type: "campaign",
          target_id: c.campaign_id,
          target_name: c.campaign_name,
          message: `${n.network} in PMax spent $${n.cost.toFixed(2)} (${(n.cost_share * 100).toFixed(0)}% of this campaign) with 0 conversions.`,
          meta: { network: n.network, cost: n.cost, cost_share: n.cost_share },
        });
      } else if (n.cost_share > 0.25 && c.total_cost > 500) {
        // Big share of budget going to one network — call it out even if converting
        // (informational — operator decides if the mix is healthy).
        // We only flag if the network is not Search (Search is usually intended).
        if (!/SEARCH/.test(n.network)) {
          const flagIfLow = n.roas < 1.0;
          if (flagIfLow) {
            flags.push({
              code: "pmax_network_big_low_roas",
              severity: "info",
              target_type: "campaign",
              target_id: c.campaign_id,
              target_name: c.campaign_name,
              message: `${n.network} is ${(n.cost_share * 100).toFixed(0)}% of this PMax spend with ROAS ${n.roas.toFixed(2)}.`,
              meta: { network: n.network, cost: n.cost, cost_share: n.cost_share, roas: n.roas },
            });
          }
        }
      }
    }
  }

  return flags;
};

// ---------- main refresh export ----------
export const refreshWhereWhen = async ({ user, audit, start: startOverride, end: endOverride }) => {
  const tokenDoc = await GoogleAdsToken.findOne({ user: user._id });
  if (!tokenDoc) throw new Error("Google Ads is not connected for this user");

  if (Date.now() > (tokenDoc.expiryDate?.getTime() || 0) - 60000) {
    const t = await refreshGoogleToken(tokenDoc.refreshToken);
    tokenDoc.accessToken = t.access_token;
    tokenDoc.expiryDate = new Date(Date.now() + t.expires_in * 1000);
    await tokenDoc.save();
  }

  const customerId = formatCustomerId(audit.customer_id);
  const rangeStart = startOverride ? new Date(startOverride) : new Date(audit.start_date);
  const rangeEnd = endOverride ? new Date(endOverride) : new Date(audit.end_date);
  const start = fmtDate(rangeStart);
  const end = fmtDate(rangeEnd);

  const devices = await withLoginRetry(tokenDoc, customerId, (login) =>
    fetchDevices(tokenDoc, customerId, login, start, end)
  );

  // PMax networks — non-blocking on account without PMax
  let pmax_networks = [];
  try {
    pmax_networks = await withLoginRetry(tokenDoc, customerId, (login) =>
      fetchPMaxNetworks(tokenDoc, customerId, login, start, end)
    );
  } catch (err) {
    console.warn("[where_when] PMax network fetch failed:", err?.message?.slice(0, 200));
  }

  const flags = buildFlags({ devices, pmax_networks });

  const snapshot = {
    time_frame: audit.time_frame,
    start_date: rangeStart,
    end_date: rangeEnd,
    devices,
    pmax_networks,
    heatmap_link: "/dashboard/heatmap",
    heatmap_note: "The full 7×24 hour × day heatmap lives on the existing Heatmap page. Filter to Search campaigns there when auditing that step of the checklist.",
  };

  return { snapshot, flags };
};
