"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface ComboboxInputProps {
  value: string;
  onChange: (val: string) => void;
  options: readonly string[];
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export default function ComboboxInput({
  value,
  onChange,
  options,
  placeholder = "Select or type your own...",
  className = "",
  required = false,
}: ComboboxInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options based on user's current input
  const filteredOptions = value
    ? options.filter((opt) => opt.toLowerCase().includes(value.toLowerCase()))
    : options;

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          required={required}
          className={
            className ||
            "w-full pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-[#d97706] outline-hidden transition-all"
          }
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-[#d97706]" : ""
            }`}
          />
        </button>
      </div>

      {isOpen && (
        <ul className="absolute z-50 left-0 right-0 mt-1 max-h-52 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg py-1 text-xs font-semibold text-slate-800 animate-in fade-in slide-in-from-top-1 duration-150">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => {
              const isSelected = opt.toLowerCase() === value.toLowerCase();
              return (
                <li
                  key={opt}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`px-3.5 py-2 cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected
                      ? "bg-amber-50 text-[#d97706] font-bold"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span className="truncate">{opt}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#d97706] shrink-0" />}
                </li>
              );
            })
          ) : (
            <li className="px-3.5 py-2 text-slate-400 italic text-[11px]">
              Custom input: &ldquo;{value}&rdquo; (press Enter or keep typing)
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
