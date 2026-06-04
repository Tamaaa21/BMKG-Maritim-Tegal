"use client";

import React from 'react';
import { Cloud, Sun, Moon, Wind, Droplets, Waves, ArrowUp, Loader } from 'lucide-react';
import { format, parseISO } from 'date-fns';

async function fetchWithTimeout(url: string, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    clearTimeout(id);
    if (!res.ok) {
      // try to parse body for a helpful error message
      let bodyText = '';
      try {
        const json = await res.json();
        bodyText = json?.message || json?.error || json?.warning || JSON.stringify(json);
      } catch {
        try {
          bodyText = await res.text();
        } catch {
          bodyText = '';
        }
      }
      throw new Error(`Fetch error ${res.status}${bodyText ? `: ${bodyText}` : ''}`);
    }
    return res.json();
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

function formatDateTime(ts?: string) {
  try {
    if (!ts) return '';
    const d = parseISO(ts);
    return format(d, "dd LLL yyyy • HH.mm 'WIB'");
  } catch {
    return ts || '';
  }
}

function getIcon(condition: string, hour?: number) {
  const c = (condition || '').toLowerCase();
  const isNight = typeof hour === 'number' ? hour < 6 || hour >= 18 : false;
  if (c.includes('hujan') || c.includes('rain')) return <Cloud className="text-white" size={40} />;
  if (c.includes('berawan') || c.includes('cloud')) return isNight ? <Moon className="text-white" size={40} /> : <Cloud className="text-white" size={40} />;
  return isNight ? <Moon className="text-white" size={40} /> : <Sun className="text-yellow-300" size={40} />;
}

function rotateFromCompass(dir?: string) {
  if (!dir) return 0;
  const map: Record<string, number> = {
    'utara': 0,
    'timur laut': 45,
    'timur': 90,
    'tenggara': 135,
    'selatan': 180,
    'barat daya': 225,
    'barat': 270,
    'barat laut': 315,
    'north': 0, 'northeast': 45, 'east': 90, 'southeast': 135, 'south': 180, 'southwest': 225, 'west': 270, 'northwest': 315
  };
  const k = dir.toLowerCase().trim();
  if (map[k] !== undefined) return map[k];
  const short = k.replace(/[^a-z]/g, '');
  return map[short] ?? 0;
}

function waveBadge(waves: number | null) {
  if (waves == null) return null;
  if (waves < 1.25) return <span className="inline-block text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Rendah</span>;
  if (waves < 2.5) return <span className="inline-block text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Sedang</span>;
  return <span className="inline-block text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Tinggi</span>;
}

export default function WeatherCard({ location = 'P.L.02' }: { location?: string }) {
  const [data, setData] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showRaw, setShowRaw] = React.useState<boolean>(false);

  const fetcher = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use BMKG proxy for 'cuaca biasa' (Perintah adm4 for Tegal)
      const res = await fetchWithTimeout('/api/weather?source=bmkg&adm4=33.76.02.1002', 5000);
      if (res?.success && res.data) setData(res.data);
      else if (res?.data) setData(res.data);
      else throw new Error(res?.warning || 'Invalid response');
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [location]);

  React.useEffect(() => {
    let mounted = true;
    const run = async () => {
      await fetcher();
    };
    if (mounted) run();
    const iv = setInterval(() => { if (mounted) fetcher(); }, 60 * 1000);
    return () => { mounted = false; clearInterval(iv); };
  }, [fetcher]);

  if (loading && !data) {
    return (
      <div className="flex-1 min-h-0 rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 shadow-2xl flex flex-col">
        <div className="h-6 w-3/5 bg-white/20 rounded mb-4" />
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/10 rounded-full" />
          <div>
            <div className="h-12 w-28 bg-white/20 rounded mb-2" />
            <div className="h-4 w-40 bg-white/10 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[0, 1, 2, 3].map(i => <div key={i} className="h-16 bg-white/10 rounded" />)}
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-red-400/40 rounded-2xl p-5 text-red-200">
        Gagal mengambil data prakiraan: {error}
      </div>
    );
  }

  const model = data || null;
  const hour = model?.updated ? new Date(model.updated).getHours() : new Date().getHours();

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-2xl h-full">
      <div className="flex items-center justify-between mb-4 border-b border-white/20 pb-3">
        <div>
          <p className="text-white font-semibold text-sm">{`Cuaca Tegal (BMKG)` + (location ? ` • ${location}` : '')}</p>
          <p className="text-blue-200 text-xs">{formatDateTime(model?.updated)}</p>
        </div>
        <div className="flex items-center gap-2">
          {loading ? <Loader size={14} className="text-blue-300 animate-spin" /> : <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
          <span className="text-green-300 text-xs">Live</span>
          <button onClick={() => setShowRaw(r => !r)} className="ml-3 text-xs text-blue-100 underline">{showRaw ? 'Hide raw' : 'Show raw'}</button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-5">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center mb-1">
            {getIcon(model?.condition || '', hour)}
          </div>
        </div>
        <div>
          <div className="flex items-start">
            <span className="text-white text-6xl font-bold leading-none">{model?.temp ?? '—'}</span>
            <span className="text-white text-2xl font-light mt-2">°C</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">{model?.condition || '—'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <div className="bg-white/10 rounded-xl p-3">
          <p className="text-blue-200 text-xs">Kelembapan</p>
          <p className="text-white text-lg font-semibold">{model?.humidity ?? '—'}%</p>
        </div>

        <div className="bg-white/10 rounded-xl p-3">
          <p className="text-blue-200 text-xs">Gelombang</p>
          <p className="text-white text-lg font-semibold">{model?.waves ?? '—'} m</p>
          <div className="mt-1">{waveBadge(model?.waves ?? null)}</div>
        </div>

        <div className="bg-white/10 rounded-xl p-3">
          <p className="text-blue-200 text-xs">Kecepatan Angin</p>
          <p className="text-white text-lg font-semibold">{model?.wind?.speed_knots ? `${model.wind.speed_knots} knots` : (model?.wind?.speed_kmh ? `${model.wind.speed_kmh} km/h` : '—')}</p>
        </div>

        <div className="bg-white/10 rounded-xl p-3">
          <p className="text-blue-200 text-xs">Arah Angin dari</p>
          <p className="text-white text-lg font-semibold">{model?.wind?.direction_from || model?.wind?.direction || '—'}</p>
        </div>

        <div className="bg-white/10 rounded-xl p-3">
          <p className="text-blue-200 text-xs">Kecepatan Arus</p>
          <p className="text-white text-lg font-semibold">{model?.current?.speed_knots ? `${model.current.speed_knots} knots` : (model?.current?.speed_kmh ? `${model.current.speed_kmh} km/h` : '—')}</p>
        </div>

        <div className="bg-white/10 rounded-xl p-3">
          <p className="text-blue-200 text-xs">Arah Arus ke</p>
          <p className="text-white text-lg font-semibold">{model?.current?.direction_to || '—'}</p>
        </div>
      </div>
      <div className="mt-3 text-right">
        <a href="/prakiraan" className="text-blue-200 text-xs underline">Prakiraan per Jam (WIB) →</a>
      </div>
      {showRaw && (
        <div className="mt-4 bg-white/5 p-3 rounded text-xs max-h-60 overflow-auto">
          <pre className="whitespace-pre-wrap text-white">{JSON.stringify(model, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
