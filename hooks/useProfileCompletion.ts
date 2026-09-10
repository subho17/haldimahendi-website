"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface UserProfile {
  display_name?: string;
  name?: string;
  age?: string | number;
  height?: string;
  maritalStatus?: string;
  religion?: string;
  motherTongue?: string;
  education?: string;
  profession?: string;
  city?: string;
  bio?: string;
  avatar_url?: string;
  avatarUrl?: string;
}

export function useProfileCompletion() {
  const { user } = useAuth();
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [showPopup, setShowPopup] = useState<boolean>(false);

  useEffect(() => {
    const checkProfile = () => {
      if (!user) {
        setIsComplete(false);
        setMissingFields([]);
        setShowPopup(false);
        return;
      }

      const fields: (keyof UserProfile)[] = [
        "display_name",
        "name",
        "age",
        "height",
        "maritalStatus",
        "religion",
        "motherTongue",
        "education",
        "profession",
        "city",
        "bio",
      ];

      const missing: string[] = [];
      for (const field of fields) {
        const value = (user as UserProfile)[field];
        if (!value || (typeof value === "string" && value.trim() === "")) {
          missing.push(field);
        }
      }

      // Also check avatar
      const hasAvatar = !!(user?.avatar_url || user?.avatarUrl);
      if (!hasAvatar) {
        missing.push("avatar");
      }

      setIsComplete(missing.length === 0);
      setMissingFields(missing);

      // Show popup if profile is not complete
      if (missing.length > 0) {
        setShowPopup(true);
      }
    };

    checkProfile();
  }, [user]);

  return { isComplete, missingFields, showPopup };
}