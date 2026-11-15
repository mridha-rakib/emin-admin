"use client";

export type CategoryDetails = {
  nameDe: string;
  image: string;
  priceCHF: string;
  professionalCount: string;
  rating: string;
  reviewCount: string;
  featured: boolean;
};

export const emptyCategoryDetails = (): CategoryDetails => ({
  nameDe: "",
  image: "",
  priceCHF: "",
  professionalCount: "",
  rating: "",
  reviewCount: "",
  featured: false,
});

export function CategoryDetailsFields({
  value,
  onChange,
  isDe,
}: {
  value: CategoryDetails;
  onChange: (value: CategoryDetails) => void;
  isDe: boolean;
}) {
  const set = (patch: Partial<CategoryDetails>) => onChange({ ...value, ...patch });
  const field = (id: keyof CategoryDetails, label: string, placeholder: string, type: "text" | "number" = "text") => (
    <div className="space-y-2">
      <label htmlFor={id} className="text-foreground text-sm font-medium">{label}</label>
      <input
        id={id}
        type={type}
        min={type === "number" ? "0" : undefined}
        step={id === "rating" ? "0.1" : "1"}
        placeholder={placeholder}
        value={String(value[id] ?? "")}
        onChange={(event) => set({ [id]: event.target.value })}
        className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
      />
    </div>
  );

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <p className="text-sm font-semibold">{isDe ? "Startseiten-Details" : "Homepage details"}</p>
      {field("nameDe", isDe ? "Deutscher Name" : "German name", isDe ? "z. B. Handwerk & Gewerbe" : "e.g. Handwerk & Gewerbe")}
      {field("image", isDe ? "Bild-URL" : "Image URL", "https://")}
      <div className="grid grid-cols-2 gap-3">
        {field("priceCHF", isDe ? "Preis ab (CHF/Std.)" : "Price from (CHF/hr)", "45", "number")}
        {field("professionalCount", isDe ? "Anzahl Profis" : "Professionals", "180", "number")}
        {field("rating", isDe ? "Bewertung" : "Rating", "4.9", "number")}
        {field("reviewCount", isDe ? "Bewertungen" : "Reviews", "500", "number")}
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" checked={value.featured} onChange={(event) => set({ featured: event.target.checked })} />
        {isDe ? "Auf der Startseite hervorheben" : "Featured on the homepage"}
      </label>
    </div>
  );
}
