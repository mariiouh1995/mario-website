import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Calendar, Camera, CheckCircle2, Circle, Clock3, ExternalLink, FileText, Image, ListChecks, Lock, Mail, MapPin, MessageSquareText, MessageCircle, Plus, Star, Upload } from "lucide-react";

type ServiceItem = { id: string; name: string; price: string; type: "package" | "custom" };
type ServiceCatalogItem = { id: string; name: string; price: string; group: string; description?: string; active?: boolean };
type AddOnRequest = { id: string; createdAt: string; status: "neu" | "akzeptiert" | "abgelehnt"; items: ServiceItem[]; message?: string };
type TaskItem = { id: string; title: string; status: "offen" | "in_arbeit" | "erledigt" | "obsolet" };
type LocationItem = { id: string; title: string; address: string };
type PaymentItem = { id: string; title: string; amount: string; paidAt: string; note?: string };
type CustomerDocument = { id: string; kind: "offer" | "contract" | "invoice" | "terms" | "signed_contract" | "custom"; title: string; url: string; driveFileId?: string; fileName?: string; mimeType?: string; uploadedAt?: string };
type OfferItem = { id: string; name: string; description?: string; quantity: string; unitPrice: string };
type Offer = { id: string; publicToken: string; status: string; customerName: string; eventDate: string; title: string; introText: string; notes: string; items: OfferItem[]; travelKm: string; travelRate: string; total: string; pdfUrl: string; responseMessage: string };
type InspirationLink = { id: string; title: string; url: string };
type PortalVisibility = {
  status?: boolean;
  tasks?: boolean;
  services?: boolean;
  payments?: boolean;
  documents?: boolean;
  locations?: boolean;
  offer?: boolean;
  contract?: boolean;
  invoice?: boolean;
  gallery?: boolean;
  messages?: boolean;
};
type PortalMessage = { id: string; title: string; message: string; createdAt: string; visible: boolean };
type Customer = {
  name: string;
  status: string;
  category: string;
  eventDate: string;
  registryOfficeDate?: string;
  location: string;
  customerAddress?: string;
  locationAddress?: string;
  locations?: LocationItem[];
  consultationDate: string;
  galleryUrl: string;
  offerUrl?: string;
  contractUrl: string;
  invoiceUrl?: string;
  contractStatus: string;
  bookedServices: ServiceItem[];
  customServices: ServiceItem[];
  payments?: PaymentItem[];
  depositDueDate?: string;
  finalPaymentDueDate?: string;
  documents?: CustomerDocument[];
  inspirationLinks?: InspirationLink[];
  addOnRequests?: AddOnRequest[];
  tasks: TaskItem[];
  portalIntro: string;
  portalVisibility?: PortalVisibility;
  portalMessages?: PortalMessage[];
};

const defaultVisibility: Required<PortalVisibility> = {
  status: false,
  tasks: false,
  services: true,
  payments: false,
  documents: true,
  locations: true,
  offer: false,
  contract: false,
  invoice: false,
  gallery: true,
  messages: true,
};

const taskStatusLabels: Record<TaskItem["status"], string> = {
  offen: "Offen",
  in_arbeit: "In Arbeit",
  erledigt: "Erledigt",
  obsolet: "Nicht mehr relevant",
};

const googleReviewUrl = "https://www.google.com/search?sa=X&sca_esv=b95ffecbfaf145e4&rlz=1C1VDKB_deDE1086DE1086&sxsrf=ANbL-n4RUp9IZMCcVQIBjgqxGIbCoeaZCg:1779517228765&q=Mario+Schubert+-+Fotografie+%26+Videografie+Rezensionen&rflfq=1&num=20&stick=H4sIAAAAAAAAAONgkxI2MjUyNLQwsDCxNDAzNDM1NTMz2MDI-IrR1DexKDNfITg5ozQptahEQVfBLb8kP70oMS0zVUFNISwzJRXGC0qtSs0rzszPS81bxEqePgCy7HgQigAAAA&rldimm=2521180849061655660&tbm=lcl&hl=de-DE&ved=2ahUKEwi_-qqi4s6UAxViXfEDHS97JuIQ9fQKegQIShAG&biw=1920&bih=911&dpr=1#";
const TERMS_DOCUMENT_URL = "https://drive.google.com/file/d/1k7SBmcbuckWARJhUc4DkXIG4f_kgLyEl/view?usp=drive_link";

function normalizeHref(value?: string) {
  const trimmed = (value || "").trim();
  if (!trimmed) return "";
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith("mailto:") || trimmed.startsWith("tel:")) return trimmed;
  return `https://${trimmed}`;
}

function mapsUrl(value?: string) {
  return value ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}` : "";
}

function parseMoney(value?: string) {
  const raw = (value || "").trim();
  if (!raw) return 0;

  const negative = raw.includes("-");
  const stripped = raw.replace(/[^\d,.]/g, "");
  if (!stripped) return 0;

  const lastComma = stripped.lastIndexOf(",");
  const lastDot = stripped.lastIndexOf(".");
  let normalized = stripped;

  if (lastComma >= 0 && lastDot >= 0) {
    const decimalSeparator = lastComma > lastDot ? "," : ".";
    const thousandsSeparator = decimalSeparator === "," ? "." : ",";
    normalized = stripped
      .replace(new RegExp(`\\${thousandsSeparator}`, "g"), "")
      .replace(decimalSeparator, ".");
  } else if (lastComma >= 0 || lastDot >= 0) {
    const separator = lastComma >= 0 ? "," : ".";
    const parts = stripped.split(separator);
    const fraction = parts[parts.length - 1] || "";
    normalized = fraction.length > 0 && fraction.length <= 2
      ? `${parts.slice(0, -1).join("")}.${fraction}`
      : parts.join("");
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return 0;
  return negative ? -parsed : parsed;
}

function formatMoney(value?: string) {
  const clean = (value || "").trim();
  if (!clean) return "";
  if (/\d/.test(clean)) return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(parseMoney(clean));
  if (/[€a-z]/i.test(clean)) return clean;
  const parsed = Number(clean.replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(parsed)) return clean;
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(parsed);
}

function moneyNumber(value?: string) {
  return parseMoney(value);
}

function offerTotal(offer: Offer) {
  const items = (offer.items || []).reduce((sum, item) => sum + moneyNumber(item.quantity || "1") * moneyNumber(item.unitPrice), 0);
  const travel = offer.travelKm ? moneyNumber(offer.travelKm) * moneyNumber(offer.travelRate || "0.60") : 0;
  return items + travel;
}

function formatDateDe(value?: string) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function readBlobAsBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || "").split(",")[1] || "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function portalDocuments(customer: Customer, visibility: Required<PortalVisibility>) {
  const existing = new Map((customer.documents || []).map((document) => [document.id, document]));
  const standard: CustomerDocument[] = [
    { id: "doc-offer", kind: "offer", title: "Angebot", url: customer.offerUrl || "" },
    { id: "doc-contract", kind: "contract", title: "Vertrag", url: customer.contractUrl || "" },
    { id: "doc-invoice", kind: "invoice", title: "Rechnung", url: customer.invoiceUrl || "" },
    { id: "doc-terms", kind: "terms", title: "AGB & Datenschutz", url: TERMS_DOCUMENT_URL },
  ].map((document) => ({ ...document, ...(existing.get(document.id) || {}), url: existing.get(document.id)?.url || document.url }));
  return [
    ...standard.filter((document) => {
      if (document.kind === "offer") return visibility.offer && document.url;
      if (document.kind === "contract") return visibility.contract && document.url;
      if (document.kind === "invoice") return visibility.invoice && document.url;
      if (document.kind === "terms") return visibility.documents && document.url;
      return false;
    }),
    ...(customer.documents || []).filter((document) => document.kind === "custom" && visibility.documents && document.url),
  ];
}

export function CustomerPortalPage() {
  const { token } = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [portalPassword, setPortalPassword] = useState(() => sessionStorage.getItem(`portal_pw_${token}`) || "");
  const [needsPassword, setNeedsPassword] = useState(false);
  const [uploadingContract, setUploadingContract] = useState(false);
  const [portalNotice, setPortalNotice] = useState("");
  const [serviceCatalog, setServiceCatalog] = useState<ServiceCatalogItem[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offerMessage, setOfferMessage] = useState("");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [addOnMessage, setAddOnMessage] = useState("");
  const [sendingAddOns, setSendingAddOns] = useState(false);

  useEffect(() => {
    async function loadPortal() {
      setLoading(true);
      try {
        const query = new URLSearchParams({ action: "portal", token: token || "" });
        if (portalPassword) query.set("password", portalPassword);
        const res = await fetch(`/api/mario-crm?${query.toString()}`);
        const data = await res.json();
        if (data.requiresPassword) {
          setNeedsPassword(true);
          setError(data.error || "");
          return;
        }
        if (!res.ok) throw new Error(data.error || "Portal nicht gefunden");
        setCustomer(data.customer);
        setOffers(data.offers || []);
        setServiceCatalog(data.serviceCatalog || []);
        setNeedsPassword(false);
      } catch (err: any) {
        setCustomer(null);
        setError(err.message || "Portal konnte nicht geladen werden");
      } finally {
        setLoading(false);
      }
    }
    loadPortal();
  }, [token, portalPassword]);

  if (loading) {
    return <div className="min-h-screen bg-[#11100f] text-white flex items-center justify-center">Lade Kundenbereich...</div>;
  }

  if (needsPassword) {
    return (
      <div className="min-h-screen bg-[#11100f] text-white flex items-center justify-center px-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const value = new FormData(event.currentTarget).get("password")?.toString() || "";
            sessionStorage.setItem(`portal_pw_${token}`, value);
            setPortalPassword(value);
          }}
          className="w-full max-w-sm"
        >
          <Lock className="w-10 h-10 mx-auto mb-5 text-white/35" />
          <h1 className="text-xl text-center mb-2">Kundenbereich</h1>
          <p className="text-white/45 text-sm text-center mb-6">Bitte gib das Passwort aus meiner Mail ein.</p>
          <input name="password" type="password" className="w-full px-4 py-3 bg-white/6 border border-white/10 rounded-lg text-white placeholder-white/35 focus:outline-none focus:border-white/35" placeholder="Passwort" />
          {error && <p className="text-red-300 text-sm text-center mt-3">{error}</p>}
          <button className="w-full mt-4 py-3 bg-white text-black rounded-lg hover:bg-white/90">Öffnen</button>
        </form>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-[#11100f] text-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Lock className="w-10 h-10 mx-auto mb-4 text-white/35" />
          <h1 className="text-xl mb-2">Kundenbereich nicht gefunden</h1>
          <p className="text-white/45 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const visibility = { ...defaultVisibility, ...(customer.portalVisibility || {}) };
  const services = [...(customer.bookedServices || []), ...(customer.customServices || [])];
  const visibleTasks = (customer.tasks || []).filter((task) => (task.id.startsWith("step-") ? visibility.status : visibility.tasks));
  const payments = customer.payments || [];
  const bookedPayments = payments.filter((payment) => moneyNumber(payment.amount) > 0);
  const total = services.reduce((sum, service) => sum + moneyNumber(service.price), 0);
  const paid = bookedPayments.reduce((sum, payment) => sum + moneyNumber(payment.amount), 0);
  const openAmount = total > 0 ? Math.max(total - paid, 0) : 0;
  const messages = (customer.portalMessages || []).filter((item) => item.visible);
  const locations = customer.locations || [];
  const documents = portalDocuments(customer, visibility);
  const visibleOffers = offers.filter((offer) => offer.status !== "entwurf");
  const inspirationLinks = customer.inspirationLinks || [];
  const hasSpiegleinService = services.some((service) => service.name.toLowerCase().includes("spieglein"));
  const hasSpiegleinCatalog = serviceCatalog.some((item) => item.active !== false && item.name.toLowerCase().includes("spieglein"));

  const portalApi = async (action: string, body: Record<string, unknown>) => {
    const res = await fetch(`/api/mario-crm?action=${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: portalPassword, ...body }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Aktion konnte nicht ausgeführt werden");
    return data;
  };

  const respondOffer = async (offer: Offer, status: "angenommen" | "abgelehnt" | "aenderungswunsch") => {
    const res = await fetch("/api/mario-crm?action=offer-response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: offer.publicToken, status, responseMessage: offerMessage }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Antwort konnte nicht gesendet werden");
    setOffers((prev) => prev.map((item) => (item.id === data.offer.id ? data.offer : item)));
    setOfferMessage("");
    setPortalNotice("Danke, eure Rückmeldung zum Angebot ist angekommen.");
  };

  const saveInspirationLinks = async (links: InspirationLink[]) => {
    setCustomer({ ...customer, inspirationLinks: links });
    setPortalNotice("");
    try {
      const data = await portalApi("portal-inspiration-links", { inspirationLinks: links });
      setCustomer(data.customer);
      setPortalNotice("Inspirationen gespeichert.");
    } catch (err: any) {
      setPortalNotice(err.message || "Inspirationen konnten nicht gespeichert werden.");
    }
  };

  const uploadSignedContract = async (file: File) => {
    if (file.size > 100 * 1024 * 1024) {
      setPortalNotice("Die Datei ist zu groß. Bitte nutzt für sehr große Dateien einen Drive-Link.");
      return;
    }
    setUploadingContract(true);
    setPortalNotice("Vertrag wird hochgeladen...");
    try {
      const session = await portalApi("portal-upload-document", {
        documentId: "doc-signed-contract",
        kind: "signed_contract",
        title: "Unterzeichneter Vertrag",
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
      });
      const chunkSize = 2 * 1024 * 1024;
      let fileId = "";
      for (let start = 0; start < file.size; start += chunkSize) {
        const end = Math.min(start + chunkSize, file.size);
        const contentBase64 = await readBlobAsBase64(file.slice(start, end));
        const chunk = await portalApi("portal-upload-document-chunk", {
          uploadUrl: session.uploadUrl,
          mimeType: file.type || "application/octet-stream",
          contentBase64,
          start,
          end,
          total: file.size,
        });
        if (chunk.done) fileId = chunk.fileId;
      }
      if (!fileId) throw new Error("Google Drive hat keine Datei-ID zurückgegeben");
      const data = await portalApi("portal-finish-document-upload", {
        documentId: "doc-signed-contract",
        kind: "signed_contract",
        title: "Unterzeichneter Vertrag",
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        fileId,
      });
      setCustomer(data.customer);
      setPortalNotice("Unterzeichneter Vertrag hochgeladen. Ich wurde informiert.");
    } catch (err: any) {
      setPortalNotice(err.message || "Der Vertrag konnte nicht hochgeladen werden.");
    } finally {
      setUploadingContract(false);
    }
  };

  const submitAddOnRequest = async () => {
    const items = selectedAddOns
      .map((id) => serviceCatalog.find((item) => item.id === id))
      .filter(Boolean)
      .map((item) => ({ id: `addon-${Date.now()}-${item!.id}`, name: item!.name, price: item!.price, type: "custom" }));
    if (items.length === 0) {
      setPortalNotice("Bitte wählt mindestens eine Leistung aus.");
      return;
    }
    setSendingAddOns(true);
    setPortalNotice("");
    try {
      const data = await portalApi("portal-add-on-request", { items, message: addOnMessage });
      setCustomer(data.customer);
      setSelectedAddOns([]);
      setAddOnMessage("");
      setPortalNotice("Danke euch. Ich wurde informiert und melde mich zur Bestätigung.");
    } catch (err: any) {
      setPortalNotice(err.message || "Die Anfrage konnte nicht gesendet werden.");
    } finally {
      setSendingAddOns(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f0eb] text-[#1f1b17]">
      <section className="bg-[#11100f] text-white">
        <div className="max-w-5xl mx-auto px-5 py-14 md:py-20">
          <p className="text-white/45 text-xs uppercase tracking-[0.28em]">Mario Schubert Photography</p>
          <h1 className="mt-5 text-3xl md:text-5xl font-light">Servus ihr Lieben</h1>
          <p className="mt-5 max-w-2xl text-white/60 leading-relaxed">
            {customer.portalIntro || "Hier sind die wichtigsten Informationen zu unserem gemeinsamen Termin."}
          </p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-5 py-8 md:py-12 space-y-8">
        {visibleTasks.length > 0 && (
          <section className="bg-white border border-black/8 rounded-lg p-5 md:p-6">
            <h2 className="text-base font-medium mb-4 flex items-center gap-2">
              <ListChecks className="w-5 h-5" /> Status & Aufgaben
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {visibleTasks.map((task) => {
                const done = task.status === "erledigt";
                const active = task.status === "in_arbeit";
                return (
                  <article key={task.id} className={`rounded-md border px-3 py-3 ${done ? "bg-[#eef6ef] border-[#b9d7bd]" : active ? "bg-[#f7ead8] border-[#ddbf91]" : "bg-[#faf8f5] border-black/8"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {done ? <CheckCircle2 className="w-4 h-4 text-emerald-700 mt-0.5" /> : active ? <Clock3 className="w-4 h-4 text-[#8a5c21] mt-0.5" /> : <Circle className="w-4 h-4 text-black/30 mt-0.5" />}
                        <div>
                          <h3 className="font-medium text-sm">{task.title}</h3>
                          <p className="text-xs text-black/50 mt-1">{taskStatusLabels[task.status]}</p>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {visibility.messages && messages.length > 0 && (
          <section className="bg-white border border-black/8 rounded-lg p-5 md:p-6">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <MessageSquareText className="w-5 h-5" /> Meine Nachricht
            </h2>
            <div className="space-y-3">
              {messages.map((item) => (
                <article key={item.id} className="rounded-md bg-[#faf8f5] border border-black/8 px-4 py-3">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-black/60 leading-relaxed mt-2 whitespace-pre-wrap">{item.message}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        <div className="grid md:grid-cols-3 gap-5">
          <InfoCard icon={<Calendar className="w-5 h-5" />} title={customer.category || "Termin"}>
            <p>{formatDateDe(customer.eventDate) || "Datum folgt"}</p>
            {customer.location && <p className="text-black/50 text-sm mt-1">{customer.location}</p>}
          </InfoCard>
          {customer.registryOfficeDate && (
            <InfoCard icon={<Calendar className="w-5 h-5" />} title="Standesamt">
              <p>{formatDateDe(customer.registryOfficeDate)}</p>
            </InfoCard>
          )}
          <InfoCard icon={<Calendar className="w-5 h-5" />} title="Vorgespräch">
            <p>{customer.consultationDate || "Noch nicht festgelegt"}</p>
            {!customer.consultationDate && (
              <a href="https://wa.me/4915155338029?text=Servus%2C%20wir%20w%C3%BCrden%20gerne%20die%20Vorbesprechung%20vereinbaren." target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center justify-center gap-2 rounded-md bg-[#11100f] text-white px-3 py-2 text-sm hover:bg-black">
                <MessageCircle className="w-4 h-4" /> Hier Vorbesprechung vereinbaren
              </a>
            )}
          </InfoCard>
        </div>

        {visibleOffers.length > 0 && (
          <section className="bg-white border border-black/8 rounded-lg p-5 md:p-6">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Angebote
            </h2>
            <div className="space-y-3">
              {visibleOffers.map((offer) => {
                const final = ["angenommen", "abgelehnt", "aenderungswunsch"].includes(offer.status);
                return (
                  <article key={offer.id} className="rounded-md bg-[#faf8f5] border border-black/8 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <p className="font-medium">{offer.title || "Persönliches Angebot"}</p>
                        <p className="text-sm text-black/55 mt-1">{formatMoney(String(offerTotal(offer)))} · Status: {offer.status}</p>
                      </div>
                      {offer.pdfUrl && <a href={normalizeHref(offer.pdfUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-[#6c5746] hover:text-black">PDF öffnen <ExternalLink className="w-4 h-4" /></a>}
                    </div>
                    {!final ? (
                      <div className="mt-4">
                        <textarea value={offerMessage} onChange={(event) => setOfferMessage(event.target.value)} className="w-full min-h-20 rounded-md border border-black/10 px-3 py-2 text-sm" placeholder="Optional: Änderungswunsch oder kurze Nachricht" />
                        <div className="mt-3 flex flex-col sm:flex-row gap-2">
                          <button onClick={() => respondOffer(offer, "angenommen")} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#11100f] text-white px-4 py-2.5 text-sm"><CheckCircle2 className="w-4 h-4" /> Annehmen</button>
                          <button onClick={() => respondOffer(offer, "aenderungswunsch")} className="inline-flex items-center justify-center gap-2 rounded-md border border-black/10 px-4 py-2.5 text-sm">Änderungswunsch senden</button>
                          <button onClick={() => respondOffer(offer, "abgelehnt")} className="inline-flex items-center justify-center gap-2 rounded-md border border-red-200 text-red-700 px-4 py-2.5 text-sm">Ablehnen</button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-black/55">Danke, eure Rückmeldung ist angekommen.</p>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {documents.length > 0 && (
          <section className="bg-white border border-black/8 rounded-lg p-5 md:p-6">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Dokumente
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {documents.map((document) => (
                <a key={document.id} href={normalizeHref(document.url)} target="_blank" rel="noreferrer" className="rounded-md bg-[#faf8f5] border border-black/8 px-4 py-3 text-sm hover:border-black/20">
                  <span className="block font-medium">{document.title}</span>
                  <span className="mt-2 inline-flex items-center gap-1 text-[#6c5746]">Öffnen <ExternalLink className="w-3 h-3" /></span>
                </a>
              ))}
            </div>
          </section>
        )}

        <section className="bg-white border border-black/8 rounded-lg p-5 md:p-6">
          <h2 className="text-lg font-medium mb-2 flex items-center gap-2">
            <Upload className="w-5 h-5" /> Unterzeichneten Vertrag hochladen
          </h2>
          <p className="text-sm text-black/55 mb-4">Wenn der Vertrag unterschrieben ist, könnt ihr ihn hier direkt an mich übermitteln.</p>
          <label className={`inline-flex items-center justify-center gap-2 rounded-md bg-[#11100f] text-white px-4 py-3 text-sm ${uploadingContract ? "opacity-55 cursor-wait" : "cursor-pointer hover:bg-black"}`}>
            <Upload className="w-4 h-4" /> {uploadingContract ? "Upload läuft..." : "Vertrag auswählen"}
            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              disabled={uploadingContract}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.currentTarget.value = "";
                if (file) uploadSignedContract(file);
              }}
            />
          </label>
          {(customer.documents || []).find((document) => document.id === "doc-signed-contract")?.fileName && (
            <p className="mt-3 text-sm text-black/55">Zuletzt hochgeladen: {(customer.documents || []).find((document) => document.id === "doc-signed-contract")?.fileName}</p>
          )}
        </section>

        <section className="bg-white border border-black/8 rounded-lg p-5 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-medium">Inspirationen</h2>
              <p className="text-sm text-black/55 mt-1">Links zu Pinterest, Webseiten, Galerien oder anderen Ideen, die ich kennen sollte.</p>
            </div>
            <button onClick={() => setCustomer({ ...customer, inspirationLinks: [...inspirationLinks, { id: `insp-${Date.now()}`, title: "Neue Inspiration", url: "" }] })} className="inline-flex items-center justify-center gap-2 rounded-md border border-black/10 px-3 py-2 text-sm hover:border-black/25">
              <Plus className="w-4 h-4" /> Link
            </button>
          </div>
          <div className="space-y-2">
            {inspirationLinks.length === 0 && <p className="rounded-md bg-[#faf8f5] border border-black/8 px-4 py-3 text-sm text-black/45">Noch keine Inspirationslinks hinterlegt.</p>}
            {inspirationLinks.map((link) => (
              <div key={link.id} className="grid md:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)_auto] gap-2">
                <input value={link.title} onChange={(event) => setCustomer({ ...customer, inspirationLinks: inspirationLinks.map((item) => (item.id === link.id ? { ...item, title: event.target.value } : item)) })} onBlur={() => link.url && saveInspirationLinks(customer.inspirationLinks || [])} className="rounded-md border border-black/10 px-3 py-2 text-sm" placeholder="Titel" />
                <input value={link.url} onChange={(event) => setCustomer({ ...customer, inspirationLinks: inspirationLinks.map((item) => (item.id === link.id ? { ...item, url: event.target.value } : item)) })} onBlur={() => saveInspirationLinks(customer.inspirationLinks || [])} className="rounded-md border border-black/10 px-3 py-2 text-sm" placeholder="https://..." />
                <button onClick={() => saveInspirationLinks(inspirationLinks.filter((item) => item.id !== link.id))} className="rounded-md border border-black/10 px-3 py-2 text-sm text-black/55 hover:text-black">Entfernen</button>
              </div>
            ))}
          </div>
        </section>

        {visibility.locations && (customer.locationAddress || locations.length > 0) && (
          <section className="bg-white border border-black/8 rounded-lg p-5 md:p-6">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" /> Locations
            </h2>
            <div className="space-y-2">
              {customer.locationAddress && (
                <div className="rounded-md bg-[#faf8f5] border border-black/8 px-4 py-3">
                  <p className="font-medium">Hauptlocation</p>
                  <p className="text-sm text-black/55 mt-1">{customer.locationAddress}</p>
                  <a href={mapsUrl(customer.locationAddress)} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-[#6c5746] hover:text-black">
                    In Google Maps öffnen <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              {locations.map((location) => (
                <div key={location.id} className="rounded-md bg-[#faf8f5] border border-black/8 px-4 py-3">
                  <p className="font-medium">{location.title}</p>
                  <p className="text-sm text-black/55 mt-1">{location.address}</p>
                  <a href={mapsUrl(location.address || location.title)} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-[#6c5746] hover:text-black">
                    In Google Maps öffnen <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {customer.customerAddress && (
          <section className="bg-white border border-black/8 rounded-lg p-5 md:p-6">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" /> Kundenadresse
            </h2>
            <p className="text-sm text-black/55">{customer.customerAddress}</p>
            <a href={mapsUrl(customer.customerAddress)} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-[#6c5746] hover:text-black">
              In Google Maps öffnen <ExternalLink className="w-3 h-3" />
            </a>
          </section>
        )}

        {visibility.services && services.length > 0 && (
          <section className="bg-white border border-black/8 rounded-lg p-5 md:p-6">
            <h2 className="text-lg font-medium mb-4">Gebuchte Leistungen</h2>
            <div className="space-y-2">
              {services.map((service) => (
                <div key={service.id} className="flex items-center justify-between rounded-md bg-[#faf8f5] border border-black/8 px-4 py-3">
                  <span>{service.name}</span>
                  {service.price && <span className="text-black/55">{formatMoney(service.price)}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {!hasSpiegleinService && hasSpiegleinCatalog && (
          <section className="bg-white/70 border border-black/8 rounded-lg p-4 md:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start gap-3">
                <Camera className="w-5 h-5 text-[#8a6a45] mt-0.5" />
                <div>
                  <h2 className="text-base font-medium">Ihr braucht noch eine Fotobox?</h2>
                  <p className="text-sm text-black/55 mt-1">Mit das Spieglein bekommen eure Gäste Sofortdrucke, Requisiten und eine digitale Galerie.</p>
                </div>
              </div>
              <a href="/das-spieglein" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-4 py-2.5 text-sm hover:border-black/25">
                das Spieglein ansehen <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </section>
        )}

        {serviceCatalog.length > 0 && (
          <section className="bg-white border border-black/8 rounded-lg p-5 md:p-6">
            <h2 className="text-lg font-medium mb-2">Weitere Leistungen und Add-ons buchen</h2>
            <p className="text-sm text-black/55 mb-4">Wenn ihr noch etwas ergänzen möchtet, könnt ihr es hier unverbindlich anfragen. Ich prüfe es und melde mich mit der finalen Bestätigung.</p>
            <div className="space-y-2">
              {Array.from(new Set(serviceCatalog.filter((item) => item.active !== false && (!hasSpiegleinService || !item.name.toLowerCase().includes("spieglein"))).map((item) => item.group))).map((group) => (
                <details key={group} className="rounded-md border border-black/8 bg-[#faf8f5]">
                  <summary className="cursor-pointer px-4 py-3 font-medium">{group}</summary>
                  <div className="px-4 pb-4 space-y-2">
                    {serviceCatalog.filter((item) => item.active !== false && item.group === group && (!hasSpiegleinService || !item.name.toLowerCase().includes("spieglein"))).map((item) => (
                      <label key={item.id} className="flex items-start gap-3 rounded-md bg-white border border-black/8 px-3 py-3 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedAddOns.includes(item.id)}
                          onChange={(event) => setSelectedAddOns((prev) => event.target.checked ? [...prev, item.id] : prev.filter((id) => id !== item.id))}
                          className="mt-1"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium">{item.name}</span>
                          {item.description && <span className="block text-black/50 mt-1">{item.description}</span>}
                        </span>
                        {item.price && <span className="text-black/55 whitespace-nowrap">{formatMoney(item.price)}</span>}
                      </label>
                    ))}
                  </div>
                </details>
              ))}
            </div>
            <textarea value={addOnMessage} onChange={(event) => setAddOnMessage(event.target.value)} className="mt-4 w-full min-h-20 rounded-md border border-black/10 px-3 py-2 text-sm" placeholder="Optional: kurze Nachricht dazu" />
            <button onClick={submitAddOnRequest} disabled={sendingAddOns || selectedAddOns.length === 0} className="mt-3 inline-flex items-center justify-center gap-2 rounded-md bg-[#11100f] text-white px-4 py-3 text-sm disabled:opacity-45">
              Anfrage senden
            </button>
          </section>
        )}

        {visibility.payments && (
          <section className="bg-white border border-black/8 rounded-lg p-5 md:p-6">
            <h2 className="text-lg font-medium mb-4">Zahlungsübersicht</h2>
            <div className="grid sm:grid-cols-3 gap-3 mb-4">
              <div className="rounded-md bg-[#faf8f5] border border-black/8 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-black/40">Gesamt</p>
                <p className="mt-2 font-medium">{total > 0 ? formatMoney(String(total)) : "Noch kein Betrag"}</p>
              </div>
              <div className="rounded-md bg-[#faf8f5] border border-black/8 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-black/40">Bezahlt</p>
                <p className="mt-2 font-medium">{bookedPayments.length > 0 ? formatMoney(String(paid)) : "Noch keine Zahlung"}</p>
              </div>
              <div className="rounded-md bg-[#faf8f5] border border-black/8 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-black/40">Offen</p>
                <p className="mt-2 font-medium">{total > 0 ? formatMoney(String(openAmount)) : "Noch kein Betrag"}</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <div className="rounded-md bg-[#faf8f5] border border-black/8 px-4 py-3 text-sm">Anzahlung fällig: <span className="text-black/55">{customer.depositDueDate || "noch offen"}</span></div>
              <div className="rounded-md bg-[#faf8f5] border border-black/8 px-4 py-3 text-sm">Restbetrag fällig: <span className="text-black/55">{customer.finalPaymentDueDate || "noch offen"}</span></div>
            </div>
            {bookedPayments.length > 0 && (
              <div className="space-y-2">
                {bookedPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between rounded-md bg-[#faf8f5] border border-black/8 px-4 py-3 text-sm">
                    <span>{payment.title} {payment.paidAt ? <span className="text-black/40">· {payment.paidAt}</span> : null}</span>
                    <span className="text-black/55">{formatMoney(payment.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {visibility.gallery && (
          <section className="bg-[#11100f] text-white rounded-lg p-5 md:p-6">
            <h2 className="text-lg font-medium mb-2 flex items-center gap-2">
              <Image className="w-5 h-5" /> Finale Galerie
            </h2>
            {customer.galleryUrl ? (
                <a href={normalizeHref(customer.galleryUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-white/80 hover:text-white mt-3">
                Galerie öffnen <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <p className="text-white/50 mt-3">Der Galerie-Link erscheint hier, sobald die Bilder fertig sind.</p>
            )}
          </section>
        )}

        <section className="bg-white/70 border border-black/8 rounded-lg p-4 md:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-[#8a6a45] mt-0.5" />
              <div>
                <h2 className="text-base font-medium">Eure Erfahrung mit mir</h2>
                <p className="text-sm text-black/55 mt-1">Wenn ihr mögt, freue ich mich sehr über ein paar ehrliche Worte auf Google.</p>
              </div>
            </div>
            <a href={googleReviewUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-4 py-2.5 text-sm hover:border-black/25">
              Bewertung schreiben <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </section>

        <section className="bg-white border border-black/8 rounded-lg p-5 md:p-6">
          <h2 className="text-lg font-medium mb-2">Direkt zu mir</h2>
          <p className="text-sm text-black/55 mb-4">Wenn etwas offen ist oder ihr kurz etwas abstimmen wollt, erreicht ihr mich direkt hier.</p>
          <p className="text-sm text-black/55 mb-4">Mario Schubert, Bäckerbühelgasse 14, 6020 Innsbruck</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <a href="https://wa.me/4915155338029" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#11100f] text-white px-4 py-3 text-sm hover:bg-black">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            <a href="mailto:servus@marioschub.com" className="inline-flex items-center justify-center gap-2 rounded-md border border-black/10 px-4 py-3 text-sm hover:border-black/25">
              <Mail className="w-4 h-4" /> E-Mail
            </a>
          </div>
        </section>
        {portalNotice && <p className="text-center text-sm text-black/55">{portalNotice}</p>}
      </main>
    </div>
  );
}

function InfoCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-black/8 rounded-lg p-5">
      <div className="flex items-center gap-3 text-black/45 mb-3">
        {icon}
        <h2 className="text-xs uppercase tracking-[0.18em]">{title}</h2>
      </div>
      <div className="text-base">{children}</div>
    </section>
  );
}
