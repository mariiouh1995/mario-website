import { useState, useMemo, createContext, useContext, useCallback } from "react";
import { X, Send, CheckCircle, Loader2, ChevronDown, ChevronUp, Calculator, Heart, Camera, User, ArrowRight, ArrowLeft, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "./LanguageContext";
import { usePackages, type PackageData, type AddOnData } from "./usePackages";

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

// ── Price parser ──
function parsePrice(priceStr: string): number {
  const cleaned = priceStr.replace(/[^\d.,]/g, "").replace(/\.$/, "");
  if (cleaned.includes(".") && cleaned.includes(",")) {
    return parseFloat(cleaned.replace(/\./g, "").replace(",", "."));
  }
  if (cleaned.includes(".") && cleaned.split(".").pop()!.length === 3) {
    return parseFloat(cleaned.replace(/\./g, ""));
  }
  if (cleaned.includes(",")) {
    return parseFloat(cleaned.replace(",", "."));
  }
  return parseFloat(cleaned) || 0;
}

function parseAddonPrice(addonText: string): number {
  const matchBefore = addonText.match(/€\s*(\d[\d.,]*)/);
  if (matchBefore) return parsePrice(matchBefore[1] + "€");
  const matchAfter = addonText.match(/(\d[\d.,]*)\s*€/);
  if (matchAfter) return parsePrice(matchAfter[1] + "€");
  return 0;
}

function formatPrice(amount: number): string {
  return amount.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " €";
}

// ── Send emails via Vercel serverless function + log to Google Sheets ──
async function sendEmails(formData: FormState): Promise<boolean> {
  const payload = {
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    foundVia: formData.foundVia,
    interests: formData.interests,
    date: formData.date,
    weddingGuide: formData.weddingGuide,
    message: formData.message,
    selectedPackages: formData.selectedPackages,
    selectedAddons: [],
    estimatedTotal: formData.estimatedTotal,
    meetingDate: formData.meetingDate,
    meetingType: formData.meetingType,
  };

  try {
    const [emailResponse] = await Promise.all([
      fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
      fetch("/api/submit-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch((err) => console.warn("Sheets logging failed:", err)),
    ]);

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json().catch(() => ({}));
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
  selectedPhotoPackage: string | null;
  selectedVideoPackage: string | null;
  selectedPortraitPackage: string | null;
  selectedAnimalPackage: string | null;
  selectedAddonKeys: string[];
  meetingDate: string;
  meetingType: "" | "online" | "vor-ort";
  selectedPackages: { name: string; price: string }[];
  selectedAddonTexts: string[];
  estimatedTotal: string;
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
  selectedPhotoPackage: null,
  selectedVideoPackage: null,
  selectedPortraitPackage: null,
  selectedAnimalPackage: null,
  selectedAddonKeys: [],
  meetingDate: "",
  meetingType: "",
  selectedPackages: [],
  selectedAddonTexts: [],
  estimatedTotal: "",
};

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

// ── Package Card ──
function PackageCard({
  pkg,
  isDE,
  selected,
  onSelect,
}: {
  pkg: PackageData;
  isDE: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`text-left p-4 border transition-all cursor-pointer bg-transparent w-full ${
        selected
          ? "border-black bg-black/[0.03] ring-1 ring-black"
          : pkg.highlight
          ? "border-black/30 hover:border-black/60"
          : "border-black/15 hover:border-black/40"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span
          className="text-[0.7rem] tracking-[0.15em] uppercase"
          style={{ fontWeight: 600 }}
        >
          {pkg.name}
        </span>
        {pkg.highlight && !selected && (
          <span className="text-[0.6rem] tracking-[0.1em] uppercase bg-black text-white px-2 py-0.5 shrink-0" style={{ fontWeight: 400 }}>
            {isDE ? "Beliebt" : "Popular"}
          </span>
        )}
        {selected && (
          <CheckCircle size={16} className="text-black shrink-0" />
        )}
      </div>
      <p
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.3rem",
          fontWeight: 600,
          lineHeight: 1.2,
        }}
      >
        {pkg.price}
      </p>
      <p className="text-black/45 text-[0.75rem] mt-1" style={{ fontWeight: 300 }}>
        {isDE ? pkg.subtitle : pkg.subtitleEn}
      </p>
    </button>
  );
}

// ── Addon Chip ──
function AddonChip({
  addon,
  isDE,
  checked,
  onToggle,
}: {
  addon: AddOnData;
  isDE: boolean;
  checked: boolean;
  onToggle: () => void;
}) {
  const text = isDE ? addon.textDe : addon.textEn;
  return (
    <label
      className={`flex items-center gap-2 py-2 px-3 border cursor-pointer transition-all text-[0.8rem] ${
        checked
          ? "border-black bg-black/[0.03]"
          : "border-black/10 hover:border-black/30"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="accent-black cursor-pointer shrink-0"
      />
      <span className="text-black/70" style={{ fontWeight: 300, lineHeight: 1.4 }}>
        {text}
      </span>
    </label>
  );
}

// ── Category Selection Screen ──
function CategorySelect({
  isDE,
  onSelect,
}: {
  isDE: boolean;
  onSelect: (cat: InquiryCategory) => void;
}) {
  const categories: {
    key: InquiryCategory;
    icon: typeof Heart;
    titleDe: string;
    titleEn: string;
    descDe: string;
    descEn: string;
  }[] = [
    {
      key: "wedding",
      icon: Heart,
      titleDe: "Hochzeit",
      titleEn: "Wedding",
      descDe: "Fotografie, Videografie & Komplettpakete für euren großen Tag",
      descEn: "Photography, videography & complete packages for your big day",
    },
    {
      key: "animal",
      icon: Camera,
      titleDe: "Tierfotografie",
      titleEn: "Animal Photography",
      descDe: "Professionelle Portraits eurer Vierbeiner im Studio oder Outdoor",
      descEn: "Professional portraits of your furry friends in studio or outdoors",
    },
    {
      key: "portrait",
      icon: User,
      titleDe: "Portrait & Mehr",
      titleEn: "Portrait & More",
      descDe: "Couple Shootings, Business Portraits, Familienfotos & Events",
      descEn: "Couple shootings, business portraits, family photos & events",
    },
    {
      key: "general",
      icon: MessageCircle,
      titleDe: "Sonstiges",
      titleEn: "Other",
      descDe: "Allgemeine Frage oder noch unsicher? Schreibt mir einfach!",
      descEn: "General question or not sure yet? Just write to me!",
    },
  ];

  return (
    <div className="p-8 md:p-12">
      <div className="mb-10">
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: "1rem",
          }}
        >
          {isDE ? "Worum geht's?" : "What's it about?"}
        </h2>
        <p
          className="text-black/60 text-[0.85rem]"
          style={{ lineHeight: 1.7, fontWeight: 300 }}
        >
          {isDE
            ? "Wahlt euer Thema und ich zeige euch direkt die passenden Optionen."
            : "Choose your topic and I'll show you the right options straight away."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categories.map((cat) => (
          <motion.button
            key={cat.key}
            type="button"
            onClick={() => onSelect(cat.key)}
            className="group text-left p-5 border border-black/12 bg-transparent cursor-pointer transition-all hover:border-black/40 hover:bg-black/[0.02]"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 shrink-0 border border-black/10 flex items-center justify-center group-hover:border-black/30 transition-colors">
                <cat.icon size={18} className="text-black/40 group-hover:text-black/70 transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3
                    className="text-[0.9rem]"
                    style={{ fontWeight: 600, fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {isDE ? cat.titleDe : cat.titleEn}
                  </h3>
                  <ArrowRight
                    size={14}
                    className="text-black/20 group-hover:text-black/60 transition-all group-hover:translate-x-0.5 shrink-0"
                  />
                </div>
                <p
                  className="text-black/45 text-[0.78rem]"
                  style={{ lineHeight: 1.5, fontWeight: 300 }}
                >
                  {isDE ? cat.descDe : cat.descEn}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
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
  const { packages } = usePackages();
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [showPackages, setShowPackages] = useState(true);

  // Step management: "category-select" or "form"
  const [step, setStep] = useState<"category-select" | "form">(
    category === "general" ? "category-select" : "form"
  );
  const [activeCategory, setActiveCategory] = useState<InquiryCategory>(category);

  // Sync when category prop changes (e.g., opening from different page)
  const [prevCategory, setPrevCategory] = useState(category);
  if (category !== prevCategory) {
    setPrevCategory(category);
    setActiveCategory(category);
    setStep(category === "general" ? "category-select" : "form");
  }

  const isDE = lang === "de";

  const handleCategorySelect = (cat: InquiryCategory) => {
    setActiveCategory(cat);
    setStep("form");
  };

  const handleBackToCategories = () => {
    setStep("category-select");
  };

  // Determine which packages to show based on activeCategory
  const showWeddingPackages = activeCategory === "wedding";
  const showPortraitPackages = activeCategory === "portrait";
  const showAnimalPackages = activeCategory === "animal";
  const showWeddingGuide = activeCategory === "wedding" || form.selectedPhotoPackage !== null || form.selectedVideoPackage !== null;

  const hasAnyPackages =
    (showWeddingPackages && (packages.weddingPhoto.length > 0 || packages.weddingVideo.length > 0)) ||
    (showPortraitPackages && packages.portrait.length > 0) ||
    (showAnimalPackages && packages.animals?.length > 0);

  // ── Price calculation ──
  const priceBreakdown = useMemo(() => {
    const items: { name: string; price: string; amount: number }[] = [];
    let total = 0;

    if (form.selectedPhotoPackage) {
      const pkg = packages.weddingPhoto.find((p) => p.name === form.selectedPhotoPackage);
      if (pkg) {
        const amount = parsePrice(pkg.price);
        items.push({ name: `Foto: ${pkg.name}`, price: pkg.price, amount });
        total += amount;
      }
    }

    if (form.selectedVideoPackage) {
      const pkg = packages.weddingVideo.find((p) => p.name === form.selectedVideoPackage);
      if (pkg) {
        const amount = parsePrice(pkg.price);
        items.push({ name: `Video: ${pkg.name}`, price: pkg.price, amount });
        total += amount;
      }
    }

    if (form.selectedPortraitPackage) {
      const pkg = packages.portrait.find((p) => p.name === form.selectedPortraitPackage);
      if (pkg) {
        const amount = parsePrice(pkg.price);
        items.push({ name: `Portrait: ${pkg.name}`, price: pkg.price, amount });
        total += amount;
      }
    }

    if (form.selectedAnimalPackage && packages.animals?.length > 0) {
      const pkg = packages.animals.find((p) => p.name === form.selectedAnimalPackage);
      if (pkg) {
        const amount = parsePrice(pkg.price);
        items.push({ name: `Tier: ${pkg.name}`, price: pkg.price, amount });
        total += amount;
      }
    }

    for (const key of form.selectedAddonKeys) {
      const addon = packages.weddingAddons[parseInt(key)];
      if (addon) {
        const text = isDE ? addon.textDe : addon.textEn;
        const amount = parseAddonPrice(text);
        items.push({ name: text.split(":")[0].trim(), price: formatPrice(amount), amount });
        total += amount;
      }
    }

    const hasAb = items.some(
      (i) =>
        (form.selectedPhotoPackage &&
          packages.weddingPhoto.find((p) => p.name === form.selectedPhotoPackage)?.price.includes("ab")) ||
        (form.selectedPortraitPackage &&
          packages.portrait.find((p) => p.name === form.selectedPortraitPackage)?.price.includes("ab"))
    );

    return { items, total, hasAb };
  }, [form.selectedPhotoPackage, form.selectedVideoPackage, form.selectedPortraitPackage, form.selectedAnimalPackage, form.selectedAddonKeys, packages, isDE]);

  const handleChange = (field: keyof FormState, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAddonKey = (key: string) => {
    setForm((prev) => ({
      ...prev,
      selectedAddonKeys: prev.selectedAddonKeys.includes(key)
        ? prev.selectedAddonKeys.filter((k) => k !== key)
        : [...prev.selectedAddonKeys, key],
    }));
  };

  const selectPhotoPackage = (name: string) => {
    setForm((prev) => ({
      ...prev,
      selectedPhotoPackage: prev.selectedPhotoPackage === name ? null : name,
    }));
  };

  const selectVideoPackage = (name: string) => {
    setForm((prev) => ({
      ...prev,
      selectedVideoPackage: prev.selectedVideoPackage === name ? null : name,
    }));
  };

  const selectPortraitPackage = (name: string) => {
    setForm((prev) => ({
      ...prev,
      selectedPortraitPackage: prev.selectedPortraitPackage === name ? null : name,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.privacyConsent) return;

    const selectedPkgs = priceBreakdown.items.map((i) => ({ name: i.name, price: i.price }));
    const addonTexts = form.selectedAddonKeys.map((key) => {
      const addon = packages.weddingAddons[parseInt(key)];
      return addon ? (isDE ? addon.textDe : addon.textEn) : "";
    }).filter(Boolean);

    const totalStr = priceBreakdown.total > 0
      ? `${priceBreakdown.hasAb ? "ab " : ""}${formatPrice(priceBreakdown.total)}`
      : "";

    const interests: string[] = [];
    if (form.selectedPhotoPackage) interests.push(`Hochzeit Foto (${form.selectedPhotoPackage})`);
    if (form.selectedVideoPackage) interests.push(`Hochzeit Video (${form.selectedVideoPackage})`);
    if (form.selectedPortraitPackage) interests.push(`Portrait (${form.selectedPortraitPackage})`);
    if (form.selectedAnimalPackage) interests.push(`Tierfotografie (${form.selectedAnimalPackage})`);
    if (interests.length === 0) {
      if (activeCategory === "animal") interests.push("Tierfotografie");
      else if (activeCategory === "portrait") interests.push("Portrait");
      else if (activeCategory === "wedding") interests.push("Hochzeit");
      else interests.push("Allgemeine Anfrage");
    }

    const finalForm: FormState = {
      ...form,
      interests,
      selectedPackages: selectedPkgs,
      selectedAddonTexts: addonTexts,
      estimatedTotal: totalStr,
    };

    setStatus("sending");
    const success = await sendEmails(finalForm);
    setStatus(success ? "success" : "error");
    if (success) {
      setTimeout(() => {
        setForm(initialForm);
        setStatus("idle");
        setStep(category === "general" ? "category-select" : "form");
        setActiveCategory(category);
        onClose();
      }, 3000);
    }
  };

  const handleClose = () => {
    if (status === "sending") return;
    setForm(initialForm);
    setStatus("idle");
    setStep(category === "general" ? "category-select" : "form");
    setActiveCategory(category);
    onClose();
  };

  // Category label for the "back" button
  const categoryLabel = {
    wedding: isDE ? "Hochzeit" : "Wedding",
    animal: isDE ? "Tierfotografie" : "Animal Photography",
    portrait: isDE ? "Portrait & Mehr" : "Portrait & More",
    general: isDE ? "Sonstiges" : "Other",
  };

  const t = {
    title: isDE ? "Eure Reise beginnt" : "Your journey begins",
    titleItalic: isDE ? "hier" : "here",
    subtitle: isDE
      ? "Stellt euch euer Wunschpaket zusammen und erzählt mir von euren Plänen. Ihr hört in der Regel innerhalb von 48 Stunden von mir."
      : "Put together your dream package and tell me about your plans. You'll usually hear from me within 48 hours.",
    name: isDE ? "Vorname, Nachname*" : "First name, Last name*",
    email: "E-Mail*",
    phone: isDE ? "Telefon*" : "Phone*",
    foundVia: isDE ? "Wie habt ihr mich gefunden?" : "How did you find me?",
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
    packages: isDE ? "Paketauswahl" : "Package Selection",
    photoPackages: isDE ? "Foto-Pakete" : "Photo Packages",
    videoPackages: isDE ? "Video-Pakete" : "Video Packages",
    portraitPackages: isDE ? "Portrait-Pakete" : "Portrait Packages",
    animalPackages: isDE ? "Tier-Pakete" : "Animal Packages",
    addons: isDE ? "Extras & Add-ons" : "Extras & Add-ons",
    estimatedPrice: isDE ? "Geschatzter Preis" : "Estimated Price",
    from: isDE ? "ab" : "from",
    hidePackages: isDE ? "Pakete ausblenden" : "Hide packages",
    showPackages: isDE ? "Pakete anzeigen" : "Show packages",
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

            <AnimatePresence mode="wait">
              {/* ═══════════════════════════════════════════ */}
              {/* STEP 1: Category Selection (only for "general") */}
              {/* ═══════════════════════════════════════════ */}
              {step === "category-select" ? (
                <motion.div
                  key="category-select"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <CategorySelect isDE={isDE} onSelect={handleCategorySelect} />
                </motion.div>
              ) : status === "success" ? (
                /* ═══════════════════════════════════════════ */
                /* Success State */
                /* ═══════════════════════════════════════════ */
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
                /* ═══════════════════════════════════════════ */
                /* STEP 2: Contact Form */
                /* ═══════════════════════════════════════════ */
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="p-8 md:p-12"
                >
                  {/* Back button (only if we came from category selection) */}
                  {category === "general" && (
                    <button
                      type="button"
                      onClick={handleBackToCategories}
                      className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0 mb-6 text-black/40 hover:text-black transition-colors"
                    >
                      <ArrowLeft size={14} />
                      <span className="text-[0.78rem] tracking-[0.08em] uppercase" style={{ fontWeight: 400 }}>
                        {categoryLabel[activeCategory]}
                      </span>
                    </button>
                  )}

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
                      className="text-black/60 text-[0.85rem]"
                      style={{ lineHeight: 1.7, fontWeight: 300 }}
                    >
                      {t.subtitle}
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div>
                      <label className="block text-[0.82rem] mb-2" style={{ fontWeight: 600 }}>
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
                      <label className="block text-[0.82rem] mb-2" style={{ fontWeight: 600 }}>
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
                      <label className="block text-[0.82rem] mb-2" style={{ fontWeight: 600 }}>
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
                      <label className="block text-[0.82rem] mb-2" style={{ fontWeight: 600 }}>
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

                    {/* ═══════════════════════════════════════════ */}
                    {/* PACKAGE SELECTION */}
                    {/* ═══════════════════════════════════════════ */}
                    {hasAnyPackages && activeCategory !== "portrait" && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setShowPackages(!showPackages)}
                        className="flex items-center gap-2 w-full text-left bg-transparent border-none cursor-pointer p-0 mb-4"
                      >
                        <Calculator size={16} className="text-black/50" />
                        <span className="text-[0.82rem]" style={{ fontWeight: 600 }}>
                          {t.packages}
                        </span>
                        <span className="text-[0.72rem] text-black/40 ml-1" style={{ fontWeight: 300 }}>
                          ({isDE ? "optional" : "optional"})
                        </span>
                        <span className="ml-auto text-black/40">
                          {showPackages ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </span>
                      </button>

                      <AnimatePresence>
                        {showPackages && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-6 pb-2">
                              {/* Wedding Photo Packages */}
                              {showWeddingPackages && packages.weddingPhoto.length > 0 && (
                                <div>
                                  <p className="text-[0.75rem] tracking-[0.15em] uppercase text-black/40 mb-3" style={{ fontWeight: 400 }}>
                                    {t.photoPackages}
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {packages.weddingPhoto.map((pkg) => (
                                      <PackageCard
                                        key={pkg.name}
                                        pkg={pkg}
                                        isDE={isDE}
                                        selected={form.selectedPhotoPackage === pkg.name}
                                        onSelect={() => selectPhotoPackage(pkg.name)}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Wedding Video Packages */}
                              {showWeddingPackages && packages.weddingVideo.length > 0 && (
                                <div>
                                  <p className="text-[0.75rem] tracking-[0.15em] uppercase text-black/40 mb-3" style={{ fontWeight: 400 }}>
                                    {t.videoPackages}
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {packages.weddingVideo.map((pkg) => (
                                      <PackageCard
                                        key={pkg.name}
                                        pkg={pkg}
                                        isDE={isDE}
                                        selected={form.selectedVideoPackage === pkg.name}
                                        onSelect={() => selectVideoPackage(pkg.name)}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Wedding Add-ons */}
                              {showWeddingPackages && packages.weddingAddons.length > 0 && (form.selectedPhotoPackage || form.selectedVideoPackage) && (
                                <div>
                                  <p className="text-[0.75rem] tracking-[0.15em] uppercase text-black/40 mb-3" style={{ fontWeight: 400 }}>
                                    {t.addons}
                                  </p>
                                  <div className="space-y-2">
                                    {packages.weddingAddons.map((addon, i) => (
                                      <AddonChip
                                        key={i}
                                        addon={addon}
                                        isDE={isDE}
                                        checked={form.selectedAddonKeys.includes(String(i))}
                                        onToggle={() => toggleAddonKey(String(i))}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Portrait Packages */}
                              {showPortraitPackages && packages.portrait.length > 0 && (
                                <div>
                                  <p className="text-[0.75rem] tracking-[0.15em] uppercase text-black/40 mb-3" style={{ fontWeight: 400 }}>
                                    {t.portraitPackages}
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {packages.portrait.map((pkg) => (
                                      <PackageCard
                                        key={pkg.name}
                                        pkg={pkg}
                                        isDE={isDE}
                                        selected={form.selectedPortraitPackage === pkg.name}
                                        onSelect={() => selectPortraitPackage(pkg.name)}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Animal Packages (if data exists) */}
                              {showAnimalPackages && packages.animals && packages.animals.length > 0 && (
                                <div>
                                  <p className="text-[0.75rem] tracking-[0.15em] uppercase text-black/40 mb-3" style={{ fontWeight: 400 }}>
                                    {t.animalPackages}
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {packages.animals.map((pkg) => (
                                      <PackageCard
                                        key={pkg.name}
                                        pkg={pkg}
                                        isDE={isDE}
                                        selected={form.selectedAnimalPackage === pkg.name}
                                        onSelect={() => handleChange("selectedAnimalPackage", form.selectedAnimalPackage === pkg.name ? null : pkg.name)}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* ── Price Calculator ── */}
                              {priceBreakdown.total > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="bg-[#f8f7f5] border border-black/10 p-5"
                                >
                                  <div className="flex items-center gap-2 mb-3">
                                    <Calculator size={14} className="text-black/40" />
                                    <span className="text-[0.75rem] tracking-[0.15em] uppercase text-black/50" style={{ fontWeight: 400 }}>
                                      {t.estimatedPrice}
                                    </span>
                                  </div>
                                  <div className="space-y-1.5">
                                    {priceBreakdown.items.map((item, i) => (
                                      <div key={i} className="flex justify-between items-baseline gap-4">
                                        <span className="text-[0.8rem] text-black/60" style={{ fontWeight: 300 }}>
                                          {item.name}
                                        </span>
                                        <span className="text-[0.8rem] text-black/80 shrink-0" style={{ fontWeight: 400 }}>
                                          {item.price}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="flex justify-between items-baseline gap-4 mt-3 pt-3 border-t border-black/10">
                                    <span className="text-[0.82rem]" style={{ fontWeight: 600 }}>
                                      {isDE ? "Gesamt" : "Total"}
                                    </span>
                                    <span
                                      style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        fontSize: "1.4rem",
                                        fontWeight: 700,
                                      }}
                                    >
                                      {priceBreakdown.hasAb && (
                                        <span className="text-[0.7rem] text-black/40 mr-1" style={{ fontWeight: 300, fontFamily: "inherit" }}>
                                          {t.from}
                                        </span>
                                      )}
                                      {formatPrice(priceBreakdown.total)}
                                    </span>
                                  </div>
                                  <p className="text-[0.7rem] text-black/35 mt-2" style={{ lineHeight: 1.5, fontWeight: 300 }}>
                                    {isDE
                                      ? "* Unverbindliche Schatzung. Der finale Preis wird individuell besprochen."
                                      : "* Non-binding estimate. The final price will be discussed individually."}
                                  </p>
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    )}

                    {/* Date */}
                    <div>
                      <label className="block text-[0.82rem] mb-2" style={{ fontWeight: 600 }}>
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
                      <label className="block text-[0.82rem] mb-2" style={{ fontWeight: 600 }}>
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

                    {/* ═══════════════════════════════════════════ */}
                    {/* KENNENLERN-TERMIN (optional) */}
                    {/* ═══════════════════════════════════════════ */}
                    <div className="bg-[#f8f7f5] border border-black/10 p-5">
                      <p className="text-[0.75rem] tracking-[0.15em] uppercase text-black/40 mb-1" style={{ fontWeight: 400 }}>
                        {isDE ? "Kennenlern-Termin" : "Get-to-know meeting"}
                      </p>
                      <p className="text-[0.78rem] text-black/45 mb-4" style={{ fontWeight: 300, lineHeight: 1.5 }}>
                        {isDE
                          ? "Optional: Schlagt einen Termin für ein unverbindliches Kennenlernen vor."
                          : "Optional: Suggest a date for a non-binding introductory meeting."}
                      </p>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[0.78rem] mb-1.5 text-black/60" style={{ fontWeight: 400 }}>
                            {isDE ? "Terminvorschlag" : "Suggested date"}
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[0.68rem] text-black/35 mb-1" style={{ fontWeight: 300 }}>
                                {isDE ? "Datum" : "Date"}
                              </label>
                              <input
                                type="date"
                                value={form.meetingDate ? form.meetingDate.split("T")[0] : ""}
                                onChange={(e) => {
                                  const time = form.meetingDate ? form.meetingDate.split("T")[1] || "10:00" : "10:00";
                                  handleChange("meetingDate", e.target.value ? `${e.target.value}T${time}` : "");
                                }}
                                min={new Date().toISOString().split("T")[0]}
                                className="w-full border border-black/15 focus:border-black outline-none py-2.5 px-3 text-[0.85rem] bg-transparent transition-colors"
                                style={{ fontWeight: 300 }}
                              />
                            </div>
                            <div>
                              <label className="block text-[0.68rem] text-black/35 mb-1" style={{ fontWeight: 300 }}>
                                {isDE ? "Uhrzeit" : "Time"}
                              </label>
                              <input
                                type="time"
                                value={form.meetingDate ? (form.meetingDate.split("T")[1] || "10:00") : ""}
                                onChange={(e) => {
                                  const date = form.meetingDate ? form.meetingDate.split("T")[0] : new Date().toISOString().split("T")[0];
                                  handleChange("meetingDate", `${date}T${e.target.value}`);
                                }}
                                className="w-full border border-black/15 focus:border-black outline-none py-2.5 px-3 text-[0.85rem] bg-transparent transition-colors"
                                style={{ fontWeight: 300 }}
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[0.78rem] mb-2 text-black/60" style={{ fontWeight: 400 }}>
                            {isDE ? "Wie soll das Treffen stattfinden?" : "How should the meeting take place?"}
                          </label>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => handleChange("meetingType", form.meetingType === "online" ? "" : "online")}
                              className={`flex-1 py-2.5 px-3 text-[0.8rem] border transition-all cursor-pointer ${
                                form.meetingType === "online"
                                  ? "border-black bg-black text-white"
                                  : "border-black/15 bg-transparent text-black/60 hover:border-black/40"
                              }`}
                              style={{ fontWeight: form.meetingType === "online" ? 500 : 300 }}
                            >
                              Online
                            </button>
                            <button
                              type="button"
                              onClick={() => handleChange("meetingType", form.meetingType === "vor-ort" ? "" : "vor-ort")}
                              className={`flex-1 py-2.5 px-3 text-[0.8rem] border transition-all cursor-pointer ${
                                form.meetingType === "vor-ort"
                                  ? "border-black bg-black text-white"
                                  : "border-black/15 bg-transparent text-black/60 hover:border-black/40"
                              }`}
                              style={{ fontWeight: form.meetingType === "vor-ort" ? 500 : 300 }}
                            >
                              {isDE ? "Vor Ort" : "In person"}
                            </button>
                          </div>
                          {form.meetingType === "vor-ort" && (
                            <p className="text-[0.72rem] text-black/35 mt-2" style={{ fontWeight: 300, lineHeight: 1.4 }}>
                              {"\u{1F4CD}"} Backerbuhelgasse 14, 6020 Innsbruck
                            </p>
                          )}
                        </div>
                      </div>
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
                          {priceBreakdown.total > 0 && (
                            <span className="ml-1 opacity-60">
                              ({priceBreakdown.hasAb ? `${t.from} ` : ""}{formatPrice(priceBreakdown.total)})
                            </span>
                          )}
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