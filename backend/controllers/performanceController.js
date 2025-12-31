// backend/controllers/performanceController.js
import Performance from "../models/Performance.js";
import Campaign from "../models/Campaign.js";

export const getAggregatedPerformance = async (req, res) => {
  try {
    const {
      user_id,
      customer_id,
      selected_campaign_id = "all",
      selected_category_tag = "all",
    } = req.body;

    // Base match
    let match = { userId: user_id, customerId: customer_id };
    if (selected_campaign_id !== "all") {
      match.campaignId = selected_campaign_id;
    }

    // Category tag filtering
    if (selected_category_tag !== "all") {
      const categoryFilters = {
        Profitable: { $expr: { $gt: [{ $divide: ["$conversionValue", "$cost"] }, 1.5] } },
        Costly: { cost: { $gt: 1000 } },
        "Zero-Conversion": { conversions: 0 },
        Zombie: {
          impressions: { $gt: 1000 },
          conversions: 0,
        },
        // Uncategorized: handled by default (no filter)
      };
      Object.assign(match, categoryFilters[selected_category_tag] || {});
    }

    // === 1. Top Summary Aggregation ===
    const [summary] = await Performance.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          total_clicks: { $sum: "$clicks" },
          total_impressions: { $sum: "$impressions" },
          total_cost: { $sum: "$cost" },
          total_conversions: { $sum: "$conversions" },
          total_conversion_value: { $sum: "$conversionValue" },
        },
      },
    ]);

    const roas = summary?.total_cost > 0
      ? summary.total_conversion_value / summary.total_cost
      : 0;

    const topSummaryData = {
      overall_roas: roas,
      total_conversions: summary?.total_conversions || 0,
      total_cost: summary?.total_cost || 0,
      total_clicks: summary?.total_clicks || 0,
      total_impressions: summary?.total_impressions || 0,
    };

    // === 2. Product-Level Summary ===
    const productSummary = await Performance.aggregate([
      { $match: match },
      {
        $group: {
          _id: { productId: "$productId", productTitle: "$productTitle" },
          total_clicks: { $sum: "$clicks" },
          total_impressions: { $sum: "$impressions" },
          total_cost: { $sum: "$cost" },
          total_conversions: { $sum: "$conversions" },
          total_conversion_value: { $sum: "$conversionValue" },
        },
      },
      {
        $project: {
          product_id: "$_id.productId",
          product_title: "$_id.productTitle",
          total_clicks: 1,
          total_impressions: 1,
          total_cost: 1,
          total_conversions: 1,
          total_conversion_value: 1,
          product_roas: {
            $cond: [
              { $gt: ["$total_cost", 0] },
              { $divide: ["$total_conversion_value", "$total_cost"] },
              0,
            ],
          },
        },
      },
    ]);

    // === 3. Campaign List ===
    const campaignList = await Campaign.find(
      { userId: user_id, customerId: customer_id },
      "id name"
    ).lean();

    // === Response ===
    res.json({
      message: "Aggregated performance data fetched successfully",
      topSummaryData,
      productSummary,
      campaignList,
    });
  } catch (err) {
    console.error("Performance aggregation error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};