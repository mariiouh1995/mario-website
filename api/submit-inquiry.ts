import type { VercelRequest, VercelResponse } from "@vercel/node";
import { appendInquiry } from "./crm-db.js";
import { validatePublicInquiry } from '../src/content/inquiry.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { name, email, phone, foundVia, interests, date, message, selectedPackages, estimatedTotal, locationAddress, website, weddingGuide } = validatePublicInquiry(req.body);
    if (website) return res.status(200).json({ success: true });
    const interestsText = Array.isArray(interests) ? interests.join(", ") : interests || "";
    const inquiry = await appendInquiry({
      name,
      email,
      phone: phone || "",
      foundVia: foundVia || "",
      category: interestsText,
      eventDate: date || "",
      locationAddress,
      message: message + (weddingGuide ? '\n\nWedding Guide gewünscht.' : ''),
      selectedPackages: Array.isArray(selectedPackages)
        ? selectedPackages.map((pkg: any) => ({
            id: `${pkg.name || "package"}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            name: pkg.name || "",
            price: pkg.price || "",
            type: "package",
          }))
        : [],
      estimatedTotal: estimatedTotal || "",
    });

    return res.status(200).json({ success: true, inquiry });
  } catch (error: any) {
    console.error("CRM inquiry logging failed:", error?.message || error);
    return res.status(error?.statusCode || 500).json({ error: error?.statusCode === 400 ? error.message : 'Anfrage konnte nicht gespeichert werden.' });
  }
}
