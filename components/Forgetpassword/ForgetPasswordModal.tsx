"use client";

import { useSyncExternalStore } from "react";
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

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div className="relative w-full max-w-md my-8" onClick={(e) => e.stopPropagation()}>
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

