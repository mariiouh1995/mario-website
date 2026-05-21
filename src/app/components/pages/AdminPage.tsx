import { useCallback, useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "sonner";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  ListChecks,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageSquareText,
  Pencil,
  Plus,
  Save,
  Send,
  Settings,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

type CustomerStatus =
  | "anfrage"
  | "vorgespraech"
  | "angebot"
  | "vertrag"
  | "anzahlung"
  | "spieglein"
  | "shooting"
  | "fotopreview"
  | "editing"
  | "galerie"
  | "dankesgeschenk"
  | "google_bewertung"
  | "abgeschlossen";
type TaskStatus = "offen" | "in_arbeit" | "erledigt" | "obsolet";
type ServiceItem = { id: string; name: string; price: string; type: "package" | "custom" };
type TaskItem = { id: string; title: string; status: TaskStatus; dueDate?: string; note?: string };
type LocationItem = { id: string; title: string; address: string };
type PaymentItem = { id: string; title: string; amount: string; paidAt: string; note?: string };
type CustomerDocument = { id: string; kind: "offer" | "contract" | "invoice" | "custom"; title: string; url: string; driveFileId?: string; fileName?: string; mimeType?: string; uploadedAt?: string };
type PortalVisibility = {
  status: boolean;
  tasks: boolean;
  services: boolean;
  payments: boolean;
  documents: boolean;
  locations: boolean;
  offer: boolean;
  contract: boolean;
  invoice: boolean;
  gallery: boolean;
  messages: boolean;
};
type PortalMessage = { id: string; title: string; message: string; createdAt: string; visible: boolean };
type Inquiry = {
  id: string;
  createdAt: string;
  status: string;
  name: string;
  brideName?: string;
  groomName?: string;
  email: string;
  phone: string;
  category: string;
  eventDate: string;
  foundVia: string;
  message: string;
  customerAddress?: string;
  locationAddress?: string;
  locations?: LocationItem[];
  selectedPackages: ServiceItem[];
  estimatedTotal: string;
};
type Customer = {
  id: string;
  portalToken: string;
  sourceInquiryId: string;
  createdAt: string;
  updatedAt: string;
  status: CustomerStatus;
  name: string;
  brideName: string;
  groomName: string;
  email: string;
  secondaryEmail: string;
  phone: string;
  secondaryPhone: string;
  category: string;
  eventDate: string;
  eventTime: string;
  eventEndTime: string;
  coverageDuration: string;
  guestCount: string;
  location: string;
  customerAddress: string;
  locationAddress: string;
  locations: LocationItem[];
  consultationDate: string;
  consultationType: string;
  galleryUrl: string;
  offerUrl: string;
  contractUrl: string;
  invoiceUrl: string;
  portalEnabled: boolean;
  portalPassword: string;
  portalPublishedAt: string;
  contractStatus: "nicht_gesendet" | "gesendet" | "unterzeichnet";
  bookedServices: ServiceItem[];
  customServices: ServiceItem[];
  payments: PaymentItem[];
  depositDueDate: string;
  finalPaymentDueDate: string;
  documents: CustomerDocument[];
  driveFolderId: string;
  tasks: TaskItem[];
  portalVisibility: PortalVisibility;
  portalMessages: PortalMessage[];
  notes: string;
  portalIntro: string;
};
type WorkflowItem = { key: CustomerStatus; label: string };
type MailTemplate = { label: string; subject: string; body: string };
type ReminderSettings = { days: number[] };
type NotificationItem = { id: string; customerId: string; customerName: string; taskId: string; taskTitle: string; dueDate: string; daysLeft: number };
type CalendarEvent = { id: string; customerId: string; customerName: string; type: "shooting" | "consultation"; date: string; time: string; title: string; location: string };
type ConfirmAction = {
  title: string;
  description: string;
  templateKey?: string;
  subject?: string;
  body?: string;
  target?: "customer" | "inquiry";
  inquiryId?: string;
  onConfirm: () => void | Promise<void>;
};

const taskStatusLabels: Record<TaskStatus, string> = {
  offen: "offen",
  in_arbeit: "in Arbeit",
  erledigt: "erledigt",
  obsolet: "obsolet",
};

const taskStatusStyles: Record<TaskStatus, string> = {
  offen: "bg-white border-black/10 text-black/65",
  in_arbeit: "bg-[#f6ead9] border-[#d6ad73] text-[#7b4d12]",
  erledigt: "bg-[#e8f2ea] border-[#a8c9ad] text-[#2f6a38]",
  obsolet: "bg-black/5 border-black/10 text-black/45",
};

const statusSteps: WorkflowItem[] = [
  { key: "anfrage", label: "Anfrage" },
  { key: "vorgespraech", label: "Vorgespräch" },
  { key: "angebot", label: "Angebot" },
  { key: "vertrag", label: "Vertrag" },
  { key: "anzahlung", label: "Anzahlung" },
  { key: "spieglein", label: "Spieglein einrichten" },
  { key: "shooting", label: "Shooting/Hochzeit" },
  { key: "fotopreview", label: "Fotopreview" },
  { key: "editing", label: "Editing" },
  { key: "galerie", label: "Galerie geliefert" },
  { key: "dankesgeschenk", label: "Dankesgeschenk" },
  { key: "google_bewertung", label: "Google Bewertung" },
  { key: "abgeschlossen", label: "Abgeschlossen" },
];

const defaultPortalVisibility: PortalVisibility = {
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

const defaultReminderSettings: ReminderSettings = { days: [14, 7, 3, 1] };
const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

const workflowTasks = () => statusSteps.map((step) => ({ id: `step-${step.key}`, title: step.label, status: "offen" as TaskStatus }));

const emptyCustomer = (): Customer => ({
  id: "",
  portalToken: "",
  sourceInquiryId: "",
  createdAt: "",
  updatedAt: "",
  status: "anfrage",
  name: "",
  brideName: "",
  groomName: "",
  email: "",
  secondaryEmail: "",
  phone: "",
  secondaryPhone: "",
  category: "Hochzeit",
  eventDate: "",
  eventTime: "",
  eventEndTime: "",
  coverageDuration: "",
  guestCount: "",
  location: "",
  customerAddress: "",
  locationAddress: "",
  locations: [],
  consultationDate: "",
  consultationType: "",
  galleryUrl: "",
  offerUrl: "",
  contractUrl: "",
  invoiceUrl: "",
  portalEnabled: false,
  portalPassword: "",
  portalPublishedAt: "",
  contractStatus: "nicht_gesendet",
  bookedServices: [],
  customServices: [],
  payments: [],
  depositDueDate: "",
  finalPaymentDueDate: "",
  documents: [],
  driveFolderId: "",
  tasks: workflowTasks(),
  portalVisibility: { ...defaultPortalVisibility },
  portalMessages: [],
  notes: "",
  portalIntro: "",
});

function isWorkflowTask(task: TaskItem) {
  return task.id.startsWith("step-");
}

function deriveStatus(tasks: TaskItem[]): CustomerStatus {
  const workflow = statusSteps.map((step) => tasks.find((task) => task.id === `step-${step.key}`)).filter(Boolean) as TaskItem[];
  const inProgress = workflow.find((task) => task.status === "in_arbeit");
  if (inProgress) return inProgress.id.replace("step-", "") as CustomerStatus;
  const lastDone = [...workflow].reverse().find((task) => task.status === "erledigt");
  return (lastDone?.id.replace("step-", "") as CustomerStatus) || "anfrage";
}

function normalizeTasks(tasks: TaskItem[] = []) {
  if (!tasks.length) return workflowTasks();
  return tasks.map((task) => ({
    id: task.id || `task-${Date.now()}`,
    title: task.title || "Neue Aufgabe",
    status: task.status || "offen",
    dueDate: task.dueDate || "",
    note: task.note || "",
  }));
}

function normalizeCustomer(customer: Customer): Customer {
  const tasks = normalizeTasks(customer.tasks || []);
  return {
    ...emptyCustomer(),
    ...customer,
    secondaryEmail: customer.secondaryEmail || "",
    secondaryPhone: customer.secondaryPhone || "",
    eventTime: customer.eventTime || "",
    eventEndTime: customer.eventEndTime || "",
    coverageDuration: customer.coverageDuration || "",
    guestCount: customer.guestCount || "",
    offerUrl: customer.offerUrl || "",
    portalEnabled: Boolean(customer.portalEnabled),
    portalPassword: customer.portalPassword || "",
    portalPublishedAt: customer.portalPublishedAt || "",
    portalVisibility: { ...defaultPortalVisibility, ...(customer.portalVisibility || {}) },
    portalMessages: customer.portalMessages || [],
    bookedServices: customer.bookedServices || [],
    customServices: customer.customServices || [],
    payments: customer.payments || [],
    depositDueDate: customer.depositDueDate || "",
    finalPaymentDueDate: customer.finalPaymentDueDate || "",
    documents: customer.documents || [],
    driveFolderId: customer.driveFolderId || "",
    locations: customer.locations || [],
    tasks,
    status: deriveStatus(tasks),
  };
}

function createPortalPassword(eventDate: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(eventDate || "");
  return match ? `${match[3]}${match[2]}${match[1]}` : "";
}

function parseDate(value: string) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const monthMap: Record<string, string> = {
    januar: "01", februar: "02", märz: "03", maerz: "03", april: "04", mai: "05", juni: "06",
    juli: "07", august: "08", september: "09", oktober: "10", november: "11", dezember: "12",
  };
  const match = /(\d{1,2})\.\s*([A-Za-zäöüÄÖÜ]+)\s*(\d{4})/.exec(value);
  if (!match) return "";
  const month = monthMap[match[2].toLowerCase()];
  return month ? `${match[3]}-${month}-${match[1].padStart(2, "0")}` : "";
}

function parseTime(value: string) {
  return /(\d{1,2}:\d{2})/.exec(value || "")?.[1] || "";
}

function mailBodyForEditor(body = "") {
  return body.replace(/\n{0,2}\{signature\}\s*$/i, "").trim();
}

function formatMoney(value?: string) {
  const clean = (value || "").trim();
  if (!clean) return "";
  if (/[€a-z]/i.test(clean)) return clean;
  const normalized = Number(clean.replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(normalized)) return clean;
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(normalized);
}

function formatDateDe(value?: string) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function moneyNumber(value?: string) {
  const clean = (value || "").replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(clean);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapsUrl(value?: string) {
  return value ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}` : "";
}

function normalizeHref(value?: string) {
  const trimmed = (value || "").trim();
  if (!trimmed) return "";
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith("mailto:") || trimmed.startsWith("tel:")) return trimmed;
  return `https://${trimmed}`;
}

function vcardEscape(value?: string) {
  return (value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .trim();
}

function contactFileName(customer: Customer) {
  return `${(customer.name || "mario-kunde").toLowerCase().replace(/[^a-z0-9äöüß]+/gi, "-").replace(/^-+|-+$/g, "") || "mario-kunde"}.vcf`;
}

function downloadCustomerContact(customer: Customer) {
  const displayName = customer.name || [customer.brideName, customer.groomName].filter(Boolean).join(" & ") || "Mario Kunde";
  const note = [
    customer.category && `Kategorie: ${customer.category}`,
    customer.eventDate && `Termin: ${formatDateDe(customer.eventDate)}${[customer.eventTime, customer.eventEndTime].filter(Boolean).length ? ` ${[customer.eventTime, customer.eventEndTime].filter(Boolean).join(" - ")}` : ""}`,
    customer.coverageDuration && `Dauer der Begleitung: ${customer.coverageDuration}`,
    customer.guestCount && `Anzahl Gäste: ${customer.guestCount}`,
    customer.brideName && `Braut: ${customer.brideName}`,
    customer.groomName && `Bräutigam: ${customer.groomName}`,
    customer.locationAddress && `Location: ${customer.locationAddress}`,
  ].filter(Boolean).join("\n");
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${vcardEscape(displayName)}`,
    `N:${vcardEscape(displayName)};;;;`,
    customer.phone ? `TEL;TYPE=CELL:${vcardEscape(customer.phone)}` : "",
    customer.secondaryPhone ? `TEL;TYPE=CELL:${vcardEscape(customer.secondaryPhone)}` : "",
    customer.email ? `EMAIL;TYPE=INTERNET:${vcardEscape(customer.email)}` : "",
    customer.secondaryEmail ? `EMAIL;TYPE=INTERNET:${vcardEscape(customer.secondaryEmail)}` : "",
    customer.customerAddress ? `ADR;TYPE=HOME:;;${vcardEscape(customer.customerAddress)};;;;` : "",
    note ? `NOTE:${vcardEscape(note)}` : "",
    "END:VCARD",
  ].filter(Boolean);
  const blob = new Blob([lines.join("\r\n")], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = contactFileName(customer);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  toast.success("Kontaktdatei heruntergeladen");
}

function readBlobAsBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || "").split(",")[1] || "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function dateDiffDays(date: string) {
  const target = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

export function AdminPage() {
  const [password, setPassword] = useState("");
  const [adminPassword, setAdminPassword] = useState(() => sessionStorage.getItem("admin_pw") || "");
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem("admin_auth") === "true");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [workflow, setWorkflow] = useState<WorkflowItem[]>(statusSteps);
  const [mailTemplates, setMailTemplates] = useState<Record<string, MailTemplate>>({});
  const [selectedId, setSelectedId] = useState("");
  const [selectedInquiryId, setSelectedInquiryId] = useState("");
  const [draft, setDraft] = useState<Customer | null>(null);
  const [activeMail, setActiveMail] = useState("reply");
  const [mailSubject, setMailSubject] = useState("");
  const [mailBody, setMailBody] = useState("");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [confirmSendMail, setConfirmSendMail] = useState(false);
  const [confirmSubject, setConfirmSubject] = useState("");
  const [confirmBody, setConfirmBody] = useState("");
  const [confirmAttachmentUrl, setConfirmAttachmentUrl] = useState("");
  const [confirmAttachmentName, setConfirmAttachmentName] = useState("");
  const [view, setView] = useState<"customerDetail" | "inquiryDetail" | "customersList" | "inquiriesList" | "calendar">("customersList");
  const [editMode, setEditMode] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [calendarEvent, setCalendarEvent] = useState<CalendarEvent | null>(null);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskNote, setNewTaskNote] = useState("");
  const [newPaymentOpen, setNewPaymentOpen] = useState(false);
  const [newPaymentTitle, setNewPaymentTitle] = useState("Anzahlung");
  const [newPaymentAmount, setNewPaymentAmount] = useState("");
  const [newPaymentDate, setNewPaymentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [syncingImages, setSyncingImages] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("mario_read_notifications");
    return saved ? JSON.parse(saved) : [];
  });
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(() => {
    const saved = localStorage.getItem("mario_reminder_settings");
    return saved ? JSON.parse(saved) : defaultReminderSettings;
  });

  const selectedCustomer = useMemo(() => customers.find((customer) => customer.id === selectedId) || null, [customers, selectedId]);
  const selectedInquiry = useMemo(() => inquiries.find((inquiry) => inquiry.id === selectedInquiryId) || null, [inquiries, selectedInquiryId]);

  const allNotifications = useMemo<NotificationItem[]>(() => {
    return customers.flatMap((customer) =>
      customer.tasks
        .filter((task) => task.dueDate && task.status !== "erledigt" && task.status !== "obsolet")
        .map((task) => ({ task, daysLeft: dateDiffDays(task.dueDate || "") }))
        .filter(({ daysLeft }) => daysLeft >= 0 && reminderSettings.days.includes(daysLeft))
        .map(({ task, daysLeft }) => ({
          id: `${customer.id}-${task.id}-${task.dueDate}`,
          customerId: customer.id,
          customerName: customer.name || "Unbenannter Kunde",
          taskId: task.id,
          taskTitle: task.title,
          dueDate: task.dueDate || "",
          daysLeft,
        })),
    );
  }, [customers, reminderSettings.days]);

  const notifications = useMemo<NotificationItem[]>(() => {
    const read = new Set(readNotificationIds);
    return allNotifications.filter((item) => !read.has(item.id));
  }, [allNotifications, readNotificationIds]);

  const notificationsByCustomer = useMemo(() => {
    return notifications.reduce<Record<string, number>>((acc, item) => {
      acc[item.customerId] = (acc[item.customerId] || 0) + 1;
      return acc;
    }, {});
  }, [notifications]);

  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    return customers.flatMap((customer) => {
      const events: CalendarEvent[] = [];
      if (customer.eventDate) {
        events.push({
          id: `${customer.id}-shooting`,
          customerId: customer.id,
          customerName: customer.name,
          type: "shooting",
          date: customer.eventDate,
          time: [customer.eventTime, customer.eventEndTime].filter(Boolean).join(" - ") || "ganztags",
          title: customer.category || "Shooting/Hochzeit",
          location: customer.location || customer.locationAddress,
        });
      }
      const consultationDate = parseDate(customer.consultationDate);
      if (consultationDate) {
        events.push({
          id: `${customer.id}-consultation`,
          customerId: customer.id,
          customerName: customer.name,
          type: "consultation",
          date: consultationDate,
          time: parseTime(customer.consultationDate) || "offen",
          title: "Vorgespräch",
          location: customer.consultationType,
        });
      }
      return events;
    });
  }, [customers]);

  const api = useCallback(
    async (action: string, init: RequestInit = {}) => {
      const headers = { "Content-Type": "application/json", "x-admin-password": adminPassword, ...(init.headers || {}) };
      const res = await fetch(`/api/mario-crm?action=${action}`, { ...init, headers });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Aktion fehlgeschlagen");
      return data;
    },
    [adminPassword],
  );

  const loadCrm = useCallback(async () => {
    if (!adminPassword) return;
    setLoading(true);
    setMessage("");
    try {
      const data = await api("bootstrap");
      setInquiries(data.inquiries || []);
      setCustomers((data.customers || []).map(normalizeCustomer));
      setWorkflow(data.workflow || statusSteps);
      setMailTemplates(data.mailTemplates || {});
      if (!selectedId && data.customers?.[0]) setSelectedId(data.customers[0].id);
    } catch (error: any) {
      setInquiries([]);
      setCustomers([]);
      setWorkflow(statusSteps);
      setMailTemplates({});
      setSelectedId("");
      setSelectedInquiryId("");
      setDraft(null);
      setMessage(`API/DB nicht erreichbar: ${error.message || "unbekannter Fehler"}. Bitte Vercel Function Logs prüfen.`);
      toast.error(`API/DB nicht erreichbar: ${error.message || "unbekannter Fehler"}`);
    } finally {
      setLoading(false);
    }
  }, [adminPassword, api, selectedId]);

  useEffect(() => {
    if (isAuthenticated) loadCrm();
  }, [isAuthenticated, loadCrm]);

  useEffect(() => {
    setDraft(selectedCustomer ? structuredClone(normalizeCustomer(selectedCustomer)) : null);
  }, [selectedCustomer]);

  useEffect(() => {
    const template = mailTemplates[activeMail];
    setMailSubject(template?.subject || "");
    setMailBody(mailBodyForEditor(template?.body || ""));
  }, [activeMail, mailTemplates, selectedId]);

  const login = async () => {
    setAuthError("");
    const res = await fetch("/api/admin-verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    if (!res.ok) return setAuthError("Falsches Passwort");
    sessionStorage.setItem("admin_auth", "true");
    sessionStorage.setItem("admin_pw", password);
    setAdminPassword(password);
    setIsAuthenticated(true);
  };

  const logout = () => {
    sessionStorage.removeItem("admin_auth");
    sessionStorage.removeItem("admin_pw");
    setIsAuthenticated(false);
    setAdminPassword("");
    setPassword("");
  };

  const selectCustomer = (id: string) => {
    setSelectedId(id);
    setSelectedInquiryId("");
    setView("customerDetail");
    setEditMode(false);
  };
  const selectInquiry = (id: string) => {
    setSelectedInquiryId(id);
    setSelectedId("");
    setView("inquiryDetail");
  };

  const persistCustomerDraft = async (updated: Customer) => {
    const normalized = normalizeCustomer({ ...updated, status: deriveStatus(updated.tasks) });
    setDraft(normalized);
    const data = await api("customer", { method: "PUT", body: JSON.stringify({ customer: normalized }) });
    const saved = normalizeCustomer(data.customer);
    setCustomers((prev) => prev.map((item) => (item.id === saved.id ? saved : item)));
    return saved;
  };

  const saveCustomer = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await persistCustomerDraft(draft);
      setMessage("Gespeichert");
      toast.success("Kunde gespeichert");
      setEditMode(false);
    } catch (error: any) {
      setMessage(error.message || "Speichern fehlgeschlagen");
      toast.error(error.message || "Speichern fehlgeschlagen");
    } finally {
      setSaving(false);
    }
  };

  const openConfirm = (action: ConfirmAction) => {
    const template = action.templateKey ? mailTemplates[action.templateKey] : null;
    setConfirmAction(action);
    setConfirmSendMail(Boolean(action.templateKey));
    setConfirmSubject(action.subject || template?.subject || "");
    setConfirmBody(mailBodyForEditor(action.body || template?.body || ""));
    setConfirmAttachmentUrl("");
    setConfirmAttachmentName("");
  };

  const sendActionMail = async (action: ConfirmAction) => {
    if (!confirmSendMail || !confirmSubject || !confirmBody) return;
    const payload = { templateKey: action.templateKey || "manual", subject: confirmSubject, body: confirmBody, attachmentUrl: confirmAttachmentUrl, attachmentName: confirmAttachmentName };
    if (action.target === "inquiry") {
      await api("send-inquiry-mail", { method: "POST", body: JSON.stringify({ ...payload, inquiryId: action.inquiryId }) });
      return;
    }
    if (draft) await api("send-mail", { method: "POST", body: JSON.stringify({ ...payload, customerId: draft.id }) });
  };

  const runConfirmAction = async () => {
    if (!confirmAction) return;
    setSaving(true);
    setMessage("");
    try {
      await sendActionMail(confirmAction);
      await confirmAction.onConfirm();
      setMessage("Aktion ausgeführt");
      toast.success(confirmSendMail ? "Aktion ausgeführt und Mail gesendet" : "Aktion ausgeführt");
      setConfirmAction(null);
    } catch (error: any) {
      setMessage(error.message || "Aktion fehlgeschlagen");
      toast.error(error.message || "Aktion fehlgeschlagen");
    } finally {
      setSaving(false);
    }
  };

  const createCustomer = async () => {
    try {
      const data = await api("customer", { method: "POST", body: JSON.stringify({ customer: emptyCustomer() }) });
      setCustomers((prev) => [normalizeCustomer(data.customer), ...prev]);
      selectCustomer(data.customer.id);
      toast.success("Kunde angelegt");
    } catch (error: any) {
      toast.error(error.message || "Kunde konnte nicht angelegt werden");
    }
  };

  const convertInquiry = async (inquiryId: string) => {
    const data = await api("convert-inquiry", { method: "POST", body: JSON.stringify({ inquiryId }) });
    await loadCrm();
    selectCustomer(data.customer.id);
  };

  const deleteInquiryAction = async (inquiryId: string) => {
    await api("delete-inquiry", { method: "POST", body: JSON.stringify({ id: inquiryId }) });
    await loadCrm();
    setSelectedInquiryId("");
  };

  const deleteCustomerAction = async (customerId: string) => {
    await api("delete-customer", { method: "POST", body: JSON.stringify({ id: customerId }) });
    setCustomers((prev) => prev.filter((customer) => customer.id !== customerId));
    setSelectedId("");
    setDraft(null);
    setView("customersList");
    toast.success("Kunde gelöscht");
  };

  const markInquiryAnswered = async (inquiryId: string) => {
    await api("inquiry-status", { method: "PUT", body: JSON.stringify({ id: inquiryId, status: "beantwortet" }) });
    await loadCrm();
  };

  const updateTask = (id: string, patch: Partial<TaskItem>) => {
    if (!draft) return;
    const tasks = draft.tasks.map((task) => (task.id === id ? { ...task, ...patch } : task));
    setDraft(normalizeCustomer({ ...draft, tasks, status: deriveStatus(tasks) }));
  };

  const requestTaskStatus = (task: TaskItem, status: TaskStatus) => {
    if (!draft) return;
    const tasks = draft.tasks.map((item) => (item.id === task.id ? { ...item, status } : item));
    const updated = normalizeCustomer({ ...draft, tasks, status: deriveStatus(tasks) });
    const affectsCustomerStatus = statusSteps.some((step) => task.id === `step-${step.key}`);
    openConfirm({
      title: "Aufgabenstatus ändern?",
      description: affectsCustomerStatus ? `"${task.title}" wird auf "${status}" gesetzt. Der Kundenstatus wird daraus automatisch abgeleitet.` : `"${task.title}" wird auf "${status}" gesetzt.`,
      templateKey: task.id === "step-vertrag" && status === "erledigt" ? "contract" : task.id === "step-galerie" && status === "erledigt" ? "gallery" : undefined,
      onConfirm: () => persistCustomerDraft(updated),
    });
  };

  const addTask = () => {
    setNewTaskTitle("");
    setNewTaskDueDate("");
    setNewTaskNote("");
    setNewTaskOpen(true);
  };

  const addWorkflowStep = () => {
    if (!draft) return;
    const tasks = [
      ...draft.tasks,
      {
        id: `step-custom-${Date.now()}`,
        title: "Neuer Schritt",
        status: "offen" as TaskStatus,
        dueDate: "",
        note: "",
      },
    ];
    setDraft(normalizeCustomer({ ...draft, tasks, status: deriveStatus(tasks) }));
  };

  const removeTask = (task: TaskItem) => {
    if (!draft) return;
    openConfirm({
      title: isWorkflowTask(task) ? "Schritt entfernen?" : "Aufgabe entfernen?",
      description: `"${task.title}" wird aus diesem Kunden entfernt. Speichere danach den Kunden, damit die Änderung übernommen wird.`,
      onConfirm: () => {
        const tasks = draft.tasks.filter((item) => item.id !== task.id);
        setDraft(normalizeCustomer({ ...draft, tasks, status: deriveStatus(tasks) }));
      },
    });
  };

  const createTaskFromModal = async () => {
    if (!draft || !newTaskTitle.trim()) return;
    setSaving(true);
    try {
      await persistCustomerDraft({
        ...draft,
        tasks: [
          ...draft.tasks,
          {
            id: `task-${Date.now()}`,
            title: newTaskTitle.trim(),
            status: "offen",
            dueDate: newTaskDueDate,
            note: newTaskNote,
          },
        ],
      });
      setNewTaskOpen(false);
      setMessage("Aufgabe angelegt");
      toast.success("Aufgabe angelegt");
    } catch (error: any) {
      setMessage(error.message || "Aufgabe konnte nicht angelegt werden");
      toast.error(error.message || "Aufgabe konnte nicht angelegt werden");
    } finally {
      setSaving(false);
    }
  };
  const openPaymentModal = () => {
    setNewPaymentTitle("Anzahlung");
    setNewPaymentAmount("");
    setNewPaymentDate(new Date().toISOString().slice(0, 10));
    setNewPaymentOpen(true);
  };

  const createPaymentFromModal = async () => {
    if (!draft || !newPaymentTitle.trim() || !newPaymentAmount.trim()) return;
    setSaving(true);
    try {
      await persistCustomerDraft({
        ...draft,
        payments: [...draft.payments, { id: `pay-${Date.now()}`, title: newPaymentTitle.trim(), amount: newPaymentAmount.trim(), paidAt: newPaymentDate, note: "" }],
      });
      setNewPaymentOpen(false);
      toast.success("Zahlung geloggt");
    } catch (error: any) {
      toast.error(error.message || "Zahlung konnte nicht geloggt werden");
    } finally {
      setSaving(false);
    }
  };
  const addCustomService = () => draft && setDraft({ ...draft, customServices: [...draft.customServices, { id: `custom-${Date.now()}`, name: "Neue Leistung", price: "", type: "custom" }] });
  const addPayment = () => draft && setDraft({ ...draft, payments: [...draft.payments, { id: `pay-${Date.now()}`, title: "Anzahlung", amount: "", paidAt: new Date().toISOString().slice(0, 10), note: "" }] });
  const removeService = (service: ServiceItem) => {
    if (!draft) return;
    openConfirm({
      title: "Leistung entfernen?",
      description: `"${service.name || "Diese Leistung"}" wird aus diesem Kunden entfernt. Speichere danach den Kunden, damit die Änderung übernommen wird.`,
      onConfirm: () => {
        if (service.type === "custom") {
          setDraft({ ...draft, customServices: draft.customServices.filter((item) => item.id !== service.id) });
          return;
        }
        setDraft({ ...draft, bookedServices: draft.bookedServices.filter((item) => item.id !== service.id) });
      },
    });
  };
  const removePayment = (payment: PaymentItem) => {
    if (!draft) return;
    openConfirm({
      title: "Zahlung entfernen?",
      description: `"${payment.title || "Diese Zahlung"}" wird aus diesem Kunden entfernt. Speichere danach den Kunden, damit die Änderung übernommen wird.`,
      onConfirm: () => setDraft({ ...draft, payments: draft.payments.filter((item) => item.id !== payment.id) }),
    });
  };
  const addCustomDocument = () => draft && setDraft({ ...draft, documents: [...draft.documents, { id: `doc-${Date.now()}`, kind: "custom", title: "Neues Dokument", url: "" }] });
  const updateDocument = (document: CustomerDocument) => {
    if (!draft) return;
    const documents = draft.documents.some((item) => item.id === document.id)
      ? draft.documents.map((item) => (item.id === document.id ? document : item))
      : [...draft.documents, document];
    setDraft({ ...draft, documents });
  };
  const uploadDocument = async (document: CustomerDocument, file: File) => {
    if (!draft) return;
    if (file.size > 100 * 1024 * 1024) {
      toast.error("Datei ist zu gross. Bitte nutze fuer sehr grosse Dateien einen Drive-Link.");
      return;
    }
    setSaving(true);
    const toastId = toast.loading("Dokument wird hochgeladen...");
    try {
      const session = await api("upload-document", {
        method: "POST",
        body: JSON.stringify({
          customerId: draft.id,
          documentId: document.id,
          kind: document.kind,
          title: document.title,
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
        }),
      });
      const chunkSize = 2 * 1024 * 1024;
      let fileId = "";
      for (let start = 0; start < file.size; start += chunkSize) {
        const end = Math.min(start + chunkSize, file.size);
        const contentBase64 = await readBlobAsBase64(file.slice(start, end));
        const chunk = await api("upload-document-chunk", {
          method: "POST",
          body: JSON.stringify({
            uploadUrl: session.uploadUrl,
            mimeType: file.type || "application/octet-stream",
            contentBase64,
            start,
            end,
            total: file.size,
          }),
        });
        if (chunk.done) fileId = chunk.fileId;
      }
      if (!fileId) throw new Error("Google Drive hat keine Datei-ID zurueckgegeben");
      const data = await api("finish-document-upload", {
        method: "POST",
        body: JSON.stringify({
          customerId: draft.id,
          documentId: document.id,
          kind: document.kind,
          title: document.title,
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          fileId,
        }),
      });
      const saved = normalizeCustomer(data.customer);
      setCustomers((prev) => prev.map((item) => (item.id === saved.id ? saved : item)));
      setDraft(saved);
      toast.success("Dokument hochgeladen", { id: toastId });
    } catch (error: any) {
      toast.error(error.message || "Dokument konnte nicht hochgeladen werden", { id: toastId });
    } finally {
      setSaving(false);
    }
  };
  const deleteDocument = (document: CustomerDocument) => {
    if (!draft) return;
    openConfirm({
      title: "Dokument löschen?",
      description: document.driveFileId ? "Das Dokument wird aus dem Kunden und aus Google Drive gelöscht." : "Das Dokument wird aus dem Kunden entfernt.",
      onConfirm: async () => {
      const data = await api("delete-document", { method: "POST", body: JSON.stringify({ customerId: draft.id, documentId: document.id }) });
      const saved = normalizeCustomer(data.customer);
      setCustomers((prev) => prev.map((item) => (item.id === saved.id ? saved : item)));
      setDraft(saved);
      toast.success("Dokument gelöscht");
      },
    });
  };
  const addLocation = () => draft && setDraft({ ...draft, locations: [...draft.locations, { id: `location-${Date.now()}`, title: "Weitere Location", address: "" }] });
  const addPortalMessage = () => draft && setDraft({ ...draft, portalMessages: [...draft.portalMessages, { id: `msg-${Date.now()}`, title: "Neue Nachricht", message: "", createdAt: new Date().toISOString(), visible: true }] });

  const sendMail = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await api("send-mail", { method: "POST", body: JSON.stringify({ customerId: draft.id, templateKey: activeMail, subject: mailSubject, body: mailBody }) });
      await loadCrm();
      setMessage("Mail gesendet");
      toast.success("Mail gesendet");
    } catch (error: any) {
      setMessage(error.message || "Mail konnte nicht gesendet werden");
      toast.error(error.message || "Mail konnte nicht gesendet werden");
    } finally {
      setSaving(false);
    }
  };

  const provisionPortal = async () => {
    if (!draft) return;
    const portalPassword = createPortalPassword(draft.eventDate);
    if (!portalPassword) {
      const text = "Für das Portal-Passwort braucht der Kunde ein Hochzeits-/Shootingdatum.";
      setMessage(text);
      toast.error(text);
      return;
    }
    setSaving(true);
    try {
      await persistCustomerDraft(draft);
      const data = await api("provision-portal", { method: "POST", body: JSON.stringify({ customerId: draft.id }) });
      const saved = normalizeCustomer(data.customer);
      setCustomers((prev) => prev.map((item) => (item.id === saved.id ? saved : item)));
      setDraft(saved);
      setMessage(`Portal bereitgestellt und Mail gesendet. Passwort: ${data.portalPassword}`);
      toast.success("Portal bereitgestellt und Mail gesendet");
    } catch (error: any) {
      setMessage(error.message || "Portal konnte nicht bereitgestellt werden");
      toast.error(error.message || "Portal konnte nicht bereitgestellt werden");
    } finally {
      setSaving(false);
    }
  };

  const saveReminderSettings = (value: string) => {
    const days = value.split(",").map((item) => Number(item.trim())).filter((item) => Number.isFinite(item) && item >= 0).sort((a, b) => b - a);
    const next = { days: days.length ? days : defaultReminderSettings.days };
    setReminderSettings(next);
    localStorage.setItem("mario_reminder_settings", JSON.stringify(next));
  };

  const syncImageKit = async () => {
    setSyncingImages(true);
    try {
      const res = await fetch("/api/sync-imagekit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "ImageKit Sync fehlgeschlagen");
      toast.success("ImageKit Sync abgeschlossen");
    } catch (error: any) {
      toast.error(error.message || "ImageKit Sync fehlgeschlagen");
    } finally {
      setSyncingImages(false);
    }
  };

  const markNotificationRead = (id: string) => {
    setReadNotificationIds((prev) => {
      const next = Array.from(new Set([...prev, id]));
      localStorage.setItem("mario_read_notifications", JSON.stringify(next));
      return next;
    });
    toast.success("Notification als gelesen markiert");
  };

  const markAllNotificationsRead = () => {
    setReadNotificationIds((prev) => {
      const next = Array.from(new Set([...prev, ...notifications.map((item) => item.id)]));
      localStorage.setItem("mario_read_notifications", JSON.stringify(next));
      return next;
    });
    toast.success("Alle Notifications als gelesen markiert");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#11100f] flex items-center justify-center px-4">
        <form onSubmit={(event) => { event.preventDefault(); login(); }} className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/5 mb-4"><Lock className="w-6 h-6 text-white/45" /></div>
            <h1 className="text-white text-lg tracking-wide">Mario Admin</h1>
          </div>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Passwort" className="w-full px-4 py-3 bg-white/6 border border-white/10 rounded-lg text-white placeholder-white/35 focus:outline-none focus:border-white/35" />
          {authError && <p className="text-red-300 text-sm text-center mt-3">{authError}</p>}
          <button className="w-full mt-4 py-3 bg-white text-black rounded-lg hover:bg-white/90 disabled:opacity-40" disabled={!password}>Anmelden</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f0eb] text-[#1f1b17]">
      <Toaster position="top-right" richColors closeButton />
      <header className="border-b border-black/10 bg-[#11100f] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 py-4 sm:py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-white/45 text-xs uppercase tracking-[0.25em]">Mario Schubert Photography</p>
            <h1 className="text-xl mt-1">Kundenverwaltung</h1>
          </div>
          <div className="w-full md:w-auto flex flex-wrap items-center gap-2">
            <button onClick={() => setView(view === "calendar" ? "customersList" : "calendar")} className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm text-white/80"><CalendarDays className="w-4 h-4" /> {view === "calendar" ? "Liste anzeigen" : "Kalender"}</button>
            <div className="relative">
              <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative inline-flex items-center justify-center rounded-md border border-white/15 w-10 h-10">
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && <span className="absolute -right-1 -top-1 min-w-5 h-5 rounded-full bg-red-600 text-white text-[11px] flex items-center justify-center">{notifications.length}</span>}
              </button>
              {notificationsOpen && (
                <>
                <button aria-label="Notifications schließen" onClick={() => setNotificationsOpen(false)} className="fixed inset-0 z-20 cursor-default bg-transparent" />
                <div className="fixed left-3 right-3 top-20 z-30 rounded-lg bg-white text-black shadow-xl border border-black/10 p-3 sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-[20rem]">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-sm">Notifications</p>
                    <div className="flex items-center gap-2">
                      {notifications.length > 0 && <button onClick={markAllNotificationsRead} className="text-xs text-black/45 hover:text-black">Alle gelesen</button>}
                      <button onClick={() => setSettingsOpen(true)} className="text-black/50 hover:text-black"><Settings className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-auto">
                    {notifications.map((item) => (
                      <div key={item.id} className="rounded-md bg-[#faf8f5] border border-black/8 p-3">
                        <button onClick={() => { selectCustomer(item.customerId); setNotificationsOpen(false); }} className="w-full text-left">
                        <p className="text-sm font-medium">{item.customerName}</p>
                        <p className="text-xs text-black/55 mt-1">{item.taskTitle} · in {item.daysLeft} Tag(en) fällig</p>
                        </button>
                        <button onClick={() => markNotificationRead(item.id)} className="mt-3 inline-flex items-center gap-1 rounded-md border border-black/10 bg-white px-2 py-1 text-xs text-black/55 hover:text-black">
                          <Check className="w-3 h-3" /> Gelesen
                        </button>
                      </div>
                    ))}
                    {notifications.length === 0 && <p className="text-sm text-black/45">Keine fälligen Reminder.</p>}
                  </div>
                </div>
                </>
              )}
            </div>
            <button onClick={() => setSettingsOpen(true)} className="inline-flex items-center justify-center rounded-md border border-white/15 w-10 h-10 text-white/80" title="Globale Settings"><Settings className="w-4 h-4" /></button>
            <button onClick={createCustomer} className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-md bg-white text-black px-3 py-2 text-sm"><Plus className="w-4 h-4" /> Kunde</button>
            <button onClick={logout} className="inline-flex items-center justify-center gap-2 text-white/55 hover:text-white text-sm px-2 py-2"><LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Abmelden</span></button>
          </div>
        </div>
      </header>

      {settingsOpen && (
        <Modal title="Globale Settings" onClose={() => setSettingsOpen(false)}>
          <div className="space-y-6">
            <section>
              <h3 className="font-semibold mb-3">Notifications</h3>
              <label className="block">
                <span className="text-xs uppercase tracking-[0.16em] text-black/45">Reminder-Tage vor Deadline</span>
                <input defaultValue={reminderSettings.days.join(", ")} onBlur={(event) => saveReminderSettings(event.target.value)} className="mt-2 w-full rounded-md border border-black/10 px-3 py-2 text-sm" />
              </label>
              <p className="text-xs text-black/45 mt-2">Kommagetrennt, z.B. 14, 7, 3, 1.</p>
            </section>
            <section className="rounded-lg border border-black/8 bg-[#faf8f5] p-4">
              <h3 className="font-semibold mb-2">Website-Bilder</h3>
              <p className="text-sm text-black/55 mb-4">Synchronisiert neue ImageKit-Bilder mit den Website-Galerien.</p>
              <button onClick={syncImageKit} disabled={syncingImages} className="inline-flex items-center gap-2 rounded-md bg-[#11100f] text-white px-4 py-2 text-sm disabled:opacity-50">
                {syncingImages ? "Synchronisiere..." : "ImageKit Sync starten"}
              </button>
            </section>
            <section>
              <h3 className="font-semibold mb-2">Sinnvolle nächste globale Settings</h3>
              <p className="text-sm text-black/55 leading-relaxed">Als Nächstes wären Standard-Mailtexte, Standard-Aufgaben je neuer Kunde und ein Standard-Zahlungsplan sinnvoll. Die technische Grundlage ist jetzt da.</p>
            </section>
          </div>
        </Modal>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-5 py-5 sm:py-6 grid grid-cols-1 lg:grid-cols-[310px_minmax(0,1fr)] gap-5 sm:gap-6">
        <aside className="space-y-5">
          <section className="bg-white border border-black/8 rounded-lg p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-sm font-semibold flex items-center gap-2"><Mail className="w-4 h-4" /> Neue Anfragen</h2>
              <button onClick={() => setView("inquiriesList")} className="text-xs text-black/45 hover:text-black">Alle ansehen</button>
            </div>
            <div className="space-y-2 max-h-72 overflow-auto">
              {inquiries.filter((item) => item.status !== "umgewandelt").map((inquiry) => (
                <article key={inquiry.id} onClick={() => selectInquiry(inquiry.id)} className={`rounded-md border p-3 cursor-pointer ${inquiry.id === selectedInquiryId ? "bg-[#11100f] text-white border-[#11100f]" : "bg-[#faf8f5] border-black/8"}`}>
                  <div className="flex justify-between gap-2"><p className="font-medium text-sm">{inquiry.name}</p><span className="text-[11px] opacity-60">{inquiry.status}</span></div>
                  <p className="text-xs mt-1 opacity-65">{inquiry.category || "Anfrage"} {inquiry.eventDate ? `· ${inquiry.eventDate}` : ""}</p>
                  <button className="mt-3 inline-flex items-center gap-1 text-xs opacity-70">öffnen <ArrowRight className="w-3 h-3" /></button>
                </article>
              ))}
              {inquiries.filter((item) => item.status !== "umgewandelt").length === 0 && <p className="text-sm text-black/45">Keine offenen Anfragen.</p>}
            </div>
          </section>

          <section className="bg-white border border-black/8 rounded-lg p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-sm font-semibold flex items-center gap-2"><UserRound className="w-4 h-4" /> Kunden</h2>
              <button onClick={() => setView("customersList")} className="text-xs text-black/45 hover:text-black">Alle ansehen</button>
            </div>
            <div className="space-y-1.5 max-h-[42rem] overflow-auto">
              {customers.map((customer) => (
                <button key={customer.id} onClick={() => selectCustomer(customer.id)} className={`relative w-full text-left rounded-md px-3 py-2 border transition ${customer.id === selectedId ? "bg-[#11100f] text-white border-[#11100f]" : "bg-[#faf8f5] border-black/8 hover:border-black/20"}`}>
                  <p className="text-sm font-medium pr-8">{customer.name || "Unbenannter Kunde"}</p>
                  <p className={`text-xs mt-0.5 ${customer.id === selectedId ? "text-white/50" : "text-black/45"}`}>{customer.category || "Kategorie"} {customer.eventDate ? `· ${customer.eventDate}` : ""}</p>
                  {notificationsByCustomer[customer.id] > 0 && <span className="absolute right-2 top-2 min-w-5 h-5 rounded-full bg-red-600 text-white text-[11px] flex items-center justify-center">{notificationsByCustomer[customer.id]}</span>}
                </button>
              ))}
            </div>
          </section>
        </aside>

        <section className="bg-white border border-black/8 rounded-lg p-4 sm:p-5 md:p-6 min-h-[40rem] min-w-0">
          {message && <p className="rounded-md bg-[#f4f0eb] px-3 py-2 text-sm text-black/65 mb-5">{message}</p>}
          {loading && <p className="text-black/45">Lade CRM...</p>}
          {!loading && view === "calendar" && <CalendarView month={calendarMonth} setMonth={setCalendarMonth} events={calendarEvents} onEvent={setCalendarEvent} />}
          {!loading && view === "customersList" && <CustomersListView customers={customers} notificationsByCustomer={notificationsByCustomer} onSelect={selectCustomer} />}
          {!loading && view === "inquiriesList" && <InquiriesListView inquiries={inquiries} onSelect={selectInquiry} />}
          {!loading && view === "inquiryDetail" && selectedInquiry && (
            <InquiryDetail
              inquiry={selectedInquiry}
              onReply={() => openConfirm({ title: "Anfrage beantworten?", description: "Die Anfrage wird als beantwortet markiert. Optional wird direkt eine Mail verschickt.", templateKey: "reply", target: "inquiry", inquiryId: selectedInquiry.id, onConfirm: () => markInquiryAnswered(selectedInquiry.id) })}
              onDelete={() => openConfirm({ title: "Anfrage ablehnen oder löschen?", description: "Die Anfrage wird entfernt. Optional kann vorher eine kurze Absage-Mail gesendet werden.", templateKey: "reply", target: "inquiry", inquiryId: selectedInquiry.id, subject: "Danke für eure Anfrage", body: "Servus ihr Lieben,\n\nvielen Dank für eure Anfrage. Leider passt es diesmal nicht oder der Termin ist bereits vergeben.\n\nIch wünsche euch alles Gute.", onConfirm: () => deleteInquiryAction(selectedInquiry.id) })}
              onConvert={() => openConfirm({ title: "In Kunden umwandeln?", description: "Relevante Kontaktdaten, Leistungen, Nachrichten und Locations werden übernommen.", templateKey: "portal", target: "inquiry", inquiryId: selectedInquiry.id, onConfirm: () => convertInquiry(selectedInquiry.id) })}
            />
          )}
          {!loading && (view === "customerDetail" || view === "inquiryDetail") && !draft && !selectedInquiry && <p className="text-black/45">Wähle eine Anfrage, einen Kunden oder lege einen neuen Kunden an.</p>}
          {!loading && view === "customerDetail" && draft && (
            <CustomerDetail
              draft={draft}
              workflow={workflow}
              editMode={editMode}
              setEditMode={setEditMode}
              saving={saving}
              mailTemplates={mailTemplates}
              activeMail={activeMail}
              mailSubject={mailSubject}
              mailBody={mailBody}
              setDraft={setDraft}
              setActiveMail={setActiveMail}
              setMailSubject={setMailSubject}
              setMailBody={setMailBody}
              saveCustomer={saveCustomer}
              updateTask={updateTask}
              requestTaskStatus={requestTaskStatus}
              addWorkflowStep={addWorkflowStep}
              addTask={addTask}
              openPaymentModal={openPaymentModal}
              deleteCustomer={(customerId) => openConfirm({ title: "Kunde wirklich löschen?", description: "Der Kunde wird vollständig aus der Datenbank gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.", onConfirm: () => deleteCustomerAction(customerId) })}
              removeTask={removeTask}
              addLocation={addLocation}
              addCustomService={addCustomService}
              removeService={removeService}
              addPayment={addPayment}
              removePayment={removePayment}
              addCustomDocument={addCustomDocument}
              updateDocument={updateDocument}
              uploadDocument={uploadDocument}
              deleteDocument={deleteDocument}
              addPortalMessage={addPortalMessage}
              sendMail={sendMail}
              provisionPortal={provisionPortal}
            />
          )}
        </section>
      </main>

      {newTaskOpen && (
        <Modal title="Neue Aufgabe" onClose={() => setNewTaskOpen(false)}>
          <div className="space-y-3">
            <label className="block">
              <span className="text-xs uppercase tracking-[0.16em] text-black/45">Titel</span>
              <input value={newTaskTitle} onChange={(event) => setNewTaskTitle(event.target.value)} className="mt-2 w-full rounded-md border border-black/10 px-3 py-2 text-sm" autoFocus />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.16em] text-black/45">Deadline</span>
              <input type="date" value={newTaskDueDate} onChange={(event) => setNewTaskDueDate(event.target.value)} className="mt-2 w-full rounded-md border border-black/10 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.16em] text-black/45">Notiz</span>
              <textarea value={newTaskNote} onChange={(event) => setNewTaskNote(event.target.value)} className="mt-2 w-full min-h-20 rounded-md border border-black/10 px-3 py-2 text-sm" />
            </label>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => setNewTaskOpen(false)} className="rounded-md border border-black/10 px-4 py-2 text-sm">Abbrechen</button>
            <button onClick={createTaskFromModal} disabled={saving || !newTaskTitle.trim()} className="rounded-md bg-[#11100f] text-white px-4 py-2 text-sm disabled:opacity-50">Anlegen</button>
          </div>
        </Modal>
      )}

      {newPaymentOpen && (
        <Modal title="Zahlung loggen" onClose={() => setNewPaymentOpen(false)}>
          <div className="space-y-3">
            <Field label="Wofür?" value={newPaymentTitle} onChange={setNewPaymentTitle} placeholder="z.B. Anzahlung" />
            <Field label="Betrag" value={newPaymentAmount} onChange={setNewPaymentAmount} placeholder="z.B. 500" />
            <Field label="Bezahlt am" type="date" value={newPaymentDate} onChange={setNewPaymentDate} />
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => setNewPaymentOpen(false)} className="rounded-md border border-black/10 px-4 py-2 text-sm">Abbrechen</button>
            <button onClick={createPaymentFromModal} disabled={saving || !newPaymentTitle.trim() || !newPaymentAmount.trim()} className="rounded-md bg-[#11100f] text-white px-4 py-2 text-sm disabled:opacity-50">Loggen</button>
          </div>
        </Modal>
      )}

      {calendarEvent && (
        <Modal title={calendarEvent.title} onClose={() => setCalendarEvent(null)}>
          <p className="font-medium">{calendarEvent.customerName}</p>
          <p className="text-sm text-black/55 mt-2">{calendarEvent.date} · {calendarEvent.time}</p>
          {calendarEvent.location && <p className="text-sm text-black/55 mt-1">{calendarEvent.location}</p>}
          <button onClick={() => { selectCustomer(calendarEvent.customerId); setCalendarEvent(null); }} className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#11100f] text-white px-4 py-2 text-sm">Kunden ansehen <ArrowRight className="w-4 h-4" /></button>
        </Modal>
      )}

      {confirmAction && (
        <Modal title={confirmAction.title} onClose={() => setConfirmAction(null)} wide>
          <p className="text-sm text-black/55 mb-4">{confirmAction.description}</p>
          <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={confirmSendMail} onChange={(event) => setConfirmSendMail(event.target.checked)} /> Mail mitsenden</label>
          {confirmSendMail && (
            <div className="space-y-3 mt-4">
              <input value={confirmSubject} onChange={(event) => setConfirmSubject(event.target.value)} className="w-full rounded-md border border-black/10 px-3 py-2 text-sm" placeholder="Betreff" />
              <textarea value={confirmBody} onChange={(event) => setConfirmBody(event.target.value)} className="w-full min-h-40 rounded-md border border-black/10 px-3 py-2 text-sm font-mono" placeholder="Mailtext" />
              <div className="grid md:grid-cols-2 gap-3">
                <input value={confirmAttachmentUrl} onChange={(event) => setConfirmAttachmentUrl(event.target.value)} className="rounded-md border border-black/10 px-3 py-2 text-sm" placeholder="Anhang URL oder PDF-Link" />
                <input value={confirmAttachmentName} onChange={(event) => setConfirmAttachmentName(event.target.value)} className="rounded-md border border-black/10 px-3 py-2 text-sm" placeholder="Dateiname, z.B. Vertrag.pdf" />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => setConfirmAction(null)} className="rounded-md border border-black/10 px-4 py-2 text-sm">Abbrechen</button>
            <button onClick={runConfirmAction} disabled={saving} className="rounded-md bg-[#11100f] text-white px-4 py-2 text-sm disabled:opacity-50">{saving ? "Führe aus..." : "Bestätigen"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function CustomersListView({ customers, notificationsByCustomer, onSelect }: { customers: Customer[]; notificationsByCustomer: Record<string, number>; onSelect: (id: string) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-black/40">Übersicht</p>
        <h2 className="mt-1 text-2xl">Alle Kunden</h2>
      </div>
      <div className="grid gap-3 md:hidden">
        {customers.map((customer) => (
          <button key={customer.id} onClick={() => onSelect(customer.id)} className="relative text-left rounded-lg border border-black/8 bg-[#faf8f5] p-4">
            {notificationsByCustomer[customer.id] > 0 && <span className="absolute right-3 top-3 inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] text-white">{notificationsByCustomer[customer.id]}</span>}
            <p className="font-medium pr-8">{customer.name || "Unbenannter Kunde"}</p>
            <p className="text-xs text-black/45 mt-1">{formatDateDe(customer.eventDate) || "Datum offen"}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-white border border-black/8 px-2 py-1">{statusSteps.find((item) => item.key === customer.status)?.label || customer.status}</span>
              <span className="rounded-full bg-white border border-black/8 px-2 py-1">{customer.portalEnabled ? "Portal aktiv" : "Portal nicht aktiv"}</span>
            </div>
            <p className="mt-3 text-sm text-black/55">{[customer.email, customer.secondaryEmail].filter(Boolean).join(" / ") || "Keine E-Mail"}</p>
            {[customer.phone, customer.secondaryPhone].filter(Boolean).map((phone) => <p key={phone} className="mt-1 text-sm text-black/55">{phone}</p>)}
          </button>
        ))}
        {customers.length === 0 && <p className="rounded-lg border border-black/8 bg-[#faf8f5] p-4 text-sm text-black/45">Noch keine Kunden angelegt.</p>}
      </div>
      <div className="hidden md:block overflow-x-auto rounded-lg border border-black/8">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-[#faf8f5] text-left text-xs uppercase tracking-[0.14em] text-black/40">
            <tr>
              <th className="px-4 py-3 font-medium">Kunde</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Datum</th>
              <th className="px-4 py-3 font-medium">Kontakt</th>
              <th className="px-4 py-3 font-medium">Portal</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/8">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-[#faf8f5]">
                <td className="px-4 py-3">
                  <p className="font-medium">{customer.name || "Unbenannter Kunde"}</p>
                  <p className="text-xs text-black/45">{customer.category || "Kategorie offen"}</p>
                </td>
                <td className="px-4 py-3">{statusSteps.find((item) => item.key === customer.status)?.label || customer.status}</td>
                <td className="px-4 py-3">{customer.eventDate || "Noch offen"}</td>
                <td className="px-4 py-3">
                  <p>{customer.email || "Keine E-Mail"}</p>
                  {customer.secondaryEmail && <p className="text-xs text-black/45">{customer.secondaryEmail}</p>}
                  <p className="text-xs text-black/45">{[customer.phone, customer.secondaryPhone].filter(Boolean).join(" / ") || "Keine Telefonnummer"}</p>
                </td>
                <td className="px-4 py-3">{customer.portalEnabled ? "aktiv" : "nicht aktiv"}</td>
                <td className="px-4 py-3 text-right">
                  {notificationsByCustomer[customer.id] > 0 && <span className="mr-2 inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] text-white">{notificationsByCustomer[customer.id]}</span>}
                  <button onClick={() => onSelect(customer.id)} className="rounded-md bg-[#11100f] px-3 py-2 text-xs text-white">Öffnen</button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-black/45">Noch keine Kunden angelegt.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InquiriesListView({ inquiries, onSelect }: { inquiries: Inquiry[]; onSelect: (id: string) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-black/40">Übersicht</p>
        <h2 className="mt-1 text-2xl">Alle Anfragen</h2>
      </div>
      <div className="overflow-x-auto rounded-lg border border-black/8">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-[#faf8f5] text-left text-xs uppercase tracking-[0.14em] text-black/40">
            <tr>
              <th className="px-4 py-3 font-medium">Anfrage</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Datum</th>
              <th className="px-4 py-3 font-medium">Kontakt</th>
              <th className="px-4 py-3 font-medium">Gefunden über</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/8">
            {inquiries.map((inquiry) => (
              <tr key={inquiry.id} className="hover:bg-[#faf8f5]">
                <td className="px-4 py-3">
                  <p className="font-medium">{inquiry.name || "Unbenannte Anfrage"}</p>
                  <p className="text-xs text-black/45">{inquiry.category || "Kategorie offen"}</p>
                </td>
                <td className="px-4 py-3">{inquiry.status}</td>
                <td className="px-4 py-3">{inquiry.eventDate || "Noch offen"}</td>
                <td className="px-4 py-3">
                  <p>{inquiry.email || "Keine E-Mail"}</p>
                  <p className="text-xs text-black/45">{inquiry.phone || "Keine Telefonnummer"}</p>
                </td>
                <td className="px-4 py-3">{inquiry.foundVia || "-"}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => onSelect(inquiry.id)} className="rounded-md bg-[#11100f] px-3 py-2 text-xs text-white">Öffnen</button></td>
              </tr>
            ))}
            {inquiries.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-black/45">Keine Anfragen vorhanden.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CalendarView({ month, setMonth, events, onEvent }: { month: Date; setMonth: (date: Date) => void; events: CalendarEvent[]; onEvent: (event: CalendarEvent) => void }) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const first = new Date(year, monthIndex, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells = Array.from({ length: startOffset + daysInMonth }, (_, index) => (index < startOffset ? null : index - startOffset + 1));
  const byDate = events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    acc[event.date] = [...(acc[event.date] || []), event];
    return acc;
  }, {});
  const monthEvents = events
    .filter((event) => {
      const date = new Date(`${event.date}T00:00:00`);
      return date.getFullYear() === year && date.getMonth() === monthIndex;
    })
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-5">
        <button onClick={() => setMonth(new Date(year, monthIndex - 1, 1))} className="rounded-md border border-black/10 p-2"><ChevronLeft className="w-4 h-4" /></button>
        <h2 className="text-lg sm:text-xl font-medium text-center">{monthNames[monthIndex]} {year}</h2>
        <button onClick={() => setMonth(new Date(year, monthIndex + 1, 1))} className="rounded-md border border-black/10 p-2"><ChevronRight className="w-4 h-4" /></button>
      </div>
      <div className="sm:hidden space-y-2">
        {monthEvents.map((event) => (
          <button key={event.id} onClick={() => onEvent(event)} className={`w-full text-left rounded-md border p-3 ${event.type === "shooting" ? "bg-[#11100f] text-white border-[#11100f]" : "bg-[#faf8f5] border-black/8 text-black"}`}>
            <p className="font-medium">{event.customerName}</p>
            <p className="text-xs opacity-70 mt-1">{event.date} · {event.time} · {event.title}</p>
          </button>
        ))}
        {monthEvents.length === 0 && <p className="rounded-md border border-black/8 bg-[#faf8f5] p-4 text-sm text-black/45">Keine Termine in diesem Monat.</p>}
      </div>
      <div className="hidden sm:grid grid-cols-7 gap-2 text-xs text-black/45 mb-2">{["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => <div key={day}>{day}</div>)}</div>
      <div className="hidden sm:grid grid-cols-7 gap-2">
        {cells.map((day, index) => {
          const date = day ? `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : "";
          return (
            <div key={index} className="min-h-28 rounded-md border border-black/8 bg-[#faf8f5] p-2">
              {day && <p className="text-xs text-black/45 mb-2">{day}</p>}
              <div className="space-y-1">
                {(byDate[date] || []).map((event) => (
                  <button key={event.id} onClick={() => onEvent(event)} className={`w-full text-left rounded px-2 py-1 text-[11px] ${event.type === "shooting" ? "bg-[#11100f] text-white" : "bg-white border border-black/10 text-black"}`}>
                    <span className="block font-medium truncate">{event.customerName}</span>
                    <span className="block opacity-70">{event.time}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CustomerDetail(props: {
  draft: Customer;
  workflow: WorkflowItem[];
  editMode: boolean;
  setEditMode: (value: boolean) => void;
  saving: boolean;
  mailTemplates: Record<string, MailTemplate>;
  activeMail: string;
  mailSubject: string;
  mailBody: string;
  setDraft: (customer: Customer) => void;
  setActiveMail: (key: string) => void;
  setMailSubject: (value: string) => void;
  setMailBody: (value: string) => void;
  saveCustomer: () => void;
  updateTask: (id: string, patch: Partial<TaskItem>) => void;
  requestTaskStatus: (task: TaskItem, status: TaskStatus) => void;
  addWorkflowStep: () => void;
  addTask: () => void;
  openPaymentModal: () => void;
  deleteCustomer: (customerId: string) => void;
  removeTask: (task: TaskItem) => void;
  addLocation: () => void;
  addCustomService: () => void;
  removeService: (service: ServiceItem) => void;
  addPayment: () => void;
  removePayment: (payment: PaymentItem) => void;
  addCustomDocument: () => void;
  updateDocument: (document: CustomerDocument) => void;
  uploadDocument: (document: CustomerDocument, file: File) => void;
  deleteDocument: (document: CustomerDocument) => void;
  addPortalMessage: () => void;
  sendMail: () => void;
  provisionPortal: () => void;
}) {
  const { draft, setDraft } = props;
  const workflowTasksOnly = draft.tasks.filter(isWorkflowTask);
  const otherTasks = draft.tasks.filter((task) => !isWorkflowTask(task));

  if (!props.editMode) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-black/40">Kundenansicht</p>
            <h2 className="mt-1 text-2xl leading-tight">{draft.name || "Unbenannter Kunde"}</h2>
            <p className="text-sm text-black/45 mt-2">Status: {statusSteps.find((item) => item.key === draft.status)?.label || draft.status}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`/kundenportal/${draft.portalToken}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-md border border-black/10 px-4 py-2 text-sm">
              Portal öffnen <ExternalLink className="w-4 h-4" />
            </a>
            <button onClick={props.openPaymentModal} className="inline-flex items-center justify-center gap-2 rounded-md border border-black/10 px-4 py-2 text-sm">
              <Plus className="w-4 h-4" /> Zahlung loggen
            </button>
            <button onClick={() => downloadCustomerContact(draft)} className="inline-flex items-center justify-center gap-2 rounded-md border border-black/10 px-4 py-2 text-sm">
              <Download className="w-4 h-4" /> Kontakt
            </button>
            <button onClick={() => props.setEditMode(true)} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#11100f] text-white px-4 py-2 text-sm">
              <Pencil className="w-4 h-4" /> Bearbeiten
            </button>
            <button onClick={() => props.deleteCustomer(draft.id)} className="inline-flex items-center justify-center gap-2 rounded-md border border-red-200 text-red-700 px-4 py-2 text-sm">
              <Trash2 className="w-4 h-4" /> Löschen
            </button>
          </div>
        </div>

        <section className="rounded-lg border border-black/8 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 className="font-semibold flex items-center gap-2"><ListChecks className="w-4 h-4" /> Status & Aufgaben</h3>
            <button onClick={props.addTask} className="inline-flex items-center justify-center gap-2 rounded-md border border-black/10 px-3 py-2 text-sm">
              <Plus className="w-4 h-4" /> Aufgabe
            </button>
          </div>
          <TaskBoard tasks={workflowTasksOnly} requestTaskStatus={props.requestTaskStatus} />
        </section>

        {otherTasks.length > 0 && (
          <section className="rounded-lg border border-black/8 p-3 sm:p-4">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="font-semibold">Zusätzliche Aufgaben</h3>
              <button onClick={props.addTask} className="text-xs inline-flex items-center gap-1 text-black/55 hover:text-black"><Plus className="w-3 h-3" /> Aufgabe</button>
            </div>
            <TaskBoard tasks={otherTasks} requestTaskStatus={props.requestTaskStatus} />
          </section>
        )}

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          <ViewField label="E-Mail" value={draft.email} />
          <ViewField label="E-Mail 2" value={draft.secondaryEmail} />
          <ViewField label="Telefon" value={draft.phone} />
          <ViewField label="Telefon 2" value={draft.secondaryPhone} />
          <ViewField label="Braut" value={draft.brideName} />
          <ViewField label="Bräutigam" value={draft.groomName} />
          <ViewField label="Kategorie" value={draft.category} />
          <ViewField label="Hochzeit/Shooting" value={[draft.eventDate, [draft.eventTime, draft.eventEndTime].filter(Boolean).join(" - ")].filter(Boolean).join(" · ")} />
          <ViewField label="Dauer der Begleitung" value={draft.coverageDuration} />
          <ViewField label="Anzahl Gäste" value={draft.guestCount} />
          <ViewField label="Vorgespräch" value={draft.consultationDate} />
          <div className="rounded-lg border border-black/8 bg-[#faf8f5] p-3 min-w-0">
            <p className="text-[11px] uppercase tracking-[0.16em] text-black/40">Kundenadresse</p>
            <p className="mt-2 text-sm leading-relaxed text-black/75 whitespace-pre-wrap break-words">{draft.customerAddress || "Noch nicht erfasst"}</p>
            <MapLink value={draft.customerAddress} />
          </div>
          <div className="rounded-lg border border-black/8 bg-[#faf8f5] p-3 min-w-0">
            <p className="text-[11px] uppercase tracking-[0.16em] text-black/40">Location</p>
            <p className="mt-2 text-sm leading-relaxed text-black/75 whitespace-pre-wrap break-words">{draft.location || draft.locationAddress || "Noch nicht erfasst"}</p>
            <MapLink value={draft.locationAddress || draft.location} />
          </div>
        </div>

        {[...draft.bookedServices, ...draft.customServices].length > 0 && (
          <section className="rounded-lg border border-black/8 p-3 sm:p-4">
            <h3 className="font-semibold mb-3">Leistungen</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {[...draft.bookedServices, ...draft.customServices].map((service) => (
                <div key={service.id} className="flex items-center justify-between gap-3 rounded-md bg-[#faf8f5] border border-black/8 px-3 py-2 text-sm">
                  <span>{service.name}</span>
                  <span className="text-black/55">{formatMoney(service.price) || "kein Preis"}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-lg border border-black/8 p-3 sm:p-4">
          <h3 className="font-semibold mb-3">Zahlungen</h3>
          <PaymentSummary customer={draft} />
        </section>

        <DocumentSection
          draft={draft}
          setDraft={setDraft}
          addCustomDocument={props.addCustomDocument}
          updateDocument={props.updateDocument}
          uploadDocument={props.uploadDocument}
          deleteDocument={props.deleteDocument}
          readOnly
        />

        {draft.locations.length > 0 && (
          <section className="rounded-lg border border-black/8 p-3 sm:p-4">
            <h3 className="font-semibold flex items-center gap-2 mb-3"><MapPin className="w-4 h-4" /> Weitere Locations</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {draft.locations.map((location) => (
                <div key={location.id} className="rounded-lg border border-black/8 bg-[#faf8f5] p-3 min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-black/40">{location.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-black/75 whitespace-pre-wrap break-words">{location.address || "Noch nicht erfasst"}</p>
                  <MapLink value={location.address || location.title} />
                </div>
              ))}
            </div>
          </section>
        )}

        <PortalControls draft={draft} setDraft={setDraft} addPortalMessage={props.addPortalMessage} provisionPortal={props.provisionPortal} readOnly />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-black/40">Kundendetail</p>
          <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="mt-1 text-2xl bg-transparent border-b border-transparent focus:border-black/20 outline-none" placeholder="Name" />
          <p className="text-sm text-black/45 mt-2">Status: {statusSteps.find((item) => item.key === draft.status)?.label || draft.status}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={() => downloadCustomerContact(draft)} className="inline-flex items-center justify-center gap-2 rounded-md border border-black/10 px-4 py-2 text-sm"><Download className="w-4 h-4" /> Kontakt</button>
          <button onClick={() => props.setEditMode(false)} className="inline-flex items-center justify-center gap-2 rounded-md border border-black/10 px-4 py-2 text-sm">Ansicht</button>
          <button onClick={props.saveCustomer} disabled={props.saving} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#11100f] text-white px-4 py-2 text-sm disabled:opacity-50"><Save className="w-4 h-4" /> {props.saving ? "Speichere..." : "Speichern"}</button>
          <button onClick={() => props.deleteCustomer(draft.id)} className="inline-flex items-center justify-center gap-2 rounded-md border border-red-200 text-red-700 px-4 py-2 text-sm"><Trash2 className="w-4 h-4" /> Löschen</button>
        </div>
      </div>

      <section className="rounded-lg border border-black/8 p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="font-semibold flex items-center gap-2"><ListChecks className="w-4 h-4" /> Schritte & Status</h3>
          <div className="flex items-center gap-3">
            <PortalToggle draft={draft} setDraft={setDraft} field="status" />
            <button onClick={props.addWorkflowStep} className="text-xs inline-flex items-center gap-1 text-black/55 hover:text-black"><Plus className="w-3 h-3" /> Schritt</button>
          </div>
        </div>
        <TaskList tasks={workflowTasksOnly} updateTask={props.updateTask} requestTaskStatus={props.requestTaskStatus} removeTask={props.removeTask} compact />
      </section>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="E-Mail" value={draft.email} onChange={(value) => setDraft({ ...draft, email: value })} />
        <Field label="E-Mail 2" value={draft.secondaryEmail} onChange={(value) => setDraft({ ...draft, secondaryEmail: value })} />
        <Field label="Telefon" value={draft.phone} onChange={(value) => setDraft({ ...draft, phone: value })} />
        <Field label="Telefon 2" value={draft.secondaryPhone} onChange={(value) => setDraft({ ...draft, secondaryPhone: value })} />
        <Field label="Name Braut" value={draft.brideName} onChange={(value) => setDraft({ ...draft, brideName: value })} />
        <Field label="Name Bräutigam" value={draft.groomName} onChange={(value) => setDraft({ ...draft, groomName: value })} />
        <Field label="Kategorie" value={draft.category} onChange={(value) => setDraft({ ...draft, category: value })} />
        <Field label="Hochzeit/Shooting" type="date" value={draft.eventDate} onChange={(value) => setDraft({ ...draft, eventDate: value })} />
        <Field label="Von" type="time" value={draft.eventTime} onChange={(value) => setDraft({ ...draft, eventTime: value })} />
        <Field label="Bis" type="time" value={draft.eventEndTime} onChange={(value) => setDraft({ ...draft, eventEndTime: value })} />
        <Field label="Dauer der Begleitung" value={draft.coverageDuration} onChange={(value) => setDraft({ ...draft, coverageDuration: value })} placeholder="z.B. 8 Stunden" />
        <Field label="Anzahl Gäste" value={draft.guestCount} onChange={(value) => setDraft({ ...draft, guestCount: value })} placeholder="z.B. 80" />
        <Field label="Vorgespräch" value={draft.consultationDate} onChange={(value) => setDraft({ ...draft, consultationDate: value })} placeholder="22. Mai 2026, 18:30 Uhr · Google Meet" />
        <Field label="Kundenadresse" value={draft.customerAddress} onChange={(value) => setDraft({ ...draft, customerAddress: value })} />
        <Field label="Location-Adresse" value={draft.locationAddress} onChange={(value) => setDraft({ ...draft, locationAddress: value })} />
        <Field label="Location-Name" value={draft.location} onChange={(value) => setDraft({ ...draft, location: value })} placeholder="z.B. Schloss Elmau" />
        <Field label="Angebotslink" value={draft.offerUrl} onChange={(value) => setDraft({ ...draft, offerUrl: value })} />
        <Field label="Vertrag-Link" value={draft.contractUrl} onChange={(value) => setDraft({ ...draft, contractUrl: value })} />
        <Field label="Rechnungslink" value={draft.invoiceUrl} onChange={(value) => setDraft({ ...draft, invoiceUrl: value })} />
        <Field label="Galerie-Link" value={draft.galleryUrl} onChange={(value) => setDraft({ ...draft, galleryUrl: value })} />
        <Field label="Anzahlung fällig bis" type="date" value={draft.depositDueDate} onChange={(value) => setDraft({ ...draft, depositDueDate: value })} />
        <Field label="Gesamtbetrag fällig bis" type="date" value={draft.finalPaymentDueDate} onChange={(value) => setDraft({ ...draft, finalPaymentDueDate: value })} />
      </div>

      <section className="rounded-lg border border-black/8 p-4">
        <div className="flex items-center justify-between mb-3"><h3 className="font-semibold flex items-center gap-2"><MapPin className="w-4 h-4" /> Weitere Locations</h3><div className="flex items-center gap-3"><PortalToggle draft={draft} setDraft={setDraft} field="locations" /><button onClick={props.addLocation} className="text-xs inline-flex items-center gap-1 text-black/55 hover:text-black"><Plus className="w-3 h-3" /> Location</button></div></div>
        <div className="space-y-2">
          {draft.locations.map((location) => (
            <div key={location.id} className="grid md:grid-cols-[180px_1fr] gap-2">
              <input value={location.title} onChange={(event) => setDraft({ ...draft, locations: draft.locations.map((item) => (item.id === location.id ? { ...item, title: event.target.value } : item)) })} className="rounded-md border border-black/10 px-3 py-2 text-sm" placeholder="Titel" />
              <input value={location.address} onChange={(event) => setDraft({ ...draft, locations: draft.locations.map((item) => (item.id === location.id ? { ...item, address: event.target.value } : item)) })} className="rounded-md border border-black/10 px-3 py-2 text-sm" placeholder="Adresse" />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-black/8 p-4">
        <div className="flex items-center justify-between mb-3"><h3 className="font-semibold flex items-center gap-2"><ListChecks className="w-4 h-4" /> Zusätzliche Aufgaben</h3><div className="flex items-center gap-3"><PortalToggle draft={draft} setDraft={setDraft} field="tasks" /><button onClick={props.addTask} className="text-xs inline-flex items-center gap-1 text-black/55 hover:text-black"><Plus className="w-3 h-3" /> Aufgabe</button></div></div>
        <TaskList tasks={otherTasks} updateTask={props.updateTask} requestTaskStatus={props.requestTaskStatus} removeTask={props.removeTask} />
      </section>

      <section className="rounded-lg border border-black/8 p-4">
        <div className="flex items-center justify-between mb-3"><h3 className="font-semibold">Leistungen</h3><div className="flex items-center gap-3"><PortalToggle draft={draft} setDraft={setDraft} field="services" /><button onClick={props.addCustomService} className="text-xs inline-flex items-center gap-1 text-black/55 hover:text-black"><Plus className="w-3 h-3" /> Leistung</button></div></div>
        <div className="space-y-2">
          {[...draft.bookedServices, ...draft.customServices].map((service, index) => (
            <div key={`${service.id}-${index}`} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_110px_auto]">
              <input value={service.name} onChange={(event) => updateService(draft, setDraft, service, "name", event.target.value)} className="rounded-md border border-black/10 px-3 py-2 text-sm" />
              <input value={service.price} onChange={(event) => updateService(draft, setDraft, service, "price", event.target.value)} className="rounded-md border border-black/10 px-3 py-2 text-sm" placeholder="Preis" />
              <button onClick={() => props.removeService(service)} className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700 inline-flex items-center justify-center" title="Leistung entfernen">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-black/8 p-4">
        <div className="flex items-center justify-between mb-3"><h3 className="font-semibold">Zahlungen</h3><div className="flex items-center gap-3"><PortalToggle draft={draft} setDraft={setDraft} field="payments" /><button onClick={props.addPayment} className="text-xs inline-flex items-center gap-1 text-black/55 hover:text-black"><Plus className="w-3 h-3" /> Zahlung</button></div></div>
        <div className="space-y-2">
          {draft.payments.map((payment) => (
            <div key={payment.id} className="grid gap-2 md:grid-cols-[minmax(0,1fr)_120px_145px_auto]">
              <input value={payment.title} onChange={(event) => setDraft({ ...draft, payments: draft.payments.map((item) => (item.id === payment.id ? { ...item, title: event.target.value } : item)) })} className="rounded-md border border-black/10 px-3 py-2 text-sm" placeholder="z.B. Anzahlung" />
              <input value={payment.amount} onChange={(event) => setDraft({ ...draft, payments: draft.payments.map((item) => (item.id === payment.id ? { ...item, amount: event.target.value } : item)) })} className="rounded-md border border-black/10 px-3 py-2 text-sm" placeholder="Betrag" />
              <input type="date" value={payment.paidAt} onChange={(event) => setDraft({ ...draft, payments: draft.payments.map((item) => (item.id === payment.id ? { ...item, paidAt: event.target.value } : item)) })} className="rounded-md border border-black/10 px-3 py-2 text-sm" />
              <button onClick={() => props.removePayment(payment)} className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700 inline-flex items-center justify-center" title="Zahlung entfernen"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          {draft.payments.length === 0 && <p className="rounded-md bg-[#faf8f5] border border-black/8 px-3 py-3 text-sm text-black/45">Noch keine Zahlungen geloggt.</p>}
        </div>
      </section>

      <DocumentSection
        draft={draft}
        setDraft={setDraft}
        addCustomDocument={props.addCustomDocument}
        updateDocument={props.updateDocument}
        uploadDocument={props.uploadDocument}
        deleteDocument={props.deleteDocument}
        readOnly={false}
      />

      <PortalControls draft={draft} setDraft={setDraft} addPortalMessage={props.addPortalMessage} provisionPortal={props.provisionPortal} />

      <label className="block"><span className="text-xs uppercase tracking-[0.16em] text-black/45">Interne Notizen</span><textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} className="mt-2 w-full min-h-28 rounded-md border border-black/10 px-3 py-2 text-sm" /></label>

      <section className="rounded-lg border border-black/8 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h3 className="font-semibold flex items-center gap-2"><Send className="w-4 h-4" /> Mail senden</h3>
          <select value={props.activeMail} onChange={(event) => props.setActiveMail(event.target.value)} className="rounded-md border border-black/10 px-3 py-2 text-sm">{Object.entries(props.mailTemplates).map(([key, template]) => <option key={key} value={key}>{template.label}</option>)}</select>
        </div>
        <div className="space-y-3">
          <input value={props.mailSubject} onChange={(event) => props.setMailSubject(event.target.value)} className="w-full rounded-md border border-black/10 px-3 py-2 text-sm" placeholder="Betreff" />
          <textarea value={props.mailBody} onChange={(event) => props.setMailBody(event.target.value)} className="w-full min-h-44 rounded-md border border-black/10 px-3 py-2 text-sm font-mono" />
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={props.sendMail} disabled={props.saving || (!draft.email && !draft.secondaryEmail)} className="inline-flex items-center gap-2 rounded-md bg-[#11100f] text-white px-4 py-2 text-sm disabled:opacity-50"><Send className="w-4 h-4" /> Mail senden</button>
            <a href={`/kundenportal/${draft.portalToken}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-black/55 hover:text-black">Portal öffnen <ExternalLink className="w-4 h-4" /></a>
          </div>
        </div>
      </section>
    </div>
  );
}

function TaskBoard({ tasks, requestTaskStatus }: { tasks: TaskItem[]; requestTaskStatus: (task: TaskItem, status: TaskStatus) => void }) {
  if (tasks.length === 0) {
    return <p className="rounded-md border border-black/8 bg-[#faf8f5] px-3 py-3 text-sm text-black/45">Noch keine Aufgaben angelegt.</p>;
  }

  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {tasks.map((task) => (
        <article key={task.id} className="rounded-lg border border-black/8 bg-[#faf8f5] p-3 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium text-sm leading-snug break-words">{task.title}</p>
              {task.dueDate && <p className="text-xs text-black/45 mt-1">Deadline: {task.dueDate}</p>}
            </div>
            <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] ${taskStatusStyles[task.status]}`}>{taskStatusLabels[task.status]}</span>
          </div>
          {task.note && <p className="mt-3 text-xs leading-relaxed text-black/55 whitespace-pre-wrap">{task.note}</p>}
          <label className="mt-4 block">
            <span className="text-[11px] uppercase tracking-[0.14em] text-black/35">Status ändern</span>
            <select value={task.status} onChange={(event) => requestTaskStatus(task, event.target.value as TaskStatus)} className="mt-2 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm">
              {(Object.keys(taskStatusLabels) as TaskStatus[]).map((status) => <option key={status} value={status}>{taskStatusLabels[status]}</option>)}
            </select>
          </label>
        </article>
      ))}
    </div>
  );
}

function ViewField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg border border-black/8 bg-[#faf8f5] p-3 min-w-0">
      <p className="text-[11px] uppercase tracking-[0.16em] text-black/40">{label}</p>
      <p className="mt-2 text-sm leading-relaxed text-black/75 whitespace-pre-wrap break-words">{value || "Noch nicht erfasst"}</p>
    </div>
  );
}

function LinkField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg border border-black/8 bg-[#faf8f5] p-3 min-w-0">
      <p className="text-[11px] uppercase tracking-[0.16em] text-black/40">{label}</p>
      {value ? (
        <a href={normalizeHref(value)} target="_blank" rel="noreferrer" className="mt-3 inline-flex max-w-full items-center gap-2 rounded-md bg-white border border-black/10 px-3 py-2 text-sm text-black/70 hover:text-black">
          <span className="truncate">Link öffnen</span>
          <ExternalLink className="w-4 h-4 shrink-0" />
        </a>
      ) : (
        <p className="mt-2 text-sm text-black/40">Noch nicht hinterlegt</p>
      )}
    </div>
  );
}

function MapLink({ value }: { value?: string }) {
  const href = mapsUrl(value);
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-[#6c5746] hover:text-black">
      In Google Maps öffnen <ExternalLink className="w-3 h-3" />
    </a>
  );
}

function PortalToggle({ draft, setDraft, field }: { draft: Customer; setDraft: (customer: Customer) => void; field: keyof PortalVisibility }) {
  return (
    <label className="inline-flex items-center gap-1 text-xs text-black/45">
      <input type="checkbox" checked={Boolean(draft.portalVisibility[field])} onChange={(event) => setDraft({ ...draft, portalVisibility: { ...draft.portalVisibility, [field]: event.target.checked } })} />
      Portal
    </label>
  );
}

function TaskList({ tasks, updateTask, requestTaskStatus, removeTask, compact = false }: { tasks: TaskItem[]; updateTask: (id: string, patch: Partial<TaskItem>) => void; requestTaskStatus: (task: TaskItem, status: TaskStatus) => void; removeTask: (task: TaskItem) => void; compact?: boolean }) {
  if (tasks.length === 0) {
    return <p className="rounded-md border border-black/8 bg-[#faf8f5] px-3 py-3 text-sm text-black/45">Noch keine Aufgaben angelegt.</p>;
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div key={task.id} className={`grid gap-2 ${compact ? "sm:grid-cols-[minmax(0,1fr)_140px_130px_auto_auto]" : "sm:grid-cols-[minmax(0,1fr)_140px_130px_auto_auto]"}`}>
          <input value={task.title} onChange={(event) => updateTask(task.id, { title: event.target.value })} className="rounded-md border border-black/10 px-3 py-2 text-sm" />
          <input type="date" value={task.dueDate || ""} onChange={(event) => updateTask(task.id, { dueDate: event.target.value })} className="rounded-md border border-black/10 px-2 py-2 text-sm" />
          <select value={task.status} onChange={(event) => requestTaskStatus(task, event.target.value as TaskStatus)} className="rounded-md border border-black/10 px-2 py-2 text-sm">
            {(Object.keys(taskStatusLabels) as TaskStatus[]).map((status) => <option key={status} value={status}>{taskStatusLabels[status]}</option>)}
          </select>
          <button onClick={() => requestTaskStatus(task, "erledigt")} className="rounded-md border border-black/10 px-3 py-2 text-sm inline-flex items-center gap-1 justify-center"><Check className="w-4 h-4" /> Fertig</button>
          <button onClick={() => removeTask(task)} className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700 inline-flex items-center justify-center" title={isWorkflowTask(task) ? "Schritt entfernen" : "Aufgabe entfernen"}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function updateService(draft: Customer, setDraft: (customer: Customer) => void, service: ServiceItem, field: "name" | "price", value: string) {
  const services = service.type === "custom" ? [...draft.customServices] : [...draft.bookedServices];
  const serviceIndex = services.findIndex((item) => item.id === service.id);
  services[serviceIndex] = { ...services[serviceIndex], [field]: value };
  setDraft(service.type === "custom" ? { ...draft, customServices: services } : { ...draft, bookedServices: services });
}

function PaymentSummary({ customer }: { customer: Customer }) {
  const total = [...customer.bookedServices, ...customer.customServices].reduce((sum, service) => sum + moneyNumber(service.price), 0);
  const paid = customer.payments.reduce((sum, payment) => sum + moneyNumber(payment.amount), 0);
  const open = Math.max(total - paid, 0);
  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-3 gap-2">
        <ViewField label="Gesamt" value={formatMoney(String(total)) || "Noch kein Betrag"} />
        <ViewField label="Bezahlt" value={formatMoney(String(paid)) || "0,00 €"} />
        <ViewField label="Offen" value={formatMoney(String(open)) || "0,00 €"} />
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        <ViewField label="Anzahlung fällig bis" value={customer.depositDueDate} />
        <ViewField label="Gesamtbetrag fällig bis" value={customer.finalPaymentDueDate} />
      </div>
      {customer.payments.length > 0 && (
        <div className="space-y-2">
          {customer.payments.map((payment) => (
            <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 rounded-md bg-[#faf8f5] border border-black/8 px-3 py-2 text-sm">
              <span>{payment.title} {payment.paidAt ? <span className="text-black/40">· {payment.paidAt}</span> : null}</span>
              <span className="text-black/60">{formatMoney(payment.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function customerDocuments(draft: Customer) {
  const existing = new Map(draft.documents.map((document) => [document.id, document]));
  const standard: CustomerDocument[] = [
    { id: "doc-offer", kind: "offer", title: "Angebot", url: draft.offerUrl },
    { id: "doc-contract", kind: "contract", title: "Vertrag", url: draft.contractUrl },
    { id: "doc-invoice", kind: "invoice", title: "Rechnung", url: draft.invoiceUrl },
  ].map((document) => ({ ...document, ...(existing.get(document.id) || {}), url: existing.get(document.id)?.url || document.url }));
  const custom = draft.documents.filter((document) => document.kind === "custom");
  return [...standard, ...custom];
}

function documentVisibilityField(document: CustomerDocument): keyof PortalVisibility {
  if (document.kind === "offer") return "offer";
  if (document.kind === "contract") return "contract";
  if (document.kind === "invoice") return "invoice";
  return "documents";
}

function DocumentSection({
  draft,
  setDraft,
  addCustomDocument,
  updateDocument,
  uploadDocument,
  deleteDocument,
  readOnly,
}: {
  draft: Customer;
  setDraft: (customer: Customer) => void;
  addCustomDocument: () => void;
  updateDocument: (document: CustomerDocument) => void;
  uploadDocument: (document: CustomerDocument, file: File) => void;
  deleteDocument: (document: CustomerDocument) => void;
  readOnly: boolean;
}) {
  const documents = customerDocuments(draft);
  const updateStandardUrl = (document: CustomerDocument, url: string) => {
    if (document.kind === "offer") setDraft({ ...draft, offerUrl: url, documents: upsertDocumentLocal(draft.documents, { ...document, url }) });
    if (document.kind === "contract") setDraft({ ...draft, contractUrl: url, documents: upsertDocumentLocal(draft.documents, { ...document, url }) });
    if (document.kind === "invoice") setDraft({ ...draft, invoiceUrl: url, documents: upsertDocumentLocal(draft.documents, { ...document, url }) });
  };

  return (
    <section className="rounded-lg border border-black/8 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Dokumente</h3>
        {!readOnly && <button onClick={addCustomDocument} className="text-xs inline-flex items-center gap-1 text-black/55 hover:text-black"><Plus className="w-3 h-3" /> Dokument</button>}
      </div>
      <div className="space-y-3">
        {documents.map((document) => {
          const visibilityField = documentVisibilityField(document);
          return (
            <div key={document.id} className="rounded-md bg-[#faf8f5] border border-black/8 p-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {readOnly || document.kind !== "custom" ? (
                    <p className="font-medium text-sm">{document.title}</p>
                  ) : (
                    <input value={document.title} onChange={(event) => updateDocument({ ...document, title: event.target.value })} className="w-full rounded-md border border-black/10 px-3 py-2 text-sm" />
                  )}
                  {document.fileName && <p className="mt-1 text-xs text-black/45">{document.fileName}</p>}
                </div>
                {!readOnly && <PortalToggle draft={draft} setDraft={setDraft} field={visibilityField} />}
              </div>
              {readOnly ? (
                document.url ? <a href={normalizeHref(document.url)} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm text-[#6c5746] hover:text-black">Dokument öffnen <ExternalLink className="w-4 h-4" /></a> : <p className="mt-3 text-sm text-black/40">Noch nicht hinterlegt</p>
              ) : (
                <div className="mt-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_auto_auto]">
                  <input value={document.url || ""} onChange={(event) => document.kind === "custom" ? updateDocument({ ...document, url: event.target.value }) : updateStandardUrl(document, event.target.value)} className="rounded-md border border-black/10 px-3 py-2 text-sm" placeholder="URL einfügen oder Datei hochladen" />
                  <label className="inline-flex items-center justify-center rounded-md border border-black/10 bg-white px-3 py-2 text-sm cursor-pointer">
                    Upload
                    <input
                      type="file"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.currentTarget.value = "";
                        if (file) uploadDocument(document, file);
                      }}
                    />
                  </label>
                  <button onClick={() => deleteDocument(document)} className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700 inline-flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function upsertDocumentLocal(documents: CustomerDocument[], document: CustomerDocument) {
  return documents.some((item) => item.id === document.id)
    ? documents.map((item) => (item.id === document.id ? document : item))
    : [...documents, document];
}

function InquiryDetail({ inquiry, onReply, onDelete, onConvert }: { inquiry: Inquiry; onReply: () => void; onDelete: () => void; onConvert: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div><p className="text-xs uppercase tracking-[0.22em] text-black/40">Anfragedetail</p><h2 className="mt-1 text-2xl">{inquiry.name}</h2><p className="text-sm text-black/50 mt-1">{inquiry.category || "Anfrage"} {inquiry.eventDate ? `· ${inquiry.eventDate}` : ""}</p></div>
        <div className="flex flex-wrap gap-2">
          <button onClick={onReply} className="inline-flex items-center gap-2 rounded-md bg-[#11100f] text-white px-3 py-2 text-sm"><Mail className="w-4 h-4" /> Antworten</button>
          <button onClick={onConvert} className="inline-flex items-center gap-2 rounded-md border border-black/10 px-3 py-2 text-sm"><ArrowRight className="w-4 h-4" /> In Kunde umwandeln</button>
          <button onClick={onDelete} className="inline-flex items-center gap-2 rounded-md border border-red-200 text-red-700 px-3 py-2 text-sm"><X className="w-4 h-4" /> Ablehnen/Löschen</button>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <ReadOnly label="E-Mail" value={inquiry.email} /><ReadOnly label="Telefon" value={inquiry.phone} /><ReadOnly label="Name Braut" value={inquiry.brideName} /><ReadOnly label="Name Bräutigam" value={inquiry.groomName} /><ReadOnly label="Kundenadresse" value={inquiry.customerAddress} /><ReadOnly label="Location-Adresse" value={inquiry.locationAddress} /><ReadOnly label="Gefunden über" value={inquiry.foundVia} /><ReadOnly label="Schätzung" value={inquiry.estimatedTotal} />
      </div>
      <section className="rounded-lg border border-black/8 p-4"><h3 className="font-semibold mb-3">Nachricht</h3><p className="whitespace-pre-wrap text-sm text-black/65 leading-relaxed">{inquiry.message || "Keine Nachricht hinterlegt."}</p></section>
    </div>
  );
}

function PortalControls({ draft, setDraft, addPortalMessage, provisionPortal, readOnly = false }: { draft: Customer; setDraft: (customer: Customer) => void; addPortalMessage: () => void; provisionPortal: () => void; readOnly?: boolean }) {
  const visibilityLabels: Record<keyof PortalVisibility, string> = {
    status: "Status sichtbar",
    tasks: "Aufgaben sichtbar",
    services: "Leistungen sichtbar",
    payments: "Zahlungen sichtbar",
    documents: "Dokumente sichtbar",
    locations: "Locations sichtbar",
    offer: "Angebot sichtbar",
    contract: "Vertrag sichtbar",
    invoice: "Rechnung sichtbar",
    gallery: "Galerie sichtbar",
    messages: "Nachrichten sichtbar",
  };

  if (readOnly) {
    const visibleItems = (Object.keys(visibilityLabels) as (keyof PortalVisibility)[]).filter((key) => draft.portalVisibility[key]);
    return (
      <section className="rounded-lg border border-black/8 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="font-semibold flex items-center gap-2"><MessageSquareText className="w-4 h-4" /> Kundenportal</h3>
          <button onClick={provisionPortal} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#11100f] text-white px-3 py-2 text-sm">{draft.portalEnabled ? "Portal erneut senden" : "Portal bereitstellen"}</button>
        </div>
        <div className="grid md:grid-cols-[1fr_220px] gap-3">
          <div className="rounded-lg border border-black/8 bg-[#faf8f5] p-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-black/40">Portal-Intro</p>
            <p className="mt-2 text-sm text-black/65 whitespace-pre-wrap">{draft.portalIntro || "Noch kein Intro hinterlegt."}</p>
          </div>
          <div className="rounded-lg border border-black/8 bg-[#faf8f5] p-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-black/40">Status</p>
            <p className="mt-2 text-sm text-black/65">{draft.portalEnabled ? `aktiv · Passwort: ${draft.portalPassword}` : "noch nicht bereitgestellt"}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {visibleItems.length > 0 ? visibleItems.map((key) => (
            <span key={key} className="rounded-full border border-black/8 bg-[#faf8f5] px-3 py-1 text-xs text-black/55">{visibilityLabels[key]}</span>
          )) : <span className="text-sm text-black/40">Keine Portalbereiche sichtbar geschaltet.</span>}
        </div>
        {draft.portalMessages.length > 0 && (
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {draft.portalMessages.map((portalMessage) => (
              <article key={portalMessage.id} className="rounded-lg border border-black/8 bg-[#faf8f5] p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-sm">{portalMessage.title || "Nachricht"}</p>
                  <span className={`rounded-full px-2 py-1 text-[11px] ${portalMessage.visible ? "bg-[#e8f2ea] text-[#2f6a38]" : "bg-black/5 text-black/40"}`}>{portalMessage.visible ? "sichtbar" : "intern"}</span>
                </div>
                <p className="mt-2 text-sm text-black/60 whitespace-pre-wrap">{portalMessage.message || "Keine Nachricht hinterlegt."}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-black/8 p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h3 className="font-semibold flex items-center gap-2"><MessageSquareText className="w-4 h-4" /> Kundenportal</h3>
        <button onClick={provisionPortal} className="inline-flex items-center gap-2 rounded-md bg-[#11100f] text-white px-3 py-2 text-sm">{draft.portalEnabled ? "Portal erneut senden" : "Portal bereitstellen"}</button>
      </div>
      {draft.portalEnabled && <p className="rounded-md bg-[#faf8f5] border border-black/8 px-3 py-2 text-sm mb-4">Portal aktiv · Passwort: {draft.portalPassword}</p>}
      <label className="block mb-4"><span className="text-xs uppercase tracking-[0.16em] text-black/45">Portal-Intro</span><textarea value={draft.portalIntro} onChange={(event) => setDraft({ ...draft, portalIntro: event.target.value })} className="mt-2 w-full min-h-20 rounded-md border border-black/10 px-3 py-2 text-sm" /></label>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-2 mb-5">
        {(Object.keys(visibilityLabels) as (keyof PortalVisibility)[]).map((key) => (
          <label key={key} className="flex items-center gap-2 rounded-md bg-[#faf8f5] border border-black/8 px-3 py-2 text-sm"><input type="checkbox" checked={Boolean(draft.portalVisibility[key])} onChange={(event) => setDraft({ ...draft, portalVisibility: { ...draft.portalVisibility, [key]: event.target.checked } })} />{visibilityLabels[key]}</label>
        ))}
      </div>
      <div className="flex items-center justify-between mb-3"><h4 className="text-sm font-semibold">Nachrichten im Portal</h4><button onClick={addPortalMessage} className="text-xs inline-flex items-center gap-1 text-black/55 hover:text-black"><Plus className="w-3 h-3" /> Nachricht</button></div>
      <div className="space-y-3">
        {draft.portalMessages.map((portalMessage) => (
          <div key={portalMessage.id} className="rounded-md border border-black/8 p-3 bg-[#faf8f5] space-y-2">
            <div className="grid md:grid-cols-[1fr_auto] gap-2">
              <input value={portalMessage.title} onChange={(event) => setDraft({ ...draft, portalMessages: draft.portalMessages.map((item) => (item.id === portalMessage.id ? { ...item, title: event.target.value } : item)) })} className="rounded-md border border-black/10 px-3 py-2 text-sm" placeholder="Titel" />
              <label className="flex items-center gap-2 text-sm px-2"><input type="checkbox" checked={portalMessage.visible} onChange={(event) => setDraft({ ...draft, portalMessages: draft.portalMessages.map((item) => (item.id === portalMessage.id ? { ...item, visible: event.target.checked } : item)) })} /> sichtbar</label>
            </div>
            <textarea value={portalMessage.message} onChange={(event) => setDraft({ ...draft, portalMessages: draft.portalMessages.map((item) => (item.id === portalMessage.id ? { ...item, message: event.target.value } : item)) })} className="w-full min-h-20 rounded-md border border-black/10 px-3 py-2 text-sm" placeholder="Nachricht" />
          </div>
        ))}
      </div>
    </section>
  );
}

function Modal({ title, children, onClose, wide = false }: { title: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 px-3 sm:px-4 py-4 sm:py-6 flex items-center justify-center">
      <div className={`w-full ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[calc(100vh-2rem)] overflow-hidden rounded-lg bg-white shadow-2xl border border-black/10`}>
        <div className="flex items-start justify-between gap-4 border-b border-black/8 p-4 sm:p-5"><h2 className="text-lg font-semibold">{title}</h2><button onClick={onClose} className="text-black/45 hover:text-black"><X className="w-5 h-5" /></button></div>
        <div className="p-4 sm:p-5 overflow-auto max-h-[calc(100vh-7rem)]">{children}</div>
      </div>
    </div>
  );
}

function ReadOnly({ label, value }: { label: string; value?: string }) {
  return <div><p className="text-xs uppercase tracking-[0.16em] text-black/45">{label}</p><p className="mt-2 rounded-md border border-black/8 bg-[#faf8f5] px-3 py-2 text-sm min-h-9">{value || "Noch nicht erfasst"}</p></div>;
}

function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.16em] text-black/45">{label}</span>
      <input type={type} value={value || ""} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:border-black/30" />
    </label>
  );
}
