"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/Global";
import { Camera, Upload, Loader2, Trash2, Star, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useMounted } from "@/hooks/useMounted";
import { ACCEPTED_IMAGE_TYPES, convertHeicToJpeg, isImageFile } from "@/lib/imageUtils";

interface PhotoRecord {
  id: string;
  userId: string;
  url: string;
  createdAt: string;
  isMain?: boolean;
}

export default function PhotosPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const mounted = useMounted();

  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const userId = user?.profileId || user?.mobileNumber || user?.email || "";

  const loadPhotos = async () => {
    try {
      const res = await fetch(`/api/photos/upload?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (data.success) setPhotos(data.photos || []);
    } catch (e) {
      console.error("[Photos] Failed to load photos:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push("/");
      return;
    }
    if (mounted && isAuthenticated && userId) {
      (async () => {
        try {
          const res = await fetch(`/api/photos/upload?userId=${encodeURIComponent(userId)}`);
          const data = await res.json();
          if (data.success) setPhotos(data.photos || []);
        } catch (e) {
          console.error("[Photos] Failed to load photos:", e);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [mounted, isAuthenticated, isLoading, userId, router]);

  const uploadFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((f) => isImageFile(f));
    if (validFiles.length === 0) return;
    setUploading(true);
    try {
      const convertedFiles = await Promise.all(validFiles.map((f) => convertHeicToJpeg(f)));
      for (const file of convertedFiles) {
        const form = new FormData();
        form.append("file", file);
        form.append("userId", userId);
        form.append("isMain", String(photos.length === 0));
        const res = await fetch("/api/photos/upload", {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        if (data.success) setPhotos(data.photos || []);
      }
    } catch (e) {
      console.error("[Photos] Upload failed:", e);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (photoId: string) => {
    if (busyId) return;
    setBusyId(photoId);
    try {
      const res = await fetch(`/api/photos/upload?id=${encodeURIComponent(photoId)}&userId=${encodeURIComponent(userId)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) setPhotos(data.photos || []);
    } catch (e) {
      console.error("[Photos] Delete failed:", e);
      alert("Delete failed. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const makeMain = async (photo: PhotoRecord) => {
    if (busyId) return;
    setBusyId(photo.id);
    try {
      const res = await fetch("/api/photos/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, photoUrl: photo.url, isMain: true }),
      });
      const data = await res.json();
      if (data.success) {
        setPhotos((prev) =>
          prev
            .filter((p) => p.id !== photo.id)
            .concat({ ...photo, isMain: true })
            .map((p) => ({ ...p, isMain: p.id === photo.id }))
        );
        loadPhotos();
      }
    } catch (e) {
      console.error("[Photos] Make main failed:", e);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-lg mb-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 text-[#d97706] flex items-center justify-center mx-auto mb-4 border border-red-100">
            <Camera className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            My Photos & Privacy Control
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mt-2">
            Profiles with photos get up to 10x more responses. Your first photo becomes your profile photo.
          </p>

          {(!mounted || isLoading || !isAuthenticated) ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-[#d97706] animate-spin" />
            </div>
          ) : (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES}
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) uploadFiles(e.target.files);
                  e.target.value = "";
                }}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files);
                }}
                className={`mt-8 p-8 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  dragOver ? "border-[#d97706] bg-red-50/40" : "border-gray-200 bg-gray-50/50"
                }`}
              >
                {uploading ? (
                  <Loader2 className="w-10 h-10 text-[#d97706] animate-spin mb-3" />
                ) : (
                  <Upload className="w-10 h-10 text-gray-400 mb-3" />
                )}
                <p className="font-bold text-gray-800 text-sm">
                  {uploading ? "Uploading..." : "Drag and drop your photos here"}
                </p>
                <p className="text-xs text-gray-400 mt-1 mb-4">Supports JPG, PNG (Max 10MB per photo)</p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-6 py-3 bg-[#d97706] text-white font-bold text-sm rounded-xl shadow-md hover:bg-[#b45309] cursor-pointer"
                >
                  Browse Photo Files
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-[#d97706] animate-spin" />
                </div>
              ) : photos.length > 0 ? (
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 text-left">
                  {photos.map((p) => (
                    <div
                      key={p.id}
                      className="group relative rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 aspect-square"
                    >
                      <Image src={p.url} alt="Profile" fill sizes="200px" className="object-cover" />
                      {p.isMain && (
                        <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-600/90 text-white text-[10px] font-black">
                          <Star className="w-3 h-3" /> Main
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end justify-end p-2 gap-1.5">
                        {!p.isMain && (
                          <button
                            type="button"
                            onClick={() => makeMain(p)}
                            disabled={busyId === p.id}
                            className="p-2 rounded-xl bg-white text-gray-700 hover:bg-amber-50 hover:text-amber-600 cursor-pointer disabled:opacity-50 shadow-sm"
                            title="Make profile photo"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => deletePhoto(p.id)}
                          disabled={busyId === p.id}
                          className="p-2 rounded-xl bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 cursor-pointer disabled:opacity-50 shadow-sm"
                          title="Delete photo"
                        >
                          {busyId === p.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-8 py-10 text-center text-gray-400 text-xs">
                  <X className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="font-bold text-gray-500">No photos yet</p>
                  <p className="mt-0.5">Upload a photo to get started.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
