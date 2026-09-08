"use client";

import { useSyncExternalStore, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import LoginPage from "./LoginPage";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onOpenForgotPassword?: () => void;
  onOpenSignup?: () => void;
}

export default function LoginModal({
  open,
  onClose,
  onOpenForgotPassword,
  onOpenSignup,
}: LoginModalProps) {
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

  // Prevent accidental dismissal when clicking the dark backdrop
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
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close login modal"
          className="absolute -top-3 -right-3 z-20 bg-white rounded-full p-1.5 shadow-lg border border-gray-100 text-gray-600 hover:text-gray-900 hover:rotate-90 transition-all duration-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <LoginPage
          isModal={true}
          onOpenForgotPassword={() => {
            onClose();
            if (onOpenForgotPassword) onOpenForgotPassword();
          }}
          onOpenSignup={() => {
            onClose();
            if (onOpenSignup) onOpenSignup();
          }}
        />
      </div>
    </div>,
    document.body
  );
}
