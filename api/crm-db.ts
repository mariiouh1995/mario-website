import postgres from "postgres";

export type InquiryStatus =
  | "neu"
  | "beantwortet"
  | "vorgespraech"
  | "angebot"
  | "gebucht"
  | "abgesagt"
  | "umgewandelt";

export type CustomerStatus =
  | "anfrage"
  | "vorgespraech"
  | "angebot"
  | "vertrag"
  | "anzahlung"
  | "shooting"
  | "editing"
  | "galerie"
  | "abgeschlossen";

export type ContractStatus = "nicht_gesendet" | "gesendet" | "unterzeichnet";

export type ServiceItem = {
  id: string;
  name: string;
  price: string;
  type: "package" | "custom";
};

export type LocationItem = {
  id: string;
  title: string;
  address: string;
};

export type TaskItem = {
  id: string;
  title: string;
  status: "offen" | "in_arbeit" | "erledigt" | "obsolet";
  dueDate?: string;
  note?: string;
};

export type PortalMessage = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  visible: boolean;
};

export type PortalVisibility = {
  status: boolean;
  tasks: boolean;
  services: boolean;
  offer: boolean;
  contract: boolean;
  invoice: boolean;
  gallery: boolean;
  messages: boolean;
};

export type CrmInquiry = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: InquiryStatus;
  name: string;
  brideName: string;
  groomName: string;
  email: string;
  phone: string;
  category: string;
  eventDate: string;
  customerAddress: string;
  locationAddress: string;
  locations: LocationItem[];
  foundVia: string;
  message: string;
  selectedPackages: ServiceItem[];
  estimatedTotal: string;
  convertedCustomerId?: string | null;
};

export type CrmCustomer = {
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
  contractStatus: ContractStatus;
  bookedServices: ServiceItem[];
  customServices: ServiceItem[];
  tasks: TaskItem[];
  portalVisibility: PortalVisibility;
  portalMessages: PortalMessage[];
  notes: string;
  portalIntro: string;
};

export type MailLog = {
  id: string;
  customerId: string;
  templateKey: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
};

export const WORKFLOW: { key: CustomerStatus; label: string }[] = [
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

export const DEFAULT_TASKS: TaskItem[] = WORKFLOW.map((step) => ({
  id: `step-${step.key}`,
  title: step.label,
  status: "offen",
}));

export const DEFAULT_PORTAL_VISIBILITY: PortalVisibility = {
  status: false,
  tasks: false,
  services: true,
  offer: false,
  contract: false,
  invoice: false,
  gallery: true,
  messages: true,
};

export const MAIL_TEMPLATES: Record<string, { label: string; subject: string; body: string }> = {
  reply: {
    label: "Anfrage beantworten",
    subject: "Danke für deine Anfrage, {firstName}",
    body: "Servus {firstName},\n\nvielen Dank für deine Anfrage. Ich freue mich, mehr über eure Pläne zu erfahren.\n\nIch melde mich zeitnah mit ein paar Terminvorschlägen für ein kurzes Vorgespräch.\n\n{signature}",
  },
  consultation: {
    label: "Vorgespräch",
    subject: "Unser Vorgespräch",
    body: "Servus {firstName},\n\nhier findest du die Details für unser Vorgespräch:\n\nTermin: {consultationDate}\n\nFalls sich bei dir etwas ändert, gib mir einfach kurz Bescheid.\n\n{signature}",
  },
  contract: {
    label: "Vertrag senden",
    subject: "Dein Vertrag mit Mario Schubert Photography",
    body: "Servus {firstName},\n\nich habe dir den Vertrag für euren Termin vorbereitet.\n\nDu findest ihn hier:\n{contractUrl}\n\nWenn alles passt, gib mir bitte kurz Bescheid oder sende mir den unterschriebenen Vertrag zurück.\n\n{signature}",
  },
  portal: {
    label: "Kundenportal",
    subject: "Dein Kundenbereich bei Mario Schubert Photography",
    body: "Servus {firstName},\n\nich habe dir einen persönlichen Kundenbereich eingerichtet. Dort findest du eure gebuchten Leistungen, Termine, Dokumente und später auch den Galerie-Link.\n\nLink: {portalUrl}\nPasswort: {portalPassword}\n\n{signature}",
  },
  gallery: {
    label: "Galerie geliefert",
    subject: "Eure Galerie ist fertig",
    body: "Servus {firstName},\n\neure Galerie ist fertig. Du findest sie hier:\n{galleryUrl}\n\nIch wünsche euch ganz viel Freude mit den Bildern.\n\n{signature}",
  },
};

let client: postgres.Sql | null = null;
let schemaReady = false;

export function sql() {
  const connection = process.env.MARIO_DATABASE_URL || process.env.DATABASE_URL;
  if (!connection) throw new Error("MARIO_DATABASE_URL or DATABASE_URL is not configured");
  if (!client) {
    client = postgres(connection, {
      ssl: "require",
      max: 3,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return client;
}

export function createId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createPortalToken() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
}

export function createPortalPassword(eventDate: string) {
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(eventDate || "");
  if (isoMatch) return `${isoMatch[3]}${isoMatch[2]}${isoMatch[1]}`;
  const germanMatch = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(eventDate || "");
  if (germanMatch) return `${germanMatch[1].padStart(2, "0")}${germanMatch[2].padStart(2, "0")}${germanMatch[3]}`;
  return "";
}

export function nowIso() {
  return new Date().toISOString();
}

function normalizeJson<T>(value: unknown, fallback: T): T {
  if (!value) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

export async function ensureMarioCrmSchema() {
  if (schemaReady) return;
  const db = sql();

  await db`SELECT pg_advisory_lock(74839201)`;
  try {
    if (schemaReady) return;

    await db`
      CREATE TABLE IF NOT EXISTS mario_inquiries (
        id text PRIMARY KEY,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        status text NOT NULL DEFAULT 'neu',
        name text NOT NULL DEFAULT '',
        bride_name text NOT NULL DEFAULT '',
        groom_name text NOT NULL DEFAULT '',
        email text NOT NULL DEFAULT '',
        phone text NOT NULL DEFAULT '',
        category text NOT NULL DEFAULT '',
        event_date text NOT NULL DEFAULT '',
        customer_address text NOT NULL DEFAULT '',
        location_address text NOT NULL DEFAULT '',
        locations jsonb NOT NULL DEFAULT '[]',
        found_via text NOT NULL DEFAULT '',
        message text NOT NULL DEFAULT '',
        selected_packages jsonb NOT NULL DEFAULT '[]',
        estimated_total text NOT NULL DEFAULT '',
        converted_customer_id text
      )
    `;

    await db`
      CREATE TABLE IF NOT EXISTS mario_customers (
        id text PRIMARY KEY,
        portal_token text UNIQUE NOT NULL,
        source_inquiry_id text NOT NULL DEFAULT '',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        status text NOT NULL DEFAULT 'anfrage',
        name text NOT NULL DEFAULT '',
        bride_name text NOT NULL DEFAULT '',
        groom_name text NOT NULL DEFAULT '',
        email text NOT NULL DEFAULT '',
        phone text NOT NULL DEFAULT '',
        category text NOT NULL DEFAULT '',
        event_date text NOT NULL DEFAULT '',
        event_time text NOT NULL DEFAULT '',
        location text NOT NULL DEFAULT '',
        customer_address text NOT NULL DEFAULT '',
        location_address text NOT NULL DEFAULT '',
        locations jsonb NOT NULL DEFAULT '[]',
        consultation_date text NOT NULL DEFAULT '',
        consultation_type text NOT NULL DEFAULT '',
        gallery_url text NOT NULL DEFAULT '',
        offer_url text NOT NULL DEFAULT '',
        contract_url text NOT NULL DEFAULT '',
        invoice_url text NOT NULL DEFAULT '',
        portal_enabled boolean NOT NULL DEFAULT false,
        portal_password text NOT NULL DEFAULT '',
        portal_published_at text NOT NULL DEFAULT '',
        contract_status text NOT NULL DEFAULT 'nicht_gesendet',
        booked_services jsonb NOT NULL DEFAULT '[]',
        custom_services jsonb NOT NULL DEFAULT '[]',
        tasks jsonb NOT NULL DEFAULT '[]',
        portal_visibility jsonb NOT NULL DEFAULT '{}',
        portal_messages jsonb NOT NULL DEFAULT '[]',
        notes text NOT NULL DEFAULT '',
        portal_intro text NOT NULL DEFAULT ''
      )
    `;

    await db`ALTER TABLE mario_inquiries ADD COLUMN IF NOT EXISTS bride_name text NOT NULL DEFAULT ''`;
    await db`ALTER TABLE mario_inquiries ADD COLUMN IF NOT EXISTS groom_name text NOT NULL DEFAULT ''`;
    await db`ALTER TABLE mario_inquiries ADD COLUMN IF NOT EXISTS customer_address text NOT NULL DEFAULT ''`;
    await db`ALTER TABLE mario_inquiries ADD COLUMN IF NOT EXISTS location_address text NOT NULL DEFAULT ''`;
    await db`ALTER TABLE mario_inquiries ADD COLUMN IF NOT EXISTS locations jsonb NOT NULL DEFAULT '[]'`;
    await db`ALTER TABLE mario_customers ADD COLUMN IF NOT EXISTS bride_name text NOT NULL DEFAULT ''`;
    await db`ALTER TABLE mario_customers ADD COLUMN IF NOT EXISTS groom_name text NOT NULL DEFAULT ''`;
    await db`ALTER TABLE mario_customers ADD COLUMN IF NOT EXISTS customer_address text NOT NULL DEFAULT ''`;
    await db`ALTER TABLE mario_customers ADD COLUMN IF NOT EXISTS location_address text NOT NULL DEFAULT ''`;
    await db`ALTER TABLE mario_customers ADD COLUMN IF NOT EXISTS locations jsonb NOT NULL DEFAULT '[]'`;
    await db`ALTER TABLE mario_customers ADD COLUMN IF NOT EXISTS event_time text NOT NULL DEFAULT ''`;
    await db`ALTER TABLE mario_customers ADD COLUMN IF NOT EXISTS offer_url text NOT NULL DEFAULT ''`;
    await db`ALTER TABLE mario_customers ADD COLUMN IF NOT EXISTS invoice_url text NOT NULL DEFAULT ''`;
    await db`ALTER TABLE mario_customers ADD COLUMN IF NOT EXISTS portal_enabled boolean NOT NULL DEFAULT false`;
    await db`ALTER TABLE mario_customers ADD COLUMN IF NOT EXISTS portal_password text NOT NULL DEFAULT ''`;
    await db`ALTER TABLE mario_customers ADD COLUMN IF NOT EXISTS portal_published_at text NOT NULL DEFAULT ''`;
    await db`ALTER TABLE mario_customers ADD COLUMN IF NOT EXISTS portal_visibility jsonb NOT NULL DEFAULT '{}'`;
    await db`ALTER TABLE mario_customers ADD COLUMN IF NOT EXISTS portal_messages jsonb NOT NULL DEFAULT '[]'`;

    await db`
      CREATE TABLE IF NOT EXISTS mario_mail_logs (
        id text PRIMARY KEY,
        customer_id text NOT NULL,
        template_key text NOT NULL DEFAULT '',
        recipient text NOT NULL DEFAULT '',
        subject text NOT NULL DEFAULT '',
        body text NOT NULL DEFAULT '',
        sent_at timestamptz NOT NULL DEFAULT now()
      )
    `;

    await db`CREATE INDEX IF NOT EXISTS idx_mario_inquiries_created_at ON mario_inquiries(created_at DESC)`;
    await db`CREATE INDEX IF NOT EXISTS idx_mario_customers_updated_at ON mario_customers(updated_at DESC)`;
    await db`CREATE INDEX IF NOT EXISTS idx_mario_customers_portal_token ON mario_customers(portal_token)`;

    schemaReady = true;
  } finally {
    await db`SELECT pg_advisory_unlock(74839201)`;
  }
}

function mapInquiry(row: any): CrmInquiry {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status,
    name: row.name,
    brideName: row.bride_name,
    groomName: row.groom_name,
    email: row.email,
    phone: row.phone,
    category: row.category,
    eventDate: row.event_date,
    customerAddress: row.customer_address,
    locationAddress: row.location_address,
    locations: normalizeJson<LocationItem[]>(row.locations, []),
    foundVia: row.found_via,
    message: row.message,
    selectedPackages: normalizeJson<ServiceItem[]>(row.selected_packages, []),
    estimatedTotal: row.estimated_total,
    convertedCustomerId: row.converted_customer_id,
  };
}

function mapCustomer(row: any): CrmCustomer {
  return {
    id: row.id,
    portalToken: row.portal_token,
    sourceInquiryId: row.source_inquiry_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status,
    name: row.name,
    brideName: row.bride_name,
    groomName: row.groom_name,
    email: row.email,
    phone: row.phone,
    category: row.category,
    eventDate: row.event_date,
    eventTime: row.event_time,
    location: row.location,
    customerAddress: row.customer_address,
    locationAddress: row.location_address,
    locations: normalizeJson<LocationItem[]>(row.locations, []),
    consultationDate: row.consultation_date,
    consultationType: row.consultation_type,
    galleryUrl: row.gallery_url,
    offerUrl: row.offer_url,
    contractUrl: row.contract_url,
    invoiceUrl: row.invoice_url,
    portalEnabled: Boolean(row.portal_enabled),
    portalPassword: row.portal_password,
    portalPublishedAt: row.portal_published_at,
    contractStatus: row.contract_status,
    bookedServices: normalizeJson<ServiceItem[]>(row.booked_services, []),
    customServices: normalizeJson<ServiceItem[]>(row.custom_services, []),
    tasks: normalizeJson<TaskItem[]>(row.tasks, DEFAULT_TASKS),
    portalVisibility: { ...DEFAULT_PORTAL_VISIBILITY, ...normalizeJson<Partial<PortalVisibility>>(row.portal_visibility, {}) },
    portalMessages: normalizeJson<PortalMessage[]>(row.portal_messages, []),
    notes: row.notes,
    portalIntro: row.portal_intro,
  };
}

export async function listInquiries() {
  await ensureMarioCrmSchema();
  const rows = await sql()`SELECT * FROM mario_inquiries ORDER BY created_at DESC`;
  return rows.map(mapInquiry);
}

export async function appendInquiry(input: Partial<CrmInquiry>) {
  await ensureMarioCrmSchema();
  const id = input.id || createId("inq");
  const rows = await sql()`
    INSERT INTO mario_inquiries (
      id, status, name, bride_name, groom_name, email, phone, category, event_date, customer_address, location_address, locations, found_via, message, selected_packages, estimated_total
    ) VALUES (
      ${id}, ${input.status || "neu"}, ${input.name || ""}, ${input.brideName || ""}, ${input.groomName || ""},
      ${input.email || ""}, ${input.phone || ""}, ${input.category || ""}, ${input.eventDate || ""},
      ${input.customerAddress || ""}, ${input.locationAddress || ""}, ${JSON.stringify(input.locations || [])}::jsonb,
      ${input.foundVia || ""}, ${input.message || ""},
      ${JSON.stringify(input.selectedPackages || [])}::jsonb, ${input.estimatedTotal || ""}
    )
    RETURNING *
  `;
  return mapInquiry(rows[0]);
}

export async function updateInquiryStatus(id: string, status: InquiryStatus, convertedCustomerId = "") {
  await ensureMarioCrmSchema();
  const rows = await sql()`
    UPDATE mario_inquiries
    SET status = ${status}, converted_customer_id = COALESCE(NULLIF(${convertedCustomerId}, ''), converted_customer_id), updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] ? mapInquiry(rows[0]) : null;
}

export async function deleteInquiry(id: string) {
  await ensureMarioCrmSchema();
  await sql()`DELETE FROM mario_inquiries WHERE id = ${id}`;
}

export async function listCustomers() {
  await ensureMarioCrmSchema();
  const rows = await sql()`SELECT * FROM mario_customers ORDER BY updated_at DESC`;
  return rows.map(mapCustomer);
}

export async function getCustomer(id: string) {
  await ensureMarioCrmSchema();
  const rows = await sql()`SELECT * FROM mario_customers WHERE id = ${id} LIMIT 1`;
  return rows[0] ? mapCustomer(rows[0]) : null;
}

export async function getCustomerByToken(token: string) {
  await ensureMarioCrmSchema();
  const rows = await sql()`SELECT * FROM mario_customers WHERE portal_token = ${token} LIMIT 1`;
  return rows[0] ? mapCustomer(rows[0]) : null;
}

export async function appendCustomer(input: Partial<CrmCustomer>) {
  await ensureMarioCrmSchema();
  const id = input.id || createId("cus");
  const portalToken = input.portalToken || createPortalToken();
  const rows = await sql()`
    INSERT INTO mario_customers (
      id, portal_token, source_inquiry_id, status, name, email, phone, category, event_date, location,
      bride_name, groom_name, customer_address, location_address, locations,
      event_time, consultation_date, consultation_type, gallery_url, offer_url, contract_url, invoice_url,
      portal_enabled, portal_password, portal_published_at, contract_status,
      booked_services, custom_services, tasks, portal_visibility, portal_messages, notes, portal_intro
    ) VALUES (
      ${id}, ${portalToken}, ${input.sourceInquiryId || ""}, ${input.status || "anfrage"},
      ${input.name || ""}, ${input.email || ""}, ${input.phone || ""}, ${input.category || ""},
      ${input.eventDate || ""}, ${input.location || ""}, ${input.brideName || ""}, ${input.groomName || ""},
      ${input.customerAddress || ""}, ${input.locationAddress || ""}, ${JSON.stringify(input.locations || [])}::jsonb,
      ${input.eventTime || ""}, ${input.consultationDate || ""}, ${input.consultationType || ""}, ${input.galleryUrl || ""},
      ${input.offerUrl || ""}, ${input.contractUrl || ""}, ${input.invoiceUrl || ""},
      ${input.portalEnabled || false}, ${input.portalPassword || ""}, ${input.portalPublishedAt || ""},
      ${input.contractStatus || "nicht_gesendet"}, ${JSON.stringify(input.bookedServices || [])}::jsonb,
      ${JSON.stringify(input.customServices || [])}::jsonb, ${JSON.stringify(input.tasks || DEFAULT_TASKS)}::jsonb,
      ${JSON.stringify(input.portalVisibility || DEFAULT_PORTAL_VISIBILITY)}::jsonb,
      ${JSON.stringify(input.portalMessages || [])}::jsonb,
      ${input.notes || ""}, ${input.portalIntro || ""}
    )
    RETURNING *
  `;
  return mapCustomer(rows[0]);
}

export async function upsertCustomer(customer: CrmCustomer) {
  await ensureMarioCrmSchema();
  const rows = await sql()`
    INSERT INTO mario_customers (
      id, portal_token, source_inquiry_id, created_at, updated_at, status, name, bride_name, groom_name, email, phone, category, event_date, event_time, location,
      customer_address, location_address, locations, consultation_date, consultation_type, gallery_url, offer_url, contract_url, invoice_url,
      portal_enabled, portal_password, portal_published_at, contract_status,
      booked_services, custom_services, tasks, portal_visibility, portal_messages, notes, portal_intro
    ) VALUES (
      ${customer.id}, ${customer.portalToken}, ${customer.sourceInquiryId}, ${customer.createdAt || nowIso()},
      now(), ${customer.status}, ${customer.name}, ${customer.brideName}, ${customer.groomName}, ${customer.email}, ${customer.phone}, ${customer.category},
      ${customer.eventDate}, ${customer.eventTime}, ${customer.location}, ${customer.customerAddress}, ${customer.locationAddress},
      ${JSON.stringify(customer.locations || [])}::jsonb, ${customer.consultationDate}, ${customer.consultationType},
      ${customer.galleryUrl}, ${customer.offerUrl}, ${customer.contractUrl}, ${customer.invoiceUrl},
      ${customer.portalEnabled || false}, ${customer.portalPassword || ""}, ${customer.portalPublishedAt || ""}, ${customer.contractStatus},
      ${JSON.stringify(customer.bookedServices || [])}::jsonb, ${JSON.stringify(customer.customServices || [])}::jsonb,
      ${JSON.stringify(customer.tasks || [])}::jsonb, ${JSON.stringify(customer.portalVisibility || DEFAULT_PORTAL_VISIBILITY)}::jsonb,
      ${JSON.stringify(customer.portalMessages || [])}::jsonb, ${customer.notes}, ${customer.portalIntro}
    )
    ON CONFLICT (id) DO UPDATE SET
      source_inquiry_id = EXCLUDED.source_inquiry_id,
      updated_at = now(),
      status = EXCLUDED.status,
      name = EXCLUDED.name,
      bride_name = EXCLUDED.bride_name,
      groom_name = EXCLUDED.groom_name,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      category = EXCLUDED.category,
      event_date = EXCLUDED.event_date,
      event_time = EXCLUDED.event_time,
      location = EXCLUDED.location,
      customer_address = EXCLUDED.customer_address,
      location_address = EXCLUDED.location_address,
      locations = EXCLUDED.locations,
      consultation_date = EXCLUDED.consultation_date,
      consultation_type = EXCLUDED.consultation_type,
      gallery_url = EXCLUDED.gallery_url,
      offer_url = EXCLUDED.offer_url,
      contract_url = EXCLUDED.contract_url,
      invoice_url = EXCLUDED.invoice_url,
      portal_enabled = EXCLUDED.portal_enabled,
      portal_password = EXCLUDED.portal_password,
      portal_published_at = EXCLUDED.portal_published_at,
      contract_status = EXCLUDED.contract_status,
      booked_services = EXCLUDED.booked_services,
      custom_services = EXCLUDED.custom_services,
      tasks = EXCLUDED.tasks,
      portal_visibility = EXCLUDED.portal_visibility,
      portal_messages = EXCLUDED.portal_messages,
      notes = EXCLUDED.notes,
      portal_intro = EXCLUDED.portal_intro
    RETURNING *
  `;
  return mapCustomer(rows[0]);
}

export async function appendMailLog(log: MailLog) {
  await ensureMarioCrmSchema();
  await sql()`
    INSERT INTO mario_mail_logs (id, customer_id, template_key, recipient, subject, body, sent_at)
    VALUES (${log.id}, ${log.customerId}, ${log.templateKey}, ${log.to}, ${log.subject}, ${log.body}, ${log.sentAt})
  `;
}

export function applyTemplate(template: string, customer: CrmCustomer) {
  const firstName = customer.name.split(" ")[0] || customer.name || "du";
  const publicUrl = process.env.PUBLIC_URL || "https://marioschub.com";
  const signature = [
    "Mario Schubert",
    "Fotografie, Video und Fotospiegel",
    "",
    "Tirol & Bayern",
    "AT: +43 67763681543",
    "DE: +49 151 5533 8029",
    "Mail: servus@marioschub.com",
    "Web: www.marioschub.com",
    "WhatsApp: https://wa.me/4915155338029",
    "Instagram: @marioschub",
  ].join("\n");

  return template
    .replaceAll("{firstName}", firstName)
    .replaceAll("{fullName}", customer.name)
    .replaceAll("{shootingDate}", customer.eventDate || "")
    .replaceAll("{shootingTime}", customer.eventTime || "")
    .replaceAll("{consultationDate}", customer.consultationDate || "")
    .replaceAll("{portalUrl}", `${publicUrl}/kundenportal/${customer.portalToken}`)
    .replaceAll("{portalPassword}", customer.portalPassword || createPortalPassword(customer.eventDate))
    .replaceAll("{offerUrl}", customer.offerUrl || "")
    .replaceAll("{contractUrl}", customer.contractUrl || "")
    .replaceAll("{invoiceUrl}", customer.invoiceUrl || "")
    .replaceAll("{galleryUrl}", customer.galleryUrl || "")
    .replaceAll("{signature}", signature);
}
