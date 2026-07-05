// Panel 2 · Performance Snapshot body.
// Account-level rollup + per-campaign KPIs, with prior-period deltas.
// Multi-period aware — shows a 30/60/90 tab picker when the snapshot has periods.

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface CampaignRow {
  id: string;
  name: string;
  status: string;
  channel_type: string;
  bidding_strategy_type: string;
  target_roas: number;
  target_cpa: number;
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
  delta_cost_pct: number | null;
  delta_conversions_pct: number | null;
  delta_conversions_value_pct: number | null;
  delta_ctr_pct: number | null;
}

interface AccountSummary {
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
  delta_impressions_pct: number | null;
  delta_clicks_pct: number | null;
  delta_cost_pct: number | null;
  delta_conversions_pct: number | null;
  delta_conversions_value_pct: number | null;
  delta_ctr_pct: number | null;
  delta_cpa_pct: number | null;
  delta_roas_pct: number | null;
}

interface Snapshot {
  time_frame: string;
  start_date: string;
  end_date: string;
  prior_start_date: string;
  prior_end_date: string;
  account: AccountSummary;
  prior: AccountSummary;
  per_campaign: CampaignRow[];
}

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
const fmtNum = (n: number, d = 2) => n.toFixed(d);
const fmtPct = (n: number, d = 2) => `${n.toFixed(d)}%`;

const DeltaChip = ({ pct, invert = false }: { pct: number | null; invert?: boolean }) => {
  if (pct == null || !isFinite(pct)) return <span className="text-xs text-gray-400 tabular-nums">—</span>;
  const abs = Math.abs(pct);
  const isBig = abs >= 30;
  const isPositive = invert ? pct < 0 : pct > 0;
  const isNegative = invert ? pct > 0 : pct < 0;
  const Icon = pct > 0 ? TrendingUp : pct < 0 ? TrendingDown : Minus;
  const color = isPositive
    ? isBig ? "text-emerald-700 font-semibold" : "text-emerald-600"
    : isNegative
    ? isBig ? "text-red-700 font-semibold" : "text-red-600"
    : "text-gray-500";
  return (
    <span className={`inline-flex items-center gap-1 text-xs tabular-nums ${color}`}>
      <Icon className="w-3 h-3" />
      {pct > 0 ? "+" : ""}{pct.toFixed(0)}%
    </span>
  );
};

const StatCard = ({
  label, value, delta, deltaInvert = false, sublabel,
}: {
  label: string;
  value: string;
  delta?: number | null;
  deltaInvert?: boolean;
  sublabel?: string;
}) => (
  <div className="border border-gray-200 rounded-lg p-4">
    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</div>
    <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
    <div className="flex items-center gap-2 mt-1">
      {delta !== undefined && <DeltaChip pct={delta ?? null} invert={deltaInvert} />}
      {sublabel && <span className="text-[11px] text-gray-500">{sublabel}</span>}
    </div>
  </div>
);

const downloadCSV = (rows: CampaignRow[], filename: string) => {
  const headers = [
    "id", "name", "status", "channel_type", "bidding_strategy_type",
    "target_roas", "target_cpa",
    "impressions", "clicks", "ctr", "average_cpc",
    "cost", "conversions", "conversions_value",
    "cost_per_conversion", "actual_roas",
    "search_budget_lost_is", "search_rank_lost_is",
    "delta_cost_pct", "delta_conversions_pct", "delta_conversions_value_pct", "delta_ctr_pct",
  ];
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape((r as unknown as Record<string, unknown>)[h])).join(",")),
  ].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export function PerformanceSnapshotPanel({ snapshot, clientName }: Props) {
  const multi = isMultiPeriod(snapshot);
  const availableKeys = multi ? Object.keys((snapshot as MultiPeriodSnapshot).periods) : [];
  const defaultKey = multi
    ? ((snapshot as MultiPeriodSnapshot).primary_key || availableKeys[0])
    : null;
  const [periodKey, setPeriodKey] = useState<string | null>(defaultKey);

  const active: Snapshot | null = useMemo(() => {
    if (!snapshot) return null;
    if (multi) {
      const key = periodKey || (snapshot as MultiPeriodSnapshot).primary_key;
      return ((snapshot as MultiPeriodSnapshot).periods[key]?.snapshot) || null;
    }
    return snapshot as Snapshot;
  }, [snapshot, multi, periodKey]);

  if (!active) return null;

  const acc = active.account;
  const filename = `${(clientName || "audit").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}_${active.start_date.slice(0, 10)}_performance${multi && periodKey ? `_${periodKey.toLowerCase()}` : ""}.csv`;

  return (
    <div className="p-5 space-y-5">
      {/* Period picker */}
      {multi && availableKeys.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mr-1">Period:</span>
          {availableKeys.map((k) => {
            const isActive = periodKey === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setPeriodKey(k)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  isActive
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

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total spend" value={fmtCurrency(acc.cost)} delta={acc.delta_cost_pct} sublabel="vs prior" />
        <StatCard label="Conversions" value={fmtInt(acc.conversions)} delta={acc.delta_conversions_pct} sublabel="vs prior" />
        <StatCard label="Conv value" value={fmtCurrency(acc.conversions_value)} delta={acc.delta_conversions_value_pct} sublabel="vs prior" />
        <StatCard label="Account ROAS" value={acc.cost > 0 ? fmtNum(acc.actual_roas) : "—"} delta={acc.delta_roas_pct} sublabel="value / cost" />
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <StatCard label="Impressions" value={fmtInt(acc.impressions)} delta={acc.delta_impressions_pct} />
        <StatCard label="Clicks" value={fmtInt(acc.clicks)} delta={acc.delta_clicks_pct} />
        <StatCard label="CTR" value={fmtPct(acc.ctr)} delta={acc.delta_ctr_pct} />
        <StatCard label="Avg CPC" value={fmtCurrency(acc.average_cpc)} />
        <StatCard label="CPA" value={acc.conversions > 0 ? fmtCurrency(acc.cost_per_conversion) : "—"} delta={acc.delta_cpa_pct} deltaInvert />
        <StatCard
          label="Search Lost IS"
          value={
            acc.search_budget_lost_is != null || acc.search_rank_lost_is != null
              ? `${acc.search_budget_lost_is != null ? (acc.search_budget_lost_is * 100).toFixed(0) : "—"}% / ${acc.search_rank_lost_is != null ? (acc.search_rank_lost_is * 100).toFixed(0) : "—"}%`
              : "—"
          }
          sublabel="Budget / Rank"
        />
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
        <Button size="sm" variant="outline" onClick={() => downloadCSV(active.per_campaign, filename)}>
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export CSV
        </Button>
      </div>

      {/* Per-campaign KPI table */}
      <div className="overflow-x-auto -mx-5">
        <table className="w-full text-sm min-w-[1000px]">
          <thead className="bg-gray-50 border-y border-gray-200">
            <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
              <th className="text-left py-2 px-3">Campaign</th>
              <th className="text-right py-2 px-3">Impr</th>
              <th className="text-right py-2 px-3">Clicks</th>
              <th className="text-right py-2 px-3">CTR</th>
              <th className="text-right py-2 px-3">Avg CPC</th>
              <th className="text-right py-2 px-3">Cost</th>
              <th className="text-right py-2 px-3">Δ vs prior</th>
              <th className="text-right py-2 px-3">Conv</th>
              <th className="text-right py-2 px-3">CPA</th>
              <th className="text-right py-2 px-3">ROAS</th>
              <th className="text-right py-2 px-3">Lost IS<br/>Bud / Rank</th>
            </tr>
          </thead>
          <tbody>
            {active.per_campaign.map((r, i) => (
              <tr key={r.id} className={`${i % 2 === 1 ? "bg-gray-50/50" : ""} border-b border-gray-100`}>
                <td className="py-2 px-3 max-w-[280px]">
                  <div className="font-medium text-gray-900 truncate" title={r.name}>{r.name}</div>
                  <div className="text-[10px] text-gray-500">
                    {r.channel_type} · {r.bidding_strategy_type}
                  </div>
                </td>
                <td className="py-2 px-3 text-right tabular-nums">{fmtInt(r.impressions)}</td>
                <td className="py-2 px-3 text-right tabular-nums">{fmtInt(r.clicks)}</td>
                <td className="py-2 px-3 text-right tabular-nums">{fmtPct(r.ctr)}</td>
                <td className="py-2 px-3 text-right tabular-nums">{fmtCurrency(r.average_cpc)}</td>
                <td className="py-2 px-3 text-right tabular-nums font-medium">{fmtCurrency(r.cost)}</td>
                <td className="py-2 px-3 text-right"><DeltaChip pct={r.delta_cost_pct} /></td>
                <td className="py-2 px-3 text-right tabular-nums">{fmtNum(r.conversions, 1)}</td>
                <td className="py-2 px-3 text-right tabular-nums">
                  {r.conversions > 0 ? fmtCurrency(r.cost_per_conversion) : "—"}
                </td>
                <td className="py-2 px-3 text-right tabular-nums font-medium text-emerald-700">
                  {r.cost > 0 ? fmtNum(r.actual_roas) : "—"}
                </td>
                <td className="py-2 px-3 text-right text-xs tabular-nums text-gray-500">
                  {r.search_budget_lost_is != null ? fmtPct(r.search_budget_lost_is * 100, 0) : "—"}
                  {" / "}
                  {r.search_rank_lost_is != null ? fmtPct(r.search_rank_lost_is * 100, 0) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
