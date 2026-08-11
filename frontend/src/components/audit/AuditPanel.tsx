// Reusable panel wrapper for the Audit workspace.
//
// Every audit panel (Campaign Overview, Performance Snapshot, etc.) renders
// through this wrapper so they all share the same:
//   - header with title, status pill, expand toggle
//   - flags list block
//   - body (panel-specific content, passed as children)
//   - notes textarea
//   - status controls + refresh button
//
// Panel-specific data fetching happens in the panel component itself via the
// `onRefresh` prop; this wrapper is presentational.

import { ReactNode, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronDown,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  CircleAlert,
  CircleDot,
  CheckCircle2,
  MinusCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export type PanelStatus = "not_reviewed" | "reviewed" | "flagged" | "not_applicable";

export interface AuditFlag {
  code: string;
  severity: "info" | "warn" | "critical";
  target_type?: string;
  target_id?: string;
  target_name?: string;
  message: string;
  meta?: Record<string, unknown>;
}

export type FetchStatus = "ok" | "partial" | "failed" | "not_applicable" | undefined;

interface AuditPanelProps {
  auditId: string;
  panelKey: string;
  panelNumber: number;
  title: string;
  subtitle?: string;
  status: PanelStatus;
  notes: string;
  flags: AuditFlag[];
  dataFetchedAt?: string | null;
  defaultOpen?: boolean;
  isSealed?: boolean;
  fetchStatus?: FetchStatus;
  fetchError?: string;
  children?: ReactNode;
  onRefreshed?: (payload: { data_snapshot: unknown; flags: AuditFlag[]; data_fetched_at: string }) => void;
  onStateChanged?: (patch: { status?: PanelStatus; notes?: string }) => void;
}

const STATUS_META: Record<PanelStatus, { label: string; icon: React.ElementType; className: string }> = {
  not_reviewed: { label: "Not reviewed", icon: CircleDot, className: "bg-gray-100 text-gray-700 border-gray-200" },
  reviewed: { label: "Reviewed", icon: CheckCircle2, className: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  flagged: { label: "Flagged for client fix", icon: AlertTriangle, className: "bg-slate-50 text-slate-900 border-slate-200" },
  not_applicable: { label: "Not applicable", icon: MinusCircle, className: "bg-gray-50 text-gray-500 border-gray-200" },
};

const SEVERITY_META: Record<AuditFlag["severity"], { className: string; label: string }> = {
  info: { className: "bg-emerald-50 text-emerald-800 border-emerald-200", label: "Info" },
  warn: { className: "bg-slate-50 text-slate-900 border-slate-200", label: "Warn" },
  critical: { className: "bg-slate-50 text-slate-800 border-slate-200", label: "Critical" },
};

export function AuditPanel({
  auditId,
  panelKey,
  panelNumber,
  title,
  subtitle,
  status,
  notes,
  flags,
  dataFetchedAt,
  defaultOpen = true,
  isSealed = false,
  fetchStatus,
  fetchError,
  children,
  onRefreshed,
  onStateChanged,
}: AuditPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [refreshing, setRefreshing] = useState(false);
  const [localNotes, setLocalNotes] = useState(notes);
  const [savingNotes, setSavingNotes] = useState(false);
  const { toast } = useToast();

  const statusMeta = STATUS_META[status];
  const StatusIcon = statusMeta.icon;

  const refresh = async () => {
    if (isSealed) return;
    setRefreshing(true);
    try {
      const { data } = await axios.post(`/api/audit/${auditId}/panel/${panelKey}/refresh`);
      onRefreshed?.(data);
      toast({ title: "Panel refreshed", description: `Fetched ${flags?.length ?? 0} flag(s) from Google Ads.` });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message
        ?? (err as { message?: string })?.message
        ?? "Refresh failed";
      toast({ title: "Refresh failed", description: msg, variant: "destructive" });
    } finally {
      setRefreshing(false);
    }
  };

  const changeStatus = async (next: PanelStatus) => {
    if (isSealed || next === status) return;
    try {
      await axios.patch(`/api/audit/${auditId}/panel/${panelKey}`, { status: next });
      onStateChanged?.({ status: next });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ?? "Failed to update";
      toast({ title: "Status update failed", description: msg, variant: "destructive" });
    }
  };

  const saveNotes = async () => {
    if (isSealed || localNotes === notes) return;
    setSavingNotes(true);
    try {
      await axios.patch(`/api/audit/${auditId}/panel/${panelKey}`, { notes: localNotes });
      onStateChanged?.({ notes: localNotes });
      toast({ title: "Notes saved" });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ?? "Failed to save notes";
      toast({ title: "Save failed", description: msg, variant: "destructive" });
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <Card className="border border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        {open ? <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400 tabular-nums">Panel {String(panelNumber).padStart(2, "0")}</span>
            <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
            {flags.length > 0 && (
              <Badge variant="outline" className="bg-slate-50 text-slate-900 border-slate-200 gap-1">
                <AlertTriangle className="w-3 h-3" />
                {flags.length} flag{flags.length !== 1 ? "s" : ""}
              </Badge>
            )}
            {fetchStatus === "failed" && (
              <Badge variant="outline" className="bg-slate-50 text-slate-800 border-slate-200 gap-1">
                <AlertTriangle className="w-3 h-3" />
                Fetch failed
              </Badge>
            )}
            {fetchStatus === "partial" && (
              <Badge variant="outline" className="bg-slate-50 text-slate-900 border-slate-200 gap-1">
                <AlertTriangle className="w-3 h-3" />
                Partial
              </Badge>
            )}
            {fetchStatus === "not_applicable" && (
              <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
                Not applicable
              </Badge>
            )}
          </div>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <Badge variant="outline" className={`gap-1 ${statusMeta.className}`}>
          <StatusIcon className="w-3 h-3" />
          {statusMeta.label}
        </Badge>
      </button>

      {/* Body */}
      {open && (
        <CardContent className="px-5 pb-5 pt-0 space-y-5 border-t border-gray-100">
          {/* Refresh row */}
          <div className="flex items-center justify-between gap-3 pt-4">
            <div className="text-xs text-gray-500">
              {dataFetchedAt ? (
                <>Last fetched {new Date(dataFetchedAt).toLocaleString()}</>
              ) : (
                <>No data fetched yet — click Refresh to pull from Google Ads.</>
              )}
            </div>
            <Button size="sm" variant="outline" onClick={refresh} disabled={refreshing || isSealed}>
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Fetching..." : dataFetchedAt ? "Refresh" : "Fetch"}
            </Button>
          </div>

          {/* Flags */}
          {flags.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-3">
                Flags for this section ({flags.length})
              </div>
              <ul className="space-y-2">
                {flags.map((f, i) => {
                  const sev = SEVERITY_META[f.severity];
                  return (
                    <li key={`${f.code}-${i}`} className="flex items-start gap-2 text-sm">
                      <span className={`inline-flex items-center flex-shrink-0 text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${sev.className}`}>
                        {sev.label}
                      </span>
                      <span className="text-gray-800">
                        {f.target_name && <strong className="font-semibold">{f.target_name}: </strong>}
                        {f.message}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Body content — the panel-specific data.
              When fetch_status flags failure or "not applicable", we render
              a graceful state HERE instead of handing the (undefined-field)
              snapshot to the child component. Prevents the browser from
              choking on `undefined.length` etc. */}
          {fetchStatus === "failed" ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50/40 p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-900 mb-1">Fetch failed</div>
                  <div className="text-sm text-slate-800">
                    This panel's data couldn't be retrieved from Google Ads.
                    {dataFetchedAt && <> Last attempt: {new Date(dataFetchedAt).toLocaleString()}.</>}
                  </div>
                  {fetchError && (
                    <div className="mt-2 rounded border border-slate-200 bg-white/70 px-3 py-2 font-mono text-xs text-slate-900 break-all">
                      {fetchError}
                    </div>
                  )}
                  <div className="text-xs text-slate-700/80 mt-2">
                    Try clicking Fetch again above. If the error persists, share the message.
                  </div>
                </div>
              </div>
            </div>
          ) : fetchStatus === "not_applicable" ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <div className="flex items-start gap-3">
                <MinusCircle className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-gray-800 mb-1">Not applicable to this account</div>
                  <div className="text-sm text-gray-600">
                    This panel is only meaningful when the underlying data exists on the account
                    (e.g. Lead Form Extensions for the Lead Generation panel). Nothing to show here.
                  </div>
                </div>
              </div>
            </div>
          ) : children ? (
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              {children}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
              <CircleAlert className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              No data yet. Click Fetch above to pull the latest from Google Ads.
            </div>
          )}

          {/* Notes */}
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
              Your notes
            </div>
            <Textarea
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              onBlur={saveNotes}
              placeholder="What did you find? What's the recommendation? These notes go into the client report."
              className="min-h-[100px]"
              disabled={isSealed}
            />
            {savingNotes && <p className="text-[11px] text-gray-500 mt-1">Saving...</p>}
          </div>

          {/* Status controls */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 mr-2">Mark this panel:</span>
            {(Object.keys(STATUS_META) as PanelStatus[]).map((s) => {
              const meta = STATUS_META[s];
              const Icon = meta.icon;
              const active = status === s;
              return (
                <Button
                  key={s}
                  size="sm"
                  variant={active ? "default" : "outline"}
                  onClick={() => changeStatus(s)}
                  disabled={isSealed}
                  className={active ? "" : "text-gray-600"}
                >
                  <Icon className="w-3.5 h-3.5 mr-1.5" />
                  {meta.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
