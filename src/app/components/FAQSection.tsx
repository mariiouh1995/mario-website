import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { SectionReveal } from "./SectionReveal";
import type { FAQCategory } from "./faqData";

interface FAQSectionProps {
  categories: FAQCategory[];
  title?: { de: string; en: string };
  bg?: "white" | "cream";
}

export function FAQSection({ categories, title, bg = "white" }: FAQSectionProps) {
  const { lang } = useLanguage();
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState(categories[0]?.key ?? "");

  const showTabs = categories.length > 1;
  const currentCategory = categories.find((c) => c.key === activeCategory) ?? categories[0];
  const faqs = currentCategory?.items ?? [];

  const defaultTitle = {
    de: "Häufige Fragen",
    en: "Frequently Asked Questions",
  };
  const sectionTitle = title ?? defaultTitle;

  return (
    <section className={`py-24 md:py-32 px-4 ${bg === "cream" ? "bg-[#f8f7f5]" : ""}`}>
      <div className="max-w-3xl mx-auto">
        <SectionReveal>
          <div className="text-center mb-12">
            <p
              className="text-[0.75rem] tracking-[0.3em] uppercase text-black/40 mb-4"
              style={{ fontWeight: 400 }}
            >
              FAQ
            </p>
            <h2
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 300,
              }}
            >
              {sectionTitle[lang]}
            </h2>
          </div>
        </SectionReveal>

        {/* Category Tabs */}
        {showTabs && (
          <SectionReveal>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-12">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => {
                    setActiveCategory(cat.key);
                    setOpenFaq(null);
                  }}
                  className="bg-transparent border-none cursor-pointer px-1 py-2 transition-all duration-300"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "0.78rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    fontWeight: activeCategory === cat.key ? 500 : 300,
                    color: activeCategory === cat.key ? "black" : "rgba(0,0,0,0.35)",
                    borderBottom:
                      activeCategory === cat.key
                        ? "1px solid black"
                        : "1px solid transparent",
                  }}
                >
                  {cat.label[lang]}
                </button>
              ))}
            </div>
          </SectionReveal>
        )}

        {/* FAQ Accordion */}
        <div className="flex flex-col">
          {faqs.map((faq, i) => {
            const faqKey = `${activeCategory}-${i}`;
            const isOpen = openFaq === faqKey;
            return (
              <SectionReveal key={faqKey} delay={i * 0.04}>
                <div className="border-b border-black/10">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : faqKey)}
                    className="w-full flex items-center justify-between py-5 px-1 bg-transparent border-none cursor-pointer text-left group"
                  >
                    <span
                      className="text-[0.92rem] pr-4 group-hover:text-black transition-colors"
                      style={{
                        fontWeight: 400,
                        color: isOpen ? "black" : "rgba(0,0,0,0.7)",
                      }}
                    >
                      {faq.q[lang]}
                    </span>
                    <ChevronDown
                      size={18}
                      className="flex-shrink-0 text-black/30 transition-transform duration-300"
                      style={{
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{
                      maxHeight: isOpen ? "400px" : "0px",
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    <p
                      className="text-black/50 text-[0.87rem] pb-5 px-1"
                      style={{ lineHeight: 1.75, fontWeight: 300 }}
                    >
                      {faq.a[lang]}
                    </p>
                  </div>
                </div>
              </SectionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
