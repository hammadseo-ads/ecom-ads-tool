// Panel 3 · Structure body.
// Three sub-sections: Ad groups, PMax asset groups, Conversion goals config.

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, AlertTriangle, CheckCircle2 } from "lucide-react";

interface AdGroup {
  id: string;
  name: string;
  status: string;
  type: string;
  cpc_bid: number;
  campaign_id: string;
  campaign_name: string;
  channel_type: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  conversions_value: number;
  ctr: number;
  roas: number;
  cost_per_conversion: number;
}
interface AssetGroup {
  id: string;
  name: string;
  status: string;
  ad_strength: string;
  campaign_id: string;
  campaign_name: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  conversions_value: number;
  ctr: number;
  roas: number;
}
interface Goal {
  campaign_id: string;
  campaign_name: string;
  status: string;
  goals: Array<{ resource_name: string; primary_for_goal?: boolean; category?: string; name?: string }>;
  primary_count: number;
  uses_selective_optimization: boolean;
}
interface Snapshot {
  time_frame: string;
  start_date: string;
  end_date: string;
  ad_groups: AdGroup[];
  asset_groups: AssetGroup[];
  goals: Goal[];
  summary: {
    total_ad_groups: number;
    total_asset_groups: number;
    total_campaigns_with_goals: number;
    campaigns_no_primary: number;
    campaigns_multi_primary: number;
  };
}

interface MultiPeriodSnapshot { multi_period: true; primary_key: string; periods: Record<string, { snapshot: Snapshot; flags: unknown[] }>; }
type AnySnapshot = Snapshot | MultiPeriodSnapshot | null;
interface Props { snapshot: AnySnapshot; clientName?: string; }

const PERIOD_LABEL: Record<string, string> = { LAST_30_DAYS: "Last 30 days", LAST_60_DAYS: "Last 60 days", LAST_90_DAYS: "Last 90 days" };
const isMulti = (s: AnySnapshot): s is MultiPeriodSnapshot => Boolean(s && (s as MultiPeriodSnapshot).multi_period === true);

const fmtCurrency = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtInt = (n: number) => Math.round(n).toLocaleString();
const fmtNum = (n: number, d = 2) => n.toFixed(d);

const STRENGTH_META: Record<string, { label: string; className: string }> = {
  EXCELLENT: { label: "Excellent", className: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  GOOD: { label: "Good", className: "bg-blue-50 text-blue-800 border-blue-200" },
  AVERAGE: { label: "Average", className: "bg-gray-100 text-gray-700 border-gray-200" },
  POOR: { label: "Poor", className: "bg-red-50 text-red-800 border-red-200" },
  NO_ADS: { label: "No ads", className: "bg-red-50 text-red-800 border-red-200" },
  UNSPECIFIED: { label: "—", className: "bg-gray-50 text-gray-500 border-gray-200" },
};

const downloadCSV = <T,>(rows: T[], headers: string[], filename: string) => {
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape((r as unknown as Record<string, unknown>)[h])).join(","))].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export function StructurePanel({ snapshot, clientName }: Props) {
  const multi = isMulti(snapshot);
  const availableKeys = multi ? Object.keys((snapshot as MultiPeriodSnapshot).periods) : [];
  const [periodKey, setPeriodKey] = useState<string | null>(multi ? (snapshot as MultiPeriodSnapshot).primary_key : null);
  const active: Snapshot | null = useMemo(() => {
    if (!snapshot) return null;
    if (multi) return (snapshot as MultiPeriodSnapshot).periods[periodKey || (snapshot as MultiPeriodSnapshot).primary_key]?.snapshot || null;
    return snapshot as Snapshot;
  }, [snapshot, multi, periodKey]);

  if (!active) return null;
  const slug = (clientName || "audit").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const datePart = active.start_date.slice(0, 10);

  return (
    <div className="p-5 space-y-6">
      {multi && availableKeys.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mr-1">Period:</span>
          {availableKeys.map((k) => (
            <button key={k} type="button" onClick={() => setPeriodKey(k)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${periodKey === k ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-700 border-gray-200 hover:border-emerald-300 hover:text-emerald-800"}`}>
              {PERIOD_LABEL[k] || k}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Ad groups</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{active.summary.total_ad_groups}</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Asset groups</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{active.summary.total_asset_groups}</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">No primary goal</div>
          <div className={`text-2xl font-bold mt-1 ${active.summary.campaigns_no_primary > 0 ? "text-red-700" : "text-emerald-700"}`}>{active.summary.campaigns_no_primary}</div>
          <div className="text-[11px] text-gray-500">campaigns</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Multi-primary goal</div>
          <div className={`text-2xl font-bold mt-1 ${active.summary.campaigns_multi_primary > 0 ? "text-amber-800" : "text-emerald-700"}`}>{active.summary.campaigns_multi_primary}</div>
          <div className="text-[11px] text-gray-500">campaigns</div>
        </div>
      </div>

      {/* 3a. Ad Groups */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold text-gray-900">Ad groups</h4>
          <Button size="sm" variant="outline" onClick={() => downloadCSV(active.ad_groups, ["id", "name", "status", "type", "campaign_name", "channel_type", "cpc_bid", "impressions", "clicks", "ctr", "cost", "conversions", "conversions_value", "roas"], `${slug}_${datePart}_ad-groups.csv`)}>
            <Download className="w-3.5 h-3.5 mr-1.5" /> CSV
          </Button>
        </div>
        {active.ad_groups.length === 0 ? (
          <div className="text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg p-4 text-center">No ad groups in window.</div>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                  <th className="text-left py-2 px-3">Ad group</th>
                  <th className="text-left py-2 px-3">Campaign</th>
                  <th className="text-left py-2 px-3">Status</th>
                  <th className="text-right py-2 px-3">Impr</th>
                  <th className="text-right py-2 px-3">CTR</th>
                  <th className="text-right py-2 px-3">Cost</th>
                  <th className="text-right py-2 px-3">Conv</th>
                  <th className="text-right py-2 px-3">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {active.ad_groups.slice(0, 100).map((ag, i) => (
                  <tr key={ag.id} className={`${i % 2 === 1 ? "bg-gray-50/50" : ""} border-b border-gray-100`}>
                    <td className="py-2 px-3 max-w-[260px]">
                      <div className="font-medium text-gray-900 truncate" title={ag.name}>{ag.name}</div>
                      <div className="text-[10px] text-gray-500">{ag.type} · bid ${ag.cpc_bid.toFixed(2)}</div>
                    </td>
                    <td className="py-2 px-3 max-w-[220px] text-xs">
                      <div className="text-gray-800 truncate" title={ag.campaign_name}>{ag.campaign_name}</div>
                      <div className="text-[10px] text-gray-500">{ag.channel_type}</div>
                    </td>
                    <td className="py-2 px-3 text-xs">
                      {ag.status === "ENABLED"
                        ? <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200">Enabled</Badge>
                        : <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">{ag.status}</Badge>}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-xs">{fmtInt(ag.impressions)}</td>
                    <td className="py-2 px-3 text-right tabular-nums text-xs">{ag.ctr.toFixed(2)}%</td>
                    <td className="py-2 px-3 text-right tabular-nums font-medium">{fmtCurrency(ag.cost)}</td>
                    <td className="py-2 px-3 text-right tabular-nums text-xs">{ag.conversions.toFixed(1)}</td>
                    <td className="py-2 px-3 text-right tabular-nums font-medium text-emerald-700">{ag.cost > 0 ? fmtNum(ag.roas) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {active.ad_groups.length > 100 && (
              <div className="text-xs text-gray-500 text-center py-2">Showing top 100 by cost. Full data in CSV.</div>
            )}
          </div>
        )}
      </div>

      {/* 3b. Asset Groups (PMax) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold text-gray-900">Asset groups (PMax)</h4>
          {active.asset_groups.length > 0 && (
            <Button size="sm" variant="outline" onClick={() => downloadCSV(active.asset_groups, ["id", "name", "status", "ad_strength", "campaign_name", "impressions", "clicks", "ctr", "cost", "conversions", "conversions_value", "roas"], `${slug}_${datePart}_asset-groups.csv`)}>
              <Download className="w-3.5 h-3.5 mr-1.5" /> CSV
            </Button>
          )}
        </div>
        {active.asset_groups.length === 0 ? (
          <div className="text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg p-4 text-center">No PMax asset groups in window.</div>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                  <th className="text-left py-2 px-3">Asset group</th>
                  <th className="text-left py-2 px-3">Campaign</th>
                  <th className="text-left py-2 px-3">Strength</th>
                  <th className="text-right py-2 px-3">Impr</th>
                  <th className="text-right py-2 px-3">Cost</th>
                  <th className="text-right py-2 px-3">Conv</th>
                  <th className="text-right py-2 px-3">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {active.asset_groups.map((ag, i) => {
                  const strength = STRENGTH_META[ag.ad_strength] || STRENGTH_META.UNSPECIFIED;
                  return (
                    <tr key={ag.id} className={`${i % 2 === 1 ? "bg-gray-50/50" : ""} border-b border-gray-100`}>
                      <td className="py-2 px-3 max-w-[240px]">
                        <div className="font-medium text-gray-900 truncate" title={ag.name}>{ag.name}</div>
                      </td>
                      <td className="py-2 px-3 max-w-[240px] text-xs">
                        <div className="text-gray-800 truncate" title={ag.campaign_name}>{ag.campaign_name}</div>
                      </td>
                      <td className="py-2 px-3 text-xs">
                        <Badge variant="outline" className={strength.className}>{strength.label}</Badge>
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums text-xs">{fmtInt(ag.impressions)}</td>
                      <td className="py-2 px-3 text-right tabular-nums font-medium">{fmtCurrency(ag.cost)}</td>
                      <td className="py-2 px-3 text-right tabular-nums text-xs">{ag.conversions.toFixed(1)}</td>
                      <td className="py-2 px-3 text-right tabular-nums font-medium text-emerald-700">{ag.cost > 0 ? fmtNum(ag.roas) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3c. Conversion goals config */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold text-gray-900">Conversion goals per campaign</h4>
        </div>
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50 border-y border-gray-200">
              <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                <th className="text-left py-2 px-3">Campaign</th>
                <th className="text-left py-2 px-3">Status</th>
                <th className="text-center py-2 px-3">Primaries</th>
                <th className="text-left py-2 px-3">Uses selective_optimization?</th>
              </tr>
            </thead>
            <tbody>
              {active.goals.map((g, i) => (
                <tr key={g.campaign_id} className={`${i % 2 === 1 ? "bg-gray-50/50" : ""} border-b border-gray-100`}>
                  <td className="py-2 px-3">
                    <div className="font-medium text-gray-900 truncate max-w-[380px]" title={g.campaign_name}>{g.campaign_name}</div>
                  </td>
                  <td className="py-2 px-3 text-xs">
                    {g.status === "ENABLED"
                      ? <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200">Enabled</Badge>
                      : <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">{g.status}</Badge>}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {g.primary_count === 0 ? (
                      <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200 gap-1"><AlertTriangle className="w-3 h-3" />0</Badge>
                    ) : g.primary_count === 1 ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 gap-1"><CheckCircle2 className="w-3 h-3" />1</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-200 gap-1"><AlertTriangle className="w-3 h-3" />{g.primary_count}</Badge>
                    )}
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-600">
                    {g.uses_selective_optimization ? "Yes (campaign override)" : "No (inherits account-level)"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
