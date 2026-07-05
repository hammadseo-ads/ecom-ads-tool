// Panel 7 · Where & When Ads Show body.

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Smartphone, Monitor, Tablet, Info, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface DeviceRow {
  device: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  conversions_value: number;
  ctr: number;
  average_cpc: number;
  cost_per_conversion: number;
  roas: number;
  conv_rate: number;
}
interface CampaignDeviceRow {
  campaign_id: string;
  campaign_name: string;
  channel_type: string;
  total_cost: number;
  total_conversions: number;
  campaign_avg_cpa: number;
  devices: DeviceRow[];
}
interface PMaxNetworkRow {
  network: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  conversions_value: number;
  roas: number;
  cost_share: number;
}
interface PMaxCampaignRow {
  campaign_id: string;
  campaign_name: string;
  total_cost: number;
  networks: PMaxNetworkRow[];
}

interface Snapshot {
  time_frame: string;
  start_date: string;
  end_date: string;
  devices: CampaignDeviceRow[];
  pmax_networks: PMaxCampaignRow[];
  heatmap_link: string;
  heatmap_note: string;
}

interface MultiPeriodSnapshot { multi_period: true; primary_key: string; periods: Record<string, { snapshot: Snapshot; flags: unknown[] }>; }
type AnySnapshot = Snapshot | MultiPeriodSnapshot | null;
interface Props { snapshot: AnySnapshot; clientName?: string; }

const PERIOD_LABEL: Record<string, string> = { LAST_30_DAYS: "Last 30 days", LAST_60_DAYS: "Last 60 days", LAST_90_DAYS: "Last 90 days" };
const isMulti = (s: AnySnapshot): s is MultiPeriodSnapshot => Boolean(s && (s as MultiPeriodSnapshot).multi_period === true);

const fmtCurrency = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtInt = (n: number) => Math.round(n).toLocaleString();

const DEVICE_META: Record<string, { label: string; Icon: React.ElementType }> = {
  MOBILE: { label: "Mobile", Icon: Smartphone },
  DESKTOP: { label: "Desktop", Icon: Monitor },
  TABLET: { label: "Tablet", Icon: Tablet },
  CONNECTED_TV: { label: "TV", Icon: Monitor },
  OTHER: { label: "Other", Icon: Monitor },
  UNKNOWN: { label: "Unknown", Icon: Monitor },
};

const NETWORK_LABEL: Record<string, string> = {
  SEARCH: "Search",
  SEARCH_PARTNERS: "Search Partners",
  CONTENT: "Display",
  YOUTUBE_SEARCH: "YouTube Search",
  YOUTUBE_WATCH: "YouTube Watch",
  YOUTUBE: "YouTube",
  DISPLAY: "Display",
  MIXED: "Mixed",
  UNKNOWN: "Unknown",
};

const downloadDevicesCSV = (rows: CampaignDeviceRow[], filename: string) => {
  const headers = ["campaign_id", "campaign_name", "channel_type", "device", "impressions", "clicks", "ctr", "cost", "conversions", "conversions_value", "cpa", "roas"];
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(",")];
  for (const c of rows) {
    for (const d of c.devices) {
      lines.push([c.campaign_id, escape(c.campaign_name), c.channel_type, d.device, Math.round(d.impressions), Math.round(d.clicks), d.ctr.toFixed(2), d.cost.toFixed(2), d.conversions.toFixed(2), d.conversions_value.toFixed(2), d.cost_per_conversion.toFixed(2), d.roas.toFixed(2)].join(","));
    }
  }
  const blob = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const downloadPMaxCSV = (rows: PMaxCampaignRow[], filename: string) => {
  const headers = ["campaign_id", "campaign_name", "network", "impressions", "clicks", "cost", "cost_share", "conversions", "conversions_value", "roas"];
  const lines = [headers.join(",")];
  for (const c of rows) {
    for (const n of c.networks) {
      lines.push([c.campaign_id, `"${c.campaign_name.replace(/"/g, '""')}"`, n.network, Math.round(n.impressions), Math.round(n.clicks), n.cost.toFixed(2), n.cost_share.toFixed(4), n.conversions.toFixed(2), n.conversions_value.toFixed(2), n.roas.toFixed(2)].join(","));
    }
  }
  const blob = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export function WhereWhenPanel({ snapshot, clientName }: Props) {
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

      {/* 7a. Devices */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold text-gray-900">Devices per campaign</h4>
          <Button size="sm" variant="outline" onClick={() => downloadDevicesCSV(active.devices, `${slug}_${active.start_date.slice(0, 10)}_devices.csv`)}>
            <Download className="w-3.5 h-3.5 mr-1.5" /> CSV
          </Button>
        </div>
        {active.devices.length === 0 ? (
          <div className="text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg p-6 text-center">No device data in window.</div>
        ) : (
          <div className="space-y-3">
            {active.devices.slice(0, 20).map((c) => (
              <div key={c.campaign_id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-2 bg-gray-50 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">{c.campaign_name}</div>
                    <div className="text-[10px] text-gray-500">{c.channel_type} · total cost {fmtCurrency(c.total_cost)}</div>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {c.devices.sort((a, b) => b.cost - a.cost).map((d) => {
                    const meta = DEVICE_META[d.device] || DEVICE_META.OTHER;
                    const Icon = meta.Icon;
                    const share = c.total_cost > 0 ? d.cost / c.total_cost : 0;
                    return (
                      <div key={d.device} className="px-4 py-2 grid grid-cols-12 gap-2 text-xs items-center">
                        <div className="col-span-2 flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5 text-gray-600" />
                          <span className="font-medium text-gray-800">{meta.label}</span>
                        </div>
                        <div className="col-span-2 tabular-nums text-gray-600">Impr {fmtInt(d.impressions)}</div>
                        <div className="col-span-2 tabular-nums text-gray-600">Clicks {fmtInt(d.clicks)}</div>
                        <div className="col-span-2 tabular-nums font-medium">{fmtCurrency(d.cost)}<span className="text-[10px] text-gray-400"> ({(share * 100).toFixed(0)}%)</span></div>
                        <div className="col-span-2 tabular-nums">Conv {d.conversions.toFixed(1)}</div>
                        <div className="col-span-2 tabular-nums font-medium text-emerald-700 text-right">
                          {d.cost > 0 ? `ROAS ${d.roas.toFixed(2)}` : "—"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {active.devices.length > 20 && (
              <div className="text-xs text-gray-500 text-center pt-2">
                Showing top 20 campaigns by cost. Full data in CSV export.
              </div>
            )}
          </div>
        )}
      </div>

      {/* 7b. Heatmap link-out */}
      <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 px-4 py-3 flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="text-sm font-bold text-emerald-900 mb-1">Day × Hour heatmap</div>
          <div className="text-xs text-emerald-800">{active.heatmap_note}</div>
        </div>
        <Link
          to={active.heatmap_link}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-2 rounded-md whitespace-nowrap"
        >
          Open heatmap <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* 7c. PMax network breakdown */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold text-gray-900">PMax network breakdown</h4>
          {active.pmax_networks.length > 0 && (
            <Button size="sm" variant="outline" onClick={() => downloadPMaxCSV(active.pmax_networks, `${slug}_${active.start_date.slice(0, 10)}_pmax-networks.csv`)}>
              <Download className="w-3.5 h-3.5 mr-1.5" /> CSV
            </Button>
          )}
        </div>
        {active.pmax_networks.length === 0 ? (
          <div className="text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg p-6 text-center">
            No Performance Max campaigns in the window.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-2 text-xs text-blue-900 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              Google API v23+ exposes cost per ad-network for PMax. This is one of the few places you can see where PMax spend actually goes.
            </div>
            {active.pmax_networks.map((c) => (
              <div key={c.campaign_id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-2 bg-gray-50">
                  <div className="text-sm font-medium text-gray-900 truncate">{c.campaign_name}</div>
                  <div className="text-[10px] text-gray-500">total cost {fmtCurrency(c.total_cost)}</div>
                </div>
                <div className="divide-y divide-gray-100">
                  {c.networks.sort((a, b) => b.cost - a.cost).map((n) => (
                    <div key={n.network} className="px-4 py-2 grid grid-cols-12 gap-2 text-xs items-center">
                      <div className="col-span-3">
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          {NETWORK_LABEL[n.network] || n.network.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <div className="col-span-2 tabular-nums text-gray-600">Impr {fmtInt(n.impressions)}</div>
                      <div className="col-span-2 tabular-nums text-gray-600">Clicks {fmtInt(n.clicks)}</div>
                      <div className="col-span-3 tabular-nums font-medium">
                        {fmtCurrency(n.cost)}
                        <span className="text-[10px] text-gray-400"> ({(n.cost_share * 100).toFixed(0)}%)</span>
                      </div>
                      <div className="col-span-2 tabular-nums font-medium text-emerald-700 text-right">
                        {n.cost > 0 ? `ROAS ${n.roas.toFixed(2)}` : "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
