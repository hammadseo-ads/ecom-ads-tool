// Audit index — list past audits for the currently selected client, and let
// the operator start a new one. Once an audit is created, we navigate into
// /dashboard/audit/:id (the workspace).

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardShell from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ClipboardList,
  Play,
  FileSearch,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Loader2,
  Trash2,
} from "lucide-react";

interface AuditSummary {
  _id: string;
  customer_id: string;
  customer_name?: string;
  time_frame: string;
  start_date: string;
  end_date: string;
  status: "draft" | "in_progress" | "sealed";
  title?: string;
  createdAt: string;
  updatedAt: string;
  panel_count: number;
  panels_reviewed: number;
  panels_flagged: number;
  total_flags: number;
}

const TIME_FRAME_LABELS: Record<string, string> = {
  LAST_30_DAYS: "Last 30 days",
  LAST_60_DAYS: "Last 60 days",
  LAST_90_DAYS: "Last 90 days",
  ALL_THREE_PERIODS: "All three (30 / 60 / 90 days)",
  CUSTOM: "Custom",
};

interface InnerProps {
  selectedAccountId: string;
  selectedAccountName: string;
}

const AuditIndexInner = ({ selectedAccountId, selectedAccountName }: InnerProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [audits, setAudits] = useState<AuditSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [timeFrame, setTimeFrame] = useState("LAST_30_DAYS");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const loadAudits = async () => {
    if (!selectedAccountId) return;
    setLoading(true);
    try {
      const { data } = await axios.get("/api/audit", { params: { customer_id: selectedAccountId } });
      setAudits(data.audits || []);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ?? "Failed to load audits";
      toast({ title: "Load failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccountId]);

  const deleteOne = async (id: string) => {
    setDeletingId(id);
    try {
      await axios.delete(`/api/audit/${id}`);
      setAudits((prev) => prev.filter((x) => x._id !== id));
      toast({ title: "Audit deleted" });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ?? "Failed to delete audit";
      toast({ title: "Delete failed", description: msg, variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const deleteAllForAccount = async () => {
    if (audits.length === 0) return;
    setBulkDeleting(true);
    const ids = audits.map((a) => a._id);
    const results = await Promise.allSettled(ids.map((id) => axios.delete(`/api/audit/${id}`)));
    const failed = results.filter((r) => r.status === "rejected").length;
    const ok = results.length - failed;
    setBulkDeleting(false);
    setBulkOpen(false);
    if (failed === 0) {
      toast({ title: `Deleted ${ok} audit${ok !== 1 ? "s" : ""}` });
    } else {
      toast({ title: `Deleted ${ok}, ${failed} failed`, variant: "destructive" });
    }
    await loadAudits();
  };

  const startAudit = async () => {
    if (!selectedAccountId) {
      toast({ title: "Pick an account first", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      const { data } = await axios.post("/api/audit", {
        customer_id: selectedAccountId,
        customer_name: selectedAccountName,
        time_frame: timeFrame,
      });
      navigate(`/dashboard/audit/${data.audit._id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ?? "Failed to create audit";
      toast({ title: "Create failed", description: msg, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  if (!selectedAccountId) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <Card>
          <CardContent className="py-12 text-center text-gray-600">
            <FileSearch className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">Select a Google Ads account above to start or continue an audit.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-[11px] font-bold uppercase tracking-widest rounded-full px-2.5 py-1 mb-2">
            <ClipboardList className="w-3 h-3" />
            Client Audit
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {selectedAccountName || `Account ${selectedAccountId}`}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Walk through the Google Ads analysis checklist top-to-bottom. Notes and flags become the client deliverable.
          </p>
        </div>
      </div>

      {/* Start new audit */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
            <div className="flex-1">
              <div className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Start a new audit
              </div>
              <div className="text-sm text-gray-700">
                Pick a time frame. Every panel of the audit inherits it. Small accounts benefit from All time.
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Select value={timeFrame} onValueChange={setTimeFrame}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Time frame" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIME_FRAME_LABELS).filter(([k]) => k !== "CUSTOM").map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={startAudit} disabled={creating}>
                {creating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating…</>
                ) : (
                  <><Play className="w-4 h-4 mr-2" />Start audit</>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Past audits */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Past audits</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              {loading ? "Loading…" : `${audits.length} audit${audits.length !== 1 ? "s" : ""}`}
            </span>
            {audits.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="text-red-700 border-red-200 hover:bg-red-50 hover:text-red-800"
                onClick={() => setBulkOpen(true)}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Delete all
              </Button>
            )}
          </div>
        </div>
        {audits.length === 0 && !loading ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-gray-500">
              No audits yet for this account. Start one above.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {audits.map((a) => (
              <div
                key={a._id}
                className="w-full text-left border border-gray-200 rounded-lg bg-white hover:border-emerald-300 hover:shadow-md transition-all p-4 flex items-center gap-4"
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/dashboard/audit/${a._id}`)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate(`/dashboard/audit/${a._id}`); }}
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">
                      {a.title || `Audit — ${new Date(a.createdAt).toLocaleDateString()}`}
                    </span>
                    {a.status === "draft" && <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Draft</Badge>}
                    {a.status === "in_progress" && <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">In progress</Badge>}
                    {a.status === "sealed" && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 gap-1">
                        <Lock className="w-3 h-3" />
                        Sealed
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-3 flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {TIME_FRAME_LABELS[a.time_frame] || a.time_frame}
                      {" · "}
                      {new Date(a.start_date).toLocaleDateString()} → {new Date(a.end_date).toLocaleDateString()}
                    </span>
                    <span>
                      Updated {new Date(a.updatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {a.total_flags > 0 && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-200 gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {a.total_flags} flag{a.total_flags !== 1 ? "s" : ""}
                    </Badge>
                  )}
                  {a.panels_reviewed > 0 && (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {a.panels_reviewed} reviewed
                    </Badge>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={deletingId === a._id}
                        className="text-red-700 border-red-200 hover:bg-red-50 hover:text-red-800 h-8 w-8 p-0"
                        aria-label="Delete audit"
                      >
                        {deletingId === a._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this audit?</AlertDialogTitle>
                        <AlertDialogDescription>
                          <strong>{a.title || `Audit — ${new Date(a.createdAt).toLocaleDateString()}`}</strong> for {selectedAccountName || selectedAccountId}.
                          <br />
                          Time frame: {TIME_FRAME_LABELS[a.time_frame] || a.time_frame}. All panel snapshots and notes will be permanently removed. This cannot be undone.
                          {a.status === "sealed" && (
                            <span className="block mt-2 text-amber-800 font-medium">
                              This audit is <strong>sealed</strong>. Deleting removes the finalised deliverable.
                            </span>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteOne(a._id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bulk-delete confirmation */}
      <AlertDialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all audits for this account?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes <strong>{audits.length}</strong> audit{audits.length !== 1 ? "s" : ""} for <strong>{selectedAccountName || selectedAccountId}</strong>, including all panel snapshots and notes. Audits for other Google Ads accounts are not affected. This cannot be undone.
              {audits.some((a) => a.status === "sealed") && (
                <span className="block mt-2 text-amber-800 font-medium">
                  {audits.filter((a) => a.status === "sealed").length} sealed audit{audits.filter((a) => a.status === "sealed").length !== 1 ? "s" : ""} will also be deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); deleteAllForAccount(); }}
              disabled={bulkDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {bulkDeleting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting…</>
              ) : (
                <>Delete all {audits.length}</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const AuditIndexPage = () => (
  <DashboardShell>
    {({ selectedAccountId, selectedAccountName }) => (
      <AuditIndexInner
        selectedAccountId={selectedAccountId}
        selectedAccountName={selectedAccountName}
      />
    )}
  </DashboardShell>
);

export default AuditIndexPage;
