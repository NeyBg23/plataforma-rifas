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

  // Panel de gestión local, sin autenticación ni operaciones comerciales.
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
    const r = route();
    let html = '';
    if(r === 'inicio' || r === '') html = pageHome();
    else if(r === 'rifas') html = pageHome();
    else if(r.startsWith('detalle/')) html = pageDetail(r.replace('detalle/',''));
    else if(r === 'admin') html = pageAdmin();
    else if(r === 'admin/rifas') html = pageAdminRaffles();
    else if(r === 'admin/nueva') {editingDraftId=null;html = pageAdminNew();}
    else if(r.startsWith('admin/editar/')) html = pageAdminNew(decodeURIComponent(r.slice('admin/editar/'.length)));
    else if(r === 'admin/ayuda') html = pageAdminHelp();
    else if(r === 'admin/clientes') html = pagePlaceholder('clientes');
    else if(r === 'admin/pagos') html = pagePlaceholder('pagos');
    else if(r === 'como-funciona' || r === 'confianza') html = pageHome();
    else html = pageHome();
    app.innerHTML = html;
    nav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded','false');
    if(r === 'admin/nueva' || r.startsWith('admin/editar/')) {wizardStep=1;updateWizard(1);}
    document.title = `${r.startsWith('admin') ? 'Administración | ' : ''}El toque de la suerte!`;
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
  if(!location.hash) location.hash = '#inicio';
  render();
})();