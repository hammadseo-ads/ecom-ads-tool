// Panel 5 · Ad Creative & Assets body.
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Info, Pin } from "lucide-react";

interface TextAsset { asset_id: string; text: string; field_type: string; performance_label: string; enabled: boolean; is_pinned: boolean; pinned_field: string; ad_group_name: string; campaign_name: string; channel_type: string; char_count: number; char_limit: number; }
interface Image { id: string; name: string; width: number; height: number; url: string; approval_status: string; review_status: string; }
interface AdStrength { ad_id: string; ad_strength: string; status: string; ad_group_name: string; campaign_name: string; }
interface Snapshot { time_frame: string; text_assets: TextAsset[]; images: Image[]; ad_strengths: AdStrength[]; summary: { headlines: { total: number; by_label: Record<string, number> }; descriptions: { total: number; by_label: Record<string, number> }; images: { total: number; approved: number; limited: number; disapproved: number }; ad_strengths: Record<string, number>; }; note: string; }
interface Props { snapshot: Snapshot | null; clientName?: string; }
const LABEL_META: Record<string, { className: string }> = {
  BEST: { className: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  GOOD: { className: "bg-blue-50 text-blue-800 border-blue-200" },
  LOW: { className: "bg-red-50 text-red-800 border-red-200" },
  LEARNING: { className: "bg-amber-50 text-amber-900 border-amber-200" },
  PENDING: { className: "bg-gray-50 text-gray-500 border-gray-200" },
  UNSPECIFIED: { className: "bg-gray-50 text-gray-500 border-gray-200" },
};
const APPROVAL_META: Record<string, { label: string; className: string }> = {
  APPROVED: { label: "Approved", className: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  APPROVED_LIMITED: { label: "Approved (limited)", className: "bg-amber-50 text-amber-900 border-amber-200" },
  DISAPPROVED: { label: "Disapproved", className: "bg-red-50 text-red-800 border-red-200" },
  UNDER_REVIEW: { label: "Under review", className: "bg-blue-50 text-blue-800 border-blue-200" },
  AREA_OF_INTEREST_ONLY: { label: "AOI only", className: "bg-gray-50 text-gray-500 border-gray-200" },
};

export function CreativeAssetsPanel({ snapshot, clientName }: Props) {
  const [tab, setTab] = useState<"headlines" | "descriptions" | "images" | "strength">("headlines");
  const [labelFilter, setLabelFilter] = useState<string>("__all__");
  if (!snapshot) return null;
  const slug = (clientName || "audit").replace(/[^a-z0-9]+/gi, "-").toLowerCase();

  const filteredText = snapshot.text_assets.filter((a) => {
    const type = tab === "headlines" ? "HEADLINE" : "DESCRIPTION";
    if (a.field_type !== type) return false;
    if (labelFilter !== "__all__" && a.performance_label !== labelFilter) return false;
    return true;
  });

  const downloadTextCSV = () => {
    const headers = ["text", "field_type", "performance_label", "is_pinned", "enabled", "char_count", "char_limit", "ad_group_name", "campaign_name"];
    const escape = (v: unknown) => { if (v == null) return ""; const s = String(v); return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s; };
    const csv = [headers.join(","), ...filteredText.map((a) => headers.map((h) => escape((a as unknown as Record<string, unknown>)[h])).join(","))].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${slug}_${tab}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  return (
    <div className="p-5 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Headlines</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{snapshot.summary.headlines.total}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            BEST {snapshot.summary.headlines.by_label.BEST || 0} · LOW <span className={(snapshot.summary.headlines.by_label.LOW || 0) > 0 ? "text-red-700 font-semibold" : ""}>{snapshot.summary.headlines.by_label.LOW || 0}</span>
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Descriptions</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{snapshot.summary.descriptions.total}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            BEST {snapshot.summary.descriptions.by_label.BEST || 0} · LOW <span className={(snapshot.summary.descriptions.by_label.LOW || 0) > 0 ? "text-red-700 font-semibold" : ""}>{snapshot.summary.descriptions.by_label.LOW || 0}</span>
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Images</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{snapshot.summary.images.total}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            <span className={snapshot.summary.images.disapproved > 0 ? "text-red-700 font-semibold" : ""}>{snapshot.summary.images.disapproved} disapproved</span> · {snapshot.summary.images.limited} limited
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">RSA strength</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {(snapshot.summary.ad_strengths.EXCELLENT || 0) + (snapshot.summary.ad_strengths.GOOD || 0)}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            Excellent/Good, {(snapshot.summary.ad_strengths.POOR || 0) + (snapshot.summary.ad_strengths.AVERAGE || 0)} Poor/Average
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50/50 px-4 py-3 text-xs text-blue-900 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /><div>{snapshot.note}</div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="inline-flex rounded-md border border-gray-200 p-0.5">
          {(["headlines", "descriptions", "images", "strength"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={`text-xs font-semibold px-3 py-1.5 rounded capitalize ${tab === t ? "bg-emerald-600 text-white" : "text-gray-700 hover:bg-gray-50"}`}>
              {t}
            </button>
          ))}
        </div>
        {(tab === "headlines" || tab === "descriptions") && (
          <>
            <div className="inline-flex rounded-md border border-gray-200 p-0.5">
              {["__all__", "BEST", "GOOD", "LOW", "LEARNING"].map((l) => (
                <button key={l} type="button" onClick={() => setLabelFilter(l)}
                  className={`text-[11px] font-semibold px-2 py-1 rounded ${labelFilter === l ? "bg-gray-800 text-white" : "text-gray-600 hover:bg-gray-50"}`}>
                  {l === "__all__" ? "All" : l}
                </button>
              ))}
            </div>
            <Button size="sm" variant="outline" onClick={downloadTextCSV}><Download className="w-3.5 h-3.5 mr-1.5" /> CSV</Button>
          </>
        )}
      </div>

      {(tab === "headlines" || tab === "descriptions") && (
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-gray-50 border-y border-gray-200"><tr className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
              <th className="text-left py-2 px-3">Text</th>
              <th className="text-left py-2 px-3">Label</th>
              <th className="text-left py-2 px-3">Ad group / Campaign</th>
              <th className="text-right py-2 px-3">Chars</th>
              <th className="text-center py-2 px-3">Pinned</th>
            </tr></thead>
            <tbody>
              {filteredText.slice(0, 300).map((a, i) => {
                const label = LABEL_META[a.performance_label] || LABEL_META.UNSPECIFIED;
                return (
                  <tr key={`${a.asset_id}-${a.ad_group_name}-${i}`} className={`${i % 2 === 1 ? "bg-gray-50/50" : ""} border-b border-gray-100`}>
                    <td className="py-2 px-3 max-w-[380px]"><div className="text-gray-900 truncate" title={a.text}>{a.text}</div></td>
                    <td className="py-2 px-3 text-xs"><Badge variant="outline" className={label.className}>{a.performance_label}</Badge></td>
                    <td className="py-2 px-3 text-xs max-w-[240px]"><div className="text-gray-800 truncate" title={a.ad_group_name}>{a.ad_group_name}</div><div className="text-[10px] text-gray-500 truncate" title={a.campaign_name}>{a.campaign_name}</div></td>
                    <td className={`py-2 px-3 text-right tabular-nums text-xs ${a.char_count > a.char_limit ? "text-red-700 font-semibold" : ""}`}>{a.char_count} / {a.char_limit}</td>
                    <td className="py-2 px-3 text-center">{a.is_pinned ? <Pin className="w-3.5 h-3.5 text-amber-700 inline-block" /> : ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredText.length > 300 && (<div className="text-xs text-gray-500 text-center py-2">Showing 300 of {filteredText.length}. Full data in CSV.</div>)}
        </div>
      )}

      {tab === "images" && (
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50 border-y border-gray-200"><tr className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
              <th className="text-left py-2 px-3">Preview</th>
              <th className="text-left py-2 px-3">Name</th>
              <th className="text-left py-2 px-3">Dimensions</th>
              <th className="text-left py-2 px-3">Status</th>
            </tr></thead>
            <tbody>
              {snapshot.images.map((img, i) => {
                const status = APPROVAL_META[img.approval_status] || { label: img.approval_status, className: "bg-gray-50 text-gray-500 border-gray-200" };
                return (
                  <tr key={img.id} className={`${i % 2 === 1 ? "bg-gray-50/50" : ""} border-b border-gray-100`}>
                    <td className="py-2 px-3">{img.url ? <img src={img.url} alt="" className="w-16 h-16 object-cover rounded border border-gray-200" loading="lazy" /> : <div className="w-16 h-16 bg-gray-100 rounded" />}</td>
                    <td className="py-2 px-3 max-w-[260px]"><div className="text-gray-900 truncate">{img.name || "—"}</div></td>
                    <td className="py-2 px-3 text-xs text-gray-600">{img.width}×{img.height}</td>
                    <td className="py-2 px-3 text-xs"><Badge variant="outline" className={status.className}>{status.label}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "strength" && (
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50 border-y border-gray-200"><tr className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
              <th className="text-left py-2 px-3">Ad group / Campaign</th>
              <th className="text-left py-2 px-3">Status</th>
              <th className="text-left py-2 px-3">Ad strength</th>
            </tr></thead>
            <tbody>
              {snapshot.ad_strengths.map((a, i) => (
                <tr key={a.ad_id} className={`${i % 2 === 1 ? "bg-gray-50/50" : ""} border-b border-gray-100`}>
                  <td className="py-2 px-3 max-w-[340px]"><div className="text-gray-800 truncate" title={a.ad_group_name}>{a.ad_group_name}</div><div className="text-[10px] text-gray-500 truncate" title={a.campaign_name}>{a.campaign_name}</div></td>
                  <td className="py-2 px-3 text-xs">{a.status === "ENABLED" ? <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200">Enabled</Badge> : <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">{a.status}</Badge>}</td>
                  <td className="py-2 px-3 text-xs">
                    <Badge variant="outline" className={LABEL_META[a.ad_strength]?.className || LABEL_META.UNSPECIFIED.className}>{a.ad_strength || "—"}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
