import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Calendar, CheckCircle2, Circle, Clock3, ExternalLink, FileText, Image, ListChecks, Lock, MapPin, MessageSquareText } from "lucide-react";

type ServiceItem = { id: string; name: string; price: string; type: "package" | "custom" };
type TaskItem = { id: string; title: string; status: "offen" | "in_arbeit" | "erledigt" | "obsolet" };
type LocationItem = { id: string; title: string; address: string };
type PaymentItem = { id: string; title: string; amount: string; paidAt: string; note?: string };
type CustomerDocument = { id: string; kind: "offer" | "contract" | "invoice" | "custom"; title: string; url: string; driveFileId?: string; fileName?: string; mimeType?: string; uploadedAt?: string };
type PortalVisibility = {
  status?: boolean;
  tasks?: boolean;
  services?: boolean;
  payments?: boolean;
  documents?: boolean;
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

function normalizeHref(value?: string) {
  const trimmed = (value || "").trim();
  if (!trimmed) return "";
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith("mailto:") || trimmed.startsWith("tel:")) return trimmed;
  return `https://${trimmed}`;
}

function mapsUrl(value?: string) {
  return value ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}` : "";
}

function formatMoney(value?: string) {
  const clean = (value || "").trim();
  if (!clean) return "";
  if (/[€a-z]/i.test(clean)) return clean;
  const parsed = Number(clean.replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(parsed)) return clean;
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(parsed);
}

function moneyNumber(value?: string) {
  const parsed = Number((value || "").replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function portalDocuments(customer: Customer, visibility: Required<PortalVisibility>) {
  const existing = new Map((customer.documents || []).map((document) => [document.id, document]));
  const standard: CustomerDocument[] = [
    { id: "doc-offer", kind: "offer", title: "Angebot", url: customer.offerUrl || "" },
    { id: "doc-contract", kind: "contract", title: "Vertrag", url: customer.contractUrl || "" },
    { id: "doc-invoice", kind: "invoice", title: "Rechnung", url: customer.invoiceUrl || "" },
  ].map((document) => ({ ...document, ...(existing.get(document.id) || {}), url: existing.get(document.id)?.url || document.url }));
  return [
    ...standard.filter((document) => {
      if (document.kind === "offer") return visibility.offer && document.url;
      if (document.kind === "contract") return visibility.contract && document.url;
      if (document.kind === "invoice") return visibility.invoice && document.url;
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
          <p className="text-white/45 text-sm text-center mb-6">Bitte gib das Passwort aus Marios Mail ein.</p>
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
  const total = services.reduce((sum, service) => sum + moneyNumber(service.price), 0);
  const paid = payments.reduce((sum, payment) => sum + moneyNumber(payment.amount), 0);
  const openAmount = Math.max(total - paid, 0);
  const messages = (customer.portalMessages || []).filter((item) => item.visible);
  const locations = customer.locations || [];
  const documents = portalDocuments(customer, visibility);

  return (
    <div className="min-h-screen bg-[#f4f0eb] text-[#1f1b17]">
      <section className="bg-[#11100f] text-white">
        <div className="max-w-5xl mx-auto px-5 py-14 md:py-20">
          <p className="text-white/45 text-xs uppercase tracking-[0.28em]">Mario Schubert Photography</p>
          <h1 className="mt-5 text-3xl md:text-5xl font-light">Servus ihr Lieben</h1>
          <p className="mt-5 max-w-2xl text-white/60 leading-relaxed">
            {customer.portalIntro || "Hier findest du die wichtigsten Informationen zu unserem gemeinsamen Termin."}
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
              <MessageSquareText className="w-5 h-5" /> Nachricht von Mario
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
            <p>{customer.eventDate || "Datum folgt"}</p>
            {customer.location && <p className="text-black/50 text-sm mt-1">{customer.location}</p>}
          </InfoCard>
          <InfoCard icon={<Calendar className="w-5 h-5" />} title="Vorgespräch">
            <p>{customer.consultationDate || "Noch nicht festgelegt"}</p>
          </InfoCard>
        </div>

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

        {(customer.locationAddress || locations.length > 0) && (
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

        {visibility.payments && (
          <section className="bg-white border border-black/8 rounded-lg p-5 md:p-6">
            <h2 className="text-lg font-medium mb-4">Zahlungsübersicht</h2>
            <div className="grid sm:grid-cols-3 gap-3 mb-4">
              <div className="rounded-md bg-[#faf8f5] border border-black/8 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-black/40">Gesamt</p>
                <p className="mt-2 font-medium">{formatMoney(String(total)) || "Noch offen"}</p>
              </div>
              <div className="rounded-md bg-[#faf8f5] border border-black/8 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-black/40">Bezahlt</p>
                <p className="mt-2 font-medium">{formatMoney(String(paid))}</p>
              </div>
              <div className="rounded-md bg-[#faf8f5] border border-black/8 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-black/40">Offen</p>
                <p className="mt-2 font-medium">{formatMoney(String(openAmount))}</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <div className="rounded-md bg-[#faf8f5] border border-black/8 px-4 py-3 text-sm">Anzahlung fällig: <span className="text-black/55">{customer.depositDueDate || "noch offen"}</span></div>
              <div className="rounded-md bg-[#faf8f5] border border-black/8 px-4 py-3 text-sm">Restbetrag fällig: <span className="text-black/55">{customer.finalPaymentDueDate || "noch offen"}</span></div>
            </div>
            {payments.length > 0 && (
              <div className="space-y-2">
                {payments.map((payment) => (
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
