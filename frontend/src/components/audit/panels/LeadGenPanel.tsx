// Panel 10 · Lead Generation body.
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Info } from "lucide-react";

interface Form {
  id: string;
  name: string;
  business_name: string;
  call_to_action: string;
  headline: string;
  field_count: number;
  campaigns: Array<{ id: string; name: string }>;
  impressions: number;
  clicks: number;
  submissions: number;
  submission_value: number;
  cost: number;
  submission_rate: number;
  cost_per_submission: number;
}
interface Snapshot {
  time_frame: string; start_date: string; end_date: string;
  not_applicable?: boolean;
  note?: string;
  forms?: Form[];
  summary?: { total_forms: number; total_impressions: number; total_clicks: number; total_submissions: number; total_cost: number };
}
interface MultiPeriodSnapshot { multi_period: true; primary_key: string; periods: Record<string, { snapshot: Snapshot; flags: unknown[] }>; }
type AnySnapshot = Snapshot | MultiPeriodSnapshot | null;
interface Props { snapshot: AnySnapshot; clientName?: string; }
const PERIOD_LABEL: Record<string, string> = { LAST_30_DAYS: "Last 30 days", LAST_60_DAYS: "Last 60 days", LAST_90_DAYS: "Last 90 days" };
const isMulti = (s: AnySnapshot): s is MultiPeriodSnapshot => Boolean(s && (s as MultiPeriodSnapshot).multi_period === true);
const fmtInt = (n: number) => Math.round(n).toLocaleString();
const fmtCurrency = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function LeadGenPanel({ snapshot, clientName }: Props) {
  const multi = isMulti(snapshot);
  const availableKeys = multi ? Object.keys((snapshot as MultiPeriodSnapshot).periods) : [];
  const [periodKey, setPeriodKey] = useState<string | null>(multi ? (snapshot as MultiPeriodSnapshot).primary_key : null);
  const active: Snapshot | null = useMemo(() => {
    if (!snapshot) return null;
    if (multi) return (snapshot as MultiPeriodSnapshot).periods[periodKey || (snapshot as MultiPeriodSnapshot).primary_key]?.snapshot || null;
    return snapshot as Snapshot;
  }, [snapshot, multi, periodKey]);
  if (!active) return null;

  if (active.not_applicable) {
    return (
      <div className="p-8 text-center">
        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 mb-3">Not applicable</Badge>
        <p className="text-sm text-gray-600 max-w-md mx-auto">{active.note}</p>
      </div>
    );
  }

  const forms = active.forms || [];
  const sum = active.summary || { total_forms: 0, total_impressions: 0, total_clicks: 0, total_submissions: 0, total_cost: 0 };
  const filename = `${(clientName || "audit").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}_${active.start_date.slice(0, 10)}_lead-forms.csv`;
  const downloadCSV = () => {
    const headers = ["id", "name", "business_name", "call_to_action", "field_count", "impressions", "clicks", "submissions", "submission_rate", "cost", "cost_per_submission", "campaigns"];
    const escape = (v: unknown) => { if (v == null) return ""; const s = String(v); return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s; };
    const csv = [headers.join(","), ...forms.map((f) => [f.id, escape(f.name), escape(f.business_name), f.call_to_action, f.field_count, Math.round(f.impressions), Math.round(f.clicks), f.submissions.toFixed(1), f.submission_rate.toFixed(2), f.cost.toFixed(2), f.cost_per_submission.toFixed(2), escape(f.campaigns.map((c) => c.name).join("; "))].join(","))].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="border border-gray-200 rounded-lg p-3"><div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Forms</div><div className="text-2xl font-bold text-gray-900 mt-1">{sum.total_forms}</div></div>
        <div className="border border-gray-200 rounded-lg p-3"><div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Total clicks</div><div className="text-2xl font-bold text-gray-900 mt-1">{fmtInt(sum.total_clicks)}</div></div>
        <div className="border border-gray-200 rounded-lg p-3"><div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Submissions</div><div className="text-2xl font-bold text-emerald-700 mt-1">{fmtInt(sum.total_submissions)}</div><div className="text-[11px] text-gray-500">{sum.total_clicks > 0 ? `${((sum.total_submissions / sum.total_clicks) * 100).toFixed(1)}% of clicks` : "—"}</div></div>
        <div className="border border-gray-200 rounded-lg p-3"><div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Total spend</div><div className="text-2xl font-bold text-gray-900 mt-1">{fmtCurrency(sum.total_cost)}</div></div>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">Window: <strong>{active.start_date.slice(0, 10)} → {active.end_date.slice(0, 10)}</strong></div>
        <Button size="sm" variant="outline" onClick={downloadCSV}><Download className="w-3.5 h-3.5 mr-1.5" /> CSV</Button>
      </div>
      <div className="overflow-x-auto -mx-5">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-gray-50 border-y border-gray-200"><tr className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
            <th className="text-left py-2 px-3">Form</th>
            <th className="text-right py-2 px-3">Fields</th>
            <th className="text-right py-2 px-3">Impr</th>
            <th className="text-right py-2 px-3">Opens</th>
            <th className="text-right py-2 px-3">Submissions</th>
            <th className="text-right py-2 px-3">Submit rate</th>
            <th className="text-right py-2 px-3">Cost</th>
            <th className="text-right py-2 px-3">Cost / submit</th>
          </tr></thead>
          <tbody>
            {forms.map((f, i) => (
              <tr key={f.id} className={`${i % 2 === 1 ? "bg-gray-50/50" : ""} border-b border-gray-100`}>
                <td className="py-2 px-3 max-w-[300px]">
                  <div className="font-medium text-gray-900 truncate" title={f.name || f.business_name}>{f.name || f.business_name || "Unnamed"}</div>
                  <div className="text-[10px] text-gray-500 truncate">{f.headline}</div>
                  <div className="text-[10px] text-gray-500">{f.campaigns.length} campaigns · {f.call_to_action}</div>
                </td>
                <td className="py-2 px-3 text-right tabular-nums text-xs">{f.field_count}</td>
                <td className="py-2 px-3 text-right tabular-nums text-xs">{fmtInt(f.impressions)}</td>
                <td className="py-2 px-3 text-right tabular-nums text-xs">{fmtInt(f.clicks)}</td>
                <td className="py-2 px-3 text-right tabular-nums text-xs font-medium">{f.submissions.toFixed(1)}</td>
                <td className={`py-2 px-3 text-right tabular-nums text-xs font-medium ${f.submission_rate < 15 && f.clicks >= 100 ? "text-amber-800" : "text-emerald-700"}`}>{f.submission_rate.toFixed(1)}%</td>
                <td className="py-2 px-3 text-right tabular-nums text-xs">{fmtCurrency(f.cost)}</td>
                <td className="py-2 px-3 text-right tabular-nums text-xs">{f.submissions > 0 ? fmtCurrency(f.cost_per_submission) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
