"use client";

import CmsPageEditor from "../_components/CmsPageEditor";
import { useTranslation } from "@/context/LanguageContext";

const ENGLISH = `<p>Last updated: May 2026. These Terms of Service constitute a legally binding agreement made between you and Odaboo concerning your access to and use of our marketplace.</p><h2>1. Acceptance of Terms</h2><p>By creating an account, accessing, or using the Odaboo platform, you agree to comply with all applicable laws and these Terms of Service. If you do not agree with any part of these terms, you are prohibited from using our platform.</p><h2>2. User Responsibilities</h2><p>As a user of the Odaboo platform (whether a Client or a Professional), you are responsible for maintaining account confidentiality and communicating professionally.</p><h2>3. Dispute Resolution</h2><p>Any disputes between Clients and Professionals must first be addressed directly between the parties. Odaboo's support team is available to assist in mediation.</p>`;

const GERMAN = `<p>Zuletzt aktualisiert: Mai 2026. Diese Nutzungsbedingungen stellen eine rechtsverbindliche Vereinbarung zwischen Ihnen und Odaboo dar.</p><h2>1. Annahme der Bedingungen</h2><p>Mit der Erstellung eines Kontos und der Nutzung von Odaboo erklären Sie sich mit allen geltenden Gesetzen und diesen Bedingungen einverstanden.</p><h2>2. Pflichten der Nutzer</h2><p>Als Nutzer der Plattform (Kunde oder Dienstleister) sind Sie für die Vertraulichkeit Ihres Kontos und professionelle Kommunikation verantwortlich.</p><h2>3. Streitbeilegung</h2><p>Streitigkeiten zwischen Kunden und Dienstleistern sollten zunächst direkt geklärt werden. Das Odaboo-Supportteam steht vermittelnd zur Seite.</p>`;

export default function TermsConditionsPage() {
  const { language } = useTranslation();
  const isDe = language === "DE";
  return (
    <CmsPageEditor
      slug="terms-conditions"
      title="Terms & Conditions"
      heading={isDe ? "Allgemeine Geschäftsbedingungen" : "Terms & Conditions"}
      placeholder={isDe ? "AGB schreiben…" : "Write terms and conditions..."}
      initialContent={isDe ? GERMAN : ENGLISH}
    />
  );
}
