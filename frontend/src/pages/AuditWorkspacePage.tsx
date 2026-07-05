// Audit Workspace — /dashboard/audit/:id
//
// The actual audit surface. Loads the audit, renders the panel framework,
// wires each panel component to its state on the audit doc.
//
// For v1: Panel 1 (Campaign Overview) is fully implemented. Remaining
// panels render as stubs with the checklist description and a "coming soon"
// state — they are placeholders that will get real implementations in
// subsequent PRs.

import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardShell from "@/components/DashboardShell";
import { useToast } from "@/hooks/use-toast";
import { AuditPanel, PanelStatus, AuditFlag } from "@/components/audit/AuditPanel";
import { CampaignOverviewPanel } from "@/components/audit/panels/CampaignOverviewPanel";
import { PerformanceSnapshotPanel } from "@/components/audit/panels/PerformanceSnapshotPanel";
import { ChangeHistoryPanel } from "@/components/audit/panels/ChangeHistoryPanel";
import { StructurePanel } from "@/components/audit/panels/StructurePanel";
import { WhereWhenPanel } from "@/components/audit/panels/WhereWhenPanel";
import { ConversionTrackingPanel } from "@/components/audit/panels/ConversionTrackingPanel";
import { LandingPagePanel } from "@/components/audit/panels/LandingPagePanel";
import {
  ArrowLeft,
  Lock,
  ShieldCheck,
  CalendarDays,
  Loader2,
  Clock3,
  Play,
  Download,
} from "lucide-react";

interface PanelState {
  status?: PanelStatus;
  notes?: string;
  reviewed_at?: string;
  data_snapshot?: unknown;
  data_fetched_at?: string;
  flags?: AuditFlag[];
}

interface Audit {
  _id: string;
  customer_id: string;
  customer_name?: string;
  time_frame: string;
  start_date: string;
  end_date: string;
  compare_base: string;
  status: "draft" | "in_progress" | "sealed";
  sealed_at?: string;
  title?: string;
  panels: Record<string, PanelState>;
  createdAt: string;
  updatedAt: string;
}

// The full panel catalog. Order matches the checklist.
// `impl` marks whether the panel has a real body implementation yet.
const PANEL_DEFS: Array<{
  key: string;
  number: number;
  title: string;
  subtitle: string;
  impl: boolean;
}> = [
  { key: "campaign_overview", number: 1, title: "Campaign Overview", subtitle: "Every campaign: type, status, budget, cost, bidding strategy, and prior-period deltas.", impl: true },
  { key: "performance_snapshot", number: 2, title: "Performance Snapshot", subtitle: "Account and per-campaign KPIs. CTR, CPC, CPA, ROAS, Search Lost IS.", impl: true },
  { key: "structure", number: 3, title: "Structure", subtitle: "Ad groups, asset groups, campaign settings, conversion goals, change history thumbnail.", impl: true },
  { key: "targeting", number: 4, title: "Targeting", subtitle: "Keywords, audience signals, demographics, locations, negatives.", impl: false },
  { key: "creative_assets", number: 5, title: "Ad Creative & Assets", subtitle: "URLs, headlines, descriptions, sitelinks, images, asset strength.", impl: false },
  { key: "search_terms", number: 6, title: "Search Terms & Competition", subtitle: "Search terms (Search + PMax), impression share, auction insights link-out.", impl: false },
  { key: "where_when", number: 7, title: "Where & When Ads Show", subtitle: "Devices, day×hour heatmap, PMax network breakdown.", impl: true },
  { key: "conversion_tracking", number: 8, title: "Conversion Tracking", subtitle: "Conversion actions config + firing patterns.", impl: true },
  { key: "landing_page", number: 9, title: "Landing Page Behaviour", subtitle: "URLs + Clarity / Hotjar link-out (external tool for now).", impl: true },
  { key: "lead_gen", number: 10, title: "Lead Generation", subtitle: "Lead form performance and submission rates.", impl: false },
  { key: "ecommerce", number: 11, title: "Ecommerce", subtitle: "Products by asset group, zombie / costly / profitable, eligibility.", impl: false },
  { key: "change_history", number: 12, title: "Change History", subtitle: "Timeline of every change in the account. Overlaid across performance charts.", impl: true },
];

const AuditWorkspaceInner = ({ auditId }: { auditId: string }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);
  const [sealing, setSealing] = useState(false);
  const [runningAll, setRunningAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/audit/${auditId}`);
      setAudit(data.audit);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ?? "Failed to load audit";
      toast({ title: "Load failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [auditId, toast]);

  useEffect(() => { load(); }, [load]);

  const patchPanel = (panelKey: string, patch: Partial<PanelState>) => {
    setAudit((prev) => {
      if (!prev) return prev;
      const panels = { ...(prev.panels || {}) };
      panels[panelKey] = { ...(panels[panelKey] || {}), ...patch };
      return { ...prev, panels };
    });
  };

  const sealAudit = async () => {
    if (!audit) return;
    if (!window.confirm("Seal this audit? Sealed audits are read-only.")) return;
    setSealing(true);
    try {
      const { data } = await axios.post(`/api/audit/${auditId}/seal`);
      setAudit(data.audit);
      toast({ title: "Audit sealed" });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ?? "Failed to seal audit";
      toast({ title: "Seal failed", description: msg, variant: "destructive" });
    } finally {
      setSealing(false);
    }
  };

  const runAllAnalyses = async () => {
    if (!audit) return;
    setRunningAll(true);
    try {
      const { data } = await axios.post(`/api/audit/${auditId}/run-all`);
      // Reload the full audit so every panel state hydrates cleanly
      await load();
      const ok = data.succeeded ?? 0;
      const failed = data.failed ?? 0;
      toast({
        title: failed
          ? `Ran ${ok} panels, ${failed} failed`
          : `Ran ${ok} panels`,
        description: failed
          ? "Check panel-level errors in the browser console."
          : "All implemented panels refreshed.",
        variant: failed ? "destructive" : undefined,
      });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ?? "Failed to run analyses";
      toast({ title: "Run all failed", description: msg, variant: "destructive" });
    } finally {
      setRunningAll(false);
    }
  };

  const downloadEverything = () => {
    if (!audit) return;
    const bundle = {
      exported_at: new Date().toISOString(),
      audit: {
        id: audit._id,
        title: audit.title,
        customer_id: audit.customer_id,
        customer_name: audit.customer_name,
        time_frame: audit.time_frame,
        start_date: audit.start_date,
        end_date: audit.end_date,
        compare_base: audit.compare_base,
        status: audit.status,
        sealed_at: audit.sealed_at,
        createdAt: audit.createdAt,
        updatedAt: audit.updatedAt,
      },
      panels: PANEL_DEFS.map((def) => {
        const state = audit.panels?.[def.key] || {};
        return {
          key: def.key,
          number: def.number,
          title: def.title,
          subtitle: def.subtitle,
          status: state.status || "not_reviewed",
          notes: state.notes || "",
          reviewed_at: state.reviewed_at || null,
          data_fetched_at: state.data_fetched_at || null,
          flags: state.flags || [],
          data_snapshot: state.data_snapshot || null,
        };
      }),
    };
    const slug = (audit.customer_name || audit.customer_id || "audit").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    const date = new Date().toISOString().slice(0, 10);
    const filename = `${slug}_${date}_audit-bundle.json`;
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Audit exported", description: `Saved ${filename}. Drop it into Claude or ChatGPT for analysis.` });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-16 text-center">
        <Loader2 className="w-6 h-6 mx-auto animate-spin text-gray-400" />
        <p className="text-sm text-gray-500 mt-3">Loading audit…</p>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-gray-600 mb-4">Audit not found.</p>
            <Button onClick={() => navigate("/dashboard/audit")}>Back to audits</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalFlags = Object.values(audit.panels || {}).reduce(
    (sum, p) => sum + (p?.flags?.length ?? 0),
    0
  );
  const panelsReviewed = Object.values(audit.panels || {}).filter(
    (p) => p?.status === "reviewed" || p?.status === "flagged"
  ).length;
  const totalPanels = PANEL_DEFS.length;

  const isSealed = audit.status === "sealed";

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <button
            type="button"
            onClick={() => navigate("/dashboard/audit")}
            className="text-xs text-gray-500 hover:text-gray-900 inline-flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to audits
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {audit.title || audit.customer_name || `Account ${audit.customer_id}`}
          </h1>
          <div className="text-xs text-gray-500 mt-1 flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              {audit.time_frame === "ALL_THREE_PERIODS"
                ? "All three periods (30 / 60 / 90 days)"
                : audit.time_frame.replace(/_/g, " ").toLowerCase()}
              {": "}
              {new Date(audit.start_date).toLocaleDateString()} → {new Date(audit.end_date).toLocaleDateString()}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="w-3 h-3" />
              Updated {new Date(audit.updatedAt).toLocaleString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            {panelsReviewed} / {totalPanels} reviewed
          </Badge>
          {totalFlags > 0 && (
            <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-200">
              {totalFlags} flag{totalFlags !== 1 ? "s" : ""}
            </Badge>
          )}
          <Button
            size="sm"
            onClick={runAllAnalyses}
            disabled={runningAll || isSealed}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {runningAll ? (
              <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Running…</>
            ) : (
              <><Play className="w-3.5 h-3.5 mr-1.5" />Run all analyses</>
            )}
          </Button>
          <Button size="sm" variant="outline" onClick={downloadEverything}>
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Download all
          </Button>
          {isSealed ? (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 gap-1">
              <Lock className="w-3 h-3" />
              Sealed
            </Badge>
          ) : (
            <Button size="sm" variant="outline" onClick={sealAudit} disabled={sealing}>
              {sealing ? (
                <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Sealing…</>
              ) : (
                <><ShieldCheck className="w-3.5 h-3.5 mr-1.5" />Seal audit</>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Panels */}
      <div className="space-y-3">
        {PANEL_DEFS.map((def) => {
          const state: PanelState = audit.panels?.[def.key] || {};
          const flags = state.flags || [];
          const status = (state.status || "not_reviewed") as PanelStatus;

          return (
            <AuditPanel
              key={def.key}
              auditId={audit._id}
              panelKey={def.key}
              panelNumber={def.number}
              title={def.title}
              subtitle={def.subtitle}
              status={status}
              notes={state.notes || ""}
              flags={flags}
              dataFetchedAt={state.data_fetched_at || null}
              defaultOpen={def.number === 1}
              isSealed={isSealed}
              onRefreshed={(p) => patchPanel(def.key, {
                data_snapshot: p.data_snapshot,
                flags: p.flags,
                data_fetched_at: p.data_fetched_at,
              })}
              onStateChanged={(p) => patchPanel(def.key, p)}
            >
              {def.impl && def.key === "campaign_overview" && (
                <CampaignOverviewPanel
                  snapshot={(state.data_snapshot as never) || null}
                  clientName={audit.customer_name}
                />
              )}
              {def.impl && def.key === "performance_snapshot" && (
                <PerformanceSnapshotPanel
                  snapshot={(state.data_snapshot as never) || null}
                  clientName={audit.customer_name}
                />
              )}
              {def.impl && def.key === "change_history" && (
                <ChangeHistoryPanel
                  snapshot={(state.data_snapshot as never) || null}
                  clientName={audit.customer_name}
                />
              )}
              {def.impl && def.key === "structure" && (
                <StructurePanel
                  snapshot={(state.data_snapshot as never) || null}
                  clientName={audit.customer_name}
                />
              )}
              {def.impl && def.key === "where_when" && (
                <WhereWhenPanel
                  snapshot={(state.data_snapshot as never) || null}
                  clientName={audit.customer_name}
                />
              )}
              {def.impl && def.key === "conversion_tracking" && (
                <ConversionTrackingPanel
                  snapshot={(state.data_snapshot as never) || null}
                  clientName={audit.customer_name}
                />
              )}
              {def.impl && def.key === "landing_page" && (
                <LandingPagePanel
                  snapshot={(state.data_snapshot as never) || null}
                  clientName={audit.customer_name}
                />
              )}
              {!def.impl && (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full mb-3">
                    <Loader2 className="w-3 h-3" />
                    Implementation pending
                  </div>
                  <p className="text-sm text-gray-600 max-w-md mx-auto">
                    {def.subtitle}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    This panel is scaffolded but the data fetcher hasn't been built yet.
                    Notes and status still save. Data + flags come with the next ship.
                  </p>
                </div>
              )}
            </AuditPanel>
          );
        })}
      </div>

      {/* Bottom actions */}
      {!isSealed && (
        <div className="pt-4 flex justify-end">
          <Button variant="outline" onClick={sealAudit} disabled={sealing}>
            {sealing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sealing…</>
            ) : (
              <><ShieldCheck className="w-4 h-4 mr-2" />Seal audit</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

const AuditWorkspacePage = () => {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;

  return (
    <DashboardShell requireAccount={false}>
      {() => <AuditWorkspaceInner auditId={id} />}
    </DashboardShell>
  );
};

export default AuditWorkspacePage;
