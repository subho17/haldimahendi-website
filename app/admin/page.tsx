"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";

import AdminHeader from "@/components/adminpage/AdminHeader";
import AdminSidebar from "@/components/adminpage/AdminSidebar";
import AdminSubHeader from "@/components/adminpage/AdminSubHeader";
import AdminCreditCard from "@/components/adminpage/AdminCreditCard";
import AdminEngagementChart from "@/components/adminpage/AdminEngagementChart";
import AdminHistoryTable, { PaymentHistoryItem } from "@/components/adminpage/AdminHistoryTable";
import AdminBalanceCard from "@/components/adminpage/AdminBalanceCard";
import AdminCreditStatCard from "@/components/adminpage/AdminCreditStatCard";
import AdminDashboardAnalytics from "@/components/adminpage/AdminDashboardAnalytics";
import AdminModals from "@/components/adminpage/AdminModals";
import AdminMembersTab, { AdminMember } from "@/components/adminpage/AdminMembersTab";
import AdminVerificationsTab, { AdminVerification } from "@/components/adminpage/AdminVerificationsTab";
import AdminReportsTab, { AdminReport } from "@/components/adminpage/AdminReportsTab";
import AdminAnalyticsTab, { AdminAnalytics } from "@/components/adminpage/AdminAnalyticsTab";
import AdminCouponsTab, { AdminCoupon } from "@/components/adminpage/AdminCouponsTab";

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

export default function AdminDashboardPage() {
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);

  const [tab, setTab] = useState<"dashboard" | "analytics" | "verifications" | "reports" | "members" | "coupons">("dashboard");
  const [verifications, setVerifications] = useState<AdminVerification[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalytics>(EMPTY_ANALYTICS);
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState("");

  // Interactive Modal System State
  const [activeModal, setActiveModal] = useState<"add_wallet" | "send_money" | "receive_money" | "transaction_detail" | "recipients_list" | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentHistoryItem | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("shaadi_admin_key");
    if (stored) setTimeout(() => setAdminKey(stored), 0);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [verRes, repRes, memRes, anaRes, couRes] = await Promise.all([
        fetch("/api/verification/review", { headers: { "x-admin-key": adminKey || "" } }),
        fetch("/api/admin/reports", { headers: { "x-admin-key": adminKey || "" } }),
        fetch("/api/admin/members", { headers: { "x-admin-key": adminKey || "" } }),
        fetch("/api/admin/analytics", { headers: { "x-admin-key": adminKey || "" } }),
        fetch("/api/admin/coupons", { headers: { "x-admin-key": adminKey || "" } }),
      ]);
      const verData = await verRes.json();
      const repData = await repRes.json();
      const memData = await memRes.json();
      const anaData = await anaRes.json();
      const couData = await couRes.json();
      if (verData.success) setVerifications(verData.verifications || []);
      if (repData.success) setReports(repData.reports || []);
      if (memData.success) setMembers(memData.members || []);
      if (anaData.success) setAnalytics(anaData.analytics || EMPTY_ANALYTICS);
      if (couData.success) setCoupons(couData.coupons || []);
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
    } catch (e) {
      console.error(e);
      alert("Something went wrong.");
    } finally {
      setBusyId("");
    }
  };

  const searchMembers = async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/members?q=${encodeURIComponent(q)}`, {
        headers: { "x-admin-key": adminKey || "" },
      });
      const data = await res.json();
      if (data.success) setMembers(data.members || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const grantMembership = async (id: string, planId: string) => {
    if (!planId) return;
    setBusyId(`mem:${id}`);
    try {
      const res = await fetch("/api/admin/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey || "" },
        body: JSON.stringify({ userId: id, planId }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to update membership.");
        return;
      }
      const tier = planId === "free" ? "Free" : planId === "premium_plus" ? "Premium Plus" : "Premium";
      setMembers((ms) => ms.map((m) => (m.id === id ? { ...m, membership: tier, isPremium: planId !== "free" } : m)));
    } catch (e) {
      console.error(e);
      alert("Something went wrong.");
    } finally {
      setBusyId("");
    }
  };

  const createCoupon = async (data: Omit<AdminCoupon, "id" | "usedCount" | "createdAt">) => {
    setBusyId("coupon:create");
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey || "" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message || "Failed to create coupon");
      setCoupons((cs) => [result.coupon, ...cs]);
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      setBusyId("");
    }
  };

  const updateCoupon = async (id: string, data: Partial<AdminCoupon>) => {
    setBusyId(`coupon:${id}`);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey || "" },
        body: JSON.stringify({ id, ...data }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message || "Failed to update coupon");
      setCoupons((cs) => cs.map((c) => (c.id === id ? result.coupon : c)));
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      setBusyId("");
    }
  };

  const deleteCoupon = async (id: string) => {
    setBusyId(`coupon:${id}`);
    try {
      const res = await fetch(`/api/admin/coupons?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { "x-admin-key": adminKey || "" },
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message || "Failed to delete coupon");
      setCoupons((cs) => cs.filter((c) => c.id !== id));
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      setBusyId("");
    }
  };

  // Login Gate View
  if (!adminKey) {
    return (
      <div className="min-h-screen bg-[#ECEFEF] flex items-center justify-center p-4 font-sans">
        <form onSubmit={handleLogin} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10 max-w-sm w-full space-y-5">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#00875A]/10 flex items-center justify-center mx-auto mb-4 text-[#00875A]">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-800">Quixotic Admin</h1>
            <p className="text-xs text-slate-500 mt-1">Enter your admin password to continue.</p>
          </div>

          {loginError && (
            <div className="bg-rose-50 text-rose-600 text-xs p-3.5 rounded-2xl flex items-center gap-2 border border-rose-100 font-semibold">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-[#00875A] outline-hidden transition-all"
          />

          <button
            type="submit"
            disabled={loginBusy || !password}
            className="w-full bg-[#00875A] hover:bg-[#00754e] text-white font-bold py-3.5 rounded-2xl text-sm transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-[#00875A]/20"
          >
            {loginBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Login to Admin Panel
          </button>
        </form>
      </div>
    );
  }

  const openVerificationsCount = verifications.filter((v) => v.status === "pending").length;
  const openReportsCount = reports.filter((r) => r.status === "open").length;

  return (
    <div className="min-h-screen bg-[#ECEFEF] text-slate-800 font-sans p-4 sm:p-6">
      {/* Modal Dialog System */}
      <AdminModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        selectedTransaction={selectedTransaction}
      />

      <div className="max-w-[1440px] mx-auto flex gap-6">
        {/* Left Vertical Icon Dock Sidebar */}
        <AdminSidebar activeTab={tab} setActiveTab={setTab} onLogout={handleLogout} />

        {/* Main Content Workspace Area */}
        <div className="flex-1 min-w-0">
          {/* Top Navbar Header */}
          <AdminHeader
            activeTab={tab}
            setActiveTab={setTab}
            openReportsCount={openReportsCount}
            openVerificationsCount={openVerificationsCount}
            onLogout={handleLogout}
          />

          {/* SubHeader Title & Controls */}
          <AdminSubHeader
            adminName="Sujon"
            onOpenAddWallet={() => setActiveModal("add_wallet")}
          />

          {loading && (
            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-[#00875A]">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading data...
            </div>
          )}

          {/* Main Dashboard Layout Grid */}
          {tab === "dashboard" && (
            <div>
              {/* Financial & Engagement Cards Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Column 1: Payment Goal Card + Payment History Table */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  <AdminCreditCard
                    totalGoal="$ 78,989.09"
                    cardNumber="**** 909090"
                    expiry="EXP 09/26"
                    weeklyRevenue="+3,945 USD"
                    revenueIncrease="+12.8%"
                  />
                  <AdminHistoryTable
                    onSelectTransaction={(txn) => {
                      setSelectedTransaction(txn);
                      setActiveModal("transaction_detail");
                    }}
                  />
                </div>

                {/* Column 2: Engagement Rate Chart */}
                <div className="lg:col-span-5">
                  <AdminEngagementChart />
                </div>

                {/* Column 3: Total Balance Line Chart + Amount of Credit Stat */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                  <AdminBalanceCard
                    balance="$32,678.90"
                    onSendMoney={() => setActiveModal("send_money")}
                    onReceiveMoney={() => setActiveModal("receive_money")}
                  />
                  <AdminCreditStatCard
                    creditAmount="$8,945.89"
                    creditGrowth="+12.8%"
                    onOpenRecipients={() => setActiveModal("recipients_list")}
                  />
                </div>
              </div>

              {/* Graphical Analytics Displayed Directly on Dashboard */}
              <AdminDashboardAnalytics analytics={analytics} />
            </div>
          )}

          {/* Members Tab */}
          {tab === "members" && (
            <AdminMembersTab
              members={members}
              onSearch={searchMembers}
              onApplyAction={applyMemberAction}
              onGrantMembership={grantMembership}
              busyId={busyId}
            />
          )}

          {/* Verifications Tab */}
          {tab === "verifications" && (
            <AdminVerificationsTab
              verifications={verifications}
              onReview={actOnVerification}
              busyId={busyId}
            />
          )}

          {/* Reports Tab */}
          {tab === "reports" && (
            <AdminReportsTab
              reports={reports}
              onActOnReport={actOnReport}
              onApplyMemberAction={applyMemberAction}
              busyId={busyId}
            />
          )}

          {/* Analytics Tab */}
          {tab === "analytics" && (
            <AdminAnalyticsTab analytics={analytics} />
          )}

          {/* Coupons Tab */}
          {tab === "coupons" && (
            <AdminCouponsTab
              coupons={coupons}
              onCreate={createCoupon}
              onUpdate={updateCoupon}
              onDelete={deleteCoupon}
              busyId={busyId}
            />
          )}
        </div>
      </div>
    </div>
  );
}