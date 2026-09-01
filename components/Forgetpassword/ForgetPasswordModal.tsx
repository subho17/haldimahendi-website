"use client";

import { useSyncExternalStore, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import ForgetPasswordPage from "./ForgetPasswordPage";

interface ForgetPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ForgetPasswordModal({ open, onClose }: ForgetPasswordModalProps) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [shaking, setShaking] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  if (!open || !mounted) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShaking(true);
      setTimeout(() => setShaking(false), 300);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div
        className={`relative w-full max-w-md my-8 transition-transform duration-200 animate-in fade-in zoom-in-95 ${
          shaking ? "scale-[1.02]" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close forgot password popup"
          className="absolute -top-3 -right-3 z-10 bg-white rounded-full p-1.5 shadow-lg border border-gray-100 text-gray-600 hover:text-gray-900 hover:rotate-90 transition-all duration-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        <ForgetPasswordPage />
      </div>
    </div>,
    document.body
  );
}

