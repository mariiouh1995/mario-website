import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";
import { google } from "googleapis";
import * as crm from "./crm-db.js";

type CrmCustomer = any;
type CustomerStatus = string;
type InquiryStatus = string;
type CustomerDocument = any;
type InspirationLink = any;
type ServiceItem = any;
type AddOnRequest = any;
type CrmOffer = crm.CrmOffer;

function setCors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-password");
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function moneyNumber(value: unknown) {
  const raw = normalizeString(value);
  if (!raw) return 0;
  const stripped = raw.replace(/[^\d,.]/g, "");
  if (!stripped) return 0;
  const lastComma = stripped.lastIndexOf(",");
  const lastDot = stripped.lastIndexOf(".");
  let normalized = stripped;
  if (lastComma >= 0 && lastDot >= 0) {
    const decimal = lastComma > lastDot ? "," : ".";
    const thousands = decimal === "," ? "." : ",";
    normalized = stripped.replace(new RegExp(`\\${thousands}`, "g"), "").replace(decimal, ".");
  } else if (lastComma >= 0 || lastDot >= 0) {
    const separator = lastComma >= 0 ? "," : ".";
    const parts = stripped.split(separator);
    const fraction = parts[parts.length - 1] || "";
    normalized = fraction.length > 0 && fraction.length <= 2 ? `${parts.slice(0, -1).join("")}.${fraction}` : parts.join("");
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatEuro(value: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);
}

function ensureAdmin(req: VercelRequest, res: VercelResponse) {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) {
    res.status(500).json({ error: "ADMIN_PASSWORD not configured" });
    return false;
  }
  const provided = normalizeString(req.headers["x-admin-password"]) || normalizeString(req.body?.password);
  if (provided !== configured) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    tls: { rejectUnauthorized: false },
  });
}

const MARIO_LOGO_URL = process.env.MARIO_MAIL_LOGO_URL || "https://ik.imagekit.io/r2yqrg6np/68e54b92f722d45170d60f24_Logo%20MS.svg";

function ensureMarioSignature(body: string) {
  return body.replace(/\n{0,2}\{signature\}\s*/gi, "").trim();
}

function mailHtml(body: string) {
  const escaped = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");

  return `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:620px;margin:0 auto;color:#24211f;background:#fff">
      <div style="padding:34px 20px 26px;text-align:center;border-bottom:1px solid #ece8e2">
        <img src="https://ik.imagekit.io/r2yqrg6np/68e54b92f722d45170d60f24_Logo%20MS.svg" alt="Mario Schubert Photography" style="height:38px" />
      </div>
      <div style="padding:34px 24px;font-size:15px;line-height:1.75;color:#4d4944">${escaped}</div>
      <div style="padding:22px 24px;border-top:1px solid #ece8e2;color:#8f8880;font-size:12px;line-height:1.6;text-align:center">
        Mario Schubert Photography<br/>
        Bäckerbühelgasse 14, 6020 Innsbruck<br/>
        servus@marioschub.com · marioschub.com
      </div>
    </div>
  `;
}

function marioMailHtml(body: string) {
  const escaped = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");

  return `
    <div style="margin:0;padding:28px 14px;background:#f4f0eb">
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:640px;margin:0 auto;color:#24211f;background:#fff;border:1px solid #ece8e2;border-radius:14px;overflow:hidden">
        <div style="padding:34px 24px 26px;text-align:center;border-bottom:1px solid #ece8e2;background:#f8f5f0">
          <span style="display:inline-block;background:#ffffff;border:1px solid #ece8e2;border-radius:12px;padding:10px 16px">
            <img src="${MARIO_LOGO_URL}" alt="Mario Schubert" style="display:block;height:44px;max-width:220px" />
          </span>
          <p style="margin:14px 0 0;color:#8f8880;font-size:12px;letter-spacing:2px;text-transform:uppercase">Fotografie, Video und Fotospiegel</p>
        </div>
        <div style="padding:36px 28px 30px;font-size:15px;line-height:1.78;color:#4d4944">${escaped}</div>
        <div style="padding:24px 28px 28px;border-top:1px solid #ece8e2;background:#faf8f5;color:#6f6860;font-size:12px;line-height:1.7">
          <table role="presentation" style="width:100%;border-collapse:collapse">
            <tr>
              <td style="vertical-align:top;width:92px;padding-right:18px">
                <img src="${MARIO_LOGO_URL}" alt="MS" style="width:74px;max-width:74px" />
              </td>
              <td style="vertical-align:top">
                <p style="margin:0 0 5px;color:#24211f;font-size:14px;font-weight:700">Mario Schubert</p>
                <p style="margin:0 0 12px">Fotografie, Video und Fotospiegel<br/>Tirol &amp; Bayern</p>
                <p style="margin:0">
                  AT: <a href="tel:+4367763681543" style="color:#4d4944;text-decoration:none">+43 67763681543</a><br/>
                  DE: <a href="tel:+4915155338029" style="color:#4d4944;text-decoration:none">+49 151 5533 8029</a><br/>
                  Mail: <a href="mailto:servus@marioschub.com" style="color:#4d4944;text-decoration:none">servus@marioschub.com</a><br/>
                  Web: <a href="https://www.marioschub.com" style="color:#4d4944;text-decoration:none">www.marioschub.com</a><br/>
                  WhatsApp: <a href="https://wa.me/4915155338029" style="color:#4d4944;text-decoration:none">https://wa.me/4915155338029</a><br/>
                  Instagram: <a href="https://instagram.com/marioschub" style="color:#4d4944;text-decoration:none">@marioschub</a>
                </p>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderInquiryTemplate(template: string, inquiry: { name: string; brideName?: string; email: string }) {
  const firstName = inquiry.brideName || inquiry.name.split(/[ &]+/)[0] || inquiry.name || "du";
  return template
    .replaceAll("{firstName}", firstName)
    .replaceAll("{name}", inquiry.name || "")
    .replaceAll("{email}", inquiry.email || "")
    .replaceAll("{signature}", "");
}

function getDriveCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_SERVICE_ACCOUNT_DRIVE;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not configured");
  try {
    const credentials = JSON.parse(raw);
    if (credentials.private_key) credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
    return credentials;
  } catch {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON");
  }
}

function driveAuth() {
  const clientId = normalizeString(process.env.GOOGLE_CLIENT_ID);
  const clientSecret = normalizeString(process.env.GOOGLE_CLIENT_SECRET);
  const refreshToken = normalizeString(process.env.GOOGLE_REFRESH_TOKEN);
  if (clientId && clientSecret && refreshToken) {
    const auth = new google.auth.OAuth2(clientId, clientSecret);
    auth.setCredentials({ refresh_token: refreshToken });
    return auth;
  }

  const credentials = getDriveCredentials();
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
}

function driveClient() {
  return google.drive({ version: "v3", auth: driveAuth() });
}

async function driveAccessToken() {
  const auth = driveAuth();
  const client = "getClient" in auth ? await auth.getClient() : auth;
  const token = await client.getAccessToken();
  const accessToken = typeof token === "string" ? token : token?.token;
  if (!accessToken) throw new Error("Google Drive access token could not be created");
  return accessToken;
}

async function ensureCustomerDriveFolder(customer: CrmCustomer) {
  const rootFolderId = normalizeString(process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID);
  if (!rootFolderId) throw new Error("GOOGLE_DRIVE_ROOT_FOLDER_ID is not configured");
  if (customer.driveFolderId) return customer.driveFolderId;

  const drive = driveClient();
  const folderName = `${customer.name || "Kunde"} - ${customer.id}`;
  const created = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [rootFolderId],
    },
    supportsAllDrives: true,
    fields: "id",
  });
  const folderId = created.data.id;
  if (!folderId) throw new Error("Google Drive folder could not be created");
  await crm.upsertCustomer({ ...customer, driveFolderId: folderId });
  return folderId;
}

async function uploadBufferToDrive(input: { folderId: string; fileName: string; mimeType: string; buffer: Buffer }) {
  const drive = driveClient();
  const created = await drive.files.create({
    requestBody: { name: input.fileName, parents: [input.folderId] },
    media: { mimeType: input.mimeType, body: Buffer.from(input.buffer) as any },
    supportsAllDrives: true,
    fields: "id, webViewLink",
  });
  const fileId = created.data.id;
  if (!fileId) throw new Error("Google Drive file could not be created");
  await drive.permissions.create({ fileId, supportsAllDrives: true, requestBody: { type: "anyone", role: "reader" } });
  const file = await drive.files.get({ fileId, supportsAllDrives: true, fields: "webViewLink" });
  return { fileId, url: file.data.webViewLink || created.data.webViewLink || "" };
}

function upsertDocument(customer: CrmCustomer, document: CustomerDocument) {
  const documents = customer.documents || [];
  const index = documents.findIndex((item: CustomerDocument) => item.id === document.id);
  if (index >= 0) return documents.map((item: CustomerDocument) => (item.id === document.id ? document : item));
  return [...documents, document];
}

async function deleteDriveFile(fileId?: string) {
  if (!fileId) return;
  try {
    await driveClient().files.delete({ fileId, supportsAllDrives: true });
  } catch (error: any) {
    if (error?.code !== 404) throw error;
  }
}

function customerMailRecipients(customer: CrmCustomer) {
  return [customer.email, customer.secondaryEmail].map(normalizeString).filter(Boolean);
}

async function getPortalCustomer(req: VercelRequest) {
  const token = normalizeString(req.body?.token) || normalizeString(req.query.token);
  const password = normalizeString(req.body?.password) || normalizeString(req.query.password);
  if (!token || !password) throw new Error("Portal token and password are required");
  const customer = await crm.getCustomerByToken(token);
  if (!customer || !customer.portalEnabled || password !== customer.portalPassword) throw new Error("Falsches Passwort");
  return customer;
}

async function createDriveUploadSession(customer: CrmCustomer, input: { title: string; kind: string; documentId: string; fileName: string; mimeType: string }) {
  const folderId = await ensureCustomerDriveFolder(customer);
  const accessToken = await driveAccessToken();
  const uploadResponse = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true&fields=id,webViewLink", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Type": input.mimeType,
    },
    body: JSON.stringify({ name: input.fileName, parents: [folderId] }),
  });
  if (!uploadResponse.ok) {
    const detail = await uploadResponse.text();
    throw new Error(`Google Drive upload session failed: ${detail || uploadResponse.statusText}`);
  }
  const uploadUrl = uploadResponse.headers.get("location");
  if (!uploadUrl) throw new Error("Google Drive upload session did not return an upload URL");
  return { uploadUrl, folderId, document: input };
}

async function uploadDriveChunk(input: { uploadUrl: string; mimeType: string; contentBase64: string; start: number; end: number; total: number }) {
  if (!input.uploadUrl.startsWith("https://www.googleapis.com/upload/drive/v3/files")) throw new Error("Invalid Google Drive upload URL");
  if (!input.contentBase64 || !Number.isFinite(input.start) || !Number.isFinite(input.end) || !Number.isFinite(input.total)) {
    throw new Error("chunk upload payload is incomplete");
  }

  const buffer = Buffer.from(input.contentBase64, "base64");
  const uploadResponse = await fetch(input.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": input.mimeType,
      "Content-Length": String(buffer.length),
      "Content-Range": `bytes ${input.start}-${input.end - 1}/${input.total}`,
    },
    body: buffer,
  });
  if (uploadResponse.status === 308) return { done: false };
  const data = await uploadResponse.json().catch(async () => ({ error: { message: await uploadResponse.text().catch(() => "") } }));
  if (!uploadResponse.ok) throw new Error(data?.error?.message || "Google Drive chunk upload failed");
  return { done: true, fileId: data.id };
}

async function finishDriveDocumentUpload(customer: CrmCustomer, input: { title: string; kind: string; documentId: string; fileName: string; mimeType: string; fileId: string }) {
  const existingDoc = (customer.documents || []).find((item: CustomerDocument) => item.id === input.documentId);
  if (existingDoc?.driveFileId && existingDoc.driveFileId !== input.fileId) await deleteDriveFile(existingDoc.driveFileId);
  const folderId = customer.driveFolderId || (await ensureCustomerDriveFolder(customer));
  const drive = driveClient();
  await drive.permissions.create({ fileId: input.fileId, supportsAllDrives: true, requestBody: { type: "anyone", role: "reader" } });
  const file = await drive.files.get({ fileId: input.fileId, supportsAllDrives: true, fields: "webViewLink" });
  const url = file.data.webViewLink || "";
  const document = { id: input.documentId, kind: input.kind, title: input.title, url, driveFileId: input.fileId, fileName: input.fileName, mimeType: input.mimeType, uploadedAt: new Date().toISOString() };
  const saved = await crm.upsertCustomer({
    ...customer,
    driveFolderId: folderId,
    documents: upsertDocument(customer, document),
    offerUrl: input.kind === "offer" ? url : customer.offerUrl,
    contractUrl: input.kind === "contract" ? url : customer.contractUrl,
    invoiceUrl: input.kind === "invoice" ? url : customer.invoiceUrl,
  });
  return { customer: saved, document };
}

function normalizeRequestedServices(items: unknown): ServiceItem[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((item: any) => ({
      id: normalizeString(item?.id) || crm.createId("addon_item"),
      name: normalizeString(item?.name),
      price: normalizeString(item?.price),
      type: "custom",
    }))
    .filter((item) => item.name);
}

function normalizeOfferItems(items: unknown) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item: any) => ({
      id: normalizeString(item?.id) || crm.createId("offer_item"),
      name: normalizeString(item?.name),
      description: normalizeString(item?.description),
      quantity: normalizeString(item?.quantity) || "1",
      unitPrice: normalizeString(item?.unitPrice || item?.price),
    }))
    .filter((item) => item.name);
}

function calculateOfferTotal(offer: Partial<CrmOffer>) {
  const itemTotal = normalizeOfferItems(offer.items || []).reduce((sum, item) => sum + moneyNumber(item.quantity || "1") * moneyNumber(item.unitPrice), 0);
  const travel = offer.travelKm ? moneyNumber(offer.travelKm) * moneyNumber(offer.travelRate || "0.60") : 0;
  return itemTotal + travel;
}

function offerFromSource(source: CrmCustomer | crm.CrmInquiry, sourceType: "customer" | "inquiry") {
  const services = sourceType === "customer"
    ? [...((source as CrmCustomer).bookedServices || []), ...((source as CrmCustomer).customServices || [])]
    : ((source as crm.CrmInquiry).selectedPackages || []);
  return {
    sourceType,
    sourceId: source.id,
    customerId: sourceType === "customer" ? source.id : "",
    inquiryId: sourceType === "inquiry" ? source.id : "",
    customerName: source.name || "",
    email: source.email || "",
    eventDate: source.eventDate || "",
    title: "Persönliches Angebot",
    introText: "Servus ihr Lieben,\n\nauf Basis eurer Anfrage habe ich euch ein persönliches Angebot zusammengestellt. Schaut in Ruhe drüber. Wenn alles passt, könnt ihr es direkt bestätigen - und wenn ihr noch etwas ändern möchtet, schreibt mir einfach kurz eure Wünsche dazu.",
    notes: "Alle Preise verstehen sich inklusive der jeweils gültigen Umsatzsteuer. Fahrtkosten können je nach Location separat ausgewiesen werden.",
    items: services.map((service: ServiceItem) => ({ id: crm.createId("offer_item"), name: service.name, description: "", quantity: "1", unitPrice: service.price || "" })),
    travelKm: "",
    travelRate: "0.60",
  };
}

function escapePdfText(value: string) {
  return normalizeString(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrapText(value: string, max = 72) {
  const lines: string[] = [];
  for (const paragraph of String(value || "").split("\n")) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let line = "";
    for (const word of words) {
      if ((line + " " + word).trim().length > max) {
        if (line) lines.push(line);
        line = word;
      } else {
        line = `${line} ${word}`.trim();
      }
    }
    if (line) lines.push(line);
    if (!words.length) lines.push("");
  }
  return lines;
}

function simplePdf(lines: string[]) {
  const content = [
    "BT",
    "/F1 10 Tf",
    "50 790 Td",
    "14 TL",
    ...lines.flatMap((line, index) => [
      index === 0 ? "" : "T*",
      `(${escapePdfText(line)}) Tj`,
    ]).filter(Boolean),
    "ET",
  ].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, "0")} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf, "utf8");
}

function renderOfferPdf(offer: CrmOffer) {
  const total = calculateOfferTotal(offer);
  const lines = [
    "Mario Schubert Photography",
    "Persoenliches Angebot",
    "",
    `Kunde: ${offer.customerName}`,
    offer.eventDate ? `Termin: ${offer.eventDate}` : "",
    `Datum: ${new Date().toLocaleDateString("de-DE")}`,
    "",
    ...wrapText(offer.introText, 82),
    "",
    "Leistungen",
    "---------------------------------------------",
    ...normalizeOfferItems(offer.items).flatMap((item) => {
      const amount = moneyNumber(item.quantity || "1") * moneyNumber(item.unitPrice);
      return [`${item.quantity || "1"} x ${item.name} - ${formatEuro(amount)}`, ...(item.description ? wrapText(item.description, 80) : [])];
    }),
    offer.travelKm ? `Fahrtkosten: ${offer.travelKm} km x ${offer.travelRate || "0.60"} EUR - ${formatEuro(moneyNumber(offer.travelKm) * moneyNumber(offer.travelRate || "0.60"))}` : "",
    "",
    `Gesamtsumme: ${formatEuro(total)}`,
    "",
    ...wrapText(offer.notes, 82),
    "",
    "Mario Schubert | Fotografie, Video und Fotospiegel | servus@marioschub.com | www.marioschub.com",
  ].filter((line) => line !== undefined);
  return simplePdf(lines);
}

async function sendOfferNotification(offer: CrmOffer) {
  if (!process.env.SMTP_USER) return;
  const body = [
    "Servus Mario,",
    "",
    `${offer.customerName || "Ein Kunde"} hat auf ein Angebot reagiert.`,
    "",
    `Status: ${offer.status}`,
    offer.responseMessage ? `Nachricht:\n${offer.responseMessage}` : "",
    "",
    "Du findest das Angebot im Admin unter Angebote.",
  ].filter(Boolean).join("\n");
  await createTransport().sendMail({
    from: `"Mario Website" <${process.env.SMTP_USER}>`,
    to: process.env.MARIO_NOTIFICATION_EMAIL || process.env.SMTP_USER,
    subject: `Angebot ${offer.status}: ${offer.customerName || "Kunde"}`,
    html: mailHtml(body),
    text: body,
  });
}

async function sendAddOnRequestNotification(customer: CrmCustomer, request: AddOnRequest) {
  if (!process.env.SMTP_USER) return;
  const items = (request.items || []).map((item: ServiceItem) => `- ${item.name}${item.price ? ` (${item.price} EUR)` : ""}`).join("\n");
  const body = [
    "Servus Mario,",
    "",
    `${customer.name || "Ein Kunde"} möchte zusätzliche Leistungen buchen:`,
    "",
    items || "- Keine Details",
    request.message ? `\nNachricht:\n${request.message}` : "",
    "",
    "Du findest die Anfrage direkt im Kundenprofil im Admin.",
  ].filter(Boolean).join("\n");
  await createTransport().sendMail({
    from: `"Mario Website" <${process.env.SMTP_USER}>`,
    to: process.env.MARIO_NOTIFICATION_EMAIL || process.env.SMTP_USER,
    subject: `Neue Leistungsanfrage: ${customer.name || "Kunde"}`,
    html: mailHtml(body),
    text: body,
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const action = normalizeString(req.query.action) || normalizeString(req.body?.action);

  try {
    if (action === "portal") {
      const token = normalizeString(req.query.token);
      const password = normalizeString(req.query.password);
      if (!token) return res.status(400).json({ error: "token is required" });
      const customer = await crm.getCustomerByToken(token);
      if (!customer) return res.status(404).json({ error: "Portal not found" });
      if (!customer.portalEnabled) return res.status(404).json({ error: "Portal not published" });
      if (!password) return res.status(200).json({ requiresPassword: true, workflow: crm.WORKFLOW });
      if (password !== customer.portalPassword) return res.status(401).json({ requiresPassword: true, error: "Falsches Passwort" });
      const serviceCatalog = await crm.getServiceCatalog();
      const offers = (await crm.listOffers()).filter((offer) => offer.customerId === customer.id && offer.status !== "entwurf");
      return res.status(200).json({ customer, offers, workflow: crm.WORKFLOW, serviceCatalog: serviceCatalog.filter((item) => item.active !== false) });
    }

    if (req.method === "POST" && action === "portal-inspiration-links") {
      const customer = await getPortalCustomer(req);
      const links = Array.isArray(req.body?.inspirationLinks) ? req.body.inspirationLinks : [];
      const inspirationLinks = links
        .map((item: InspirationLink) => ({
          id: normalizeString(item.id) || crm.createId("insp"),
          title: normalizeString(item.title) || "Inspiration",
          url: normalizeString(item.url),
        }))
        .filter((item: InspirationLink) => item.url);
      const saved = await crm.upsertCustomer({ ...customer, inspirationLinks });
      return res.status(200).json({ customer: saved });
    }

    if (req.method === "POST" && action === "portal-add-on-request") {
      const customer = await getPortalCustomer(req);
      const items = normalizeRequestedServices(req.body?.items);
      const message = normalizeString(req.body?.message);
      if (items.length === 0) return res.status(400).json({ error: "Bitte mindestens eine Leistung auswählen" });
      const request = {
        id: crm.createId("addon_req"),
        createdAt: new Date().toISOString(),
        status: "neu",
        items,
        message,
      };
      const saved = await crm.upsertCustomer({ ...customer, addOnRequests: [...(customer.addOnRequests || []), request] });
      await sendAddOnRequestNotification(saved, request);
      return res.status(200).json({ customer: saved, request });
    }

    if (req.method === "POST" && action === "portal-upload-document") {
      const customer = await getPortalCustomer(req);
      const title = normalizeString(req.body?.title) || "Unterzeichneter Vertrag";
      const kind = normalizeString(req.body?.kind) || "signed_contract";
      const documentId = normalizeString(req.body?.documentId) || "doc-signed-contract";
      const fileName = normalizeString(req.body?.fileName) || `${title}.pdf`;
      const mimeType = normalizeString(req.body?.mimeType) || "application/octet-stream";
      const session = await createDriveUploadSession(customer, { title, kind, documentId, fileName, mimeType });
      return res.status(200).json(session);
    }

    if (req.method === "POST" && action === "portal-upload-document-chunk") {
      await getPortalCustomer(req);
      const result = await uploadDriveChunk({
        uploadUrl: normalizeString(req.body?.uploadUrl),
        mimeType: normalizeString(req.body?.mimeType) || "application/octet-stream",
        contentBase64: normalizeString(req.body?.contentBase64),
        start: Number(req.body?.start),
        end: Number(req.body?.end),
        total: Number(req.body?.total),
      });
      return res.status(200).json(result);
    }

    if (req.method === "POST" && action === "portal-finish-document-upload") {
      const customer = await getPortalCustomer(req);
      const fileId = normalizeString(req.body?.fileId);
      if (!fileId) return res.status(400).json({ error: "fileId is required" });
      const result = await finishDriveDocumentUpload(customer, {
        title: normalizeString(req.body?.title) || "Unterzeichneter Vertrag",
        kind: normalizeString(req.body?.kind) || "signed_contract",
        documentId: normalizeString(req.body?.documentId) || "doc-signed-contract",
        fileName: normalizeString(req.body?.fileName) || "Unterzeichneter Vertrag.pdf",
        mimeType: normalizeString(req.body?.mimeType) || "application/octet-stream",
        fileId,
      });
      if (process.env.SMTP_USER) {
        const body = [
          "Servus Mario,",
          "",
          `${customer.name || "Ein Kunde"} hat im Kundenportal einen unterzeichneten Vertrag hochgeladen.`,
          "",
          `Datei: ${result.document.fileName || result.document.title}`,
          `Link: ${result.document.url}`,
        ].join("\n");
        await createTransport().sendMail({
          from: `"Mario Website" <${process.env.SMTP_USER}>`,
          to: process.env.MARIO_NOTIFICATION_EMAIL || process.env.SMTP_USER,
          subject: `Unterzeichneter Vertrag hochgeladen: ${customer.name || "Kunde"}`,
          html: mailHtml(body),
          text: body,
        });
      }
      return res.status(200).json(result);
    }

    if (req.method === "GET" && action === "public-offer") {
      const token = normalizeString(req.query.token);
      if (!token) return res.status(400).json({ error: "token is required" });
      const offer = await crm.getOfferByToken(token);
      if (!offer || offer.status === "entwurf") return res.status(404).json({ error: "Angebot nicht gefunden" });
      return res.status(200).json({ offer });
    }

    if (req.method === "POST" && action === "offer-response") {
      const token = normalizeString(req.body?.token);
      const status = normalizeString(req.body?.status) as CrmOffer["status"];
      const responseMessage = normalizeString(req.body?.responseMessage);
      if (!["angenommen", "abgelehnt", "aenderungswunsch"].includes(status)) return res.status(400).json({ error: "Ungültiger Status" });
      const offer = await crm.getOfferByToken(token);
      if (!offer || offer.status === "entwurf") return res.status(404).json({ error: "Angebot nicht gefunden" });
      const saved = await crm.upsertOffer({ ...offer, status, responseMessage, respondedAt: new Date().toISOString() });
      await sendOfferNotification(saved);
      return res.status(200).json({ offer: saved });
    }

    if (!ensureAdmin(req, res)) return;

    if (req.method === "GET" && action === "bootstrap") {
      const [inquiries, customers, serviceCatalog, offers] = await Promise.all([crm.listInquiries(), crm.listCustomers(), crm.getServiceCatalog(), crm.listOffers()]);
      return res.status(200).json({ inquiries, customers, offers, workflow: crm.WORKFLOW, mailTemplates: crm.MAIL_TEMPLATES, serviceCatalog });
    }

    if (req.method === "POST" && action === "create-offer") {
      const sourceType = normalizeString(req.body?.sourceType) === "inquiry" ? "inquiry" : "customer";
      const sourceId = normalizeString(req.body?.sourceId);
      if (!sourceId) return res.status(400).json({ error: "sourceId is required" });
      const source = sourceType === "customer" ? await crm.getCustomer(sourceId) : (await crm.listInquiries()).find((item) => item.id === sourceId);
      if (!source) return res.status(404).json({ error: "Quelle nicht gefunden" });
      const base = offerFromSource(source as any, sourceType);
      const offer = await crm.upsertOffer({ ...base, total: String(calculateOfferTotal(base)) });
      return res.status(201).json({ offer });
    }

    if (req.method === "PUT" && action === "offer") {
      const input = req.body?.offer as Partial<CrmOffer>;
      if (!input?.id) return res.status(400).json({ error: "offer.id is required" });
      const existing = await crm.getOffer(input.id);
      if (!existing) return res.status(404).json({ error: "Offer not found" });
      const saved = await crm.upsertOffer({ ...existing, ...input, items: normalizeOfferItems(input.items), total: String(calculateOfferTotal(input)) });
      return res.status(200).json({ offer: saved });
    }

    if (req.method === "POST" && action === "send-offer") {
      const offerId = normalizeString(req.body?.offerId);
      const subject = normalizeString(req.body?.subject) || "Euer persönliches Angebot";
      const body = normalizeString(req.body?.body) || "Servus ihr Lieben,\n\nich habe euch euer persönliches Angebot vorbereitet. Ihr könnt es euch über den Link in Ruhe ansehen und direkt annehmen, ablehnen oder Änderungswünsche schicken.\n\n{offerUrl}\n\nIch freue mich von euch zu hören.";
      const offer = await crm.getOffer(offerId);
      if (!offer) return res.status(404).json({ error: "Offer not found" });
      if (!offer.email) return res.status(400).json({ error: "Angebot hat keine E-Mail-Adresse" });

      const prepared = await crm.upsertOffer({ ...offer, total: String(calculateOfferTotal(offer)) });
      const pdfBuffer = renderOfferPdf(prepared);
      const offerCustomer = prepared.customerId ? await crm.getCustomer(prepared.customerId) : null;
      const folderId = offerCustomer
        ? await ensureCustomerDriveFolder(offerCustomer)
        : normalizeString(process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID);
      if (!folderId) throw new Error("GOOGLE_DRIVE_ROOT_FOLDER_ID is not configured");
      if (prepared.driveFileId) await deleteDriveFile(prepared.driveFileId);
      const uploaded = await uploadBufferToDrive({ folderId, fileName: `${prepared.customerName || "Angebot"} - Angebot.pdf`, mimeType: "application/pdf", buffer: pdfBuffer });
      const publicUrl = process.env.PUBLIC_URL || "https://www.marioschub.com";
      const saved = await crm.upsertOffer({ ...prepared, status: "gesendet", sentAt: new Date().toISOString(), pdfUrl: uploaded.url, driveFileId: uploaded.fileId });

      if (saved.customerId) {
        const customer = await crm.getCustomer(saved.customerId);
        if (customer) {
          const document = { id: `doc-offer-${saved.id}`, kind: "offer", title: saved.title || "Angebot", url: uploaded.url, driveFileId: uploaded.fileId, fileName: "Angebot.pdf", mimeType: "application/pdf", uploadedAt: new Date().toISOString() };
          await crm.upsertCustomer({ ...customer, offerUrl: uploaded.url, documents: upsertDocument(customer, document), status: "angebot" as CustomerStatus });
        }
      }
      if (saved.inquiryId) await crm.updateInquiryStatus(saved.inquiryId, "angebot");

      const offerUrl = `${publicUrl}/angebot/${saved.publicToken}`;
      const renderedBody = body.replaceAll("{offerUrl}", offerUrl).replaceAll("{customerName}", saved.customerName || "");
      await createTransport().sendMail({
        from: `"Mario Schubert Photography" <${process.env.SMTP_USER}>`,
        to: saved.email,
        bcc: process.env.SMTP_USER,
        subject,
        html: marioMailHtml(renderedBody),
        text: renderedBody,
        attachments: uploaded.url ? [{ filename: "Angebot.pdf", path: uploaded.url }] : undefined,
      });
      return res.status(200).json({ offer: saved, offerUrl });
    }

    if (req.method === "POST" && action === "delete-offer") {
      const offerId = normalizeString(req.body?.offerId);
      const offer = await crm.getOffer(offerId);
      if (!offer) return res.status(404).json({ error: "Offer not found" });
      if (offer.driveFileId) await deleteDriveFile(offer.driveFileId);
      await crm.deleteOffer(offer.id);
      return res.status(200).json({ success: true });
    }

    if (req.method === "PUT" && action === "service-catalog") {
      const serviceCatalog = await crm.saveServiceCatalog(req.body?.serviceCatalog || []);
      return res.status(200).json({ serviceCatalog });
    }

    if (req.method === "POST" && action === "resolve-add-on-request") {
      const customerId = normalizeString(req.body?.customerId);
      const requestId = normalizeString(req.body?.requestId);
      const status = normalizeString(req.body?.status) || "akzeptiert";
      const customer = await crm.getCustomer(customerId);
      if (!customer) return res.status(404).json({ error: "Customer not found" });
      const requests = customer.addOnRequests || [];
      const request = requests.find((item: AddOnRequest) => item.id === requestId);
      if (!request) return res.status(404).json({ error: "Add-on request not found" });
      const items = normalizeRequestedServices(req.body?.items).map((item: ServiceItem) => ({ ...item, id: item.id.startsWith("addon_item") ? item.id : crm.createId("service") }));
      const updatedRequests = requests.map((item: AddOnRequest) => (item.id === requestId ? { ...item, status, items: items.length ? items : item.items } : item));
      const saved = await crm.upsertCustomer({
        ...customer,
        addOnRequests: updatedRequests,
        customServices: status === "akzeptiert" ? [...(customer.customServices || []), ...(items.length ? items : request.items)] : customer.customServices || [],
      });
      return res.status(200).json({ customer: saved });
    }

    if (req.method === "POST" && action === "customer") {
      const customer = await crm.appendCustomer(req.body?.customer || {});
      return res.status(201).json({ customer });
    }

    if (req.method === "PUT" && action === "customer") {
      const customer = req.body?.customer as CrmCustomer | undefined;
      if (!customer?.id) return res.status(400).json({ error: "customer.id is required" });
      const saved = await crm.upsertCustomer(customer);
      return res.status(200).json({ customer: saved });
    }

    if (req.method === "POST" && action === "convert-inquiry") {
      const inquiryId = normalizeString(req.body?.inquiryId);
      const inquiries = await crm.listInquiries();
      const inquiry = inquiries.find((item) => item.id === inquiryId);
      if (!inquiry) return res.status(404).json({ error: "Inquiry not found" });
      const customer = await crm.appendCustomer({
        sourceInquiryId: inquiry.id,
        status: "anfrage",
        name: inquiry.name,
        brideName: inquiry.brideName,
        groomName: inquiry.groomName,
        email: inquiry.email,
        phone: inquiry.phone,
        category: inquiry.category,
        eventDate: inquiry.eventDate,
        customerAddress: inquiry.customerAddress,
        locationAddress: inquiry.locationAddress,
        locations: inquiry.locations,
        bookedServices: inquiry.selectedPackages,
        notes: inquiry.message,
      });
      await crm.updateInquiryStatus(inquiry.id, "umgewandelt", customer.id);
      return res.status(201).json({ customer });
    }

    if (req.method === "PUT" && action === "inquiry-status") {
      const id = normalizeString(req.body?.id);
      const status = normalizeString(req.body?.status) as InquiryStatus;
      const inquiry = await crm.updateInquiryStatus(id, status);
      if (!inquiry) return res.status(404).json({ error: "Inquiry not found" });
      return res.status(200).json({ inquiry });
    }

    if (req.method === "POST" && action === "delete-inquiry") {
      const id = normalizeString(req.body?.id);
      if (!id) return res.status(400).json({ error: "id is required" });
      await crm.deleteInquiry(id);
      return res.status(200).json({ success: true });
    }

    if (req.method === "POST" && action === "delete-customer") {
      const id = normalizeString(req.body?.id);
      if (!id) return res.status(400).json({ error: "id is required" });
      await crm.deleteCustomer(id);
      return res.status(200).json({ success: true });
    }

    if (req.method === "POST" && action === "upload-document") {
      const customerId = normalizeString(req.body?.customerId);
      const title = normalizeString(req.body?.title) || "Dokument";
      const kind = normalizeString(req.body?.kind) || "custom";
      const documentId = normalizeString(req.body?.documentId) || (kind === "custom" ? crm.createId("doc") : `doc-${kind}`);
      const fileName = normalizeString(req.body?.fileName) || `${title}.pdf`;
      const mimeType = normalizeString(req.body?.mimeType) || "application/octet-stream";
      if (!customerId) return res.status(400).json({ error: "customerId is required" });
      const customer = await crm.getCustomer(customerId);
      if (!customer) return res.status(404).json({ error: "Customer not found" });

      const folderId = await ensureCustomerDriveFolder(customer);
      const accessToken = await driveAccessToken();
      const uploadResponse = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true&fields=id,webViewLink", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
          "X-Upload-Content-Type": mimeType,
        },
        body: JSON.stringify({ name: fileName, parents: [folderId] }),
      });
      if (!uploadResponse.ok) {
        const detail = await uploadResponse.text();
        throw new Error(`Google Drive upload session failed: ${detail || uploadResponse.statusText}`);
      }
      const uploadUrl = uploadResponse.headers.get("location");
      if (!uploadUrl) throw new Error("Google Drive upload session did not return an upload URL");
      return res.status(200).json({ uploadUrl, document: { id: documentId, kind, title, fileName, mimeType }, folderId });
    }

    if (req.method === "POST" && action === "upload-document-chunk") {
      const uploadUrl = normalizeString(req.body?.uploadUrl);
      const mimeType = normalizeString(req.body?.mimeType) || "application/octet-stream";
      const contentBase64 = normalizeString(req.body?.contentBase64);
      const start = Number(req.body?.start);
      const end = Number(req.body?.end);
      const total = Number(req.body?.total);
      if (!uploadUrl.startsWith("https://www.googleapis.com/upload/drive/v3/files")) return res.status(400).json({ error: "Invalid Google Drive upload URL" });
      if (!contentBase64 || !Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(total)) {
        return res.status(400).json({ error: "chunk upload payload is incomplete" });
      }

      const buffer = Buffer.from(contentBase64, "base64");
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": mimeType,
          "Content-Length": String(buffer.length),
          "Content-Range": `bytes ${start}-${end - 1}/${total}`,
        },
        body: buffer,
      });
      if (uploadResponse.status === 308) return res.status(200).json({ done: false });
      const data = await uploadResponse.json().catch(async () => ({ error: { message: await uploadResponse.text().catch(() => "") } }));
      if (!uploadResponse.ok) throw new Error(data?.error?.message || "Google Drive chunk upload failed");
      return res.status(200).json({ done: true, fileId: data.id });
    }

    if (req.method === "POST" && action === "finish-document-upload") {
      const customerId = normalizeString(req.body?.customerId);
      const title = normalizeString(req.body?.title) || "Dokument";
      const kind = normalizeString(req.body?.kind) || "custom";
      const documentId = normalizeString(req.body?.documentId) || (kind === "custom" ? crm.createId("doc") : `doc-${kind}`);
      const fileName = normalizeString(req.body?.fileName) || `${title}.pdf`;
      const mimeType = normalizeString(req.body?.mimeType) || "application/octet-stream";
      const fileId = normalizeString(req.body?.fileId);
      if (!customerId || !fileId) return res.status(400).json({ error: "customerId and fileId are required" });
      const customer = await crm.getCustomer(customerId);
      if (!customer) return res.status(404).json({ error: "Customer not found" });

      const existingDoc = (customer.documents || []).find((item: CustomerDocument) => item.id === documentId);
      if (existingDoc?.driveFileId && existingDoc.driveFileId !== fileId) await deleteDriveFile(existingDoc.driveFileId);
      const folderId = customer.driveFolderId || (await ensureCustomerDriveFolder(customer));
      const drive = driveClient();
      await drive.permissions.create({ fileId, supportsAllDrives: true, requestBody: { type: "anyone", role: "reader" } });
      const file = await drive.files.get({ fileId, supportsAllDrives: true, fields: "webViewLink" });
      const url = file.data.webViewLink || "";
      const document = { id: documentId, kind, title, url, driveFileId: fileId, fileName, mimeType, uploadedAt: new Date().toISOString() };
      const saved = await crm.upsertCustomer({
        ...customer,
        driveFolderId: folderId,
        documents: upsertDocument(customer, document),
        offerUrl: kind === "offer" ? url : customer.offerUrl,
        contractUrl: kind === "contract" ? url : customer.contractUrl,
        invoiceUrl: kind === "invoice" ? url : customer.invoiceUrl,
      });
      return res.status(200).json({ customer: saved, document });
    }

    if (req.method === "POST" && action === "delete-document") {
      const customerId = normalizeString(req.body?.customerId);
      const documentId = normalizeString(req.body?.documentId);
      if (!customerId || !documentId) return res.status(400).json({ error: "customerId and documentId are required" });
      const customer = await crm.getCustomer(customerId);
      if (!customer) return res.status(404).json({ error: "Customer not found" });
      const document = (customer.documents || []).find((item: CustomerDocument) => item.id === documentId);
      if (document?.driveFileId) await deleteDriveFile(document.driveFileId);
      const kind = document?.kind || documentId.replace("doc-", "");
      const saved = await crm.upsertCustomer({
        ...customer,
        documents: (customer.documents || []).filter((item: CustomerDocument) => item.id !== documentId),
        offerUrl: kind === "offer" ? "" : customer.offerUrl,
        contractUrl: kind === "contract" ? "" : customer.contractUrl,
        invoiceUrl: kind === "invoice" ? "" : customer.invoiceUrl,
      });
      return res.status(200).json({ customer: saved });
    }

    if (req.method === "POST" && action === "send-inquiry-mail") {
      const inquiryId = normalizeString(req.body?.inquiryId);
      const templateKey = normalizeString(req.body?.templateKey);
      const subject = normalizeString(req.body?.subject);
      const body = normalizeString(req.body?.body);
      const attachmentUrl = normalizeString(req.body?.attachmentUrl);
      const attachmentName = normalizeString(req.body?.attachmentName) || "Anhang";
      const inquiry = (await crm.listInquiries()).find((item) => item.id === inquiryId);
      if (!inquiry) return res.status(404).json({ error: "Inquiry not found" });
      if (!inquiry.email) return res.status(400).json({ error: "Inquiry has no email" });
      if (!subject || !body) return res.status(400).json({ error: "subject and body are required" });

      const renderedSubject = renderInquiryTemplate(subject, inquiry);
      const renderedBody = ensureMarioSignature(renderInquiryTemplate(body, inquiry));

      await createTransport().sendMail({
        from: `"Mario Schubert Photography" <${process.env.SMTP_USER}>`,
        to: inquiry.email,
        bcc: process.env.SMTP_USER,
        subject: renderedSubject,
        html: marioMailHtml(renderedBody),
        text: renderedBody,
        attachments: attachmentUrl ? [{ filename: attachmentName, path: attachmentUrl }] : undefined,
      });

      await crm.appendMailLog({
        id: crm.createId("mail"),
        customerId: inquiry.id,
        templateKey,
        to: inquiry.email,
        subject: renderedSubject,
        body: renderedBody,
        sentAt: new Date().toISOString(),
      });

      return res.status(200).json({ success: true });
    }

    if (req.method === "POST" && action === "send-mail") {
      const customerId = normalizeString(req.body?.customerId);
      const templateKey = normalizeString(req.body?.templateKey);
      const subject = normalizeString(req.body?.subject);
      const body = normalizeString(req.body?.body);
      const attachmentUrl = normalizeString(req.body?.attachmentUrl);
      const attachmentName = normalizeString(req.body?.attachmentName) || "Anhang";
      const customer = await crm.getCustomer(customerId);
      if (!customer) return res.status(404).json({ error: "Customer not found" });
      const recipients = customerMailRecipients(customer);
      if (recipients.length === 0) return res.status(400).json({ error: "Customer has no email" });
      if (!subject || !body) return res.status(400).json({ error: "subject and body are required" });

      const renderedSubject = crm.applyTemplate(subject, customer);
      const renderedBody = ensureMarioSignature(crm.applyTemplate(body, customer));

      await createTransport().sendMail({
        from: `"Mario Schubert Photography" <${process.env.SMTP_USER}>`,
        to: recipients,
        bcc: process.env.SMTP_USER,
        subject: renderedSubject,
        html: marioMailHtml(renderedBody),
        text: renderedBody,
        attachments: attachmentUrl ? [{ filename: attachmentName, path: attachmentUrl }] : undefined,
      });

      await crm.appendMailLog({
        id: crm.createId("mail"),
        customerId: customer.id,
        templateKey,
        to: recipients.join(", "),
        subject: renderedSubject,
        body: renderedBody,
        sentAt: new Date().toISOString(),
      });

      const updates: Partial<CrmCustomer> = {};
      if (templateKey === "contract") {
        updates.contractStatus = "gesendet";
        updates.status = "vertrag" as CustomerStatus;
      }
      if (templateKey === "gallery") updates.status = "galerie" as CustomerStatus;
      if (Object.keys(updates).length > 0) {
        await crm.upsertCustomer({ ...customer, ...updates });
      }

      return res.status(200).json({ success: true });
    }

    if (req.method === "POST" && action === "provision-portal") {
      const customerId = normalizeString(req.body?.customerId);
      const customer = await crm.getCustomer(customerId);
      if (!customer) return res.status(404).json({ error: "Customer not found" });
      const recipients = customerMailRecipients(customer);
      if (recipients.length === 0) return res.status(400).json({ error: "Customer has no email" });
      const portalPassword = crm.createPortalPassword(customer.eventDate);
      if (!portalPassword) return res.status(400).json({ error: "Customer eventDate is required for portal password" });
      const preparedCustomer = await crm.upsertCustomer({
        ...customer,
        portalEnabled: true,
        portalPassword,
        portalPublishedAt: new Date().toISOString(),
      });
      const template = crm.MAIL_TEMPLATES.portal;
      const renderedSubject = crm.applyTemplate(normalizeString(req.body?.subject) || template.subject, preparedCustomer);
      const renderedBody = ensureMarioSignature(crm.applyTemplate(normalizeString(req.body?.body) || template.body, preparedCustomer));

      await createTransport().sendMail({
        from: `"Mario Schubert Photography" <${process.env.SMTP_USER}>`,
        to: recipients,
        bcc: process.env.SMTP_USER,
        subject: renderedSubject,
        html: marioMailHtml(renderedBody),
        text: renderedBody,
      });

      await crm.appendMailLog({
        id: crm.createId("mail"),
        customerId: preparedCustomer.id,
        templateKey: "portal",
        to: recipients.join(", "),
        subject: renderedSubject,
        body: renderedBody,
        sentAt: new Date().toISOString(),
      });

      return res.status(200).json({ customer: preparedCustomer, portalPassword });
    }

    return res.status(404).json({ error: "Unknown CRM action" });
  } catch (error: any) {
    console.error("mario-crm error", error);
    const detail = error?.response?.data?.error_description || error?.response?.data?.error?.message || error?.errors?.[0]?.message || error?.message;
    return res.status(500).json({ error: detail || "Internal server error" });
  }
}
