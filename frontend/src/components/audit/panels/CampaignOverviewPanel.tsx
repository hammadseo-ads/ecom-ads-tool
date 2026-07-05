// Panel 1 · Campaign Overview
// Sits inside the <AuditPanel> wrapper. Renders the campaigns table,
// summary tiles, and CSV export button. Data comes from the panel's
// data_snapshot (populated by the backend's refresh endpoint).

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface CampaignRow {
  id: string;
  name: string;
  status: string;
  serving_status: string;
  channel_type: string;
  channel_sub_type: string;
  bidding_strategy_type: string;
  bidding_strategy_system_status: string;
  target_roas: number;
  target_cpa: number;
  daily_budget: number;
  budget_status: string;
  budget_shared: boolean;
  impressions: number;
  clicks: number;
  ctr: number;
  average_cpc: number;
  cost: number;
  conversions: number;
  conversions_value: number;
  cost_per_conversion: number;
  actual_roas: number;
  search_budget_lost_is: number | null;
  search_rank_lost_is: number | null;
  is_budget_limited: boolean;
  prior_cost: number | null;
  prior_conversions: number | null;
  prior_conversions_value: number | null;
  delta_cost_pct: number | null;
  delta_conversions_pct: number | null;
  delta_conversions_value_pct: number | null;
}

interface Snapshot {
  time_frame: string;
  start_date: string;
  end_date: string;
  prior_start_date: string;
  prior_end_date: string;
  summary: {
    total_campaigns: number;
    enabled_campaigns: number;
    paused_campaigns: number;
    removed_campaigns: number;
    total_cost: number;
    total_conversions: number;
    total_conversions_value: number;
  };
  rows: CampaignRow[];
}

// Multi-period snapshot shape (from ALL_THREE_PERIODS refresh).
interface MultiPeriodSnapshot {
  multi_period: true;
  primary_key: string;
  periods: Record<string, { snapshot: Snapshot; flags: unknown[] }>;
}

type AnySnapshot = Snapshot | MultiPeriodSnapshot | null;

interface Props {
  snapshot: AnySnapshot;
  clientName?: string;
}

const PERIOD_LABEL: Record<string, string> = {
  LAST_30_DAYS: "Last 30 days",
  LAST_60_DAYS: "Last 60 days",
  LAST_90_DAYS: "Last 90 days",
};

const isMultiPeriod = (s: AnySnapshot): s is MultiPeriodSnapshot =>
  Boolean(s && (s as MultiPeriodSnapshot).multi_period === true);

const fmtCurrency = (n: number) =>
  `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtInt = (n: number) => Math.round(n).toLocaleString();
const fmtPct = (n: number, digits = 2) => `${n.toFixed(digits)}%`;
const fmtNum = (n: number, digits = 2) => n.toFixed(digits);

const CHANNEL_ABBREV: Record<string, string> = {
  SEARCH: "Search",
  DISPLAY: "Display",
  SHOPPING: "Shopping",
  VIDEO: "Video",
  PERFORMANCE_MAX: "PMax",
  LOCAL: "Local",
  DISCOVERY: "Discovery",
  DEMAND_GEN: "Demand Gen",
  HOTEL: "Hotel",
  MULTI_CHANNEL: "Multi",
};

const BIDDING_ABBREV: Record<string, string> = {
  MANUAL_CPC: "Manual CPC",
  MANUAL_CPM: "Manual CPM",
  MANUAL_CPV: "Manual CPV",
  MAXIMIZE_CLICKS: "Max Clicks",
  MAXIMIZE_CONVERSIONS: "Max Conv",
  MAXIMIZE_CONVERSION_VALUE: "Max Conv Value",
  TARGET_CPA: "Target CPA",
  TARGET_ROAS: "Target ROAS",
  TARGET_IMPRESSION_SHARE: "Target IS",
  TARGET_SPEND: "Target Spend",
  PERCENT_CPC: "Percent CPC",
  ENHANCED_CPC: "Enhanced CPC",
};

const statusPill = (status: string, servingStatus: string, isBudgetLimited: boolean, biddingStatus: string) => {
  if (status === "PAUSED") return <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">Paused</Badge>;
  if (status === "REMOVED") return <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">Removed</Badge>;
  if (isBudgetLimited) return <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-200">Limited by Budget</Badge>;
  if (biddingStatus === "LEARNING") return <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">Learning</Badge>;
  if (/^LIMITED_BY_/.test(biddingStatus || "")) return <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-200">{biddingStatus.replace(/_/g, " ").toLowerCase()}</Badge>;
  return <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200">Eligible</Badge>;
};

const deltaChip = (pct: number | null) => {
  if (pct == null || !isFinite(pct)) return <span className="text-xs text-gray-400 tabular-nums">—</span>;
  const abs = Math.abs(pct);
  const isBig = abs >= 30;
  const Icon = pct > 0 ? TrendingUp : pct < 0 ? TrendingDown : Minus;
  const color =
    pct > 0
      ? isBig ? "text-emerald-700 font-semibold" : "text-emerald-600"
      : pct < 0
      ? isBig ? "text-red-700 font-semibold" : "text-red-600"
      : "text-gray-500";
  return (
    <span className={`inline-flex items-center gap-1 text-xs tabular-nums ${color}`}>
      <Icon className="w-3 h-3" />
      {pct > 0 ? "+" : ""}{pct.toFixed(0)}%
    </span>
  );
};

const downloadCSV = (rows: CampaignRow[], filename: string) => {
  const headers = [
    "id", "name", "status", "channel_type", "channel_sub_type",
    "bidding_strategy_type", "bidding_strategy_system_status",
    "target_roas", "target_cpa", "daily_budget",
    "impressions", "clicks", "ctr", "average_cpc", "cost",
    "conversions", "conversions_value", "cost_per_conversion", "actual_roas",
    "search_budget_lost_is", "search_rank_lost_is", "is_budget_limited",
    "prior_cost", "prior_conversions", "prior_conversions_value",
    "delta_cost_pct", "delta_conversions_pct", "delta_conversions_value_pct",
  ];
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (s.includes(",") || s.includes("\"") || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape((r as unknown as Record<string, unknown>)[h])).join(",")),
  ].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export function CampaignOverviewPanel({ snapshot, clientName }: Props) {
  // For multi-period snapshots, keep a selected period key in state.
  const multi = isMultiPeriod(snapshot);
  const availableKeys = multi ? Object.keys((snapshot as MultiPeriodSnapshot).periods) : [];
  const defaultKey = multi
    ? ((snapshot as MultiPeriodSnapshot).primary_key || availableKeys[0])
    : null;
  const [periodKey, setPeriodKey] = useState<string | null>(defaultKey);

  // Resolve the active single-period snapshot to render.
  const active: Snapshot | null = useMemo(() => {
    if (!snapshot) return null;
    if (multi) {
      const key = periodKey || (snapshot as MultiPeriodSnapshot).primary_key;
      return ((snapshot as MultiPeriodSnapshot).periods[key]?.snapshot) || null;
    }
    return snapshot as Snapshot;
  }, [snapshot, multi, periodKey]);

  const groups = useMemo(() => {
    if (!active?.rows) return { enabled: [], paused: [], removed: [] };
    return {
      enabled: active.rows.filter((r) => r.status === "ENABLED"),
      paused: active.rows.filter((r) => r.status === "PAUSED"),
      removed: active.rows.filter((r) => r.status === "REMOVED"),
    };
  }, [active]);

  if (!active?.rows?.length) {
    return null;
  }

  const s = active.summary;
  const filename = `${(clientName || "audit").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}_${active.start_date.slice(0, 10)}_campaigns${multi && periodKey ? `_${periodKey.toLowerCase()}` : ""}.csv`;

  return (
    <div className="p-5 space-y-5">
      {/* Period picker — only shown for multi-period audits */}
      {multi && availableKeys.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mr-1">Period:</span>
          {availableKeys.map((k) => {
            const active = periodKey === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setPeriodKey(k)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  active
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-gray-700 border-gray-200 hover:border-emerald-300 hover:text-emerald-800"
                }`}
              >
                {PERIOD_LABEL[k] || k.replace(/_/g, " ").toLowerCase()}
              </button>
            );
          })}
        </div>
      )}

      {/* Summary tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Campaigns</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{s.total_campaigns}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            {s.enabled_campaigns} enabled · {s.paused_campaigns} paused
            {s.removed_campaigns ? ` · ${s.removed_campaigns} removed` : ""}
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Total spend</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{fmtCurrency(s.total_cost)}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">across window</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Conversions</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{fmtInt(s.total_conversions)}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">value {fmtCurrency(s.total_conversions_value)}</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Account ROAS</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {s.total_cost > 0 ? fmtNum(s.total_conversions_value / s.total_cost) : "—"}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">value / cost</div>
        </div>
      </div>

      {/* Action row */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-gray-500">
          Window: <strong>{active.start_date.slice(0, 10)} → {active.end_date.slice(0, 10)}</strong>
          {active.prior_start_date && (
            <>
              {" · Prior: "}
              <strong>{active.prior_start_date.slice(0, 10)} → {active.prior_end_date.slice(0, 10)}</strong>
            </>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={() => downloadCSV(active.rows, filename)}>
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-5">
        <table className="w-full text-sm min-w-[1100px]">
          <thead className="bg-gray-50 border-y border-gray-200">
            <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
              <th className="text-left py-2 px-3">Campaign</th>
              <th className="text-left py-2 px-3">Type</th>
              <th className="text-left py-2 px-3">Status</th>
              <th className="text-left py-2 px-3">Bidding</th>
              <th className="text-right py-2 px-3">Budget/day</th>
              <th className="text-right py-2 px-3">Cost</th>
              <th className="text-right py-2 px-3">Δ vs prior</th>
              <th className="text-right py-2 px-3">Conv</th>
              <th className="text-right py-2 px-3">Δ conv</th>
              <th className="text-right py-2 px-3">Conv value</th>
              <th className="text-right py-2 px-3">ROAS</th>
              <th className="text-right py-2 px-3">Lost IS<br />Bud / Rank</th>
            </tr>
          </thead>
          <tbody>
            {groups.enabled.map((r, i) => (
              <CampaignRow key={r.id} r={r} striped={i % 2 === 1} />
            ))}
            {groups.paused.length > 0 && (
              <>
                <tr className="bg-gray-50 border-y border-gray-200">
                  <td colSpan={12} className="py-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Historical — paused
                  </td>
                </tr>
                {groups.paused.map((r, i) => (
                  <CampaignRow key={r.id} r={r} striped={i % 2 === 1} muted />
                ))}
              </>
            )}
            {groups.removed.length > 0 && (
              <>
                <tr className="bg-gray-50 border-y border-gray-200">
                  <td colSpan={12} className="py-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Removed
                  </td>
                </tr>
                {groups.removed.map((r, i) => (
                  <CampaignRow key={r.id} r={r} striped={i % 2 === 1} muted />
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CampaignRow({ r, striped, muted }: { r: CampaignRow; striped?: boolean; muted?: boolean }) {
  return (
    <tr className={`${striped ? "bg-gray-50/50" : ""} ${muted ? "text-gray-500" : "text-gray-800"} border-b border-gray-100`}>
      <td className="py-2 px-3 max-w-[280px]">
        <div className={`font-medium truncate ${muted ? "" : "text-gray-900"}`} title={r.name}>{r.name}</div>
        <div className="text-[10px] text-gray-500 tabular-nums">ID {r.id}</div>
      </td>
      <td className="py-2 px-3 text-xs">
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 font-medium">
          {CHANNEL_ABBREV[r.channel_type] || r.channel_type || "—"}
        </Badge>
      </td>
      <td className="py-2 px-3 text-xs">
        {statusPill(r.status, r.serving_status, r.is_budget_limited, r.bidding_strategy_system_status)}
      </td>
      <td className="py-2 px-3 text-xs">
        <div className="font-medium">{BIDDING_ABBREV[r.bidding_strategy_type] || r.bidding_strategy_type || "—"}</div>
        {r.target_roas > 0 && <div className="text-[10px] text-gray-500 tabular-nums">tROAS {r.target_roas.toFixed(2)}</div>}
        {r.target_cpa > 0 && <div className="text-[10px] text-gray-500 tabular-nums">tCPA ${r.target_cpa.toFixed(2)}</div>}
      </td>
      <td className="py-2 px-3 text-right tabular-nums">
        {r.daily_budget > 0 ? `$${r.daily_budget.toFixed(2)}` : "—"}
      </td>
      <td className="py-2 px-3 text-right tabular-nums font-medium">{fmtCurrency(r.cost)}</td>
      <td className="py-2 px-3 text-right">{deltaChip(r.delta_cost_pct)}</td>
      <td className="py-2 px-3 text-right tabular-nums">{fmtNum(r.conversions, 1)}</td>
      <td className="py-2 px-3 text-right">{deltaChip(r.delta_conversions_pct)}</td>
      <td className="py-2 px-3 text-right tabular-nums">{fmtCurrency(r.conversions_value)}</td>
      <td className="py-2 px-3 text-right tabular-nums font-medium text-emerald-700">
        {r.cost > 0 ? fmtNum(r.actual_roas) : "—"}
      </td>
      <td className="py-2 px-3 text-right text-xs tabular-nums">
        <span className={r.search_budget_lost_is != null && r.search_budget_lost_is >= 0.05 ? "text-amber-800 font-semibold" : "text-gray-500"}>
          {r.search_budget_lost_is != null ? fmtPct(r.search_budget_lost_is * 100, 0) : "—"}
        </span>
        {" / "}
        <span className={r.search_rank_lost_is != null && r.search_rank_lost_is >= 0.3 ? "text-amber-800 font-semibold" : "text-gray-500"}>
          {r.search_rank_lost_is != null ? fmtPct(r.search_rank_lost_is * 100, 0) : "—"}
        </span>
      </td>
    </tr>
  );
}
