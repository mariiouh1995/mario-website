import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";

// ── CORS Headers ──
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).setHeader("Access-Control-Allow-Origin", "*").end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, phone, foundVia, interests, date, weddingGuide, message } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ error: "Name, email, and phone are required" });
  }

  // ── SMTP Transporter (IONOS) ──
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,        // smtp.ionos.de
    port: Number(process.env.SMTP_PORT), // 587
    secure: false,                        // TLS on port 587 uses STARTTLS, not implicit TLS
    auth: {
      user: process.env.SMTP_USER,       // servus@marioschub.com
      pass: process.env.SMTP_PASS,       // password
    },
    tls: {
      ciphers: "SSLv3",
      rejectUnauthorized: false,
    },
  });

  const interestsText = (interests || []).join(", ") || "–";
  const firstName = name.split(" ")[0];

  // ── Email to Mario ──
  const mailToMario = {
    from: `"Mario Schubert Photography" <${process.env.SMTP_USER}>`,
    to: process.env.SMTP_USER, // servus@marioschub.com
    replyTo: email,
    subject: `Neue Anfrage von ${name} – ${interestsText}`,
    html: `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:650px;margin:0 auto;color:#333">
        <h2 style="font-family:Georgia,serif;font-weight:300;font-size:24px;border-bottom:1px solid #eee;padding-bottom:16px">Neue Anfrage über die Website</h2>
        <table style="border-collapse:collapse;width:100%;margin:20px 0">
          <tr><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-weight:600;width:180px;vertical-align:top">Name</td><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0">${name}</td></tr>
          <tr><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-weight:600;vertical-align:top">E-Mail</td><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0"><a href="mailto:${email}" style="color:#333">${email}</a></td></tr>
          <tr><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-weight:600;vertical-align:top">Telefon</td><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0">${phone}</td></tr>
          <tr><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-weight:600;vertical-align:top">Gefunden über</td><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0">${foundVia || "–"}</td></tr>
          <tr><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-weight:600;vertical-align:top">Interesse</td><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0">${interestsText}</td></tr>
          <tr><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-weight:600;vertical-align:top">Datum</td><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0">${date || "–"}</td></tr>
          <tr><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-weight:600;vertical-align:top">Wedding Guide</td><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0">${weddingGuide ? "Ja, bitte zusenden" : "Nein"}</td></tr>
        </table>
        <h3 style="font-family:Georgia,serif;font-weight:400;font-size:18px;margin-top:24px">Nachricht:</h3>
        <div style="white-space:pre-wrap;background:#f8f7f5;padding:20px;border-left:3px solid #333;margin:12px 0;line-height:1.7;color:#555">${message || "– keine Nachricht –"}</div>
        <p style="color:#999;font-size:12px;margin-top:30px;border-top:1px solid #eee;padding-top:16px">Diese Anfrage wurde über das Kontaktformular auf marioschub.com gesendet.</p>
      </div>
    `,
  };

  // ── Confirmation email to customer ──
  const mailToCustomer = {
    from: `"Mario Schubert Photography" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Danke für deine Anfrage! – Mario Schubert Photography",
    html: `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
        <div style="text-align:center;padding:40px 20px 30px;border-bottom:1px solid #eee">
          <img src="https://ik.imagekit.io/r2yqrg6np/68e54b92f722d45170d60f24_Logo%20MS.svg" alt="Mario Schubert Photography" style="height:36px" />
        </div>
        <div style="padding:40px 24px">
          <h1 style="font-family:Georgia,serif;font-weight:300;font-size:28px;margin-bottom:8px;color:#111">Servus ${firstName}!</h1>
          <p style="line-height:1.8;color:#555;font-size:15px;margin-top:16px">
            Vielen Dank für deine Anfrage! Ich habe deine Nachricht erhalten und melde mich so schnell wie möglich bei dir – in der Regel innerhalb von <strong>48 Stunden</strong>.
          </p>
          <p style="line-height:1.8;color:#555;font-size:15px">
            Ich freue mich schon darauf, mehr über eure Pläne zu erfahren und gemeinsam etwas Besonderes zu schaffen.
          </p>
          <div style="background:#f8f7f5;padding:20px;margin:28px 0;border-left:3px solid #333">
            <p style="margin:0;color:#555;font-size:14px;line-height:1.6">
              <strong>Eure Anfrage:</strong> ${interestsText}<br/>
              ${date ? `<strong>Datum:</strong> ${date}<br/>` : ""}
              ${message ? `<strong>Nachricht:</strong> ${message.substring(0, 200)}${message.length > 200 ? "..." : ""}` : ""}
            </p>
          </div>
          <p style="line-height:1.8;color:#555;font-size:15px;margin-top:28px">
            Bis bald!<br/>
            <strong style="color:#111">Mario</strong>
          </p>
        </div>
        <div style="text-align:center;padding:24px 20px;border-top:1px solid #eee;color:#aaa;font-size:12px;line-height:1.6">
          <p style="margin:4px 0">Mario Schubert Fotografie</p>
          <p style="margin:4px 0">Bäckerbühelgasse 14, 6020 Innsbruck</p>
          <p style="margin:4px 0">servus@marioschub.com</p>
        </div>
      </div>
    `,
  };

  try {
    // Send both emails
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
