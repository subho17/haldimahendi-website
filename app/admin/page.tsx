/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, ShieldAlert, Loader2, LogOut, BadgeCheck, Flag, X, Check, Users, LayoutDashboard, Crown, Ban, UserCheck, TrendingUp, Download, Sparkles } from "lucide-react";

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

interface AdminStats {
  totalMembers: number;
  verifiedMembers: number;
  premiumMembers: number;
  suspendedMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  newThisMonth: number;
  pendingVerifications: number;
  openReports: number;
}

interface AdminMember {
  id: string;
  name: string;
  mobile: string;
  email: string;
  avatarUrl: string;
  gender?: string;
  city?: string;
  age?: number;
  provider?: string;
  verified: boolean;
  membership: string;
  isPremium: boolean;
  isSuspended: boolean;
  lastActive?: string;
  isActive: boolean;
  createdAt: string;
}

interface AdminAnalytics {
  signupsByMonth: { label: string; count: number }[];
  genderSplit: { label: string; count: number }[];
  topCities: { label: string; count: number }[];
  ageBuckets: { label: string; count: number }[];
  activeMembers: number;
  inactiveMembers: number;
  newThisMonth: number;
  premiumConversionRate: number;
}

const EMPTY_STATS: AdminStats = {
  totalMembers: 0,
  verifiedMembers: 0,
  premiumMembers: 0,
  suspendedMembers: 0,
  activeMembers: 0,
  inactiveMembers: 0,
  newThisMonth: 0,
  pendingVerifications: 0,
  openReports: 0,
};

const EMPTY_ANALYTICS: AdminAnalytics = {
  signupsByMonth: [],
  genderSplit: [],
  topCities: [],
  ageBuckets: [],
  activeMembers: 0,
  inactiveMembers: 0,
  newThisMonth: 0,
  premiumConversionRate: 0,
};

const PLAN_OPTIONS = [
  { id: "premium", label: "Premium · ₹999 / 90 days" },
  { id: "premium_plus", label: "Premium Plus · ₹2,499 / 365 days" },
  { id: "free", label: "Free (revoke membership)" },
];

export default function AdminDashboard() {
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);

  const [tab, setTab] = useState<"dashboard" | "analytics" | "verifications" | "reports" | "members">("dashboard");
  const [verifications, setVerifications] = useState<AdminVerification[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [stats, setStats] = useState<AdminStats>(EMPTY_STATS);
  const [analytics, setAnalytics] = useState<AdminAnalytics>(EMPTY_ANALYTICS);
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [memberQuery, setMemberQuery] = useState("");
  const [memberFilter, setMemberFilter] = useState<"all" | "active" | "inactive" | "suspended">("all");
  const [reportFilter, setReportFilter] = useState<"open" | "all" | "resolved" | "dismissed">("open");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [planId, setPlanId] = useState<Record<string, string>>({});

  useEffect(() => {
    const stored = localStorage.getItem("shaadi_admin_key");
    if (stored) setTimeout(() => setAdminKey(stored), 0);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [verRes, repRes, statRes, memRes, anaRes] = await Promise.all([
        fetch("/api/verification/review", { headers: { "x-admin-key": adminKey || "" } }),
        fetch("/api/admin/reports", { headers: { "x-admin-key": adminKey || "" } }),
        fetch("/api/admin/stats", { headers: { "x-admin-key": adminKey || "" } }),
        fetch("/api/admin/members", { headers: { "x-admin-key": adminKey || "" } }),
        fetch("/api/admin/analytics", { headers: { "x-admin-key": adminKey || "" } }),
      ]);
      const verData = await verRes.json();
      const repData = await repRes.json();
      const statData = await statRes.json();
      const memData = await memRes.json();
      const anaData = await anaRes.json();
      if (verData.success) setVerifications(verData.verifications || []);
      if (repData.success) setReports(repData.reports || []);
      if (statData.success) setStats(statData.stats || EMPTY_STATS);
      if (memData.success) setMembers(memData.members || []);
      if (anaData.success) setAnalytics(anaData.analytics || EMPTY_ANALYTICS);
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

  const applyMemberAction = async (id: string, action: "suspend" | "activate" | "block" | "unblock", targetId?: string) => {
    setBusyId(`${id}:${action}`);
    try {
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey || "" },
        body: JSON.stringify({ action, userId: id, targetId }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to apply action.");
        return;
      }
      setMembers((ms) =>
        ms.map((m) => {
          if (action === "suspend") return m.id === id ? { ...m, isSuspended: true } : m;
          if (action === "activate") return m.id === id ? { ...m, isSuspended: false } : m;
          return m;
        })
      );
      setStats((s) => {
        if (action === "suspend") return { ...s, suspendedMembers: s.suspendedMembers + 1 };
        if (action === "activate") return { ...s, suspendedMembers: Math.max(0, s.suspendedMembers - 1) };
        return s;
      });
      alert(`${action === "suspend" ? "Suspended" : action === "activate" ? "Activated" : action} member.`);
    } catch (e) {
      console.error(e);
      alert("Something went wrong.");
    } finally {
      setBusyId("");
    }
  };

  const grantMembership = async (id: string) => {
    const chosen = planId[id];
    if (!chosen) {
      alert("Select a plan first.");
      return;
    }
    setBusyId(`mem:${id}`);
    try {
      const res = await fetch("/api/admin/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey || "" },
        body: JSON.stringify({ userId: id, planId: chosen }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to update membership.");
        return;
      }
      const tier = chosen === "free" ? "Free" : chosen === "premium_plus" ? "Premium Plus" : "Premium";
      setMembers((ms) => ms.map((m) => (m.id === id ? { ...m, membership: tier, isPremium: chosen !== "free" } : m)));
      setStats((s) => {
        const prev = members.find((m) => m.id === id);
        if (prev?.isPremium === true && chosen === "free") return { ...s, premiumMembers: Math.max(0, s.premiumMembers - 1) };
        if (prev?.isPremium !== true && chosen !== "free") return { ...s, premiumMembers: s.premiumMembers + 1 };
        return s;
      });
      alert(`Membership updated to ${tier}.`);
    } catch (e) {
      console.error(e);
      alert("Something went wrong.");
    } finally {
      setBusyId("");
    }
  };

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
  const filteredReports = reports.filter((r) => (reportFilter === "all" ? true : r.status === reportFilter));

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
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <button
            type="button"
            onClick={() => setTab("dashboard")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${tab === "dashboard" ? "bg-[#e53238] text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"}`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
          </button>
          <button
            type="button"
            onClick={() => setTab("analytics")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${tab === "analytics" ? "bg-[#e53238] text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"}`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Analytics
          </button>
          <button
            type="button"
            onClick={() => setTab("members")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${tab === "members" ? "bg-[#e53238] text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"}`}
          >
            <Users className="w-3.5 h-3.5" /> Members ({stats.totalMembers})
          </button>
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

        {tab === "dashboard" && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
              <StatCard icon={<Users className="w-5 h-5" />} label="Total Members" value={stats.totalMembers} color="text-blue-600 bg-blue-50" />
              <StatCard icon={<UserCheck className="w-5 h-5" />} label="Active" value={stats.activeMembers} color="text-emerald-600 bg-emerald-50" />
              <StatCard icon={<Ban className="w-5 h-5" />} label="Inactive" value={stats.inactiveMembers} color="text-slate-600 bg-slate-50" />
              <StatCard icon={<Sparkles className="w-5 h-5" />} label="New This Month" value={stats.newThisMonth} color="text-cyan-600 bg-cyan-50" />
              <StatCard icon={<BadgeCheck className="w-5 h-5" />} label="Verified" value={stats.verifiedMembers} color="text-emerald-600 bg-emerald-50" />
              <StatCard icon={<Crown className="w-5 h-5" />} label="Premium" value={stats.premiumMembers} color="text-amber-600 bg-amber-50" />
              <StatCard icon={<Flag className="w-5 h-5" />} label="Open Reports" value={stats.openReports} color="text-red-600 bg-red-50" />
              <StatCard icon={<ShieldAlert className="w-5 h-5" />} label="Suspended" value={stats.suspendedMembers} color="text-rose-600 bg-rose-50" />
              <StatCard icon={<ShieldCheck className="w-5 h-5" />} label="Pending Verifications" value={stats.pendingVerifications} color="text-violet-600 bg-violet-50" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2"><Crown className="w-4 h-4 text-amber-500" /> Membership Breakdown</h3>
                <div className="space-y-3">
                  <Bar label="Free" value={Math.max(0, stats.totalMembers - stats.premiumMembers)} total={stats.totalMembers} color="bg-slate-300" />
                  <Bar label="Premium" value={stats.premiumMembers} total={stats.totalMembers} color="bg-amber-400" />
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Trust & Safety</h3>
                <div className="space-y-3">
                  <Bar label="Verified members" value={stats.verifiedMembers} total={stats.totalMembers} color="bg-emerald-400" />
                  <Bar label="Suspended accounts" value={stats.suspendedMembers} total={stats.totalMembers} color="bg-rose-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "members" && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-3">
              <input
                value={memberQuery}
                onChange={(e) => setMemberQuery(e.target.value)}
                placeholder="Search by name, ID, mobile, email or city…"
                className="flex-1 w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:border-[#e53238] outline-hidden transition-all"
              />
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  fetch(`/api/admin/members?q=${encodeURIComponent(memberQuery)}`, { headers: { "x-admin-key": adminKey || "" } })
                    .then((r) => r.json())
                    .then((d) => {
                      if (d.success) setMembers(d.members || []);
                    })
                    .catch((e) => console.error(e))
                    .finally(() => setLoading(false));
                }}
                className="px-5 py-2.5 rounded-xl bg-[#e53238] hover:bg-[#c92429] text-white text-sm font-bold transition-colors cursor-pointer"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => downloadCsv(
                  "members.csv",
                  ["ID", "Name", "Mobile", "Email", "Gender", "City", "Age", "Verified", "Membership", "Status", "Last Active", "Joined"],
                  members.map((m) => [m.id, m.name, m.mobile, m.email, m.gender || "", m.city || "", m.age ?? "", m.verified ? "Yes" : "No", m.membership, m.isSuspended ? "Suspended" : m.isActive ? "Active" : "Inactive", m.lastActive ? new Date(m.lastActive).toLocaleString() : "", m.createdAt ? new Date(m.createdAt).toLocaleDateString() : ""])
                )}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-sm font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {(["all", "active", "inactive", "suspended"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setMemberFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${memberFilter === f ? "bg-[#e53238] text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"}`}
                >
                  {f === "all" ? "All" : f === "active" ? "Active" : f === "inactive" ? "Inactive" : "Suspended"}
                </button>
              ))}
            </div>

            {members.filter((m) =>
              memberFilter === "all" ? true :
              memberFilter === "active" ? m.isActive && !m.isSuspended :
              memberFilter === "inactive" ? !m.isActive :
              m.isSuspended
            ).length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="font-bold text-slate-500">No members found</p>
                <p className="text-xs mt-0.5">Adjust the search or check back later.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
                {members
                  .filter((m) =>
                    memberFilter === "all" ? true :
                    memberFilter === "active" ? m.isActive && !m.isSuspended :
                    memberFilter === "inactive" ? !m.isActive :
                    m.isSuspended
                  )
                  .map((m) => (
                  <div key={m.id} className="p-4 flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <img src={m.avatarUrl} alt={m.name} className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-slate-900 truncate flex items-center gap-1.5">
                          {m.name}
                          {m.verified && <BadgeCheck className="w-4 h-4 text-emerald-500 shrink-0" />}
                          {m.isPremium && <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                          {m.isSuspended && <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono truncate">{m.id}</p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {m.mobile || m.email || "—"} {m.city ? ` · ${m.city}` : ""}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${m.isSuspended ? "bg-rose-50 text-rose-600" : m.isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                            {m.isSuspended ? <Ban className="w-3 h-3" /> : m.isActive ? <UserCheck className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                            {m.isSuspended ? "Suspended" : m.isActive ? "Active" : "Inactive"}
                          </span>
                          {m.lastActive && (
                            <span className="text-[10px] text-slate-400">Last active {new Date(m.lastActive).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${m.isPremium ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500"}`}>
                        {m.membership}
                      </span>
                      <select
                        value={planId[m.id] || ""}
                        onChange={(e) => setPlanId((p) => ({ ...p, [m.id]: e.target.value }))}
                        className="px-2.5 py-2 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-700 bg-white outline-hidden"
                      >
                        <option value="">Set plan…</option>
                        {PLAN_OPTIONS.map((p) => (
                          <option key={p.id} value={p.id}>{p.label}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={busyId === `mem:${m.id}`}
                        onClick={() => grantMembership(m.id)}
                        className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1"
                      >
                        {busyId === `mem:${m.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Crown className="w-3.5 h-3.5" />}
                        Apply
                      </button>
                      <button
                        type="button"
                        disabled={busyId === `${m.id}:suspend` || busyId === `${m.id}:activate`}
                        onClick={() => applyMemberAction(m.id, m.isSuspended ? "activate" : "suspend")}
                        className={`px-3 py-2 rounded-lg text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1 ${m.isSuspended ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-rose-50 hover:bg-rose-100 text-rose-600"}`}
                      >
                        {busyId === `${m.id}:suspend` || busyId === `${m.id}:activate` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : m.isSuspended ? <UserCheck className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                        {m.isSuspended ? "Activate" : "Suspend"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "analytics" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon={<UserCheck className="w-5 h-5" />} label="Active Members" value={analytics.activeMembers} color="text-emerald-600 bg-emerald-50" />
              <StatCard icon={<Ban className="w-5 h-5" />} label="Inactive Members" value={analytics.inactiveMembers} color="text-slate-600 bg-slate-50" />
              <StatCard icon={<Sparkles className="w-5 h-5" />} label="New This Month" value={analytics.newThisMonth} color="text-cyan-600 bg-cyan-50" />
              <StatCard icon={<Crown className="w-5 h-5" />} label="Premium Conversion" value={analytics.premiumConversionRate} suffix="%" color="text-amber-600 bg-amber-50" />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-sm font-extrabold text-slate-900 mb-4">Signups (last 6 months)</h3>
              <HBarChart data={analytics.signupsByMonth} color="bg-[#e53238]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="text-sm font-extrabold text-slate-900 mb-4">Gender Split</h3>
                <HBarChart data={analytics.genderSplit} color="bg-blue-400" />
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="text-sm font-extrabold text-slate-900 mb-4">Age Distribution</h3>
                <HBarChart data={analytics.ageBuckets} color="bg-violet-400" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-sm font-extrabold text-slate-900 mb-4">Top Cities</h3>
              <HBarChart data={analytics.topCities} color="bg-teal-400" />
            </div>
          </div>
        )}

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
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                {(["open", "all", "resolved", "dismissed"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setReportFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${reportFilter === f ? "bg-[#e53238] text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"}`}
                  >
                    {f === "open" ? "Open" : f === "all" ? "All" : f === "resolved" ? "Resolved" : "Dismissed"}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => downloadCsv(
                  "member-reports.csv",
                  ["ID", "Reporter", "Reported", "Reason", "Details", "Status", "Reported At"],
                  filteredReports.map((r) => [r.id, r.reporterId, r.reportedId, REASON_LABELS[r.reason] || r.reason, r.details || "", r.status, new Date(r.createdAt).toLocaleString()])
                )}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-sm font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Download CSV
              </button>
            </div>

            {filteredReports.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400">
                <Flag className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="font-bold text-slate-500">No reports</p>
                <p className="text-xs mt-0.5">Member reports will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReports.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase mb-2 ${r.status === "open" ? "bg-red-50 text-red-600" : r.status === "resolved" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
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
                    <div className="flex items-center gap-2 flex-wrap">
                      {r.status === "open" && (
                        <button
                          type="button"
                          disabled={busyId === `${r.reportedId}:suspend`}
                          onClick={() => applyMemberAction(r.reportedId, "suspend")}
                          className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                        >
                          {busyId === `${r.reportedId}:suspend` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                          Suspend Member
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={busyId === r.id}
                        onClick={() => actOnReport(r.id, "resolve")}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
                      >
                        {busyId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Resolve"}
                      </button>
                      {r.status === "open" && (
                        <button
                          type="button"
                          disabled={busyId === r.id}
                          onClick={() => actOnReport(r.id, "dismiss")}
                          className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color, suffix }: { icon: React.ReactNode; label: string; value: number; color: string; suffix?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>{icon}</div>
      <p className="text-2xl font-extrabold text-slate-900">{value}{suffix}</p>
      <p className="text-[11px] font-bold text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function Bar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
        <span>{label}</span>
        <span className="text-slate-400">{value} ({pct}%)</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${Math.max(2, pct)}%` }} />
      </div>
    </div>
  );
}

function HBarChart({ data, color }: { data: { label: string; count: number }[]; color: string }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  if (data.length === 0) {
    return <p className="text-xs text-slate-400 text-center py-6">No data yet.</p>;
  }
  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-24 shrink-0 text-[11px] font-bold text-slate-600 truncate">{d.label}</span>
          <div className="flex-1 h-4 rounded-full bg-slate-100 overflow-hidden">
            <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${Math.max(3, (d.count / max) * 100)}%` }} />
          </div>
          <span className="w-10 shrink-0 text-right text-[11px] font-extrabold text-slate-700">{d.count}</span>
        </div>
      ))}
    </div>
  );
}

function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const content = [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}