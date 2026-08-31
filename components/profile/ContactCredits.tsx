"use client";

import React, { useEffect, useState } from "react";
import { CreditCard, Gift, AlertCircle, Info, ArrowRight, Loader2 } from "lucide-react";

const CREDIT_PACKAGES = [
  { id: 5, label: '5 Contacts', price: 199, desc: 'For getting started', color: 'bg-gray-500' },
  { id: 15, label: '15 Contacts', price: 499, desc: 'Most popular', color: 'bg-blue-500', popular: true },
  { id: 50, label: '50 Contacts', price: 999, desc: 'Best value', color: 'bg-purple-500' },
];

export default function ContactCredits({ userId, onUpdate }: { userId: string; onUpdate?: () => void }) {
  const [credits, setCredits] = useState<number>(0);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/contact-credits?userId=${encodeURIComponent(userId)}`);
        const data = await res.json();
        if (data.success) {
          setCredits(data.credits || 0);
          setExpiresAt(data.expiresAt);
          setSource(data.source);
        }
      } catch (e) {
        console.error('Failed to load credits:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const handlePurchase = async (packageId: number) => {
    setPurchasing(String(packageId));
    setError(null);
    try {
      const res = await fetch('/api/contact-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, package: packageId }),
      });
      const data = await res.json();
      if (data.success) {
        setCredits(prev => prev + data.creditsAdded);
        setMessage(`Successfully purchased ${data.creditsAdded} contact credits!`);
        setTimeout(() => setMessage(null), 5000);
      } else {
        setError(data.message || 'Failed to purchase credits');
      }
    } catch (e) {
      setError('Failed to purchase credits');
    } finally {
      setPurchasing(null);
    }
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return 'Never';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return 'Never';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-2xl border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Contact Credits</h3>
            <p className="text-xs text-gray-500">Unlock contact details of matches</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            credits > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {credits} Credits
          </span>
          {expiresAt && (
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">
              Expires {formatDate(expiresAt)}
            </span>
          )}
        </div>
      </div>

      {message && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-700 text-xs">
          <Info className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {CREDIT_PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            onClick={() => handlePurchase(pkg.id)}
            className={`relative p-4 rounded-2xl border-2 transition-all text-center cursor-pointer ${
              pkg.popular
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            {pkg.popular && (
              <span className="absolute -top-2 right-2 px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-black">
                Popular
              </span>
            )}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${pkg.color}`}>
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold text-gray-900">{pkg.label}</h4>
            <p className="text-xs text-gray-500 mb-1">{pkg.desc}</p>
            <div className="text-lg font-black text-gray-900">₹{pkg.price}</div>
            <div className="text-[10px] text-gray-400 mt-1">₹{Math.round((pkg.price / pkg.id) * 100) / 100} per contact</div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePurchase(pkg.id);
              }}
              disabled={!!purchasing}
              className={`w-full mt-3 py-2 rounded-xl text-sm font-bold transition-colors ${
                purchasing === String(pkg.id)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-md shadow-amber-500/20'
              }`}
            >
              {purchasing === String(pkg.id) ? (
                <span className="flex items-center justify-center gap-1">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                'Buy Now'
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-5 h-5 text-emerald-600 shrink-0" />
          <h4 className="font-bold text-emerald-800">How Contact Credits Work</h4>
        </div>
        <ul className="list-disc list-inside space-y-2 text-xs text-emerald-700">
          <li>Each credit unlocks <span className="font-bold">one member's contact details</span> (phone/email)</li>
          <li>Credits are consumed only when you <span className="font-bold">view contact info</span></li>
          <li>Credits <span className="font-bold">never expire</span> (valid for 1 year from purchase)</li>
          <li>Premium members get <span className="font-bold">monthly bonus credits</span> included</li>
          <li>One-time purchase - no recurring subscription</li>
        </ul>
      </div>

      {message && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-700 text-xs">
          <Info className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}