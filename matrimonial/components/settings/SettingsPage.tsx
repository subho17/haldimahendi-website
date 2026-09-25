"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/Global";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Settings, LogOut, Trash2, AlertTriangle, Mail, KeyRound } from "lucide-react";
import { useMounted } from "@/hooks/useMounted";

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const mounted = useMounted();

  if (!mounted || isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#d97706] border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deleteOtp, setDeleteOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleSendDeleteOtp = async () => {
    const email = (deleteEmail || user?.email || "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert("Enter a valid email"); return; }
    setOtpSending(true);
    try {
      const res = await fetch("/api/otp/send-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (data.success) { setOtpSent(true); setDeleteEmail(email); } else alert(data.message || "Failed to send OTP");
    } catch { alert("Failed to send OTP"); } finally { setOtpSending(false); }
  };

  const handleVerifyDeleteOtp = async () => {
    const email = (deleteEmail || user?.email || "").trim().toLowerCase();
    if (!deleteOtp.trim()) { alert("Enter OTP"); return; }
    setOtpVerifying(true);
    try {
      const res = await fetch("/api/otp/verify-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, otp: deleteOtp.trim() }) });
      const data = await res.json();
      if (data.success) setOtpVerified(true); else alert(data.message || "Invalid OTP");
    } catch { alert("Failed to verify OTP"); } finally { setOtpVerifying(false); }
  };

  const handleDeleteAccount = async () => {
    if (!otpVerified) { alert("Verify email OTP first"); return; }
    if (deleteConfirm !== "DELETE") return;
    const uid = user?.profileId || user?.mobileNumber || user?.email || "";
    if (!uid) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/auth/delete?userId=${encodeURIComponent(uid)}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        logout();
        router.push("/");
      } else {
        alert(data.message || "Failed to delete account");
      }
    } catch {
      alert("Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-lg mb-8">
          <div className="flex items-center gap-2 text-xs font-bold text-[#d97706] uppercase tracking-wider mb-2">
            <Settings className="w-4 h-4" />
            <span>Account & Privacy Settings</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6">
            Settings
          </h1>

          <div className="space-y-4 text-left">
            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Phone Number Privacy</h3>
                <p className="text-xs text-gray-500">Decide who can view your mobile number (+91 {user?.mobileNumber})</p>
              </div>
              <select className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800">
                <option>Only Verified Matches</option>
                <option>All Premium Members</option>
                <option>Hide From All</option>
              </select>
            </div>

            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Photo Privacy Settings</h3>
                <p className="text-xs text-gray-500">Control profile picture visibility</p>
              </div>
              <select className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800">
                <option>Visible to All Members</option>
                <option>Visible on Acceptance</option>
              </select>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <div className="p-5 bg-red-50 rounded-2xl border border-red-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-red-100 text-red-600"><AlertTriangle className="w-5 h-5" /></div>
                  <div className="flex-1">
                    <h3 className="font-bold text-red-900 text-sm">Danger Zone</h3>
                    <p className="text-xs text-red-700 mt-1">Permanently delete your account and all profile data. This cannot be undone.</p>
                    <button onClick={() => setShowDeleteModal(true)} className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer">
                      <Trash2 className="w-4 h-4" /> Delete My Account
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleLogout}
                className="w-full py-3.5 bg-red-50 text-red-600 font-bold text-sm rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 cursor-pointer border border-red-100"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout from Account</span>
              </button>
            </div>
          </div>

        </div>

      </main>

      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => { setShowDeleteModal(false); setOtpSent(false); setOtpVerified(false); }}>
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-red-600" /></div>
            <h3 className="text-lg font-extrabold text-slate-900 text-center">Delete Account?</h3>
            <p className="text-xs text-slate-500 text-center mt-2">Verify your email, then type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm. This deletes profile, photos, and matches.</p>

            {!otpVerified ? (
              <div className="mt-4 space-y-3">
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="email" value={deleteEmail || user?.email || ""} onChange={(e) => setDeleteEmail(e.target.value)} placeholder="Your email" className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-red-400 outline-none" />
                </div>
                {!otpSent ? (
                  <button onClick={handleSendDeleteOtp} disabled={otpSending} className="w-full py-2.5 bg-[#d97706] hover:bg-[#b45309] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer">
                    {otpSending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Mail className="w-4 h-4" /> Send Email OTP</>}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input type="text" value={deleteOtp} onChange={(e) => setDeleteOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Enter 4-digit OTP" className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-red-400 outline-none tracking-widest text-center" />
                    </div>
                    <button onClick={handleVerifyDeleteOtp} disabled={otpVerifying} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer">
                      {otpVerifying ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Verify OTP"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-bold text-center">✓ Email verified</div>
            )}

            <input type="text" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="Type DELETE" className="mt-3 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-red-400 outline-none" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setShowDeleteModal(false); setOtpSent(false); setOtpVerified(false); }} className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-xs hover:bg-slate-50 cursor-pointer">Cancel</button>
              <button onClick={handleDeleteAccount} disabled={!otpVerified || deleteConfirm !== "DELETE" || deleting} className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer">
                {deleting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Trash2 className="w-4 h-4" /> Confirm Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
