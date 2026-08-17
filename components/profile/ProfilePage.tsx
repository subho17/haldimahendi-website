/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/Global";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ShieldCheck, Edit3, Camera, Save, X, CheckCircle, User, MapPin, Heart } from "lucide-react";
import { uploadImageToSupabase } from "@/lib/supabaseClient";
import { useMounted } from "@/hooks/useMounted";

const DEFAULT_AVATARS = [
  { label: "Female Avatar 1", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250" },
  { label: "Male Avatar 1", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250" },
  { label: "Female Avatar 2", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250" },
  { label: "Male Avatar 2", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250" },
];

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, login } = useAuth();
  const router = useRouter();
  const mounted = useMounted();

  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Editable Form Fields initialized lazily from user context
  const [displayName, setDisplayName] = useState(() => user?.display_name || user?.name || "Shaadi Member");
  const [avatarUrl, setAvatarUrl] = useState(() => user?.avatar_url || user?.avatarUrl || DEFAULT_AVATARS[0].url);
  const [gender, setGender] = useState(() => user?.gender || "Groom");
  const [age, setAge] = useState("26");
  const [height, setHeight] = useState("5'8\"");
  const [maritalStatus, setMaritalStatus] = useState(() => user?.maritalStatus || "Never Married");
  const [religion, setReligion] = useState("Hindu");
  const [motherTongue, setMotherTongue] = useState("Hindi");
  const [education, setEducation] = useState("B.Tech / B.E");
  const [profession, setProfession] = useState("Software Engineer");
  const [city, setCity] = useState(() => user?.city || "Mumbai");
  const [country] = useState("India");
  const [bio, setBio] = useState("Looking for a caring, family-oriented partner with good moral values.");

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [mounted, isAuthenticated, isLoading, router]);

  if (!mounted || isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#e53238] border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  // Handle Photo Upload (Direct to Supabase Storage)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Please select an image file under 10MB.");
      return;
    }

    setSuccessMessage("Uploading profile photo to Supabase...");

    const uploadRes = await uploadImageToSupabase(file, "avatars");
    const finalUrl = uploadRes.success && uploadRes.publicUrl ? uploadRes.publicUrl : URL.createObjectURL(file);

    setAvatarUrl(finalUrl);
    login({
      ...user,
      avatarUrl: finalUrl,
      avatar_url: finalUrl,
    });
    setSuccessMessage("Profile photo updated successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Handle Form Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedName = displayName.trim() || user?.name || "Shaadi Member";

    login({
      ...user,
      name: updatedName,
      display_name: updatedName,
      avatarUrl: avatarUrl || DEFAULT_AVATARS[0].url,
      avatar_url: avatarUrl || DEFAULT_AVATARS[0].url,
      gender,
      maritalStatus,
      city,
    });

    setIsEditing(false);
    setSuccessMessage("Profile details updated successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const userAvatar = avatarUrl || user?.avatar_url || user?.avatarUrl || DEFAULT_AVATARS[0].url;
  const userDisplayName = displayName || user?.display_name || user?.name || "Shaadi Member";
  const userMobile = user?.mobile_number || user?.mobileNumber || "";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Success Toast */}
        {successMessage && (
          <div className="mb-6 bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-200 flex items-center gap-2 font-bold text-sm shadow-xs animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-lg mb-8 text-left">

          {/* Profile Header Block */}
          <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-gray-100 pb-8 mb-8 text-center sm:text-left">
            
            {/* Avatar & Upload Camera Badge */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-red-100 shadow-md bg-red-50 flex items-center justify-center text-[#e53238] font-black text-3xl">
                {userAvatar && userAvatar !== "/images/default-avatar.png" ? (
                  <img src={userAvatar} alt={userDisplayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="uppercase">{userDisplayName.charAt(0)}</span>
                )}
              </div>

              {/* Upload Trigger Badge */}
              <label className="absolute bottom-1 right-1 p-2 rounded-full bg-[#e53238] text-white cursor-pointer shadow-lg hover:scale-110 transition-transform">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* User Info Header */}
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs mb-2 border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Verified Member</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 truncate">
                {userDisplayName}
              </h1>
              <p className="text-xs text-gray-500 font-semibold mt-1">
                Profile ID: <span className="text-gray-800 font-bold">{user?.profileId}</span> • Mobile: <span className="text-gray-800 font-bold">+91 {userMobile || "Verified"}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {age} yrs • {height} • {city}, {country}
              </p>
            </div>

            {/* Edit / Cancel Toggle Button */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-5 py-2.5 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all ${
                isEditing
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-[#e53238] text-white hover:bg-[#c92429]"
              }`}
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4" />
                  <span>Cancel Editing</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </>
              )}
            </button>

          </div>

          {/* EDIT MODE FORM */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-6 animate-in fade-in">
              <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100 mb-6">
                <h3 className="font-bold text-sm text-[#e53238] flex items-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  <span>Editing Profile Information</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">Update your details below to attract the best matches.</p>
              </div>

              {/* Preset Avatar Selectors */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
                  Choose Preset Avatar (or upload custom photo above)
                </label>
                <div className="flex items-center gap-3 pt-1">
                  {DEFAULT_AVATARS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(av.url)}
                      className={`w-10 h-10 rounded-full overflow-hidden border-2 transition ${
                        avatarUrl === av.url ? "border-[#e53238] scale-110 shadow-md" : "border-gray-200 opacity-70"
                      }`}
                    >
                      <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Display Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Full Display Name *</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:border-[#e53238] outline-hidden"
                    required
                  />
                </div>

                {/* Gender */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Looking For</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:border-[#e53238] outline-hidden"
                  >
                    <option value="Groom">Bride (Groom Profile)</option>
                    <option value="Bride">Groom (Bride Profile)</option>
                  </select>
                </div>

                {/* Age */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Age (Years)</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:border-[#e53238] outline-hidden"
                  />
                </div>

                {/* Height */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Height</label>
                  <select
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:border-[#e53238] outline-hidden"
                  >
                    <option value="5'2&quot;">5&apos;2&quot; (157 cm)</option>
                    <option value="5'4&quot;">5&apos;4&quot; (162 cm)</option>
                    <option value="5'6&quot;">5&apos;6&quot; (167 cm)</option>
                    <option value="5'8&quot;">5&apos;8&quot; (172 cm)</option>
                    <option value="5'10&quot;">5&apos;10&quot; (177 cm)</option>
                    <option value="6'0&quot;">6&apos;0&quot; (182 cm)</option>
                  </select>
                </div>

                {/* Marital Status */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Marital Status</label>
                  <select
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:border-[#e53238] outline-hidden"
                  >
                    <option value="Never Married">Never Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Awaiting Divorce">Awaiting Divorce</option>
                  </select>
                </div>

                {/* Religion */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Religion</label>
                  <select
                    value={religion}
                    onChange={(e) => setReligion(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:border-[#e53238] outline-hidden"
                  >
                    <option value="Hindu">Hindu</option>
                    <option value="Muslim">Muslim</option>
                    <option value="Christian">Christian</option>
                    <option value="Sikh">Sikh</option>
                    <option value="Jain">Jain</option>
                    <option value="Buddhist">Buddhist</option>
                  </select>
                </div>

                {/* Mother Tongue */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Mother Tongue</label>
                  <input
                    type="text"
                    value={motherTongue}
                    onChange={(e) => setMotherTongue(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:border-[#e53238] outline-hidden"
                  />
                </div>

                {/* City */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:border-[#e53238] outline-hidden"
                  />
                </div>

                {/* Education */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Education</label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:border-[#e53238] outline-hidden"
                  />
                </div>

                {/* Profession */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Profession</label>
                  <input
                    type="text"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:border-[#e53238] outline-hidden"
                  />
                </div>

              </div>

              {/* Bio */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">About Myself (Bio)</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:border-[#e53238] outline-hidden"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#e53238] hover:bg-[#c92429] text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </form>
          ) : (
            /* VIEW MODE DISPLAY */
            <div className="space-y-8 animate-in fade-in">
              {/* About Me */}
              <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100">
                <h3 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#e53238]" />
                  <span>About Myself</span>
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">{bio}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-[#e53238]" />
                    <span>Basic Details</span>
                  </h3>
                  <div className="text-xs space-y-2.5">
                    <p className="flex justify-between py-1 border-b border-gray-50"><span className="text-gray-400 font-semibold">Display Name:</span> <span className="font-bold text-gray-900">{userDisplayName}</span></p>
                    <p className="flex justify-between py-1 border-b border-gray-50"><span className="text-gray-400 font-semibold">Looking For:</span> <span className="font-bold text-gray-900">{gender === "Groom" ? "Bride" : "Groom"}</span></p>
                    <p className="flex justify-between py-1 border-b border-gray-50"><span className="text-gray-400 font-semibold">Age:</span> <span className="font-bold text-gray-900">{age} yrs</span></p>
                    <p className="flex justify-between py-1 border-b border-gray-50"><span className="text-gray-400 font-semibold">Height:</span> <span className="font-bold text-gray-900">{height}</span></p>
                    <p className="flex justify-between py-1"><span className="text-gray-400 font-semibold">Marital Status:</span> <span className="font-bold text-gray-900">{maritalStatus}</span></p>
                  </div>
                </div>

                {/* Location & Career */}
                <div className="space-y-4">
                  <h3 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#e53238]" />
                    <span>Location & Background</span>
                  </h3>
                  <div className="text-xs space-y-2.5">
                    <p className="flex justify-between py-1 border-b border-gray-50"><span className="text-gray-400 font-semibold">Living City:</span> <span className="font-bold text-gray-900">{city}</span></p>
                    <p className="flex justify-between py-1 border-b border-gray-50"><span className="text-gray-400 font-semibold">Country:</span> <span className="font-bold text-gray-900">{country}</span></p>
                    <p className="flex justify-between py-1 border-b border-gray-50"><span className="text-gray-400 font-semibold">Religion:</span> <span className="font-bold text-gray-900">{religion}</span></p>
                    <p className="flex justify-between py-1 border-b border-gray-50"><span className="text-gray-400 font-semibold">Mother Tongue:</span> <span className="font-bold text-gray-900">{motherTongue}</span></p>
                    <p className="flex justify-between py-1 border-b border-gray-50"><span className="text-gray-400 font-semibold">Education:</span> <span className="font-bold text-gray-900">{education}</span></p>
                    <p className="flex justify-between py-1"><span className="text-gray-400 font-semibold">Profession:</span> <span className="font-bold text-gray-900">{profession}</span></p>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </main>

      <Footer />
    </div>
  );
}