"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, Shield, BadgeCheck, AlertCircle, Info, Camera, Smartphone, Mail, IdCard } from "lucide-react";

interface VerificationBadgeProps {
  userId: string;
  compact?: boolean;
  onUpdate?: () => void;
}

const BADGE_CONFIG = [
  { key: 'mobile', label: 'Mobile', icon: Smartphone, color: 'bg-blue-100 text-blue-700' },
  { key: 'email', label: 'Email', icon: Mail, color: 'bg-green-100 text-green-700' },
  { key: 'id', label: 'ID', icon: IdCard, color: 'bg-purple-100 text-purple-700' },
  { key: 'photo', label: 'Photo', icon: Camera, color: 'bg-amber-100 text-amber-700' },
];

export default function VerificationBadges({ userId, compact = false, onUpdate }: VerificationBadgeProps) {
  const [badges, setBadges] = useState<Record<string, boolean>>({
    mobile: false,
    email: false,
    id: false,
    photo: false,
  });
  const [mainBadge, setMainBadge] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/verification/badges?userId=${encodeURIComponent(userId)}`);
        const data = await res.json();
        if (data.success) {
          setBadges(data.badges || {});
          setMainBadge(data.badges.badge || null);
        }
      } catch (e) {
        console.error('Failed to load badges:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const handleToggle = async (key: string, currentValue: boolean) => {
    try {
      const res = await fetch('/api/verification/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, badgeType: key, verified: !currentValue }),
      });
      const data = await res.json();
      if (data.success) {
        setBadges(prev => ({ ...prev, [key]: !currentValue }));
        if (data.badge) setMainBadge(data.badge);
      }
    } catch (e) {
      console.error('Failed to update badge:', e);
    }
  };

  if (loading) return compact ? null : <div className="flex gap-2">{BADGE_CONFIG.map(b => <div key={b.key} className={`px-2 py-1 rounded-full bg-gray-100 animate-pulse ${b.color} text-[10px] font-bold`}><b.icon className="w-3 h-3" /> {b.label}</div>)}</div>;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {BADGE_CONFIG.map(b => (
          <button
            key={b.key}
            onClick={() => handleToggle(b.key, badges[b.key])}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold transition-all ${badges[b.key] ? b.color : 'bg-gray-100 text-gray-500'} hover:opacity-80 disabled:opacity-50`}
            disabled={loading}
            title={badges[b.key] ? `${b.label} Verified` : `Verify ${b.label}`}
          >
            <b.icon className="w-3 h-3" />
            {b.label}
          </button>
        ))}
        {mainBadge && (
          <span className="px-2 py-1 rounded-full bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3 inline mr-1" /> {mainBadge}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-white rounded-2xl border border-gray-100">
      <h3 className="font-bold text-gray-900 flex items-center gap-2">
        <Shield className="w-5 h-5 text-[#d97706]" />
        Profile Verification
      </h3>
      <p className="text-xs text-gray-500">
        Verify your details to build trust and get more matches. Each badge increases your credibility.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {BADGE_CONFIG.map(b => (
          <button
            key={b.key}
            onClick={() => handleToggle(b.key, badges[b.key])}
            className={`p-4 rounded-2xl border-2 transition-all ${badges[b.key] ? `border-${b.color.replace('bg-', '').replace('100', '500')} bg-${b.color}` : 'border-gray-200 bg-white hover:border-[#d97706]/50'} flex flex-col items-center gap-2 cursor-pointer transition-all`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${badges[b.key] ? b.color : 'bg-gray-50'}`}>
              <b.icon className={`w-6 h-6 ${badges[b.key] ? 'text-white' : 'text-gray-400'}`} />
            </div>
            <span className={`font-bold text-xs ${badges[b.key] ? 'text-white' : 'text-gray-600'}`}>
              {b.label}
            </span>
            {badges[b.key] && (
              <BadgeCheck className="w-5 h-5 text-emerald-500 animate-bounce" />
            )}
          </button>
        ))}
      </div>

      {mainBadge && (
        <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-emerald-100 to-emerald-200 border border-emerald-200 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <div>
            <p className="font-bold text-emerald-800 text-sm">{mainBadge} Profile</p>
            <p className="text-xs text-emerald-600">Your profile is verified and gets priority in search results</p>
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          <Info className="w-3 h-3 inline mr-1" /> Verified profiles get <span className="font-bold">3x more messages</span> and priority in search results
        </p>
      </div>
    </div>
  );
}