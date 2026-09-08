"use client";

import React, { useEffect, useState } from "react";
import { Eye, User, Phone, Mail, Shield, Info } from "lucide-react";

interface PrivacySettingsProps {
  userId: string;
  onUpdate?: () => void;
}

const PRIVACY_OPTIONS = [
  {
    key: 'hide_phone',
    label: 'Hide Phone Number',
    description: 'Other members will not see your phone number',
    icon: Phone,
    color: 'bg-blue-100 text-blue-700',
  },
  {
    key: 'hide_email',
    label: 'Hide Email',
    description: 'Other members will not see your email address',
    icon: Mail,
    color: 'bg-green-100 text-green-700',
  },
  {
    key: 'hide_surname',
    label: 'Hide Surname',
    description: 'Show only first name to other members',
    icon: User,
    color: 'bg-purple-100 text-purple-700',
  },
  {
    key: 'hide_photos',
    label: 'Hide Photos',
    description: 'Hide all profile photos from other members',
    icon: Shield,
    color: 'bg-rose-100 text-rose-700',
  },
];

export default function PrivacySettings({ userId }: PrivacySettingsProps) {
  const [privacy, setPrivacy] = useState<Record<string, any /* eslint-disable-line @typescript-eslint/no-explicit-any */>>({
    hide_phone: false,
    hide_email: false,
    hide_surname: false,
    hide_photos: false,
    photo_privacy: 'public',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/privacy?userId=${encodeURIComponent(userId)}`);
        const data = await res.json();
        if (data.success) setPrivacy(data.privacy || {});
      } catch (e) {
        console.error('Failed to load privacy:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const handleToggle = async (key: string, currentValue: boolean) => {
    const newValue = !currentValue;
    setPrivacy(prev => ({ ...prev, [key]: newValue }));
    await saveSetting(key, newValue);
  };

  const handlePhotoPrivacyChange = async (value: 'public' | 'contacts_only' | 'private') => {
    setPrivacy(prev => ({ ...prev, photo_privacy: value }));
    await saveSetting('photo_privacy', value);
  };

  const saveSetting = async (key: string, value: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/privacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, settings: { [key]: value } }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to save');
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (e: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      setError(e.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-slate-200 rounded" />
                <div className="h-3 w-1/2 bg-slate-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
        <div className="p-3 rounded-xl bg-emerald-100">
          <Shield className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Privacy Controls</h3>
          <p className="text-xs text-gray-500">Control who can see your personal information</p>
        </div>
      </div>

      {message && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-700 text-xs">
          <Info className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-rose-100 flex items-center gap-2 text-rose-700 text-xs">
          <Shield className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        {PRIVACY_OPTIONS.map(opt => (
          <div key={opt.key} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${opt.color}`}>
                  <opt.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{opt.label}</h4>
                  <p className="text-xs text-gray-500">{opt.description}</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle(opt.key, privacy[opt.key])}
                disabled={saving}
                className={`relative w-12 h-7 rounded-full transition-all ${
                  privacy[opt.key]
                    ? 'bg-[#d97706] after:translate-x-5'
                    : 'bg-gray-200 after:translate-x-0'
                } after:content-[""] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-100">
            <Eye className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">Photo Visibility</h4>
            <p className="text-xs text-gray-500">Control who can see your profile photos</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'public', label: 'Public', desc: 'Everyone can see', icon: '🌐' },
            { value: 'contacts_only', label: 'Contacts Only', desc: 'Only matches', icon: '👥' },
            { value: 'private', label: 'Private', desc: 'Only you', icon: '🔒' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => handlePhotoPrivacyChange(opt.value as any /* eslint-disable-line @typescript-eslint/no-explicit-any */)}
              disabled={saving}
              className={`relative p-4 rounded-2xl border-2 transition-all text-center ${
                privacy.photo_privacy === opt.value
                  ? 'border-[#d97706] bg-[#d97706]/10 ring-2 ring-[#d97706]/20'
                  : 'border-gray-200 hover:border-[#d97706]/50 hover:bg-gray-50'
              }`}
            >
              <div className="text-2xl mb-2">{opt.icon}</div>
              <p className="font-bold text-gray-900">{opt.label}</p>
              <p className="text-[10px] text-gray-500 mt-1">{opt.desc}</p>
              {privacy.photo_privacy === opt.value && (
                <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#d97706] flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <div className="text-xs text-amber-800">
            <p className="font-bold">Profile Visibility Summary</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-amber-700 mt-1">
              <li>Hidden fields are replaced with <span className="font-mono text-gray-500">••••••</span> or <span className="font-mono text-gray-500">[Hidden]</span></li>
              <li>Your matches can still see basic info (first name, age, city)</li>
              <li>Verified badges remain visible regardless of privacy settings</li>
              <li>Changes take effect immediately</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}