/** Catálogo público V14. Solo consulta columnas públicas, RLS decide qué filas se ven. */
export const PUBLIC_COLUMNS = 'id,title,description,category,ticket_price_cop,total_numbers,draw_at,state';
export const PUBLIC_LIMIT = 12;

export function catalogUrl(baseUrl) {
  const url = new URL('/rest/v1/ets_raffles', baseUrl);
  url.searchParams.set('select', PUBLIC_COLUMNS);
  url.searchParams.set('state', 'eq.published');
  url.searchParams.set('order', 'draw_at.asc');
  url.searchParams.set('limit', String(PUBLIC_LIMIT));
  return url.href;
}

export function normalizePublicRow(row) {
  if (!row || row.state !== 'published' || typeof row.id !== 'string' || typeof row.title !== 'string' || !row.title.trim()) return null;
  return {
    id: row.id,
    title: row.title.slice(0, 140),
    description: typeof row.description === 'string' ? row.description.slice(0, 280) : '',
    category: typeof row.category === 'string' ? row.category.slice(0, 60) : '',
    drawAt: typeof row.draw_at === 'string' ? row.draw_at : '',
    price: Number.isSafeInteger(row.ticket_price_cop) && row.ticket_price_cop > 0 ? row.ticket_price_cop : null,
    totalNumbers: Number.isSafeInteger(row.total_numbers) && row.total_numbers > 0 ? row.total_numbers : null
  };
}

export async function fetchPublicCatalog(configuration, fetcher = fetch) {
  if (!configuration || typeof configuration.url !== 'string' || !/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(configuration.url) || !/^sb_publishable_/.test(configuration.publishableKey || '')) {
    throw new Error('La consulta pública todavía no está configurada.');
  }
  const response = await fetcher(catalogUrl(configuration.url), {
    method: 'GET',
    headers: { apikey: configuration.publishableKey, Accept: 'application/json' },
    cache: 'no-store'
  });
  if (!response.ok) throw new Error('No se pudo consultar el catálogo público.');
  const rows = await response.json();
  if (!Array.isArray(rows)) throw new Error('Respuesta inesperada del catálogo.');
  // Defensa adicional de cliente; la autorización efectiva debe ocurrir en PostgreSQL por RLS.
  return rows.map(normalizePublicRow).filter(Boolean).slice(0, PUBLIC_LIMIT);
}