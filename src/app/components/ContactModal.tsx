import { useState, createContext, useContext, useCallback } from "react";
import { X, Send, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "./LanguageContext";

// ── Types ──
export type InquiryCategory = "wedding" | "animal" | "portrait" | "general";

interface ContactModalContextType {
  openContact: (category?: InquiryCategory) => void;
  closeContact: () => void;
}

const ContactModalContext = createContext<ContactModalContextType>({
  openContact: () => {},
  closeContact: () => {},
});

export const useContactModal = () => useContext(ContactModalContext);

// ── Send emails via Vercel serverless function ──
async function sendEmails(formData: FormState): Promise<boolean> {
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        foundVia: formData.foundVia,
        interests: formData.interests,
        date: formData.date,
        weddingGuide: formData.weddingGuide,
        message: formData.message,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Error:", errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send emails:", error);
    return false;
  }
}

// ── Form State ──
interface FormState {
  name: string;
  email: string;
  phone: string;
  foundVia: string;
  interests: string[];
  date: string;
  weddingGuide: boolean;
  message: string;
  privacyConsent: boolean;
}

const initialForm: FormState = {
  name: "",
  email: "",
  phone: "",
  foundVia: "",
  interests: [],
  date: "",
  weddingGuide: false,
  message: "",
  privacyConsent: false,
};

// ── Interest options per category ──
function getInterestOptions(category: InquiryCategory, lang: string) {
  const isDE = lang === "de";
  switch (category) {
    case "wedding":
      return [
        { value: "Hochzeit Foto", label: isDE ? "Hochzeit Foto" : "Wedding Photo" },
        { value: "Hochzeit Video", label: isDE ? "Hochzeit Video" : "Wedding Video" },
        { value: "Kombi: Foto & Mini Video", label: isDE ? "Kombi: Foto & Mini Video" : "Combo: Photo & Mini Video" },
        { value: "Andere", label: isDE ? "Andere" : "Other" },
      ];
    case "animal":
      return [
        { value: "Tierfotografie Studio", label: isDE ? "Tierfotografie Studio" : "Animal Photo Studio" },
        { value: "Tierfotografie Outdoor", label: isDE ? "Tierfotografie Outdoor" : "Animal Photo Outdoor" },
        { value: "Kombi Tier + Besitzer", label: isDE ? "Kombi Tier + Besitzer" : "Combo Pet + Owner" },
        { value: "Andere", label: isDE ? "Andere" : "Other" },
      ];
    case "portrait":
      return [
        { value: "Couple Shooting", label: "Couple Shooting" },
        { value: "Familienshooting", label: isDE ? "Familienshooting" : "Family Shooting" },
        { value: "Taufe", label: isDE ? "Taufe" : "Baptism" },
        { value: "Privater Anlass", label: isDE ? "Privater Anlass" : "Private Occasion" },
        { value: "Andere", label: isDE ? "Andere" : "Other" },
      ];
    default:
      return [
        { value: "Hochzeit Foto", label: isDE ? "Hochzeit Foto" : "Wedding Photo" },
        { value: "Hochzeit Video", label: isDE ? "Hochzeit Video" : "Wedding Video" },
        { value: "Tierfotografie", label: isDE ? "Tierfotografie" : "Animal Photography" },
        { value: "Couple Shooting", label: "Couple Shooting" },
        { value: "Familienshooting", label: isDE ? "Familienshooting" : "Family Shooting" },
        { value: "Andere", label: isDE ? "Andere" : "Other" },
      ];
  }
}

// ── Provider ──
export function ContactModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<InquiryCategory>("general");

  const openContact = useCallback((cat?: InquiryCategory) => {
    setCategory(cat || "general");
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeContact = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = "";
  }, []);

  return (
    <ContactModalContext.Provider value={{ openContact, closeContact }}>
      {children}
      <ContactModalInner isOpen={isOpen} onClose={closeContact} category={category} />
    </ContactModalContext.Provider>
  );
}

// ── Modal ──
function ContactModalInner({
  isOpen,
  onClose,
  category,
}: {
  isOpen: boolean;
  onClose: () => void;
  category: InquiryCategory;
}) {
  const { lang } = useLanguage();
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const isDE = lang === "de";
  const interestOptions = getInterestOptions(category, lang);
  const showWeddingGuide = category === "wedding" || form.interests.some((i) => i.includes("Hochzeit") || i.includes("Wedding"));

  const handleChange = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (value: string) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(value)
        ? prev.interests.filter((i) => i !== value)
        : [...prev.interests, value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.privacyConsent) return;
    setStatus("sending");
    const success = await sendEmails(form);
    setStatus(success ? "success" : "error");
    if (success) {
      setTimeout(() => {
        setForm(initialForm);
        setStatus("idle");
        onClose();
      }, 3000);
    }
  };

  const handleClose = () => {
    if (status === "sending") return;
    setForm(initialForm);
    setStatus("idle");
    onClose();
  };

  const t = {
    title: isDE ? "Eure Reise beginnt" : "Your journey begins",
    titleItalic: isDE ? "hier" : "here",
    subtitle: isDE
      ? "Erzählt mir von euren Vorstellungen und Plänen. Ich bin gespannt, mehr über euch zu erfahren. Ihr hört in der Regel innerhalb von 48 Stunden von mir."
      : "Tell me about your ideas and plans. I'm excited to learn more about you. You'll usually hear from me within 48 hours.",
    name: isDE ? "Vorname, Nachname*" : "First name, Last name*",
    email: "E-Mail*",
    phone: isDE ? "Telefon*" : "Phone*",
    foundVia: isDE ? "Wie habt ihr mich gefunden?" : "How did you find me?",
    interest: isDE ? "Wofür interessiert ihr euch?" : "What are you interested in?",
    date: isDE ? "Voraussichtliches Datum" : "Estimated Date",
    weddingGuide: isDE ? "Ich möchte den kostenlosen Wedding Guide erhalten" : "I'd like to receive the free Wedding Guide",
    message: isDE ? "Erzählt mir von euren Plänen!" : "Tell me about your plans!",
    messagePlaceholder: isDE ? "Was stellt ihr euch genau vor?" : "What exactly do you have in mind?",
    submit: isDE ? "Absenden" : "Send",
    sending: isDE ? "Wird gesendet..." : "Sending...",
    success: isDE ? "Vielen Dank! Ich melde mich bald bei euch." : "Thank you! I'll get back to you soon.",
    error: isDE ? "Etwas ist schiefgelaufen. Bitte versucht es erneut." : "Something went wrong. Please try again.",
    privacy: isDE
      ? "Ich stimme der Verarbeitung meiner Daten gemäß der Datenschutzerklärung zu.*"
      : "I agree to the processing of my data according to the privacy policy.*",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-2xl mx-4 my-8 md:my-16 bg-white z-10"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 bg-transparent border-none cursor-pointer p-2 text-black/40 hover:text-black transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Success State */}
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-12 md:p-16 text-center flex flex-col items-center justify-center min-h-[400px]"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <CheckCircle size={48} className="text-green-600 mb-6" />
                  </motion.div>
                  <h3
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.8rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                    }}
                  >
                    {isDE ? "Danke!" : "Thank you!"}
                  </h3>
                  <p
                    className="text-black/55 text-[0.9rem] max-w-sm"
                    style={{ lineHeight: 1.7, fontWeight: 300 }}
                  >
                    {t.success}
                  </p>
                </motion.div>
              ) : (
                <motion.div key="form" className="p-8 md:p-12">
                  {/* Header */}
                  <div className="mb-8">
                    <h2
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                        fontWeight: 700,
                        lineHeight: 1.1,
                        marginBottom: "1rem",
                      }}
                    >
                      {t.title}{" "}
                      <span style={{ fontStyle: "italic" }}>{t.titleItalic}</span>
                    </h2>
                    <p
                      className="text-black/50 text-[0.85rem]"
                      style={{ lineHeight: 1.7, fontWeight: 300 }}
                    >
                      {t.subtitle}
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div>
                      <label
                        className="block text-[0.82rem] mb-2"
                        style={{ fontWeight: 600 }}
                      >
                        {t.name}
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className="w-full border-b border-black/20 focus:border-black outline-none py-2 text-[0.9rem] bg-transparent transition-colors"
                        style={{ fontWeight: 300 }}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        className="block text-[0.82rem] mb-2"
                        style={{ fontWeight: 600 }}
                      >
                        {t.email}
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="w-full border-b border-black/20 focus:border-black outline-none py-2 text-[0.9rem] bg-transparent transition-colors"
                        style={{ fontWeight: 300 }}
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label
                        className="block text-[0.82rem] mb-2"
                        style={{ fontWeight: 600 }}
                      >
                        {t.phone}
                      </label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        className="w-full border-b border-black/20 focus:border-black outline-none py-2 text-[0.9rem] bg-transparent transition-colors"
                        style={{ fontWeight: 300 }}
                      />
                    </div>

                    {/* Found via */}
                    <div>
                      <label
                        className="block text-[0.82rem] mb-2"
                        style={{ fontWeight: 600 }}
                      >
                        {t.foundVia}
                      </label>
                      <input
                        type="text"
                        value={form.foundVia}
                        onChange={(e) => handleChange("foundVia", e.target.value)}
                        className="w-full border-b border-black/20 focus:border-black outline-none py-2 text-[0.9rem] bg-transparent transition-colors"
                        style={{ fontWeight: 300 }}
                      />
                    </div>

                    {/* Interests */}
                    <div>
                      <label
                        className="block text-[0.82rem] mb-3"
                        style={{ fontWeight: 600 }}
                      >
                        {t.interest}
                      </label>
                      <div className="flex flex-wrap gap-x-6 gap-y-2">
                        {interestOptions.map((opt) => (
                          <label
                            key={opt.value}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={form.interests.includes(opt.value)}
                              onChange={() => toggleInterest(opt.value)}
                              className="accent-black cursor-pointer"
                            />
                            <span
                              className="text-[0.82rem] text-black/70"
                              style={{ fontWeight: 300 }}
                            >
                              {opt.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Date */}
                    <div>
                      <label
                        className="block text-[0.82rem] mb-2"
                        style={{ fontWeight: 600 }}
                      >
                        {t.date}
                      </label>
                      <input
                        type="text"
                        value={form.date}
                        onChange={(e) => handleChange("date", e.target.value)}
                        className="w-full border-b border-black/20 focus:border-black outline-none py-2 text-[0.9rem] bg-transparent transition-colors"
                        style={{ fontWeight: 300 }}
                      />
                    </div>

                    {/* Wedding Guide checkbox */}
                    {showWeddingGuide && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.weddingGuide}
                          onChange={(e) => handleChange("weddingGuide", e.target.checked)}
                          className="accent-black cursor-pointer"
                        />
                        <span
                          className="text-[0.82rem] text-black/70"
                          style={{ fontWeight: 300 }}
                        >
                          {t.weddingGuide}
                        </span>
                      </label>
                    )}

                    {/* Message */}
                    <div>
                      <label
                        className="block text-[0.82rem] mb-2"
                        style={{ fontWeight: 600 }}
                      >
                        {t.message}
                      </label>
                      <textarea
                        rows={4}
                        value={form.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        placeholder={t.messagePlaceholder}
                        className="w-full border border-black/15 focus:border-black outline-none p-3 text-[0.9rem] bg-transparent transition-colors resize-y"
                        style={{ fontWeight: 300 }}
                      />
                    </div>

                    {/* Privacy consent */}
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={form.privacyConsent}
                        onChange={(e) => handleChange("privacyConsent", e.target.checked)}
                        className="accent-black cursor-pointer mt-1"
                      />
                      <span
                        className="text-[0.78rem] text-black/50"
                        style={{ lineHeight: 1.5, fontWeight: 300 }}
                      >
                        {t.privacy}
                      </span>
                    </label>

                    {/* Error message */}
                    {status === "error" && (
                      <p className="text-red-600 text-[0.82rem]" style={{ fontWeight: 400 }}>
                        {t.error}
                      </p>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={status === "sending" || !form.privacyConsent}
                      className="w-full bg-black text-white py-4 text-[0.82rem] tracking-[0.15em] uppercase cursor-pointer border border-black hover:bg-black/85 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{ fontWeight: 400 }}
                    >
                      {status === "sending" ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          {t.sending}
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          {t.submit}
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}