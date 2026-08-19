/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, ShieldAlert, Loader2, LogOut, BadgeCheck, Flag, X, Check } from "lucide-react";

interface AdminVerification {
  id: string;
  userId: string;
  idType: string;
  idNumber: string;
  selfieUrl?: string;
  documentUrl?: string;
  status: string;
  createdAt: string;
}

interface AdminReport {
  id: string;
  reporterId: string;
  reportedId: string;
  reason: string;
  details?: string;
  status: string;
  createdAt: string;
}

const REASON_LABELS: Record<string, string> = {
  fake_profile: "Fake / Misleading Profile",
  harassment: "Harassment / Abusive Behaviour",
  inappropriate_content: "Inappropriate Content",
  fraud_or_scam: "Fraud / Financial Scam",
  other: "Other",
};

export default function AdminDashboard() {
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);

  const [tab, setTab] = useState<"verifications" | "reports">("verifications");
  const [verifications, setVerifications] = useState<AdminVerification[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("shaadi_admin_key");
    if (stored) setTimeout(() => setAdminKey(stored), 0);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [verRes, repRes] = await Promise.all([
        fetch("/api/verification/review", { headers: { "x-admin-key": adminKey || "" } }),
        fetch("/api/admin/reports", { headers: { "x-admin-key": adminKey || "" } }),
      ]);
      const verData = await verRes.json();
      const repData = await repRes.json();
      if (verData.success) setVerifications(verData.verifications || []);
      if (repData.success) setReports(repData.reports || []);
    } catch (e) {
      console.error("Failed to load admin data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminKey) setTimeout(() => void loadData(), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminKey]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginBusy(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("shaadi_admin_key", data.key);
        setAdminKey(data.key);
        setPassword("");
      } else {
        setLoginError(data.message || "Invalid password.");
      }
    } catch (err) {
      console.error("Admin login failed:", err);
      setLoginError("Something went wrong. Please try again.");
    } finally {
      setLoginBusy(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("shaadi_admin_key");
    setAdminKey(null);
  };

  const actOnVerification = async (id: string, action: "approve" | "reject") => {
    setBusyId(id);
    try {
      const res = await fetch("/api/verification/review", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey || "" },
        body: JSON.stringify({ submissionId: id, action }),
      });
      const data = await res.json();
      if (data.success) setVerifications((v) => v.filter((x) => x.id !== id));
      else alert(data.message || "Failed to review verification.");
    } catch (e) {
      console.error(e);
      alert("Something went wrong.");
    } finally {
      setBusyId("");
    }
  };

  const actOnReport = async (id: string, action: "resolve" | "dismiss") => {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey || "" },
        body: JSON.stringify({ reportId: id, action }),
      });
      const data = await res.json();
      if (data.success) setReports((r) => r.filter((x) => x.id !== id));
      else alert(data.message || "Failed to review report.");
    } catch (e) {
      console.error(e);
      alert("Something went wrong.");
    } finally {
      setBusyId("");
    }
  };

  const idTypeLabel = (t: string) =>
    ({ aadhaar: "Aadhaar", pan: "PAN", passport: "Passport", driving_license: "Driving License", voter_id: "Voter ID" }[t] || t);

  // ---- Login gate ----
  if (!adminKey) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <form onSubmit={handleLogin} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10 max-w-sm w-full space-y-5">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#e53238]/10 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-7 h-7 text-[#e53238]" />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900">Admin Dashboard</h1>
            <p className="text-xs text-gray-500 mt-1">Enter the admin password to continue.</p>
          </div>
          {loginError && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:border-[#e53238] outline-hidden transition-all"
          />
          <button
            type="submit"
            disabled={loginBusy || !password}
            className="w-full bg-[#e53238] hover:bg-[#c92429] text-white font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loginBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Login
          </button>
          <p className="text-center text-[11px] text-gray-400">
            Dev default: <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">shaadi-admin-dev</code> · set <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">ADMIN_KEY</code> in production
          </p>
        </form>
      </div>
    );
  }

  const openVerifications = verifications.filter((v) => v.status === "pending");
  const openReports = reports.filter((r) => r.status === "open");

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="bg-[#e53238] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-extrabold">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-lg">Admin Dashboard</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => setTab("verifications")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${tab === "verifications" ? "bg-[#e53238] text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"}`}
          >
            Verification Requests {openVerifications.length > 0 && `(${openVerifications.length})`}
          </button>
          <button
            type="button"
            onClick={() => setTab("reports")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${tab === "reports" ? "bg-[#e53238] text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"}`}
          >
            Member Reports {openReports.length > 0 && `(${openReports.length})`}
          </button>
          {loading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin ml-auto" />}
        </div>

        {tab === "verifications" && (
          <div className="space-y-3">
            {verifications.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400">
                <BadgeCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="font-bold text-slate-500">No verification requests</p>
                <p className="text-xs mt-0.5">New submissions will appear here.</p>
              </div>
            ) : (
              verifications.map((v) => (
                <div key={v.id} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex gap-4">
                      {v.selfieUrl && (
                        <img src={v.selfieUrl} alt="Selfie" className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-extrabold text-slate-900">ID: <span className="font-mono text-[#e53238]">{v.userId}</span></p>
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                          {idTypeLabel(v.idType)} · <span className="font-mono">{v.idNumber}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{new Date(v.createdAt).toLocaleString()}</p>
                        {v.documentUrl && (
                          <a href={v.documentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-[#e53238] hover:underline">
                            View ID document
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={busyId === v.id}
                        onClick={() => actOnVerification(v.id, "approve")}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                      >
                        {busyId === v.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={busyId === v.id}
                        onClick={() => actOnVerification(v.id, "reject")}
                        className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                      >
                        {busyId === v.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "reports" && (
          <div className="space-y-3">
            {reports.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400">
                <Flag className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="font-bold text-slate-500">No reports</p>
                <p className="text-xs mt-0.5">Member reports will appear here.</p>
              </div>
            ) : (
              reports.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase mb-2 ${r.status === "open" ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500"}`}>
                        {r.status}
                      </span>
                      <p className="text-sm font-extrabold text-slate-900">
                        Reported: <span className="font-mono text-[#e53238]">{r.reportedId}</span>
                        <span className="text-slate-400 font-medium"> · by {r.reporterId}</span>
                      </p>
                      <p className="text-xs text-slate-600 mt-1 font-medium">{REASON_LABELS[r.reason] || r.reason}</p>
                      {r.details && <p className="text-xs text-slate-500 mt-1 italic">&ldquo;{r.details}&rdquo;</p>}
                      <p className="text-[11px] text-slate-400 mt-1">{new Date(r.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={busyId === r.id}
                        onClick={() => actOnReport(r.id, "resolve")}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
                      >
                        {busyId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Resolve"}
                      </button>
                      <button
                        type="button"
                        disabled={busyId === r.id}
                        onClick={() => actOnReport(r.id, "dismiss")}
                        className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}