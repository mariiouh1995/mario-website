import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";
import { google } from "googleapis";
import * as crm from "./crm-db.js";

type CrmCustomer = any;
type CustomerStatus = string;
type InquiryStatus = string;
type CustomerDocument = any;

function setCors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-password");
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
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

function driveClient() {
  const credentials = getDriveCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  return google.drive({ version: "v3", auth });
}

async function driveAccessToken() {
  const credentials = getDriveCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  const client = await auth.getClient();
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
      return res.status(200).json({ customer, workflow: crm.WORKFLOW });
    }

    if (!ensureAdmin(req, res)) return;

    if (req.method === "GET" && action === "bootstrap") {
      const [inquiries, customers] = await Promise.all([crm.listInquiries(), crm.listCustomers()]);
      return res.status(200).json({ inquiries, customers, workflow: crm.WORKFLOW, mailTemplates: crm.MAIL_TEMPLATES });
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
      if (!customer.email) return res.status(400).json({ error: "Customer has no email" });
      if (!subject || !body) return res.status(400).json({ error: "subject and body are required" });

      const renderedSubject = crm.applyTemplate(subject, customer);
      const renderedBody = ensureMarioSignature(crm.applyTemplate(body, customer));

      await createTransport().sendMail({
        from: `"Mario Schubert Photography" <${process.env.SMTP_USER}>`,
        to: customer.email,
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
        to: customer.email,
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
      if (!customer.email) return res.status(400).json({ error: "Customer has no email" });
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
        to: preparedCustomer.email,
        bcc: process.env.SMTP_USER,
        subject: renderedSubject,
        html: marioMailHtml(renderedBody),
        text: renderedBody,
      });

      await crm.appendMailLog({
        id: crm.createId("mail"),
        customerId: preparedCustomer.id,
        templateKey: "portal",
        to: preparedCustomer.email,
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
