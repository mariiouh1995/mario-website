import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { Calendar, CheckCircle2, ExternalLink, FileText, Image, ListChecks, Lock, MapPin, MessageSquareText } from "lucide-react";

type ServiceItem = { id: string; name: string; price: string; type: "package" | "custom" };
type TaskItem = { id: string; title: string; status: "offen" | "in_arbeit" | "erledigt" | "obsolet" };
type LocationItem = { id: string; title: string; address: string };
type PortalVisibility = {
  status?: boolean;
  tasks?: boolean;
  services?: boolean;
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
  tasks: TaskItem[];
  portalIntro: string;
  portalVisibility?: PortalVisibility;
  portalMessages?: PortalMessage[];
};
type WorkflowItem = { key: string; label: string };

const defaultVisibility: Required<PortalVisibility> = {
  status: false,
  tasks: false,
  services: true,
  offer: false,
  contract: false,
  invoice: false,
  gallery: true,
  messages: true,
};

export function CustomerPortalPage() {
  const { token } = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowItem[]>([]);
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
        setWorkflow(data.workflow || []);
        setNeedsPassword(false);
      } catch (err: any) {
        setCustomer(null);
        setWorkflow([]);
        setError(err.message || "Portal konnte nicht geladen werden");
      } finally {
        setLoading(false);
      }
    }
    loadPortal();
  }, [token, portalPassword]);

  const firstName = useMemo(() => customer?.name?.split(" ")[0] || "Servus", [customer]);

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
  const activeIndex = workflow.findIndex((item) => item.key === customer.status);
  const services = [...(customer.bookedServices || []), ...(customer.customServices || [])];
  const visibleTasks = (customer.tasks || []).filter((task) => task.status === "erledigt");
  const messages = (customer.portalMessages || []).filter((item) => item.visible);
  const locations = customer.locations || [];

  return (
    <div className="min-h-screen bg-[#f4f0eb] text-[#1f1b17]">
      <section className="bg-[#11100f] text-white">
        <div className="max-w-5xl mx-auto px-5 py-14 md:py-20">
          <p className="text-white/45 text-xs uppercase tracking-[0.28em]">Mario Schubert Photography</p>
          <h1 className="mt-5 text-3xl md:text-5xl font-light">Servus {firstName}</h1>
          <p className="mt-5 max-w-2xl text-white/60 leading-relaxed">
            {customer.portalIntro || "Hier findest du die wichtigsten Informationen zu unserem gemeinsamen Termin."}
          </p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-5 py-8 md:py-12 space-y-8">
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

        {visibility.status && (
          <section className="bg-white border border-black/8 rounded-lg p-5 md:p-6">
            <h2 className="text-lg font-medium mb-5">Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {workflow.map((step, index) => {
                const complete = index <= activeIndex;
                return (
                  <div key={step.key} className={`rounded-md border px-3 py-3 text-sm ${complete ? "bg-[#11100f] border-[#11100f] text-white" : "bg-[#faf8f5] border-black/8 text-black/45"}`}>
                    {complete && <CheckCircle2 className="w-4 h-4 mb-2" />}
                    {step.label}
                  </div>
                );
              })}
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
          {visibility.contract && (
            <InfoCard icon={<FileText className="w-5 h-5" />} title="Vertrag">
              {customer.contractUrl ? (
                <a href={customer.contractUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[#6c5746] hover:text-black">
                  Vertrag öffnen <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <p>Noch nicht hinterlegt</p>
              )}
            </InfoCard>
          )}
          {visibility.offer && (
            <InfoCard icon={<FileText className="w-5 h-5" />} title="Angebot">
              {customer.offerUrl ? (
                <a href={customer.offerUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[#6c5746] hover:text-black">
                  Angebot öffnen <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <p>Noch nicht hinterlegt</p>
              )}
            </InfoCard>
          )}
          {visibility.invoice && (
            <InfoCard icon={<FileText className="w-5 h-5" />} title="Rechnung">
              {customer.invoiceUrl ? (
                <a href={customer.invoiceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[#6c5746] hover:text-black">
                  Rechnung öffnen <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <p>Noch nicht hinterlegt</p>
              )}
            </InfoCard>
          )}
        </div>

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
                </div>
              )}
              {locations.map((location) => (
                <div key={location.id} className="rounded-md bg-[#faf8f5] border border-black/8 px-4 py-3">
                  <p className="font-medium">{location.title}</p>
                  <p className="text-sm text-black/55 mt-1">{location.address}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {visibility.services && services.length > 0 && (
          <section className="bg-white border border-black/8 rounded-lg p-5 md:p-6">
            <h2 className="text-lg font-medium mb-4">Gebuchte Leistungen</h2>
            <div className="space-y-2">
              {services.map((service) => (
                <div key={service.id} className="flex items-center justify-between rounded-md bg-[#faf8f5] border border-black/8 px-4 py-3">
                  <span>{service.name}</span>
                  {service.price && <span className="text-black/55">{service.price}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {visibility.tasks && visibleTasks.length > 0 && (
          <section className="bg-white border border-black/8 rounded-lg p-5 md:p-6">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <ListChecks className="w-5 h-5" /> Erledigt
            </h2>
            <div className="grid md:grid-cols-2 gap-2">
              {visibleTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-2 rounded-md bg-[#faf8f5] border border-black/8 px-4 py-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  {task.title}
                </div>
              ))}
            </div>
          </section>
        )}

        {visibility.gallery && (
          <section className="bg-[#11100f] text-white rounded-lg p-5 md:p-6">
            <h2 className="text-lg font-medium mb-2 flex items-center gap-2">
              <Image className="w-5 h-5" /> Finale Galerie
            </h2>
            {customer.galleryUrl ? (
              <a href={customer.galleryUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-white/80 hover:text-white mt-3">
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
