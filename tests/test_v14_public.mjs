import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {catalogUrl,normalizePublicRow,fetchPublicCatalog,PUBLIC_COLUMNS} from '../public-catalog.mjs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const app=readFileSync(new URL('../site.mjs',import.meta.url),'utf8');

test('La portada V14 ya no redirige automáticamente a la demostración',()=>{
  assert.doesNotMatch(html,/http-equiv\s*=\s*['"]refresh/i);
  assert.doesNotMatch(html,/location\.(replace|assign)\(/);
  assert.match(html,/id="campaign-list"/);
});
test('Wompi permanece sin botón de cobro ni claves privadas',()=>{
  assert.match(html,/Pagos no disponibles/);
  assert.match(html,/disabled aria-disabled="true"/);
  assert.doesNotMatch(html,/service_role|sb_secret_|private_key/i);
});
test('El catálogo usa exclusivamente columnas públicas y filtro published',()=>{
  const url=new URL(catalogUrl('https://example.supabase.co'));
  assert.equal(url.searchParams.get('state'),'eq.published');
  assert.equal(url.searchParams.get('select'),PUBLIC_COLUMNS);
  assert.doesNotMatch(PUBLIC_COLUMNS,/created_by|authorization_verified|payment/);
});
test('No muestra borradores si el servidor devuelve filas indebidas', async ()=>{
  const result=await fetchPublicCatalog({url:'https://sample.supabase.co',publishableKey:'sb_publishable_dummy'},async (_url,options)=>{
    assert.equal(options.method,'GET');
    assert.ok(options.headers.apikey.startsWith('sb_publishable_'));
    return {ok:true,json:async()=>[
      {id:'a',state:'draft',title:'Secreto'},
      {id:'b',state:'published',title:'Campaña aprobada',description:'Ejemplo',ticket_price_cop:2000,total_numbers:100,draw_at:'2026-12-01T19:00:00Z'}
    ]};
  });
  assert.equal(result.length,1);
  assert.equal(result[0].title,'Campaña aprobada');
});
test('Una falla de la API no se transforma en campañas inventadas',async()=>{
  await assert.rejects(()=>fetchPublicCatalog({url:'https://sample.supabase.co',publishableKey:'sb_publishable_dummy'},async()=>({ok:false,status:500})),/No se pudo/);
});
test('El catálogo no permite claves secretas como configuración pública',async()=>{
  await assert.rejects(()=>fetchPublicCatalog({url:'https://sample.supabase.co',publishableKey:'sb_secret_abcdef'},async()=>({ok:true,json:async()=>[]})),/no está configurada/);
});
test('La UI no invoca reservas ni checkout',()=>{
  assert.doesNotMatch(app,/place_demo_order|ets_number_allocations|\.rpc\(|checkout\.wompi/);
});