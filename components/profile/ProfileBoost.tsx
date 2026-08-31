"use client";

import React, { useEffect, useState } from "react";
import { Zap, Clock, TrendingUp, Crown, Sparkles, AlertCircle, Info } from "lucide-react";

interface ProfileBoostProps {
  userId: string;
  onUpdate?: () => void;
}

const BOOST_OPTIONS = [
  { id: '24h', label: '24 Hours', price: 99, days: 1, color: 'bg-blue-500' },
  { id: '3d', label: '3 Days', price: 299, days: 3, color: 'bg-purple-500' },
  { id: '7d', label: '7 Days', price: 599, days: 7, color: 'bg-purple-600' },
];

export default function ProfileBoost({ userId, onUpdate }: { userId: string; onUpdate?: () => void }) {
  const [activeBoostState, setActiveBoost] = useState<{ boost_type: string; expires_at: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/profile/boost?userId=${encodeURIComponent(userId)}`);
        const data = await res.json();
        if (data.success) setActiveBoost(data.activeBoost);
      } catch (e) {
        console.error('Failed to load boost:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const handlePurchase = async (boostType: string) => {
    setPurchasing(boostType);
    setError(null);
    try {
      const res = await fetch('/api/profile/boost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, boostType }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveBoost({ boost_type: data.boostType, expires_at: data.expiresAt });
      } else {
        setError(data.message || 'Failed to purchase boost');
      }
    } catch (e) {
      setError('Failed to purchase boost');
    } finally {
      setPurchasing(null);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Are you sure you want to remove your active boost?')) return;
    try {
      const res = await fetch(`/api/profile/boost?userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) setActiveBoost(null);
    } catch (e) {
      console.error('Failed to remove boost:', e);
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = Date.now();
    const end = new Date(expiresAt).getTime();
    const diff = end - Date.now();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const activeBoostOption = BOOST_OPTIONS.find(b => activeBoostState?.boost_type === b.id);
  const expiresIn = activeBoostState ? getTimeRemaining(activeBoostState.expires_at) : null;

  return (
    <div className="space-y-4 p-4 bg-white rounded-2xl border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Profile Boost</h3>
            <p className="text-xs text-gray-500">Increase your visibility and get more matches</p>
          </div>
        </div>
{activeBoostState && (
        <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold flex items-center gap-1">
          <Zap className="w-3 h-3" /> Active: {getTimeRemaining(activeBoostState.expires_at)}
        </span>
      )}
      </div>

      {activeBoostState && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-white shadow-sm">
                <Zap className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Active Boost: {activeBoostState.boost_type?.toUpperCase()}</p>
                <p className="text-xs text-gray-500">Expires in <span className="font-bold text-purple-600">{getTimeRemaining(activeBoostState.expires_at)}</span></p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="px-3 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
            >
              Remove Boost
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {BOOST_OPTIONS.map(boost => (
          <button
            key={boost.id}
            onClick={() => handlePurchase(boost.id)}
            disabled={!!purchasing}
            className={`relative p-4 rounded-2xl border-2 transition-all text-center ${
              activeBoostOption?.id === boost.id
                ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-500/20'
                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${boost.color}`}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h4 className="font-bold text-gray-900">{boost.label}</h4>
            <p className="text-xs text-gray-500 mb-2">{boost.days === 1 ? '24 hours' : `${boost.days} days`}</p>
            <div className="text-lg font-black text-gray-900">₹{boost.price}</div>
            <div className="text-[10px] text-gray-400 mt-1">Save ₹{boost.id === '7d' ? 300 : boost.id === '3d' ? 50 : 0}</div>
          </button>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800">
          <p className="font-bold mb-1">How Profile Boost works:</p>
          <ul className="list-disc list-inside space-y-1 text-xs text-amber-700">
            <li>Your profile appears at the top of search results</li>
            <li>Get <span className="font-bold">3-5x more profile views</span></li>
            <li>Priority in match suggestions</li>
            <li><span className="font-bold">Zap badge</span> appears on your profile</li>
          </ul>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}