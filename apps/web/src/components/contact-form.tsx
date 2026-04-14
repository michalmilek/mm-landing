import { ScrollFadeIn } from "./scroll-fade-in";
import { SectionHeading } from "./section-heading";
import { Send } from "lucide-react";
import { useLanguageStore } from "@/lib/language-store";

export function ContactForm() {
  const { t } = useLanguageStore();

  return (
    <section id="contact" className="relative z-10 py-20 px-4 pb-32">
      <div className="mx-auto max-w-3xl glass-panel rounded-xl border border-matrix-border p-8">
        <SectionHeading command="mail --compose" />
        <ScrollFadeIn>
          <form
            action="mailto:your@email.com"
            method="POST"
            encType="text/plain"
            className="max-w-md space-y-4"
          >
            <div>
              <input
                type="email"
                name="email"
                placeholder={t.contact.email}
                required
                className="w-full rounded-md border border-matrix-border bg-[#111] px-3 py-2 font-mono text-sm text-matrix caret-matrix placeholder:text-matrix/30 focus:outline-none focus:ring-1 focus:ring-matrix/50"
              />
            </div>
            <div>
              <input
                type="text"
                name="subject"
                placeholder={t.contact.subject}
                required
                className="w-full rounded-md border border-matrix-border bg-[#111] px-3 py-2 font-mono text-sm text-matrix caret-matrix placeholder:text-matrix/30 focus:outline-none focus:ring-1 focus:ring-matrix/50"
              />
            </div>
            <div>
              <textarea
                name="message"
                placeholder={t.contact.message}
                rows={4}
                required
                className="w-full resize-none rounded-md border border-matrix-border bg-[#111] px-3 py-2 font-mono text-sm text-matrix caret-matrix placeholder:text-matrix/30 focus:outline-none focus:ring-1 focus:ring-matrix/50"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-md bg-matrix px-5 py-2.5 font-mono text-sm font-bold text-matrix-foreground transition-all duration-300 hover:box-glow"
            >
              <Send size={14} />
              {t.contact.send}
            </button>
          </form>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
