import type { NextRequest } from 'next/server';
import cheerio from 'cheerio';

// Simple in-memory cache (server instance scoped). TTL configurable via BMKG_CACHE_TTL (ms)
let CACHE: { data: any | null; expires: number } = { data: null, expires: 0 };

export async function GET(req: NextRequest) {
  const url = process.env.BMKG_TEGAL_PAGE_URL || 'https://www.bmkg.go.id/cuaca/prakiraan-cuaca';
  const ttl = process.env.BMKG_CACHE_TTL ? parseInt(process.env.BMKG_CACHE_TTL) : 1000 * 60 * 10; // 10m

  if (CACHE.expires > Date.now() && CACHE.data) {
    return new Response(JSON.stringify({ success: true, cached: true, source: url, data: CACHE.data }), { status: 200 });
  }

  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BMKG-Scraper/1.0)' } });
    if (!res.ok) throw new Error(`fetch ${url} failed: ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    // Best-effort extraction heuristics
    const metaDesc = $('meta[name="description"]').attr('content') || '';
    const h1 = $('h1').first().text().trim() || $('h2').first().text().trim();

    // Try to find temperature or condition by regex in the HTML
    const tempMatch = html.match(/(\d{1,2}(?:\.|,)?\d?)\s?°\s?C/i) || html.match(/\bSuhu[:\s]*([0-9]{1,2})/i);
    const temp = tempMatch ? tempMatch[0].replace(/\s+/g, ' ').trim() : null;

    // Try common class names or id's used on BMKG pages
    const condSel = $('.cuaca, .weather, .kondisi, .prakiraan, .title').first().text().trim();

    const data = {
      location: h1 || 'Tegal',
      temp: temp || null,
      condition: condSel || metaDesc || null,
      fetched_at: new Date().toISOString(),
    };

    CACHE = { data, expires: Date.now() + ttl };
    return new Response(JSON.stringify({ success: true, cached: false, source: url, data }), { status: 200 });
  } catch (err: any) {
    const errMsg = String(err?.message || err);
    // Return last known cache if available
    if (CACHE.data) {
      return new Response(JSON.stringify({ success: true, cached: true, source: url, data: CACHE.data, warning: errMsg }), { status: 200 });
    }
    return new Response(JSON.stringify({ success: false, error: errMsg }), { status: 500 });
  }
}

export const runtime = 'nodejs';
