// Panel 9 · Landing Page (stub)
// Lists every distinct final URL, attributes ad-count + cost.
// Link-out buttons only — no embedded heatmap in v1.

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, Info } from "lucide-react";

interface UrlRow {
  url: string;
  host: string;
  ad_count: number;
  campaigns: Array<{ id: string; name: string }>;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  conversions_value: number;
  ctr: number;
  roas: number;
}

interface Snapshot {
  time_frame: string;
  start_date: string;
  end_date: string;
  total_urls: number;
  total_hosts: number;
  urls: UrlRow[];
  note: string;
}

interface MultiPeriodSnapshot { multi_period: true; primary_key: string; periods: Record<string, { snapshot: Snapshot; flags: unknown[] }>; }
type AnySnapshot = Snapshot | MultiPeriodSnapshot | null;
interface Props { snapshot: AnySnapshot; clientName?: string; }

const PERIOD_LABEL: Record<string, string> = { LAST_30_DAYS: "Last 30 days", LAST_60_DAYS: "Last 60 days", LAST_90_DAYS: "Last 90 days" };
const isMulti = (s: AnySnapshot): s is MultiPeriodSnapshot => Boolean(s && (s as MultiPeriodSnapshot).multi_period === true);

const fmtCurrency = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtInt = (n: number) => Math.round(n).toLocaleString();

const downloadCSV = (rows: UrlRow[], filename: string) => {
  const headers = ["url", "host", "ad_count", "impressions", "clicks", "ctr", "cost", "conversions", "conversions_value", "roas", "campaign_names"];
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    headers.join(","),
    ...rows.map((r) => [
      escape(r.url), escape(r.host), r.ad_count, Math.round(r.impressions), Math.round(r.clicks),
      r.ctr.toFixed(2), r.cost.toFixed(2), r.conversions.toFixed(2), r.conversions_value.toFixed(2),
      r.roas.toFixed(2), escape(r.campaigns.map((c) => c.name).join("; ")),
    ].join(",")),
  ].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export function LandingPagePanel({ snapshot, clientName }: Props) {
  const multi = isMulti(snapshot);
  const availableKeys = multi ? Object.keys((snapshot as MultiPeriodSnapshot).periods) : [];
  const [periodKey, setPeriodKey] = useState<string | null>(multi ? (snapshot as MultiPeriodSnapshot).primary_key : null);
  const active: Snapshot | null = useMemo(() => {
    if (!snapshot) return null;
    if (multi) return (snapshot as MultiPeriodSnapshot).periods[periodKey || (snapshot as MultiPeriodSnapshot).primary_key]?.snapshot || null;
    return snapshot as Snapshot;
  }, [snapshot, multi, periodKey]);

  if (!active) return null;
  const filename = `${(clientName || "audit").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}_${active.start_date.slice(0, 10)}_landing-urls.csv`;

  return (
    <div className="p-5 space-y-4">
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

      <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 px-4 py-3 text-xs text-emerald-900 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        <div>{active.note}</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Distinct URLs</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{active.total_urls}</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Distinct domains</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{active.total_hosts}</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Total spend on URLs</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{fmtCurrency(active.urls.reduce((s, u) => s + u.cost, 0))}</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Window: <strong>{active.start_date.slice(0, 10)} → {active.end_date.slice(0, 10)}</strong>
        </div>
        <Button size="sm" variant="outline" onClick={() => downloadCSV(active.urls, filename)}>
          <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
        </Button>
      </div>

      <div className="overflow-x-auto -mx-5">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-gray-50 border-y border-gray-200">
            <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
              <th className="text-left py-2 px-3">URL</th>
              <th className="text-left py-2 px-3">Campaigns</th>
              <th className="text-right py-2 px-3">Ads</th>
              <th className="text-right py-2 px-3">Impr</th>
              <th className="text-right py-2 px-3">Clicks</th>
              <th className="text-right py-2 px-3">Cost</th>
              <th className="text-right py-2 px-3">Conv</th>
              <th className="text-right py-2 px-3">ROAS</th>
              <th className="text-left py-2 px-3">Open</th>
            </tr>
          </thead>
          <tbody>
            {active.urls.map((r, i) => (
              <tr key={`${r.url}-${i}`} className={`${i % 2 === 1 ? "bg-gray-50/50" : ""} border-b border-gray-100`}>
                <td className="py-2 px-3 max-w-[380px]">
                  <div className="font-medium text-gray-900 truncate" title={r.url}>{r.url}</div>
                  <div className="text-[10px] text-gray-500">{r.host}</div>
                </td>
                <td className="py-2 px-3 max-w-[220px]">
                  {r.campaigns.slice(0, 2).map((c) => (
                    <Badge key={c.id} variant="outline" className="text-[10px] bg-gray-50 text-gray-700 border-gray-200 mr-1 mb-0.5" title={c.name}>
                      {c.name.length > 24 ? c.name.slice(0, 22) + "…" : c.name}
                    </Badge>
                  ))}
                  {r.campaigns.length > 2 && <span className="text-[10px] text-gray-500">+{r.campaigns.length - 2}</span>}
                </td>
                <td className="py-2 px-3 text-right tabular-nums text-xs">{r.ad_count}</td>
                <td className="py-2 px-3 text-right tabular-nums text-xs">{fmtInt(r.impressions)}</td>
                <td className="py-2 px-3 text-right tabular-nums text-xs">{fmtInt(r.clicks)}</td>
                <td className="py-2 px-3 text-right tabular-nums font-medium">{fmtCurrency(r.cost)}</td>
                <td className="py-2 px-3 text-right tabular-nums text-xs">{r.conversions.toFixed(1)}</td>
                <td className="py-2 px-3 text-right tabular-nums font-medium text-emerald-700">{r.cost > 0 ? r.roas.toFixed(2) : "—"}</td>
                <td className="py-2 px-3">
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800">
                    <ExternalLink className="w-3 h-3" /> Open
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
