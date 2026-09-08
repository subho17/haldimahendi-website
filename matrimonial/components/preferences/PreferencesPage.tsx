"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/Global";
import { Sliders, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useMounted } from "@/hooks/useMounted";

interface PrefForm {
  partnerGender: string;
  ageMin: string;
  ageMax: string;
  heightMin: string;
  heightMax: string;
  religion: string;
  motherTongue: string;
  maritalStatus: string;
  city: string;
  education: string;
}

const EMPTY: PrefForm = {
  partnerGender: "Any",
  ageMin: "21",
  ageMax: "35",
  heightMin: "",
  heightMax: "",
  religion: "Any",
  motherTongue: "",
  maritalStatus: "Any",
  city: "",
  education: "",
};

export default function PreferencesPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const mounted = useMounted();

  const [form, setForm] = useState<PrefForm>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const userId = user?.profileId || user?.mobileNumber || user?.email || "";

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push("/");
      return;
    }
    if (mounted && isAuthenticated && userId) {
      fetch(`/api/preferences?userId=${encodeURIComponent(userId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.preferences) {
            const p = data.preferences;
            setForm({
              partnerGender: p.partnerGender || "Any",
              ageMin: p.ageMin != null ? String(p.ageMin) : "21",
              ageMax: p.ageMax != null ? String(p.ageMax) : "35",
              heightMin: p.heightMin || "",
              heightMax: p.heightMax || "",
              religion: p.religion || "Any",
              motherTongue: p.motherTongue || "",
              maritalStatus: p.maritalStatus || "Any",
              city: p.city || "",
              education: p.education || "",
            });
          }
        })
        .catch(console.error)
        .finally(() => setLoaded(true));
    }
  }, [mounted, isAuthenticated, isLoading, router, userId]);

  const set = (key: keyof PrefForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, userId }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert(data.message || "Failed to save preferences");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const showLoading = !mounted || isLoading || !isAuthenticated || !loaded;

  const selectCls =
    "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#d97706] outline-none";
  const inputCls =
    "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#d97706] outline-none";
  const fieldLabel = "text-xs font-bold text-gray-700 block uppercase mb-1.5";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-lg mb-8">
          <div className="flex items-center gap-2 text-xs font-bold text-[#d97706] uppercase tracking-wider mb-2">
            <Sliders className="w-4 h-4" />
            <span>Matchmaking Criteria</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">
            Partner Preferences
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Tell us who you&apos;re looking for. Your preferences power the matchmaking engine.
          </p>

          {showLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-[#d97706] animate-spin" />
            </div>
          ) : (
            <div className="space-y-6 text-left">
              {/* Basic Partner Criteria */}
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm mb-4">Basic Partner Criteria</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={fieldLabel}>Looking For</label>
                    <select
                      value={form.partnerGender}
                      onChange={(e) => set("partnerGender", e.target.value)}
                      className={selectCls}
                    >
                      <option value="Any">Any</option>
                      <option value="Woman">Woman</option>
                      <option value="Man">Man</option>
                    </select>
                  </div>
                  <div>
                    <label className={fieldLabel}>Education Preference (optional)</label>
                    <input
                      type="text"
                      value={form.education}
                      onChange={(e) => set("education", e.target.value)}
                      placeholder="e.g. Engineer, Doctor, MBA"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={fieldLabel}>Preferred Age (min)</label>
                    <select
                      value={form.ageMin}
                      onChange={(e) => set("ageMin", e.target.value)}
                      className={selectCls}
                    >
                      {Array.from({ length: 50 }, (_, i) => 18 + i).map((a) => (
                        <option key={a} value={a}>{a} yrs</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={fieldLabel}>Preferred Age (max)</label>
                    <select
                      value={form.ageMax}
                      onChange={(e) => set("ageMax", e.target.value)}
                      className={selectCls}
                    >
                      {Array.from({ length: 50 }, (_, i) => 18 + i).map((a) => (
                        <option key={a} value={a}>{a} yrs</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={fieldLabel}>Preferred Height (min)</label>
                    <input
                      type="text"
                      value={form.heightMin}
                      onChange={(e) => set("heightMin", e.target.value)}
                      placeholder={`e.g. 5'0"`}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={fieldLabel}>Preferred Height (max)</label>
                    <input
                      type="text"
                      value={form.heightMax}
                      onChange={(e) => set("heightMax", e.target.value)}
                      placeholder={`e.g. 5'8"`}
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              {/* Cultural & Community Criteria */}
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm mb-4">Cultural & Community Criteria</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={fieldLabel}>Religion</label>
                    <select
                      value={form.religion}
                      onChange={(e) => set("religion", e.target.value)}
                      className={selectCls}
                    >
                      <option value="Any">Any</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Muslim">Muslim</option>
                      <option value="Christian">Christian</option>
                      <option value="Sikh">Sikh</option>
                      <option value="Jain">Jain</option>
                      <option value="Buddhist">Buddhist</option>
                    </select>
                  </div>
                  <div>
                    <label className={fieldLabel}>Mother Tongue (comma separated)</label>
                    <input
                      type="text"
                      value={form.motherTongue}
                      onChange={(e) => set("motherTongue", e.target.value)}
                      placeholder="e.g. Hindi, Bengali, Marathi"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={fieldLabel}>Marital Status</label>
                    <select
                      value={form.maritalStatus}
                      onChange={(e) => set("maritalStatus", e.target.value)}
                      className={selectCls}
                    >
                      <option value="Any">Any</option>
                      <option value="Never Married">Never Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                  <div>
                    <label className={fieldLabel}>Preferred City (optional)</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                      placeholder="e.g. Mumbai"
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              {saved && (
                <p className="text-sm font-semibold text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  Partner preferences saved successfully!
                </p>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-[#d97706] text-white font-bold text-sm rounded-xl shadow-md hover:bg-[#b45309] flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{saving ? "Saving..." : "Save Partner Preferences"}</span>
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
