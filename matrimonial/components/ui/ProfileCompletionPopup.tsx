"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ProfileCompletionPopupProps {
  autoDismiss: boolean;
}

export default function ProfileCompletionPopup({ autoDismiss = true }: ProfileCompletionPopupProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    // Show popup when component mounts and user exists
    if (user && mountedRef.current) {
      setShowPopup(true);
    }

    return () => {
      mountedRef.current = false;
    };
  }, [user]);

  const handleClose = () => {
    setShowPopup(false);
  };

  const navigateToProfile = () => {
    handleClose();
    router.push("/profile");
  };

  if (!showPopup) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <div
        className={`relative w-full max-w-sm my-8 transition-transform duration-200 animate-in fade-in zoom-in-95 bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-8`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close popup"
          className="absolute -top-3 -right-3 z-20 bg-white rounded-full p-1.5 shadow-lg border border-gray-100 text-gray-600 hover:text-gray-900 hover:rotate-90 transition-all duration-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
            ⚠️
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Your Profile</h3>
          <p className="text-gray-500 text-sm mb-4">
            Your profile is not complete. Please add some details so other members can find you.
          </p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={navigateToProfile}
            className="w-full py-3 px-4 rounded-xl bg-[#d97706] text-white font-bold text-sm hover:bg-[#b45309] transition-colors cursor-pointer"
          >
            Go to Profile
          </button>

          {autoDismiss && (
            <div className="text-center text-xs text-gray-500 mt-2">
              Popup will close in <span id="popup-timer">20</span> seconds
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setShowPopup(false);
            }}
            className="w-full py-3 px-4 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer mt-2"
          >
            Skip for Now
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}