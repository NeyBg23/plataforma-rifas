(() => {
  const app = document.getElementById('app');
  const toastNode = document.getElementById('toast');
  const menuBtn = document.getElementById('mobile-menu');
  const nav = document.querySelector('.main-nav');
  const draftKey = 'el-toque-de-la-suerte-v4-drafts';
  const reserveKey = 'el-toque-de-la-suerte-v4-reserves';

  const raffles = [
    {
      id: 'moto-01',
      name: 'Yamaha MT-03 2026',
      category: 'moto',
      badge: 'Favorita',
      badgeClass: 'hot',
      image: 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%201000%20640%22%3E%3Cdefs%3E%3CradialGradient%20id%3D%22bg%22%3E%3Cstop%20stop-color%3D%22%23273d5c%22/%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23101c2b%22/%3E%3C/radialGradient%3E%3ClinearGradient%20id%3D%22metal%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20stop-color%3D%22%23e6eef5%22/%3E%3Cstop%20offset%3D%22.45%22%20stop-color%3D%22%238497aa%22/%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23d9e4e9%22/%3E%3C/linearGradient%3E%3ClinearGradient%20id%3D%22gold%22%3E%3Cstop%20stop-color%3D%22%23f8d88d%22/%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23a87838%22/%3E%3C/linearGradient%3E%3Cfilter%20id%3D%22shadow%22%3E%3CfeGaussianBlur%20stdDeviation%3D%2219%22/%3E%3C/filter%3E%3C/defs%3E%3Crect%20width%3D%221000%22%20height%3D%22640%22%20fill%3D%22url%28%23bg%29%22/%3E%3Cg%20opacity%3D%22.23%22%20stroke%3D%22%2391a7bd%22%20stroke-width%3D%221%22%3E%3Cpath%20d%3D%22M0%20480H1000M0%20535H1000M0%20595H1000M70%200V640M250%200V640M430%200V640M610%200V640M790%200V640M970%200V640%22/%3E%3C/g%3E%3Cellipse%20cx%3D%22510%22%20cy%3D%22538%22%20rx%3D%22370%22%20ry%3D%2238%22%20fill%3D%22%23000%22%20opacity%3D%22.6%22%20filter%3D%22url%28%23shadow%29%22/%3E%3Cg%20transform%3D%22translate%2835%2033%29%22%3E%3Ccircle%20cx%3D%22242%22%20cy%3D%22463%22%20r%3D%22112%22%20fill%3D%22%230b1017%22%20stroke%3D%22%23b8c1c6%22%20stroke-width%3D%2214%22/%3E%3Ccircle%20cx%3D%22242%22%20cy%3D%22463%22%20r%3D%2275%22%20fill%3D%22%23111c28%22%20stroke%3D%22%23415669%22%20stroke-width%3D%2217%22/%3E%3Ccircle%20cx%3D%22242%22%20cy%3D%22463%22%20r%3D%2227%22%20fill%3D%22%23a7b7c7%22/%3E%3Ccircle%20cx%3D%22771%22%20cy%3D%22463%22%20r%3D%22112%22%20fill%3D%22%230b1017%22%20stroke%3D%22%23b8c1c6%22%20stroke-width%3D%2214%22/%3E%3Ccircle%20cx%3D%22771%22%20cy%3D%22463%22%20r%3D%2275%22%20fill%3D%22%23111c28%22%20stroke%3D%22%23415669%22%20stroke-width%3D%2217%22/%3E%3Ccircle%20cx%3D%22771%22%20cy%3D%22463%22%20r%3D%2227%22%20fill%3D%22%23a7b7c7%22/%3E%3Cg%20stroke%3D%22%23718597%22%20stroke-width%3D%228%22%20opacity%3D%22.85%22%3E%3Cpath%20d%3D%22M242%20388v150M167%20463h150M189%20410l106%20106M189%20516l106-106M771%20388v150M696%20463h150M718%20410l106%20106M718%20516l106-106%22/%3E%3C/g%3E%3Cpath%20d%3D%22M247%20463l142-147%20148%2018%2088%20130H247z%22%20fill%3D%22none%22%20stroke%3D%22url%28%23metal%29%22%20stroke-width%3D%2227%22%20stroke-linejoin%3D%22round%22/%3E%3Cpath%20d%3D%22M364%20303q64-112%20187-92l100%2081-48%2068-83-31-105%203z%22%20fill%3D%22url%28%23gold%29%22/%3E%3Cpath%20d%3D%22M391%20311q67-69%20150-51l67%2043-33%2021-139-2z%22%20fill%3D%22%23172438%22/%3E%3Cpath%20d%3D%22M575%20325l88-65%2075%2024-48%2032-69%2048z%22%20fill%3D%22%23e9edf1%22/%3E%3Cpath%20d%3D%22M644%20267l93-30%2053%2030-70%2016z%22%20fill%3D%22%23121b27%22/%3E%3Cpath%20d%3D%22M341%20291q85-41%20160-15l-29%2028-116%2015z%22%20fill%3D%22%230d131d%22/%3E%3Cpath%20d%3D%22M533%20334l51%20139h-76l-51-111z%22%20fill%3D%22%23a0acb9%22/%3E%3Cpath%20d%3D%22M591%20359l98%20106h84%22%20fill%3D%22none%22%20stroke%3D%22%23c4cdd3%22%20stroke-width%3D%2219%22/%3E%3Cpath%20d%3D%22M744%20255l27-103%2024-2%2020%2022%22%20stroke%3D%22%23c4cdd3%22%20stroke-width%3D%2213%22%20stroke-linecap%3D%22round%22%20fill%3D%22none%22/%3E%3Cpath%20d%3D%22M782%20151h67%22%20stroke%3D%22%23f6d898%22%20stroke-width%3D%2215%22%20stroke-linecap%3D%22round%22/%3E%3Cpath%20d%3D%22M332%20288l-39-33-95%206%22%20fill%3D%22none%22%20stroke%3D%22%23aab7c5%22%20stroke-width%3D%2213%22%20stroke-linecap%3D%22round%22/%3E%3Cpath%20d%3D%22M190%20259h-47%22%20stroke%3D%22%23e7d39d%22%20stroke-width%3D%2216%22%20stroke-linecap%3D%22round%22/%3E%3Cpath%20d%3D%22M384%20370l-49%2070h178%22%20fill%3D%22none%22%20stroke%3D%22%23d7dee4%22%20stroke-width%3D%2217%22/%3E%3Cpath%20d%3D%22M649%20297l46%2043%2042-13%22%20fill%3D%22none%22%20stroke%3D%22%23eacb82%22%20stroke-width%3D%228%22/%3E%3Cpath%20d%3D%22M408%20320l50%201%22%20stroke%3D%22%23f6e7b2%22%20stroke-width%3D%227%22/%3E%3C/g%3E%3Ctext%20x%3D%2265%22%20y%3D%2285%22%20fill%3D%22%23e6be76%22%20font-size%3D%2218%22%20font-family%3D%22Arial%22%20letter-spacing%3D%229%22%3EEDICI%C3%93N%20PREMIOS%3C/text%3E%3Ccircle%20cx%3D%22890%22%20cy%3D%2290%22%20r%3D%2246%22%20stroke%3D%22%23d5b675%22%20fill%3D%22none%22%20opacity%3D%22.28%22/%3E%3C/svg%3E%0A',
      price: 25000,
      total: 10000,
      soldPercent: 67,
      drawDate: '28 de diciembre de 2026',
      winnerDate: '8:00 p. m.',
      desc: 'Una motocicleta deportiva ideal para ciudad y carretera, con diseño agresivo, excelente maniobrabilidad y estilo premium.',
      legal: 'Rifa en fase de configuración comercial. Datos visuales de demostración.',
      highlights: ['Factura y garantía del premio', 'Atención al cliente', 'Selección de números en línea'],
    },
    {
      id: 'auto-02',
      name: 'Mazda 2 Grand Touring',
      category: 'auto',
      badge: 'Nuevo',
      badgeClass: 'ok',
      image: 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20900%20600%22%3E%3Cdefs%3E%3CradialGradient%20id%3D%22b%22%3E%3Cstop%20stop-color%3D%22%2322434f%22/%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%2310232e%22/%3E%3C/radialGradient%3E%3ClinearGradient%20id%3D%22c%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20stop-color%3D%22%23faf8ed%22/%3E%3Cstop%20offset%3D%22.5%22%20stop-color%3D%22%239eaeae%22/%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23e8e5d7%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%22900%22%20height%3D%22600%22%20fill%3D%22url%28%23b%29%22/%3E%3Ccircle%20cx%3D%22700%22%20cy%3D%22170%22%20r%3D%22170%22%20fill%3D%22%238bc8c6%22%20opacity%3D%22.05%22/%3E%3Cellipse%20cx%3D%22470%22%20cy%3D%22468%22%20rx%3D%22352%22%20ry%3D%2230%22%20fill%3D%22%2303070c%22%20opacity%3D%22.4%22/%3E%3Cpath%20d%3D%22M115%20337l83-30%20100-103q27-25%2086-25h175q46%200%2081%2026l83%2096%2060%2027q34%2014%2035%2058v46H100v-50q0-28%2015-45z%22%20fill%3D%22url%28%23c%29%22%20stroke%3D%22%23829598%22%20stroke-width%3D%225%22/%3E%3Cpath%20d%3D%22M298%20289l65-77h191l70%2077z%22%20fill%3D%22%2316303e%22/%3E%3Cpath%20d%3D%22M481%20211v78%22%20stroke%3D%22%23b9c6c4%22%20stroke-width%3D%227%22/%3E%3Cpath%20d%3D%22M126%20350h648%22%20stroke%3D%22%23e4efed%22%20opacity%3D%22.5%22%20stroke-width%3D%226%22/%3E%3Ccircle%20cx%3D%22269%22%20cy%3D%22430%22%20r%3D%2281%22%20fill%3D%22%230a1119%22/%3E%3Ccircle%20cx%3D%22269%22%20cy%3D%22430%22%20r%3D%2249%22%20fill%3D%22%23c6d2d2%22/%3E%3Ccircle%20cx%3D%22269%22%20cy%3D%22430%22%20r%3D%2224%22%20fill%3D%22%23768b90%22/%3E%3Ccircle%20cx%3D%22674%22%20cy%3D%22430%22%20r%3D%2281%22%20fill%3D%22%230a1119%22/%3E%3Ccircle%20cx%3D%22674%22%20cy%3D%22430%22%20r%3D%2249%22%20fill%3D%22%23c6d2d2%22/%3E%3Ccircle%20cx%3D%22674%22%20cy%3D%22430%22%20r%3D%2224%22%20fill%3D%22%23768b90%22/%3E%3Cpath%20d%3D%22M120%20356h67v36h-77M732%20356h70v37h-64%22%20fill%3D%22%23ffdb93%22/%3E%3Cpath%20d%3D%22M382%20337h79%22%20stroke%3D%22%237e9295%22%20stroke-width%3D%226%22/%3E%3Ctext%20x%3D%2246%22%20y%3D%2273%22%20fill%3D%22%23e6c785%22%20font-family%3D%22Arial%22%20font-size%3D%2219%22%20letter-spacing%3D%227%22%3EGRAN%20PREMIO%3C/text%3E%3C/svg%3E%0A',
      price: 50000,
      total: 15000,
      soldPercent: 42,
      drawDate: '15 de enero de 2027',
      winnerDate: '7:30 p. m.',
      desc: 'Automóvil elegante, moderno y eficiente, pensado para quienes buscan comodidad, tecnología y diseño en un solo premio.',
      legal: 'Visualización de producto. No corresponde a una campaña activa de venta.',
      highlights: ['Premio principal de alto valor', 'Múltiples medios de pago', 'Historial de participación'],
    },
    {
      id: 'tech-03',
      name: 'Kit Tech Premium',
      category: 'tecnologia',
      badge: 'Popular',
      badgeClass: 'ok',
      image: 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20900%20600%22%3E%3Cdefs%3E%3CradialGradient%20id%3D%22bg%22%3E%3Cstop%20stop-color%3D%22%233e2c5d%22/%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23151a32%22/%3E%3C/radialGradient%3E%3ClinearGradient%20id%3D%22phone%22%3E%3Cstop%20stop-color%3D%22%239c8bc2%22/%3E%3Cstop%20offset%3D%22.5%22%20stop-color%3D%22%23f9edf8%22/%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%238f77b3%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%22900%22%20height%3D%22600%22%20fill%3D%22url%28%23bg%29%22/%3E%3Ccircle%20cx%3D%22665%22%20cy%3D%22145%22%20r%3D%22180%22%20fill%3D%22%23c5a1ff%22%20opacity%3D%22.05%22/%3E%3Cellipse%20cx%3D%22440%22%20cy%3D%22504%22%20rx%3D%22245%22%20ry%3D%2222%22%20fill%3D%22%23000%22%20opacity%3D%22.2%22/%3E%3Cg%20transform%3D%22rotate%28-16%20450%20300%29%22%3E%3Crect%20x%3D%22310%22%20y%3D%2277%22%20width%3D%22284%22%20height%3D%22451%22%20rx%3D%2244%22%20fill%3D%22%23070a13%22%20stroke%3D%22url%28%23phone%29%22%20stroke-width%3D%2213%22/%3E%3Crect%20x%3D%22327%22%20y%3D%2295%22%20width%3D%22250%22%20height%3D%22414%22%20rx%3D%2230%22%20fill%3D%22%23191f48%22/%3E%3Ccircle%20cx%3D%22440%22%20cy%3D%22282%22%20r%3D%22110%22%20fill%3D%22%23846cba%22%20opacity%3D%22.5%22/%3E%3Ccircle%20cx%3D%22454%22%20cy%3D%22298%22%20r%3D%2282%22%20fill%3D%22%23d4c4f2%22%20opacity%3D%22.55%22/%3E%3Cpath%20d%3D%22M354%20436q105-220%20200-220%22%20stroke%3D%22%23b9a7e3%22%20stroke-width%3D%2224%22%20opacity%3D%22.4%22%20fill%3D%22none%22/%3E%3Crect%20x%3D%22401%22%20y%3D%22108%22%20width%3D%22105%22%20height%3D%2222%22%20rx%3D%2211%22%20fill%3D%22%23050913%22/%3E%3C/g%3E%3Cg%20transform%3D%22rotate%2813%20630%20290%29%22%3E%3Crect%20x%3D%22596%22%20y%3D%22180%22%20width%3D%22155%22%20height%3D%22238%22%20rx%3D%2229%22%20fill%3D%22%23bcb4ce%22/%3E%3Ccircle%20cx%3D%22638%22%20cy%3D%22221%22%20r%3D%2224%22%20fill%3D%22%233a3a58%22%20stroke%3D%22%23dcd7e5%22%20stroke-width%3D%226%22/%3E%3Ccircle%20cx%3D%22700%22%20cy%3D%22221%22%20r%3D%2224%22%20fill%3D%22%233a3a58%22%20stroke%3D%22%23dcd7e5%22%20stroke-width%3D%226%22/%3E%3Ccircle%20cx%3D%22640%22%20cy%3D%22280%22%20r%3D%2221%22%20fill%3D%22%233a3a58%22%20stroke%3D%22%23dcd7e5%22%20stroke-width%3D%226%22/%3E%3C/g%3E%3Ctext%20x%3D%2247%22%20y%3D%2274%22%20fill%3D%22%23dfbdfb%22%20font-family%3D%22Arial%22%20font-size%3D%2219%22%20letter-spacing%3D%227%22%3ETECNOLOG%C3%8DA%3C/text%3E%3C/svg%3E%0A',
      price: 12000,
      total: 8000,
      soldPercent: 81,
      drawDate: '12 de diciembre de 2026',
      winnerDate: '6:00 p. m.',
      desc: 'Incluye smartphone de alta gama, portátil, audífonos inalámbricos y smartwatch. Un combo tecnológico pensado para el día a día.',
      legal: 'Contenido referencial para pruebas de experiencia de usuario.',
      highlights: ['Acceso rápido desde celular', 'Boleta digital', 'Resumen de compra claro'],
    }
  ];

  let filter = 'all';
  let currentRaffle = raffles[0];
  let selected = [];
  let drafts = load(draftKey, []);
  let reserves = load(reserveKey, []);

  function load(key, fallback){ try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
  function save(key, value){ try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { toast('No se pudo guardar en este navegador'); return false; } }
  function fmt(v){ return new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(v); }
  function intFmt(v){ return new Intl.NumberFormat('es-CO').format(v); }
  function toast(msg){ toastNode.textContent = msg; toastNode.classList.add('show'); clearTimeout(toastNode._t); toastNode._t = setTimeout(() => toastNode.classList.remove('show'), 2400); }
  function route(){ return (location.hash || '#inicio').replace(/^#/, ''); }
  function go(to){ location.hash = to; }
  function esc(s){ return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m])); }
  function isActive(h){ return route() === h || (h === 'inicio' && route() === ''); }

  // V6: experiencia pública sin pagos ni cuentas reales.
  const demoOrdersKey = 'el-toque-v6-seguimiento-local';
  const themeKey = 'el-toque-v6-tema';
  let demoOrders = load(demoOrdersKey, []);
  let searchOrders = '';
  let faqOpen = 0;
  let checkoutStage = 1;
  let detailRaffleId = '';
  function escapeHtml(s){ return esc(s); }
  function categoryLabel(k){return ({moto:'Motocicletas',auto:'Vehículos',tecnologia:'Tecnología'})[k]||'Premio';}
  function formatNumber(n){ return String(n).padStart(4,'0'); }
  function storedOrders(){return demoOrders.filter(o=>raffles.some(r=>r.id===o.raffleId));}
  function dateLabel(iso){
    try{return new Intl.DateTimeFormat('es-CO',{dateStyle:'medium',timeStyle:'short'}).format(new Date(iso));}catch{return 'Fecha desconocida';}
  }
  function setTheme(next){
    const theme=next==='light'?'light':'dark';
    document.documentElement.dataset.theme=theme;
    document.documentElement.style.colorScheme=theme;
    try{localStorage.setItem(themeKey,theme);}catch{}
    const sw=document.querySelector('[data-theme-toggle]');
    if(sw){sw.setAttribute('aria-label',theme==='dark'?'Activar tema claro':'Activar tema oscuro');sw.setAttribute('title',theme==='dark'?'Cambiar a tema claro':'Cambiar a tema oscuro');sw.innerHTML=theme==='dark'?'☀ <span>Claro</span>':'☾ <span>Oscuro</span>';}
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#0c0a08':'#fcf7ef');
  }
  function initTheme(){let v='dark';try{v=localStorage.getItem(themeKey)||'dark';}catch{}setTheme(v);}
  function button(text,target,variant=''){return `<a class="v6-btn ${variant}" href="#${target}">${text}<span aria-hidden="true">↗</span></a>`;}
  function stepRail(current=0){const steps=['Elige tus números','Revisa tu selección','Simulación confirmada'];return `<div class="flow-rail" aria-label="Pasos de la experiencia">${steps.map((s,i)=>`<div class="flow-stage ${i+1===current?'current':''} ${i+1<current?'done':''}"><span>${i+1<current?'✓':i+1}</span><small>${s}</small></div>`).join('')}</div>`;}
  function orderCard(o){
    const raffle=raffles.find(r=>r.id===o.raffleId);if(!raffle)return '';
    return `<article class="trace-card v6-panel"><div class="trace-main"><span class="eyebrow orange">REF. ${escapeHtml(o.ref)}</span><h3>${escapeHtml(raffle.name)}</h3><p>Guardada ${dateLabel(o.createdAt)} · ${o.numbers.length} número${o.numbers.length!==1?'s':''}</p><div class="numbers-mini">${o.numbers.map(x=>`<span>${formatNumber(x)}</span>`).join('')}</div></div><div class="trace-side"><span class="status-bubble">◌ Simulación guardada</span><strong>${fmt(o.numbers.length*raffle.price)}</strong><small>Importe de referencia · $0 cobrado</small><a class="v6-btn text" href="#seguimiento/${encodeURIComponent(o.ref)}">Ver seguimiento <span>↗</span></a></div></article>`;
  }
  function pageHome(){
    const r=raffles[0];
    return `<div class="v6-page">
    <section class="v6-hero" id="inicio"><div class="shell v6-hero-layout">
      <div class="v6-hero-copy"><div class="intro-pill"><span class="pulse"></span> CONOCE LA EXPERIENCIA · DEMO</div>
        <h1>Tu próxima<br><em>gran historia</em><br>comienza aquí<span class="gold-dot">.</span></h1>
        <p>Premios que emocionan, números que eliges tú y una experiencia de participación sencilla, de principio a fin.</p>
        <div class="v6-hero-cta">${button('Explorar premios','rifas','neon')}${button('Cómo funciona','como-funciona','quiet')}</div>
        <div class="hero-foot"><div class="mini-avatars" aria-hidden="true"><span>✦</span><span>✧</span><span>★</span></div><div><strong>Una experiencia hecha para ti</strong><small>Sin filas, sin complicaciones. Una demo interactiva.</small></div></div>
      </div>
      <div class="v6-hero-visual"><div class="hero-orange-halo"></div><div class="spotlight-card"><div class="spotlight-label"><span class="live-pip"></span> DESTACADO · EJEMPLO</div><img src="${r.image}" alt="Ilustración del premio ${escapeHtml(r.name)}"/><div class="spotlight-bottom"><div><small>PREMIO DE MUESTRA</small><strong>${escapeHtml(r.name)}</strong></div><div class="spotlight-price"><small>DESDE</small><b>${fmt(r.price)}</b><small>por número</small></div></div></div><div class="float-stamp">EDICIÓN<br/><strong>01</strong><small>DEMO</small></div></div>
    </div></section>
    <section class="value-strip"><div class="shell value-grid"><div><span>01</span><strong>Explora premios</strong><small>Todo claro desde el inicio</small></div><div><span>02</span><strong>Elige tus números</strong><small>Sin pasos confusos</small></div><div><span>03</span><strong>Revisa el resumen</strong><small>Antes de continuar</small></div><div><span>04</span><strong>Sigue tu selección</strong><small>Consulta tu referencia</small></div></div></section>
    <section class="v6-section" id="rifas"><div class="shell"><div class="v6-section-top"><div><span class="eyebrow orange">EXPLORA / PREMIOS</span><h2>Descubre lo que <em>podría ser tuyo.</em></h2><p>Rifas de ejemplo para conocer cómo funcionará la plataforma.</p></div><span class="section-index">01 / PREMIOS</span></div><div class="v6-filter-row" role="group" aria-label="Filtrar premios">${[['all','Todos los premios'],['moto','Motocicletas'],['auto','Carros'],['tecnologia','Tecnología']].map(([k,v])=>`<button type="button" data-filter="${k}" class="v6-filter ${filter===k?'active':''}" aria-pressed="${filter===k}">${v}</button>`).join('')}</div><div class="v6-catalog-grid">${catalogCards()}</div><p class="v6-fineprint">* Las imágenes son ilustrativas y los precios, avances y fechas son datos ficticios. No hay rifas en venta.</p></div></section>
    <section class="v6-section v6-how" id="como-funciona"><div class="shell"><div class="v6-section-top"><div><span class="eyebrow orange">UNA EXPERIENCIA SIN ENREDOS</span><h2>Así de <em>fácil.</em></h2><p>Cuatro pasos para conocer el recorrido que tendrá cada participante.</p></div><span class="section-index">02 / GUÍA</span></div><div class="steps-grid">${[['01','Explora','Conoce el premio, su descripción y las condiciones.'],['02','Selecciona','Elige tus números favoritos directamente desde el celular.'],['03','Revisa','Confirma los números y el valor antes de seguir.'],['04','Consulta','Guarda una referencia de prueba y consulta su recorrido.']].map(([n,t,d])=>`<article class="v6-step"><span>${n}</span><h3>${t}</h3><p>${d}</p></article>`).join('')}</div></div></section>
    <section class="v6-section" id="confianza"><div class="shell"><div class="trust-feature"><div><span class="eyebrow orange">TRANSPARENCIA POR DISEÑO</span><h2>Cada paso, <em>más claro.</em></h2><p>Queremos que sepas qué elegiste, cuál es el estado de tu participación y dónde consultar la información. Nada de pantallas confusas.</p><div class="trust-actions">${button('Consultar mi seguimiento','mis-participaciones','neon')}${button('Preguntas frecuentes','ayuda','quiet')}</div></div><div class="trust-graphic"><div class="trust-timeline"><div><span class="timeline-dot done"></span><p><b>Selección realizada</b><small>Identifica los números elegidos</small></p></div><div><span class="timeline-dot active"></span><p><b>Revisión del resumen</b><small>Verifica toda la información</small></p></div><div><span class="timeline-dot"></span><p><b>Confirmación verificable</b><small>Disponible cuando se integre el sistema real</small></p></div></div></div></div></div></section>
    <section class="v6-section cta-bottom"><div class="shell cta-bottom-inner"><div><span class="eyebrow gold">TU SUERTE, TU HISTORIA</span><h2>¿Qué premio <em>te ilusiona?</em></h2></div>${button('Explorar premios','rifas','neon')}</div></section>
    </div>`;
  }
  function catalogCards(){
    const list=filter==='all'?raffles:raffles.filter(r=>r.category===filter);
    return list.map(r=>`<article class="prize-card"><a href="#detalle/${r.id}" class="prize-image"><span class="prize-flag">✧ ${escapeHtml(r.badge)}</span><img src="${r.image}" alt="Ilustración de ${escapeHtml(r.name)}" loading="lazy" /></a><div class="prize-content"><div class="prize-label">${categoryLabel(r.category)} <span>·</span> Premio de muestra</div><h3>${escapeHtml(r.name)}</h3><p class="prize-desc">${escapeHtml(r.desc)}</p><div class="prize-details"><div><small>POR NÚMERO</small><strong>${fmt(r.price)}</strong></div><div><small>FECHA DE REFERENCIA</small><strong>${escapeHtml(r.drawDate)}</strong></div></div><div class="prize-progress"><div><small>Avance ilustrativo</small><strong>${r.soldPercent}%</strong></div><div class="prize-progress-track"><span style="width:${r.soldPercent}%"></span></div></div><a class="v6-btn card-cta" href="#detalle/${r.id}">Conocer el premio <span>↗</span></a></div></article>`).join('');
  }
  function pageDetail(id){
    const r=raffles.find(x=>x.id===id);if(!r)return pageNotFound();
    if(detailRaffleId!==id){selected=[];detailRaffleId=id;}
    currentRaffle=r;
    const unavailable=new Set(Array.from({length:8},(_,i)=>i*3+3));
    return `<div class="v6-page detail-v6"><div class="shell"><nav class="v6-breadcrumb" aria-label="Ruta de navegación"><a href="#inicio">Inicio</a><span>›</span><a href="#rifas">Premios</a><span>›</span><strong>${escapeHtml(r.name)}</strong></nav>
      ${stepRail(1)}<div class="detail-v6-layout"><section class="detail-v6-left"><div class="detail-v6-art"><span class="art-marker">EDICIÓN DEMO</span><img src="${r.image}" alt="Ilustración de ${escapeHtml(r.name)}"/></div><div class="detail-v6-description"><span class="eyebrow orange">${categoryLabel(r.category)} / PREMIO</span><h1>${escapeHtml(r.name)}</h1><p>${escapeHtml(r.desc)}</p><div class="detail-perks"><span>✦ Información del premio</span><span>✦ Números a tu elección</span><span>✦ Seguimiento de muestra</span></div></div><div class="detail-v6-facts"><div><small>PRECIO UNITARIO</small><strong>${fmt(r.price)}</strong></div><div><small>FECHA DE REFERENCIA</small><strong>${escapeHtml(r.drawDate)}</strong></div><div><small>NÚMEROS EN EL EJEMPLO</small><strong>${intFmt(r.total)}</strong></div></div><div class="detail-v6-terms"><strong>Importante</strong><p>Estos datos son ilustrativos. Una rifa real deberá mostrar sus condiciones, organizador, autorización aplicable y fecha confirmada antes de permitir pagos.</p></div></section>
      <aside class="v6-select-panel"><div class="select-panel-head"><div><span class="eyebrow orange">HAZ TU ELECCIÓN</span><h2>Elige tus números<span class="gold-dot">.</span></h2></div><span class="demo-badge">DEMO</span></div><p class="muted-text">Toca hasta cinco números entre los 30 de muestra. Los que aparecen atenuados no están disponibles en esta simulación.</p><div class="v6-number-legend"><span><i class="legend free"></i> Disponible</span><span><i class="legend chosen"></i> Elegido</span><span><i class="legend blocked"></i> No disponible</span></div><div class="v6-number-grid">${Array.from({length:30},(_,i)=>{const n=i+1;const disabled=unavailable.has(n);return `<button type="button" class="v6-number ${disabled?'blocked':''} ${selected.includes(n)?'selected':''}" data-num="${n}" aria-pressed="${selected.includes(n)}" aria-label="Número ${formatNumber(n)}${disabled?', no disponible':''}" ${disabled?'disabled':''}>${formatNumber(n)}</button>`;}).join('')}</div><div class="v6-order-summary"><div class="order-summary-title"><strong>Tu selección</strong><span id="count">${selected.length} de 5</span></div><div id="selected-list" class="chosen-list">${selected.length?selected.map(n=>`<span>${formatNumber(n)}</span>`).join(''):'<small>Aún no eliges números</small>'}</div><div class="order-total"><span>Total de referencia</span><strong id="total-price">${fmt(selected.length*r.price)}</strong></div><a href="#compra" id="go-checkout" class="v6-btn neon wide ${selected.length?'':'is-disabled'}" aria-disabled="${!selected.length}" tabindex="${selected.length?'0':'-1'}">Continuar <span>↗</span></a><small class="demo-note">No se apartan números reales ni se procesa dinero.</small></div></aside></div>
    </div></div>`;
  }
  function checkout(){
    if(!selected.length || !currentRaffle){return `<div class="v6-page"><div class="shell v6-empty"> <span class="eyebrow orange">FALTA UN PASO</span><h1>Primero elige tus números.</h1><p>Para revisar el resumen debes seleccionar números de un premio.</p>${button('Explorar premios','rifas','neon')}</div></div>`;}
    const r=currentRaffle;const cost=selected.length*r.price;
    return `<div class="v6-page checkout-v6"><div class="shell"><nav class="v6-breadcrumb"><a href="#detalle/${r.id}">← Volver a los números</a></nav>${stepRail(2)}<div class="v6-section-top"><div><span class="eyebrow orange">PASO 02 / 03</span><h1>Todo claro <em>antes de seguir.</em></h1><p>Así se verá el resumen de una participación. Aquí no se realiza ningún cobro.</p></div></div><div class="checkout-v6-grid"><section class="checkout-v6-main"><div class="v6-panel checkout-prize"><img src="${r.image}" alt="${escapeHtml(r.name)}"><div><small>PREMIO DE REFERENCIA</small><h2>${escapeHtml(r.name)}</h2><p>${escapeHtml(r.drawDate)}</p></div></div><div class="v6-panel checkout-review"><span class="eyebrow orange">TU ELECCIÓN</span><h2>Revisa tus números</h2><div class="numbers-mini big">${selected.map(n=>`<span>${formatNumber(n)}</span>`).join('')}</div><a href="#detalle/${r.id}" class="text-under">Cambiar selección ↗</a><div class="checkout-notice"><b>Sin pagos en esta demostración</b><p>La versión comercial necesitará validar identidad y mayoría de edad, disponibilidad de números, medios de pago y autorización de la rifa.</p></div></div></section><aside class="v6-panel checkout-v6-aside"><span class="eyebrow orange">RESUMEN</span><h2>Tu participación</h2><div class="review-line"><span>Valor por número</span><b>${fmt(r.price)}</b></div><div class="review-line"><span>Números elegidos</span><b>${selected.length}</b></div><div class="review-line total"><span>Total de referencia</span><strong>${fmt(cost)}</strong></div><button type="button" id="finish-demo" class="v6-btn neon wide">Guardar simulación <span>↗</span></button><small class="demo-note">El guardado genera una referencia local. No es boleta, reserva ni comprobante de pago.</small></aside></div></div></div>`;
  }
  function tracking(){
    const orders=storedOrders();const term=searchOrders.trim().toUpperCase();const found=orders.filter(o=>!term||o.ref.toUpperCase().includes(term)||raffles.find(r=>r.id===o.raffleId)?.name.toUpperCase().includes(term));
    return `<div class="v6-page tracking-v6"><div class="shell"><div class="v6-section-top"><div><span class="eyebrow orange">CONSULTA Y TRAZABILIDAD</span><h1>Tu historia, <em>a un toque.</em></h1><p>Consulta las selecciones de prueba realizadas en este dispositivo. Todavía no son compras reales.</p></div>${button('Explorar premios','rifas','quiet')}</div><div class="tracking-lookup v6-panel"><label for="tracking-search">Busca por código de referencia o nombre de premio</label><div class="lookup-input"><span>⌕</span><input id="tracking-search" type="search" autocomplete="off" placeholder="Ej. DEMO-..." value="${escapeHtml(searchOrders)}"/><button class="v6-btn" type="button" data-clear-tracking>Limpiar</button></div><small>Privacidad: no ingreses documentos, teléfonos ni datos bancarios. Esta consulta es local y solo muestra tus pruebas en este navegador.</small></div><div class="trace-list" id="tracking-results">${found.length?found.map(orderCard).join(''):`<div class="v6-panel empty-tracking"><div class="empty-icon">✧</div><h2>${orders.length?'No encontramos esa referencia.':'Aún no tienes selecciones de prueba.'}</h2><p>${orders.length?'Revisa el código o borra el filtro.':'Explora un premio y guarda una simulación para ver cómo funciona el seguimiento.'}</p>${button('Explorar premios','rifas','neon')}</div>`}</div><div class="v6-safe-note"><strong>¿Y las compras reales?</strong> Cuando integremos el sistema operativo, la consulta deberá verificar que cada cliente tenga autorización para ver sus pedidos y mostrar pagos conciliados, boletas y resultados verificables. Aquí solo simulamos el recorrido.</div></div></div>`;
  }
  function trackingDetail(ref){
    const order=demoOrders.find(o=>o.ref===ref);if(!order)return pageNotFound();const r=raffles.find(x=>x.id===order.raffleId);if(!r)return pageNotFound();
    return `<div class="v6-page tracking-v6"><div class="shell"><nav class="v6-breadcrumb"><a href="#mis-participaciones">← Mis participaciones</a><span>›</span><strong>${escapeHtml(ref)}</strong></nav><div class="v6-section-top"><div><span class="eyebrow orange">REFERENCIA LOCAL · ${escapeHtml(ref)}</span><h1>Tu seguimiento <em>paso a paso.</em></h1><p>Un registro de demostración guardado solo en este dispositivo.</p></div></div><div class="tracking-detail-grid"><section class="v6-panel tracking-detail-card"><div class="tracking-headline"><span class="status-bubble">◌ Simulación guardada</span><small>${dateLabel(order.createdAt)}</small></div><h2>${escapeHtml(r.name)}</h2><div class="numbers-mini big">${order.numbers.map(n=>`<span>${formatNumber(n)}</span>`).join('')}</div><div class="review-line"><span>Números seleccionados</span><b>${order.numbers.length}</b></div><div class="review-line"><span>Total de referencia</span><b>${fmt(order.numbers.length*r.price)}</b></div><div class="review-line total"><span>Dinero pagado</span><strong>$0</strong></div><div class="tracking-actions"><button type="button" class="v6-btn" data-copy-ref="${escapeHtml(ref)}">Copiar referencia ↗</button><button type="button" class="v6-btn" data-print-demo>Imprimir resumen</button></div></section><aside class="v6-panel timeline-detail"><span class="eyebrow orange">ESTADOS DEL RECORRIDO</span><h2>Qué ha pasado</h2><ol><li class="passed"><span>✓</span><div><b>Selección simulada</b><small>Guardada el ${dateLabel(order.createdAt)}</small></div></li><li class="passed"><span>✓</span><div><b>Referencia generada</b><small>Visible solamente aquí</small></div></li><li class="future"><span>3</span><div><b>Pago y confirmación</b><small>No habilitados en esta versión</small></div></li><li class="future"><span>4</span><div><b>Boleta y sorteo</b><small>Pendientes de integración y autorización</small></div></li></ol><p class="inline-caution">Esta referencia no acredita un derecho a participar ni tiene valor como comprobante de pago.</p></aside></div></div></div>`;
  }
  function results(){
    return `<div class="v6-page results-v6"><div class="shell"><div class="v6-section-top"><div><span class="eyebrow orange">INFORMACIÓN PÚBLICA</span><h1>Resultados <em>con claridad.</em></h1><p>Este espacio mostrará actas y resultados oficiales de rifas autorizadas cuando existan. Por ahora no hay sorteos ni ganadores reales que publicar.</p></div></div><div class="results-info v6-panel"><div class="empty-icon">✦</div><div><h2>Aún no hay resultados oficiales</h2><p>Las rifas que ves son ejemplos de diseño. No se han realizado sorteos en esta plataforma.</p></div></div><div class="result-guide"><article class="v6-panel"><span>01</span><h3>Datos del sorteo</h3><p>Organizador, resolución, fecha y mecanismo aprobado.</p></article><article class="v6-panel"><span>02</span><h3>Acta verificable</h3><p>Documento oficial y trazabilidad del procedimiento.</p></article><article class="v6-panel"><span>03</span><h3>Consulta protegida</h3><p>Estado del premio sin exponer datos personales del ganador.</p></article></div></div></div>`;
  }
  const faqs=[
    ['¿Cómo elijo mis números?','Entra al premio de tu interés, selecciona los números disponibles de ejemplo y pulsa Continuar para revisar el resumen. No se reservan números reales.'],
    ['¿Puedo pagar desde esta página?','Todavía no. Esta versión es un prototipo público que no acepta pagos ni registra compras reales.'],
    ['¿Cómo consulto mi participación?','Desde “Mi seguimiento” puedes buscar la referencia generada al guardar una simulación en este mismo navegador.'],
    ['¿Qué recibiré cuando la plataforma opere?','El objetivo es entregar una confirmación verificable, estado del pago, números asignados y boleta según los requisitos aplicables. Aún no está implementado.'],
    ['¿Cómo se publicarán los resultados?','Solo publicaremos resultados asociados a sorteos autorizados, con su fecha, acta y mecanismo de verificación. Actualmente no hay resultados oficiales.'],
    ['¿Mis selecciones se ven desde otro celular?','No. Las simulaciones actuales viven únicamente en el almacenamiento local de este navegador. Una cuenta segura y el historial centralizado se implementarán más adelante.']
  ];
  function help(){
    return `<div class="v6-page help-v6"><div class="shell"><div class="v6-section-top"><div><span class="eyebrow orange">CENTRO DE AYUDA</span><h1>Respuestas <em>sin vueltas.</em></h1><p>Lo que necesitas saber para explorar esta demostración con tranquilidad.</p></div></div><div class="help-v6-layout"><div class="faq-list">${faqs.map(([q,a],i)=>`<details class="v6-panel faq-item" ${i===faqOpen?'open':''}><summary>${escapeHtml(q)} <span>+</span></summary><p>${escapeHtml(a)}</p></details>`).join('')}</div><aside class="v6-panel help-aside"><span class="eyebrow gold">A TU RITMO</span><h2>Primero la confianza.</h2><p>Cuando lancemos el servicio, añadiremos canales de soporte verificados, condiciones por rifa, política de tratamiento de datos y medios de contacto reales.</p>${button('Ver recorrido','como-funciona','neon')}<div class="help-aside-foot">Esta web no solicita contraseñas, documentos ni pagos.</div></aside></div></div></div>`;
  }
  function pageNotFound(){return `<div class="v6-page"><div class="shell v6-empty"><span class="eyebrow orange">NO ENCONTRADO</span><h1>Esa página no existe.</h1><p>El enlace pudo haber cambiado.</p>${button('Volver al inicio','inicio','neon')}</div></div>`;}

  let adminFilter = 'todos';
  let adminSearch = '';
  let editingDraftId = null;
  const readableDate = date => {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'Por definir';
    const d = new Date(`${date}T12:00:00`);
    return Number.isNaN(d.getTime()) ? 'Por definir' : new Intl.DateTimeFormat('es-CO',{dateStyle:'medium'}).format(d);
  };
  const adminCategory = name => categoryLabel(name);
  const draftStatus = d => d.review === true ? 'En revisión interna' : 'Borrador';
  const draftStatusClass = d => d.review === true ? 'review' : 'draft';
  const getDraft = id => drafts.find(d => d.id === id);
  const adminLink = (href, label, icon, active) => `<a href="#${href}" class="admin-nav-item ${active === href ? 'is-active' : ''}" ${active === href ? 'aria-current="page"' : ''}><span class="nav-symbol" aria-hidden="true">${icon}</span><span>${label}</span></a>`;

  function sidebar(active){
    return `<aside class="admin-sidebar glass" aria-label="Menú del administrador">
      <div class="sidebar-top"><span class="side-monogram">✦</span><div><strong>Panel de gestión</strong><small>El toque de la suerte!</small></div></div>
      <p class="sidebar-section-title">ESPACIO DE TRABAJO</p>
      <nav class="admin-nav" aria-label="Secciones de gestión">
        ${adminLink('admin','Inicio del panel','⌂', active)}
        ${adminLink('admin/rifas','Rifas y borradores','▦', active)}
        ${adminLink('admin/nueva','Crear una rifa','＋', active)}
      </nav>
      <p class="sidebar-section-title">PRÓXIMOS MÓDULOS</p>
      <nav class="admin-nav" aria-label="Módulos futuros">
        ${adminLink('admin/clientes','Clientes','♙', active)}
        ${adminLink('admin/pagos','Pagos y reportes','▤', active)}
      </nav>
      <div class="admin-side-note"><span class="signal-dot"></span><strong>Entorno de pruebas</strong><p>Los borradores se guardan únicamente en este dispositivo. No hay ventas habilitadas.</p></div>
      <a href="#inicio" class="admin-return">↗ Ver el sitio público</a>
    </aside>`;
  }

  function adminLayout(content, active, kicker = 'ADMINISTRACIÓN'){
    return `<section class="admin-page"><div class="shell admin-shell">${sidebar(active)}<div class="admin-content">
      <div class="admin-topline"><span class="eyebrow-admin"><span class="signal-dot"></span> ${kicker} / DEMO LOCAL</span><a class="admin-quickhelp" href="#admin/ayuda">¿Necesitas ayuda? ↗</a></div>
      ${content}
    </div></div></section>`;
  }

  function pageAdmin(){
    const latest = drafts.slice(0,4);
    const reviewCount = drafts.filter(d=>d.review).length;
    return adminLayout(`
      <div class="admin-heading"><div><span class="admin-eyebrow">TU ESPACIO DE TRABAJO</span><h1>Todo en un solo lugar<span class="admin-orange">.</span></h1><p>Administra tus próximas rifas sin complicaciones. Empieza creando un borrador y complétalo a tu ritmo.</p></div><a class="btn primary admin-main-cta" href="#admin/nueva"><span aria-hidden="true">＋</span> Crear rifa</a></div>
      <div class="admin-metrics" aria-label="Resumen de actividad demostrativa">
        <article class="admin-metric"><span class="metric-symbol">▦</span><small>Rifas de ejemplo</small><strong>${raffles.length}</strong><span>Solo para mostrar el diseño</span></article>
        <article class="admin-metric"><span class="metric-symbol">✎</span><small>Mis borradores</small><strong>${drafts.length}</strong><span>Guardados en este navegador</span></article>
        <article class="admin-metric"><span class="metric-symbol">◌</span><small>Por revisar</small><strong>${reviewCount}</strong><span>Revisión interna simulada</span></article>
        <article class="admin-metric"><span class="metric-symbol">◎</span><small>Ventas reales</small><strong>0</strong><span>Operación no habilitada</span></article>
      </div>
      <div class="admin-workgrid">
        <section class="admin-block admin-welcome"><div class="block-heading"><div><span class="admin-eyebrow">EMPIEZA AQUÍ</span><h2>Prepara tu primera rifa</h2><p>Tres pasos claros. Nunca se publicará una rifa por guardar un borrador.</p></div><span class="large-sparkle" aria-hidden="true">✦</span></div>
          <div class="admin-steps"><div><span>01</span><strong>Describe el premio</strong><small>Nombre, categoría e imagen</small></div><div><span>02</span><strong>Define los detalles</strong><small>Precio, cantidad y fecha</small></div><div><span>03</span><strong>Guarda y revisa</strong><small>Edita cuando quieras</small></div></div>
          <a class="btn primary" href="#admin/nueva">Comenzar ahora <span aria-hidden="true">↗</span></a>
        </section>
        <section class="admin-block admin-next"><span class="admin-eyebrow">ACCESOS RÁPIDOS</span><h2>¿Qué quieres hacer?</h2>
          <a class="admin-action-link" href="#admin/rifas"><span class="action-icon">▦</span><span><strong>Ver rifas y borradores</strong><small>Busca, edita y organiza</small></span><span>↗</span></a>
          <a class="admin-action-link" href="#admin/ayuda"><span class="action-icon">?</span><span><strong>Ver guía rápida</strong><small>Aprende a usar este panel</small></span><span>↗</span></a>
          <button class="admin-action-link action-button" data-export type="button"><span class="action-icon">↓</span><span><strong>Descargar respaldo</strong><small>Archivo JSON de tus borradores</small></span><span>↗</span></button>
        </section>
      </div>
      <section class="admin-block"><div class="block-heading"><div><span class="admin-eyebrow">ACTIVIDAD RECIENTE</span><h2>Mis borradores</h2></div><a class="admin-text-link" href="#admin/rifas">Ver todos ↗</a></div>
        ${latest.length ? `<div class="admin-draft-list">${latest.map(d=>`<a href="#admin/editar/${encodeURIComponent(d.id)}" class="draft-row"><span class="draft-art">${categoryGlyph(d.category)}</span><span class="draft-description"><strong>${esc(d.name)}</strong><small>${adminCategory(d.category)} · ${fmt(d.price)} por número</small></span><span class="admin-status ${draftStatusClass(d)}">${draftStatus(d)}</span><span class="draft-arrow">↗</span></a>`).join('')}</div>` : `<div class="admin-empty"><span class="empty-symbol">✧</span><strong>Aún no tienes borradores</strong><p>Crea uno para empezar a organizar tus premios.</p><a class="btn subtle" href="#admin/nueva">Crear mi primer borrador ↗</a></div>`}
      </section>
      <p class="admin-disclaimer">Este panel es una demostración pública sin inicio de sesión. No registres datos personales, contraseñas ni información financiera real.</p>
    `, 'admin', 'VISTA GENERAL');
  }

  function categoryGlyph(cat){return ({moto:'🏍',auto:'🚗',tecnologia:'⌘'})[cat] || '✦';}
  function adminFilteredRows(){
    return [
      ...drafts.map(d=>({...d,_source:'draft'})),
      ...raffles.map(r=>({...r,_source:'example'}))
    ].filter(r=>{
      if(adminFilter === 'borradores' && r._source !== 'draft')return false;
      if(adminFilter === 'ejemplos' && r._source !== 'example')return false;
      if(adminFilter === 'revision' && !(r._source === 'draft' && r.review))return false;
      const query = adminSearch.trim().toLocaleLowerCase('es-CO');
      return !query || `${r.name} ${adminCategory(r.category)}`.toLocaleLowerCase('es-CO').includes(query);
    });
  }

  function adminRaffleRows(){
    const rows = adminFilteredRows();
    return rows.length ? rows.map(r=>{
      const draft = r._source === 'draft';
      return `<tr><td><div class="admin-table-name"><span class="draft-art sm">${categoryGlyph(r.category)}</span><div><strong>${esc(r.name)}</strong><small>${esc(adminCategory(r.category))}</small></div></div></td>
        <td>${fmt(r.price)}</td><td>${intFmt(r.total)}</td><td><span class="admin-status ${draft ? draftStatusClass(r) : 'example'}">${draft ? draftStatus(r) : 'Ejemplo de catálogo'}</span></td>
        <td><div class="admin-table-actions">${draft ? `<a class="mini-action" href="#admin/editar/${encodeURIComponent(r.id)}" title="Editar borrador">Editar ↗</a><button type="button" class="mini-action" data-review="${esc(r.id)}">${r.review ? 'Volver a borrador' : 'Revisar'}</button><button type="button" class="mini-action danger" data-remove="${esc(r.id)}">Eliminar</button>` : `<a class="mini-action" href="#detalle/${encodeURIComponent(r.id)}">Ver ↗</a><button type="button" class="mini-action" data-copy-example="${esc(r.id)}">Usar como ejemplo</button>`}</div></td></tr>`;
    }).join('') : `<tr><td colspan="5" class="admin-table-empty">No hay resultados con esos filtros. <button class="admin-text-link" data-clear-filters type="button">Limpiar búsqueda</button></td></tr>`;
  }

  function pageAdminRaffles(){
    return adminLayout(`
      <div class="admin-heading"><div><span class="admin-eyebrow">ORGANIZA TUS IDEAS</span><h1>Rifas y premios<span class="admin-orange">.</span></h1><p>Encuentra rápidamente una rifa, edita tus borradores o toma un ejemplo para comenzar.</p></div><a class="btn primary admin-main-cta" href="#admin/nueva">＋ Nueva rifa</a></div>
      <section class="admin-block admin-list-block">
        <div class="admin-list-head"><div><h2>Todas las rifas</h2><p>${drafts.length} borradores locales y ${raffles.length} ejemplos visuales</p></div><button class="admin-text-link" data-export type="button">↓ Descargar respaldo</button></div>
        <div class="admin-toolbar"><label class="admin-search"><span aria-hidden="true">⌕</span><span class="sr-only">Buscar rifas por nombre o categoría</span><input id="admin-search" autocomplete="off" type="search" value="${esc(adminSearch)}" placeholder="Buscar por nombre o categoría..." /></label>
          <label class="admin-select-label"><span class="sr-only">Filtrar rifas</span><select id="admin-filter"><option value="todos" ${adminFilter==='todos'?'selected':''}>Todas las rifas</option><option value="borradores" ${adminFilter==='borradores'?'selected':''}>Solo borradores</option><option value="revision" ${adminFilter==='revision'?'selected':''}>En revisión</option><option value="ejemplos" ${adminFilter==='ejemplos'?'selected':''}>Ejemplos visuales</option></select></label></div>
        <div class="admin-table-scroll"><table class="admin-table"><thead><tr><th>Premio</th><th>Precio / número</th><th>Números</th><th>Estado</th><th>Acciones</th></tr></thead><tbody id="admin-table-body">${adminRaffleRows()}</tbody></table></div>
      </section>
      <div class="admin-tip"><span>ⓘ</span><p><strong>Importante:</strong> los borradores son privados solo dentro de este navegador, no por una cuenta protegida. No se muestran al público ni pueden recibir pagos. El estado «En revisión» no constituye aprobación regulatoria.</p></div>
      <dialog class="admin-dialog" id="delete-dialog"><div><span class="dialog-symbol">!</span><h2>¿Eliminar este borrador?</h2><p>Esta acción lo quitará de este navegador. Puedes descargar un respaldo antes de eliminarlo.</p><div class="dialog-actions"><button class="btn subtle" type="button" data-cancel-delete>Cancelar</button><button class="btn primary" type="button" id="confirm-delete">Sí, eliminar</button></div></div></dialog>
    `,'admin/rifas','ORGANIZACIÓN');
  }

  function pageAdminNew(id){
    const draft = id ? getDraft(id) : null;
    if (id && !draft) return adminLayout(`<div class="admin-block"><h2>No encontramos ese borrador</h2><p>Es posible que se haya eliminado o esté en otro dispositivo.</p><a href="#admin/rifas" class="btn subtle">Volver a rifas</a></div>`, 'admin/rifas');
    editingDraftId = draft?.id || null;
    const cat = draft?.category || 'moto';
    const fieldVal = (v) => esc(v ?? '');
    return adminLayout(`
      <div class="admin-heading"><div><span class="admin-eyebrow">${draft?'EDITAR RIFA':'NUEVA RIFA'} · GUÍA EN TRES PASOS</span><h1>${draft?'Edita tu borrador':'Crea una nueva rifa'}<span class="admin-orange">.</span></h1><p>Solo tienes que completar lo esencial. Podrás modificarlo después, antes de cualquier publicación.</p></div><a href="#admin/rifas" class="admin-text-link">← Volver a rifas</a></div>
      <section class="admin-block admin-wizard">
        <div class="wizard-progress" aria-label="Progreso del formulario"><div class="wizard-progress-item active" data-progress="1"><span>1</span><div><strong>El premio</strong><small>¿Qué se va a rifar?</small></div></div><div class="wizard-progress-connector"></div><div class="wizard-progress-item" data-progress="2"><span>2</span><div><strong>Los detalles</strong><small>Precio y números</small></div></div><div class="wizard-progress-connector"></div><div class="wizard-progress-item" data-progress="3"><span>3</span><div><strong>Revisar y guardar</strong><small>Todo en orden</small></div></div></div>
        <form id="draft-form" novalidate data-edit-id="${draft?esc(draft.id):''}">
          <div class="wizard-step" data-step="1"><h2>Cuéntanos sobre el premio</h2><p class="wizard-step-desc">Comienza con un nombre llamativo y una descripción que entienda cualquier cliente.</p>
            <div class="form-grid admin-form-grid">
              <div class="field full"><label for="admin-name">Nombre de la rifa <span class="required">*</span></label><input id="admin-name" name="name" minlength="3" maxlength="85" required value="${fieldVal(draft?.name)}" placeholder="Ej. Motocicleta edición especial"/><small>Usa un nombre corto que describa el premio.</small></div>
              <div class="field full"><label for="admin-category">Categoría del premio <span class="required">*</span></label><select id="admin-category" name="category" required><option value="moto" ${cat==='moto'?'selected':''}>Motocicleta</option><option value="auto" ${cat==='auto'?'selected':''}>Automóvil</option><option value="tecnologia" ${cat==='tecnologia'?'selected':''}>Tecnología</option></select></div>
              <div class="field full"><label for="admin-desc">Descripción <span class="required">*</span></label><textarea id="admin-desc" name="desc" minlength="10" maxlength="700" required placeholder="¿Qué incluye, qué lo hace especial y cuáles son sus características principales?">${fieldVal(draft?.desc)}</textarea><small>Evita promesas que todavía no se puedan verificar.</small></div>
            </div></div>
          <div class="wizard-step is-hidden" data-step="2"><h2>Define los detalles</h2><p class="wizard-step-desc">Estos valores son ilustrativos y todavía no permiten comercializar números.</p>
            <div class="form-grid admin-form-grid">
              <div class="field"><label for="admin-price">Precio por número (COP) <span class="required">*</span></label><input id="admin-price" name="price" type="number" min="1" max="1000000000" step="1" required value="${draft?.price || ''}" placeholder="25000"/><small>Ejemplo: 25000</small></div>
              <div class="field"><label for="admin-total">Cantidad de números <span class="required">*</span></label><input id="admin-total" name="total" type="number" min="10" max="1000000" step="1" required value="${draft?.total || ''}" placeholder="10000"/><small>Entre 10 y 1.000.000, en esta demo.</small></div>
              <div class="field"><label for="admin-draw">Fecha tentativa del sorteo</label><input id="admin-draw" name="draw" type="date" value="${fieldVal(draft?.draw)}"/><small>La fecha puede cambiar antes de autorizar la rifa.</small></div>
              <div class="field"><label for="admin-time">Hora tentativa</label><input id="admin-time" name="time" type="time" value="${fieldVal(draft?.time)}"/><small>Hora de Colombia</small></div>
            </div></div>
          <div class="wizard-step is-hidden" data-step="3"><h2>Revisa antes de guardar</h2><p class="wizard-step-desc">Verifica los datos y guarda tu trabajo. Esta acción no publica la rifa ni recibe dinero.</p><div class="review-preview" id="review-preview" aria-live="polite"></div><div class="admin-tip"><span>ⓘ</span><p>Quedará como borrador en este navegador. Más adelante integraremos usuarios, almacenamiento central y autorización de publicación.</p></div></div>
          <div class="wizard-footer"><span id="wizard-indicator">Paso 1 de 3</span><div class="wizard-buttons"><button class="btn subtle is-hidden" id="wizard-back" type="button">← Atrás</button><button class="btn primary" id="wizard-next" type="button">Siguiente →</button><button class="btn primary is-hidden" id="wizard-save" type="submit">${draft?'Guardar cambios':'Guardar borrador'} ✓</button></div></div>
        </form>
      </section>
      <div class="admin-tip"><span>✓</span><p>Tu trabajo se conserva en este dispositivo cuando presionas «Guardar borrador». Antes de cambiar de equipo, descarga una copia desde la sección de rifas.</p></div>
    `,draft?'admin/rifas':'admin/nueva','FORMULARIO GUIADO');
  }

  function pagePlaceholder(kind){
    const isClient=kind==='clientes';
    return adminLayout(`
      <div class="admin-heading"><div><span class="admin-eyebrow">PRÓXIMAMENTE</span><h1>${isClient?'Clientes':'Pagos y reportes'}<span class="admin-orange">.</span></h1><p>${isClient?'Aquí podrás encontrar usuarios y consultar su participación de forma segura.':'Aquí podrás consultar transacciones, conciliaciones y reportes financieros.'}</p></div></div>
      <div class="admin-metrics placeholder-metrics"><article class="admin-metric"><small>${isClient?'Clientes registrados':'Transacciones reales'}</small><strong>0</strong><span>Sin base de datos aún</span></article><article class="admin-metric"><small>${isClient?'Perfiles verificados':'Total recaudado'}</small><strong>${isClient?'0':fmt(0)}</strong><span>No se reciben operaciones reales</span></article></div>
      <div class="admin-block admin-unavailable"><span>⌁</span><h2>${isClient?'La gestión de clientes será privada':'La pasarela estará desactivada por ahora'}</h2><p>${isClient?'Este prototipo público nunca debe contener nombres, cédulas o datos de participantes reales. Habilitaremos este módulo cuando existan autenticación, permisos y una base de datos protegida.':'Integrar pagos requiere validación del operador, control de inventario transaccional, conciliación y autorizaciones aplicables. No mostraremos ingresos ficticios como operaciones reales.'}</p><a class="btn subtle" href="#admin">Volver al panel ↗</a></div>
    `,`admin/${kind}`,'MÓDULO EN PREPARACIÓN');
  }

  function pageAdminHelp(){
    return adminLayout(`
      <div class="admin-heading"><div><span class="admin-eyebrow">GUÍA RÁPIDA</span><h1>Fácil desde el primer clic<span class="admin-orange">.</span></h1><p>Así puedes usar esta versión sin conocimientos técnicos.</p></div></div>
      <div class="help-grid">
        <article class="admin-block"><span class="help-icon">01</span><h2>Crear un borrador</h2><p>Entra en «Crear una rifa», describe el premio, indica los números y guarda. Puedes regresar a editarlo cuando quieras.</p><a class="admin-text-link" href="#admin/nueva">Crear rifa ↗</a></article>
        <article class="admin-block"><span class="help-icon">02</span><h2>Editar o revisar</h2><p>En «Rifas y borradores» busca tu rifa y pulsa «Editar». «Revisar» solo indica un estado interno de trabajo.</p><a class="admin-text-link" href="#admin/rifas">Abrir mis rifas ↗</a></article>
        <article class="admin-block"><span class="help-icon">03</span><h2>Guardar una copia</h2><p>Pulsa «Descargar respaldo» para obtener un archivo JSON que podrás conservar como copia local de tus borradores.</p><button type="button" class="admin-text-link" data-export>Descargar respaldo ↗</button></article>
        <article class="admin-block"><span class="help-icon">04</span><h2>Publicar en el futuro</h2><p>La publicación de rifas y la compra de números permanecen bloqueadas hasta implementar permisos, backend seguro y requisitos regulatorios.</p><a class="admin-text-link" href="#inicio">Ver el catálogo demo ↗</a></article>
      </div>
      <p class="admin-disclaimer">Aviso: este panel es público y únicamente de demostración. El almacenamiento local no es una base de datos compartida ni un sistema de autenticación.</p>
    `,'admin/ayuda','AYUDA');
  }

  let wizardStep = 1;
  function updateWizard(step){
    wizardStep = Math.max(1,Math.min(3,step));
    document.querySelectorAll('.wizard-step').forEach(n=>n.classList.toggle('is-hidden',Number(n.dataset.step)!==wizardStep));
    document.querySelectorAll('[data-progress]').forEach(n=>{
      const s=Number(n.dataset.progress);
      n.classList.toggle('active',s===wizardStep);
      n.classList.toggle('completed',s<wizardStep);
    });
    const back=document.getElementById('wizard-back'), next=document.getElementById('wizard-next'), save=document.getElementById('wizard-save');
    if(back)back.classList.toggle('is-hidden',wizardStep===1);
    if(next)next.classList.toggle('is-hidden',wizardStep===3);
    if(save)save.classList.toggle('is-hidden',wizardStep!==3);
    const indicator=document.getElementById('wizard-indicator');
    if(indicator)indicator.textContent=`Paso ${wizardStep} de 3`;
    if(wizardStep===3)updateReviewPreview();
  }
  function validateCurrentStep(){
    const panel=document.querySelector(`.wizard-step[data-step="${wizardStep}"]`);
    if(!panel)return false;
    for(const input of panel.querySelectorAll('input,textarea,select')){
      if(!input.checkValidity()){input.reportValidity();input.focus();return false;}
      if(input.required && !input.value.trim()){input.focus();return false;}
    }
    return true;
  }
  function updateReviewPreview(){
    const form=document.getElementById('draft-form');
    const target=document.getElementById('review-preview');
    if(!form||!target)return;
    const f=new FormData(form);
    const vals=[
      ['Nombre',f.get('name') || 'Por definir'],['Categoría',adminCategory(f.get('category'))],
      ['Precio / número',fmt(Number(f.get('price'))||0)],['Número de boletas',intFmt(Number(f.get('total'))||0)],
      ['Fecha',readableDate(f.get('draw'))],['Hora',f.get('time') || 'Por definir']
    ];
    target.innerHTML=vals.map(([label,value])=>`<div><small>${label}</small><strong>${esc(value)}</strong></div>`).join('') + `<div class="review-description"><small>Descripción</small><p>${esc(f.get('desc')||'')}</p></div>`;
  }

  function exportDrafts(){
    const payload={project:'El toque de la suerte!',version:1,exportedAt:new Date().toISOString(),drafts:drafts.map(d=>({id:d.id,name:d.name,desc:d.desc,category:d.category,price:d.price,total:d.total,draw:d.draw||'',time:d.time||'',review:!!d.review}))};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const link=document.createElement('a');link.href=url;link.download='el-toque-de-la-suerte-borradores.json';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    toast(`Respaldo descargado (${drafts.length} borradores)`);
  }

  function render(){
    const r=route();
    let html='';
    if(r==='inicio' || r==='' || r==='rifas' || r==='como-funciona' || r==='confianza') html=pageHome();
    else if(r.startsWith('detalle/')) html=pageDetail(decodeURIComponent(r.slice(8)));
    else if(r==='compra') html=checkout();
    else if(r==='mis-participaciones') html=tracking();
    else if(r.startsWith('seguimiento/')) html=trackingDetail(decodeURIComponent(r.slice(12)));
    else if(r==='resultados') html=results();
    else if(r==='ayuda') html=help();
    else if(r==='admin') html=pageAdmin();
    else if(r==='admin/rifas') html=pageAdminRaffles();
    else if(r==='admin/nueva'){editingDraftId=null;html=pageAdminNew();}
    else if(r.startsWith('admin/editar/')) html=pageAdminNew(decodeURIComponent(r.slice('admin/editar/'.length)));
    else if(r==='admin/ayuda') html=pageAdminHelp();
    else if(r==='admin/clientes') html=pagePlaceholder('clientes');
    else if(r==='admin/pagos') html=pagePlaceholder('pagos');
    else html=pageNotFound();
    app.innerHTML=html;
    nav.classList.remove('open');menuBtn.setAttribute('aria-expanded','false');
    if(r==='admin/nueva'||r.startsWith('admin/editar/')){wizardStep=1;updateWizard(1);}
    document.title= (r.startsWith('admin')?'Administración | ':r==='compra'?'Revisa tu selección | ':r==='mis-participaciones'?'Mi seguimiento | ':r==='resultados'?'Resultados | ':'')+'El toque de la suerte!';
    requestAnimationFrame(()=>{
      if(['rifas','como-funciona','confianza'].includes(r))document.getElementById(r)?.scrollIntoView({behavior:'instant',block:'start'});
      else window.scrollTo({top:0,behavior:'instant'});
    });
  }

  document.addEventListener('click', (e) => {
    const filterBtn = e.target.closest('[data-filter]');
    if(filterBtn){
      filter=filterBtn.dataset.filter;
      const grid=document.querySelector('.v6-catalog-grid');if(grid)grid.innerHTML=catalogCards();
      document.querySelectorAll('[data-filter]').forEach(b=>{const active=b.dataset.filter===filter;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
      return;
    }

    const num = e.target.closest('[data-num]');
    if(num && !num.disabled){
      const value=Number(num.dataset.num);
      if(selected.includes(value))selected=selected.filter(n=>n!==value);
      else if(selected.length<5)selected=[...selected,value].sort((a,b)=>a-b);
      else {toast('Puedes elegir máximo cinco números');return;}
      document.querySelectorAll('.v6-number[data-num]').forEach(b=>{const on=selected.includes(Number(b.dataset.num));b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));});
      const count=document.getElementById('count'),total=document.getElementById('total-price'),list=document.getElementById('selected-list');
      if(count)count.textContent=selected.length+' de 5';
      if(total)total.textContent=fmt(selected.length*currentRaffle.price);
      if(list)list.innerHTML=selected.length?selected.map(n=>`<span>${formatNumber(n)}</span>`).join(''):'<small>Aún no eliges números</small>';
      const cont=document.getElementById('go-checkout');
      if(cont){cont.classList.toggle('is-disabled',!selected.length);cont.setAttribute('aria-disabled',String(!selected.length));cont.tabIndex=selected.length?0:-1;}
      return;
    }
    if(e.target.closest('#go-checkout')&&!selected.length){e.preventDefault();return;}
    if(e.target.closest('[data-theme-toggle]')){setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');return;}
    if(e.target.closest('[data-clear-tracking]')){searchOrders='';render();return;}
    if(e.target.closest('#finish-demo')){
      if(!selected.length)return;
      const bytes=new Uint8Array(4);crypto.getRandomValues(bytes);
      const ref='DEMO-'+Array.from(bytes).map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();
      const entry={ref,raffleId:currentRaffle.id,numbers:[...selected],createdAt:new Date().toISOString()};
      demoOrders=[entry,...demoOrders];if(save(demoOrdersKey,demoOrders)){selected=[];detailRaffleId='';go('seguimiento/'+ref);toast('Simulación guardada. No se realizó ningún pago.');}
      return;
    }
    const copyRef=e.target.closest('[data-copy-ref]');
    if(copyRef){const ref=copyRef.dataset.copyRef;
      if(navigator.clipboard?.writeText){navigator.clipboard.writeText(ref).then(()=>toast('Referencia de prueba copiada')).catch(()=>toast('No se pudo copiar; selecciónala manualmente.'));}
      else toast('Selecciona el código de la referencia para copiarlo');return;
    }
    if(e.target.closest('[data-print-demo]')){window.print();return;}

    if(e.target.closest('[data-export]')){ exportDrafts();return; }
    if(e.target.closest('[data-clear-filters]')){ adminFilter='todos';adminSearch='';render();return; }
    const copy=e.target.closest('[data-copy-example]');
    if(copy){
      const seed=raffles.find(x=>x.id===copy.dataset.copyExample);
      if(seed){
        const id=`draft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`;
        drafts.unshift({id,name:`${seed.name} (borrador)`,desc:seed.desc,category:seed.category,price:seed.price,total:seed.total,draw:'',time:'',review:false});
        if(save(draftKey,drafts)){go(`admin/editar/${encodeURIComponent(id)}`);toast('Ejemplo copiado a tus borradores');}
      }
      return;
    }
    const review=e.target.closest('[data-review]');
    if(review){const item=getDraft(review.dataset.review);if(item){item.review=!item.review;save(draftKey,drafts);render();toast(item.review?'Marcado para revisión interna':'Devuelto a borrador');}return;}
    const remove=e.target.closest('[data-remove]');
    if(remove){
      const dialog=document.getElementById('delete-dialog');
      if(dialog){dialog.dataset.target=remove.dataset.remove;if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');}
      return;
    }
    if(e.target.closest('[data-cancel-delete]')){document.getElementById('delete-dialog')?.close();return;}
    if(e.target.closest('#confirm-delete')){
      const dialog=document.getElementById('delete-dialog');
      const id=dialog?.dataset.target;
      if(id){drafts=drafts.filter(x=>x.id!==id);save(draftKey,drafts);render();toast('Borrador eliminado');}return;
    }
    if(e.target.closest('#wizard-back')){updateWizard(wizardStep-1);return;}
    if(e.target.closest('#wizard-next')){
      if(validateCurrentStep()){updateWizard(wizardStep+1);document.querySelector('.admin-wizard')?.scrollIntoView({behavior:'smooth',block:'start'});}
      return;
    }

  });

  document.addEventListener('submit', (e) => {
    if(e.target.id !== 'draft-form') return;
    e.preventDefault();
    const form=e.target;
    if(wizardStep !== 3){toast('Completa los tres pasos para guardar');return;}
    const fd = new FormData(form);
    const name = String(fd.get('name') || '').trim();
    const desc = String(fd.get('desc') || '').trim();
    const category = String(fd.get('category') || 'moto');
    const price = Number(fd.get('price') || 0);
    const total = Number(fd.get('total') || 0);
    const draw = String(fd.get('draw') || '');
    const time = String(fd.get('time') || '');
    if(name.length < 3 || name.length > 85 || desc.length < 10 || desc.length > 700 ||
      !['moto','auto','tecnologia'].includes(category) || !Number.isSafeInteger(price) || price < 1 || price > 1000000000 ||
      !Number.isSafeInteger(total) || total < 10 || total > 1000000 ||
      (draw && !/^\d{4}-\d{2}-\d{2}$/.test(draw)) || (time && !/^\d{2}:\d{2}$/.test(time))){
      toast('Revisa los datos del borrador');return;
    }
    const id=form.dataset.editId;
    const existing=id ? getDraft(id) : null;
    if(id && !existing){toast('El borrador ya no existe en este navegador');return;}
    const entry={id:existing?.id || `draft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`,
      name,desc,category,price,total,draw,time,review:existing?.review||false};
    if(existing){Object.assign(existing,entry);}
    else drafts.unshift(entry);
    if(save(draftKey,drafts)){go('admin/rifas');if(route()==='admin/rifas')render();toast(existing?'Cambios guardados en este navegador':'Borrador creado correctamente');}
  });

  document.addEventListener('input',e=>{
    if(e.target.id==='tracking-search'){
      searchOrders=e.target.value;
      const results=document.getElementById('tracking-results');
      if(results){const term=searchOrders.trim().toUpperCase();const found=storedOrders().filter(o=>!term||o.ref.toUpperCase().includes(term)||raffles.find(r=>r.id===o.raffleId)?.name.toUpperCase().includes(term));
        results.innerHTML=found.length?found.map(orderCard).join(''):'<div class="v6-panel empty-tracking"><h2>No encontramos esa referencia</h2><p>Comprueba el código o borra la búsqueda.</p></div>';}
      return;
    }
    if(e.target.id==='admin-search'){
      adminSearch=e.target.value;
      const body=document.getElementById('admin-table-body');
      if(body)body.innerHTML=adminRaffleRows();
    }
  });
  document.addEventListener('change',e=>{
    if(e.target.id==='admin-filter'){
      adminFilter=e.target.value;
      const body=document.getElementById('admin-table-body');
      if(body)body.innerHTML=adminRaffleRows();
    }
  });

  menuBtn.addEventListener('click', () => {
    const expanded = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(expanded));
  });

  window.addEventListener('hashchange', render);
  initTheme();
  if(!location.hash) location.hash = '#inicio';
  render();
})();