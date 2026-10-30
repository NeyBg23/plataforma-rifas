/** Todos los premios y precios son ficticios. No consultar como catálogo comercial. */
export const raffles = Object.freeze([
  {id:'moto',name:'Motocicleta deportiva',subtitle:'Diseño, libertad y emoción',category:'Movilidad',price:25000,total:100,draw:'Fecha de ejemplo: 20 dic. 2026',image:'assets/premio-1.svg',tag:'Premio destacado',features:['Estilo urbano y deportivo','Imágenes ilustrativas','Condiciones sujetas a ficha aprobada']},
  {id:'auto',name:'Automóvil compacto',subtitle:'Un nuevo camino por recorrer',category:'Vehículos',price:50000,total:200,draw:'Fecha de ejemplo: 15 ene. 2027',image:'assets/premio-2.svg',tag:'Explora',features:['Premio ilustrativo','Características aún por definir','Sin campaña comercial activa']},
  {id:'tech',name:'Experiencia tecnológica',subtitle:'Todo un universo en tus manos',category:'Tecnología',price:12000,total:100,draw:'Fecha de ejemplo: 12 dic. 2026',image:'assets/premio-3.svg',tag:'Inspiración',features:['Selección tecnológica de ejemplo','Fotografía referencial','Sin campañas comerciales activas']}
]);
export function getRaffle(id){return raffles.find(r=>r.id===id)??null;}