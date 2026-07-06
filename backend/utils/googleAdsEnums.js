// Google Ads API — enum reverse-map utility.
//
// The Google Ads API (via the Opteo google-ads-api Node client) returns
// many status / type fields as their raw protobuf integer values instead
// of the string names our code expects. `campaign.status: 2` means
// ENABLED, not "two of something".
//
// This module gives every panel controller one place to translate raw
// integer enum values back into human-readable string names, without
// each controller re-implementing the same mapping tables.
//
// Contract:
//   * Numeric or numeric-string input → returns the mapped name if known,
//     otherwise returns the raw input as a string.
//   * String input that isn't a bare integer → returned unchanged (some
//     API responses already give us the name, especially for enums the
//     API SDK auto-decodes).
//   * null / undefined / "" → returned as "".
//
// Enum tables below are limited to values we actually consume in
// controllers. UNSPECIFIED (0) and UNKNOWN (1) are intentionally omitted
// so raw 0/1 values fall through as "0"/"1" and remain distinguishable
// from real names.

export const CAMPAIGN_STATUS = {
  2: "ENABLED",
  3: "PAUSED",
  4: "REMOVED",
};

export const CAMPAIGN_SERVING_STATUS = {
  2: "SERVING",
  3: "NONE",
  4: "ENDED",
  5: "PENDING",
  6: "SUSPENDED",
};

export const CHANNEL_TYPE = {
  2: "SEARCH",
  3: "DISPLAY",
  4: "SHOPPING",
  5: "HOTEL",
  6: "VIDEO",
  7: "MULTI_CHANNEL",
  8: "LOCAL",
  9: "SMART",
  10: "PERFORMANCE_MAX",
  11: "LOCAL_SERVICES",
  12: "DISCOVERY",
  13: "TRAVEL",
  14: "DEMAND_GEN",
};

export const BIDDING_STRATEGY_TYPE = {
  2: "ENHANCED_CPC",
  3: "MANUAL_CPC",
  4: "MANUAL_CPM",
  6: "TARGET_CPA",
  8: "TARGET_ROAS",
  9: "TARGET_SPEND",
  10: "MAXIMIZE_CONVERSIONS",
  11: "MAXIMIZE_CONVERSION_VALUE",
  12: "PERCENT_CPC",
  13: "MANUAL_CPV",
  14: "TARGET_CPM",
  15: "TARGET_IMPRESSION_SHARE",
  16: "COMMISSION",
  17: "INVALID",
  18: "MAXIMIZE_CLICKS",
};

// Same enum used for the campaign-level `bidding_strategy_system_status`
// AND `campaign_budget.status` in some responses — check the specific
// field first. This map is the campaign bid-strategy system status.
export const BIDDING_STRATEGY_SYSTEM_STATUS = {
  2: "ENABLED",
  3: "REMOVED",
  4: "LEARNING_NEW",
  5: "LEARNING_SETTING_CHANGE",
  6: "LEARNING_BUDGET_CHANGE",
  7: "LEARNING_COMPOSITION_CHANGE",
  8: "LEARNING_CONVERSION_TYPE_CHANGE",
  9: "LEARNING_CONVERSION_SETTING_CHANGE",
  10: "LIMITED_BY_CPC_BID_CEILING",
  11: "LIMITED_BY_CPC_BID_FLOOR",
  12: "LIMITED_BY_DATA",
  13: "LIMITED_BY_BUDGET",
  14: "LIMITED_BY_LOW_PRIORITY_SPEND",
  15: "LIMITED_BY_LOW_QUALITY",
  16: "LIMITED_BY_INVENTORY",
  17: "MISCONFIGURED_ZERO_ELIGIBILITY",
  18: "MISCONFIGURED_CONVERSION_TYPES",
  19: "MISCONFIGURED_CONVERSION_SETTINGS",
  20: "MISCONFIGURED_SHARED_BUDGET",
  21: "MISCONFIGURED_STRATEGY_TYPE",
  22: "PAUSED",
  23: "UNAVAILABLE",
  24: "MULTIPLE_LEARNING",
  25: "MULTIPLE_LIMITED",
  26: "MULTIPLE_MISCONFIGURED",
  27: "MULTIPLE",
};

export const BUDGET_STATUS = {
  2: "ENABLED",
  3: "REMOVED",
};

export const AD_GROUP_STATUS = {
  2: "ENABLED",
  3: "PAUSED",
  4: "REMOVED",
};

export const AD_GROUP_TYPE = {
  2: "SEARCH_STANDARD",
  3: "DISPLAY_STANDARD",
  4: "SHOPPING_PRODUCT_ADS",
  5: "HOTEL_ADS",
  6: "SHOPPING_SMART_ADS",
  7: "VIDEO_BUMPER",
  8: "VIDEO_TRUE_VIEW_IN_STREAM",
  9: "VIDEO_TRUE_VIEW_IN_DISPLAY",
  10: "VIDEO_NON_SKIPPABLE_IN_STREAM",
  11: "VIDEO_OUTSTREAM",
  12: "SEARCH_DYNAMIC_ADS",
  13: "SHOPPING_COMPARISON_LISTING_ADS",
  14: "PROMOTED_HOTEL_ADS",
  15: "VIDEO_RESPONSIVE",
  16: "VIDEO_EFFICIENT_REACH",
  17: "SMART_CAMPAIGN_ADS",
  18: "TRAVEL_ADS",
  19: "DEMAND_GEN",
};

export const AD_GROUP_AD_STATUS = {
  2: "ENABLED",
  3: "PAUSED",
  4: "REMOVED",
};

export const AD_GROUP_CRITERION_STATUS = {
  2: "ENABLED",
  3: "PAUSED",
  4: "REMOVED",
};

export const KEYWORD_MATCH_TYPE = {
  2: "EXACT",
  3: "PHRASE",
  4: "BROAD",
};

export const ASSET_TYPE = {
  2: "YOUTUBE_VIDEO",
  3: "MEDIA_BUNDLE",
  4: "IMAGE",
  5: "TEXT",
  6: "LEAD_FORM",
  7: "BOOK_ON_GOOGLE",
  8: "PROMOTION",
  9: "CALLOUT",
  10: "STRUCTURED_SNIPPET",
  11: "SITELINK",
  12: "PAGE_FEED",
  13: "DYNAMIC_EDUCATION",
  14: "MOBILE_APP",
  15: "HOTEL_CALLOUT",
  16: "CALL",
  17: "PRICE",
  18: "CALL_TO_ACTION",
  19: "DYNAMIC_REAL_ESTATE",
  20: "DYNAMIC_CUSTOM",
  21: "DYNAMIC_HOTELS_AND_RENTALS",
  22: "DYNAMIC_FLIGHTS",
  23: "DEMAND_GEN_CAROUSEL_CARD",
  24: "DYNAMIC_TRAVEL",
  25: "DYNAMIC_LOCAL",
  26: "DYNAMIC_JOBS",
  27: "LOCATION",
  28: "HOTEL_PROPERTY",
  29: "BUSINESS_NAME",
  30: "BUSINESS_LOGO",
};

// AssetFieldType — used on ad_group_ad_asset_view.field_type.
export const ASSET_FIELD_TYPE = {
  2: "HEADLINE",
  3: "DESCRIPTION",
  4: "MANDATORY_AD_TEXT",
  5: "MARKETING_IMAGE",
  6: "MEDIA_BUNDLE",
  7: "YOUTUBE_VIDEO",
  8: "BOOK_ON_GOOGLE",
  9: "LEAD_FORM",
  10: "PROMOTION",
  11: "CALLOUT",
  12: "STRUCTURED_SNIPPET",
  13: "SITELINK",
  14: "MOBILE_APP",
  15: "HOTEL_CALLOUT",
  16: "CALL",
  17: "PRICE",
  18: "LONG_HEADLINE",
  19: "BUSINESS_NAME",
  20: "SQUARE_MARKETING_IMAGE",
  21: "PORTRAIT_MARKETING_IMAGE",
  22: "LOGO",
  23: "LANDSCAPE_LOGO",
  24: "VIDEO",
  25: "CALL_TO_ACTION_SELECTION",
  26: "AD_IMAGE",
  27: "BUSINESS_LOGO",
};

export const ASSET_GROUP_STATUS = {
  2: "ENABLED",
  3: "PAUSED",
  4: "REMOVED",
};

export const AD_STRENGTH = {
  2: "PENDING",
  3: "NO_ADS",
  4: "POOR",
  5: "AVERAGE",
  6: "GOOD",
  7: "EXCELLENT",
};

export const ASSET_PERFORMANCE_LABEL = {
  2: "PENDING",
  3: "LEARNING",
  4: "LOW",
  5: "GOOD",
  6: "BEST",
};

export const SERVED_ASSET_FIELD_TYPE = {
  2: "HEADLINE_1",
  3: "HEADLINE_2",
  4: "HEADLINE_3",
  5: "DESCRIPTION_1",
  6: "DESCRIPTION_2",
};

export const POLICY_APPROVAL_STATUS = {
  2: "DISAPPROVED",
  3: "AREA_OF_INTEREST_ONLY",
  4: "APPROVED_LIMITED",
  5: "APPROVED",
};

export const POLICY_REVIEW_STATUS = {
  2: "REVIEW_IN_PROGRESS",
  3: "REVIEWED",
  4: "UNDER_APPEAL",
  5: "ELIGIBLE_MAY_SERVE",
};

export const DEVICE = {
  2: "MOBILE",
  3: "TABLET",
  4: "DESKTOP",
  5: "CONNECTED_TV",
  6: "OTHER",
};

export const AD_NETWORK_TYPE = {
  2: "SEARCH",
  3: "SEARCH_PARTNERS",
  4: "CONTENT",
  5: "MIXED",
  6: "YOUTUBE_SEARCH",
  7: "YOUTUBE_WATCH",
};

export const CONVERSION_ACTION_STATUS = {
  2: "ENABLED",
  3: "REMOVED",
  4: "HIDDEN",
};

// ConversionActionType — most common values only, uncommon ones fall
// through as raw numeric strings.
export const CONVERSION_ACTION_TYPE = {
  2: "AD_CALL",
  3: "CLICK_TO_CALL",
  4: "GOOGLE_PLAY_DOWNLOAD",
  5: "GOOGLE_PLAY_IN_APP_PURCHASE",
  6: "UPLOAD_CALLS",
  7: "UPLOAD_CLICKS",
  8: "WEBPAGE",
  9: "WEBSITE_CALL",
  10: "STORE_SALES_DIRECT_UPLOAD",
  11: "STORE_SALES",
  12: "FIREBASE_ANDROID_FIRST_OPEN",
  13: "FIREBASE_ANDROID_IN_APP_PURCHASE",
  14: "FIREBASE_ANDROID_CUSTOM",
  15: "FIREBASE_IOS_FIRST_OPEN",
  16: "FIREBASE_IOS_IN_APP_PURCHASE",
  17: "FIREBASE_IOS_CUSTOM",
  18: "THIRD_PARTY_APP_ANALYTICS_ANDROID_FIRST_OPEN",
  19: "THIRD_PARTY_APP_ANALYTICS_ANDROID_IN_APP_PURCHASE",
  20: "THIRD_PARTY_APP_ANALYTICS_ANDROID_CUSTOM",
  21: "THIRD_PARTY_APP_ANALYTICS_IOS_FIRST_OPEN",
  22: "THIRD_PARTY_APP_ANALYTICS_IOS_IN_APP_PURCHASE",
  23: "THIRD_PARTY_APP_ANALYTICS_IOS_CUSTOM",
  24: "ANDROID_APP_PRE_REGISTRATION",
  25: "ANDROID_INSTALLS_ALL_OTHER_APPS",
  26: "FLOODLIGHT_ACTION",
  27: "FLOODLIGHT_TRANSACTION",
  28: "GOOGLE_HOSTED",
  29: "LEAD_FORM_SUBMIT",
  30: "SALESFORCE",
  31: "SEARCH_ADS_360",
  32: "SMART_CAMPAIGN_AD_CLICKS_TO_CALL",
  33: "SMART_CAMPAIGN_MAP_CLICKS_TO_CALL",
  34: "SMART_CAMPAIGN_MAP_DIRECTIONS",
  35: "SMART_CAMPAIGN_TRACKED_CALLS",
  36: "STORE_VISITS",
  37: "WEBPAGE_CODELESS",
  38: "UNIVERSAL_ANALYTICS_GOAL",
  39: "UNIVERSAL_ANALYTICS_TRANSACTION",
  40: "GOOGLE_ANALYTICS_4_CUSTOM",
  41: "GOOGLE_ANALYTICS_4_PURCHASE",
};

export const CONVERSION_ACTION_CATEGORY = {
  2: "DEFAULT",
  3: "PAGE_VIEW",
  4: "PURCHASE",
  5: "SIGNUP",
  6: "LEAD",
  7: "DOWNLOAD",
  8: "ADD_TO_CART",
  9: "BEGIN_CHECKOUT",
  10: "SUBSCRIBE_PAID",
  11: "PHONE_CALL_LEAD",
  12: "IMPORTED_LEAD",
  13: "SUBMIT_LEAD_FORM",
  14: "BOOK_APPOINTMENT",
  15: "REQUEST_QUOTE",
  16: "GET_DIRECTIONS",
  17: "OUTBOUND_CLICK",
  18: "CONTACT",
  19: "ENGAGEMENT",
  20: "STORE_VISIT",
  21: "STORE_SALE",
  22: "QUALIFIED_LEAD",
  23: "CONVERTED_LEAD",
};

export const CONVERSION_ACTION_COUNTING_TYPE = {
  2: "ONE_PER_CLICK",
  3: "MANY_PER_CLICK",
};

export const ATTRIBUTION_MODEL = {
  100: "EXTERNAL",
  101: "GOOGLE_ADS_LAST_CLICK",
  102: "GOOGLE_SEARCH_ATTRIBUTION_FIRST_CLICK",
  103: "GOOGLE_SEARCH_ATTRIBUTION_LINEAR",
  104: "GOOGLE_SEARCH_ATTRIBUTION_TIME_DECAY",
  105: "GOOGLE_SEARCH_ATTRIBUTION_POSITION_BASED",
  106: "GOOGLE_SEARCH_ATTRIBUTION_DATA_DRIVEN",
};

export const CHANGE_CLIENT_TYPE = {
  2: "GOOGLE_ADS_WEB_CLIENT",
  3: "GOOGLE_ADS_AUTOMATED_RULE",
  4: "GOOGLE_ADS_SCRIPTS",
  5: "GOOGLE_ADS_BULK_UPLOAD",
  6: "GOOGLE_ADS_API",
  7: "GOOGLE_ADS_EDITOR",
  8: "GOOGLE_ADS_MOBILE_APP",
  9: "GOOGLE_ADS_RECOMMENDATIONS",
  10: "SEARCH_ADS_360_SYNC",
  11: "SEARCH_ADS_360_POST",
  12: "INTERNAL_TOOL",
  13: "OTHER",
  14: "GOOGLE_ADS_RECOMMENDATIONS_SUBSCRIPTION",
};

export const CHANGE_RESOURCE_TYPE = {
  2: "AD",
  3: "AD_GROUP",
  4: "AD_GROUP_CRITERION",
  5: "AD_GROUP_BID_MODIFIER",
  6: "CAMPAIGN",
  7: "CAMPAIGN_BUDGET",
  8: "CAMPAIGN_CRITERION",
  9: "CUSTOMER_ASSET",
  10: "CAMPAIGN_ASSET",
  11: "AD_GROUP_ASSET",
  12: "ASSET",
  13: "ASSET_SET",
  14: "ASSET_SET_ASSET",
  15: "CAMPAIGN_ASSET_SET",
  16: "AD_GROUP_ASSET_SET",
  17: "ASSET_GROUP",
  18: "ASSET_GROUP_ASSET",
  19: "ASSET_GROUP_LISTING_GROUP_FILTER",
  20: "ASSET_GROUP_SIGNAL",
  21: "CAMPAIGN_CONVERSION_GOAL",
  22: "CUSTOMER_CONVERSION_GOAL",
  23: "SHARED_CRITERION",
  24: "SHARED_SET",
  25: "CAMPAIGN_SHARED_SET",
  26: "AD_GROUP_AD",
  27: "AD_GROUP_FEED",
  28: "CAMPAIGN_FEED",
  29: "CUSTOMER_NEGATIVE_CRITERION",
  30: "FEED",
  31: "FEED_ITEM",
  32: "AD_GROUP_AD_LABEL",
  33: "AD_GROUP_LABEL",
  34: "CAMPAIGN_LABEL",
  35: "AD_GROUP_ASSET_SET_SETTING",
  36: "BIDDING_STRATEGY",
};

export const RESOURCE_CHANGE_OPERATION = {
  2: "CREATE",
  3: "UPDATE",
  4: "REMOVE",
};

// Shopping product enums — sparse for now, expand as we see more values.
export const SHOPPING_PRODUCT_STATUS = {
  2: "NOT_ELIGIBLE",
  3: "ELIGIBLE_LIMITED",
  4: "ELIGIBLE",
  5: "READY_TO_SERVE",
};

export const SHOPPING_PRODUCT_AVAILABILITY = {
  2: "IN_STOCK",
  3: "OUT_OF_STOCK",
  4: "PREORDER",
  5: "BACKORDER",
};

export const SHOPPING_PRODUCT_CHANNEL = {
  2: "ONLINE",
  3: "LOCAL",
};

export const LEAD_FORM_CALL_TO_ACTION_TYPE = {
  2: "LEARN_MORE",
  3: "GET_QUOTE",
  4: "APPLY_NOW",
  5: "SIGN_UP",
  6: "CONTACT_US",
  7: "SUBSCRIBE",
  8: "DOWNLOAD",
  9: "BOOK_NOW",
  10: "GET_OFFER",
  11: "REGISTER",
  12: "GET_INFO",
  13: "REQUEST_DEMO",
  14: "JOIN_NOW",
  15: "GET_STARTED",
};

// Demographic enums use non-sequential large integers.
export const GENDER_TYPE = {
  10: "MALE",
  11: "FEMALE",
  20: "UNDETERMINED",
};

export const AGE_RANGE_TYPE = {
  503001: "AGE_RANGE_18_24",
  503002: "AGE_RANGE_25_34",
  503003: "AGE_RANGE_35_44",
  503004: "AGE_RANGE_45_54",
  503005: "AGE_RANGE_55_64",
  503006: "AGE_RANGE_65_UP",
  503999: "AGE_RANGE_UNDETERMINED",
};

export const INCOME_RANGE_TYPE = {
  510001: "INCOME_RANGE_0_50",
  510002: "INCOME_RANGE_50_60",
  510003: "INCOME_RANGE_60_70",
  510004: "INCOME_RANGE_70_80",
  510005: "INCOME_RANGE_80_90",
  510006: "INCOME_RANGE_90_UP",
  510999: "INCOME_RANGE_UNDETERMINED",
};

// -------- helper --------
/**
 * Look up an enum value's name in the given map.
 *
 * Accepts numeric protobuf enum values (2, "2"), already-decoded string
 * names ("ENABLED"), and null / undefined / "" for safety. Returns "" for
 * empty inputs, the mapped name if known, or the original value coerced
 * to string when unmapped.
 *
 * Callers can wrap noisy raw responses like:
 *   status: enumName(CAMPAIGN_STATUS, campaign.status)
 * and receive "ENABLED" whether the API returned 2, "2", or "ENABLED".
 */
export function enumName(map, raw) {
  if (raw === null || raw === undefined || raw === "") return "";
  // Already a decoded string name — return as-is.
  if (typeof raw === "string" && !/^\d+$/.test(raw)) return raw;
  const key = String(raw);
  return map[key] || key;
}
