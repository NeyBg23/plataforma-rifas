// V17 — vista de cliente SOLO para personal autorizado. Cero escrituras en Supabase.
import { isRaffleId, formatNumber, pickPreviewInfo, formatCOP, imageUrlIsPrivate } from './vista-previa-domain.mjs';

const $ = id => document.getElementById(id);
const cfg = window.ETS_PUBLIC_SUPABASE || {};
const state = { client:null, raffle:null, photos:[], selected:new Set(), page:0, pageSize:100 };
const labels = {draft:'Borrador',in_review:'En revisión',awaiting_authorization:'Esperando autorización',published:'Publicada',closed:'Finalizada',cancelled:'Cancelada'};
const themeKey = 'ets-client-preview-theme';
const dateLabel = value => value ? new Intl.DateTimeFormat('es-CO',{dateStyle:'medium',timeStyle:'short',timeZone:'America/Bogota'}).format(new Date(value)) : 'Por definir';
function theme(next) {
  const value = next==='light'?'light':'dark';
  document.body.dataset.theme=value;
  $('theme-toggle').textContent=value==='dark'?'☀ Tema claro':'☾ Tema oscuro';
  try { localStorage.setItem(themeKey,value); } catch {}
}
$('theme-toggle').addEventListener('click',()=>theme(document.body.dataset.theme==='dark'?'light':'dark'));
try { theme(localStorage.getItem(themeKey)); } catch { theme('dark'); }
function block(message){$('loading').hidden=true;$('preview').hidden=true;$('blocked-reason').textContent=message;$('blocked').hidden=false;}
function setText(id,value){$(id).textContent=value;}
function createNode(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=String(text);return node;}
function selectPhoto(index){
  const photo=state.photos[index];
  if(!photo)return;
  $('main-photo').src=photo.url;
  $('main-photo').alt=photo.alt || 'Fotografía del premio';
  $('main-photo').hidden=false;$('photo-empty').hidden=true;
  $('photo-caption').textContent=photo.alt||'Fotografía del premio';
  Array.from($('photo-thumbs').children).forEach((el,i)=>el.setAttribute('aria-pressed',String(i===index)));
}
async function loadPhotos(images){
  const paths=images.map(p=>p.storage_path);
  if(!paths.length)return;
  const {data,error}=await state.client.storage.from('ets-prize-drafts').createSignedUrls(paths,120);
  if(error||!Array.isArray(data)) { $('photo-caption').textContent='Las fotografías no pudieron cargarse. Actualiza la vista previa.';return; }
  state.photos=data.flatMap((entry,index)=>{
    const image=images[index];
    if(entry?.error||!entry?.signedUrl||!imageUrlIsPrivate(entry.signedUrl,cfg.url))return [];
    return [{url:new URL(entry.signedUrl,cfg.url).href,alt:image.alt_text||'',path:image.storage_path}];
  });
  const list=$('photo-thumbs');list.replaceChildren();
  state.photos.forEach((p,index)=>{
    const button=createNode('button');button.type='button';button.setAttribute('aria-label','Ver fotografía '+(index+1));button.setAttribute('aria-pressed','false');
    const img=createNode('img');img.src=p.url;img.alt='Miniatura '+(index+1);img.loading='lazy';button.append(img);
    button.addEventListener('click',()=>selectPhoto(index));list.append(button);
  });
  if(state.photos.length)selectPhoto(0);
}
function updateSelection(){
  const chosen=[...state.selected].sort((a,b)=>a-b);
  setText('selected-numbers',chosen.length?chosen.map(n=>formatNumber(n,state.raffle.total_numbers)).join(' · '):'Ningún número seleccionado');
  setText('selected-total',formatCOP(chosen.length*state.raffle.ticket_price_cop));
}
function renderNumbers(){
  const {total_numbers}=state.raffle;
  const pages=Math.ceil(total_numbers/state.pageSize);
  const start=state.page*state.pageSize;
  const end=Math.min(start+state.pageSize,total_numbers);
  setText('page-info',`${state.page+1} / ${pages}`);
  $('prev-page').disabled=state.page===0;
  $('next-page').disabled=state.page+1>=pages;
  const fragment=document.createDocumentFragment();
  for(let i=start;i<end;i++){
    const selected=state.selected.has(i);
    const button=createNode('button','',formatNumber(i,total_numbers));
    button.type='button';button.setAttribute('aria-pressed',String(selected));
    button.setAttribute('aria-label',`Número de ejemplo ${formatNumber(i,total_numbers)}${selected?' seleccionado':''}`);
    button.addEventListener('click',()=>{
      if(state.selected.has(i))state.selected.delete(i);
      else if(state.selected.size<5)state.selected.add(i);
      else return;
      button.setAttribute('aria-pressed',String(state.selected.has(i)));
      updateSelection();
    });fragment.append(button);
  }
  $('number-grid').replaceChildren(fragment);updateSelection();
}
$('prev-page').addEventListener('click',()=>{if(state.page>0){state.page--;renderNumbers();}});
$('next-page').addEventListener('click',()=>{if(state.raffle&&state.page+1<Math.ceil(state.raffle.total_numbers/state.pageSize)){state.page++;renderNumbers();}});

async function init(){
  const id=new URLSearchParams(location.search).get('rifa');
  if(!isRaffleId(id))return block('Identificador de sorteo inválido. Accede desde el administrador.');
  if(!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(String(cfg.url||''))||!/^sb_publishable_[A-Za-z0-9_-]{12,}$/.test(String(cfg.publishableKey||'')))return block('Falta la configuración pública de Supabase.');
  try{
    // Compartir el mismo SDK, nombre de almacenamiento y dominio del administrador.
    if(!window.supabase?.createClient) return block('No se pudo cargar el servicio de autenticación.');
    state.client=window.supabase.createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
    const {data:{user},error:userError}=await state.client.auth.getUser();
    if(userError||!user)return block('Debes iniciar sesión en el administrador de este mismo dominio.');
    const {data:staff,error:staffError}=await state.client.from('ets_staff_members').select('role,enabled').eq('user_id',user.id).maybeSingle();
    if(staffError||!staff?.enabled||!['admin','operator','auditor'].includes(staff.role))return block('Tu cuenta no tiene permisos para consultar este sorteo.');
    const {data:raffle,error:raffleError}=await state.client.from('ets_raffles').select('id,title,description,category,ticket_price_cop,total_numbers,draw_at,state,authorization_verified').eq('id',id).maybeSingle();
    if(raffleError||!raffle)return block('Este sorteo no existe o no tienes permiso para consultarlo.');
    const info=pickPreviewInfo(raffle);
    if(!info)return block('La información del sorteo es incompleta o tiene valores inválidos.');
    state.raffle=raffle;
    const [{data:prize,error:prizeError},{data:images,error:imagesError}]=await Promise.all([
      state.client.from('ets_prizes').select('brand,model,prize_condition,prize_details,includes_text,delivery_notes').eq('raffle_id',id).maybeSingle(),
      state.client.from('ets_prize_images').select('storage_path,alt_text,is_cover,sort_order,created_at').eq('raffle_id',id).order('is_cover',{ascending:false}).order('sort_order',{ascending:true}).limit(8)
    ]);
    if(prizeError||imagesError)return block('No se pudo verificar la ficha privada del premio.');
    setText('raffle-title',info.title);
    setText('raffle-description',info.description||'Un premio especial está en preparación.');
    setText('category',info.category);
    setText('draw-date','Sorteo previsto: '+dateLabel(info.draw_at));
    setText('summary-date',dateLabel(info.draw_at));
    setText('raffle-state',labels[info.state]||'En preparación');
    setText('price',formatCOP(info.ticket_price_cop));
    setText('number-count',new Intl.NumberFormat('es-CO').format(info.total_numbers));
    const details=[prize?.brand&&('Marca: '+prize.brand),prize?.model&&('Modelo: '+prize.model),prize?.prize_details,prize?.includes_text&&('Incluye: '+prize.includes_text),prize?.delivery_notes&&('Entrega: '+prize.delivery_notes)].filter(Boolean);
    setText('prize-details',details.join('\n\n')||'Completa la ficha del premio desde el administrador para mostrar aquí sus características.');
    $('loading').hidden=true;$('preview').hidden=false;
    renderNumbers();
    await loadPhotos(images||[]);
  }catch(err){console.error('Private preview failed',err?.message);block('No se pudo conectar con Supabase. Revisa tu sesión y vuelve a intentarlo.');}
}
void init();