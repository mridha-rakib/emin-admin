"use client";

import { X, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/context/LanguageContext";
import { SessionExpiredError } from "@/lib/api";
import { toNumber } from "@/lib/admin-api";

export interface SubscriptionPlan {
  _id: string;
  name: string;
  slug: string;
  monthlyPrice: unknown;
  yearlyPrice?: unknown;
  currency?: string;
  description?: string;
  features?: string[];
  notIncluded?: string[];
  popular?: boolean;
  active?: boolean;
  createdAt?: string;
}

export interface PlanFormValues {
  name: string;
  slug: string;
  monthlyPrice: string;
  yearlyPrice?: string;
  currency: string;
  description: string;
  features: string[];
  notIncluded: string[];
  popular: boolean;
  active: boolean;
}

interface ManageSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
  onSave: (values: PlanFormValues) => Promise<void>;
}

const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const inputClass =
  "dark:bg-sidebar w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0D2357] focus:border-[#F4B057] focus:outline-none dark:border-[#F4B057] dark:text-white";

export function ManageSubscriptionModal(props: ManageSubscriptionModalProps) {
  if (!props.isOpen) return null;
  return <PlanForm key={props.plan?._id ?? "new"} {...props} />;
}

function PlanForm({ onClose, plan, onSave }: ManageSubscriptionModalProps) {
  const { language, t } = useTranslation();
  const isDe = language === "DE";
  const isEdit = Boolean(plan);

  const [name, setName] = useState(plan?.name ?? "");
  const [slug, setSlug] = useState(plan?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(plan));
  const [monthlyPrice, setMonthlyPrice] = useState(plan ? toNumber(plan.monthlyPrice).toFixed(2) : "");
  const [yearlyPrice, setYearlyPrice] = useState(
    plan?.yearlyPrice != null ? toNumber(plan.yearlyPrice).toFixed(2) : "",
  );
  const [description, setDescription] = useState(plan?.description ?? "");
  const [features, setFeatures] = useState<string[]>(plan?.features?.length ? plan.features : [""]);
  const [notIncluded, setNotIncluded] = useState<string[]>(plan?.notIncluded?.length ? plan.notIncluded : []);
  const [popular, setPopular] = useState(plan?.popular ?? false);
  const [active, setActive] = useState(plan?.active ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    const monthly = Number(monthlyPrice);
    const yearly = yearlyPrice.trim() ? Number(yearlyPrice) : undefined;
    const finalSlug = slugify(slug || name);
    if (!name.trim()) return setError(isDe ? "Bitte einen Tarifnamen angeben." : "Please enter a plan name.");
    if (!finalSlug) return setError(isDe ? "Bitte einen gültigen Slug angeben." : "Please enter a valid slug.");
    if (!monthlyPrice.trim() || !Number.isFinite(monthly) || monthly < 0)
      return setError(isDe ? "Bitte einen gültigen Monatspreis angeben." : "Please enter a valid monthly price.");
    if (yearly !== undefined && (!Number.isFinite(yearly) || yearly < 0))
      return setError(isDe ? "Bitte einen gültigen Jahrespreis angeben." : "Please enter a valid yearly price.");

    setIsSaving(true);
    setError("");
    try {
      await onSave({
        name: name.trim(),
        slug: finalSlug,
        monthlyPrice: monthly.toFixed(2),
        yearlyPrice: yearly !== undefined ? yearly.toFixed(2) : undefined,
        currency: "CHF",
        description: description.trim(),
        features: features.map((f) => f.trim()).filter(Boolean),
        notIncluded: notIncluded.map((f) => f.trim()).filter(Boolean),
        popular,
        active,
      });
      onClose();
    } catch (saveError) {
      if (saveError instanceof SessionExpiredError) return;
      const message = saveError instanceof Error ? saveError.message : "";
      setError(
        /duplicate|E11000/i.test(message)
          ? isDe ? "Dieser Slug wird bereits verwendet." : "This slug is already in use."
          : message || (isDe ? "Tarif konnte nicht gespeichert werden." : "Could not save the plan."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const updateFeature = (index: number, value: string) =>
    setFeatures((prev) => prev.map((feature, i) => (i === index ? value : feature)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="dark:bg-sidebar max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-[#E2E8F0] bg-white shadow-lg dark:border-[#F4B057]">
        <div className="dark:bg-sidebar sticky top-0 z-10 flex items-center justify-between border-b border-[#E2E8F0] bg-white p-4 dark:border-[#F4B057]/30">
          <h2 className="text-lg font-semibold text-[#0D2357] dark:text-white">
            {isEdit ? (isDe ? "Tarif bearbeiten" : "Edit plan") : isDe ? "Neuen Tarif erstellen" : "Create new plan"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-[#0D2357] transition-colors hover:bg-gray-100 dark:text-white dark:hover:bg-[#F4B057]/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#0D2357] dark:text-white">
                {t.subscription.planNameLabel}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#0D2357] dark:text-white">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                onBlur={() => setSlug(slugify(slug))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#0D2357] dark:text-white">
                {isDe ? "Monatspreis (CHF)" : "Monthly price (CHF)"}
              </label>
              <input
                type="number"
                min="0"
                step="0.05"
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#0D2357] dark:text-white">
                {isDe ? "Jahrespreis (CHF, optional)" : "Yearly price (CHF, optional)"}
              </label>
              <input
                type="number"
                min="0"
                step="0.05"
                value={yearlyPrice}
                onChange={(e) => setYearlyPrice(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#0D2357] dark:text-white">
              {isDe ? "Beschreibung" : "Description"}
            </label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={inputClass} />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[#0D2357] dark:text-white">
            <input type="checkbox" checked={popular} onChange={(e) => setPopular(e.target.checked)} className="h-4 w-4 accent-[#F4B057]" />
            {isDe ? "Als beliebtesten Tarif markieren" : "Mark as most popular"}
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[#0D2357] dark:text-white">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 accent-[#F4B057]"
            />
            {isDe ? "Tarif aktiv (für Kunden buchbar)" : "Plan active (available to customers)"}
          </label>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-[#0D2357] dark:text-white">
                {t.subscription.featuresLabel}
              </label>
              <button
                type="button"
                onClick={() => setFeatures((prev) => [...prev, ""])}
                className="flex items-center gap-1 rounded-md bg-[#F4B057] px-2 py-1 text-xs text-white hover:bg-[#F4B057]/90"
              >
                <Plus className="h-3 w-3" />
                {t.subscription.addFeature}
              </button>
            </div>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    className={`${inputClass} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={() => setFeatures((prev) => prev.filter((_, i) => i !== index))}
                    className="rounded-md border border-red-200 p-2 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-[#0D2357] dark:text-white">
                {isDe ? "Nicht enthalten" : "Not included"}
              </label>
              <button type="button" onClick={() => setNotIncluded((prev) => [...prev, ""])} className="flex items-center gap-1 rounded-md border border-[#F4B057] px-2 py-1 text-xs text-[#0D2357] dark:text-white">
                <Plus className="h-3 w-3" />
                {t.subscription.addFeature}
              </button>
            </div>
            <div className="space-y-2">
              {notIncluded.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input type="text" value={feature} onChange={(e) => setNotIncluded((prev) => prev.map((item, i) => i === index ? e.target.value : item))} className={`${inputClass} flex-1`} />
                  <button type="button" onClick={() => setNotIncluded((prev) => prev.filter((_, i) => i !== index))} className="rounded-md border border-red-200 p-2 text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
        </div>

        <div className="dark:bg-sidebar sticky bottom-0 flex justify-end gap-3 border-t border-[#E2E8F0] bg-white p-4 dark:border-[#F4B057]/30">
          <button
            onClick={onClose}
            className="dark:bg-sidebar rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#0D2357] transition-colors hover:bg-gray-50 dark:border-[#F4B057] dark:text-white dark:hover:bg-[#F4B057]/10"
          >
            {t.common.cancel}
          </button>
          <button
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="rounded-lg border border-[#F4B057] bg-[#F4B057] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#F4B057]/90 disabled:opacity-60"
          >
            {isSaving ? (isDe ? "Speichern…" : "Saving…") : t.common.save}
          </button>
        </div>
      </div>
    </div>
  );
}
