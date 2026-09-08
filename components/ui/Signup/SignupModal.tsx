"use client";

import { useSyncExternalStore, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { X } from "lucide-react";

const SignupPage = dynamic(() => import("./SignupPage"), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-3xl p-8 max-w-lg mx-auto text-center space-y-3">
      <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-xs font-bold text-slate-500">Loading signup...</p>
    </div>
  ),
});

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

  // Clicking the dark background overlay should NOT accidentally dismiss the modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShaking(true);
      setTimeout(() => setShaking(false), 300);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div
        className={`relative w-full my-3 sm:my-5 transition-transform duration-200 animate-in fade-in zoom-in-95 ${
          shaking ? "scale-[1.02]" : ""
        }`}
        style={{ maxWidth: "620px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <SignupPage
          isModal={true}
          onClose={onClose}
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
