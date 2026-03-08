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
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

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
  w("kirchliche-trauung", "https://ik.imagekit.io/r2yqrg6np/Wedding/kirchliche%20Trauung/250607_BobanElena_MidRes_0251.jpg?updatedAt=1773003721533", "Hochzeit Kirche – Hochzeitsfotograf Innsbruck Tirol", "Church wedding – Wedding photographer Innsbruck Tyrol"),
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
        const response = await fetch("/api/get-images");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        if (!cancelled && data.images && data.images.length > 0) {
          setCachedData(data.images);
          setState({ images: data.images, loading: false, error: null });
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
