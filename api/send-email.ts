import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";

// ── CORS Headers ──
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const MARIO_LOGO_URL = process.env.MARIO_MAIL_LOGO_URL || "https://ik.imagekit.io/r2yqrg6np/68e54b92f722d45170d60f24_Logo%20MS.svg";
const MARIO_SIGNATURE_TEXT = [
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

function escapeHtml(value: string | undefined): string {
  return (value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildMarioSignatureHtml() {
  return `
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
  `;
}

// ── Build package summary HTML for emails ──
function buildPackageSummaryHtml(
  selectedPackages: { name: string; price: string }[] | undefined,
  selectedAddons: string[] | undefined,
  estimatedTotal: string | undefined,
  style: "mario" | "customer"
): string {
  const hasPkgs = selectedPackages && selectedPackages.length > 0;
  const hasAddons = selectedAddons && selectedAddons.length > 0;
  if (!hasPkgs && !hasAddons) return "";

  const borderColor = style === "mario" ? "#333" : "#333";
  const bgColor = style === "mario" ? "#f8f7f5" : "#f8f7f5";

  let html = `
    <div style="background:${bgColor};border-left:3px solid ${borderColor};padding:20px;margin:20px 0">
      <p style="margin:0 0 12px;font-weight:600;font-size:14px;color:#333;text-transform:uppercase;letter-spacing:1px">
        ${style === "mario" ? "Paketauswahl" : "Eure Auswahl"}
      </p>
      <table style="border-collapse:collapse;width:100%">
  `;

  if (hasPkgs) {
    for (const pkg of selectedPackages!) {
      html += `
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#555;border-bottom:1px solid rgba(0,0,0,0.06)">${pkg.name}</td>
          <td style="padding:6px 0;font-size:14px;color:#333;text-align:right;font-weight:500;border-bottom:1px solid rgba(0,0,0,0.06);white-space:nowrap">${pkg.price}</td>
        </tr>
      `;
    }
  }

  if (hasAddons) {
    for (const addon of selectedAddons!) {
      html += `
        <tr>
          <td colspan="2" style="padding:5px 0;font-size:13px;color:#777;border-bottom:1px solid rgba(0,0,0,0.04)">+ ${addon}</td>
        </tr>
      `;
    }
  }

  if (estimatedTotal) {
    html += `
      <tr>
        <td style="padding:12px 0 4px;font-size:14px;font-weight:700;color:#111;border-top:2px solid rgba(0,0,0,0.1)">Geschätzter Gesamtpreis</td>
        <td style="padding:12px 0 4px;font-size:18px;font-weight:700;color:#111;text-align:right;border-top:2px solid rgba(0,0,0,0.1);white-space:nowrap;font-family:Georgia,serif">${estimatedTotal}</td>
      </tr>
    `;
  }

  html += `
      </table>
      <p style="margin:10px 0 0;font-size:11px;color:#aaa;font-style:italic">
        * Unverbindliche Schätzung. Der finale Preis wird individuell besprochen.
      </p>
    </div>
  `;

  return html;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).setHeader("Access-Control-Allow-Origin", "*").end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    name,
    email,
    phone,
    foundVia,
    interests,
    date,
    weddingGuide,
    message,
    selectedPackages,
    selectedAddons,
    estimatedTotal,
    meetingDate,
    meetingType,
  } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ error: "Name, email, and phone are required" });
  }

  // ── SMTP Transporter (IONOS) ──
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,        // smtp.ionos.de
    port: Number(process.env.SMTP_PORT), // 587
    secure: false,
    auth: {
      user: process.env.SMTP_USER,       // servus@marioschub.com
      pass: process.env.SMTP_PASS,
    },
    tls: {
      ciphers: "SSLv3",
      rejectUnauthorized: false,
    },
  });

  const interestsText = (interests || []).join(", ") || "\u2013";
  const firstName = name.split(" ")[0];
  const packageSummaryMario = buildPackageSummaryHtml(selectedPackages, selectedAddons, estimatedTotal, "mario");
  const packageSummaryCustomer = buildPackageSummaryHtml(selectedPackages, selectedAddons, estimatedTotal, "customer");
  const hasPackageSelection = (selectedPackages && selectedPackages.length > 0) || (selectedAddons && selectedAddons.length > 0);

  // ── Email to Mario ──
  const mailToMario = {
    from: `"Mario Schubert Photography" <${process.env.SMTP_USER}>`,
    to: process.env.SMTP_USER,
    replyTo: email,
    subject: `Neue Anfrage von ${name} \u2013 ${interestsText}${estimatedTotal ? ` (\u2248 ${estimatedTotal})` : ""}`,
    text: [
      `Neue Anfrage von ${name}`,
      `E-Mail: ${email}`,
      `Telefon: ${phone}`,
      `Interesse: ${interestsText}`,
      `Datum: ${date || "-"}`,
      `Nachricht: ${message || "-"}`,
    ].join("\n"),
    html: `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:650px;margin:0 auto;color:#333">
        <h2 style="font-family:Georgia,serif;font-weight:300;font-size:24px;border-bottom:1px solid #eee;padding-bottom:16px">Neue Anfrage über die Website</h2>
        <table style="border-collapse:collapse;width:100%;margin:20px 0">
          <tr><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-weight:600;width:180px;vertical-align:top">Name</td><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0">${name}</td></tr>
          <tr><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-weight:600;vertical-align:top">E-Mail</td><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0"><a href="mailto:${email}" style="color:#333">${email}</a></td></tr>
          <tr><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-weight:600;vertical-align:top">Telefon</td><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0">${phone}</td></tr>
          <tr><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-weight:600;vertical-align:top">Gefunden über</td><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0">${foundVia || "\u2013"}</td></tr>
          <tr><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-weight:600;vertical-align:top">Interesse</td><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0">${interestsText}</td></tr>
          <tr><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-weight:600;vertical-align:top">Datum</td><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0">${date || "\u2013"}</td></tr>
          <tr><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-weight:600;vertical-align:top">Wedding Guide</td><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0">${weddingGuide ? "Ja, bitte zusenden" : "Nein"}</td></tr>
          <tr><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-weight:600;vertical-align:top">Termin</td><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0">${meetingDate || "\u2013"}</td></tr>
          <tr><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-weight:600;vertical-align:top">Terminart</td><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0">${meetingType || "\u2013"}</td></tr>
        </table>
        ${packageSummaryMario}
        <h3 style="font-family:Georgia,serif;font-weight:400;font-size:18px;margin-top:24px">Nachricht:</h3>
        <div style="white-space:pre-wrap;background:#f8f7f5;padding:20px;border-left:3px solid #333;margin:12px 0;line-height:1.7;color:#555">${message || "\u2013 keine Nachricht \u2013"}</div>
        <p style="color:#999;font-size:12px;margin-top:30px;border-top:1px solid #eee;padding-top:16px">Diese Anfrage wurde über das Kontaktformular auf marioschub.com gesendet.</p>
      </div>
    `,
  };

  // ── Confirmation email to customer ──
  const packageInfo = hasPackageSelection
    ? packageSummaryCustomer
    : "";

  const mailToCustomer = {
    from: `"Mario Schubert Photography" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Danke für deine Anfrage! \u2013 Mario Schubert Photography",
    text: [
      `Servus ${firstName}!`,
      "",
      "Vielen Dank für deine Anfrage! Ich habe deine Nachricht erhalten und melde mich so schnell wie möglich bei dir.",
      "Ich freue mich schon darauf, mehr über eure Pläne zu erfahren und gemeinsam etwas Besonderes zu schaffen.",
      "",
      MARIO_SIGNATURE_TEXT,
    ].join("\n"),
    html: `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
        <div style="text-align:center;padding:40px 20px 30px;border-bottom:1px solid #eee">
          <img src="${MARIO_LOGO_URL}" alt="Mario Schubert Photography" style="height:36px" />
        </div>
        <div style="padding:40px 24px">
          <h1 style="font-family:Georgia,serif;font-weight:300;font-size:28px;margin-bottom:8px;color:#111">Servus ${firstName}!</h1>
          <p style="line-height:1.8;color:#555;font-size:15px;margin-top:16px">
            Vielen Dank für deine Anfrage! Ich habe deine Nachricht erhalten und melde mich so schnell wie möglich bei dir \u2013 in der Regel innerhalb von <strong>48 Stunden</strong>.
          </p>
          <p style="line-height:1.8;color:#555;font-size:15px">
            Ich freue mich schon darauf, mehr über eure Pläne zu erfahren und gemeinsam etwas Besonderes zu schaffen.
          </p>

          ${packageInfo}

          <div style="background:#f8f7f5;padding:20px;margin:28px 0;border-left:3px solid #333">
            <p style="margin:0;color:#555;font-size:14px;line-height:1.6">
              <strong>Eure Anfrage:</strong> ${interestsText}<br/>
              ${date ? `<strong>Datum:</strong> ${date}<br/>` : ""}
              ${message ? `<strong>Nachricht:</strong> ${escapeHtml(message.substring(0, 300))}${message.length > 300 ? "..." : ""}` : ""}
            </p>
          </div>

          <p style="line-height:1.8;color:#555;font-size:15px;margin-top:28px">
            Bis bald!<br/>
            <strong style="color:#111">Mario</strong>
          </p>
        </div>
        ${buildMarioSignatureHtml()}
      </div>
    `,
  };

  try {
    await Promise.all([
      transporter.sendMail(mailToMario),
      transporter.sendMail(mailToCustomer),
    ]);

    return res.status(200).json({ success: true, message: "Emails sent successfully" });
  } catch (error: any) {
    console.error("SMTP Error:", error);
    return res.status(500).json({
      error: "Failed to send emails",
      details: error.message,
    });
  }
}
