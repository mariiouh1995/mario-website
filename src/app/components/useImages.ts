import { useState, useEffect, useMemo } from "react";

/**
 * Hook to fetch gallery images from Google Sheets via Vercel serverless function.
 *
 * Includes localStorage caching (1 hour) and falls back to hardcoded defaults
 * if the API is unavailable. Use `getImagesForPage(page, category?)` to filter.
 */

// ── Types ──
export interface ImageEntry {
  page: string;
  category: string;
  src: string;
  altDe: string;
  altEn: string;
}

interface ImagesState {
  images: ImageEntry[];
  loading: boolean;
  error: string | null;
}

const CACHE_KEY = "marioschub_images";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (matches API cache)

// ── Helper to generate entries ──
function w(category: string, src: string, altDe: string, altEn: string): ImageEntry {
  return { page: "hochzeit", category, src, altDe, altEn };
}

// ── Fallback data: all current gallery images ──
const FALLBACK_IMAGES: ImageEntry[] = [
  // ═══════════════════════════════════════════════
  // HOCHZEIT – Standesamt (24 Bilder)
  // ═══════════════════════════════════════════════
  w("standesamt", "https://ik.imagekit.io/r2yqrg6np/Wedding/Standesamt/20251004_8D2A9760_(WebRes).jpg?updatedAt=1773002603723", "Standesamtliche Trauung – Hochzeitsfotografie Innsbruck", "Civil ceremony – Wedding photography Innsbruck"),
  w("standesamt", "https://ik.imagekit.io/r2yqrg6np/Wedding/Standesamt/20251004_R52_0657_(WebRes).jpg?updatedAt=1773002603507", "Standesamt Hochzeit – Hochzeitsfotograf Tirol", "Civil wedding – Wedding photographer Tyrol"),
  w("standesamt", "https://ik.imagekit.io/r2yqrg6np/Wedding/Standesamt/20251004_8D2A9840_(WebRes).jpg?updatedAt=1773002603440", "Standesamtliche Trauung Innsbruck – Mario Schubert Fotografie", "Civil ceremony Innsbruck – Mario Schubert Photography"),
  w("standesamt", "https://ik.imagekit.io/r2yqrg6np/Wedding/Standesamt/20251004_R52_0061_(WebRes).jpg?updatedAt=1773002603431", "Standesamt Zeremonie – Hochzeitsfotograf Innsbruck", "Civil ceremony – Wedding photographer Innsbruck"),
  w("standesamt", "https://ik.imagekit.io/r2yqrg6np/Wedding/Standesamt/20251004_R52_0329_(WebRes).jpg?updatedAt=1773002603319", "Standesamt Hochzeitsfotografie Tirol", "Civil wedding photography Tyrol"),
  w("standesamt", "https://ik.imagekit.io/r2yqrg6np/Wedding/Standesamt/20251004_R52_0507_(WebRes).jpg?updatedAt=1773002603115", "Standesamtliche Trauung Bayern – Mario Schubert", "Civil ceremony Bavaria – Mario Schubert"),
  w("standesamt", "https://ik.imagekit.io/r2yqrg6np/Wedding/Standesamt/20251004_R52_0048_(WebRes).jpg?updatedAt=1773002602938", "Standesamt Hochzeit Innsbruck Tirol", "Civil wedding Innsbruck Tyrol"),
  w("standesamt", "https://ik.imagekit.io/r2yqrg6np/Wedding/Standesamt/20251004_8D2A9815_(WebRes).jpg?updatedAt=1773002602780", "Standesamtliche Trauung – Hochzeitsfotografie Alpen", "Civil ceremony – Alpine wedding photography"),
  w("standesamt", "https://ik.imagekit.io/r2yqrg6np/Wedding/Standesamt/20251004_R52_0516_(WebRes).jpg?updatedAt=1773002602782", "Standesamt Detailfoto – Hochzeitsfotograf Mario Schubert", "Civil ceremony detail – Wedding photographer Mario Schubert"),
  w("standesamt", "https://ik.imagekit.io/r2yqrg6np/Wedding/Standesamt/20251004_R52_0513_(WebRes).jpg?updatedAt=1773002602700", "Standesamtliche Trauung – Hochzeitsfotografie Tirol", "Civil ceremony – Wedding photography Tyrol"),
  w("standesamt", "https://ik.imagekit.io/r2yqrg6np/Wedding/Standesamt/20251004_R52_0055_(WebRes).jpg?updatedAt=1773002602657", "Standesamt Hochzeit – Hochzeitsfotograf Innsbruck Tirol", "Civil wedding – Wedding photographer Innsbruck Tyrol"),
  w("standesamt", "https://ik.imagekit.io/r2yqrg6np/Wedding/Standesamt/20251004_R52_0140_(WebRes).jpg?updatedAt=1773002602654", "Standesamtliche Trauung – Hochzeitsfotografie Mario Schubert", "Civil ceremony – Mario Schubert Photography"),
  w("standesamt", "https://ik.imagekit.io/r2yqrg6np/Wedding/Standesamt/20251004_R52_0515_(WebRes).jpg?updatedAt=1773002601525", "Standesamt Hochzeitsfotografie Innsbruck", "Civil wedding photography Innsbruck"),
  w("standesamt", "https://ik.imagekit.io/r2yqrg6np/Wedding/Standesamt/20251004_8D2A9967_(WebRes).jpg?updatedAt=1773002601431", "Standesamtliche Trauung – Fotograf Tirol", "Civil ceremony – Photographer Tyrol"),
  w("standesamt", "https://ik.imagekit.io/r2yqrg6np/Wedding/Standesamt/20251004_R52_0116_(WebRes).jpg?updatedAt=1773002601390", "Standesamt Hochzeit – Hochzeitsfotograf Tirol Bayern", "Civil wedding – Wedding photographer Tyrol Bavaria"),
  w("standesamt", "https://ik.imagekit.io/r2yqrg6np/Wedding/Standesamt/20251004_R52_0143_(WebRes).jpg?updatedAt=1773002601164", "Standesamtliche Trauung Innsbruck – Hochzeitsfotografie", "Civil ceremony Innsbruck – Wedding photography"),
  w("standesamt", "https://ik.imagekit.io/r2yqrg6np/Wedding/Standesamt/20251004_R52_0739_(WebRes).jpg?updatedAt=1773002601144", "Standesamt Hochzeit Tirol – Mario Schubert Fotografie", "Civil wedding Tyrol – Mario Schubert Photography"),
  w("standesamt", "https://ik.imagekit.io/r2yqrg6np/Wedding/Standesamt/20251004_8D2A9645_(WebRes).jpg?updatedAt=1773002601006", "Standesamtliche Trauung – Hochzeitsfotograf Innsbruck", "Civil ceremony – Wedding photographer Innsbruck"),
  w("standesamt", "https://ik.imagekit.io/r2yqrg6np/Wedding/Standesamt/20251004_R52_0202_(WebRes).jpg?updatedAt=1773002601028", "Standesamt Hochzeitsfotografie – Mario Schubert Tirol", "Civil wedding photography – Mario Schubert Tyrol"),
  w("standesamt", "https://ik.imagekit.io/r2yqrg6np/Wedding/Standesamt/20251004_8D2A9629_(WebRes).jpg?updatedAt=1773002600772", "Standesamtliche Trauung Bayern – Hochzeitsfotografie", "Civil ceremony Bavaria – Wedding photography"),
  w("standesamt", "https://ik.imagekit.io/r2yqrg6np/Wedding/Standesamt/20251004_8D2A9587_(WebRes).jpg?updatedAt=1773002600759", "Standesamt Zeremonie – Hochzeitsfotograf Innsbruck Tirol", "Civil ceremony – Wedding photographer Innsbruck Tyrol"),
  w("standesamt", "https://ik.imagekit.io/r2yqrg6np/Wedding/Standesamt/20251004_R52_0180_(WebRes).jpg?updatedAt=1773002600191", "Standesamtliche Trauung – Hochzeitsfotografie Alpen Tirol", "Civil ceremony – Alpine wedding photography Tyrol"),
  w("standesamt", "https://ik.imagekit.io/r2yqrg6np/Wedding/Standesamt/20251004_8D2A9692_(WebRes).jpg?updatedAt=1773002600074", "Standesamt Hochzeit – Hochzeitsfotograf Mario Schubert", "Civil wedding – Wedding photographer Mario Schubert"),
  w("standesamt", "https://ik.imagekit.io/r2yqrg6np/Wedding/Standesamt/20251004_R52_0187_(WebRes).jpg?updatedAt=1773002600088", "Standesamtliche Trauung Innsbruck Tirol – Hochzeitsfotografie", "Civil ceremony Innsbruck Tyrol – Wedding photography"),

  // ═══════════════════════════════════════════════
  // HOCHZEIT – Getting Ready (25 Bilder)
  // ═══════════════════════════════════════════════
  w("getting-ready", "https://ik.imagekit.io/r2yqrg6np/Wedding/Getting%20Ready/20251004_8D2A0205_(WebRes).jpg?updatedAt=1773002918118", "Getting Ready – Hochzeitsfotografie Innsbruck", "Getting ready – Wedding photography Innsbruck"),
  w("getting-ready", "https://ik.imagekit.io/r2yqrg6np/Wedding/Getting%20Ready/20251004_8D2A0373_(WebRes).jpg?updatedAt=1773002917981", "Braut Getting Ready – Hochzeitsfotograf Tirol", "Bride getting ready – Wedding photographer Tyrol"),
  w("getting-ready", "https://ik.imagekit.io/r2yqrg6np/Wedding/Getting%20Ready/20251004_8D2A0411_(WebRes).jpg?updatedAt=1773002917972", "Getting Ready Details – Mario Schubert Fotografie", "Getting ready details – Mario Schubert Photography"),
  w("getting-ready", "https://ik.imagekit.io/r2yqrg6np/Wedding/Getting%20Ready/20251004_8D2A0527_(WebRes).jpg?updatedAt=1773002917902", "Hochzeit Getting Ready – Hochzeitsfotografie Tirol", "Wedding getting ready – Wedding photography Tyrol"),
  w("getting-ready", "https://ik.imagekit.io/r2yqrg6np/Wedding/Getting%20Ready/20251004_8D2A0409_(WebRes).jpg?updatedAt=1773002917878", "Brautvorbereitung – Hochzeitsfotograf Innsbruck", "Bridal preparation – Wedding photographer Innsbruck"),
  w("getting-ready", "https://ik.imagekit.io/r2yqrg6np/Wedding/Getting%20Ready/20251004_8D2A0308_(WebRes).jpg?updatedAt=1773002917835", "Getting Ready Momente – Hochzeitsfotografie Alpen", "Getting ready moments – Alpine wedding photography"),
  w("getting-ready", "https://ik.imagekit.io/r2yqrg6np/Wedding/Getting%20Ready/20251004_8D2A0492_(WebRes).jpg?updatedAt=1773002917820", "Braut Vorbereitung – Hochzeitsfotograf Mario Schubert", "Bride preparation – Wedding photographer Mario Schubert"),
  w("getting-ready", "https://ik.imagekit.io/r2yqrg6np/Wedding/Getting%20Ready/20251004_8D2A0440_(WebRes).jpg?updatedAt=1773002917818", "Getting Ready – Hochzeitsfotografie Bayern Tirol", "Getting ready – Wedding photography Bavaria Tyrol"),
  w("getting-ready", "https://ik.imagekit.io/r2yqrg6np/Wedding/Getting%20Ready/20251004_8D2A0047_(WebRes).jpg?updatedAt=1773002917819", "Hochzeit Vorbereitung – Hochzeitsfotograf Innsbruck", "Wedding preparation – Wedding photographer Innsbruck"),
  w("getting-ready", "https://ik.imagekit.io/r2yqrg6np/Wedding/Getting%20Ready/20251004_8D2A0370_(WebRes).jpg?updatedAt=1773002917802", "Getting Ready Braut – Hochzeitsfotografie Tirol", "Getting ready bride – Wedding photography Tyrol"),
  w("getting-ready", "https://ik.imagekit.io/r2yqrg6np/Wedding/Getting%20Ready/20251004_8D2A0145_(WebRes).jpg?updatedAt=1773002917787", "Braut Getting Ready Details – Mario Schubert", "Bride getting ready details – Mario Schubert"),
  w("getting-ready", "https://ik.imagekit.io/r2yqrg6np/Wedding/Getting%20Ready/20251004_8D2A0419_(WebRes).jpg?updatedAt=1773002917721", "Getting Ready Emotionen – Hochzeitsfotograf Tirol", "Getting ready emotions – Wedding photographer Tyrol"),
  w("getting-ready", "https://ik.imagekit.io/r2yqrg6np/Wedding/Getting%20Ready/20251004_8D2A0361_(WebRes).jpg?updatedAt=1773002917543", "Hochzeit Vorbereitung – Hochzeitsfotografie Innsbruck", "Wedding preparation – Wedding photography Innsbruck"),
  w("getting-ready", "https://ik.imagekit.io/r2yqrg6np/Wedding/Getting%20Ready/20251004_8D2A0496_(WebRes).jpg?updatedAt=1773002917543", "Getting Ready – Hochzeitsfotograf Mario Schubert Tirol", "Getting ready – Wedding photographer Mario Schubert Tyrol"),
  w("getting-ready", "https://ik.imagekit.io/r2yqrg6np/Wedding/Getting%20Ready/20251004_8D2A0079_(WebRes).jpg?updatedAt=1773002917507", "Braut Vorbereitung Hochzeit – Fotograf Innsbruck", "Bride wedding preparation – Photographer Innsbruck"),
  w("getting-ready", "https://ik.imagekit.io/r2yqrg6np/Wedding/Getting%20Ready/20251004_8D2A0221_(WebRes).jpg?updatedAt=1773002917508", "Getting Ready Hochzeit Innsbruck – Hochzeitsfotografie", "Getting ready wedding Innsbruck – Wedding photography"),
  w("getting-ready", "https://ik.imagekit.io/r2yqrg6np/Wedding/Getting%20Ready/20251004_8D2A0168_(WebRes).jpg?updatedAt=1773002917499", "Hochzeit Getting Ready – Hochzeitsfotograf Tirol Bayern", "Wedding getting ready – Wedding photographer Tyrol Bavaria"),
  w("getting-ready", "https://ik.imagekit.io/r2yqrg6np/Wedding/Getting%20Ready/20251004_8D2A0297_(WebRes).jpg?updatedAt=1773002917396", "Getting Ready Braut – Mario Schubert Fotografie", "Getting ready bride – Mario Schubert Photography"),
  w("getting-ready", "https://ik.imagekit.io/r2yqrg6np/Wedding/Getting%20Ready/20251004_8D2A0471_(WebRes).jpg?updatedAt=1773002917374", "Brautvorbereitung – Hochzeitsfotografie Alpen Tirol", "Bridal preparation – Alpine wedding photography Tyrol"),
  w("getting-ready", "https://ik.imagekit.io/r2yqrg6np/Wedding/Getting%20Ready/20251004_8D2A0163_(WebRes).jpg?updatedAt=1773002917190", "Getting Ready Details – Hochzeitsfotograf Innsbruck", "Getting ready details – Wedding photographer Innsbruck"),
  w("getting-ready", "https://ik.imagekit.io/r2yqrg6np/Wedding/Getting%20Ready/20251004_8D2A0139_(WebRes).jpg?updatedAt=1773002917089", "Hochzeit Vorbereitung – Hochzeitsfotografie Mario Schubert", "Wedding preparation – Mario Schubert Photography"),
  w("getting-ready", "https://ik.imagekit.io/r2yqrg6np/Wedding/Getting%20Ready/20251004_8D2A0067_(WebRes).jpg?updatedAt=1773002916588", "Getting Ready – Hochzeitsfotograf Mario Schubert Innsbruck", "Getting ready – Wedding photographer Mario Schubert Innsbruck"),
  w("getting-ready", "https://ik.imagekit.io/r2yqrg6np/Wedding/Getting%20Ready/20251004_8D2A0113_(WebRes).jpg?updatedAt=1773002916557", "Braut Getting Ready – Hochzeitsfotografie Innsbruck Tirol", "Bride getting ready – Wedding photography Innsbruck Tyrol"),
  w("getting-ready", "https://ik.imagekit.io/r2yqrg6np/Wedding/Getting%20Ready/20251004_8D2A0483_(WebRes).jpg?updatedAt=1773002916487", "Getting Ready Emotionen – Hochzeitsfotografie Tirol", "Getting ready emotions – Wedding photography Tyrol"),
  w("getting-ready", "https://ik.imagekit.io/r2yqrg6np/Wedding/Getting%20Ready/20251004_8D2A0042_(WebRes).jpg?updatedAt=1773002914934", "Hochzeit Getting Ready – Hochzeitsfotograf Innsbruck Tirol", "Wedding getting ready – Wedding photographer Innsbruck Tyrol"),

  // ═══════════════════════════════════════════════
  // HOCHZEIT – Kirchliche Trauung (53 Bilder)
  // ═══════════════════════════════════════════════
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0158.jpg?updatedAt=1773003722025", "Kirchliche Trauung – Hochzeitsfotografie Innsbruck", "Church ceremony – Wedding photography Innsbruck"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0191.jpg?updatedAt=1773003721836", "Kirchliche Hochzeit – Hochzeitsfotograf Tirol", "Church wedding – Wedding photographer Tyrol"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0138.jpg?updatedAt=1773003721751", "Trauung in der Kirche – Mario Schubert Fotografie", "Church ceremony – Mario Schubert Photography"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0293.jpg?updatedAt=1773003721528", "Kirchliche Trauung Tirol – Hochzeitsfotografie Alpen", "Church ceremony Tyrol – Alpine wedding photography"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0251.jpg?updatedAt=1773003721533", "Hochzeit Kirche – Hochzeitsfotograf Innsbruck Tirol", "Church wedding – Wedding photographer Innsbruck Tirol"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0278.jpg?updatedAt=1773003721450", "Kirchliche Zeremonie – Hochzeitsfotografie Bayern", "Church ceremony – Wedding photography Bavaria"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0283.jpg?updatedAt=1773003721352", "Trauung Kirche – Hochzeitsfotograf Mario Schubert", "Church ceremony – Wedding photographer Mario Schubert"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0276.jpg?updatedAt=1773003721438", "Kirchliche Hochzeit Innsbruck – Hochzeitsfotografie", "Church wedding Innsbruck – Wedding photography"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0141.jpg?updatedAt=1773003721240", "Kirchliche Trauung – Hochzeitsfotograf Tirol Bayern", "Church ceremony – Wedding photographer Tyrol Bavaria"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0247.jpg?updatedAt=1773003721264", "Hochzeit in der Kirche – Hochzeitsfotografie Innsbruck", "Church wedding – Wedding photography Innsbruck"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0151.jpg?updatedAt=1773003721196", "Kirchliche Zeremonie Tirol – Mario Schubert Fotografie", "Church ceremony Tyrol – Mario Schubert Photography"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0241.jpg?updatedAt=1773003721070", "Kirchliche Trauung – Hochzeitsfotograf Innsbruck", "Church ceremony – Wedding photographer Innsbruck"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0257.jpg?updatedAt=1773003720985", "Hochzeit Kirche Tirol – Hochzeitsfotografie Alpen", "Church wedding Tyrol – Alpine wedding photography"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0140.jpg?updatedAt=1773003720764", "Kirchliche Trauung – Hochzeitsfotografie Mario Schubert", "Church ceremony – Mario Schubert Photography"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0183.jpg?updatedAt=1773003720729", "Trauung Kirche Innsbruck – Hochzeitsfotograf Tirol", "Church ceremony Innsbruck – Wedding photographer Tyrol"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0148.jpg?updatedAt=1773003720698", "Kirchliche Hochzeit – Hochzeitsfotografie Bayern Tirol", "Church wedding – Wedding photography Bavaria Tyrol"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0146.jpg?updatedAt=1773003720606", "Kirchliche Zeremonie – Hochzeitsfotograf Innsbruck Tirol", "Church ceremony – Wedding photographer Innsbruck Tyrol"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0311.jpg?updatedAt=1773003720592", "Kirchliche Trauung Alpen – Mario Schubert Fotografie", "Church ceremony Alps – Mario Schubert Photography"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0243.jpg?updatedAt=1773003720505", "Hochzeit Kirche – Hochzeitsfotografie Innsbruck Tirol", "Church wedding – Wedding photography Innsbruck Tyrol"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0331.jpg?updatedAt=1773003720501", "Kirchliche Trauung – Hochzeitsfotograf Mario Schubert Tirol", "Church ceremony – Wedding photographer Mario Schubert Tyrol"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0166.jpg?updatedAt=1773003720447", "Kirchliche Zeremonie Innsbruck – Hochzeitsfotografie", "Church ceremony Innsbruck – Wedding photography"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0130.jpg?updatedAt=1773003720264", "Kirchliche Hochzeit Tirol – Hochzeitsfotograf Innsbruck", "Church wedding Tyrol – Wedding photographer Innsbruck"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0215.jpg?updatedAt=1773003720005", "Trauung in der Kirche – Hochzeitsfotografie Alpen", "Church ceremony – Alpine wedding photography"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0249.jpg?updatedAt=1773003719633", "Kirchliche Trauung Bayern – Hochzeitsfotograf Mario Schubert", "Church ceremony Bavaria – Wedding photographer Mario Schubert"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0168.jpg?updatedAt=1773003719525", "Kirchliche Hochzeit – Hochzeitsfotografie Innsbruck", "Church wedding – Wedding photography Innsbruck"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0144.jpg?updatedAt=1773003719437", "Kirchliche Zeremonie – Hochzeitsfotograf Tirol Innsbruck", "Church ceremony – Wedding photographer Tyrol Innsbruck"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0145.jpg?updatedAt=1773003719259", "Kirchliche Trauung – Hochzeitsfotografie Mario Schubert Tirol", "Church ceremony – Mario Schubert Photography Tyrol"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0180.jpg?updatedAt=1773003719253", "Hochzeit Kirche Innsbruck – Hochzeitsfotograf Tirol", "Church wedding Innsbruck – Wedding photographer Tyrol"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0162.jpg?updatedAt=1773003719134", "Kirchliche Trauung Tirol Bayern – Hochzeitsfotografie", "Church ceremony Tyrol Bavaria – Wedding photography"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0160.jpg?updatedAt=1773003718985", "Kirchliche Zeremonie Alpen – Hochzeitsfotograf Innsbruck", "Church ceremony Alps – Wedding photographer Innsbruck"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0188.jpg?updatedAt=1773003718332", "Kirchliche Hochzeit Innsbruck – Mario Schubert Fotografie", "Church wedding Innsbruck – Mario Schubert Photography"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0271.jpg?updatedAt=1773003718200", "Kirchliche Trauung – Hochzeitsfotograf Innsbruck Bayern", "Church ceremony – Wedding photographer Innsbruck Bavaria"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0265.jpg?updatedAt=1773003718033", "Trauung Kirche – Hochzeitsfotografie Tirol Innsbruck", "Church ceremony – Wedding photography Tyrol Innsbruck"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0260.jpg?updatedAt=1773003717528", "Kirchliche Hochzeit – Hochzeitsfotograf Tirol Alpen", "Church wedding – Wedding photographer Tyrol Alps"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0195.jpg?updatedAt=1773003716992", "Kirchliche Zeremonie – Hochzeitsfotografie Mario Schubert", "Church ceremony – Mario Schubert Photography"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0136.jpg?updatedAt=1773003716935", "Kirchliche Trauung Innsbruck – Hochzeitsfotograf Tirol", "Church ceremony Innsbruck – Wedding photographer Tyrol"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0255.jpg?updatedAt=1773003716752", "Hochzeit Kirche Tirol – Hochzeitsfotografie Bayern", "Church wedding Tyrol – Wedding photography Bavaria"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0156.jpg?updatedAt=1773003716727", "Kirchliche Trauung – Hochzeitsfotograf Mario Schubert Innsbruck", "Church ceremony – Wedding photographer Mario Schubert Innsbruck"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0128.jpg?updatedAt=1773003716684", "Kirchliche Zeremonie Tirol – Hochzeitsfotografie Innsbruck", "Church ceremony Tyrol – Wedding photography Innsbruck"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0114.jpg?updatedAt=1773003716572", "Kirchliche Hochzeit Alpen – Hochzeitsfotograf Innsbruck Tirol", "Church wedding Alps – Wedding photographer Innsbruck Tyrol"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0274.jpg?updatedAt=1773003716207", "Kirchliche Trauung – Hochzeitsfotografie Alpen Tirol", "Church ceremony – Alpine wedding photography Tyrol"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0284.jpg?updatedAt=1773003716176", "Kirchliche Zeremonie – Hochzeitsfotograf Innsbruck", "Church ceremony – Wedding photographer Innsbruck"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0121.jpg?updatedAt=1773003714826", "Hochzeit in der Kirche Tirol – Hochzeitsfotografie", "Church wedding Tyrol – Wedding photography"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0111.jpg?updatedAt=1773003714285", "Kirchliche Trauung – Hochzeitsfotograf Tirol Alpen", "Church ceremony – Wedding photographer Tyrol Alps"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0113.jpg?updatedAt=1773003713992", "Kirchliche Hochzeit – Mario Schubert Fotografie Innsbruck", "Church wedding – Mario Schubert Photography Innsbruck"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0277.jpg?updatedAt=1773003713718", "Kirchliche Zeremonie Innsbruck – Hochzeitsfotograf Tirol", "Church ceremony Innsbruck – Wedding photographer Tyrol"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0279.jpg?updatedAt=1773003713251", "Kirchliche Trauung Bayern – Hochzeitsfotografie Tirol", "Church ceremony Bavaria – Wedding photography Tyrol"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0212.jpg?updatedAt=1773003712570", "Hochzeit Kirche – Hochzeitsfotograf Mario Schubert Tirol", "Church wedding – Wedding photographer Mario Schubert Tyrol"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0217.jpg?updatedAt=1773003711300", "Kirchliche Trauung Innsbruck Tirol – Hochzeitsfotografie Alpen", "Church ceremony Innsbruck Tyrol – Alpine wedding photography"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0165.jpg?updatedAt=1773003711293", "Kirchliche Zeremonie – Hochzeitsfotografie Innsbruck Tirol", "Church ceremony – Wedding photography Innsbruck Tyrol"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0246.jpg?updatedAt=1773003710660", "Kirchliche Hochzeit – Hochzeitsfotograf Innsbruck Bayern", "Church wedding – Wedding photographer Innsbruck Bavaria"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0264.jpg?updatedAt=1773003710254", "Kirchliche Trauung Tirol – Hochzeitsfotograf Mario Schubert", "Church ceremony Tyrol – Wedding photographer Mario Schubert"),
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0266.jpg?updatedAt=1773003710022", "Kirchliche Zeremonie Alpen – Hochzeitsfotografie Tirol Innsbruck", "Church ceremony Alps – Wedding photography Tyrol Innsbruck"),

  // ═══════════════════════════════════════════════
  // HOCHZEIT – Paarshooting (8 Fallback-Bilder)
  // ═══════════════════════════════════════════════
  w("paarshooting", "https://images.unsplash.com/photo-1680818508921-844425951e45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBwb3J0cmFpdCUyMG1vdW50YWluJTIwZ29sZGVuJTIwaG91cnxlbnwxfHx8fDE3NzMwMTQwMjl8MA&ixlib=rb-4.1.0&q=80&w=1080", "Romantisches Paarshooting in den Bergen – Hochzeitsfotograf Innsbruck", "Romantic couple shoot in the mountains – Wedding photographer Innsbruck"),
  w("paarshooting", "https://images.unsplash.com/photo-1758565177415-33b15a0729de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjB3YWxraW5nJTIwdG9nZXRoZXIlMjByb21hbnRpYyUyMGZpZWxkfGVufDF8fHx8MTc3MzAxNDAzNHww&ixlib=rb-4.1.0&q=80&w=1080", "Paarshooting bei Sonnenuntergang – Paarfotografie Tirol", "Couple shoot at sunset – Couple photography Tyrol"),
  w("paarshooting", "https://images.unsplash.com/photo-1758524053982-dc0fc7cd651f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBsYXVnaGluZyUyMG91dGRvb3IlMjBuYXR1cmFsfGVufDF8fHx8MTc3MzAxNDAzNXww&ixlib=rb-4.1.0&q=80&w=1080", "Lachendes Paar beim Outdoor-Shooting – Hochzeitsfotografie Tirol", "Laughing couple during outdoor shoot – Wedding photography Tyrol"),
  w("paarshooting", "https://images.unsplash.com/photo-1514846528774-8de9d4a07023?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBlbWJyYWNlJTIwcm9tYW50aWMlMjBvdXRkb29yfGVufDF8fHx8MTc3MzAxNDAzMHww&ixlib=rb-4.1.0&q=80&w=1080", "Romantische Umarmung – Paarshooting Innsbruck Tirol", "Romantic embrace – Couple shoot Innsbruck Tyrol"),
  w("paarshooting", "https://images.unsplash.com/photo-1758810410699-2dc1daec82dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21hbnRpYyUyMGNvdXBsZSUyMHN1bnNldCUyMHNpbGhvdWV0dGV8ZW58MXx8fHwxNzcyOTY2ODY5fDA&ixlib=rb-4.1.0&q=80&w=1080", "Paar-Silhouette bei Sonnenuntergang – Hochzeitsfotograf Bayern", "Couple silhouette at sunset – Wedding photographer Bavaria"),
  w("paarshooting", "https://images.unsplash.com/photo-1662049659925-6a732fc2909c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBraXNzJTIwbW91bnRhaW4lMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzczMDE0MDM4fDA&ixlib=rb-4.1.0&q=80&w=1080", "Kuss in den Bergen – Paarshooting Alpen Mario Schubert", "Kiss in the mountains – Couple shoot Alps Mario Schubert"),
  w("paarshooting", "https://images.unsplash.com/photo-1769050349380-7ee061d43ef9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBwb3J0cmFpdCUyMHN1bnNldCUyMHJvbWFudGljJTIwb3V0ZG9vcnN8ZW58MXx8fHwxNzcyOTk3NTMzfDA&ixlib=rb-4.1.0&q=80&w=1080", "Paarportrait bei Sonnenuntergang – Paarfotografie Tirol Bayern", "Couple portrait at sunset – Couple photography Tyrol Bavaria"),
  w("paarshooting", "https://images.unsplash.com/photo-1768468104186-368aeb7a266a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBsYXVnaGluZyUyMG91dGRvb3IlMjBlbmdhZ2VtZW50JTIwcGhvdG98ZW58MXx8fHwxNzcyOTk3NTM0fDA&ixlib=rb-4.1.0&q=80&w=1080", "Lachendes Paar beim Engagement-Shooting – Hochzeitsfotograf Innsbruck", "Laughing couple at engagement shoot – Wedding photographer Innsbruck"),

  // ═══════════════════════════════════════════════
  // HOCHZEIT – Freie Trauung (6 Fallback-Bilder)
  // ═══════════════════════════════════════════════
  w("freie-trauung", "https://images.unsplash.com/photo-1696271026740-4c0c1a367f03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvdXRkb29yJTIwd2VkZGluZyUyMGNlcmVtb255JTIwbmF0dXJlfGVufDF8fHx8MTc3MzAxNDAyOXww&ixlib=rb-4.1.0&q=80&w=1080", "Freie Trauung Outdoor – Hochzeitsfotografie Tirol", "Outdoor ceremony – Wedding photography Tyrol"),
  w("freie-trauung", "https://images.unsplash.com/photo-1763560836989-d3636e2f82d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvdXRkb29yJTIwd2VkZGluZyUyMGNlcmVtb255JTIwYXJjaCUyMGZsb3dlcnN8ZW58MXx8fHwxNzczMDE0MDMwfDA&ixlib=rb-4.1.0&q=80&w=1080", "Freie Trauung mit Blumenbogen – Hochzeitsfotograf Innsbruck", "Outdoor ceremony with flower arch – Wedding photographer Innsbruck"),
  w("freie-trauung", "https://images.unsplash.com/photo-1677677403344-029c7fcd7300?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwb3V0ZG9vciUyMGNlcmVtb255JTIwcnVzdGljfGVufDF8fHx8MTc3MzAxNDAzNnww&ixlib=rb-4.1.0&q=80&w=1080", "Rustikale freie Trauung – Hochzeitsfotografie Bayern", "Rustic outdoor ceremony – Wedding photography Bavaria"),
  w("freie-trauung", "https://images.unsplash.com/photo-1740688055196-a836abca5518?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvdXRkb29yJTIwY2VyZW1vbnklMjB3ZWRkaW5nJTIwdm93cyUyMG5hdHVyZXxlbnwxfHx8fDE3NzMwMTQwMzd8MA&ixlib=rb-4.1.0&q=80&w=1080", "Eheversprechen bei freier Trauung – Mario Schubert Fotografie", "Wedding vows at outdoor ceremony – Mario Schubert Photography"),
  w("freie-trauung", "https://images.unsplash.com/photo-1772404245508-3d9902599c07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY2VyZW1vbnklMjBvdXRkb29yJTIwZ2FyZGVuJTIwYWlzbGV8ZW58MXx8fHwxNzczMDE0MDMwfDA&ixlib=rb-4.1.0&q=80&w=1080", "Freie Trauung im Garten – Hochzeitsfotograf Tirol Alpen", "Garden ceremony – Wedding photographer Tyrol Alps"),
  w("freie-trauung", "https://images.unsplash.com/photo-1769812344337-ec16a1b7cef8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY2VyZW1vbnklMjBvdXRkb29yJTIwZWxlZ2FudHxlbnwxfHx8fDE3NzI5OTc1MzF8MA&ixlib=rb-4.1.0&q=80&w=1080", "Elegante freie Trauung Outdoor – Hochzeitsfotografie Innsbruck", "Elegant outdoor ceremony – Wedding photography Innsbruck"),

  // ═══════════════════════════════════════════════
  // HOCHZEIT – Party (8 Fallback-Bilder)
  // ═══════════════════════════════════════════════
  w("party", "https://images.unsplash.com/photo-1764269719300-7094d6c00533?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwcGFydHklMjBjZWxlYnJhdGlvbiUyMGRhbmNlfGVufDF8fHx8MTc3MzAxNDAyOXww&ixlib=rb-4.1.0&q=80&w=1080", "Hochzeitsparty – Feier und Tanz – Hochzeitsfotograf Innsbruck", "Wedding party – Celebration and dance – Wedding photographer Innsbruck"),
  w("party", "https://images.unsplash.com/photo-1765615201173-0ea7dcadc4bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwcmVjZXB0aW9uJTIwcGFydHklMjBndWVzdHMlMjBkYW5jaW5nfGVufDF8fHx8MTc3MzAxNDAzMHww&ixlib=rb-4.1.0&q=80&w=1080", "Hochzeitsempfang – Gäste tanzen – Hochzeitsfotografie Tirol", "Wedding reception – Guests dancing – Wedding photography Tyrol"),
  w("party", "https://images.unsplash.com/photo-1769230387364-8b0c2b63e18b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY291cGxlJTIwZmlyc3QlMjBkYW5jZSUyMGxpZ2h0c3xlbnwxfHx8fDE3NzMwMTQwMzZ8MA&ixlib=rb-4.1.0&q=80&w=1080", "Erster Tanz – Hochzeitsfeier – Hochzeitsfotograf Mario Schubert", "First dance – Wedding celebration – Wedding photographer Mario Schubert"),
  w("party", "https://images.unsplash.com/photo-1768508948986-a0cb8a3ca83b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwdG9hc3QlMjBjZWxlYnJhdGlvbiUyMGV2ZW5pbmd8ZW58MXx8fHwxNzczMDE0MDMxfDA&ixlib=rb-4.1.0&q=80&w=1080", "Hochzeitstoast – Abendfeier – Hochzeitsfotografie Bayern", "Wedding toast – Evening celebration – Wedding photography Bavaria"),
  w("party", "https://images.unsplash.com/photo-1758810411894-3c0f092f305f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwZ3Vlc3RzJTIwY2VsZWJyYXRpb24lMjBjb25mZXR0aXxlbnwxfHx8fDE3NzMwMTQwMzd8MA&ixlib=rb-4.1.0&q=80&w=1080", "Konfetti-Regen – Hochzeitsfeier – Hochzeitsfotograf Tirol", "Confetti shower – Wedding celebration – Wedding photographer Tyrol"),
  w("party", "https://images.unsplash.com/photo-1758810409984-aba17272627b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwYm91cXVldCUyMHRvc3MlMjBjZWxlYnJhdGlvbnxlbnwxfHx8fDE3NzMwMTQwMzh8MA&ixlib=rb-4.1.0&q=80&w=1080", "Brautstraußwurf – Hochzeitsparty – Hochzeitsfotografie Innsbruck", "Bouquet toss – Wedding party – Wedding photography Innsbruck"),
  w("party", "https://images.unsplash.com/photo-1633978555421-1e67d524b227?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwZGFuY2UlMjBmaXJzdCUyMHJlY2VwdGlvbnxlbnwxfHx8fDE3NzI5OTU3OTR8MA&ixlib=rb-4.1.0&q=80&w=1080", "Erster Tanz bei der Hochzeitsfeier – Hochzeitsfotograf Bayern Tirol", "First dance at wedding reception – Wedding photographer Bavaria Tyrol"),
  w("party", "https://images.unsplash.com/photo-1704455308461-1e18a7e11d28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY291cGxlJTIwZmlyc3QlMjBkYW5jZSUyMHJlY2VwdGlvbnxlbnwxfHx8fDE3NzI5OTc1MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080", "Hochzeitstanz – Hochzeitsfeier – Mario Schubert Fotografie Innsbruck", "Wedding dance – Wedding reception – Mario Schubert Photography Innsbruck"),
];

function getCachedData(): ImageEntry[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    // Don't use cache if it has suspiciously few images (stale/empty cache)
    if (!data || data.length < FALLBACK_IMAGES.length * 0.5) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

function setCachedData(data: ImageEntry[]) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {
    // localStorage might be full or unavailable
  }
}

/**
 * Clear the images localStorage cache.
 * Call this after a sync so new images are fetched on next load.
 */
export function clearImagesCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Main hook – fetches all images once, returns filtered helper.
 */
export function useImages() {
  const [state, setState] = useState<ImagesState>({
    images: FALLBACK_IMAGES,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Check cache first
    const cached = getCachedData();
    if (cached && cached.length > 0) {
      setState({ images: cached, loading: false, error: null });
      return;
    }

    let cancelled = false;

    async function fetchImages() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch("/api/get-images", { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        if (!cancelled && data.images && data.images.length > 0) {
          // Merge: API images take priority, fallback fills missing categories
          const apiCategories = new Set(
            data.images.map((img: ImageEntry) => `${img.page}:${img.category}`)
          );
          const fallbackFill = FALLBACK_IMAGES.filter(
            (img) => !apiCategories.has(`${img.page}:${img.category}`)
          );
          const merged = [...data.images, ...fallbackFill];
          setCachedData(merged);
          setState({ images: merged, loading: false, error: null });
        } else if (!cancelled) {
          // API returned empty – keep fallback
          setState((prev) => ({ ...prev, loading: false }));
        }
      } catch (err: any) {
        console.warn("Failed to fetch images from API, using fallback:", err.message);
        if (!cancelled) {
          setState((prev) => ({ ...prev, loading: false, error: err.message }));
        }
      }
    }

    fetchImages();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Filter images by page and optionally by category.
   * Returns { src, alt } objects ready for gallery rendering.
   */
  const getImagesForPage = useMemo(
    () =>
      (page: string, category?: string, lang: string = "de") => {
        return state.images
          .filter(
            (img) =>
              img.page === page.toLowerCase() &&
              (!category || img.category === category.toLowerCase())
          )
          .map((img) => ({
            src: img.src,
            alt: lang === "de" ? img.altDe : img.altEn,
            category: img.category,
          }));
      },
    [state.images]
  );

  return {
    ...state,
    getImagesForPage,
    allImages: state.images,
  };
}