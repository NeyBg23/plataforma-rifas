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

  function pageHome(){
    const featured = raffles[0];
    return `
      <section class="hero" id="inicio">
        <div class="shell hero-grid">
          <div class="hero-copy glass">
            <div class="kicker">EL TOQUE DE LA SUERTE! · EXPERIENCIA DEMO</div>
            <h1>Tu próximo gran sueño. <span>A un toque de distancia.</span></h1>
            <p>
              Explora nuestros premios de demostración, conoce los detalles, revisa las fechas de referencia
              y prueba cómo elegir tus números desde una experiencia rápida, clara y diseñada para ti.
            </p>
            <div class="hero-actions">
              <a class="btn primary" href="#rifas">Explorar premios →</a>
              <a class="btn subtle" href="#detalle/${featured.id}">Ver premio destacado</a>
            </div>
            <div class="hero-tags">
              <span>Selección de números en línea</span>
              <span>Resumen de compra claro</span>
              <span>Diseño optimizado para celular</span>
            </div>
          </div>

          <div class="hero-panel glass">
            <div class="featured-visual">
              <img src="${featured.image}" alt="${esc(featured.name)}">
              <div class="featured-overlay">
                <small>PREMIO DESTACADO · SIMULACIÓN</small>
                <h3>${esc(featured.name)}</h3>
                <div class="overlay-grid">
                  <div class="stat"><small>Precio por número</small><strong>${fmt(featured.price)}</strong></div>
                  <div class="stat"><small>Avance demo</small><strong>${featured.soldPercent}%</strong></div>
                  <div class="stat"><small>Sorteo</small><strong>${featured.drawDate}</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section" id="rifas">
        <div class="shell">
          <div class="section-head">
            <div>
              <h2>Descubre los premios</h2>
              <p>Una experiencia con imágenes, precios, fechas y selección de números. Todos los datos son ilustrativos, no son rifas autorizadas.</p>
            </div>
          </div>
          <div class="catalog-filters">
            ${[['all','Todas'],['moto','Motos'],['auto','Vehículos'],['tecnologia','Tecnología']].map(([k,v])=>`<button class="filter-pill ${filter===k?'active':''}" data-filter="${k}">${v}</button>`).join('')}
          </div>
          <div class="card-grid">
            ${catalogCards()}
          </div>
        </div>
      </section>

      <section class="section" id="como-funciona">
        <div class="shell">
          <div class="section-head">
            <div>
              <h2>Cómo participa el cliente</h2>
              <p>La experiencia está pensada para que cualquier usuario entienda rápidamente cómo entrar, elegir sus números y seguir el proceso.</p>
            </div>
          </div>
          <div class="how-grid">
            ${[
              ['1','Explora las rifas','El usuario ve premios, valores y fechas con un diseño claro y visual.'],
              ['2','Elige sus números','Selecciona varios números desde celular o computador.'],
              ['3','Confirma su compra','Revisa resumen, datos y próximos pasos antes del pago.'],
              ['4','Consulta su participación','Puede volver a ver sus números, boleta y estado.']
            ].map(([n,t,d])=>`<article class="how-card glass"><div class="step">${n}</div><h3>${t}</h3><p>${d}</p></article>`).join('')}
          </div>
        </div>
      </section>

      <section class="section" id="confianza">
        <div class="shell">
          <div class="section-head">
            <div>
              <h2>Confianza para el usuario final</h2>
              <p>Más allá del diseño, la plataforma debe transmitir seriedad, claridad y control de la información para que el cliente se sienta tranquilo al participar.</p>
            </div>
          </div>
          <div class="trust-grid">
            ${[
              ['Información visible del premio','Fotos, descripción, condiciones, fecha del sorteo y valor por número en una sola vista.'],
              ['Proceso de compra entendible','Resumen de selección, total calculado y próximos pasos antes del pago.'],
              ['Comunicación y soporte','Estados de participación, seguimiento y atención para resolver dudas.']
            ].map(([t,d])=>`<article class="trust-card glass"><h3>${t}</h3><p>${d}</p></article>`).join('')}
          </div>
          <div class="info-grid">
            <article class="info-card glass"><h3>Diseño mobile first</h3><p>La navegación prioriza celulares porque la mayoría de clientes descubrirán y participarán desde redes o enlaces directos.</p></article>
            <article class="info-card glass"><h3>Contenido orientado a conversión</h3><p>Los premios y llamadas a la acción tienen protagonismo visual, con menos ruido técnico y más enfoque comercial.</p></article>
            <article class="info-card glass"><h3>Preparado para crecer</h3><p>La experiencia del cliente puede convivir con un panel administrativo robusto para gestión, reportes e integraciones futuras.</p></article>
          </div>
        </div>
      </section>
    `;
  }

  function catalogCards(){
    const visible = filter === 'all' ? raffles : raffles.filter(r => r.category === filter);
    return visible.map(r => `
      <article class="card glass">
        <div class="card-media"><img src="${r.image}" alt="${esc(r.name)}"></div>
        <div class="card-body">
          <div class="card-top">
            <span class="badge ${r.badgeClass}">${r.badge}</span>
            <span class="mini-chip">${categoryLabel(r.category)}</span>
          </div>
          <h3>${esc(r.name)}</h3>
          <p>${esc(r.desc)}</p>
          <div class="card-data">
            <div class="item"><small>Precio</small><strong>${fmt(r.price)}</strong></div>
            <div class="item"><small>Sorteo</small><strong>${r.drawDate}</strong></div>
            <div class="item"><small>Números</small><strong>${intFmt(r.total)}</strong></div>
            <div class="item"><small>Disponibilidad</small><strong>${100-r.soldPercent}%</strong></div>
          </div>
          <div class="progress"><span style="width:${r.soldPercent}%"></span></div>
          <div class="card-footer">
            <div><div class="card-price">${fmt(r.price)}</div><small class="muted">por número</small></div>
            <a class="btn" href="#detalle/${r.id}">Ver y participar</a>
          </div>
        </div>
      </article>
    `).join('');
  }

  function categoryLabel(k){ return ({moto:'Moto',auto:'Vehículo',tecnologia:'Tecnología'})[k] || 'Premio'; }

  function pageDetail(id){
    const r = raffles.find(x => x.id === id) || raffles[0];
    if(currentRaffle.id !== r.id) selected = [];
    currentRaffle = r;
    const sold = Math.round(r.total * r.soldPercent / 100);
    const available = r.total - sold;
    const selectedPrice = selected.length * r.price;
    const reservedCount = reserves.filter(x => x.raffleId === r.id).length;
    const blocked = new Set(Array.from({length:12}, (_,i)=> (i+1)*3));

    return `
      <section class="detail-page">
        <div class="shell">
          <a href="#rifas" class="back-link">← Volver a los premios</a>
          <div class="detail-grid">
            <div class="detail-panel glass">
              <div class="detail-main-image"><img src="${r.image}" alt="${esc(r.name)}"></div>
              <div class="detail-copy">
                <div class="meta-row">
                  <span class="meta-pill">${categoryLabel(r.category)}</span>
                  <span class="meta-pill">${r.badge}</span>
                  <span class="meta-pill">Cliente final</span>
                </div>
                <h1>${esc(r.name)}</h1>
                <p>${esc(r.desc)}</p>
                <div class="meta-grid">
                  <div class="box"><small>Precio por número</small><strong>${fmt(r.price)}</strong></div>
                  <div class="box"><small>Fecha del sorteo</small><strong>${r.drawDate}</strong></div>
                  <div class="box"><small>Hora</small><strong>${r.winnerDate}</strong></div>
                  <div class="box"><small>Números totales</small><strong>${intFmt(r.total)}</strong></div>
                  <div class="box"><small>Vendidos (demo)</small><strong>${intFmt(sold)}</strong></div>
                  <div class="box"><small>Disponibles</small><strong>${intFmt(available)}</strong></div>
                </div>
                <div class="meta-row">
                  ${r.highlights.map(h=>`<span class="meta-pill">${h}</span>`).join('')}
                </div>
                <div class="inline-note">${r.legal}</div>
              </div>
            </div>

            <div style="display:grid; gap:24px;">
              <div class="purchase-panel glass">
                <h2>Resumen del cliente</h2>
                <p>Selecciona números y conoce cómo se verá un resumen de compra. No hay pagos reales.</p>
                <div class="checkout-summary">
                  <div class="box"><small>Números elegidos</small><strong id="count">${selected.length}</strong></div>
                  <div class="box"><small>Total estimado</small><strong id="total-price">${fmt(selectedPrice)}</strong></div>
                </div>
                <small class="muted">Números seleccionados</small>
                <div id="selected-list" class="selected-list">
                  ${selected.length ? selected.map(x=>`<span class="selected-tag">${String(x).padStart(4,'0')}</span>`).join('') : '<span class="empty-label">Aún no has seleccionado números.</span>'}
                </div>
                <div class="form-actions">
                  <button class="btn primary" id="save-selection" ${selected.length ? '' : 'disabled'}>Guardar selección</button>
                  <button class="btn subtle" id="simulate-checkout" ${selected.length ? '' : 'disabled'}>Continuar al pago</button>
                </div>
                <div class="inline-note" style="margin-top:16px">Selecciones guardadas localmente en esta demo: <strong>${reservedCount}</strong>. Los pagos reales aún no están integrados.</div>
              </div>

              <div class="numbers-panel glass">
                <h2>Elige tus números</h2>
                <p>Puedes seleccionar hasta cinco números para simular la experiencia de compra del cliente.</p>
                <div class="numbers-toolbar">
                  <span class="mini-chip">Máximo 5 números</span>
                  <span class="mini-chip">Bloqueados = ya apartados</span>
                </div>
                <div class="numbers-grid">
                  ${Array.from({length:20}, (_,i) => {
                    const n = i + 1;
                    const isBlocked = blocked.has(n);
                    const isSelected = selected.includes(n);
                    return `<button class="number ${isBlocked ? 'blocked' : isSelected ? 'selected' : ''}" data-num="${n}" ${isBlocked ? 'disabled' : ''}>${String(n).padStart(4,'0')}</button>`;
                  }).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function pageAdmin(){
    const totalRaffles = raffles.length + drafts.length;
    return `
      <section class="admin-page">
        <div class="shell admin-shell">
          <aside class="sidebar glass">
            <strong>Portal administrativo</strong>
            <a href="#admin" class="${isActive('admin') ? 'active' : ''}">Resumen</a>
            <a href="#admin/rifas" class="${route()==='admin/rifas' ? 'active' : ''}">Rifas</a>
            <a href="#admin/nueva" class="${route()==='admin/nueva' ? 'active' : ''}">Nueva rifa</a>
            <a href="#admin/clientes" class="${route()==='admin/clientes' ? 'active' : ''}">Clientes</a>
            <a href="#admin/pagos" class="${route()==='admin/pagos' ? 'active' : ''}">Pagos</a>
          </aside>

          <div class="admin-content">
            <div class="admin-head glass">
              <h2>Panel de administración</h2>
              <p class="muted">Esta sección mantiene el ecosistema completo: experiencia del cliente por fuera, control del negocio por dentro.</p>
            </div>
            <div class="stat-grid">
              <article class="stat-card glass"><small>Rifas visibles</small><strong>${raffles.length}</strong><span class="muted">catálogo demo</span></article>
              <article class="stat-card glass"><small>Borradores locales</small><strong>${drafts.length}</strong><span class="muted">este navegador</span></article>
              <article class="stat-card glass"><small>Módulos listos</small><strong>5</strong><span class="muted">frontend conceptual</span></article>
              <article class="stat-card glass"><small>Ventas reales</small><strong>0</strong><span class="muted">desactivadas</span></article>
            </div>
            <div class="table-card glass">
              <h3>Estado del prototipo</h3>
              <div class="table-wrap">
                <table class="data-table">
                  <thead><tr><th>Módulo</th><th>Estado</th><th>Detalle</th></tr></thead>
                  <tbody>
                    <tr><td>Portal cliente final</td><td>Listo</td><td>Catálogo, detalle y selección de números</td></tr>
                    <tr><td>Estilo visual V3</td><td>Listo</td><td>Minimalista, futurista y glass</td></tr>
                    <tr><td>Administración</td><td>Demo</td><td>Resumen, rifas, borradores y formularios</td></tr>
                    <tr><td>Base de datos</td><td>Pendiente</td><td>Se integrará en la siguiente fase</td></tr>
                    <tr><td>Pagos</td><td>Pendiente</td><td>No hay procesamiento real</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function pageAdminRaffles(){
    const rows = [...drafts.map(d => ({...d, status:'Borrador local'})), ...raffles.map(r => ({...r, status:'Visible demo'}))];
    return `
      <section class="admin-page">
        <div class="shell admin-shell">
          ${sidebar('admin/rifas')}
          <div class="admin-content">
            <div class="admin-head glass"><h2>Rifas y premios</h2><p class="muted">Listado de rifas visibles en la demo y borradores guardados localmente.</p></div>
            <div class="table-card glass">
              <div class="table-wrap">
                <table class="data-table">
                  <thead><tr><th>Nombre</th><th>Precio</th><th>Cantidad</th><th>Estado</th><th>Acción</th></tr></thead>
                  <tbody>
                    ${rows.map(r=>`<tr><td><strong>${esc(r.name)}</strong><br><span class="muted">${categoryLabel(r.category)}</span></td><td>${fmt(r.price)}</td><td>${intFmt(r.total)}</td><td>${esc(r.status)}</td><td>${String(r.id).startsWith('draft-') ? `<button class="btn subtle" data-remove="${r.id}">Eliminar</button>` : `<a class="simple-link" href="#detalle/${r.id}">Ver</a>`}</td></tr>`).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function pageAdminNew(){
    return `
      <section class="admin-page">
        <div class="shell admin-shell">
          ${sidebar('admin/nueva')}
          <div class="admin-content">
            <div class="admin-head glass"><h2>Crear borrador</h2><p class="muted">Este formulario permite construir nuevas campañas de manera local mientras definimos la estructura real del sistema.</p></div>
            <div class="form-card glass">
              <form id="draft-form">
                <div class="form-grid">
                  <div class="field full"><label>Nombre de la rifa</label><input name="name" required placeholder="Ej. BMW G 310 R Edición Especial"></div>
                  <div class="field"><label>Categoría</label><select name="category"><option value="moto">Moto</option><option value="auto">Vehículo</option><option value="tecnologia">Tecnología</option></select></div>
                  <div class="field"><label>Fecha del sorteo</label><input type="date" name="draw"></div>
                  <div class="field"><label>Precio por número</label><input type="number" name="price" required placeholder="25000"></div>
                  <div class="field"><label>Cantidad de números</label><input type="number" name="total" required placeholder="10000"></div>
                  <div class="field full"><label>Descripción</label><textarea name="desc" required placeholder="Describe el premio y la experiencia para el usuario final..."></textarea></div>
                </div>
                <div class="form-actions">
                  <a href="#admin/rifas" class="btn subtle">Cancelar</a>
                  <button class="btn primary" type="submit">Guardar borrador</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function sidebar(active){
    return `
      <aside class="sidebar glass">
        <strong>Portal administrativo</strong>
        <a href="#admin" class="${active==='admin' ? 'active' : ''}">Resumen</a>
        <a href="#admin/rifas" class="${active==='admin/rifas' ? 'active' : ''}">Rifas</a>
        <a href="#admin/nueva" class="${active==='admin/nueva' ? 'active' : ''}">Nueva rifa</a>
        <a href="#admin/clientes" class="${active==='admin/clientes' ? 'active' : ''}">Clientes</a>
        <a href="#admin/pagos" class="${active==='admin/pagos' ? 'active' : ''}">Pagos</a>
      </aside>
    `;
  }

  function pagePlaceholder(kind){
    const map = kind === 'clientes'
      ? ['Clientes','Aquí irá el historial de participantes, compras, datos y seguimiento de soporte.']
      : ['Pagos','Aquí irá la conciliación, estados de transacciones y reportes de recaudo.'];
    return `
      <section class="admin-page">
        <div class="shell admin-shell">
          ${sidebar(`admin/${kind}`)}
          <div class="admin-content">
            <div class="empty-state glass">
              <h2>${map[0]}</h2>
              <p>${map[1]}</p>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function render(){
    const r = route();
    let html = '';
    if(r === 'inicio' || r === '') html = pageHome();
    else if(r === 'rifas') html = pageHome();
    else if(r.startsWith('detalle/')) html = pageDetail(r.replace('detalle/',''));
    else if(r === 'admin') html = pageAdmin();
    else if(r === 'admin/rifas') html = pageAdminRaffles();
    else if(r === 'admin/nueva') html = pageAdminNew();
    else if(r === 'admin/clientes') html = pagePlaceholder('clientes');
    else if(r === 'admin/pagos') html = pagePlaceholder('pagos');
    else if(r === 'como-funciona' || r === 'confianza') html = pageHome();
    else html = pageHome();
    app.innerHTML = html;
    requestAnimationFrame(() => {
      if(r === 'como-funciona' || r === 'confianza' || r === 'rifas') {
        const sectionId = r === 'rifas' ? 'rifas' : r;
        document.getElementById(sectionId)?.scrollIntoView({behavior:'smooth'});
      } else {
        window.scrollTo({top:0, behavior:'instant'});
      }
    });
  }

  document.addEventListener('click', (e) => {
    const filterBtn = e.target.closest('[data-filter]');
    if(filterBtn){ filter = filterBtn.dataset.filter; render(); return; }

    const num = e.target.closest('[data-num]');
    if(num){
      const value = Number(num.dataset.num);
      if(selected.includes(value)) selected = selected.filter(v => v !== value);
      else if(selected.length < 5) selected = [...selected, value].sort((a,b)=>a-b);
      else return toast('Puedes elegir máximo cinco números');
      document.querySelectorAll('[data-num]').forEach(button => button.classList.toggle('selected', selected.includes(Number(button.dataset.num))));
      const count = document.getElementById('count');
      const total = document.getElementById('total-price');
      const list = document.getElementById('selected-list');
      if(count) count.textContent = selected.length;
      if(total) total.textContent = fmt(selected.length * currentRaffle.price);
      if(list) list.innerHTML = selected.length
        ? selected.map(n => `<span class="selected-tag">${String(n).padStart(4,'0')}</span>`).join('')
        : '<span class="empty-label">Aún no has seleccionado números.</span>';
      ['save-selection','simulate-checkout'].forEach(id=>{const b=document.getElementById(id);if(b)b.disabled=!selected.length;});
      return;
    }

    const remove = e.target.closest('[data-remove]');
    if(remove){
      drafts = drafts.filter(x => x.id !== remove.dataset.remove);
      save(draftKey, drafts);
      render();
      toast('Borrador eliminado');
      return;
    }

    const saveSelection = e.target.closest('#save-selection');
    if(saveSelection){
      if(!selected.length) return;
      reserves.unshift({ raffleId: currentRaffle.id, numbers:[...selected], createdAt: new Date().toISOString() });
      save(reserveKey, reserves);
      toast('Selección de prueba guardada; no es una compra');
      return;
    }

    const simulate = e.target.closest('#simulate-checkout');
    if(simulate){
      if(!selected.length) return;
      toast('Checkout demo: siguiente fase conectará datos, login y pagos');
      return;
    }
  });

  document.addEventListener('submit', (e) => {
    if(e.target.id !== 'draft-form') return;
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = String(fd.get('name') || '').trim();
    const desc = String(fd.get('desc') || '').trim();
    const category = String(fd.get('category') || 'moto');
    const price = Number(fd.get('price') || 0);
    const total = Number(fd.get('total') || 0);
    const draw = String(fd.get('draw') || '');
    if(name.length < 3 || desc.length < 10 || !Number.isSafeInteger(price) || price <= 0 || !Number.isSafeInteger(total) || total < 10 || total > 1000000) return toast('Completa correctamente el formulario');
    drafts.unshift({ id:`draft-${Date.now().toString(36)}`, name, desc, category, price, total, draw });
    save(draftKey, drafts);
    go('admin/rifas');
    toast('Borrador guardado');
  });

  menuBtn.addEventListener('click', () => {
    const expanded = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(expanded));
  });

  window.addEventListener('hashchange', render);
  if(!location.hash) location.hash = '#inicio';
  render();
})();
