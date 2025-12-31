const OnDemandProductReport = require('../models/OnDemandProductReport');
const GoogleAdsToken = require('../models/GoogleAdsToken');
const { getGoogleAdsClient, refreshGoogleToken } = require('../utils/googleAdsClient');

const REPORT_TYPES = [
  { type: 'LAST_30_DAYS', days: 30, label: 'Last 30 Days' },
  { type: 'LAST_60_DAYS', days: 60, label: 'Last 60 Days' },
  { type: 'LAST_90_DAYS', days: 90, label: 'Last 90 Days' },
];

// Helper to categorize
const categorizeProduct = (product) => {
  const roas = product.total_cost === 0 ? 0 : product.total_conversion_value / product.total_cost;
  let category = 'Uncategorized';
  if (product.total_cost === 0) category = 'Zombie';
  else if (product.total_cost > 0 && product.total_conversions === 0) category = 'Zero-Conversion';
  else if (roas > 3) category = 'Profitable';
  else if (roas > 0 && roas <= 3) category = 'Costly';
  return { roas, category };
};

// Process GA API results
const processGoogleAdsData = (results) => {
  const map = new Map();

  results.forEach(row => {
    const channelType = row.campaign?.advertising_channel_type || row.campaign?.advertisingChannelType;
    if (!['SHOPPING', 'PERFORMANCE_MAX'].includes(channelType)) return;

    const productId = row.segments?.product_item_id || row.segments?.productItemId || 'Unknown';
    const productTitle = row.segments?.product_title || row.segments?.productTitle || 'Unknown Product';
    const campaignId = row.campaign?.id || 'Unknown';
    const campaignName = row.campaign?.name || 'Unknown Campaign';
    const key = `${productId}_${campaignId}`;

    const impressions = Number(row.metrics?.impressions || 0);
    const clicks = Number(row.metrics?.clicks || 0);
    const cost = Number(row.metrics?.cost_micros || 0) / 1e6;
    const conversions = Number(row.metrics?.conversions || 0);
    const conversionValue = Number(row.metrics?.conversions_value || 0);

    if (map.has(key)) {
      const existing = map.get(key);
      existing.total_impressions += impressions;
      existing.total_clicks += clicks;
      existing.total_cost += cost;
      existing.total_conversions += conversions;
      existing.total_conversion_value += conversionValue;
    } else {
      map.set(key, {
        campaign_id: campaignId,
        product_item_id: productId,
        product_title: productTitle,
        product_link: '',
        channel_type: channelType,
        campaign_name: campaignName,
        total_impressions: impressions,
        total_clicks: clicks,
        total_cost: cost,
        total_conversions: conversions,
        total_conversion_value: conversionValue,
      });
    }
  });

  return Array.from(map.values()).map(p => ({ ...p, ...categorizeProduct(p) }));
};

// Controller
const generateOnDemandProductReport = async (req, res) => {
  const userId = req.user._id;
  const { customer_id } = req.body;

  if (!customer_id) return res.status(400).json({ error: 'Missing customer_id' });

  try {
    const tokenDoc = await GoogleAdsToken.findOne({ user: userId });
    if (!tokenDoc) return res.status(401).json({ error: 'Google Ads not connected' });

    // Refresh token if expired
    if (Date.now() > tokenDoc.expiryDate - 60000) {
      const newTokens = await refreshGoogleToken(tokenDoc.refreshToken);
      tokenDoc.accessToken = newTokens.access_token;
      tokenDoc.expiryDate = new Date(Date.now() + newTokens.expires_in * 1000);
      await tokenDoc.save();
    }

    const client = getGoogleAdsClient(tokenDoc.accessToken, customer_id);
    const allStored = [];

    for (const rpt of REPORT_TYPES) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - rpt.days);

      // GAQL query
      const query = `
        SELECT 
          segments.product_title,
          segments.product_item_id,
          campaign.id,
          campaign.name,
          campaign.advertising_channel_type,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions,
          metrics.conversions_value
        FROM shopping_performance_view
        WHERE segments.date BETWEEN '${startDate.toISOString().split('T')[0]}' 
        AND '${endDate.toISOString().split('T')[0]}'
        AND metrics.impressions > 0
        AND campaign.advertising_channel_type IN ('SHOPPING', 'PERFORMANCE_MAX')
        ORDER BY metrics.cost_micros DESC
      `;

      let results = [];
      let nextPageToken = null;

      do {
        const response = await client.query(query, nextPageToken);
        results = results.concat(response.results || []);
        nextPageToken = response.nextPageToken || null;
      } while (nextPageToken);

      const processed = processGoogleAdsData(results);

      // Clear old records for this user+customer+report_type
      await OnDemandProductReport.deleteMany({ user: userId, customer_id, report_type: rpt.type });

      // Insert new
      const toInsert = processed.map(item => ({
        user: userId,
        customer_id,
        report_type: rpt.type,
        report_start_date: startDate,
        report_end_date: endDate,
        ...item
      }));

      if (toInsert.length > 0) {
        await OnDemandProductReport.insertMany(toInsert);
      }

      allStored.push({ report_type: rpt.type, count: toInsert.length });
    }

    res.json({ success: true, reports: allStored });
  } catch (error) {
    console.error('Error generating on-demand report:', error);
    res.status(500).json({ error: error.message });
  }
};


module.exports = { generateOnDemandProductReport };
