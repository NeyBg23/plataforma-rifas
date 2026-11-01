import test from 'node:test';
import assert from 'node:assert/strict';
import {BUCKET,documentPath,dossierEditable,dossierChecklist,isUUID,safeDocumentName} from '../admin/dossier-domain.mjs';
const R='c3b1eb27-ade9-434f-ade4-6ce68f84f184';
const U='7de48a14-9afb-4c6e-b119-d7ae12c2d6e5';
const F='11111111-1111-4111-8111-111111111111';
const file={name:'\u0066\u0069\u0063\u0068\u0061.pdf',type:'application/pdf',size:4096};
test('bucket privado previsto, nunca público',()=>assert.equal(BUCKET,'ets-campaign-evidence'));
test('normaliza ruta aleatoria por rifa y usuario',()=>assert.equal(documentPath(R,U,file,F),`${R}/${U}/${F}.pdf`));
test('no acepta un identificador inválido ni rutas ajenas',()=>assert.throws(()=>documentPath('../etc',U,file,F)));
test('no acepta tipos ni archivos vacíos o sobredimensionados',()=>{
  for(const f of [{...file,size:0},{...file,size:10485761},{...file,type:'text/html'}])assert.throws(()=>documentPath(R,U,f,F));
});
test('el nombre se limita a un archivo y no permite ruta local',()=>assert.equal(safeDocumentName('C:\\a\\soporte.pdf'),'soporte.pdf'));
test('no pueden editar auditores, usuarios anónimos ni campañas verificadas',()=>{
  const r={state:'draft',authorization_verified:false};
  assert.equal(dossierEditable(r,'admin'),true);
  assert.equal(dossierEditable(r,'auditor'),false);
  assert.equal(dossierEditable({...r,state:'published'},'admin'),false);
  assert.equal(dossierEditable({...r,authorization_verified:true},'admin'),false);
});
test('un expediente vacío nunca está listo para revisión',()=>{
  const result=dossierChecklist({raffle:{title:'Prueba',total_numbers:100,ticket_price_cop:20000}});
  assert.equal(result.legallyEnabled,false);
  assert.equal(result.internalReady,false);
});
test('soportes completos no equivalen a autorización comercial',()=>{
  const result=dossierChecklist({raffle:{title:'Rifa',total_numbers:100,ticket_price_cop:1000,draw_at:'2027-01-01T10:00:00Z',state:'draft',authorization_verified:false},dossier:{organizer_name:'Organizador',competent_authority:'Autoridad'},prize:{prize_details:'Todas las especificaciones del premio',delivery_notes:'Entrega en oficina'},photoCount:4,documents:[{document_kind:'authorization_claim'}]});
  assert.equal(result.completed,6);
  assert.equal(result.internalReady,true);
  assert.equal(result.legallyEnabled,false);
});
test('referencias declaradas no alteran cálculo de autorización',()=>{
  const result=dossierChecklist({raffle:{state:'draft',authorization_verified:false},dossier:{authorization_reference_claimed:'ABC123'},documents:[]});
  assert.equal(result.legallyEnabled,false);
});
test('valida UUID con formato explícito',()=>{assert.ok(isUUID(R));assert.equal(isUUID('nope'),false)});