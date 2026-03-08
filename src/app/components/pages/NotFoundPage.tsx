import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "../LanguageContext";

export function NotFoundPage() {
  const { lang } = useLanguage();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <h1
        className="mb-4"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "6rem",
          fontWeight: 300,
          lineHeight: 1,
          color: "rgba(0,0,0,0.1)",
        }}
      >
        404
      </h1>
      <p className="text-black/50 text-[0.9rem] mb-8" style={{ fontWeight: 300 }}>
        {lang === "de"
          ? "Diese Seite existiert leider nicht."
          : "This page does not exist."}
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-black border border-black px-6 py-3 text-[0.8rem] tracking-[0.15em] uppercase no-underline hover:bg-black hover:text-white transition-all duration-300"
        style={{ fontWeight: 400 }}
      >
        <ArrowLeft size={14} />
        {lang === "de" ? "Zurück zur Startseite" : "Back to home"}
      </Link>
    </div>
  );
}
