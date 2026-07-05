// Panel 12 · Change History body.
// Answers "what changed and when?" — the single highest-value diagnostic panel.
//
// Google Ads API caps change_event at 30 days. That's independent of the
// audit's time frame. We honour the cap here and surface the boundary
// prominently so the operator isn't confused.

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Download, User, Bot, Terminal, Info } from "lucide-react";

interface ChangeEvent {
  timestamp: string;
  user_email: string;
  client_type: string;
  resource_type: string;
  resource_name: string;
  operation: string;
  changed_fields: string[];
  campaign?: string;
  ad_group?: string;
  material?: boolean;
  // old_resource / new_resource are heavy JSON blobs kept in the snapshot
  // but rendered on demand only.
}

interface Snapshot {
  api_cap_days: number;
  fetched_at: string;
  start_date: string;
  end_date: string;
  earliest_event: string | null;
  latest_event: string | null;
  events: ChangeEvent[];
  summary: {
    total_events: number;
    material_events: number;
    by_actor: Record<string, number>;
    by_resource_type: Record<string, number>;
    by_operation: { CREATE: number; UPDATE: number; REMOVE: number };
  };
}

interface Props {
  snapshot: Snapshot | null;
  clientName?: string;
}

const OP_LABEL: Record<string, { label: string; className: string }> = {
  CREATE: { label: "Create", className: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  UPDATE: { label: "Update", className: "bg-blue-50 text-blue-800 border-blue-200" },
  REMOVE: { label: "Remove", className: "bg-red-50 text-red-800 border-red-200" },
};

const RESOURCE_LABEL: Record<string, string> = {
  CAMPAIGN: "Campaign",
  CAMPAIGN_BUDGET: "Budget",
  AD: "Ad",
  AD_GROUP: "Ad group",
  AD_GROUP_AD: "Ad",
  AD_GROUP_CRITERION: "Keyword/target",
  AD_GROUP_BID_MODIFIER: "Bid modifier",
  CAMPAIGN_CRITERION: "Campaign target",
  CAMPAIGN_ASSET: "Asset (campaign)",
  AD_GROUP_ASSET: "Asset (ad group)",
  ASSET: "Asset",
  ASSET_SET: "Asset set",
  FEED: "Feed",
  FEED_ITEM: "Feed item",
  CUSTOMER_ASSET: "Asset (account)",
};

const shortActor = (e: ChangeEvent) => {
  if (e.client_type === "GOOGLE_ADS_SCRIPTS") return "Script";
  if (e.client_type === "GOOGLE_ADS_API") return "API";
  if (e.client_type === "GOOGLE_ADS_EDITOR") return e.user_email || "Editor";
  if (e.client_type === "GOOGLE_ADS_WEB_CLIENT") return e.user_email || "Web user";
  return e.user_email || e.client_type || "Unknown";
};

const actorIcon = (e: ChangeEvent) => {
  if (e.client_type === "GOOGLE_ADS_SCRIPTS") return Bot;
  if (e.client_type === "GOOGLE_ADS_API") return Terminal;
  return User;
};

const shortResource = (rn?: string) => {
  if (!rn) return "";
  const parts = rn.split("/");
  return parts.slice(-2).join("/");
};

const downloadCSV = (events: ChangeEvent[], filename: string) => {
  const headers = [
    "timestamp", "user_email", "client_type", "resource_type",
    "resource_name", "operation", "changed_fields", "campaign", "ad_group", "material",
  ];
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    headers.join(","),
    ...events.map((e) => headers.map((h) => {
      if (h === "changed_fields") return escape(e.changed_fields.join("; "));
      return escape((e as unknown as Record<string, unknown>)[h]);
    }).join(",")),
  ].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export function ChangeHistoryPanel({ snapshot, clientName }: Props) {
  const [materialOnly, setMaterialOnly] = useState(true);
  const [search, setSearch] = useState("");
  const [resourceType, setResourceType] = useState<string>("__all__");
  const [actorFilter, setActorFilter] = useState<string>("__all__");

  const filtered = useMemo(() => {
    if (!snapshot?.events) return [];
    return snapshot.events.filter((e) => {
      if (materialOnly && !e.material) return false;
      if (resourceType !== "__all__" && e.resource_type !== resourceType) return false;
      if (actorFilter !== "__all__" && shortActor(e) !== actorFilter) return false;
      if (search) {
        const needle = search.toLowerCase();
        const haystack = [
          e.user_email, e.resource_type, e.resource_name, e.operation,
          e.changed_fields.join(" "), shortResource(e.campaign),
        ].join(" ").toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
  }, [snapshot, materialOnly, resourceType, actorFilter, search]);

  if (!snapshot) return null;

  const filename = `${(clientName || "audit").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}_${snapshot.start_date.slice(0, 10)}_change-history.csv`;
  const resourceOptions = Object.keys(snapshot.summary.by_resource_type).sort();
  const actorOptions = Object.keys(snapshot.summary.by_actor).sort();

  return (
    <div className="p-5 space-y-4">
      {/* API cap boundary */}
      <div className="rounded-lg border border-blue-200 bg-blue-50/50 px-4 py-2 text-xs text-blue-900 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        <div>
          Google's API caps this resource at the last <strong>{snapshot.api_cap_days} days</strong>, independent of the audit's time frame.
          {snapshot.earliest_event && snapshot.latest_event && (
            <>
              {" "}Showing events from <strong>{new Date(snapshot.earliest_event).toLocaleString()}</strong>
              {" "}to <strong>{new Date(snapshot.latest_event).toLocaleString()}</strong>.
            </>
          )}
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Total events</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{snapshot.summary.total_events}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            {snapshot.summary.material_events} material · {snapshot.summary.total_events - snapshot.summary.material_events} noise
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Creates</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{snapshot.summary.by_operation.CREATE}</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Updates</div>
          <div className="text-2xl font-bold text-blue-700 mt-1">{snapshot.summary.by_operation.UPDATE}</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Removes</div>
          <div className="text-2xl font-bold text-red-700 mt-1">{snapshot.summary.by_operation.REMOVE}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <div className="flex items-center gap-2">
          <Switch id="material-only" checked={materialOnly} onCheckedChange={setMaterialOnly} />
          <Label htmlFor="material-only" className="text-xs cursor-pointer">Material only</Label>
        </div>
        <Select value={resourceType} onValueChange={setResourceType}>
          <SelectTrigger className="w-56 h-9 text-xs">
            <SelectValue placeholder="All resource types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All resource types</SelectItem>
            {resourceOptions.map((rt) => (
              <SelectItem key={rt} value={rt}>
                {RESOURCE_LABEL[rt] || rt} ({snapshot.summary.by_resource_type[rt]})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={actorFilter} onValueChange={setActorFilter}>
          <SelectTrigger className="w-56 h-9 text-xs">
            <SelectValue placeholder="All actors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All actors</SelectItem>
            {actorOptions.map((a) => (
              <SelectItem key={a} value={a}>{a} ({snapshot.summary.by_actor[a]})</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Search fields, resource, campaign…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[220px] h-9 text-xs"
        />
        <Button size="sm" variant="outline" onClick={() => downloadCSV(filtered, filename)}>
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export CSV
        </Button>
      </div>

      <div className="text-xs text-gray-500">
        Showing <strong>{filtered.length}</strong> of {snapshot.events.length} events.
      </div>

      {/* Event table */}
      <div className="overflow-x-auto -mx-5">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-gray-50 border-y border-gray-200">
            <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
              <th className="text-left py-2 px-3">When</th>
              <th className="text-left py-2 px-3">Actor</th>
              <th className="text-left py-2 px-3">Resource</th>
              <th className="text-left py-2 px-3">Operation</th>
              <th className="text-left py-2 px-3">Changed fields</th>
              <th className="text-left py-2 px-3">Campaign / Ad group</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 px-3 text-center text-sm text-gray-500">
                  No events match your filters.
                </td>
              </tr>
            ) : filtered.map((e, i) => {
              const op = OP_LABEL[e.operation] || { label: e.operation, className: "bg-gray-50 text-gray-700 border-gray-200" };
              const ActorIcon = actorIcon(e);
              return (
                <tr key={`${e.timestamp}-${i}`} className={`${i % 2 === 1 ? "bg-gray-50/50" : ""} border-b border-gray-100 align-top`}>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <div className="text-xs text-gray-900">{new Date(e.timestamp).toLocaleDateString()}</div>
                    <div className="text-[10px] text-gray-500">{new Date(e.timestamp).toLocaleTimeString()}</div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="inline-flex items-center gap-1.5 text-xs">
                      <ActorIcon className="w-3 h-3 text-gray-500" />
                      <span className="truncate max-w-[140px]" title={shortActor(e)}>{shortActor(e)}</span>
                    </div>
                    {e.material && (
                      <div className="text-[10px] text-amber-800 font-semibold mt-0.5">Material</div>
                    )}
                  </td>
                  <td className="py-2 px-3 text-xs">
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                      {RESOURCE_LABEL[e.resource_type] || e.resource_type}
                    </Badge>
                    <div className="text-[10px] text-gray-500 mt-0.5" title={e.resource_name}>
                      {shortResource(e.resource_name)}
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <Badge variant="outline" className={op.className}>{op.label}</Badge>
                  </td>
                  <td className="py-2 px-3 text-xs">
                    <div className="flex flex-wrap gap-1 max-w-md">
                      {e.changed_fields.slice(0, 5).map((f, k) => (
                        <span key={k} className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">{f}</span>
                      ))}
                      {e.changed_fields.length > 5 && (
                        <span className="text-[10px] text-gray-500">+{e.changed_fields.length - 5} more</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-600">
                    {e.campaign && <div title={e.campaign}>{shortResource(e.campaign)}</div>}
                    {e.ad_group && <div className="text-[10px] text-gray-500" title={e.ad_group}>{shortResource(e.ad_group)}</div>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
