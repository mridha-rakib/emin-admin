"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/context/LanguageContext";
import { redirectToLogin } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4003";

/**
 * The backend answers a wrong current password with 401, which apiRequest would treat as an
 * expired session and log the admin out, so this call is made with fetch directly.
 */
async function changePassword(currentPassword: string, newPassword: string) {
  const token = window.localStorage.getItem("auth_token");
  if (!token) {
    redirectToLogin();
    return { ok: false as const, wrongPassword: false, message: "" };
  }
  const response = await fetch(`${API_URL}/auth/change-password`, {
    method: "PATCH",
    headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const text = await response.text();
  const data = text ? (JSON.parse(text) as { message?: string | string[] }) : null;
  const message = Array.isArray(data?.message) ? data.message.join(" ") : (data?.message ?? "");
  if (response.ok) return { ok: true as const, wrongPassword: false, message };
  if (response.status === 401) {
    if (/current password/i.test(message)) return { ok: false as const, wrongPassword: true, message };
    redirectToLogin();
  }
  return { ok: false as const, wrongPassword: false, message };
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const { language } = useTranslation();
  const isDe = language === "DE";
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!currentPassword) {
      newErrors.currentPassword = isDe ? "Aktuelles Passwort ist erforderlich" : "Current password is required";
    }

    if (!newPassword) {
      newErrors.newPassword = isDe ? "Neues Passwort ist erforderlich" : "New password is required";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = isDe ? "Das Passwort muss mindestens 6 Zeichen lang sein" : "Password must be at least 6 characters";
    } else if (newPassword === currentPassword) {
      newErrors.newPassword = isDe
        ? "Das neue Passwort muss sich vom aktuellen unterscheiden"
        : "New password must be different from the current one";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = isDe ? "Bitte bestätigen Sie Ihr Passwort" : "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = isDe ? "Passwörter stimmen nicht überein" : "Passwords do not match";
    }

    setErrors(newErrors);
    setNotice(null);
    if (Object.keys(newErrors).length > 0) return;

    setIsSaving(true);
    try {
      const result = await changePassword(currentPassword, newPassword);
      if (result.ok) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setNotice({ type: "success", text: isDe ? "Passwort erfolgreich geändert." : "Password changed successfully." });
      } else if (result.wrongPassword) {
        setErrors({ currentPassword: isDe ? "Das aktuelle Passwort ist falsch" : "Current password is incorrect" });
      } else {
        setNotice({
          type: "error",
          text: result.message || (isDe ? "Passwort konnte nicht geändert werden." : "Could not change the password."),
        });
      }
    } catch {
      setNotice({ type: "error", text: isDe ? "Server nicht erreichbar." : "Could not reach the server." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-primary text-primary-foreground rounded-t-lg p-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="hover:opacity-80">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h2 className="text-2xl font-semibold">{isDe ? "Passwort ändern" : "Change Password"}</h2>
        </div>
      </div>

      {/* Form */}
      <div className="bg-card flex justify-center p-8">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
          {/* Current Password */}
          <div className="space-y-3">
            <label htmlFor="current" className="text-foreground text-lg font-medium">
              {isDe ? "Aktuelles Passwort" : "Current Password"}
            </label>
            <div className="relative">
              <Input
                id="current"
                type={showCurrent ? "text" : "password"}
                autoComplete="current-password"
                placeholder={isDe ? "Aktuelles Passwort eingeben" : "Enter current password"}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (errors.currentPassword) setErrors({ ...errors, currentPassword: undefined });
                }}
                className={errors.currentPassword ? "border-destructive h-12 pr-10" : "h-12 pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.currentPassword && <p className="text-destructive text-xs">{errors.currentPassword}</p>}
          </div>

          {/* New Password */}
          <div className="space-y-3">
            <label htmlFor="new" className="text-foreground text-lg font-medium">
              {isDe ? "Neues Passwort" : "New Password"}
            </label>
            <div className="relative">
              <Input
                id="new"
                type={showNew ? "text" : "password"}
                autoComplete="new-password"
                placeholder={isDe ? "Neues Passwort eingeben" : "Enter new password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) setErrors({ ...errors, newPassword: undefined });
                }}
                className={errors.newPassword ? "border-destructive h-12 pr-10" : "h-12 pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && <p className="text-destructive text-xs">{errors.newPassword}</p>}
          </div>

          {/* Confirm Password */}
          <div className="space-y-3">
            <label htmlFor="confirm" className="text-foreground text-lg font-medium">
              {isDe ? "Neues Passwort bestätigen" : "Confirm New Password"}
            </label>
            <div className="relative">
              <Input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder={isDe ? "Neues Passwort bestätigen" : "Confirm new password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                }}
                className={errors.confirmPassword ? "border-destructive h-12 pr-10" : "h-12 pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-destructive text-xs">{errors.confirmPassword}</p>}
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
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 w-full text-base"
          >
            {isSaving ? (isDe ? "Speichern…" : "Saving…") : isDe ? "Änderungen speichern" : "Save Changes"}
          </Button>
        </form>
      </div>
    </div>
  );
}
