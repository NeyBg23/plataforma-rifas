import { fetchPublicCatalog } from './public-catalog.mjs?v=20.0.0';

const themeToggle = document.getElementById('theme-toggle');
const themeGlyph = document.getElementById('theme-glyph');
const themeLabel = document.getElementById('theme-label');
const menuToggle = document.getElementById('menu-toggle');
const mobileNav = document.getElementById('mobile-nav');
const campaignStatus = document.getElementById('campaign-status');
const campaignList = document.getElementById('campaign-list');
const THEME_KEY = 'ets-site-theme';
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const money = value => new Intl.NumberFormat('es-CO', {style:'currency',currency:'COP',maximumFractionDigits:0}).format(value);

function applyTheme(theme) {
  const normalized = theme === 'light' ? 'light' : 'dark';
  document.body.dataset.theme = normalized;
  themeGlyph.textContent = normalized === 'dark' ? '☀' : '☾';
  themeLabel.textContent = normalized === 'dark' ? 'Tema claro' : 'Tema oscuro';
  themeToggle.setAttribute('aria-label', normalized === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro');
  try { localStorage.setItem(THEME_KEY, normalized); } catch { /* sin almacenamiento */ }
}
try { applyTheme(localStorage.getItem(THEME_KEY)); } catch { applyTheme('dark'); }
themeToggle.addEventListener('click', () => applyTheme(document.body.dataset.theme === 'dark' ? 'light' : 'dark'));
menuToggle.addEventListener('click', () => {
  const show = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(show));
  menuToggle.setAttribute('aria-label', show ? 'Cerrar menú' : 'Abrir menú');
  mobileNav.hidden = !show;
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mobileNav.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
}));

function noCampaigns() {
  campaignStatus.hidden = true;
  campaignList.innerHTML = `<div class="campaign-empty"><div class="empty-emblem" aria-hidden="true">✧</div><div><span class="eyebrow">PRÓXIMAMENTE</span><h3>Los próximos sorteos están por llegar.</h3><p>Cuando abra un nuevo sorteo, encontrarás aquí su premio, fecha y números.</p><a href="#como-funciona">Cómo participar <span aria-hidden="true">↗</span></a></div><div class="empty-art" aria-hidden="true">✦</div></div>`;
}
function campaignCard(item) {
  const draw = item.drawAt && !Number.isNaN(new Date(item.drawAt).getTime()) ? new Date(item.drawAt).toLocaleDateString('es-CO',{day:'numeric',month:'long',year:'numeric',timeZone:'America/Bogota'}) : 'Por confirmar';
  const paymentUrl = 'pagar/?rifa=' + encodeURIComponent(item.id);
  const action = item.canOrder
    ? `<a class="public-readonly" href="${escapeHtml(paymentUrl)}">Elegir números ↗</a>`
    : '<span>Sorteo anunciado</span>';
  return `<article class="campaign-card"><div class="campaign-visual" aria-hidden="true">✦</div><div class="campaign-body"><span class="campaign-tag">${escapeHtml(item.category || 'Campaña')}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description || 'Consulta la información de la campaña.')}</p><div class="campaign-facts"><span>Fecha: <strong>${escapeHtml(draw)}</strong></span><span>Números: <strong>${item.totalNumbers ?? '—'}</strong></span></div><div class="campaign-bottom"><span>${item.price ? money(item.price) + ' / número' : 'Valor por confirmar'}</span>${action}</div></div></article>`;
}
async function loadCampaigns() {
  try {
    const list = await fetchPublicCatalog(window.ETS_PUBLIC_SUPABASE);
    if (!list.length) { noCampaigns(); return; }
    campaignStatus.hidden = true;
    campaignList.innerHTML = list.map(campaignCard).join('');
  } catch (error) {
    campaignStatus.hidden = false;
    campaignStatus.classList.add('catalog-warning');
    campaignStatus.innerHTML = `<span aria-hidden="true">◇</span> No pudimos cargar los sorteos. <button type="button" id="retry-catalog">Volver a intentar ↻</button>`;
    document.getElementById('retry-catalog').addEventListener('click', () => {
      campaignStatus.classList.remove('catalog-warning');
      campaignStatus.textContent = 'Cargando sorteos…';
      loadCampaigns();
    });
    campaignList.replaceChildren();
    console.warn('Catálogo público no disponible:', error.message);
  }
}
loadCampaigns();
