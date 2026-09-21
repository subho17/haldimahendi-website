"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Sparkles,
  X,
  Check,
  Copy,
  Wand2,
  RefreshCw,
  Heart,
  Briefcase,
  Home,
  Zap,
  Smile,
  Edit2,
  BookOpen,
} from "lucide-react";
import { BioProfileData, BioOption } from "@/app/api/ai/bio/route";

interface AiBioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBio: (selectedBio: string) => void;
  profile: BioProfileData;
  initialBio?: string;
  initialTone?: string;
}

const TONES = [
  { id: "balanced", label: "Balanced & Genuine", icon: Heart, desc: "Values, career & personal life" },
  { id: "career", label: "Modern & Ambitious", icon: Briefcase, desc: "Driven, progressive & equal" },
  { id: "traditional", label: "Family & Heritage", icon: Home, desc: "Roots, respect & close bonds" },
  { id: "short", label: "Short & Crisp", icon: Zap, desc: "Punchy 2-3 clear sentences" },
  { id: "lifestyle", label: "Warm & Lifestyle", icon: Smile, desc: "Hobbies, travel & companionship" },
];

const SUGGESTED_TAGS = [
  "Travel Enthusiast",
  "Foodie & Cooking",
  "Avid Reader",
  "Music Lover",
  "Fitness Enthusiast",
  "Dog / Pet Lover",
  "Weekend Road Trips",
  "Nature Lover",
];

export default function AiBioModal({
  isOpen,
  onClose,
  onSelectBio,
  profile,
  initialBio = "",
  initialTone = "balanced",
}: AiBioModalProps) {
  const [selectedTone, setSelectedTone] = useState(initialTone);
  const [keywords, setKeywords] = useState("");
  const [currentDraft, setCurrentDraft] = useState(initialBio);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<BioOption[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appliedId, setAppliedId] = useState<string | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState<{ [key: string]: string }>({});
  const [hasGenerated, setHasGenerated] = useState(false);
  const [attemptCount, setAttemptCount] = useState(1);
  const prevIsOpenRef = useRef(false);

  const handleGenerate = useCallback(
    async (toneToUse = selectedTone) => {
      setIsLoading(true);
      setAppliedId(null);
      setEditingCardId(null);

      try {
        const res = await fetch("/api/ai/bio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profile,
            tone: toneToUse,
            keywords,
            currentDraft: currentDraft.trim(),
            mode: currentDraft.trim() ? "polish" : "generate",
            attempt: attemptCount,
          }),
        });

        const data = await res.json();
        if (data.success && Array.isArray(data.options)) {
          setOptions(data.options);
          setHasGenerated(true);
          setAttemptCount((prev) => prev + 1);
        }
      } catch (err) {
        console.error("Failed to generate AI bios:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedTone, profile, keywords, currentDraft, attemptCount]
  );

  // Sync draft and tone on open
  useEffect(() => {
    const justOpened = isOpen && !prevIsOpenRef.current;
    prevIsOpenRef.current = isOpen;
    if (justOpened) {
      const bio = initialBio || "";
      const tone = initialTone || selectedTone;
      requestAnimationFrame(() => {
        setCurrentDraft(bio);
        setSelectedTone(tone);
        if (options.length === 0) {
          handleGenerate(tone);
        }
      });
    }
  }, [isOpen, initialBio, initialTone, options.length, handleGenerate, selectedTone]);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleApply = (id: string, bioText: string) => {
    setAppliedId(id);
    onSelectBio(bioText);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const toggleTag = (tag: string) => {
    if (keywords.toLowerCase().includes(tag.toLowerCase())) {
      const updated = keywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.toLowerCase() !== tag.toLowerCase())
        .join(", ");
      setKeywords(updated);
    } else {
      setKeywords((prev) => (prev ? `${prev}, ${tag}` : tag));
    }
  };

  // Extract compact profile tags
  const profileTags = [
    profile.gender ? `${profile.gender}` : null,
    profile.age ? `${profile.age} yrs` : null,
    profile.profession || null,
    profile.education || null,
    profile.city || null,
    profile.religion || null,
    profile.motherTongue || null,
  ].filter(Boolean);

  // Check if draft has at least 3 genuine words
  const draftWords = currentDraft ? currentDraft.trim().split(/\s+/) : [];
  const hasRealDraft = currentDraft.trim().length > 10 && draftWords.length >= 3;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs p-3 sm:p-5 flex justify-center items-start sm:items-center"
      style={{ minHeight: "100vh" }}
      onClick={onClose}
    >
      {/* Modal Dialog with definite constrained height so header is NEVER clipped */}
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-left my-auto"
        style={{
          height: "min(680px, 85vh)",
          maxHeight: "85vh",
          minHeight: "0px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header - Permanently Pinned at Top (shrink-0) */}
        <div
          className="shrink-0 px-5 py-4 sm:px-6 sm:py-4.5 border-b border-slate-100 bg-amber-50/70 flex items-center justify-between gap-3"
          style={{ flexShrink: 0 }}
        >
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: "#d97706", flexShrink: 0 }}
              className="w-10 h-10 rounded-2xl bg-[#d97706] text-white flex items-center justify-center shadow-md shadow-amber-500/25"
            >
              <Sparkles className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  AI Matrimonial Bio Writer
                </h3>
                <span className="bg-amber-100 text-[#b45309] text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-amber-200">
                  Smart AI
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Generate personalized, articulate, and appealing bios tailored to your profile.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable Area (flex-1 min-h-0) */}
        <div
          className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4"
          style={{ flex: 1, minHeight: 0, overflowY: "auto" }}
        >
          {/* Profile Context Tags */}
          {profileTags.length > 0 && (
            <div className="bg-slate-50 p-2.5 sm:p-3 rounded-2xl border border-slate-200/70 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">
                Profile Context:
              </span>
              {profileTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 1. Tone Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              1. Choose Desired Tone / Persona
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TONES.map((t) => {
                const Icon = t.icon;
                const isActive = selectedTone === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSelectedTone(t.id);
                      handleGenerate(t.id);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-0.5 cursor-pointer ${
                      isActive
                        ? "bg-amber-50 border-[#d97706] ring-2 ring-amber-500/20 text-[#b45309]"
                        : "bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#d97706]" : "text-slate-400"}`} />
                      <span className="truncate">{t.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 leading-snug line-clamp-1">
                      {t.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Custom Keywords & Quick Tags */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                2. Add Custom Highlights / Hobbies (Optional)
              </label>
              <span className="text-[11px] text-slate-400 normal-case font-normal">Click tags or type your own</span>
            </div>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. loves trekking, foodie, vegetarian, plays badminton, close to family"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-[#d97706] outline-hidden transition"
            />
            {/* Tag chips */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {SUGGESTED_TAGS.map((tag) => {
                const isSelected = keywords.toLowerCase().includes(tag.toLowerCase());
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition cursor-pointer ${
                      isSelected
                        ? "bg-[#d97706] text-white border-[#d97706]"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Draft Polish Callout (only shown for genuine drafts >= 3 words) */}
          {hasRealDraft && (
            <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 truncate">
                <Wand2 className="w-4 h-4 text-[#d97706] shrink-0" />
                <span className="text-slate-700 font-medium truncate">
                  Draft: <span className="italic text-slate-600">&quot;{currentDraft.slice(0, 45)}...&quot;</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleGenerate(selectedTone)}
                className="text-[11px] font-bold text-[#b45309] hover:underline shrink-0 cursor-pointer"
              >
                Polish Draft
              </button>
            </div>
          )}

          {/* Primary CTA Button: Vibrant Solid Amber with Explicit Inline Styles */}
          <button
            type="button"
            onClick={() => handleGenerate(selectedTone)}
            disabled={isLoading}
            style={{
              backgroundColor: "#d97706",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              padding: "14px 16px",
              borderRadius: "14px",
              fontWeight: 800,
              fontSize: "14px",
              cursor: "pointer",
              boxShadow: "0 4px 14px 0 rgba(217, 119, 6, 0.35)",
              border: "none",
            }}
            className="hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-60"
          >
            {isLoading ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#ffffff" }}>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span style={{ color: "#ffffff", fontWeight: "bold" }}>Crafting 3 AI Bio Variations...</span>
              </span>
            ) : (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#ffffff" }}>
                <Sparkles className="w-4 h-4 fill-white text-white" />
                <span style={{ color: "#ffffff", fontWeight: "bold" }}>
                  {hasGenerated ? "Regenerate New Bio Options" : "Generate 3 AI Bio Options"}
                </span>
              </span>
            )}
          </button>

          {/* Generated Bio Cards Section */}
          {options.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#d97706]" />
                  <span>Choose Your Favorite Bio</span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {options.length} options ready
                </span>
              </div>

              <div className="space-y-3">
                {options.map((opt, idx) => {
                  const isEditing = editingCardId === opt.id;
                  const currentText = editedText[opt.id] ?? opt.bio;
                  const isApplied = appliedId === opt.id;
                  const isCopied = copiedId === opt.id;

                  return (
                    <div
                      key={opt.id || idx}
                      className={`p-4 rounded-2xl border transition-all ${
                        isApplied
                          ? "bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-400/20"
                          : "bg-white border-slate-200 hover:border-amber-300 hover:shadow-md"
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-xs text-slate-900">
                            {opt.tone}
                          </span>
                          {opt.badge && (
                            <span className="bg-amber-50 text-[#b45309] text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {currentText.split(/\s+/).length} words
                        </span>
                      </div>

                      {/* Card Content */}
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            rows={3}
                            value={currentText}
                            onChange={(e) =>
                              setEditedText({ ...editedText, [opt.id]: e.target.value })
                            }
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-hidden leading-relaxed"
                          />
                          <button
                            type="button"
                            onClick={() => setEditingCardId(null)}
                            className="text-[11px] font-bold text-[#b45309] hover:underline cursor-pointer"
                          >
                            Done Editing
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal italic">
                          &ldquo;{currentText}&rdquo;
                        </p>
                      )}

                      {/* Card Actions */}
                      <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopy(opt.id, currentText)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-slate-400" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          {!isEditing && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCardId(opt.id);
                                if (!editedText[opt.id]) {
                                  setEditedText({ ...editedText, [opt.id]: opt.bio });
                                }
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition"
                            >
                              <Edit2 className="w-3 h-3 text-slate-400" />
                              <span>Tweak</span>
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleApply(opt.id, currentText)}
                          style={{
                            backgroundColor: isApplied ? "#059669" : "#d97706",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "12px",
                            padding: "8px 16px",
                            fontWeight: "bold",
                            fontSize: "12px",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                          className="hover:opacity-90 active:scale-95 transition"
                        >
                          {isApplied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-white" />
                              <span style={{ color: "#ffffff" }}>Applied!</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-white" />
                              <span style={{ color: "#ffffff" }}>Use This Bio</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer - Permanently Pinned at Bottom (shrink-0) */}
        <div
          className="shrink-0 px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
          style={{ flexShrink: 0 }}
        >
          <span className="text-slate-400 font-medium text-[11px]">
            HaldiMehendi AI Bio Assistant • Tailored for Matrimony
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 cursor-pointer transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
