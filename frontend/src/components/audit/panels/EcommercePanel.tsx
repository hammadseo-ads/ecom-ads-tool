// Panel 11 · Ecommerce body — thin summary + product eligibility + overlap.
// Heroes / Costly / Zombies / Sleepers bucketing lives in /dashboard/product-roas.

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ArrowRight, Info } from "lucide-react";
import { Link } from "react-router-dom";

interface Product { merchant_center_id: string; item_id: string; title: string; brand: string; status: string; currency: string; price: number; availability: string; channel: string; issues: Array<{ code: string; description: string; severity: string }>; }
interface Overlap { product_item_id: string; campaign_id: string; campaign_name: string; asset_groups: Array<{ asset_group_id: string; asset_group_name: string; impressions: number; cost: number }>; }
interface PerfProduct { item_id: string; title: string; brand: string; product_type_l1: string; impressions: number; clicks: number; cost: number; conversions: number; conversions_value: number; roas: number; bucket: string; }
interface IssueCode { code: string; description: string; severity: string; count: number; example_products: Array<{ item_id: string; title: string }>; }
interface AssetGroupProduct {
  item_id: string;
  title: string;
  brand: string;
  product_type_l1: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  conversions_value: number;
  roas: number;
  cost_per_conversion: number;
}
interface AssetGroupBreakdown {
  campaign_id: string;
  campaign_name: string;
  asset_group_id: string;
  asset_group_name: string;
  asset_group_status: string;
  totals: {
    impressions: number;
    clicks: number;
    cost: number;
    conversions: number;
    conversions_value: number;
    roas: number;
    product_count: number;
  };
  products: AssetGroupProduct[];
}
interface Snapshot {
  time_frame: string; start_date: string; end_date: string;
  not_applicable?: boolean; note?: string;
  summary?: {
    total_products_with_activity: number; total_cost: number;
    total_conversions: number; total_conversions_value: number;
    account_roas: number;
    heroes: number; costly: number; zombies: number; sleepers: number;
    eligibility_total: number; eligibility_not_eligible: number; eligibility_with_issues: number;
    overlap_count: number;
    blended_margin_pct?: number | null;
    breakeven_roas?: number | null;
    account_roas_vs_breakeven_pct?: number | null;
  };
  top_products?: {
    heroes: PerfProduct[];
    costly: PerfProduct[];
    zombies: PerfProduct[];
    sleepers: PerfProduct[];
  };
  issue_codes_summary?: IssueCode[];
  eligibility?: Product[]; overlaps?: Overlap[];
  per_asset_group_products?: AssetGroupBreakdown[];
  per_asset_group_products_summary?: {
    total_groups: number;
    total_products_across_groups: number;
    total_cost: number;
  };
  deep_link: string; deep_link_label: string; per_asset_group_note: string;
}
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
  const [tab, setTab] = useState<"summary" | "products" | "per_asset_group" | "eligibility" | "overlap">("summary");
  const [productSubTab, setProductSubTab] = useState<"heroes" | "costly" | "zombies" | "sleepers">("heroes");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
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
        <div className="inline-flex rounded-md border border-gray-200 p-0.5 flex-wrap">
          {(["summary", "products", "per_asset_group", "eligibility", "overlap"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={`text-xs font-semibold px-3 py-1.5 rounded ${tab === t ? "bg-emerald-600 text-white" : "text-gray-700 hover:bg-gray-50"}`}>
              {t === "summary" ? "Account roll-up"
                : t === "products" ? `Top products (${(active.top_products?.heroes?.length ?? 0) + (active.top_products?.costly?.length ?? 0) + (active.top_products?.zombies?.length ?? 0) + (active.top_products?.sleepers?.length ?? 0)})`
                : t === "per_asset_group" ? `Per asset group (${active.per_asset_group_products?.length ?? 0})`
                : t === "eligibility" ? `Eligibility (${s.eligibility_total})`
                : `Overlap (${s.overlap_count})`}
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
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Account ROAS</div>
              <div className="text-2xl font-bold text-emerald-700 mt-1">{s.total_cost > 0 ? s.account_roas.toFixed(2) : "—"}</div>
              {s.breakeven_roas != null && (
                <div className={`text-[11px] mt-0.5 ${(s.account_roas_vs_breakeven_pct ?? 0) < 0 ? "text-red-700 font-semibold" : "text-emerald-700"}`}>
                  breakeven {s.breakeven_roas.toFixed(2)}× · {(s.account_roas_vs_breakeven_pct ?? 0) >= 0 ? "+" : ""}{(s.account_roas_vs_breakeven_pct ?? 0).toFixed(1)}% vs breakeven
                </div>
              )}
            </div>
          </div>
          {s.breakeven_roas != null && (
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/50 px-3 py-2 text-xs text-emerald-900">
              Margin <strong>{((s.blended_margin_pct ?? 0) * 100).toFixed(0)}%</strong> → Breakeven ROAS <strong>{s.breakeven_roas.toFixed(2)}×</strong>. Account ROAS <strong>{s.account_roas.toFixed(2)}×</strong> means the ad account is currently <strong>{(s.account_roas_vs_breakeven_pct ?? 0) >= 0 ? "profitable" : "losing money"}</strong> on paid clicks.
            </div>
          )}
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50/50 px-4 py-3 text-xs text-blue-900 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <div>{active.per_asset_group_note}</div>
          </div>
        </div>
      )}

      {tab === "products" && active.top_products && (
        <div>
          <div className="inline-flex rounded-md border border-gray-200 p-0.5 mb-3">
            {(["heroes", "costly", "zombies", "sleepers"] as const).map((t) => {
              const count = active.top_products?.[t]?.length ?? 0;
              return (
                <button key={t} type="button" onClick={() => setProductSubTab(t)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded capitalize ${productSubTab === t ? "bg-emerald-600 text-white" : "text-gray-700 hover:bg-gray-50"}`}>
                  {t} ({count})
                </button>
              );
            })}
          </div>
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-gray-50 border-y border-gray-200"><tr className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                <th className="text-left py-2 px-3">Item ID</th>
                <th className="text-left py-2 px-3">Title</th>
                <th className="text-left py-2 px-3">Brand / Type</th>
                <th className="text-right py-2 px-3">Impr</th>
                <th className="text-right py-2 px-3">Clicks</th>
                <th className="text-right py-2 px-3">Cost</th>
                <th className="text-right py-2 px-3">Conv</th>
                <th className="text-right py-2 px-3">Value</th>
                <th className="text-right py-2 px-3">ROAS</th>
              </tr></thead>
              <tbody>
                {(active.top_products?.[productSubTab] ?? []).map((p, i) => (
                  <tr key={`${p.item_id}-${i}`} className={`${i % 2 === 1 ? "bg-gray-50/50" : ""} border-b border-gray-100`}>
                    <td className="py-2 px-3 text-xs tabular-nums text-gray-600">{p.item_id}</td>
                    <td className="py-2 px-3 max-w-[280px]"><div className="text-gray-900 truncate" title={p.title}>{p.title || "—"}</div></td>
                    <td className="py-2 px-3 text-xs text-gray-600 max-w-[180px] truncate">{[p.brand, p.product_type_l1].filter(Boolean).join(" · ") || "—"}</td>
                    <td className="py-2 px-3 text-right tabular-nums text-xs">{fmtInt(p.impressions)}</td>
                    <td className="py-2 px-3 text-right tabular-nums text-xs">{fmtInt(p.clicks)}</td>
                    <td className="py-2 px-3 text-right tabular-nums font-medium">{fmtCurrency(p.cost)}</td>
                    <td className="py-2 px-3 text-right tabular-nums text-xs">{p.conversions.toFixed(1)}</td>
                    <td className="py-2 px-3 text-right tabular-nums text-xs">{p.conversions_value > 0 ? fmtCurrency(p.conversions_value) : "—"}</td>
                    <td className="py-2 px-3 text-right tabular-nums font-medium text-emerald-700">{p.cost > 0 ? p.roas.toFixed(2) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(active.top_products?.[productSubTab]?.length ?? 0) === 0 && (
              <div className="p-4 text-center text-xs text-gray-500">No products in this bucket for the current window.</div>
            )}
          </div>
        </div>
      )}

      {tab === "per_asset_group" && (
        (() => {
          const groups = active.per_asset_group_products || [];
          if (groups.length === 0) {
            return (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
                No per-asset-group product data returned by Google Ads for this window. Possible reasons: no active PMax campaigns, no delivery in the window, or Google sampling excluded per-SKU segmentation.
              </div>
            );
          }
          const selected = groups.find((g) => g.asset_group_id === selectedGroupId) || groups[0];
          const filename = `${slug}_${date}_asset-group_${selected.asset_group_name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}_products.csv`;
          const downloadGroupCSV = () => {
            const headers = ["item_id", "title", "brand", "product_type_l1", "impressions", "clicks", "cost", "conversions", "conversions_value", "roas", "cost_per_conversion"];
            const escape = (v: unknown) => { if (v == null) return ""; const s = String(v); return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s; };
            const rows = selected.products.map((p) => headers.map((h) => escape((p as unknown as Record<string, unknown>)[h])).join(","));
            const csv = [headers.join(","), ...rows].join("\r\n");
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = filename;
            document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
          };
          return (
            <div>
              <div className="rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-2 text-xs text-blue-900 mb-3 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <div>
                  Per-product performance broken down by PMax asset group. Same view as Google Ads UI → Products → filter by asset group → Download. Google enforces one product per asset group per campaign, so no double-counting.
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* LEFT · asset group selector */}
                <div className="lg:col-span-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                    Asset groups ({groups.length})
                  </div>
                  <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
                    {groups.map((g) => {
                      const isSel = (selectedGroupId || groups[0].asset_group_id) === g.asset_group_id;
                      return (
                        <button
                          key={`${g.campaign_id}-${g.asset_group_id}`}
                          type="button"
                          onClick={() => setSelectedGroupId(g.asset_group_id)}
                          className={`w-full text-left border rounded-md px-3 py-2 transition-colors ${
                            isSel
                              ? "bg-emerald-50 border-emerald-300"
                              : "bg-white border-gray-200 hover:border-emerald-200"
                          }`}
                        >
                          <div className="text-sm font-medium text-gray-900 truncate" title={g.asset_group_name}>
                            {g.asset_group_name}
                          </div>
                          <div className="text-[10px] text-gray-500 truncate" title={g.campaign_name}>
                            {g.campaign_name}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[11px] tabular-nums">
                            <span className="text-gray-700">{fmtCurrency(g.totals.cost)}</span>
                            <span className={g.totals.roas >= 2 ? "text-emerald-700 font-semibold" : "text-gray-500"}>
                              ROAS {g.totals.cost > 0 ? g.totals.roas.toFixed(2) : "—"}
                            </span>
                            <span className="text-gray-400">{g.totals.product_count} SKUs</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* RIGHT · products table */}
                <div className="lg:col-span-8">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-sm font-bold text-gray-900 truncate max-w-[400px]" title={selected.asset_group_name}>
                        {selected.asset_group_name}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate max-w-[400px]" title={selected.campaign_name}>
                        {selected.campaign_name} · {selected.totals.product_count} products · {fmtCurrency(selected.totals.cost)} spend · ROAS {selected.totals.cost > 0 ? selected.totals.roas.toFixed(2) : "—"}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={downloadGroupCSV}>
                      <Download className="w-3.5 h-3.5 mr-1.5" /> CSV
                    </Button>
                  </div>
                  <div className="overflow-x-auto -mx-5">
                    <table className="w-full text-sm min-w-[700px]">
                      <thead className="bg-gray-50 border-y border-gray-200"><tr className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                        <th className="text-left py-2 px-3">Item ID</th>
                        <th className="text-left py-2 px-3">Title</th>
                        <th className="text-right py-2 px-3">Impr</th>
                        <th className="text-right py-2 px-3">Clicks</th>
                        <th className="text-right py-2 px-3">Cost</th>
                        <th className="text-right py-2 px-3">Conv</th>
                        <th className="text-right py-2 px-3">Value</th>
                        <th className="text-right py-2 px-3">ROAS</th>
                      </tr></thead>
                      <tbody>
                        {selected.products.slice(0, 200).map((p, i) => (
                          <tr key={`${p.item_id}-${i}`} className={`${i % 2 === 1 ? "bg-gray-50/50" : ""} border-b border-gray-100`}>
                            <td className="py-2 px-3 text-xs tabular-nums text-gray-600">{p.item_id}</td>
                            <td className="py-2 px-3 max-w-[240px]">
                              <div className="text-gray-900 truncate" title={p.title}>{p.title || "—"}</div>
                              <div className="text-[10px] text-gray-500 truncate">{[p.brand, p.product_type_l1].filter(Boolean).join(" · ")}</div>
                            </td>
                            <td className="py-2 px-3 text-right tabular-nums text-xs">{fmtInt(p.impressions)}</td>
                            <td className="py-2 px-3 text-right tabular-nums text-xs">{fmtInt(p.clicks)}</td>
                            <td className={`py-2 px-3 text-right tabular-nums font-medium ${p.cost > 50 && p.conversions === 0 ? "text-amber-800" : ""}`}>{fmtCurrency(p.cost)}</td>
                            <td className="py-2 px-3 text-right tabular-nums text-xs">{p.conversions.toFixed(1)}</td>
                            <td className="py-2 px-3 text-right tabular-nums text-xs">{p.conversions_value > 0 ? fmtCurrency(p.conversions_value) : "—"}</td>
                            <td className="py-2 px-3 text-right tabular-nums font-medium text-emerald-700">{p.cost > 0 ? p.roas.toFixed(2) : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {selected.products.length > 200 && (
                      <div className="text-xs text-gray-500 text-center py-2">Showing 200 of {selected.products.length}. Full data in CSV.</div>
                    )}
                    {selected.products.length === 0 && (
                      <div className="p-4 text-center text-xs text-gray-500">
                        This asset group has activity ({fmtCurrency(selected.totals.cost)} spend) but no per-SKU segmentation returned — likely a broad listing-group filter node without per-product breakdown, or Google sampling.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()
      )}

      {tab === "eligibility" && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-500">
              <strong>{s.eligibility_not_eligible}</strong> not eligible · <strong>{s.eligibility_with_issues}</strong> with issues · <strong>{s.eligibility_total}</strong> total
            </div>
            <Button size="sm" variant="outline" onClick={downloadEligibility}><Download className="w-3.5 h-3.5 mr-1.5" /> CSV</Button>
          </div>
          {active.issue_codes_summary && active.issue_codes_summary.length > 0 && (
            <div className="mb-3 border border-amber-200 rounded-lg bg-amber-50/40 p-3">
              <div className="text-xs font-bold uppercase tracking-widest text-amber-900 mb-2">Issue codes breakdown</div>
              <div className="space-y-1 text-xs">
                {active.issue_codes_summary.slice(0, 15).map((ic) => (
                  <div key={ic.code} className="flex items-start gap-2">
                    <Badge variant="outline" className="bg-white text-amber-900 border-amber-300 tabular-nums font-mono text-[10px] flex-shrink-0">
                      {ic.count}×
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate" title={ic.code}>{ic.code}</div>
                      {ic.description && <div className="text-gray-600 text-[11px]">{ic.description}</div>}
                    </div>
                    <Badge variant="outline" className={ic.severity === "error" ? "bg-red-50 text-red-800 border-red-200" : ic.severity === "warning" ? "bg-amber-50 text-amber-900 border-amber-200" : "bg-gray-50 text-gray-600 border-gray-200"}>
                      {ic.severity || "—"}
                    </Badge>
                  </div>
                ))}
                {active.issue_codes_summary.length > 15 && (
                  <div className="text-[11px] text-amber-700 pt-1">
                    +{active.issue_codes_summary.length - 15} more issue types. Full data in CSV.
                  </div>
                )}
              </div>
            </div>
          )}
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
