import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Check, Download, X } from "lucide-react";

type OfferItem = { id: string; name: string; description?: string; quantity: string; unitPrice: string };
type Offer = {
  publicToken: string;
  status: string;
  customerName: string;
  eventDate: string;
  validUntil: string;
  title: string;
  introText: string;
  notes: string;
  items: OfferItem[];
  travelKm: string;
  travelRate: string;
  discountLabel: string;
  discountAmount: string;
  total: string;
  pdfUrl: string;
  responseMessage: string;
};

function moneyNumber(value?: string) {
  const clean = (value || "").replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(clean);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);
}

function offerTotal(offer: Offer) {
  const items = (offer.items || []).reduce((sum, item) => sum + moneyNumber(item.quantity || "1") * moneyNumber(item.unitPrice), 0);
  const travel = offer.travelKm ? moneyNumber(offer.travelKm) * moneyNumber(offer.travelRate || "0.60") : 0;
  const discount = moneyNumber(offer.discountAmount || "");
  return Math.max(items + travel - discount, 0);
}

export function OfferPage() {
  const { token } = useParams();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/mario-crm?action=public-offer&token=${encodeURIComponent(token || "")}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Angebot nicht gefunden");
        setOffer(data.offer);
      } catch (err: any) {
        setError(err.message || "Angebot konnte nicht geladen werden");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const respond = async (status: "angenommen" | "abgelehnt" | "aenderungswunsch") => {
    setSending(status);
    try {
      const res = await fetch("/api/mario-crm?action=offer-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, status, responseMessage: message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Antwort konnte nicht gesendet werden");
      setOffer(data.offer);
    } catch (err: any) {
      setError(err.message || "Antwort konnte nicht gesendet werden");
    } finally {
      setSending("");
    }
  };

  if (loading) return <div className="min-h-screen bg-[#f4f0eb] flex items-center justify-center">Lade Angebot...</div>;
  if (error || !offer) return <div className="min-h-screen bg-[#11100f] text-white flex items-center justify-center px-4 text-center">{error || "Angebot nicht gefunden"}</div>;

  const total = offerTotal(offer);
  const isFinal = ["angenommen", "abgelehnt", "aenderungswunsch"].includes(offer.status);
  const pdfDownloadUrl = `/api/mario-crm?action=download-offer&token=${encodeURIComponent(offer.publicToken || token || "")}`;

  return (
    <div className="min-h-screen bg-[#f4f0eb] text-[#1f1b17] px-4 py-8 md:py-12">
      <main className="max-w-4xl mx-auto bg-white border border-black/8 rounded-lg overflow-hidden">
        <section className="bg-[#11100f] text-white p-6 md:p-10">
          <p className="text-white/45 text-xs uppercase tracking-[0.28em]">Mario Schubert Photography</p>
          <h1 className="mt-3 text-3xl md:text-5xl font-light">{offer.title || "Persönliches Angebot"}</h1>
          <p className="mt-4 text-white/65">{offer.customerName}{offer.eventDate ? ` · ${offer.eventDate}` : ""}</p>
        </section>
        <section className="p-5 md:p-8 space-y-6">
          <p className="whitespace-pre-wrap text-black/65 leading-relaxed">{offer.introText}</p>
          <div className="rounded-lg border border-black/8 overflow-hidden">
            {(offer.items || []).map((item) => {
              const amount = moneyNumber(item.quantity || "1") * moneyNumber(item.unitPrice);
              return (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 border-b border-black/8 last:border-b-0 px-4 py-3">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.description && <p className="text-sm text-black/50 mt-1">{item.description}</p>}
                  </div>
                  <p className="text-sm text-black/65">{item.quantity || "1"} x {formatMoney(moneyNumber(item.unitPrice))} = {formatMoney(amount)}</p>
                </div>
              );
            })}
            {offer.travelKm && (
              <div className="flex justify-between gap-3 border-b border-black/8 px-4 py-3 text-sm">
                <span>Fahrtkosten ({offer.travelKm} km x {offer.travelRate || "0.60"} EUR)</span>
                <span>{formatMoney(moneyNumber(offer.travelKm) * moneyNumber(offer.travelRate || "0.60"))}</span>
              </div>
            )}
            {moneyNumber(offer.discountAmount || "") > 0 && (
              <div className="flex justify-between gap-3 border-b border-black/8 px-4 py-3 text-sm">
                <span>{offer.discountLabel || "Rabatt"}</span>
                <span>-{formatMoney(moneyNumber(offer.discountAmount))}</span>
              </div>
            )}
            <div className="flex justify-between gap-3 bg-[#faf8f5] px-4 py-4 font-semibold">
              <span>Gesamt</span>
              <span>{formatMoney(total)}</span>
            </div>
          </div>
          {offer.notes && <p className="text-sm text-black/50 whitespace-pre-wrap">{offer.notes}</p>}
          <a href={pdfDownloadUrl} className="inline-flex items-center gap-2 rounded-md border border-black/10 px-4 py-3 text-sm hover:border-black/25">
            <Download className="w-4 h-4" /> Angebot als PDF herunterladen
          </a>
          {isFinal ? (
            <div className="rounded-lg bg-[#faf8f5] border border-black/8 p-4">
              <p className="font-medium">Danke, eure Rückmeldung ist angekommen.</p>
              <p className="text-sm text-black/55 mt-1">Status: {offer.status}</p>
            </div>
          ) : (
            <div className="rounded-lg bg-[#faf8f5] border border-black/8 p-4">
              <label className="block text-sm">
                <span className="text-xs uppercase tracking-[0.16em] text-black/45">Optionaler Kommentar</span>
                <textarea value={message} onChange={(event) => setMessage(event.target.value)} className="mt-2 w-full min-h-24 rounded-md border border-black/10 px-3 py-2 text-sm" placeholder="Falls ihr etwas ändern möchtet..." />
              </label>
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <button onClick={() => respond("angenommen")} disabled={Boolean(sending)} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#11100f] text-white px-4 py-3 text-sm disabled:opacity-50"><Check className="w-4 h-4" /> Angebot annehmen</button>
                <button onClick={() => respond("aenderungswunsch")} disabled={Boolean(sending)} className="inline-flex items-center justify-center gap-2 rounded-md border border-black/10 px-4 py-3 text-sm disabled:opacity-50">Änderungswunsch senden</button>
                <button onClick={() => respond("abgelehnt")} disabled={Boolean(sending)} className="inline-flex items-center justify-center gap-2 rounded-md border border-red-200 text-red-700 px-4 py-3 text-sm disabled:opacity-50"><X className="w-4 h-4" /> Ablehnen</button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
