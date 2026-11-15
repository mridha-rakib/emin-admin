"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { apiRequest, type ApiPage } from "@/lib/api";
import { useTranslation } from "@/context/LanguageContext";

type ServiceItem = {
  _id: string;
  title: string;
  providerName?: string;
  role?: string;
  category?: string;
  featured?: boolean;
  images?: string[];
  status?: string;
};

export default function FeaturedServicesPanel() {
  const { language } = useTranslation();
  const isDe = language === "DE";
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<ApiPage<ServiceItem>>("/services?page=1&limit=100")
      .then((page) => setServices(page.items ?? []))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load services."));
  }, []);

  async function toggleFeatured(service: ServiceItem) {
    setBusyId(service._id);
    setError("");
    try {
      const updated = await apiRequest<ServiceItem>(`/services/${service._id}`, {
        method: "PATCH",
        body: JSON.stringify({ payload: { featured: !service.featured } }),
      });
      setServices((current) =>
        current.map((item) => (item._id === service._id ? { ...item, featured: Boolean(updated.featured) } : item)),
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not update the featured service.");
    } finally {
      setBusyId(null);
    }
  }

  const featuredCount = services.filter((service) => service.featured).length;

  return (
    <section className="bg-card border border-border rounded-xl p-5 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            {isDe ? "Auf der Startseite hervorheben" : "Featured on the homepage"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isDe
              ? "Wählen Sie, welche Dienste mit Bild, Anbietername und Rolle auf der Startseite erscheinen."
              : "Choose which services appear on the homepage with their image, provider name and role."}
          </p>
        </div>
        <p className="text-xs font-semibold text-muted-foreground">
          {featuredCount} {isDe ? "hervorgehoben" : "featured"}
        </p>
      </div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {services.map((service) => (
          <div key={service._id} className="flex items-center gap-3 rounded-lg border border-border p-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
              {service.images?.[0] && (
                <img src={service.images[0]} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{service.providerName || service.title}</p>
              <p className="truncate text-xs text-muted-foreground">{service.role || service.category || "—"}</p>
            </div>
            <button
              type="button"
              disabled={busyId === service._id}
              onClick={() => void toggleFeatured(service)}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                service.featured
                  ? "border-amber-300 bg-amber-50 text-amber-700"
                  : "border-border text-muted-foreground"
              }`}
            >
              <Star className={`h-3.5 w-3.5 ${service.featured ? "fill-amber-400 text-amber-500" : ""}`} />
              {service.featured ? (isDe ? "Hervorgehoben" : "Featured") : isDe ? "Hervorheben" : "Feature"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
