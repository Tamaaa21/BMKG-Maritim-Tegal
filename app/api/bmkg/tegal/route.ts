import type { NextRequest } from 'next/server';

// Simple in-memory cache (server instance scoped). TTL configurable via BMKG_CACHE_TTL (ms)
let CACHE: { data: any | null; expires: number } = { data: null, expires: 0 };

// Fallback mock data if scraping fails
const FALLBACK_DATA = {
  city: 'Perairan Tegal, Jawa Tengah',
  temp: 29,
  condition: 'Cerah Berawan',
  wind: { speed_kmh: 7, speed_knots: 4, direction_from: 'Timur' },
  humidity: 75,
  waves: 0.2,
  tide: 'Naik',
  tideTime: '20.00 WIB',
  current: { speed_knots: 0.9, speed_kmh: 1.7, direction_to: 'Barat' },
  updated: new Date().toISOString(),
};

export async function GET(req: NextRequest) {
  const ttl = process.env.BMKG_CACHE_TTL ? parseInt(process.env.BMKG_CACHE_TTL) : 1000 * 60 * 10; // 10m default

  if (CACHE.expires > Date.now() && CACHE.data) {
    return new Response(
      JSON.stringify({ success: true, cached: true, data: CACHE.data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const data = await fetchBMKGMaritimData();
    CACHE = { data, expires: Date.now() + ttl };
    return new Response(
      JSON.stringify({ success: true, cached: false, data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    const errMsg = String(err?.message || err);
    const fallback = CACHE.data || FALLBACK_DATA;
    return new Response(
      JSON.stringify({ success: true, cached: !CACHE.data, data: fallback, warning: errMsg }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function fetchBMKGMaritimData() {
  // Scrape from BMKG Maritim page for Tegal (Perairan Laut 02 - P.L.02)
  const pageUrl = 'https://www.bmkg.go.id/cuaca/maritim/P.L.02';
  
  const res = await fetch(pageUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
  });

  if (!res.ok) throw new Error(`BMKG page fetch failed: ${res.status}`);

  const html = await res.text();

  // Dynamic import of cheerio to avoid build-time failure
  let $: any = null;
  try {
    const mod = await import('cheerio');
    $ = mod.default ? mod.default.load(html) : mod.load(html);
  } catch (impErr) {
    // Fallback: regex-based parsing
    return parseHTMLManual(html);
  }

  // Parse page with cheerio
  const data = parseHTMLWithCheerio($);
  if (data) return data;

  // Fallback to manual parsing
  return parseHTMLManual(html);
}

function parseHTMLWithCheerio($: any) {
  try {
    // Look for temperature
    const tempMatch = $('body').html()?.match(/(\d{1,2})\s*°\s*C/);
    const temp = tempMatch ? parseInt(tempMatch[1]) : 29;

    // Look for condition (Cuaca/Kondisi)
    const conditionText = $('[class*="cuaca"], [class*="weather"], [class*="kondisi"]').first().text() || 'Cerah Berawan';

    // Look for wind speed (Kecepatan Angin) and direction
    const windKnotsMatch = $('body').html()?.match(/Kecepatan\s+Angin[:\s]*(\d+(?:\.\d+)?)\s*knots?/i) ||
                 $('body').html()?.match(/Angin[:\s]*(\d+(?:\.\d+)?)\s*knots?/i);
    const windKnots = windKnotsMatch ? parseFloat(windKnotsMatch[1]) : 4;
    const windSpeed = Math.round(windKnots * 1.852); // Convert knots to km/h

    // Look for wind direction phrasing
    const windDirMatch = $('body').html()?.match(/Arah Angin dari[:\s]*([A-Za-z\s]+)/i) ||
               $('body').html()?.match(/Arah Angin[:\s]*([A-Za-z\s]+)/i);
    const windDir = windDirMatch ? windDirMatch[1].trim() : 'Timur';

    // Look for waves (Gelombang)
    const waveMatch = $('body').html()?.match(/Gelombang[:\s]*(\d+(?:\.\d+)?)\s*m/i);
    const waves = waveMatch ? parseFloat(waveMatch[1]) : 0.2;

    // Look for current (Kecepatan Arus) and direction to
    const currentKnotsMatch = $('body').html()?.match(/Kecepatan\s+Arus[:\s]*(\d+(?:\.\d+)?)\s*knots?/i);
    const currentKnots = currentKnotsMatch ? parseFloat(currentKnotsMatch[1]) : null;
    const currentDirMatch = $('body').html()?.match(/Arah\s+Arus\s*(?:ke|:)?[:\s]*([A-Za-z\s]+)/i);
    const currentDir = currentDirMatch ? currentDirMatch[1].trim() : null;

    // Look for tide info
    const tideMatch = $('body').html()?.match(/Pasang\s*Surut[:\s]*(\w+)/i);
    const tide = tideMatch ? tideMatch[1] : 'Naik';

    const data = {
      city: 'Perairan Tegal, Jawa Tengah',
      temp,
      condition: conditionText.trim() || 'Cerah Berawan',
      wind: {
        speed_kmh: Math.round(windSpeed),
        speed_knots: Math.round(windKnots),
        direction_from: windDir,
      },
      humidity: 75,
      waves,
      tide,
      tideTime: '20.00 WIB',
      current: currentKnots != null ? { speed_knots: currentKnots, speed_kmh: Math.round(currentKnots * 1.852), direction_to: currentDir || '—' } : null,
      updated: new Date().toISOString(),
    };

    return data;
  } catch {
    return null;
  }
}

function parseHTMLManual(html: string) {
  // Manual parsing using regex
  try {
    // Extract temperature
    const tempMatch = html.match(/(\d{1,2})\s*°\s*C/) || html.match(/Suhu[:\s]*(\d{1,2})/i);
    const temp = tempMatch ? parseInt(tempMatch[1]) : 29;

    // Extract condition
    let condition = 'Cerah Berawan';
    const condMatches = [
      /Cerah(?:\s+Berawan)?/i,
      /Berawan(?:\s+Tebal)?/i,
      /Hujan/i,
      /Badai/i,
    ];
    for (const regex of condMatches) {
      if (regex.test(html)) {
        condition = html.match(regex)?.[0] || condition;
        break;
      }
    }

    // Extract wind (in knots)
    // Extract wind (in knots) and direction
    const windKnotsMatch = html.match(/(?:Kecepatan\s+Angin|Angin)[:\s]*(\d+(?:\.\d+)?)\s*(?:knots?|kt)/i);
    const windKnots = windKnotsMatch ? parseFloat(windKnotsMatch[1]) : 4;
    const windSpeed = Math.round(windKnots * 1.852);

    // Extract wind direction (Arah Angin dari)
    let windDir = 'Timur';
    const windDirMatch = html.match(/Arah Angin dari[:\s]*([A-Za-z\s]+)/i) || html.match(/Arah Angin[:\s]*([A-Za-z\s]+)/i);
    if (windDirMatch) windDir = windDirMatch[1].trim();

    // Extract current (arus)
    const currentKnotsMatch = html.match(/Kecepatan\s+Arus[:\s]*(\d+(?:\.\d+)?)\s*knots?/i);
    const currentKnots = currentKnotsMatch ? parseFloat(currentKnotsMatch[1]) : null;
    const currentDirMatch = html.match(/Arah\s+Arus\s*(?:ke|:)?[:\s]*([A-Za-z\s]+)/i);
    const currentDir = currentDirMatch ? currentDirMatch[1].trim() : null;

    // Extract waves
    const waveMatch = html.match(/Gelombang[:\s]*(\d+(?:\.\d+)?)\s*m/i);
    const waves = waveMatch ? parseFloat(waveMatch[1]) : 0.2;

    // Extract tide
    const tideMatch = html.match(/(?:Pasang\s*Surut|Arus)[:\s]*(\w+)/i);
    const tide = tideMatch ? tideMatch[1] : 'Naik';

    return {
      city: 'Perairan Tegal, Jawa Tengah',
      temp,
      condition,
      wind: { speed_kmh: windSpeed, speed_knots: Math.round(windKnots), direction_from: windDir },
      humidity: 75,
      waves,
      tide,
      tideTime: formatTime(),
      current: currentKnots != null ? { speed_knots: currentKnots, speed_kmh: Math.round(currentKnots * 1.852), direction_to: currentDir || '—' } : null,
      updated: new Date().toISOString(),
    };
  } catch (err) {
    throw new Error('Failed to parse BMKG HTML');
  }
}

function formatTime(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}.${minutes} WIB`;
}

export const runtime = 'nodejs';
