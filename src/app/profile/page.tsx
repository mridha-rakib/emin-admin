"use client";

import { useState } from "react";
import { ArrowLeft, Camera, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useTranslation } from "@/context/LanguageContext";
import { apiRequest, redirectToLogin, SessionExpiredError } from "@/lib/api";
import { formatDate, initials, useApi } from "@/lib/admin-api";
import { DataState } from "@/components/common/DataState";
import { useAuthStore } from "@/store/auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4003";

type Me = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  avatar?: string;
  profession?: string;
  bio?: string;
  location?: string;
  createdAt?: string;
  isAdmin?: boolean;
  verification?: { email: boolean; phone: boolean };
};

/** The backend stores single-word names as firstName = lastName, so avoid showing the word twice. */
const fullName = (me: Pick<Me, "firstName" | "lastName">) =>
  (me.firstName && me.firstName === me.lastName ? [me.firstName] : [me.firstName, me.lastName]).filter(Boolean).join(" ");

async function uploadAvatar(file: File) {
  const token = window.localStorage.getItem("auth_token");
  if (!token) {
    redirectToLogin();
    throw new SessionExpiredError();
  }
  const form = new FormData();
  form.append("file", file);
  const response = await fetch(`${API_URL}/uploads/avatar`, {
    method: "POST",
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    body: form,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (response.status === 401) {
    redirectToLogin();
    throw new SessionExpiredError();
  }
  if (!response.ok) throw new Error(data?.message ?? "Upload failed");
  return data as { url: string; user?: Me };
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data, error, isLoading, reload, setData } = useApi<Me>("/auth/me");

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-primary text-primary-foreground rounded-t-lg p-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="hover:opacity-80">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h2 className="text-2xl font-semibold">{t.profile.title}</h2>
        </div>
      </div>

      <div className="bg-card flex justify-center p-8">
        {data ? (
          <ProfileForm key={data._id} me={data} onSaved={setData} />
        ) : (
          <DataState className="w-full max-w-md" isLoading={isLoading} error={error} emptyTitle="" onRetry={reload} />
        )}
      </div>
    </div>
  );
}

function ProfileForm({ me, onSaved }: { me: Me; onSaved: (me: Me) => void }) {
  const { t, language } = useTranslation();
  const isDe = language === "DE";
  const setSession = useAuthStore((state) => state.setSession);

  const [name, setName] = useState(fullName(me));
  const [profession, setProfession] = useState(me.profession ?? "");
  const [location, setLocation] = useState(me.location ?? "");
  const [bio, setBio] = useState(me.bio ?? "");
  const [avatar, setAvatar] = useState(me.avatar ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const syncAuthStore = (user: Me) => {
    const token = useAuthStore.getState().token ?? window.localStorage.getItem("auth_token");
    if (token) setSession({ accessToken: token, user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email } });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setIsUploading(true);
    setNotice(null);
    try {
      const result = await uploadAvatar(file);
      const updated = result.user ?? { ...me, avatar: result.url };
      setAvatar(updated.avatar ?? result.url);
      onSaved(updated);
      setNotice({ type: "success", text: isDe ? "Profilbild aktualisiert." : "Profile photo updated." });
    } catch (uploadError) {
      if (uploadError instanceof SessionExpiredError) return;
      setNotice({
        type: "error",
        text: uploadError instanceof Error ? uploadError.message : isDe ? "Upload fehlgeschlagen." : "Could not upload the photo.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrors({ name: t.profile.nameRequired });
      return;
    }
    setErrors({});
    setIsSaving(true);
    setNotice(null);
    try {
      const updated = await apiRequest<Me>("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({
          name: name.trim(),
          profession: profession.trim(),
          location: location.trim(),
          bio: bio.trim(),
        }),
      });
      onSaved(updated);
      syncAuthStore(updated);
      setName(fullName(updated));
      setNotice({ type: "success", text: t.profile.updateSuccess });
    } catch (saveError) {
      if (saveError instanceof SessionExpiredError) return;
      setNotice({
        type: "error",
        text: saveError instanceof Error ? saveError.message : isDe ? "Speichern fehlgeschlagen." : "Could not save the profile.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const readOnlyClass = "bg-muted/40 text-muted-foreground h-12 cursor-not-allowed";

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
      {/* Avatar */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Avatar className="h-32 w-32">
            {avatar && <AvatarImage src={avatar} alt={name} />}
            <AvatarFallback className="text-3xl">{initials(name || me.email)}</AvatarFallback>
          </Avatar>
          <label
            htmlFor="avatar-upload"
            className={`bg-primary text-primary-foreground hover:bg-primary/90 absolute right-0 bottom-0 rounded-full p-2 transition-colors ${
              isUploading ? "pointer-events-none opacity-70" : "cursor-pointer"
            }`}
          >
            {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
            <input
              id="avatar-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              onChange={handleAvatarChange}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        </div>
        <p className="text-muted-foreground text-sm">{t.profile.changeAvatarText}</p>
        {me.createdAt && (
          <p className="text-muted-foreground text-xs">
            {isDe ? "Mitglied seit" : "Member since"} {formatDate(me.createdAt)}
          </p>
        )}
      </div>

      {/* Name */}
      <div className="space-y-3">
        <label htmlFor="name" className="text-foreground text-lg font-medium">
          {t.profile.fullName}
        </label>
        <Input
          id="name"
          type="text"
          maxLength={120}
          placeholder={t.profile.fullNamePlaceholder}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors({});
          }}
          className={errors.name ? "border-destructive h-12" : "h-12"}
        />
        {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
      </div>

      {/* Email (read-only: the backend has no endpoint to change it) */}
      <div className="space-y-3">
        <label htmlFor="email" className="text-foreground text-lg font-medium">
          {t.profile.emailAddress}
        </label>
        <Input id="email" type="email" value={me.email} readOnly className={readOnlyClass} />
      </div>

      {/* Phone (read-only: changing it requires SMS verification in the app) */}
      <div className="space-y-3">
        <label htmlFor="phone" className="text-foreground text-lg font-medium">
          {t.profile.phoneNumber}
        </label>
        <Input
          id="phone"
          type="tel"
          value={me.phone ?? ""}
          placeholder={isDe ? "Keine Telefonnummer hinterlegt" : "No phone number on file"}
          readOnly
          className={readOnlyClass}
        />
        <p className="text-muted-foreground text-xs">
          {isDe
            ? "E-Mail und Telefonnummer können hier nicht geändert werden."
            : "Email and phone number cannot be changed here."}
        </p>
      </div>

      {/* Profession and Location */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          <label htmlFor="profession" className="text-foreground text-lg font-medium">
            {isDe ? "Position" : "Profession"}
          </label>
          <Input
            id="profession"
            type="text"
            maxLength={120}
            placeholder={isDe ? "z. B. Plattform-Admin" : "e.g. Platform admin"}
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            className="h-12"
          />
        </div>
        <div className="space-y-3">
          <label htmlFor="location" className="text-foreground text-lg font-medium">
            {isDe ? "Standort" : "Location"}
          </label>
          <Input
            id="location"
            type="text"
            maxLength={120}
            placeholder={isDe ? "z. B. Zürich" : "e.g. Zurich"}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-12"
          />
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-3">
        <label htmlFor="bio" className="text-foreground text-lg font-medium">
          {isDe ? "Über mich" : "Bio"}
        </label>
        <textarea
          id="bio"
          rows={3}
          maxLength={2000}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder={isDe ? "Kurze Beschreibung" : "Short description"}
          className="border-input bg-background w-full resize-none rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </div>

      {notice && (
        <p
          className={`flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium ${
            notice.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "border-destructive/30 bg-destructive/5 text-destructive"
          }`}
        >
          {notice.type === "success" && <CheckCircle2 className="h-4 w-4" />}
          {notice.text}
        </p>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSaving || isUploading}
        className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 w-full text-base"
      >
        {isSaving ? (isDe ? "Speichern…" : "Saving…") : t.profile.saveChanges}
      </Button>
    </form>
  );
}
