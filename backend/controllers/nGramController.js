// N-Gram Analysis controller.
//
// Computes 1/2/3-grams from the existing KeywordSearchTermReport collection
// (the data already fetched by the Keyword Analysis tool). DOES NOT hit
// Google Ads API — runs entirely off cached search terms.
//
// Search vs PMax are kept SEPARATE because their data has different
// fundamentals (PMax has no cost data, different volume thresholds).
// The page lets the user toggle source.
//
// Stop-word filtering is OPTIONAL (keep all n-grams in storage, filter at
// display time so user can toggle).
//
// Output: every n-gram has aggregated metrics across all search terms that
// contained it. Sorted client-side based on the user's chosen sort key
// ("top performing" vs "wasted spend" etc.).

import NGramReport from "../models/NGramReport.js";
import KeywordSearchTermReport from "../models/KeywordSearchTermReport.js";

const STOP_WORDS = new Set([
  "the", "a", "an", "of", "for", "to", "in", "on", "at", "with",
  "and", "or", "but", "is", "are", "was", "were", "be", "been", "being",
  "my", "your", "our", "this", "that", "these", "those", "it", "its",
  "as", "by", "from", "i", "we", "you", "they", "he", "she", "his", "her",
  "do", "does", "did", "have", "has", "had", "can", "could", "will", "would",
  "should", "shall", "may", "might", "if", "then", "than", "so", "not",
]);

const formatCustomerId = (id) =>
  id ? String(id).replace(/customers\//g, "").replace(/-/g, "").trim() : "";

// ============= JOB TRACKER =============
const jobs = new Map();
const jobKey = (userId, customerId, period) => `${userId}_${customerId}_${period}`;
const setJob = (userId, customerId, period, patch) => {
  const k = jobKey(userId, customerId, period);
  jobs.set(k, { ...(jobs.get(k) || {}), ...patch });
};
const getJob = (userId, customerId, period) => jobs.get(jobKey(userId, customerId, period));

// ============= TOKENIZATION =============
// Lowercase, strip punctuation, split on whitespace. Drop tokens that are
// pure numbers (often noise like SKU IDs that happen to land in titles).
const tokenize = (text) => {
  if (!text) return [];
  return String(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s'-]+/gu, " ") // keep letters, numbers, apostrophes, hyphens
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter((t) => t && !/^\d+$/.test(t));
};

// Generate all n-grams of a given size from a token list.
const generateNgrams = (tokens, size) => {
  if (tokens.length < size) return [];
  const out = [];
  for (let i = 0; i <= tokens.length - size; i++) {
    out.push(tokens.slice(i, i + size).join(" "));
  }
  return out;
};

// ============= AGGREGATION =============
// For one source set of search terms, produce all n-gram aggregates for
// sizes 1, 2, 3.
const aggregateNgramsFromTerms = (terms, sourceType) => {
  const map = new Map(); // key = `${size}_${ngram}` → row
  let totalSourceTerms = 0;

  for (const term of terms) {
    const tokens = tokenize(term.search_term);
    if (tokens.length === 0) continue;
    totalSourceTerms++;

    // Track which n-grams are produced from THIS term so we count each
    // distinct (ngram, term) pair exactly once for source_term_count.
    const seenForThisTerm = new Set();

    for (const size of [1, 2, 3]) {
      const ngrams = new Set(generateNgrams(tokens, size)); // dedupe within term
      for (const ng of ngrams) {
        const k = `${size}_${ng}`;
        if (!map.has(k)) {
          map.set(k, {
            ngram: ng,
            ngram_size: size,
            source_type: sourceType,
            source_term_count: 0,
            has_cost_data: false,
            total_impressions: 0,
            total_clicks: 0,
            total_cost: 0,
            total_conversions: 0,
            total_conversion_value: 0,
          });
        }
        const row = map.get(k);
        if (!seenForThisTerm.has(k)) {
          row.source_term_count += 1;
          seenForThisTerm.add(k);
        }
        row.total_impressions += term.total_impressions || 0;
        row.total_clicks += term.total_clicks || 0;
        row.total_cost += term.total_cost || 0;
        row.total_conversions += term.total_conversions || 0;
        row.total_conversion_value += term.total_conversion_value || 0;
        if (term.has_cost_data) row.has_cost_data = true;
      }
    }
  }

  // Compute derived metrics
  const result = Array.from(map.values()).map((r) => {
    r.ctr = r.total_impressions > 0 ? (r.total_clicks / r.total_impressions) * 100 : 0;
    r.conv_rate = r.total_clicks > 0 ? (r.total_conversions / r.total_clicks) * 100 : 0;
    r.roas = r.total_cost > 0 ? r.total_conversion_value / r.total_cost : 0;
    r.cpa = r.total_conversions > 0 ? r.total_cost / r.total_conversions : 0;
    return r;
  });

  return { ngrams: result, totalSourceTerms };
};

// ============= MAIN GENERATION =============
async function runNGramGeneration(userId, cid, reportType) {
  // Pull the keyword tool's stored search terms for this period.
  const terms = await KeywordSearchTermReport.find({
    user: userId, customer_id: cid, report_type: reportType,
  }).lean();

  if (terms.length === 0) {
    throw new Error(
      "No search-term data found for this period. Run the Keyword Analysis tool first " +
      "(Dashboard → Negative Keywords & Search Terms — wait, sorry: Dashboard → Keywords)."
    );
  }

  // Split by source: a term is "PMax" if EVERY contributing campaign was PMax.
  // Mixed-source terms are tagged as SEARCH (since they have cost data and are
  // actionable as Search/Shopping negatives).
  const searchTerms = [];
  const pmaxTerms = [];
  for (const t of terms) {
    const channels = new Set(t.channel_types || []);
    const onlyPmax = channels.size > 0 && [...channels].every((c) => c === "PERFORMANCE_MAX");
    if (onlyPmax) pmaxTerms.push(t);
    else searchTerms.push(t);
  }

  setJob(userId, cid, reportType, { progress: `Aggregating n-grams from ${terms.length} search terms...` });

  const search = aggregateNgramsFromTerms(searchTerms, "SEARCH");
  const pmax = aggregateNgramsFromTerms(pmaxTerms, "PMAX");

  const allNgrams = [...search.ngrams, ...pmax.ngrams];

  await NGramReport.deleteMany({ user: userId, customer_id: cid, report_type: reportType });
  if (allNgrams.length > 0) {
    await NGramReport.create({
      user: userId, customer_id: cid, report_type: reportType,
      source_term_count_total: terms.length,
      ngrams: allNgrams,
    });
  }

  console.log(
    `  [ngrams] ${cid} ${reportType}: ${terms.length} terms → ` +
    `${search.ngrams.length} SEARCH + ${pmax.ngrams.length} PMAX n-grams`
  );

  return { source_terms: terms.length, ngrams: allNgrams.length };
}

// ============= CONTROLLERS =============

export const generateNGramReports = async (req, res) => {
  const userId = req.user._id;
  const { customer_id } = req.body;
  if (!customer_id) return res.status(400).json({ error: "Missing customer_id" });
  const cid = formatCustomerId(customer_id);

  const allPeriods = ["LAST_30_DAYS", "LAST_60_DAYS", "LAST_90_DAYS"];

  const existing = getJob(userId, cid, "_all");
  if (existing?.status === "RUNNING") {
    return res.status(202).json({
      status: "ALREADY_RUNNING", startedAt: existing.startedAt, progress: existing.progress,
    });
  }

  setJob(userId, cid, "_all", {
    status: "RUNNING", startedAt: Date.now(), progress: "Starting...", error: null, result: null,
  });
  res.status(202).json({ status: "STARTED" });

  (async () => {
    try {
      const results = [];
      for (const period of allPeriods) {
        setJob(userId, cid, "_all", { progress: `Processing ${period}...` });
        try {
          const r = await runNGramGeneration(userId, cid, period);
          results.push({ period, ...r });
        } catch (err) {
          console.warn(`  [ngrams] ${period} skipped: ${err.message}`);
          results.push({ period, error: err.message });
        }
      }
      const totalTerms = results.reduce((s, r) => s + (r.source_terms || 0), 0);
      console.log(`✅ [ngrams] ${cid}: complete — total ${totalTerms} terms across periods`);
      setJob(userId, cid, "_all", {
        status: "COMPLETED", completedAt: Date.now(),
        result: { results, total_source_terms: totalTerms },
      });
    } catch (err) {
      console.error(`💥 [ngrams] ${cid}: failed — ${err.message}`);
      setJob(userId, cid, "_all", { status: "FAILED", completedAt: Date.now(), error: err.message });
    }
  })();
};

export const getNGramStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { customer_id } = req.body;
    const cid = customer_id ? formatCustomerId(customer_id) : null;
    const job = cid ? getJob(userId, cid, "_all") : null;
    if (job) {
      return res.json({
        status: job.status, progress: job.progress,
        startedAt: job.startedAt, completedAt: job.completedAt, error: job.error,
      });
    }
    const q = { user: userId };
    if (cid) q.customer_id = cid;
    const count = await NGramReport.countDocuments(q);
    res.json({ status: count > 0 ? "COMPLETED" : "NO_DATA" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCachedNGrams = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      customer_id, report_type,
      source_type = "SEARCH",   // SEARCH | PMAX
      ngram_size = 2,           // 1 | 2 | 3
      filter_stop_words = true,
    } = req.body;
    if (!customer_id || !report_type) {
      return res.status(400).json({ error: "Missing customer_id or report_type" });
    }
    const cid = formatCustomerId(customer_id);

    const doc = await NGramReport.findOne({
      user: userId, customer_id: cid, report_type,
    }).lean();
    if (!doc) {
      return res.json({
        ngrams: [], total_ngrams: 0, source_term_count_total: 0,
        source_type, ngram_size,
      });
    }

    let ngrams = doc.ngrams.filter(
      (n) => n.source_type === source_type && n.ngram_size === Number(ngram_size)
    );

    if (filter_stop_words) {
      ngrams = ngrams.filter((n) => {
        // For 1-grams: drop the n-gram if it's a stop word.
        // For 2/3-grams: drop only if ALL tokens are stop words.
        const tokens = n.ngram.split(" ");
        return !tokens.every((t) => STOP_WORDS.has(t));
      });
    }

    res.json({
      ngrams,
      total_ngrams: ngrams.length,
      source_term_count_total: doc.source_term_count_total,
      source_type, ngram_size,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const clearNGramReports = async (req, res) => {
  try {
    const userId = req.user._id;
    const { customer_id } = req.body;
    const q = { user: userId };
    if (customer_id) q.customer_id = formatCustomerId(customer_id);
    const r = await NGramReport.deleteMany(q);
    res.json({ success: true, deleted: r.deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
