"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import SignupPage from "./SignupPage";

interface SignupModalProps {
  open: boolean;
  onClose: () => void;
  onOpenLogin?: () => void;
  initialData?: {
    lookingFor?: string;
    religion?: string;
    motherTongue?: string;
  };
}

export default function SignupModal({
  open,
  onClose,
  onOpenLogin,
  initialData,
}: SignupModalProps) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg my-8 transition-all duration-300 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close signup modal"
          className="absolute -top-3 -right-3 z-20 bg-white rounded-full p-1.5 shadow-lg border border-gray-100 text-gray-600 hover:text-gray-900 hover:rotate-90 transition-all duration-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <SignupPage
          isModal={true}
          onSuccess={onClose}
          onOpenLogin={() => {
            onClose();
            if (onOpenLogin) onOpenLogin();
          }}
          initialData={initialData}
        />
      </div>
    </div>,
    document.body
  );
}
