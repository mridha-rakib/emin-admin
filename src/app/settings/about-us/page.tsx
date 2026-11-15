"use client";

import CmsPageEditor from "../_components/CmsPageEditor";
import { useTranslation } from "@/context/LanguageContext";

export default function AboutUsPage() {
  const { language } = useTranslation();
  const isDe = language === "DE";
  return (
    <CmsPageEditor
      slug="about-us"
      title="About Us"
      heading={isDe ? "Über uns" : "About Us"}
      placeholder={isDe ? "Schreiben Sie über uns…" : "Write about us..."}
    />
  );
}
