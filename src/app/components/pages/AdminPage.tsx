import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ListChecks,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageSquareText,
  Plus,
  Save,
  Send,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import { mockCustomers, mockInquiries, mockMailTemplates, mockWorkflow } from "./adminMockData";

type CustomerStatus =
  | "anfrage"
  | "vorgespraech"
  | "angebot"
  | "vertrag"
  | "anzahlung"
  | "shooting"
  | "editing"
  | "galerie"
  | "abgeschlossen";
type TaskStatus = "offen" | "in_arbeit" | "erledigt" | "obsolet";
type ServiceItem = { id: string; name: string; price: string; type: "package" | "custom" };
type TaskItem = { id: string; title: string; status: TaskStatus; dueDate?: string; note?: string };
type LocationItem = { id: string; title: string; address: string };
type PortalVisibility = {
  status: boolean;
  tasks: boolean;
  services: boolean;
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
  phone: string;
  category: string;
  eventDate: string;
  eventTime: string;
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

const statusSteps: WorkflowItem[] = [
  { key: "anfrage", label: "Anfrage" },
  { key: "vorgespraech", label: "Vorgespräch" },
  { key: "angebot", label: "Angebot" },
  { key: "vertrag", label: "Vertrag" },
  { key: "anzahlung", label: "Anzahlung" },
  { key: "shooting", label: "Shooting/Hochzeit" },
  { key: "editing", label: "Editing" },
  { key: "galerie", label: "Galerie geliefert" },
  { key: "abgeschlossen", label: "Abgeschlossen" },
];

const defaultPortalVisibility: PortalVisibility = {
  status: false,
  tasks: false,
  services: true,
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
  phone: "",
  category: "Hochzeit",
  eventDate: "",
  eventTime: "",
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
  const workflow = statusSteps.map((step) => tasks.find((task) => task.id === `step-${step.key}`) || { id: `step-${step.key}`, title: step.label, status: "offen" as TaskStatus });
  const inProgress = workflow.find((task) => task.status === "in_arbeit");
  if (inProgress) return inProgress.id.replace("step-", "") as CustomerStatus;
  const lastDone = [...workflow].reverse().find((task) => task.status === "erledigt");
  return (lastDone?.id.replace("step-", "") as CustomerStatus) || "anfrage";
}

function normalizeTasks(tasks: TaskItem[] = []) {
  const existing = new Map(tasks.map((task) => [task.id, task]));
  const standard = workflowTasks().map((task) => ({ ...task, ...(existing.get(task.id) || {}) }));
  const custom = tasks.filter((task) => !isWorkflowTask(task));
  return [...standard, ...custom];
}

function normalizeCustomer(customer: Customer): Customer {
  const tasks = normalizeTasks(customer.tasks || []);
  return {
    ...emptyCustomer(),
    ...customer,
    eventTime: customer.eventTime || "",
    offerUrl: customer.offerUrl || "",
    portalEnabled: Boolean(customer.portalEnabled),
    portalPassword: customer.portalPassword || "",
    portalPublishedAt: customer.portalPublishedAt || "",
    portalVisibility: { ...defaultPortalVisibility, ...(customer.portalVisibility || {}) },
    portalMessages: customer.portalMessages || [],
    bookedServices: customer.bookedServices || [],
    customServices: customer.customServices || [],
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
  const [previewMode, setPreviewMode] = useState(false);
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
  const [view, setView] = useState<"customers" | "calendar">("customers");
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [calendarEvent, setCalendarEvent] = useState<CalendarEvent | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(() => {
    const saved = localStorage.getItem("mario_reminder_settings");
    return saved ? JSON.parse(saved) : defaultReminderSettings;
  });

  const selectedCustomer = useMemo(() => customers.find((customer) => customer.id === selectedId) || null, [customers, selectedId]);
  const selectedInquiry = useMemo(() => inquiries.find((inquiry) => inquiry.id === selectedInquiryId) || null, [inquiries, selectedInquiryId]);

  const notifications = useMemo<NotificationItem[]>(() => {
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
          time: customer.eventTime || "ganztags",
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

  const loadMockPreview = useCallback((reason = "Lokale Vorschau mit Mockdaten aktiv.") => {
    setPreviewMode(true);
    setInquiries(mockInquiries as Inquiry[]);
    setCustomers((mockCustomers as Customer[]).map(normalizeCustomer));
    setWorkflow((mockWorkflow as unknown as WorkflowItem[]).length ? (mockWorkflow as unknown as WorkflowItem[]) : statusSteps);
    setMailTemplates(mockMailTemplates);
    setSelectedId((current) => current || mockCustomers[0].id);
    setMessage(reason);
  }, []);

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
    const isVitePreview = window.location.port.startsWith("517") && ["127.0.0.1", "localhost"].includes(window.location.hostname);
    if (isVitePreview) return loadMockPreview("Lokale Vite-Vorschau mit Mockdaten aktiv. Echte API/DB läuft erst über Vercel.");
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
      loadMockPreview(`Lokale Vorschau mit Mockdaten aktiv. API/DB: ${error.message || "nicht erreichbar"}`);
    } finally {
      setLoading(false);
    }
  }, [adminPassword, api, loadMockPreview, selectedId]);

  useEffect(() => {
    if (isAuthenticated) loadCrm();
  }, [isAuthenticated, loadCrm]);

  useEffect(() => {
    setDraft(selectedCustomer ? structuredClone(normalizeCustomer(selectedCustomer)) : null);
  }, [selectedCustomer]);

  useEffect(() => {
    const template = mailTemplates[activeMail];
    setMailSubject(template?.subject || "");
    setMailBody(template?.body || "");
  }, [activeMail, mailTemplates, selectedId]);

  const login = async () => {
    setAuthError("");
    const isLocalVitePreview = window.location.port.startsWith("517") && ["127.0.0.1", "localhost"].includes(window.location.hostname);
    if (isLocalVitePreview) {
      if (password !== "admin") return setAuthError("Falsches Passwort");
      sessionStorage.setItem("admin_auth", "true");
      sessionStorage.setItem("admin_pw", password);
      setAdminPassword(password);
      setIsAuthenticated(true);
      return;
    }
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
    setView("customers");
  };
  const selectInquiry = (id: string) => {
    setSelectedInquiryId(id);
    setSelectedId("");
    setView("customers");
  };

  const persistCustomerDraft = async (updated: Customer) => {
    const normalized = normalizeCustomer({ ...updated, status: deriveStatus(updated.tasks) });
    setDraft(normalized);
    if (previewMode) {
      setCustomers((prev) => prev.map((item) => (item.id === normalized.id ? { ...normalized, updatedAt: new Date().toISOString() } : item)));
      return normalized;
    }
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
      setMessage(previewMode ? "Mock-Kunde lokal gespeichert" : "Gespeichert");
    } catch (error: any) {
      setMessage(error.message || "Speichern fehlgeschlagen");
    } finally {
      setSaving(false);
    }
  };

  const openConfirm = (action: ConfirmAction) => {
    const template = action.templateKey ? mailTemplates[action.templateKey] : null;
    setConfirmAction(action);
    setConfirmSendMail(Boolean(action.templateKey));
    setConfirmSubject(action.subject || template?.subject || "");
    setConfirmBody(action.body || template?.body || "");
    setConfirmAttachmentUrl("");
    setConfirmAttachmentName("");
  };

  const sendActionMail = async (action: ConfirmAction) => {
    if (!confirmSendMail || !confirmSubject || !confirmBody || previewMode) return;
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
      setMessage(previewMode && confirmSendMail ? "Aktion ausgeführt. Mockmodus: Mail wurde nicht wirklich versendet." : "Aktion ausgeführt");
      setConfirmAction(null);
    } catch (error: any) {
      setMessage(error.message || "Aktion fehlgeschlagen");
    } finally {
      setSaving(false);
    }
  };

  const createCustomer = async () => {
    if (previewMode) {
      const customer = normalizeCustomer({ ...emptyCustomer(), id: `mock-new-${Date.now()}`, portalToken: `mock-${Date.now()}`, name: "Neuer Mock-Kunde" });
      setCustomers((prev) => [customer, ...prev]);
      selectCustomer(customer.id);
      return;
    }
    const data = await api("customer", { method: "POST", body: JSON.stringify({ customer: emptyCustomer() }) });
    setCustomers((prev) => [normalizeCustomer(data.customer), ...prev]);
    selectCustomer(data.customer.id);
  };

  const convertInquiry = async (inquiryId: string) => {
    if (previewMode) {
      const inquiry = inquiries.find((item) => item.id === inquiryId);
      if (!inquiry) return;
      const customer = normalizeCustomer({
        ...emptyCustomer(),
        id: `mock-converted-${Date.now()}`,
        portalToken: `mock-converted-${Date.now()}`,
        sourceInquiryId: inquiry.id,
        name: inquiry.name,
        brideName: inquiry.brideName || "",
        groomName: inquiry.groomName || "",
        email: inquiry.email,
        phone: inquiry.phone,
        category: inquiry.category,
        eventDate: inquiry.eventDate,
        customerAddress: inquiry.customerAddress || "",
        locationAddress: inquiry.locationAddress || "",
        locations: inquiry.locations || [],
        location: inquiry.locationAddress || "",
        bookedServices: inquiry.selectedPackages,
        notes: inquiry.message,
      });
      setCustomers((prev) => [customer, ...prev]);
      setInquiries((prev) => prev.map((item) => (item.id === inquiryId ? { ...item, status: "umgewandelt" } : item)));
      selectCustomer(customer.id);
      return;
    }
    const data = await api("convert-inquiry", { method: "POST", body: JSON.stringify({ inquiryId }) });
    await loadCrm();
    selectCustomer(data.customer.id);
  };

  const deleteInquiryAction = async (inquiryId: string) => {
    if (previewMode) {
      setInquiries((prev) => prev.filter((item) => item.id !== inquiryId));
      setSelectedInquiryId("");
      return;
    }
    await api("delete-inquiry", { method: "POST", body: JSON.stringify({ id: inquiryId }) });
    await loadCrm();
    setSelectedInquiryId("");
  };

  const markInquiryAnswered = async (inquiryId: string) => {
    if (previewMode) {
      setInquiries((prev) => prev.map((item) => (item.id === inquiryId ? { ...item, status: "beantwortet" } : item)));
      return;
    }
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
    openConfirm({
      title: "Aufgabenstatus ändern?",
      description: `"${task.title}" wird auf "${status}" gesetzt. Der Kundenstatus wird daraus automatisch abgeleitet.`,
      templateKey: task.id === "step-vertrag" && status === "erledigt" ? "contract" : task.id === "step-galerie" && status === "erledigt" ? "gallery" : undefined,
      onConfirm: () => persistCustomerDraft(updated),
    });
  };

  const addTask = () => {
    if (!draft) return;
    setDraft({ ...draft, tasks: [...draft.tasks, { id: `task-${Date.now()}`, title: "Neue Aufgabe", status: "offen" }] });
  };
  const addCustomService = () => draft && setDraft({ ...draft, customServices: [...draft.customServices, { id: `custom-${Date.now()}`, name: "Neue Leistung", price: "", type: "custom" }] });
  const addLocation = () => draft && setDraft({ ...draft, locations: [...draft.locations, { id: `location-${Date.now()}`, title: "Weitere Location", address: "" }] });
  const addPortalMessage = () => draft && setDraft({ ...draft, portalMessages: [...draft.portalMessages, { id: `msg-${Date.now()}`, title: "Neue Nachricht", message: "", createdAt: new Date().toISOString(), visible: true }] });

  const sendMail = async () => {
    if (!draft) return;
    if (previewMode) return setMessage("Mockmodus: Mail wurde nicht wirklich versendet.");
    setSaving(true);
    try {
      await api("send-mail", { method: "POST", body: JSON.stringify({ customerId: draft.id, templateKey: activeMail, subject: mailSubject, body: mailBody }) });
      await loadCrm();
      setMessage("Mail gesendet");
    } catch (error: any) {
      setMessage(error.message || "Mail konnte nicht gesendet werden");
    } finally {
      setSaving(false);
    }
  };

  const provisionPortal = async () => {
    if (!draft) return;
    const portalPassword = createPortalPassword(draft.eventDate);
    if (!portalPassword) return setMessage("Für das Portal-Passwort braucht der Kunde ein Hochzeits-/Shootingdatum.");
    const updated = { ...draft, portalEnabled: true, portalPassword, portalPublishedAt: new Date().toISOString() };
    if (previewMode) {
      await persistCustomerDraft(updated);
      setMessage(`Mockmodus: Portal bereitgestellt. Passwort: ${portalPassword}`);
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
    } catch (error: any) {
      setMessage(error.message || "Portal konnte nicht bereitgestellt werden");
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
      <header className="border-b border-black/10 bg-[#11100f] text-white">
        <div className="max-w-7xl mx-auto px-5 py-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-white/45 text-xs uppercase tracking-[0.25em]">Mario Schubert Photography</p>
            <h1 className="text-xl mt-1">Kundenverwaltung</h1>
            {previewMode && <p className="text-white/45 text-xs mt-1">Lokale Vorschau mit Mockdaten</p>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setView(view === "calendar" ? "customers" : "calendar")} className="inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm text-white/80"><CalendarDays className="w-4 h-4" /> Kalender</button>
            <div className="relative">
              <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative inline-flex items-center justify-center rounded-md border border-white/15 w-10 h-10">
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && <span className="absolute -right-1 -top-1 min-w-5 h-5 rounded-full bg-red-600 text-white text-[11px] flex items-center justify-center">{notifications.length}</span>}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-12 z-30 w-80 rounded-lg bg-white text-black shadow-xl border border-black/10 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-sm">Notifications</p>
                    <button onClick={() => setSettingsOpen(true)} className="text-black/50 hover:text-black"><Settings className="w-4 h-4" /></button>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-auto">
                    {notifications.map((item) => (
                      <button key={item.id} onClick={() => { selectCustomer(item.customerId); setNotificationsOpen(false); }} className="w-full text-left rounded-md bg-[#faf8f5] border border-black/8 p-3">
                        <p className="text-sm font-medium">{item.customerName}</p>
                        <p className="text-xs text-black/55 mt-1">{item.taskTitle} · in {item.daysLeft} Tag(en) fällig</p>
                      </button>
                    ))}
                    {notifications.length === 0 && <p className="text-sm text-black/45">Keine fälligen Reminder.</p>}
                  </div>
                </div>
              )}
            </div>
            <button onClick={createCustomer} className="inline-flex items-center gap-2 rounded-md bg-white text-black px-3 py-2 text-sm"><Plus className="w-4 h-4" /> Kunde</button>
            <button onClick={logout} className="inline-flex items-center gap-2 text-white/55 hover:text-white text-sm"><LogOut className="w-4 h-4" /> Abmelden</button>
          </div>
        </div>
      </header>

      {settingsOpen && (
        <Modal title="Notification Settings" onClose={() => setSettingsOpen(false)}>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.16em] text-black/45">Reminder-Tage vor Deadline</span>
            <input defaultValue={reminderSettings.days.join(", ")} onBlur={(event) => saveReminderSettings(event.target.value)} className="mt-2 w-full rounded-md border border-black/10 px-3 py-2 text-sm" />
          </label>
          <p className="text-xs text-black/45 mt-2">Kommagetrennt, z.B. 14, 7, 3, 1.</p>
        </Modal>
      )}

      <main className="max-w-7xl mx-auto px-5 py-6 grid grid-cols-1 lg:grid-cols-[330px_1fr] gap-6">
        <aside className="space-y-5">
          <section className="bg-white border border-black/8 rounded-lg p-4">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><Mail className="w-4 h-4" /> Neue Anfragen</h2>
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
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><UserRound className="w-4 h-4" /> Kunden</h2>
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

        <section className="bg-white border border-black/8 rounded-lg p-5 md:p-6 min-h-[40rem]">
          {message && <p className="rounded-md bg-[#f4f0eb] px-3 py-2 text-sm text-black/65 mb-5">{message}</p>}
          {loading && <p className="text-black/45">Lade CRM...</p>}
          {!loading && view === "calendar" && <CalendarView month={calendarMonth} setMonth={setCalendarMonth} events={calendarEvents} onEvent={setCalendarEvent} />}
          {!loading && view !== "calendar" && selectedInquiry && (
            <InquiryDetail
              inquiry={selectedInquiry}
              onReply={() => openConfirm({ title: "Anfrage beantworten?", description: "Die Anfrage wird als beantwortet markiert. Optional wird direkt eine Mail verschickt.", templateKey: "reply", target: "inquiry", inquiryId: selectedInquiry.id, onConfirm: () => markInquiryAnswered(selectedInquiry.id) })}
              onDelete={() => openConfirm({ title: "Anfrage ablehnen oder löschen?", description: "Die Anfrage wird entfernt. Optional kann vorher eine kurze Absage-Mail gesendet werden.", templateKey: "reply", target: "inquiry", inquiryId: selectedInquiry.id, subject: `Danke für deine Anfrage, ${selectedInquiry.brideName || selectedInquiry.name}`, body: "Servus {firstName},\n\nvielen Dank für deine Anfrage. Leider passt es diesmal nicht oder der Termin ist bereits vergeben.\n\nIch wünsche euch alles Gute.\n\n{signature}", onConfirm: () => deleteInquiryAction(selectedInquiry.id) })}
              onConvert={() => openConfirm({ title: "In Kunden umwandeln?", description: "Relevante Kontaktdaten, Leistungen, Nachrichten und Locations werden übernommen.", templateKey: "portal", target: "inquiry", inquiryId: selectedInquiry.id, onConfirm: () => convertInquiry(selectedInquiry.id) })}
            />
          )}
          {!loading && view !== "calendar" && !draft && !selectedInquiry && <p className="text-black/45">Wähle eine Anfrage, einen Kunden oder lege einen neuen Kunden an.</p>}
          {!loading && view !== "calendar" && draft && (
            <CustomerDetail
              draft={draft}
              workflow={workflow}
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
              addTask={addTask}
              addLocation={addLocation}
              addCustomService={addCustomService}
              addPortalMessage={addPortalMessage}
              sendMail={sendMail}
              provisionPortal={provisionPortal}
            />
          )}
        </section>
      </main>

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

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => setMonth(new Date(year, monthIndex - 1, 1))} className="rounded-md border border-black/10 p-2"><ChevronLeft className="w-4 h-4" /></button>
        <h2 className="text-xl font-medium">{monthNames[monthIndex]} {year}</h2>
        <button onClick={() => setMonth(new Date(year, monthIndex + 1, 1))} className="rounded-md border border-black/10 p-2"><ChevronRight className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-xs text-black/45 mb-2">{["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => <div key={day}>{day}</div>)}</div>
      <div className="grid grid-cols-7 gap-2">
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
  addTask: () => void;
  addLocation: () => void;
  addCustomService: () => void;
  addPortalMessage: () => void;
  sendMail: () => void;
  provisionPortal: () => void;
}) {
  const { draft, setDraft } = props;
  const workflowTasksOnly = draft.tasks.filter(isWorkflowTask);
  const otherTasks = draft.tasks.filter((task) => !isWorkflowTask(task));

  return (
    <div className="space-y-7">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-black/40">Kundendetail</p>
          <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="mt-1 text-2xl bg-transparent border-b border-transparent focus:border-black/20 outline-none" placeholder="Name" />
          <p className="text-sm text-black/45 mt-2">Status: {statusSteps.find((item) => item.key === draft.status)?.label || draft.status}</p>
        </div>
        <button onClick={props.saveCustomer} disabled={props.saving} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#11100f] text-white px-4 py-2 text-sm disabled:opacity-50"><Save className="w-4 h-4" /> {props.saving ? "Speichere..." : "Speichern"}</button>
      </div>

      <section className="rounded-lg border border-black/8 p-4">
        <h3 className="font-semibold flex items-center gap-2 mb-3"><ListChecks className="w-4 h-4" /> Schritte & Status</h3>
        <TaskList tasks={workflowTasksOnly} updateTask={props.updateTask} requestTaskStatus={props.requestTaskStatus} compact />
      </section>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="E-Mail" value={draft.email} onChange={(value) => setDraft({ ...draft, email: value })} />
        <Field label="Telefon" value={draft.phone} onChange={(value) => setDraft({ ...draft, phone: value })} />
        <Field label="Name Braut" value={draft.brideName} onChange={(value) => setDraft({ ...draft, brideName: value })} />
        <Field label="Name Bräutigam" value={draft.groomName} onChange={(value) => setDraft({ ...draft, groomName: value })} />
        <Field label="Kategorie" value={draft.category} onChange={(value) => setDraft({ ...draft, category: value })} />
        <Field label="Hochzeit/Shooting" type="date" value={draft.eventDate} onChange={(value) => setDraft({ ...draft, eventDate: value })} />
        <Field label="Uhrzeit Hochzeit/Shooting" type="time" value={draft.eventTime} onChange={(value) => setDraft({ ...draft, eventTime: value })} />
        <Field label="Vorgespräch" value={draft.consultationDate} onChange={(value) => setDraft({ ...draft, consultationDate: value })} placeholder="22. Mai 2026, 18:30 Uhr · Google Meet" />
        <Field label="Kundenadresse" value={draft.customerAddress} onChange={(value) => setDraft({ ...draft, customerAddress: value })} />
        <Field label="Location-Adresse" value={draft.locationAddress} onChange={(value) => setDraft({ ...draft, locationAddress: value })} />
        <Field label="Location kurz" value={draft.location} onChange={(value) => setDraft({ ...draft, location: value })} />
        <Field label="Angebotslink" value={draft.offerUrl} onChange={(value) => setDraft({ ...draft, offerUrl: value })} />
        <Field label="Vertrag-Link" value={draft.contractUrl} onChange={(value) => setDraft({ ...draft, contractUrl: value })} />
        <Field label="Rechnungslink" value={draft.invoiceUrl} onChange={(value) => setDraft({ ...draft, invoiceUrl: value })} />
        <Field label="Galerie-Link" value={draft.galleryUrl} onChange={(value) => setDraft({ ...draft, galleryUrl: value })} />
      </div>

      <section className="rounded-lg border border-black/8 p-4">
        <div className="flex items-center justify-between mb-3"><h3 className="font-semibold flex items-center gap-2"><MapPin className="w-4 h-4" /> Weitere Locations</h3><button onClick={props.addLocation} className="text-xs inline-flex items-center gap-1 text-black/55 hover:text-black"><Plus className="w-3 h-3" /> Location</button></div>
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
        <div className="flex items-center justify-between mb-3"><h3 className="font-semibold flex items-center gap-2"><ListChecks className="w-4 h-4" /> Zusätzliche Aufgaben</h3><button onClick={props.addTask} className="text-xs inline-flex items-center gap-1 text-black/55 hover:text-black"><Plus className="w-3 h-3" /> Aufgabe</button></div>
        <TaskList tasks={otherTasks} updateTask={props.updateTask} requestTaskStatus={props.requestTaskStatus} />
      </section>

      <section className="rounded-lg border border-black/8 p-4">
        <div className="flex items-center justify-between mb-3"><h3 className="font-semibold">Leistungen</h3><button onClick={props.addCustomService} className="text-xs inline-flex items-center gap-1 text-black/55 hover:text-black"><Plus className="w-3 h-3" /> Leistung</button></div>
        <div className="space-y-2">
          {[...draft.bookedServices, ...draft.customServices].map((service, index) => (
            <div key={`${service.id}-${index}`} className="grid grid-cols-[1fr_110px] gap-2">
              <input value={service.name} onChange={(event) => updateService(draft, setDraft, service, "name", event.target.value)} className="rounded-md border border-black/10 px-3 py-2 text-sm" />
              <input value={service.price} onChange={(event) => updateService(draft, setDraft, service, "price", event.target.value)} className="rounded-md border border-black/10 px-3 py-2 text-sm" placeholder="Preis" />
            </div>
          ))}
        </div>
      </section>

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
            <button onClick={props.sendMail} disabled={props.saving || !draft.email} className="inline-flex items-center gap-2 rounded-md bg-[#11100f] text-white px-4 py-2 text-sm disabled:opacity-50"><Send className="w-4 h-4" /> Mail senden</button>
            <a href={`/kundenportal/${draft.portalToken}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-black/55 hover:text-black">Portal öffnen <ExternalLink className="w-4 h-4" /></a>
          </div>
        </div>
      </section>
    </div>
  );
}

function TaskList({ tasks, updateTask, requestTaskStatus, compact = false }: { tasks: TaskItem[]; updateTask: (id: string, patch: Partial<TaskItem>) => void; requestTaskStatus: (task: TaskItem, status: TaskStatus) => void; compact?: boolean }) {
  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div key={task.id} className={`grid gap-2 ${compact ? "md:grid-cols-[1fr_140px_130px_auto]" : "md:grid-cols-[1fr_140px_130px_auto]"}`}>
          <input value={task.title} onChange={(event) => updateTask(task.id, { title: event.target.value })} className="rounded-md border border-black/10 px-3 py-2 text-sm" />
          <input type="date" value={task.dueDate || ""} onChange={(event) => updateTask(task.id, { dueDate: event.target.value })} className="rounded-md border border-black/10 px-2 py-2 text-sm" />
          <select value={task.status} onChange={(event) => requestTaskStatus(task, event.target.value as TaskStatus)} className="rounded-md border border-black/10 px-2 py-2 text-sm">
            <option value="offen">offen</option>
            <option value="in_arbeit">in Arbeit</option>
            <option value="erledigt">erledigt</option>
            <option value="obsolet">obsolet</option>
          </select>
          <button onClick={() => requestTaskStatus(task, "erledigt")} className="rounded-md border border-black/10 px-3 py-2 text-sm inline-flex items-center gap-1 justify-center"><Check className="w-4 h-4" /> Fertig</button>
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

function PortalControls({ draft, setDraft, addPortalMessage, provisionPortal }: { draft: Customer; setDraft: (customer: Customer) => void; addPortalMessage: () => void; provisionPortal: () => void }) {
  const visibilityLabels: Record<keyof PortalVisibility, string> = {
    status: "Status sichtbar",
    tasks: "Aufgaben sichtbar",
    services: "Leistungen sichtbar",
    offer: "Angebot sichtbar",
    contract: "Vertrag sichtbar",
    invoice: "Rechnung sichtbar",
    gallery: "Galerie sichtbar",
    messages: "Nachrichten sichtbar",
  };
  return (
    <section className="rounded-lg border border-black/8 p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h3 className="font-semibold flex items-center gap-2"><MessageSquareText className="w-4 h-4" /> Kundenportal</h3>
        <button onClick={provisionPortal} className="inline-flex items-center gap-2 rounded-md bg-[#11100f] text-white px-3 py-2 text-sm">{draft.portalEnabled ? "Portal erneut senden" : "Portal bereitstellen"}</button>
      </div>
      {draft.portalEnabled && <p className="rounded-md bg-[#faf8f5] border border-black/8 px-3 py-2 text-sm mb-4">Portal aktiv · Passwort: {draft.portalPassword}</p>}
      <label className="block mb-4"><span className="text-xs uppercase tracking-[0.16em] text-black/45">Portal-Intro</span><textarea value={draft.portalIntro} onChange={(event) => setDraft({ ...draft, portalIntro: event.target.value })} className="mt-2 w-full min-h-20 rounded-md border border-black/10 px-3 py-2 text-sm" /></label>
      <div className="grid md:grid-cols-4 gap-2 mb-5">
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
    <div className="fixed inset-0 z-50 bg-black/50 px-4 py-6 flex items-center justify-center">
      <div className={`w-full ${wide ? "max-w-2xl" : "max-w-lg"} rounded-lg bg-white shadow-2xl border border-black/10`}>
        <div className="flex items-start justify-between gap-4 border-b border-black/8 p-5"><h2 className="text-lg font-semibold">{title}</h2><button onClick={onClose} className="text-black/45 hover:text-black"><X className="w-5 h-5" /></button></div>
        <div className="p-5">{children}</div>
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
