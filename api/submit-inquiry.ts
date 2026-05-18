import type { VercelRequest, VercelResponse } from "@vercel/node";
import { appendInquiry } from "./_crm/db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { name, email, phone, foundVia, interests, date, message, selectedPackages, estimatedTotal } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  try {
    const interestsText = Array.isArray(interests) ? interests.join(", ") : interests || "";
    const inquiry = await appendInquiry({
      name,
      email,
      phone: phone || "",
      foundVia: foundVia || "",
      category: interestsText,
      eventDate: date || "",
      message: message || "",
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
    return res.status(500).json({
      error: "Failed to save inquiry",
      details: error?.message,
    });
  }
}
