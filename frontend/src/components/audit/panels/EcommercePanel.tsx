// Panel 11 · Ecommerce body — thin summary + product eligibility + overlap.
// Heroes / Costly / Zombies / Sleepers bucketing lives in /dashboard/product-roas.

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ArrowRight, Info } from "lucide-react";
import { Link } from "react-router-dom";

interface Product { merchant_center_id: string; item_id: string; title: string; brand: string; status: string; currency: string; price: number; availability: string; channel: string; issues: Array<{ code: string; description: string; severity: string }>; }
interface Overlap { product_item_id: string; campaign_id: string; campaign_name: string; asset_groups: Array<{ asset_group_id: string; asset_group_name: string; impressions: number; cost: number }>; }
interface Snapshot { time_frame: string; start_date: string; end_date: string; not_applicable?: boolean; note?: string; summary?: { total_products_with_activity: number; total_cost: number; total_conversions: number; total_conversions_value: number; account_roas: number; heroes: number; costly: number; zombies: number; sleepers: number; eligibility_total: number; eligibility_not_eligible: number; eligibility_with_issues: number; overlap_count: number; }; eligibility?: Product[]; overlaps?: Overlap[]; deep_link: string; deep_link_label: string; per_asset_group_note: string; }
interface MultiPeriodSnapshot { multi_period: true; primary_key: string; periods: Record<string, { snapshot: Snapshot; flags: unknown[] }>; }
type AnySnapshot = Snapshot | MultiPeriodSnapshot | null;
interface Props { snapshot: AnySnapshot; clientName?: string; }
const PERIOD_LABEL: Record<string, string> = { LAST_30_DAYS: "Last 30 days", LAST_60_DAYS: "Last 60 days", LAST_90_DAYS: "Last 90 days" };
const isMulti = (s: AnySnapshot): s is MultiPeriodSnapshot => Boolean(s && (s as MultiPeriodSnapshot).multi_period === true);
const fmtInt = (n: number) => Math.round(n).toLocaleString();
const fmtCurrency = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function EcommercePanel({ snapshot, clientName }: Props) {
  const multi = isMulti(snapshot);
  const availableKeys = multi ? Object.keys((snapshot as MultiPeriodSnapshot).periods) : [];
  const [periodKey, setPeriodKey] = useState<string | null>(multi ? (snapshot as MultiPeriodSnapshot).primary_key : null);
  const [tab, setTab] = useState<"summary" | "eligibility" | "overlap">("summary");
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
  const s = active.summary!;
  const slug = (clientName || "audit").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const date = active.start_date.slice(0, 10);
  const eligibility = active.eligibility || [];
  const overlaps = active.overlaps || [];

  const downloadEligibility = () => {
    const headers = ["item_id", "title", "brand", "status", "availability", "channel", "currency", "price", "issue_count"];
    const escape = (v: unknown) => { if (v == null) return ""; const s = String(v); return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s; };
    const csv = [headers.join(","), ...eligibility.map((p) => [escape(p.item_id), escape(p.title), escape(p.brand), p.status, p.availability, p.channel, p.currency, p.price.toFixed(2), p.issues.length].join(","))].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${slug}_${date}_product-eligibility.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

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
        <div className="border border-emerald-200 rounded-lg p-3 bg-emerald-50/40"><div className="text-[10px] font-bold uppercase tracking-widest text-emerald-800">Heroes</div><div className="text-2xl font-bold text-emerald-700 mt-1">{s.heroes}</div><div className="text-[11px] text-gray-500">high ROAS + spend</div></div>
        <div className="border border-red-200 rounded-lg p-3 bg-red-50/40"><div className="text-[10px] font-bold uppercase tracking-widest text-red-800">Costly</div><div className="text-2xl font-bold text-red-700 mt-1">{s.costly}</div><div className="text-[11px] text-gray-500">high spend, low ROAS</div></div>
        <div className="border border-amber-200 rounded-lg p-3 bg-amber-50/40"><div className="text-[10px] font-bold uppercase tracking-widest text-amber-900">Zombies</div><div className="text-2xl font-bold text-amber-800 mt-1">{s.zombies}</div><div className="text-[11px] text-gray-500">impr, no clicks</div></div>
        <div className="border border-orange-200 rounded-lg p-3 bg-orange-50/40"><div className="text-[10px] font-bold uppercase tracking-widest text-orange-900">Sleepers</div><div className="text-2xl font-bold text-orange-800 mt-1">{s.sleepers}</div><div className="text-[11px] text-gray-500">clicks, no conv</div></div>
      </div>

      <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-4 py-3 flex items-center justify-between gap-3">
        <div className="text-xs text-emerald-900">
          <strong>Product bucketing lives on the existing Product ROAS page.</strong> Operator-configurable thresholds, full sortable/filterable tables. This panel gives you the summary + the new feed-health checks below.
        </div>
        <Link to={active.deep_link} className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-2 rounded-md whitespace-nowrap">
          {active.deep_link_label} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="inline-flex rounded-md border border-gray-200 p-0.5">
          {(["summary", "eligibility", "overlap"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={`text-xs font-semibold px-3 py-1.5 rounded capitalize ${tab === t ? "bg-emerald-600 text-white" : "text-gray-700 hover:bg-gray-50"}`}>
              {t === "summary" ? "Account roll-up" : t === "eligibility" ? `Eligibility (${s.eligibility_total})` : `Overlap (${s.overlap_count})`}
            </button>
          ))}
        </div>
      </div>

      {tab === "summary" && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="border border-gray-200 rounded-lg p-3"><div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Products with activity</div><div className="text-2xl font-bold text-gray-900 mt-1">{fmtInt(s.total_products_with_activity)}</div></div>
            <div className="border border-gray-200 rounded-lg p-3"><div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Total spend</div><div className="text-2xl font-bold text-gray-900 mt-1">{fmtCurrency(s.total_cost)}</div></div>
            <div className="border border-gray-200 rounded-lg p-3"><div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Conv value</div><div className="text-2xl font-bold text-gray-900 mt-1">{fmtCurrency(s.total_conversions_value)}</div></div>
            <div className="border border-gray-200 rounded-lg p-3"><div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Account ROAS</div><div className="text-2xl font-bold text-emerald-700 mt-1">{s.total_cost > 0 ? s.account_roas.toFixed(2) : "—"}</div></div>
          </div>
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50/50 px-4 py-3 text-xs text-blue-900 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <div>{active.per_asset_group_note}</div>
          </div>
        </div>
      )}

      {tab === "eligibility" && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-500">
              <strong>{s.eligibility_not_eligible}</strong> not eligible · <strong>{s.eligibility_with_issues}</strong> with issues · <strong>{s.eligibility_total}</strong> total
            </div>
            <Button size="sm" variant="outline" onClick={downloadEligibility}><Download className="w-3.5 h-3.5 mr-1.5" /> CSV</Button>
          </div>
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="bg-gray-50 border-y border-gray-200"><tr className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                <th className="text-left py-2 px-3">Item ID</th>
                <th className="text-left py-2 px-3">Title</th>
                <th className="text-left py-2 px-3">Brand</th>
                <th className="text-right py-2 px-3">Price</th>
                <th className="text-left py-2 px-3">Availability</th>
                <th className="text-left py-2 px-3">Status</th>
                <th className="text-right py-2 px-3">Issues</th>
              </tr></thead>
              <tbody>
                {eligibility.slice(0, 500).map((p, i) => (
                  <tr key={`${p.item_id}-${i}`} className={`${i % 2 === 1 ? "bg-gray-50/50" : ""} border-b border-gray-100`}>
                    <td className="py-2 px-3 text-xs tabular-nums text-gray-600">{p.item_id}</td>
                    <td className="py-2 px-3 max-w-[280px]"><div className="text-gray-900 truncate" title={p.title}>{p.title}</div></td>
                    <td className="py-2 px-3 text-xs text-gray-600">{p.brand || "—"}</td>
                    <td className="py-2 px-3 text-right tabular-nums text-xs">{p.price > 0 ? `${p.currency} ${p.price.toFixed(2)}` : "—"}</td>
                    <td className="py-2 px-3 text-xs text-gray-600">{p.availability || "—"}</td>
                    <td className="py-2 px-3 text-xs">
                      {p.status === "READY_TO_SERVE" ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200">Ready</Badge>
                      ) : p.status === "NOT_ELIGIBLE" ? (
                        <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">Not eligible</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">{p.status}</Badge>
                      )}
                    </td>
                    <td className={`py-2 px-3 text-right tabular-nums text-xs ${p.issues.length > 0 ? "text-amber-800 font-semibold" : "text-gray-400"}`}>{p.issues.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {eligibility.length > 500 && (<div className="text-xs text-gray-500 text-center py-2">Showing 500 of {eligibility.length}. Full data in CSV.</div>)}
          </div>
        </div>
      )}

      {tab === "overlap" && (
        <div>
          {overlaps.length === 0 ? (
            <div className="text-sm text-emerald-800 border border-emerald-200 bg-emerald-50/50 rounded-lg p-4">
              ✓ No product overlap detected. Every product is served through a single asset group per campaign — the healthy default.
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs text-red-800 border border-red-200 bg-red-50/50 rounded-lg p-3">
                <strong>{overlaps.length} products</strong> appear in more than one asset group within the same campaign. Google's own guidance is that this shouldn't happen — it usually indicates a feed / listing-group misconfig where asset groups compete against each other in the auction.
              </div>
              {overlaps.slice(0, 100).map((o) => (
                <div key={`${o.campaign_id}-${o.product_item_id}`} className="border border-gray-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-900">Product <span className="text-xs tabular-nums text-gray-500">#{o.product_item_id}</span></div>
                  <div className="text-xs text-gray-500 mb-2 truncate" title={o.campaign_name}>Campaign: {o.campaign_name}</div>
                  <div className="space-y-1">
                    {o.asset_groups.map((ag) => (
                      <div key={ag.asset_group_id} className="text-xs flex justify-between border-l-2 border-red-200 pl-2">
                        <span className="text-gray-800 truncate">{ag.asset_group_name}</span>
                        <span className="tabular-nums text-gray-600">{fmtInt(ag.impressions)} impr · {fmtCurrency(ag.cost)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {overlaps.length > 100 && (<div className="text-xs text-gray-500 text-center py-2">Showing 100 of {overlaps.length} overlap cases.</div>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
