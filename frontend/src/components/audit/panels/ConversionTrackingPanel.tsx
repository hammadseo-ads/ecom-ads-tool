// Panel 8 · Conversion Tracking body.

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Info, Check, X } from "lucide-react";

interface Action {
  id: string;
  name: string;
  type: string;
  status: string;
  category: string;
  counting_type: string;
  click_through_lookback_days: number;
  view_through_lookback_days: number;
  include_in_conversions_metric: boolean;
  primary_for_goal: boolean;
  attribution_model: string;
  default_value: number;
  recent_conversions: number;
  recent_conversions_value: number;
}

interface Snapshot {
  time_frame: string;
  start_date: string;
  end_date: string;
  summary: {
    total_actions: number;
    enabled_actions: number;
    primary_actions: number;
    zero_firing: number;
    total_conversions_in_window: number;
  };
  actions: Action[];
  note: string;
}

interface MultiPeriodSnapshot { multi_period: true; primary_key: string; periods: Record<string, { snapshot: Snapshot; flags: unknown[] }>; }
type AnySnapshot = Snapshot | MultiPeriodSnapshot | null;
interface Props { snapshot: AnySnapshot; clientName?: string; }

const PERIOD_LABEL: Record<string, string> = { LAST_30_DAYS: "Last 30 days", LAST_60_DAYS: "Last 60 days", LAST_90_DAYS: "Last 90 days" };
const isMulti = (s: AnySnapshot): s is MultiPeriodSnapshot => Boolean(s && (s as MultiPeriodSnapshot).multi_period === true);
const fmtInt = (n: number) => Math.round(n).toLocaleString();
const fmtCurrency = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const CATEGORY_LABEL: Record<string, string> = {
  PURCHASE: "Purchase", LEAD: "Lead", SIGN_UP: "Sign up", CONTACT: "Contact",
  SUBMIT_LEAD_FORM: "Lead form", BOOK_APPOINTMENT: "Book appt", REQUEST_QUOTE: "Quote",
  GET_DIRECTIONS: "Directions", OUTBOUND_CLICK: "Outbound", PAGE_VIEW: "Page view",
  ADD_TO_CART: "Add to cart", BEGIN_CHECKOUT: "Begin checkout",
};

const downloadCSV = (rows: Action[], filename: string) => {
  const headers = ["id", "name", "status", "category", "type", "counting_type", "primary_for_goal", "include_in_conversions_metric", "click_through_lookback_days", "attribution_model", "recent_conversions", "recent_conversions_value"];
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

export function ConversionTrackingPanel({ snapshot, clientName }: Props) {
  const multi = isMulti(snapshot);
  const availableKeys = multi ? Object.keys((snapshot as MultiPeriodSnapshot).periods) : [];
  const [periodKey, setPeriodKey] = useState<string | null>(multi ? (snapshot as MultiPeriodSnapshot).primary_key : null);
  const active: Snapshot | null = useMemo(() => {
    if (!snapshot) return null;
    if (multi) return (snapshot as MultiPeriodSnapshot).periods[periodKey || (snapshot as MultiPeriodSnapshot).primary_key]?.snapshot || null;
    return snapshot as Snapshot;
  }, [snapshot, multi, periodKey]);

  if (!active) return null;
  const filename = `${(clientName || "audit").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}_${active.start_date.slice(0, 10)}_conversion-actions.csv`;

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

      <div className="rounded-lg border border-blue-200 bg-blue-50/50 px-4 py-3 text-xs text-blue-900 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        <div>{active.note}</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Actions</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{active.summary.enabled_actions} / {active.summary.total_actions}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">enabled</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Primary goals</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{active.summary.primary_actions}</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Zero firing</div>
          <div className={`text-2xl font-bold mt-1 ${active.summary.zero_firing > 0 ? "text-amber-800" : "text-emerald-700"}`}>{active.summary.zero_firing}</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Total conv in window</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{fmtInt(active.summary.total_conversions_in_window)}</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">Window: <strong>{active.start_date.slice(0, 10)} → {active.end_date.slice(0, 10)}</strong></div>
        <Button size="sm" variant="outline" onClick={() => downloadCSV(active.actions, filename)}>
          <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
        </Button>
      </div>

      <div className="overflow-x-auto -mx-5">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-gray-50 border-y border-gray-200">
            <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
              <th className="text-left py-2 px-3">Name</th>
              <th className="text-left py-2 px-3">Category</th>
              <th className="text-left py-2 px-3">Status</th>
              <th className="text-left py-2 px-3">Counting</th>
              <th className="text-center py-2 px-3">Primary</th>
              <th className="text-center py-2 px-3">In "Conv" metric</th>
              <th className="text-right py-2 px-3">Recent conv</th>
              <th className="text-right py-2 px-3">Recent value</th>
            </tr>
          </thead>
          <tbody>
            {active.actions.map((a, i) => (
              <tr key={a.id} className={`${i % 2 === 1 ? "bg-gray-50/50" : ""} border-b border-gray-100`}>
                <td className="py-2 px-3 max-w-[300px]">
                  <div className="font-medium text-gray-900 truncate" title={a.name}>{a.name}</div>
                  <div className="text-[10px] text-gray-500">{a.type} · {a.attribution_model || "—"}</div>
                </td>
                <td className="py-2 px-3 text-xs">
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                    {CATEGORY_LABEL[a.category] || a.category || "—"}
                  </Badge>
                </td>
                <td className="py-2 px-3 text-xs">
                  {a.status === "ENABLED"
                    ? <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200">Enabled</Badge>
                    : <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">{a.status}</Badge>}
                </td>
                <td className="py-2 px-3 text-xs">
                  {a.counting_type === "ONE_PER_CLICK" ? "One per click" : a.counting_type === "MANY_PER_CLICK" ? "Every per click" : a.counting_type || "—"}
                </td>
                <td className="py-2 px-3 text-center">
                  {a.primary_for_goal
                    ? <Check className="w-4 h-4 text-emerald-600 inline-block" />
                    : <X className="w-4 h-4 text-gray-300 inline-block" />}
                </td>
                <td className="py-2 px-3 text-center">
                  {a.include_in_conversions_metric
                    ? <Check className="w-4 h-4 text-emerald-600 inline-block" />
                    : <X className="w-4 h-4 text-gray-300 inline-block" />}
                </td>
                <td className={`py-2 px-3 text-right tabular-nums text-xs ${a.recent_conversions === 0 && a.status === "ENABLED" ? "text-amber-800 font-semibold" : ""}`}>
                  {a.recent_conversions.toFixed(1)}
                </td>
                <td className="py-2 px-3 text-right tabular-nums text-xs">
                  {a.recent_conversions_value > 0 ? fmtCurrency(a.recent_conversions_value) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
