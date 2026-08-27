"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, ShieldAlert, Loader2, BadgeCheck, Upload, Camera, IdCard, CheckCircle2, X } from "lucide-react";

type VerStatus = "none" | "pending" | "approved" | "rejected";

interface VerificationCardProps {
  userId: string;
}

const ID_TYPES = [
  { value: "aadhaar", label: "Aadhaar Card" },
  { value: "pan", label: "PAN Card" },
  { value: "passport", label: "Passport" },
  { value: "driving_license", label: "Driving License" },
  { value: "voter_id", label: "Voter ID" },
];

export default function VerificationCard({ userId }: VerificationCardProps) {
  const [status, setStatus] = useState<VerStatus>("none");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [selfie, setSelfie] = useState<File | null>(null);
  const [document, setDocument] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/verification?userId=${encodeURIComponent(userId)}`);
        const data = await res.json();
        if (!cancelled && data.success) {
          setStatus(
            data.verified ? "approved" : data.submission ? (data.submission.status as VerStatus) : "none"
          );
        }
      } catch (e) {
        console.error("Failed to load verification status:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idType || idNumber.trim().length < 4 || !selfie || !document) {
      setError("Please fill in all fields and upload both a selfie and an ID document.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const form = new FormData();
      form.append("userId", userId);
      form.append("idType", idType);
      form.append("idNumber", idNumber.trim());
      form.append("selfie", selfie);
      form.append("document", document);
      const res = await fetch("/api/verification", { method: "POST", body: form });
      const data = await res.json();
      if (data.success) {
        setStatus("pending");
        setShowForm(false);
        setDone(true);
      } else {
        setError(data.message || "Failed to submit verification.");
      }
    } catch (err) {
      console.error("Verification submit failed:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const statusBadge = () => {
    if (status === "approved")
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200/80">
          <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Member
        </span>
      );
    if (status === "pending")
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200/80">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Verification in Progress
        </span>
      );
    if (status === "rejected")
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 font-bold text-xs border border-red-200/80">
          <X className="w-3.5 h-3.5 text-red-600" /> Verification Rejected
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-xs">
        <ShieldCheck className="w-3.5 h-3.5 text-slate-500" /> Not Verified
      </span>
    );
  };

  return (
    <div className="my-6 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">Trust & Verification</h3>
            <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm">
              Verified members build more trust. Submit a clear selfie and an ID document to get the Verified badge.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 text-gray-400 animate-spin" /> : statusBadge()}
          {status === "none" || status === "rejected" ? (
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="px-3.5 py-2 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              {showForm ? "Cancel" : "Get Verified"}
            </button>
          ) : null}
        </div>
      </div>

      {done && (
        <div className="mt-4 flex items-center justify-between bg-emerald-50 text-emerald-800 px-4 py-3 rounded-xl border border-emerald-200/80">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Verification submitted. Our team will review it shortly.
          </div>
          <button type="button" onClick={() => setDone(false)} className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {showForm && status !== "approved" && (
        <form onSubmit={submit} className="mt-5 pt-5 border-t border-slate-100 space-y-4 animate-in fade-in duration-200">
          {error && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">ID Type *</label>
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-[#d97706] outline-hidden transition-all cursor-pointer"
              >
                <option value="">Select ID type...</option>
                {ID_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">ID Number *</label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="Enter your ID number"
                maxLength={50}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-[#d97706] outline-hidden transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1.5 cursor-pointer">
              <span className="text-xs font-bold text-slate-700 block flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[#d97706]" /> Clear Selfie *
              </span>
              <input type="file" accept="image/*" onChange={(e) => setSelfie(e.target.files?.[0] || null)} className="hidden" />
              <span className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${selfie ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-dashed border-slate-300 text-slate-500 hover:border-[#d97706]"}`}>
                {selfie ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Upload className="w-4 h-4" />}
                {selfie ? selfie.name.slice(0, 28) : "Choose selfie image"}
              </span>
            </label>
            <label className="space-y-1.5 cursor-pointer">
              <span className="text-xs font-bold text-slate-700 block flex items-center gap-1.5">
                <IdCard className="w-3.5 h-3.5 text-[#d97706]" /> ID Document (photo) *
              </span>
              <input type="file" accept="image/*" onChange={(e) => setDocument(e.target.files?.[0] || null)} className="hidden" />
              <span className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${document ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-dashed border-slate-300 text-slate-500 hover:border-[#d97706]"}`}>
                {document ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Upload className="w-4 h-4" />}
                {document ? document.name.slice(0, 28) : "Choose ID document image"}
              </span>
            </label>
          </div>

          <p className="text-[11px] text-slate-400 font-medium">
            Your documents are used only for identity verification and are never shown on your profile.
          </p>

          <button
            type="submit"
            disabled={busy}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {busy ? "Submitting..." : "Submit for Verification"}
          </button>
        </form>
      )}
    </div>
  );
}
