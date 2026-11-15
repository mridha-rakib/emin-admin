"use client";

import CmsPageEditor from "../_components/CmsPageEditor";
import { useTranslation } from "@/context/LanguageContext";

const ENGLISH = `<p>Last updated: May 2026. This Privacy Policy applies to all users of the Odaboo marketplace.</p><h2>1. Information We Collect</h2><p>We collect personal information, payment information, and platform usage data strictly to deliver quality services.</p><h2>2. How We Use Information</h2><p>Your data is primarily used to match clients with professionals, process transactions securely, and enhance the overall experience.</p><h2>3. Data Security</h2><p>We implement industry-standard encryption protocols in transit and at rest to safeguard your personal credentials and information.</p>`;

const GERMAN = `<p>Zuletzt aktualisiert: Mai 2026. Diese Datenschutzerklärung gilt für alle Nutzer des Odaboo-Marktplatzes.</p><h2>1. Erfasste Informationen</h2><p>Wir erfassen personenbezogene Daten, Zahlungsinformationen und Nutzungsdaten ausschließlich zur Erbringung unserer Dienste.</p><h2>2. Verwendung der Daten</h2><p>Ihre Daten werden primär verwendet, um Kunden mit passenden Fachkräften zu verbinden und Zahlungen sicher abzuwickeln.</p><h2>3. Datensicherheit</h2><p>Wir verwenden moderne Verschlüsselungsstandards bei der Übertragung und Speicherung, um Ihre Daten bestmöglich zu schützen.</p>`;

export default function PrivacyPolicyPage() {
  const { language } = useTranslation();
  const isDe = language === "DE";
  return (
    <CmsPageEditor
      slug="privacy-policy"
      title="Privacy Policy"
      heading={isDe ? "Datenschutzerklärung" : "Privacy Policy"}
      placeholder={isDe ? "Datenschutzerklärung schreiben…" : "Write privacy policy..."}
      initialContent={isDe ? GERMAN : ENGLISH}
    />
  );
}
