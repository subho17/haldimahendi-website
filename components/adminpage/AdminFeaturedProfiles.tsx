"use client";

import React, { useState, useEffect } from "react";
import { Star, Search, UserPlus, Trash2, Calendar, MoreVertical } from "lucide-react";

interface FeaturedProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string;
  mobile_number: string;
  city: string;
  featured_until: string;
  set_by_admin: boolean;
  created_at: string;
}

interface AdminFeaturedProfilesProps {
  onRefresh?: () => void;
}

export default function AdminFeaturedProfiles({ onRefresh }: AdminFeaturedProfilesProps) {
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({ userId: '', days: '30' });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadFeatured = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
      });
      if (search) params.append('search', search);
      const res = await fetch(`/api/admin/featured?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setFeatured(data.featured || []);
        setTotal(data.total || 0);
      }
    } catch (e) {
      console.error('Failed to load featured profiles:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeatured();
  }, [page, search]);

  const handleAdd = async () => {
    if (!formData.userId || !formData.days) return;
    setError('');
    setBusyId('create');
    try {
      const res = await fetch('/api/admin/featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: formData.userId, days: parseInt(formData.days, 10) }),
      });
      const data = await res.json();
if (data.success) {
          setShowModal(false);
          setFormData({ userId: '', days: '30' });
          loadFeatured();
      } else {
        setError(data.message || 'Failed to add featured profile');
      }
    } catch (e) {
      setError('Failed to add featured profile');
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remove this featured profile?')) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/featured?userId=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setFeatured(prev => prev.filter(f => f.user_id !== id));
      } else {
        alert(data.message || 'Failed to remove');
      }
    } catch (e) {
      console.error('Failed to remove:', e);
    } finally {
      setBusyId(null);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return '—';
    }
  };

  const isExpiringSoon = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    return diff < 3 * 24 * 60 * 60 * 1000; // 3 days
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-slate-800">Featured Profiles</h2>
        <button
          type="button"
          onClick={() => { setFormData({ userId: '', days: '30' }); setShowModal(true); }}
          className="px-4 py-2 rounded-xl bg-[#d97706] text-white text-sm font-bold hover:bg-[#c92429] transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Star className="w-4 h-4" /> Create Featured
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 text-red-700 text-xs">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 2.832 1.732 3l10.66 16c.77 1.333 2.694 1.333 3.464 0l10.66-16c.77-1.333.192-2.832-1.732-3L14 4c-.77-.333-2.333-.333-3.464 0z"/></svg>
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by name, ID, mobile, email or city..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:border-[#e53238] outline-hidden transition-all"
        />
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400">
          <Star className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <p className="font-bold text-slate-500">Loading featured profiles...</p>
        </div>
      ) : featured.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400">
          <Star className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <p className="font-bold text-slate-500">No featured profiles</p>
          <p className="text-xs mt-0.5">Click "Create Featured" to add one.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
          {featured.map((f) => (
            <div key={f.id} className="p-4 flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <img src={f.avatar_url} alt={f.display_name} className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-slate-900 truncate flex items-center gap-1.5">
                    {f.display_name}
                    {f.verified && <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>}
                    {f.isPremium && <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono truncate">{f.id}</p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {f.mobile_number || f.mobileNumber || '—'} {f.city ? ` · ${f.city}` : ''}
                  </p>
                  {f.isSuspended && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-extrabold uppercase">Suspended</span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${f.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                  {f.isActive ? <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 11a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> : <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M6 18L18 6M6 6l12 12"/></svg>}
                  {f.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                  {formatDate(f.featured_until)}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {f.set_by_admin ? 'Admin' : 'User'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRemove(f.id)}
                  disabled={busyId === f.id}
                  className="px-3 py-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1"
                >
                  {busyId === f.id ? <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0"/></svg> : <Trash2 className="w-3.5 h-3.5" />}
                  {busyId === f.id ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {featured.length > 0 && total > 20 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm font-bold text-slate-600">Page {page} of {Math.ceil(total / 20)}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page * 20 >= total}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold text-slate-900">{editing ? 'Edit Featured' : 'Create Featured'}</h3>
              <button onClick={() => { setShowModal(false); setFormData({ userId: '', days: '30' }); }} className="text-slate-400 hover:text-slate-700 cursor-pointer disabled:opacity-40">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <form onSubmit={e => { e.preventDefault(); handleAdd(); }} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wide">User ID</label>
                <input
                  type="text"
                  value={formData.userId}
                  onChange={e => setFormData({ ...formData, userId: e.target.value })}
                  placeholder="SH123456 or 9876543210"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#d97708]/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Duration (days)</label>
                <select
                  value={formData.days}
                  onChange={e => setFormData({ ...formData, days: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#d97708]/20"
                >
                  <option value="7">1 Week</option>
                  <option value="14">2 Weeks</option>
                  <option value="30">1 Month</option>
                  <option value="60">2 Months</option>
                  <option value="90">3 Months</option>
                  <option value="180">6 Months</option>
                  <option value="365">1 Year</option>
                </select>
              </div>

              {error && (
                <p className="text-xs font-semibold text-red-600">{error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setFormData({ userId: '', days: '30' }); }}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busyId === 'create'}
                  className="px-5 py-2.5 rounded-xl bg-[#d97706] hover:bg-[#c92429] text-white text-sm font-bold shadow-md hover:bg-[#c92429] transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
                >
                  {busyId === 'create' ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0"/></svg> : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}