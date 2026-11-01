import { BUCKET, DOCUMENT_KINDS, REVIEW_TYPES, dossierChecklist, dossierEditable, documentPath, isUUID, safeDocumentName } from './dossier-domain.mjs';

// Este controlador opera exclusivamente con sesión/rol/RLS de Supabase.
// No incluye ninguna función para verificar autorizaciones, publicar, cobrar ni emitir boletas.
const $ = id => document.getElementById(id);
const cfg = window.ETS_PUBLIC_SUPABASE || {};
const qs = new URLSearchParams(location.search);
const raffleId = qs.get('rifa');
const state = { client:null, user:null, staff:null, raffle:null, dossier:null, prize:null, photos:[], docs:[], reviews:[], busy:false };
const date = val => val ? new Intl.DateTimeFormat('es-CO',{dateStyle:'medium',timeStyle:'short',timeZone:'America/Bogota'}).format(new Date(val)) : 'Sin fecha';
const statusLabels = {draft:'Borrador',in_review:'En revisión',awaiting_authorization:'Pendiente de autorización',published:'Publicada',closed:'Cerrada',cancelled:'Cancelada'};
let toastHandle;
function showMessage(text,error=false) {
  const box=$('toast');box.textContent=text;box.hidden=false;box.classList.toggle('error',error);
  clearTimeout(toastHandle);toastHandle=setTimeout(()=>box.hidden=true,6500);
}
function element(tag,className,text){const x=document.createElement(tag);if(className)x.className=className;if(text!==undefined)x.textContent=String(text);return x;}
function theme(mode){const next=mode==='light'?'light':'dark';document.body.dataset.theme=next;$('themeButton').textContent=next==='dark'?'☀ Tema claro':'☾ Tema oscuro';try{localStorage.setItem('el-toque-v6-tema',next);}catch{}}
$('themeButton').addEventListener('click',()=>theme(document.body.dataset.theme==='dark'?'light':'dark'));
try{theme(localStorage.getItem('el-toque-v6-tema'));}catch{theme('dark');}
function block(message){$('loading').hidden=true;$('workspace').hidden=true;$('blockedMessage').textContent=message;$('blocked').hidden=false;}
function editing(){return dossierEditable(state.raffle,state.staff?.role);}
function disableWrites(){const allow=editing();for(const id of ['dossierForm','documentForm','reviewForm']){
  const form=$(id);for(const control of form.querySelectorAll('input,textarea,select,button'))control.disabled=!allow;
}if(!allow)showMessage('Tu acceso es de consulta o la campaña ya no admite cambios.');}
function safeField(value,max){return String(value??'').trim().slice(0,max);}
function setForm(){const f=$('dossierForm');for(const k of ['organizer_name','competent_authority','authorization_reference_claimed','supporting_notes'])f.elements[k].value=state.dossier?.[k]??'';
  $('dossierUpdated').textContent=state.dossier?.updated_at?'Guardado: '+date(state.dossier.updated_at):'Aún no se ha guardado la ficha documental.';
}
function renderChecklist(){const result=dossierChecklist({raffle:state.raffle,dossier:state.dossier,prize:state.prize,photoCount:state.photos.length,documents:state.docs});
  $('doneCount').textContent=`${result.completed} / ${result.total}`;
  $('progressFill').style.width=`${result.completed/result.total*100}%`;
  $('progressTrack').setAttribute('aria-valuenow',String(result.completed));
  const root=$('checklist');root.replaceChildren();
  for(const item of result.items){const card=element('article','check'+(item.done?' done':''));const mark=element('div','mark',item.done?'✓':'◇');const text=element('div');text.append(element('strong','',item.label),element('small','',item.detail));card.append(mark,text);root.append(card);}
}
function renderDocs(){const container=$('documentList');container.replaceChildren();if(!state.docs.length){container.append(element('div','empty','Aún no hay soportes adjuntos.'));return;}
  for(const d of state.docs){const card=element('article','document');const icon=element('span','doc-icon','▤');const main=element('div');main.style.flex='1';main.style.minWidth='0';main.append(element('div','doc-name',d.original_filename),element('div','doc-meta',`${DOCUMENT_KINDS[d.document_kind]||'Documento'} · ${Math.max(1,Math.round(d.size_bytes/1024))} KB · ${date(d.created_at)} · Privado`));
    const button=element('button','link-button','Abrir ↗');button.type='button';button.dataset.downloadId=d.id;card.append(icon,main,button);container.append(card);}
}
function renderReviews(){const parent=$('reviewList');parent.replaceChildren();if(!state.reviews.length){parent.append(element('div','empty','No hay observaciones.'));return;}
  for(const n of state.reviews){const card=element('article','review');card.append(element('strong','',REVIEW_TYPES[n.note_type]||'Observación'),element('p','',n.content),element('span','review-time',`${date(n.created_at)} · ${String(n.actor_id||'').slice(0,8)}…`));parent.append(card);}
}
function render(){const r=state.raffle;$('loading').hidden=true;$('blocked').hidden=true;$('workspace').hidden=false;
  $('sideRaffleName').textContent=r.title;$('sideState').textContent=statusLabels[r.state]||r.state;
  $('raffleState').textContent=statusLabels[r.state]||r.state;
  setForm();renderChecklist();renderDocs();renderReviews();disableWrites();
}
async function readData(){const db=state.client;
  const [raffle,dossier,prize,photos,docs,reviews]=await Promise.all([
    db.from('ets_raffles').select('id,title,state,authorization_verified,draw_at,ticket_price_cop,total_numbers').eq('id',raffleId).maybeSingle(),
    db.from('ets_campaign_dossiers').select('raffle_id,organizer_name,competent_authority,authorization_reference_claimed,supporting_notes,updated_at').eq('raffle_id',raffleId).maybeSingle(),
    db.from('ets_prizes').select('prize_details,delivery_notes').eq('raffle_id',raffleId).maybeSingle(),
    db.from('ets_prize_images').select('id').eq('raffle_id',raffleId).limit(8),
    db.from('ets_campaign_documents').select('id,storage_path,original_filename,document_kind,size_bytes,created_at').eq('raffle_id',raffleId).order('created_at',{ascending:false}).limit(100),
    db.from('ets_campaign_review_notes').select('id,note_type,content,actor_id,created_at').eq('raffle_id',raffleId).order('created_at',{ascending:false}).limit(100)
  ]);
  const error=[raffle,dossier,prize,photos,docs,reviews].find(x=>x.error)?.error;
  if(error)throw error;
  if(!raffle.data)throw new Error('No se encontró la campaña o tu sesión no tiene permiso para consultarla.');
  state.raffle=raffle.data;state.dossier=dossier.data;state.prize=prize.data;
  state.photos=photos.data||[];state.docs=docs.data||[];state.reviews=reviews.data||[];
  render();
}
async function init(){if(!isUUID(raffleId)){block('Abre un expediente desde el listado de Mis rifas.');return;}
  if(!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(cfg.url||'')||!/^sb_publishable_[A-Za-z0-9_-]{12,}$/.test(cfg.publishableKey||'')){block('Conexión de Supabase no configurada.');return;}
  try{
    if(!window.supabase?.createClient)throw new Error('No se pudo cargar la biblioteca de sesión.');
    state.client=window.supabase.createClient(cfg.url,cfg.publishableKey,{auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:false}});
    const auth=await state.client.auth.getUser();if(auth.error||!auth.data?.user){block('Debes iniciar sesión en el administrador desde este mismo dominio.');return;}
    state.user=auth.data.user;
    const {data,error}=await state.client.from('ets_staff_members').select('role,enabled').eq('user_id',state.user.id).maybeSingle();
    if(error||!data?.enabled||!['admin','operator','auditor'].includes(data.role)){block('Tu cuenta no tiene un rol de personal habilitado para consultar el expediente.');return;}
    state.staff=data;await readData();
  }catch(e){console.warn('V15 expediente:',e?.message);block('No se pudo verificar el expediente. Revisa la sesión y los permisos de Supabase.');}
}
$('dossierForm').addEventListener('submit',async event=>{event.preventDefault();if(!editing()||state.busy)return;
  const f=event.currentTarget;const organizer=safeField(f.elements.organizer_name.value,200),authority=safeField(f.elements.competent_authority.value,200);
  if(organizer.length<3||authority.length<3){showMessage('Completa el organizador y la autoridad competente.',true);return;}
  const row={organizer_name:organizer,competent_authority:authority,authorization_reference_claimed:safeField(f.elements.authorization_reference_claimed.value,160),supporting_notes:safeField(f.elements.supporting_notes.value,4000)};
  state.busy=true;$('saveDossier').disabled=true;
  try{
    const request=state.dossier?state.client.from('ets_campaign_dossiers').update(row).eq('raffle_id',raffleId).select('raffle_id').single():state.client.from('ets_campaign_dossiers').insert({raffle_id:raffleId,...row,updated_by:state.user.id}).select('raffle_id').single();
    const {error}=await request;if(error)throw error;await readData();showMessage('Información documental guardada con trazabilidad.');
  }catch(e){showMessage('No se pudo guardar: '+(e.message||'Verifica permisos.'),true);}finally{state.busy=false;$('saveDossier').disabled=!editing();}
});
$('documentForm').addEventListener('submit',async event=>{event.preventDefault();if(!editing()||state.busy)return;
  const form=event.currentTarget;const file=form.elements.document.files?.[0];const kind=form.elements.document_kind.value;
  if(!DOCUMENT_KINDS[kind]){showMessage('Tipo de documento inválido.',true);return;}
  let path;try{path=documentPath(raffleId,state.user.id,file,crypto.randomUUID());}catch(e){showMessage(e.message,true);return;}
  state.busy=true;$('uploadDocument').disabled=true;
  try{
    const bucket=state.client.storage.from(BUCKET);
    const upload=await bucket.upload(path,file,{upsert:false,contentType:file.type,cacheControl:'0'});
    if(upload.error)throw upload.error;
    const row={raffle_id:raffleId,storage_path:path,document_kind:kind,original_filename:safeDocumentName(file.name),mime_type:file.type,size_bytes:file.size,uploaded_by:state.user.id};
    const save=await state.client.from('ets_campaign_documents').insert(row);
    if(save.error){try{await bucket.remove([path]);}catch{}throw save.error;}
    form.reset();await readData();showMessage('Documento privado registrado. No equivale a autorización.');
  }catch(e){showMessage('No se pudo adjuntar: '+(e.message||'Verifica la sesión.'),true);}finally{state.busy=false;$('uploadDocument').disabled=!editing();}
});
$('reviewForm').addEventListener('submit',async event=>{event.preventDefault();if(!editing()||state.busy)return;
  const form=event.currentTarget,kind=form.elements.note_type.value,content=safeField(form.elements.content.value,2000);
  if(!REVIEW_TYPES[kind]||content.length<5){showMessage('Escribe una observación de al menos cinco caracteres.',true);return;}
  state.busy=true;$('saveReview').disabled=true;
  try{const {error}=await state.client.from('ets_campaign_review_notes').insert({raffle_id:raffleId,note_type:kind,content,actor_id:state.user.id});if(error)throw error;form.reset();await readData();showMessage('Observación incorporada al historial privado.');}
  catch(e){showMessage('No se pudo registrar: '+(e.message||'Verifica permisos.'),true);}finally{state.busy=false;$('saveReview').disabled=!editing();}
});
$('documentList').addEventListener('click',async event=>{const button=event.target.closest('[data-download-id]');if(!button)return;
  const doc=state.docs.find(x=>x.id===button.dataset.downloadId);if(!doc)return;
  button.disabled=true;button.textContent='Abriendo…';
  try{
    const {data,error}=await state.client.storage.from(BUCKET).download(doc.storage_path);
    if(error||!data)throw error||new Error('Descarga no disponible.');
    const obj=URL.createObjectURL(data);const a=document.createElement('a');a.href=obj;a.download=doc.original_filename||'soporte';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(obj),30000);
  }catch(e){showMessage('No se pudo abrir el documento privado. '+(e.message||''),true);}
  finally{button.disabled=false;button.textContent='Abrir ↗';}
});
void init();