import { cn } from "@mm-landing/ui/lib/utils";
import { useLanguageStore } from "@/lib/language-store";

export function LanguageToggle() {
  const { locale, setLocale } = useLanguageStore();

  return (
    <div className="flex items-center gap-1 font-mono text-xs">
      <button
        type="button"
        onClick={() => setLocale("pl")}
        className={cn(
          "px-1.5 py-0.5 rounded transition-colors",
          locale === "pl" ? "text-matrix bg-matrix-dim" : "text-matrix/40 hover:text-matrix/70",
        )}
      >
        PL
      </button>
      <span className="text-matrix/20">/</span>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn(
          "px-1.5 py-0.5 rounded transition-colors",
          locale === "en" ? "text-matrix bg-matrix-dim" : "text-matrix/40 hover:text-matrix/70",
        )}
      >
        EN
      </button>
    </div>
  );
}
