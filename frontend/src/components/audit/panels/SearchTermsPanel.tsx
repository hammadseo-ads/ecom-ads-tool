// Panel 6 · Search Terms & Competition body.
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Download, Info, ExternalLink } from "lucide-react";

interface SearchTerm { search_term: string; status: string; campaign_id: string; campaign_name: string; channel_type: string; ad_group_id: string; ad_group_name: string; impressions: number; clicks: number; cost: number; conversions: number; conversions_value: number; ctr: number; cost_per_conversion: number; roas: number; }
interface PMaxInsight { campaign_id: string; campaign_name: string; category_label: string; insight_id: string; impressions: number; clicks: number; conversions: number; conversions_value: number; ctr: number; conv_rate: number; }
interface Snapshot { time_frame: string; start_date: string; end_date: string; search_terms: SearchTerm[]; pmax_insights: PMaxInsight[]; pmax_cost_note: string; auction_insights_note: string; summary: { total_search_terms: number; wasted_search_terms: number; candidate_keywords: number; total_pmax_categories: number; total_search_term_cost: number; total_search_term_conversions: number; }; }
interface MultiPeriodSnapshot { multi_period: true; primary_key: string; periods: Record<string, { snapshot: Snapshot; flags: unknown[] }>; }
type AnySnapshot = Snapshot | MultiPeriodSnapshot | null;
interface Props { snapshot: AnySnapshot; clientName?: string; }
const PERIOD_LABEL: Record<string, string> = { LAST_30_DAYS: "Last 30 days", LAST_60_DAYS: "Last 60 days", LAST_90_DAYS: "Last 90 days" };
const isMulti = (s: AnySnapshot): s is MultiPeriodSnapshot => Boolean(s && (s as MultiPeriodSnapshot).multi_period === true);
const fmtInt = (n: number) => Math.round(n).toLocaleString();
const fmtCurrency = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const downloadCSV = <T,>(rows: T[], headers: string[], filename: string) => {
  const escape = (v: unknown) => { if (v == null) return ""; const s = String(v); return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s; };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape((r as unknown as Record<string, unknown>)[h])).join(","))].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
};

export function SearchTermsPanel({ snapshot, clientName }: Props) {
  const multi = isMulti(snapshot);
  const availableKeys = multi ? Object.keys((snapshot as MultiPeriodSnapshot).periods) : [];
  const [periodKey, setPeriodKey] = useState<string | null>(multi ? (snapshot as MultiPeriodSnapshot).primary_key : null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"search" | "pmax">("search");
  const active: Snapshot | null = useMemo(() => {
    if (!snapshot) return null;
    if (multi) return (snapshot as MultiPeriodSnapshot).periods[periodKey || (snapshot as MultiPeriodSnapshot).primary_key]?.snapshot || null;
    return snapshot as Snapshot;
  }, [snapshot, multi, periodKey]);
  if (!active) return null;
  const slug = (clientName || "audit").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const datePart = active.start_date.slice(0, 10);
  const filteredSearchTerms = search ? active.search_terms.filter((t) => `${t.search_term} ${t.campaign_name}`.toLowerCase().includes(search.toLowerCase())) : active.search_terms;
  const filteredPMax = search ? active.pmax_insights.filter((i) => `${i.category_label} ${i.campaign_name}`.toLowerCase().includes(search.toLowerCase())) : active.pmax_insights;

  return (
    <div className="p-5 space-y-4">
      {multi && availableKeys.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mr-1">Period:</span>
          {availableKeys.map((k) => (
            <button key={k} type="button" onClick={() => setPeriodKey(k)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${periodKey === k ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-700 border-gray-200 hover:border-emerald-300 hover:text-emerald-800"}`}>{PERIOD_LABEL[k] || k}</button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="border border-gray-200 rounded-lg p-3"><div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Search terms</div><div className="text-2xl font-bold text-gray-900 mt-1">{active.summary.total_search_terms.toLocaleString()}</div><div className="text-[11px] text-gray-500">Search / Shopping campaigns</div></div>
        <div className="border border-gray-200 rounded-lg p-3"><div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Wasted (&gt;$50, 0 conv)</div><div className={`text-2xl font-bold mt-1 ${active.summary.wasted_search_terms > 0 ? "text-slate-800" : "text-emerald-700"}`}>{active.summary.wasted_search_terms}</div></div>
        <div className="border border-gray-200 rounded-lg p-3"><div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Candidate keywords</div><div className="text-2xl font-bold text-emerald-700 mt-1">{active.summary.candidate_keywords}</div><div className="text-[11px] text-gray-500">converted, not in keywords</div></div>
        <div className="border border-gray-200 rounded-lg p-3"><div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">PMax categories</div><div className="text-2xl font-bold text-gray-900 mt-1">{active.summary.total_pmax_categories}</div></div>
      </div>

      <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 px-4 py-3 text-xs text-emerald-900 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        <div>
          <div>{active.pmax_cost_note}</div>
          <div className="mt-1">{active.auction_insights_note}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="inline-flex rounded-md border border-gray-200 p-0.5">
          <button type="button" onClick={() => setTab("search")} className={`text-xs font-semibold px-3 py-1.5 rounded ${tab === "search" ? "bg-emerald-600 text-white" : "text-gray-700 hover:bg-gray-50"}`}>Search / Shopping ({active.search_terms.length})</button>
          <button type="button" onClick={() => setTab("pmax")} className={`text-xs font-semibold px-3 py-1.5 rounded ${tab === "pmax" ? "bg-emerald-600 text-white" : "text-gray-700 hover:bg-gray-50"}`}>PMax insights ({active.pmax_insights.length})</button>
        </div>
        <Input placeholder="Filter…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-56 h-8 text-xs" />
        <Button size="sm" variant="outline" onClick={() => tab === "search"
          ? downloadCSV(filteredSearchTerms, ["search_term", "status", "campaign_name", "ad_group_name", "impressions", "clicks", "ctr", "cost", "conversions", "conversions_value", "cost_per_conversion", "roas"], `${slug}_${datePart}_search-terms.csv`)
          : downloadCSV(filteredPMax, ["campaign_name", "category_label", "impressions", "clicks", "ctr", "conversions", "conversions_value", "conv_rate"], `${slug}_${datePart}_pmax-insights.csv`)}>
          <Download className="w-3.5 h-3.5 mr-1.5" /> CSV
        </Button>
        <a href="https://ads.google.com" target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800">
          Google Ads UI (Auction Insights) <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {tab === "search" ? (
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-gray-50 border-y border-gray-200"><tr className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
              <th className="text-left py-2 px-3">Search term</th>
              <th className="text-left py-2 px-3">Campaign</th>
              <th className="text-right py-2 px-3">Impr</th>
              <th className="text-right py-2 px-3">Clicks</th>
              <th className="text-right py-2 px-3">Cost</th>
              <th className="text-right py-2 px-3">Conv</th>
              <th className="text-right py-2 px-3">ROAS</th>
            </tr></thead>
            <tbody>
              {filteredSearchTerms.slice(0, 200).map((t, i) => (
                <tr key={`${t.search_term}-${i}`} className={`${i % 2 === 1 ? "bg-gray-50/50" : ""} border-b border-gray-100`}>
                  <td className="py-2 px-3 max-w-[300px]"><div className="text-gray-900 truncate" title={t.search_term}>{t.search_term}</div><div className="text-[10px] text-gray-500">{t.ad_group_name}</div></td>
                  <td className="py-2 px-3 max-w-[220px] text-xs"><div className="truncate" title={t.campaign_name}>{t.campaign_name}</div><div className="text-[10px] text-gray-500">{t.channel_type}</div></td>
                  <td className="py-2 px-3 text-right tabular-nums text-xs">{fmtInt(t.impressions)}</td>
                  <td className="py-2 px-3 text-right tabular-nums text-xs">{fmtInt(t.clicks)}</td>
                  <td className="py-2 px-3 text-right tabular-nums font-medium">{fmtCurrency(t.cost)}</td>
                  <td className={`py-2 px-3 text-right tabular-nums text-xs ${t.conversions === 0 && t.cost >= 50 ? "text-slate-800 font-semibold" : ""}`}>{t.conversions.toFixed(1)}</td>
                  <td className="py-2 px-3 text-right tabular-nums font-medium text-emerald-700">{t.cost > 0 ? t.roas.toFixed(2) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSearchTerms.length > 200 && (<div className="text-xs text-gray-500 text-center py-2">Showing 200 of {filteredSearchTerms.length}. Full data in CSV.</div>)}
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-gray-50 border-y border-gray-200"><tr className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
              <th className="text-left py-2 px-3">Category label</th>
              <th className="text-left py-2 px-3">Campaign</th>
              <th className="text-right py-2 px-3">Impr</th>
              <th className="text-right py-2 px-3">Clicks</th>
              <th className="text-right py-2 px-3">CTR</th>
              <th className="text-right py-2 px-3">Conv</th>
              <th className="text-right py-2 px-3">Conv value</th>
              <th className="text-center py-2 px-3">Cost</th>
            </tr></thead>
            <tbody>
              {filteredPMax.slice(0, 200).map((r, i) => (
                <tr key={`${r.insight_id}-${i}`} className={`${i % 2 === 1 ? "bg-gray-50/50" : ""} border-b border-gray-100`}>
                  <td className="py-2 px-3 max-w-[320px]"><div className="text-gray-900 truncate font-medium" title={r.category_label}>{r.category_label || "—"}</div></td>
                  <td className="py-2 px-3 max-w-[220px] text-xs truncate" title={r.campaign_name}>{r.campaign_name}</td>
                  <td className="py-2 px-3 text-right tabular-nums text-xs">{fmtInt(r.impressions)}</td>
                  <td className="py-2 px-3 text-right tabular-nums text-xs">{fmtInt(r.clicks)}</td>
                  <td className="py-2 px-3 text-right tabular-nums text-xs">{r.ctr.toFixed(2)}%</td>
                  <td className="py-2 px-3 text-right tabular-nums text-xs">{r.conversions.toFixed(1)}</td>
                  <td className="py-2 px-3 text-right tabular-nums text-xs">{r.conversions_value > 0 ? fmtCurrency(r.conversions_value) : "—"}</td>
                  <td className="py-2 px-3 text-center text-[10px] text-gray-400">
                    <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">n/a</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPMax.length > 200 && (<div className="text-xs text-gray-500 text-center py-2">Showing 200 of {filteredPMax.length}. Full data in CSV.</div>)}
        </div>
      )}
    </div>
  );
}
