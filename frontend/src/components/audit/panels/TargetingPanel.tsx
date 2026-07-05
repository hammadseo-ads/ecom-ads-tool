// Panel 4 · Targeting body.
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";

interface Keyword { id: string; text: string; match_type: string; quality_score: number | null; status: string; ad_group_name: string; campaign_name: string; impressions: number; clicks: number; cost: number; conversions: number; conversions_value: number; ctr: number; cost_per_conversion: number; roas: number; }
interface DemoSegment { value: string; impressions: number; clicks: number; cost: number; conversions: number; conversions_value: number; roas: number; }
interface DemoRow { dimension: string; campaign_id: string; campaign_name: string; segments: DemoSegment[]; }
interface Location { country_criterion_id: string; location_type: string; campaign_id: string; campaign_name: string; impressions: number; clicks: number; cost: number; conversions: number; conversions_value: number; roas: number; }
interface Negative { id: string; text: string; match_type: string; campaign_name: string; }
interface Snapshot { time_frame: string; start_date: string; end_date: string; keywords: Keyword[]; demographics: { age: DemoRow[]; gender: DemoRow[] }; locations: Location[]; negatives: Negative[]; summary: { total_keywords: number; broad_match_count: number; phrase_match_count: number; exact_match_count: number; total_negatives: number; total_locations_active: number; }; }
interface MultiPeriodSnapshot { multi_period: true; primary_key: string; periods: Record<string, { snapshot: Snapshot; flags: unknown[] }>; }
type AnySnapshot = Snapshot | MultiPeriodSnapshot | null;
interface Props { snapshot: AnySnapshot; clientName?: string; }
const PERIOD_LABEL: Record<string, string> = { LAST_30_DAYS: "Last 30 days", LAST_60_DAYS: "Last 60 days", LAST_90_DAYS: "Last 90 days" };
const isMulti = (s: AnySnapshot): s is MultiPeriodSnapshot => Boolean(s && (s as MultiPeriodSnapshot).multi_period === true);
const fmtInt = (n: number) => Math.round(n).toLocaleString();
const fmtCurrency = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const AGE_LABEL: Record<string, string> = { AGE_RANGE_18_24: "18–24", AGE_RANGE_25_34: "25–34", AGE_RANGE_35_44: "35–44", AGE_RANGE_45_54: "45–54", AGE_RANGE_55_64: "55–64", AGE_RANGE_65_UP: "65+", AGE_RANGE_UNDETERMINED: "Undetermined" };
const GENDER_LABEL: Record<string, string> = { MALE: "Male", FEMALE: "Female", UNDETERMINED: "Undetermined" };

const downloadCSV = <T,>(rows: T[], headers: string[], filename: string) => {
  const escape = (v: unknown) => { if (v == null) return ""; const s = String(v); return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s; };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape((r as unknown as Record<string, unknown>)[h])).join(","))].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
};

export function TargetingPanel({ snapshot, clientName }: Props) {
  const multi = isMulti(snapshot);
  const availableKeys = multi ? Object.keys((snapshot as MultiPeriodSnapshot).periods) : [];
  const [periodKey, setPeriodKey] = useState<string | null>(multi ? (snapshot as MultiPeriodSnapshot).primary_key : null);
  const [tab, setTab] = useState<"keywords" | "demographics" | "locations" | "negatives">("keywords");
  const [search, setSearch] = useState("");
  const active: Snapshot | null = useMemo(() => {
    if (!snapshot) return null;
    if (multi) return (snapshot as MultiPeriodSnapshot).periods[periodKey || (snapshot as MultiPeriodSnapshot).primary_key]?.snapshot || null;
    return snapshot as Snapshot;
  }, [snapshot, multi, periodKey]);
  if (!active) return null;
  const slug = (clientName || "audit").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const date = active.start_date.slice(0, 10);

  const filteredKw = search ? active.keywords.filter((k) => `${k.text} ${k.campaign_name}`.toLowerCase().includes(search.toLowerCase())) : active.keywords;
  const filteredNeg = search ? active.negatives.filter((n) => `${n.text} ${n.campaign_name}`.toLowerCase().includes(search.toLowerCase())) : active.negatives;

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
        <div className="border border-gray-200 rounded-lg p-3"><div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Keywords</div><div className="text-2xl font-bold text-gray-900 mt-1">{active.summary.total_keywords.toLocaleString()}</div><div className="text-[11px] text-gray-500">B {active.summary.broad_match_count} · P {active.summary.phrase_match_count} · E {active.summary.exact_match_count}</div></div>
        <div className="border border-gray-200 rounded-lg p-3"><div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Negatives</div><div className="text-2xl font-bold text-gray-900 mt-1">{active.summary.total_negatives.toLocaleString()}</div></div>
        <div className="border border-gray-200 rounded-lg p-3"><div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Locations active</div><div className="text-2xl font-bold text-gray-900 mt-1">{active.summary.total_locations_active.toLocaleString()}</div></div>
        <div className="border border-gray-200 rounded-lg p-3"><div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Age × campaigns</div><div className="text-2xl font-bold text-gray-900 mt-1">{active.demographics.age.length}</div></div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="inline-flex rounded-md border border-gray-200 p-0.5">
          {(["keywords", "demographics", "locations", "negatives"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={`text-xs font-semibold px-3 py-1.5 rounded capitalize ${tab === t ? "bg-emerald-600 text-white" : "text-gray-700 hover:bg-gray-50"}`}>{t}</button>
          ))}
        </div>
        {(tab === "keywords" || tab === "negatives") && (
          <Input placeholder="Filter…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-56 h-8 text-xs" />
        )}
        <Button size="sm" variant="outline" onClick={() => {
          if (tab === "keywords") downloadCSV(filteredKw, ["id", "text", "match_type", "quality_score", "status", "campaign_name", "ad_group_name", "impressions", "clicks", "ctr", "cost", "conversions", "roas"], `${slug}_${date}_keywords.csv`);
          else if (tab === "negatives") downloadCSV(filteredNeg, ["id", "text", "match_type", "campaign_name"], `${slug}_${date}_negatives.csv`);
          else if (tab === "locations") downloadCSV(active.locations, ["country_criterion_id", "location_type", "campaign_name", "impressions", "clicks", "cost", "conversions", "conversions_value", "roas"], `${slug}_${date}_locations.csv`);
        }}><Download className="w-3.5 h-3.5 mr-1.5" /> CSV</Button>
      </div>

      {tab === "keywords" && (
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-gray-50 border-y border-gray-200"><tr className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
              <th className="text-left py-2 px-3">Keyword</th>
              <th className="text-left py-2 px-3">Match</th>
              <th className="text-left py-2 px-3">Campaign / Ad group</th>
              <th className="text-right py-2 px-3">QS</th>
              <th className="text-right py-2 px-3">Impr</th>
              <th className="text-right py-2 px-3">Cost</th>
              <th className="text-right py-2 px-3">Conv</th>
              <th className="text-right py-2 px-3">ROAS</th>
            </tr></thead>
            <tbody>
              {filteredKw.slice(0, 300).map((k, i) => (
                <tr key={k.id} className={`${i % 2 === 1 ? "bg-gray-50/50" : ""} border-b border-gray-100`}>
                  <td className="py-2 px-3 max-w-[280px]"><div className="text-gray-900 truncate" title={k.text}>{k.text}</div></td>
                  <td className="py-2 px-3 text-xs"><Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">{k.match_type}</Badge></td>
                  <td className="py-2 px-3 max-w-[220px] text-xs"><div className="text-gray-800 truncate" title={k.campaign_name}>{k.campaign_name}</div><div className="text-[10px] text-gray-500 truncate" title={k.ad_group_name}>{k.ad_group_name}</div></td>
                  <td className={`py-2 px-3 text-right tabular-nums text-xs ${k.quality_score && k.quality_score <= 4 ? "text-amber-800 font-semibold" : ""}`}>{k.quality_score ?? "—"}</td>
                  <td className="py-2 px-3 text-right tabular-nums text-xs">{fmtInt(k.impressions)}</td>
                  <td className="py-2 px-3 text-right tabular-nums font-medium">{fmtCurrency(k.cost)}</td>
                  <td className={`py-2 px-3 text-right tabular-nums text-xs ${k.match_type === "BROAD" && k.conversions === 0 && k.cost >= 50 ? "text-amber-800 font-semibold" : ""}`}>{k.conversions.toFixed(1)}</td>
                  <td className="py-2 px-3 text-right tabular-nums font-medium text-emerald-700">{k.cost > 0 ? k.roas.toFixed(2) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredKw.length > 300 && (<div className="text-xs text-gray-500 text-center py-2">Showing 300 of {filteredKw.length}. Full data in CSV.</div>)}
        </div>
      )}

      {tab === "demographics" && (
        <div className="space-y-4">
          {[
            { label: "Age", rows: active.demographics.age, valueMap: AGE_LABEL },
            { label: "Gender", rows: active.demographics.gender, valueMap: GENDER_LABEL },
          ].map((section) => (
            <div key={section.label}>
              <h4 className="text-sm font-bold text-gray-900 mb-2">{section.label}</h4>
              {section.rows.length === 0 ? (
                <div className="text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg p-4 text-center">No data for {section.label.toLowerCase()} in window.</div>
              ) : (
                <div className="space-y-2">
                  {section.rows.slice(0, 10).map((r) => (
                    <div key={`${r.dimension}-${r.campaign_id}`} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="px-3 py-1.5 bg-gray-50 text-xs font-medium text-gray-800 truncate">{r.campaign_name}</div>
                      <div className="divide-y divide-gray-100">
                        {r.segments.sort((a, b) => b.cost - a.cost).map((s) => (
                          <div key={s.value} className="px-3 py-1.5 grid grid-cols-12 gap-2 text-xs items-center">
                            <div className="col-span-3">{section.valueMap[s.value] || s.value}</div>
                            <div className="col-span-3 tabular-nums text-gray-600">Impr {fmtInt(s.impressions)}</div>
                            <div className="col-span-3 tabular-nums font-medium">{fmtCurrency(s.cost)}</div>
                            <div className="col-span-3 tabular-nums text-emerald-700 text-right">{s.cost > 0 ? `ROAS ${s.roas.toFixed(2)}` : "—"}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "locations" && (
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-gray-50 border-y border-gray-200"><tr className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
              <th className="text-left py-2 px-3">Location (ID)</th>
              <th className="text-left py-2 px-3">Campaign</th>
              <th className="text-right py-2 px-3">Impr</th>
              <th className="text-right py-2 px-3">Clicks</th>
              <th className="text-right py-2 px-3">Cost</th>
              <th className="text-right py-2 px-3">Conv</th>
              <th className="text-right py-2 px-3">ROAS</th>
            </tr></thead>
            <tbody>
              {active.locations.slice(0, 200).map((l, i) => (
                <tr key={`${l.country_criterion_id}-${l.campaign_id}-${i}`} className={`${i % 2 === 1 ? "bg-gray-50/50" : ""} border-b border-gray-100`}>
                  <td className="py-2 px-3 text-xs">{l.country_criterion_id} <span className="text-[10px] text-gray-500">({l.location_type})</span></td>
                  <td className="py-2 px-3 max-w-[280px] text-xs truncate" title={l.campaign_name}>{l.campaign_name}</td>
                  <td className="py-2 px-3 text-right tabular-nums text-xs">{fmtInt(l.impressions)}</td>
                  <td className="py-2 px-3 text-right tabular-nums text-xs">{fmtInt(l.clicks)}</td>
                  <td className="py-2 px-3 text-right tabular-nums font-medium">{fmtCurrency(l.cost)}</td>
                  <td className="py-2 px-3 text-right tabular-nums text-xs">{l.conversions.toFixed(1)}</td>
                  <td className="py-2 px-3 text-right tabular-nums font-medium text-emerald-700">{l.cost > 0 ? l.roas.toFixed(2) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {active.locations.length > 200 && (<div className="text-xs text-gray-500 text-center py-2">Showing 200 of {active.locations.length}.</div>)}
        </div>
      )}

      {tab === "negatives" && (
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-gray-50 border-y border-gray-200"><tr className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
              <th className="text-left py-2 px-3">Negative keyword</th>
              <th className="text-left py-2 px-3">Match</th>
              <th className="text-left py-2 px-3">Campaign</th>
            </tr></thead>
            <tbody>
              {filteredNeg.slice(0, 500).map((n, i) => (
                <tr key={`${n.id}-${i}`} className={`${i % 2 === 1 ? "bg-gray-50/50" : ""} border-b border-gray-100`}>
                  <td className="py-2 px-3 text-gray-900">{n.text}</td>
                  <td className="py-2 px-3 text-xs"><Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">{n.match_type}</Badge></td>
                  <td className="py-2 px-3 max-w-[280px] text-xs truncate" title={n.campaign_name}>{n.campaign_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredNeg.length > 500 && (<div className="text-xs text-gray-500 text-center py-2">Showing 500 of {filteredNeg.length}.</div>)}
        </div>
      )}
    </div>
  );
}
