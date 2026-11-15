import { cn } from "@/lib/utils";

/** SVG flags: Windows does not render flag emoji, so 🇬🇧 / 🇩🇪 would show up as "GB" / "DE" letters. */
export function LanguageFlag({ language, className }: { language: "EN" | "DE"; className?: string }) {
  return (
    <span className={cn("inline-flex h-3.5 w-5 shrink-0 overflow-hidden rounded-[3px] border border-black/10", className)}>
      {language === "EN" ? (
        <svg viewBox="0 0 60 30" className="h-full w-full" preserveAspectRatio="none" aria-hidden>
          <clipPath id="uk-flag-clip">
            <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
          </clipPath>
          <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
          <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-flag-clip)" stroke="#C8102E" strokeWidth="4" />
          <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
          <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
        </svg>
      ) : (
        <svg viewBox="0 0 5 3" className="h-full w-full" preserveAspectRatio="none" aria-hidden>
          <rect width="5" height="1" y="0" fill="#000" />
          <rect width="5" height="1" y="1" fill="#DD0000" />
          <rect width="5" height="1" y="2" fill="#FFCE00" />
        </svg>
      )}
    </span>
  );
}
