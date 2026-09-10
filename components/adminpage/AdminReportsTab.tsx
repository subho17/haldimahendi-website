"use client";

import React, { useState } from "react";
import { Flag, Ban, Download, Loader2 } from "lucide-react";

export interface AdminReport {
  id: string;
  reporterId: string;
  reportedId: string;
  reason: string;
  details?: string;
  status: string;
  createdAt: string;
}

interface AdminReportsTabProps {
  reports: AdminReport[];
  onActOnReport: (id: string, action: "resolve" | "dismiss") => Promise<void>;
  onApplyMemberAction: (id: string, action: "suspend" | "activate" | "block" | "unblock", targetId?: string) => Promise<void>;
  busyId: string;
}

const REASON_LABELS: Record<string, string> = {
  fake_profile: "Fake / Misleading Profile",
  harassment: "Harassment / Abusive Behaviour",
  inappropriate_content: "Inappropriate Content",
  fraud_or_scam: "Fraud / Financial Scam",
  other: "Other",
};

export default function AdminReportsTab({
  reports,
  onActOnReport,
  onApplyMemberAction,
  busyId,
}: AdminReportsTabProps) {
  const [filter, setFilter] = useState<"open" | "all" | "resolved" | "dismissed">("open");

  const filteredReports = reports.filter((r) => (filter === "all" ? true : r.status === filter));

  const downloadCsv = () => {
    const headers = ["ID", "Reporter", "Reported", "Reason", "Details", "Status", "Reported At"];
    const rows = filteredReports.map((r) => [
      r.id,
      r.reporterId,
      r.reportedId,
      REASON_LABELS[r.reason] || r.reason,
      r.details || "",
      r.status,
      new Date(r.createdAt).toLocaleString(),
    ]);
    const content = [headers.join(","), ...rows.map((row) => row.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "member-reports.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-2xs font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          {(["open", "all", "resolved", "dismissed"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === f
                  ? "bg-[#00875A] text-white shadow-xs"
                  : "bg-gray-100 text-slate-600 hover:bg-gray-200"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={downloadCsv}
          className="px-5 py-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
        >
          <Download className="w-4 h-4" /> Download CSV
        </button>
      </div>

      {filteredReports.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <Flag className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-bold text-slate-600">No member reports found</p>
          <p className="text-xs mt-1 text-slate-400">Submitted reports will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((r) => (
            <div key={r.id} className="bg-gray-50/70 border border-gray-100 rounded-2xl p-5 flex flex-col sm:flex-row items-start justify-between gap-4">
              <div>
                <span
                  className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase mb-2 ${
                    r.status === "open"
                      ? "bg-rose-50 text-rose-600"
                      : r.status === "resolved"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-gray-200 text-slate-600"
                  }`}
                >
                  {r.status}
                </span>

                <p className="text-sm font-bold text-slate-900">
                  Reported User: <span className="font-mono text-[#00875A]">{r.reportedId}</span>
                  <span className="text-slate-400 font-medium"> · Reporter ID: {r.reporterId}</span>
                </p>

                <p className="text-xs text-slate-700 mt-1 font-semibold">
                  Reason: {REASON_LABELS[r.reason] || r.reason}
                </p>

                {r.details && (
                  <p className="text-xs text-slate-500 mt-1 italic bg-white p-2.5 rounded-xl border border-gray-200/60 max-w-xl">
                    &ldquo;{r.details}&rdquo;
                  </p>
                )}

                <p className="text-[11px] text-slate-400 mt-2">
                  Reported at: {new Date(r.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                {r.status === "open" && (
                  <button
                    type="button"
                    disabled={busyId === `${r.reportedId}:suspend`}
                    onClick={() => onApplyMemberAction(r.reportedId, "suspend")}
                    className="px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {busyId === `${r.reportedId}:suspend` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                    Suspend Member
                  </button>
                )}

                <button
                  type="button"
                  disabled={busyId === r.id}
                  onClick={() => onActOnReport(r.id, "resolve")}
                  className="px-4 py-2 rounded-full bg-[#00875A] hover:bg-[#00754e] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-60 shadow-xs"
                >
                  {busyId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Resolve"}
                </button>

                {r.status === "open" && (
                  <button
                    type="button"
                    disabled={busyId === r.id}
                    onClick={() => onActOnReport(r.id, "dismiss")}
                    className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
