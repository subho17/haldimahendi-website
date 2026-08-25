"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Loader2, Plus, Edit, Trash2, X, Check, Tag } from "lucide-react";

export interface AdminCoupon {
  id: string;
  code: string;
  discountType: "percent" | "flat";
  discountValue: number;
  applicablePlans: string[];
  maxUses: number;
  usedCount: number;
  perUserLimit: number;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  description?: string;
}

interface AdminCouponsTabProps {
  coupons: AdminCoupon[];
  onCreate: (data: Omit<AdminCoupon, "id" | "usedCount" | "createdAt">) => Promise<void>;
  onUpdate: (id: string, data: Partial<AdminCoupon>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  busyId: string;
}

const PLAN_OPTIONS = [
  { id: "free", label: "Free" },
  { id: "premium", label: "Premium (₹999/90d)" },
  { id: "premium_plus", label: "Premium Plus (₹2,499/365d)" },
];

export default function AdminCouponsTab({
  coupons,
  onCreate,
  onUpdate,
  onDelete,
  busyId,
}: AdminCouponsTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AdminCoupon | null>(null);
  const defaultStartsAt = useMemo(() => new Date().toISOString().slice(0, 16), []);
  const defaultExpiresAt = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 16);
  }, []);

  const [form, setForm] = useState({
    code: "",
    discountType: "percent" as "percent" | "flat",
    discountValue: "",
    applicablePlans: [] as string[],
    maxUses: 100,
    perUserLimit: 1,
    startsAt: defaultStartsAt,
    expiresAt: defaultExpiresAt,
    isActive: true,
    description: "",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (editing) {
        setForm({
          code: editing.code,
          discountType: editing.discountType,
          discountValue: String(editing.discountValue),
          applicablePlans: editing.applicablePlans,
          maxUses: editing.maxUses,
          perUserLimit: editing.perUserLimit,
          startsAt: editing.startsAt.slice(0, 16),
          expiresAt: editing.expiresAt.slice(0, 16),
          isActive: editing.isActive,
          description: editing.description || "",
        });
      } else {
        setForm({
          code: "",
          discountType: "percent",
          discountValue: "",
          applicablePlans: [],
          maxUses: 100,
          perUserLimit: 1,
          startsAt: defaultStartsAt,
          expiresAt: defaultExpiresAt,
          isActive: true,
          description: "",
        });
      }
      setFormError("");
    }, 0);
    return () => clearTimeout(timer);
  }, [editing, defaultStartsAt, defaultExpiresAt]);

  const openCreate = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (c: AdminCoupon) => {
    setEditing(c);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.code.trim()) return setFormError("Coupon code is required");
    if (!form.discountValue) return setFormError("Discount value is required");
    if (Number(form.discountValue) <= 0) return setFormError("Discount must be positive");
    if (form.discountType === "percent" && Number(form.discountValue) > 100) {
      return setFormError("Percent discount cannot exceed 100%");
    }

    setSubmitting(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        applicablePlans: form.applicablePlans,
        maxUses: Number(form.maxUses),
        perUserLimit: Number(form.perUserLimit),
        startsAt: new Date(form.startsAt).toISOString(),
        expiresAt: new Date(form.expiresAt).toISOString(),
        isActive: form.isActive,
        description: form.description,
      };
      if (editing) {
        await onUpdate(editing.id, payload);
      } else {
        await onCreate(payload);
      }
      closeModal();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to save coupon");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    await onDelete(id);
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return "—";
    }
  };

  const isExpired = (iso: string) => new Date(iso) < new Date();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-slate-800">Coupons</h2>
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 rounded-xl bg-[#e53238] text-white text-sm font-bold hover:bg-[#c92429] transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {/* List */}
      {coupons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400">
          <Tag className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <p className="font-bold text-slate-500">No coupons yet</p>
          <p className="text-xs mt-0.5">Create your first coupon to offer discounts.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
          {coupons.map((c) => (
            <div key={c.id} className="p-4 flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-slate-900 truncate flex items-center gap-1.5">
                    <span className="font-mono bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px]">{c.code}</span>
                    {c.description && <span className="text-xs text-slate-500">— {c.description}</span>}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100">
                      {c.discountType === "percent" ? `${c.discountValue}% off` : `₹${c.discountValue} off`}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100">
                      {c.applicablePlans.length === 0 ? "All plans" : c.applicablePlans.map((p) => PLAN_OPTIONS.find((o) => o.id === p)?.label || p).join(", ")}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {c.usedCount}/{c.maxUses} used
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      Per user: {c.perUserLimit}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {formatDate(c.startsAt)} → {formatDate(c.expiresAt)}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${c.isActive ? (isExpired(c.expiresAt) ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600") : "bg-slate-100 text-slate-500"}`}>
                      {c.isActive ? (isExpired(c.expiresAt) ? "Expired" : "Active") : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(c)}
                  disabled={busyId === c.id}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  disabled={busyId === c.id}
                  className="px-3 py-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-bold transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold text-slate-900">
                {editing ? "Edit Coupon" : "Create Coupon"}
              </h3>
              <button type="button" onClick={closeModal} disabled={submitting} className="text-slate-400 hover:text-slate-700 cursor-pointer disabled:opacity-40">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wide">Coupon Code</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER20"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e53238]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wide">Discount Type</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value as "percent" | "flat" })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e53238]/40"
                  >
                    <option value="percent">Percent (%)</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wide">Value</label>
                  <input
                    type="number"
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    placeholder={form.discountType === "percent" ? "10" : "100"}
                    min={1}
                    max={form.discountType === "percent" ? 100 : 999999}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e53238]/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wide">Applicable Plans</label>
                <div className="flex flex-wrap gap-2">
                  {PLAN_OPTIONS.map((p) => (
                    <label key={p.id} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.applicablePlans.includes(p.id)}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            applicablePlans: e.target.checked
                              ? [...form.applicablePlans, p.id]
                              : form.applicablePlans.filter((x) => x !== p.id),
                          })
                        }
                        className="rounded border-slate-300 text-[#e53238] focus:ring-[#e53238]"
                      />
                      <span className="text-xs text-slate-600">{p.label}</span>
                    </label>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Leave empty for all plans</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wide">Max Uses (total)</label>
                  <input
                    type="number"
                    value={form.maxUses}
                    onChange={(e) => setForm({ ...form, maxUses: Math.max(1, Number(e.target.value) || 1) })}
                    min={1}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e53238]/40"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wide">Per-User Limit</label>
                  <input
                    type="number"
                    value={form.perUserLimit}
                    onChange={(e) => setForm({ ...form, perUserLimit: Math.max(1, Number(e.target.value) || 1) })}
                    min={1}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e53238]/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wide">Starts At</label>
                  <input
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e53238]/40"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wide">Expires At</label>
                  <input
                    type="datetime-local"
                    value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e53238]/40"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded border-slate-300 text-[#e53238] focus:ring-[#e53238]"
                />
                <label htmlFor="isActive" className="text-sm font-bold text-slate-700 cursor-pointer">
                  Active
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wide">Description (optional)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="Internal notes..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e53238]/40"
                />
              </div>

              {formError && (
                <p className="text-xs font-semibold text-rose-600">{formError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-[#e53238] text-white text-sm font-bold shadow-md hover:bg-[#c92429] transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {editing ? "Save" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}