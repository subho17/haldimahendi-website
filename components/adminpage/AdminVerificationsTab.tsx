/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { BadgeCheck, Check, X, Loader2, ExternalLink } from "lucide-react";

export interface AdminVerification {
  id: string;
  userId: string;
  idType: string;
  idNumber: string;
  selfieUrl?: string;
  documentUrl?: string;
  status: string;
  createdAt: string;
}

interface AdminVerificationsTabProps {
  verifications: AdminVerification[];
  onReview: (id: string, action: "approve" | "reject") => Promise<void>;
  busyId: string;
}

const idTypeLabel = (t: string) =>
  ({ aadhaar: "Aadhaar", pan: "PAN", passport: "Passport", driving_license: "Driving License", voter_id: "Voter ID" }[t] || t);

export default function AdminVerificationsTab({
  verifications,
  onReview,
  busyId,
}: AdminVerificationsTabProps) {
  const pendingList = verifications.filter((v) => v.status === "pending");

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-2xs font-sans">
      <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
        <BadgeCheck className="w-5 h-5 text-[#00875A]" />
        Identity Verification Requests ({pendingList.length})
      </h3>

      {pendingList.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <BadgeCheck className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-bold text-slate-600">No pending verification requests</p>
          <p className="text-xs mt-1 text-slate-400">New user submissions will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingList.map((v) => (
            <div key={v.id} className="bg-gray-50/70 border border-gray-100 rounded-2xl p-5 flex flex-col justify-between gap-4">
              <div className="flex items-start gap-4">
                {v.selfieUrl ? (
                  <img
                    src={v.selfieUrl}
                    alt="Selfie"
                    className="w-16 h-16 rounded-2xl object-cover border border-gray-200 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gray-200 flex items-center justify-center text-slate-400 text-xs font-bold shrink-0">
                    No Photo
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900">
                    User ID: <span className="font-mono text-[#00875A]">{v.userId}</span>
                  </p>
                  <p className="text-xs text-slate-600 mt-1 font-semibold">
                    {idTypeLabel(v.idType)} · <span className="font-mono text-slate-800">{v.idNumber}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Submitted {new Date(v.createdAt).toLocaleString()}
                  </p>

                  {v.documentUrl && (
                    <a
                      href={v.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-[#00875A] hover:underline"
                    >
                      View Document <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  disabled={busyId === v.id}
                  onClick={() => onReview(v.id, "reject")}
                  className="px-5 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                >
                  {busyId === v.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                  Reject
                </button>

                <button
                  type="button"
                  disabled={busyId === v.id}
                  onClick={() => onReview(v.id, "approve")}
                  className="px-5 py-2 rounded-full bg-[#00875A] hover:bg-[#00754e] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5 shadow-xs"
                >
                  {busyId === v.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Approve Verification
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
