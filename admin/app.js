/* El toque de la suerte! · V8 · Acceso exclusivo por Supabase Auth + RLS.
 * El código público NO confiere permisos. La base de datos decide cada operación.
 * No se habilitan ventas, reservas, emisión de boletas ni aprobación de rifas.
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const config = window.ETS_PUBLIC_SUPABASE || {};
  const state = { numbersRaffle:null, numbersPage:0, numbersHighlighted:null, numbersLoading:false, numbersRequest:0, client:null, user:null, staff:null, raffles:[], audit:[], view:'overview', step:1, editing:null, busy:false, selectedRaffle:null, prize:null, photos:[], prizeBusy:false };
  const tableBody = $('rafflesRows');
  const forms = { login:$('loginForm'), raffle:$('raffleForm'), prize:$('prizeForm'), photo:$('photoForm') };
  const themeKey='el-toque-v6-tema';
  let noticeTimeout;

  const money = amount => new Intl.NumberFormat('es-CO', {style:'currency',currency:'COP',maximumFractionDigits:0}).format(amount||0);
  const integer = amount => new Intl.NumberFormat('es-CO').format(amount||0);
  const dateFormat = date => date ? new Intl.DateTimeFormat('es-CO',{dateStyle:'medium',timeStyle:'short'}).format(new Date(date)) : 'Por definir';
  const labels={draft:'Borrador',in_review:'En revisión',awaiting_authorization:'Pendiente de autorización',published:'Publicada',closed:'Finalizada',cancelled:'Cancelada'};
  const roleLabels={admin:'Administrador',operator:'Operador',auditor:'Auditor'};
  const canWrite = () => ['admin','operator'].includes(state.staff?.role) && Boolean(state.staff?.enabled);
  const canReturnToDraft = raffle => canWrite() && Boolean(raffle) && !raffle.authorization_verified && ['in_review','awaiting_authorization'].includes(raffle.state);

  function setTheme(value){
    const theme = value==='light'?'light':'dark';
    document.body.dataset.theme=theme;
    const button=$('themeToggle');
    button.textContent=theme==='dark'?'☀ Tema claro':'☾ Tema oscuro';
    try{localStorage.setItem(themeKey,theme);}catch{}
  }
  function initTheme(){
    let theme='dark';try{theme=localStorage.getItem(themeKey)||'dark';}catch{}
    setTheme(theme);
  }
  function visible(view){
    for(const id of ['setupView','loginView','loadingView','dashboardView']) $(id).hidden = id!==view;
  }
  function note(message,isError=false){
    const box=$('notice');box.textContent=message;box.hidden=false;box.classList.toggle('error',isError);
    clearTimeout(noticeTimeout);noticeTimeout=setTimeout(()=>box.hidden=true,8000);
  }
  function setLoginError(message){ const el=$('loginError');el.textContent=message;el.hidden=!message; }
  function isConfigured(){
    return /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(String(config.url||'')) && /^sb_publishable_[A-Za-z0-9_-]{12,}$/.test(String(config.publishableKey||''));
  }
  function addScript(src){
    return new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.src=src;script.async=true;
      script.onload=resolve;script.onerror=()=>reject(new Error('No se pudo cargar la biblioteca de autenticación.'));
      document.head.appendChild(script);
    });
  }
  async function init(){
    initTheme();
    if(!isConfigured()){visible('setupView');return;}
    visible('loadingView');
    try{
      // SDK versión fija: revisar y actualizar en un release de seguridad posterior.
      if(!window.supabase?.createClient) await addScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/dist/umd/supabase.js');
      if(!window.supabase?.createClient) throw new Error('SDK no disponible');
      state.client=window.supabase.createClient(config.url,config.publishableKey,{auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:false}});
      await checkSession();
    }catch(e){visible('loginView');setLoginError('No se pudo establecer la conexión. Comprueba la configuración y vuelve a cargar.');console.error('Admin init failed',e?.message);}
  }
  async function checkSession(){
    const {data,error}=await state.client.auth.getUser();
    if(error||!data?.user){visible('loginView');return;}
    const user=data.user;
    const result=await state.client.from('ets_staff_members').select('role,enabled').eq('user_id',user.id).maybeSingle();
    if(result.error){visible('loginView');setLoginError('No se pudo verificar tu permiso. Intenta de nuevo.');return;}
    if(!result.data?.enabled||!['admin','operator','auditor'].includes(result.data.role)){
      await state.client.auth.signOut();visible('loginView');setLoginError('Esta cuenta no tiene autorización para acceder al administrador.');return;
    }
    state.user=user;state.staff=result.data;
    $('accountEmail').textContent=user.email||'Usuario';
    $('accountRole').textContent=roleLabels[result.data.role]||result.data.role;
    document.querySelectorAll('.write-only').forEach(element=>element.hidden=!canWrite());
    visible('dashboardView');await loadData();showPanel('overview');
  }
  async function loadData(){
    if(!state.client||!state.user)return;
    const [{data,error},{data:audit,error:auditError}] = await Promise.all([
      state.client.from('ets_raffles').select('id,title,description,category,ticket_price_cop,total_numbers,draw_at,state,authorization_verified,created_at,updated_at').order('created_at',{ascending:false}).limit(200),
      state.client.from('ets_raffle_audit').select('id,raffle_id,actor_id,operation,old_data,new_data,created_at').order('created_at',{ascending:false}).limit(100)
    ]);
    if(error){note('No se pudieron cargar las rifas: '+error.message,true);return;}
    state.raffles=data||[];
    state.audit=auditError?[]:(audit||[]);
    renderMetrics();renderTable();renderAudit();
  }
  function renderMetrics(){
    $('metricTotal').textContent=integer(state.raffles.length);
    $('metricDraft').textContent=integer(state.raffles.filter(r=>r.state==='draft').length);
    $('metricReview').textContent=integer(state.raffles.filter(r=>r.state==='in_review'||r.state==='awaiting_authorization').length);
  }
  function el(tag,attrs={},value){
    const node=document.createElement(tag);
    for(const [key,val] of Object.entries(attrs)){
      if(key==='class')node.className=val;
      else if(key==='dataset')for(const [k,v] of Object.entries(val))node.dataset[k]=v;
      else node.setAttribute(key,val);
    }
    if(value!==undefined)node.textContent=String(value);
    return node;
  }
  function renderTable(){
    const search=$('searchInput').value.trim().toLocaleLowerCase('es');
    const status=$('statusFilter').value;
    const rows=state.raffles.filter(r=>(status==='all'||r.state===status)&&(!search||`${r.title} ${r.category}`.toLocaleLowerCase('es').includes(search)));
    tableBody.replaceChildren();
    $('emptyList').hidden=rows.length>0;
    for(const r of rows){
      const tr=el('tr');
      const name=el('td');name.append(el('strong',{},r.title),el('small',{},r.category));tr.append(name);
      tr.append(el('td',{},money(r.ticket_price_cop)),el('td',{},integer(r.total_numbers)));
      const statusCell=el('td');statusCell.append(el('span',{class:'pill'},labels[r.state]||r.state));tr.append(statusCell);
      const actions=el('td');
      actions.append(el('button',{type:'button',class:'mini',dataset:{prize:r.id}},'Premio y fotos'));
      actions.append(el('button',{type:'button',class:'mini',dataset:{numbers:r.id}},'▦ Números'));
      if(canWrite()&&r.state==='draft'){
        actions.append(el('button',{type:'button',class:'mini',dataset:{edit:r.id}},'Editar'));
        actions.append(el('button',{type:'button',class:'mini',dataset:{review:r.id}},'Enviar a revisión'));
      }
      if(canReturnToDraft(r)){
        actions.append(el('button',{type:'button',class:'mini mini-return',dataset:{returnDraft:r.id}},'↶ Volver a borrador'));
      }
      tr.append(actions);tableBody.append(tr);
    }
  }
  function renderAudit(){
    const parent=$('auditRows');parent.replaceChildren();
    if(!state.audit.length){parent.append(el('p',{},'No hay cambios registrados todavía.'));return;}
    const eventNames={INSERT:'Rifa creada',UPDATE:'Rifa actualizada',DELETE:'Rifa eliminada',PRIZE_INSERT:'Ficha de premio creada',PRIZE_UPDATE:'Ficha de premio actualizada',PHOTO_INSERT:'Fotografía añadida',PHOTO_UPDATE:'Fotografía modificada',PHOTO_DELETE:'Fotografía retirada'};
    const keyNames={title:'Nombre',description:'Descripción',category:'Categoría',ticket_price_cop:'Precio por número',total_numbers:'Cantidad de números',draw_at:'Fecha tentativa',state:'Estado',brand:'Marca',model:'Modelo',prize_condition:'Condición',prize_details:'Características',estimated_value_cop:'Valor estimado',includes_text:'Incluye',delivery_notes:'Entrega',alt_text:'Texto de fotografía',is_cover:'Foto principal',sort_order:'Orden'};
    const formatDiff=(key,value)=>{
      if(value===null||value===undefined||value==='')return 'Sin especificar';
      if(key==='ticket_price_cop'||key==='estimated_value_cop')return money(Number(value));
      if(key==='draw_at')return dateFormat(value);
      if(key==='is_cover')return value?'Sí':'No';
      if(key==='state')return labels[value]||value;
      if(key==='prize_condition')return ({new:'Nuevo',used:'Usado',other:'Otro'})[value]||value;
      return String(value);
    };
    for(const item of state.audit){
      const box=el('article',{class:'event'});
      box.append(el('strong',{},eventNames[item.operation]||'Cambio registrado'));
      const associated=state.raffles.find(x=>x.id===item.raffle_id);
      box.append(el('p',{},associated?.title||item.new_data?.title||item.old_data?.title||'Premio'));
      const metadata=el('div',{class:'time'},dateFormat(item.created_at));
      if(item.actor_id)metadata.append(el('span',{},' · Usuario '+String(item.actor_id).slice(0,8)+'…'));
      box.append(metadata);
      const old=item.old_data||{},current=item.new_data||{};
      const keys=Object.keys(keyNames).filter(key=>Object.prototype.hasOwnProperty.call(current,key)||Object.prototype.hasOwnProperty.call(old,key));
      const changed=keys.filter(key=>JSON.stringify(old[key]??null)!==JSON.stringify(current[key]??null));
      if(changed.length){
        const list=el('ul',{class:'audit-diff'});
        for(const key of changed.slice(0,12)){
          const li=el('li');li.append(el('b',{},keyNames[key]+': '));
          if(Object.prototype.hasOwnProperty.call(old,key))li.append(el('span',{class:'old'},formatDiff(key,old[key])),document.createTextNode(' → '));
          li.append(el('span',{class:'new'},formatDiff(key,current[key])));list.append(li);
        }
        box.append(list);
      }
      parent.append(box);
    }
  }
  function showPanel(panel){
    if(!['overview','raffles','create','audit','prize','numbers'].includes(panel))return;
    if(panel==='create'&&!canWrite())return note('Tu rol no puede crear rifas.',true);
    state.view=panel;
    for(const name of ['overview','raffles','create','audit','prize','numbers']) $(name+'Panel').hidden = name!==panel;
    document.querySelectorAll('[data-view]').forEach(btn=>btn.classList.toggle('active',btn.dataset.view===panel));
    if(panel==='create'&&!state.editing)clearForm();
    if(panel==='raffles')renderTable();
    if(panel==='numbers'&&!state.numbersRaffle){showPanel('raffles');return;}
    if(panel==='audit')renderAudit();
    window.scrollTo({top:0,behavior:'instant'});
  }
  function clearForm(){
    forms.raffle.reset();state.editing=null;$('formTitle').textContent='Crear una rifa.';setStep(1);
  }
  function startEdit(id){
    if(!canWrite())return;
    const record=state.raffles.find(x=>x.id===id);if(!record)return;
    state.editing=id;forms.raffle.reset();
    for(const field of ['title','description','category','ticket_price_cop','total_numbers']) forms.raffle.elements[field].value=record[field]??'';
    if(record.draw_at){
      const d=new Date(record.draw_at);
      // datetime-local uses local time: convert from UTC to local input.
      const local=new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);
      forms.raffle.elements.draw_at.value=local;
    }
    $('formTitle').textContent='Editar borrador.';setStep(1);showPanel('create');
  }
  function setStep(s){
    state.step=Math.max(1,Math.min(3,s));
    document.querySelectorAll('[data-step-panel]').forEach(p=>p.hidden=Number(p.dataset.stepPanel)!==state.step);
    document.querySelectorAll('[data-step]').forEach(button=>button.classList.toggle('active',Number(button.dataset.step)===state.step));
    $('wizardBack').hidden=state.step===1;
    $('wizardNext').hidden=state.step===3;
    $('saveRaffle').hidden=state.step!==3;
    if(state.step===3)renderPreview();
  }
  function validateStep(s){
    const panel=document.querySelector(`[data-step-panel="${s}"]`);
    if(!panel)return false;
    for(const input of panel.querySelectorAll('input,select,textarea')){
      if(!input.checkValidity()){
        input.reportValidity();input.focus();return false;
      }
    }
    return true;
  }
  function renderPreview(){
    const f=new FormData(forms.raffle);const target=$('reviewGrid');target.replaceChildren();
    const vals=[
      ['Premio',f.get('title')||'Por definir'],['Categoría',f.get('category')||''],
      ['Precio por número',money(Number(f.get('ticket_price_cop')||0))],
      ['Cantidad',integer(Number(f.get('total_numbers')||0))],
      ['Fecha tentativa',f.get('draw_at')?dateFormat(new Date(String(f.get('draw_at'))).toISOString()):'Por definir'],
      ['Estado final','BORRADOR — sin ventas']
    ];
    vals.forEach(([key,value])=>{const card=el('article');card.append(el('small',{},key),el('strong',{},value));target.append(card);});
  }
  async function saveRaffle(event){
    event.preventDefault();if(!canWrite()||state.busy)return;
    if(!validateStep(1)){setStep(1);validateStep(1);return;}
    if(!validateStep(2)){setStep(2);validateStep(2);return;}
    const form=new FormData(forms.raffle);
    const price=Number(form.get('ticket_price_cop')),total=Number(form.get('total_numbers'));
    if(!Number.isSafeInteger(price)||price<1||price>1000000000||!Number.isSafeInteger(total)||total<10||total>1000000){note('Revisa el precio y la cantidad de números.',true);return;}
    const draw=String(form.get('draw_at')||'');
    if(draw&&!Number.isFinite(new Date(draw).getTime())){note('Fecha no válida',true);return;}
    const payload={title:String(form.get('title')||'').trim(),description:String(form.get('description')||'').trim(),category:String(form.get('category')||''),ticket_price_cop:price,total_numbers:total,draw_at:draw?new Date(draw).toISOString():null};
    state.busy=true;$('saveRaffle').disabled=true;
    try{
      let req;
      if(state.editing) req=state.client.from('ets_raffles').update(payload).eq('id',state.editing).select('id').single();
      else req=state.client.from('ets_raffles').insert({...payload,created_by:state.user.id,state:'draft'}).select('id').single();
      const {error}=await req;
      if(error)throw error;
      await loadData();state.editing=null;showPanel('raffles');note('Borrador guardado en la base de datos. No está publicado.');
    }catch(err){note('No fue posible guardar: '+(err.message||'error desconocido'),true);}
    finally{state.busy=false;$('saveRaffle').disabled=false;}
  }
  async function sendToReview(id){
    if(!canWrite()||state.busy)return;
    const raffle=state.raffles.find(x=>x.id===id);
    if(!raffle||raffle.state!=='draft')return;
    if(!confirm('¿Enviar este borrador a revisión interna?\n\nMientras esté en revisión no podrás editarlo, pero podrás devolverlo a borrador para corregir sus datos y fotografías.\n\nNo se publicará ni recibirá pagos.'))return;
    state.busy=true;
    try{
      const {error}=await state.client.from('ets_raffles').update({state:'in_review'}).eq('id',id);
      if(error)throw error;
      await loadData();note('Enviado a revisión interna. Sin publicación comercial.');
    }catch(err){note('No se pudo cambiar el estado: '+(err.message||'error desconocido'),true);}
    finally{state.busy=false;}
  }
  async function returnToDraft(id){
    if(state.busy||state.prizeBusy)return;
    // Comprueba los permisos también en PostgreSQL mediante RLS: el navegador no los otorga.
    const raffle=state.raffles.find(r=>r.id===id);
    if(!canReturnToDraft(raffle))return note('Solo puedes devolver a borrador una rifa en revisión y sin autorización de publicación.',true);
    if(!confirm('¿Devolver «'+raffle.title+'» a borrador?\n\nPodrás modificar los datos y fotografías. El cambio quedará registrado en el historial. No se publicará ni se borrará la rifa.'))return;
    state.busy=true;
    try{
      const {data,error}=await state.client.from('ets_raffles').update({state:'draft'})
        .eq('id',id).eq('state',raffle.state).eq('authorization_verified',false)
        .select('id').maybeSingle();
      if(error)throw error;
      if(!data)throw new Error('La rifa cambió de estado o ya no tienes permisos. Actualiza el listado.');
      await loadData();
      if(state.selectedRaffle?.id===id){
        state.selectedRaffle=state.raffles.find(r=>r.id===id)||null;
        updatePrizeAccess();
        await renderPhotos();
      }
      note('Rifa devuelta a borrador. Ya puedes editar su ficha y fotografías. El cambio está en Historial.');
    }catch(err){
      note('No se pudo devolver a borrador: '+(err.message||'Error desconocido'),true);
    }finally{state.busy=false;}
  }
  const BUCKET='ets-prize-drafts';
  const MAX_IMAGES=8;
  function canEditPrize(){
    return canWrite() && state.selectedRaffle?.state==='draft' && !state.selectedRaffle.authorization_verified;
  }
  function updatePrizeAccess(){
    const editable=canEditPrize();
    forms.prize.querySelectorAll('input,select,textarea').forEach(field=>field.disabled=!editable);
    $('savePrize').hidden=!editable;
    $('prizeReadOnly').hidden=editable;
    $('prizeReturnDraft').hidden=!canReturnToDraft(state.selectedRaffle);
    $('prizeReadOnlyText').textContent=canReturnToDraft(state.selectedRaffle)
      ? 'Esta rifa está en revisión. Para corregir su ficha o subir fotografías, devuélvela a borrador. No perderás los datos y el cambio quedará en el historial.'
      : 'Esta rifa no está en borrador. La ficha se muestra solo para consulta y no se puede modificar desde aquí.';
    forms.photo.hidden=!editable;
    $('prizeStateTag').textContent=labels[state.selectedRaffle?.state]||'Solo lectura';
  }
  async function openPrize(raffleId){
    const raffle=state.raffles.find(r=>r.id===raffleId);
    if(!raffle)return note('No encontramos esta rifa.',true);
    state.selectedRaffle=raffle;state.prize=null;state.photos=[];
    $('prizeRaffleTitle').textContent=raffle.title;
    $('prizeSubtitle').textContent='Ficha privada de '+raffle.title+'. Aún no se publica en el catálogo.';
    forms.prize.reset();forms.photo.reset();
    $('prizeSaveStatus').textContent='Cargando ficha…';
    $('galleryStatus').textContent='Cargando fotografías…';
    $('prizeGallery').replaceChildren();
    document.querySelector('.prize-nav').hidden=false;
    showPanel('prize');updatePrizeAccess();
    await refreshPrize(raffleId);
  }
  async function refreshPrize(id){
    const [{data:p,error:pErr},{data:images,error:iErr}]=await Promise.all([
      state.client.from('ets_prizes').select('raffle_id,brand,model,prize_condition,prize_details,estimated_value_cop,includes_text,delivery_notes,updated_at').eq('raffle_id',id).maybeSingle(),
      state.client.from('ets_prize_images').select('id,raffle_id,storage_path,alt_text,is_cover,sort_order,created_at,uploaded_by').eq('raffle_id',id).order('sort_order',{ascending:true}).order('created_at',{ascending:true}).limit(8)
    ]);
    if(state.selectedRaffle?.id!==id)return;
    if(pErr||iErr){note('No se pudo cargar la ficha del premio: '+(pErr?.message||iErr?.message),true);return;}
    state.prize=p||null;state.photos=images||[];
    const fields=['brand','model','prize_condition','prize_details','estimated_value_cop','includes_text','delivery_notes'];
    for(const field of fields)forms.prize.elements[field].value=p?.[field]??(field==='prize_condition'?'new':'');
    $('prizeSaveStatus').textContent=p?.updated_at?'Último guardado: '+dateFormat(p.updated_at):'Todavía no has guardado la ficha';
    await renderPhotos();
  }
  async function savePrize(event){
    event.preventDefault();
    if(!canEditPrize()||state.prizeBusy)return;
    const form=new FormData(forms.prize);
    const rawVal=String(form.get('estimated_value_cop')||'').trim();
    const estimated=rawVal?Number(rawVal):null;
    if(estimated!==null&&(!Number.isSafeInteger(estimated)||estimated<1||estimated>100000000000))return note('El valor estimado no es válido.',true);
    const payload={brand:String(form.get('brand')||'').trim(),model:String(form.get('model')||'').trim(),prize_condition:String(form.get('prize_condition')||'new'),prize_details:String(form.get('prize_details')||'').trim(),estimated_value_cop:estimated,includes_text:String(form.get('includes_text')||'').trim(),delivery_notes:String(form.get('delivery_notes')||'').trim()};
    if(!forms.prize.checkValidity()){forms.prize.reportValidity();return;}
    state.prizeBusy=true;$('savePrize').disabled=true;
    try{
      const id=state.selectedRaffle.id;
      const request=state.prize
       ?state.client.from('ets_prizes').update(payload).eq('raffle_id',id).select('raffle_id').single()
       :state.client.from('ets_prizes').insert({...payload,raffle_id:id,updated_by:state.user.id}).select('raffle_id').single();
      const {error}=await request;
      if(error)throw error;
      await refreshPrize(id);await loadData();
      note('Ficha guardada en Supabase. Los cambios están en el historial; no está publicada.');
    }catch(e){note('No pudimos guardar la ficha: '+(e.message||'Error desconocido'),true);}
    finally{state.prizeBusy=false;$('savePrize').disabled=false;}
  }
  async function renderPhotos(){
    const target=$('prizeGallery');target.replaceChildren();
    $('galleryStatus').textContent=state.photos.length+' de '+MAX_IMAGES+' imágenes · Solo personal autorizado puede verlas.';
    if(!state.photos.length){target.append(el('p',{class:'photo-empty'},'Todavía no hay fotografías. Sube una imagen para crear la portada.'));return;}
    const id=state.selectedRaffle?.id;
    const results=await Promise.all(state.photos.map(photo=>state.client.storage.from(BUCKET).createSignedUrl(photo.storage_path,120)));
    if(state.selectedRaffle?.id!==id)return;
    for(const [i,photo] of state.photos.entries()){
      const card=el('article',{class:'photo-card'});
      const visual=el('div',{class:'photo-visual'});
      if(!results[i].error&&results[i].data?.signedUrl){
        const img=el('img',{alt:photo.alt_text,loading:'lazy'});img.src=results[i].data.signedUrl;visual.append(img);
      }else visual.append(el('p',{class:'no-photo'},'Vista previa no disponible. Recarga para renovar el acceso temporal.'));
      card.append(visual);
      const info=el('div',{class:'photo-info'});
      if(photo.is_cover)info.append(el('span',{class:'pill'},'✦ Fotografía principal'));
      info.append(el('div',{class:'photo-caption'},photo.alt_text));
      const actions=el('div',{class:'photo-actions'});
      if(canEditPrize()){
        if(!photo.is_cover)actions.append(el('button',{type:'button',class:'mini',dataset:{coverPhoto:photo.id}},'Usar de portada'));
        actions.append(el('button',{type:'button',class:'mini',dataset:{captionPhoto:photo.id}},'Editar texto'));
        actions.append(el('button',{type:'button',class:'mini',dataset:{deletePhoto:photo.id}},'Quitar'));
      }
      info.append(actions);card.append(info);target.append(card);
    }
  }
  async function uploadPhoto(event){
    event.preventDefault();if(!canEditPrize()||state.prizeBusy)return;
    const file=forms.photo.elements.photo.files?.[0];
    const caption=String(new FormData(forms.photo).get('alt_text')||'').trim();
    if(!file)return note('Selecciona una fotografía.',true);
    const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type];
    if(!ext||file.size<=0||file.size>5*1024*1024)return note('Solo JPG, PNG o WebP, hasta 5 MB.',true);
    if(caption.length<4||caption.length>180)return note('Describe la imagen (4 a 180 caracteres).',true);
    if(state.photos.length>=MAX_IMAGES)return note('Esta rifa ya tiene ocho fotografías.',true);
    if(!globalThis.crypto?.randomUUID)return note('Tu navegador no admite carga segura de fotografías.',true);
    state.prizeBusy=true;$('uploadPrizePhoto').disabled=true;
    const id=state.selectedRaffle.id;
    const path=`${id}/${state.user.id}/${crypto.randomUUID()}.${ext}`;
    try{
      const storage=state.client.storage.from(BUCKET);
      const uploaded=await storage.upload(path,file,{contentType:file.type,upsert:false,cacheControl:'3600'});
      if(uploaded.error)throw uploaded.error;
      const {error}=await state.client.from('ets_prize_images').insert({raffle_id:id,storage_path:path,alt_text:caption,uploaded_by:state.user.id,is_cover:state.photos.length===0,sort_order:state.photos.length}).select('id').single();
      if(error){await storage.remove([path]);throw error;}
      forms.photo.reset();await refreshPrize(id);await loadData();
      note('Fotografía guardada de forma privada. No se muestra al público.');
    }catch(e){note('No se pudo subir la fotografía: '+(e.message||'Error desconocido'),true);}
    finally{state.prizeBusy=false;$('uploadPrizePhoto').disabled=false;}
  }
  async function setCoverPhoto(id){
    if(!canEditPrize()||state.prizeBusy)return;
    const photo=state.photos.find(p=>p.id===id);
    if(!photo||photo.is_cover)return;
    state.prizeBusy=true;
    const old=state.photos.find(p=>p.is_cover);
    try{
      if(old){const {error}=await state.client.from('ets_prize_images').update({is_cover:false}).eq('id',old.id);if(error)throw error;}
      const {error}=await state.client.from('ets_prize_images').update({is_cover:true}).eq('id',photo.id);
      if(error)throw error;
      await refreshPrize(state.selectedRaffle.id);await loadData();note('Portada actualizada.');
    }catch(e){
      if(old){await state.client.from('ets_prize_images').update({is_cover:true}).eq('id',old.id);}
      await refreshPrize(state.selectedRaffle.id);note('No se pudo cambiar la portada: '+(e.message||'Error'),true);
    }finally{state.prizeBusy=false;}
  }
  async function updatePhotoCaption(id){
    if(!canEditPrize()||state.prizeBusy)return;
    const photo=state.photos.find(p=>p.id===id);if(!photo)return;
    const next=prompt('Texto descriptivo de la fotografía:',photo.alt_text);
    if(next===null)return;
    const caption=next.trim();if(caption.length<4||caption.length>180)return note('El texto debe tener entre 4 y 180 caracteres.',true);
    state.prizeBusy=true;
    try{
      const {error}=await state.client.from('ets_prize_images').update({alt_text:caption}).eq('id',id);
      if(error)throw error;
      await refreshPrize(state.selectedRaffle.id);await loadData();note('Descripción de la fotografía actualizada.');
    }catch(e){note('No se pudo guardar el texto: '+(e.message||'Error'),true);}
    finally{state.prizeBusy=false;}
  }
  async function deletePhoto(id){
    if(!canEditPrize()||state.prizeBusy)return;
    const photo=state.photos.find(p=>p.id===id);if(!photo)return;
    if(!confirm('¿Retirar esta fotografía? El cambio quedará registrado y la acción no se puede deshacer.'))return;
    state.prizeBusy=true;
    try{
      const {error}=await state.client.from('ets_prize_images').delete().eq('id',id);
      if(error)throw error;
      const removal=await state.client.storage.from(BUCKET).remove([photo.storage_path]);
      await refreshPrize(state.selectedRaffle.id);await loadData();
      if(removal.error)note('Fotografía retirada del catálogo, pero quedó un archivo huérfano. Un administrador debe revisarlo.',true);
      else note('Fotografía eliminada de la ficha y del almacenamiento privado.');
    }catch(e){note('No se pudo retirar la fotografía: '+(e.message||'Error'),true);}
    finally{state.prizeBusy=false;}
  }
  // V9: consulta paginada y de solo lectura sobre ets_number_allocations.
  // Los números sin registro NO se deben presentar como comercialmente disponibles.
  const NUMBER_PAGE_SIZE=100;
  const numberStates={held:'Retenido',issued:'Emitido',void:'Anulado'};
  const allowedNumberStates=new Set(Object.keys(numberStates));
  function numberString(value,total){
    const width=Math.max(2,String(Math.max(0,total-1)).length);
    return String(value).padStart(width,'0');
  }
  async function openNumbers(raffleId){
    const raffle=state.raffles.find(r=>r.id===raffleId);
    if(!raffle)return note('No encontramos esa rifa.',true);
    state.numbersRaffle=raffle;state.numbersPage=0;state.numbersHighlighted=null;
    $('numbersRaffleTitle').textContent=raffle.title;
    $('numbersRaffleState').textContent=labels[raffle.state]||raffle.state;
    $('numbersRaffleSubtitle').textContent=`Numeración referencial de ${integer(raffle.total_numbers)} registros: del ${numberString(0,raffle.total_numbers)} al ${numberString(raffle.total_numbers-1,raffle.total_numbers)}.`;
    $('numberTotal').textContent=integer(raffle.total_numbers);
    ['numberUnregistered','numberHeld','numberIssuedVoided'].forEach(id=>$(id).textContent='—');
    $('numberSearchInput').value='';
    document.querySelector('.number-nav').hidden=false;
    showPanel('numbers');
    await refreshNumbers();
  }
  async function stepNumbers(delta){
    const raffle=state.numbersRaffle;
    if(!raffle||state.numbersLoading)return;
    const last=Math.ceil(raffle.total_numbers/NUMBER_PAGE_SIZE)-1;
    const next=Math.min(last,Math.max(0,state.numbersPage+delta));
    if(next===state.numbersPage)return;
    state.numbersPage=next;state.numbersHighlighted=null;
    await refreshNumbers();
  }
  async function jumpToNumber(){
    const raffle=state.numbersRaffle;
    if(!raffle||state.numbersLoading)return;
    const entered=$('numberSearchInput').value.trim();
    if(!/^\d{1,7}$/.test(entered))return note('Escribe un número válido, sin signos ni letras.',true);
    const value=Number(entered);
    if(!Number.isSafeInteger(value)||value<0||value>=raffle.total_numbers)return note('El número debe estar dentro del rango de esta rifa.',true);
    state.numbersPage=Math.floor(value/NUMBER_PAGE_SIZE);
    state.numbersHighlighted=value;
    await refreshNumbers();
    document.querySelector('.number-token.highlight')?.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  async function refreshNumbers(){
    const raffle=state.numbersRaffle;
    if(!raffle||!state.client)return;
    const requestId=++state.numbersRequest;
    state.numbersLoading=true;
    $('numbersLoading').textContent='Consultando registros reales en Supabase…';
    $('numbersLoading').hidden=false;
    $('numbersGrid').replaceChildren();
    $('numbersPrev').disabled=true;$('numbersNext').disabled=true;
    $('refreshNumbers').disabled=true;
    const start=state.numbersPage*NUMBER_PAGE_SIZE;
    const end=Math.min(raffle.total_numbers,start+NUMBER_PAGE_SIZE);
    try{
      const base=()=>state.client.from('ets_number_allocations');
      const [page,allCount,heldCount,issuedCount,voidCount]=await Promise.all([
        base().select('number,allocation_state').eq('raffle_id',raffle.id).gte('number',start).lt('number',end).order('number',{ascending:true}).limit(NUMBER_PAGE_SIZE),
        base().select('number',{count:'exact',head:true}).eq('raffle_id',raffle.id),
        base().select('number',{count:'exact',head:true}).eq('raffle_id',raffle.id).eq('allocation_state','held'),
        base().select('number',{count:'exact',head:true}).eq('raffle_id',raffle.id).eq('allocation_state','issued'),
        base().select('number',{count:'exact',head:true}).eq('raffle_id',raffle.id).eq('allocation_state','void')
      ]);
      if(requestId!==state.numbersRequest||state.numbersRaffle?.id!==raffle.id)return;
      const failure=[page,allCount,heldCount,issuedCount,voidCount].find(r=>r.error);
      if(failure)throw failure.error;
      const counted=Number(allCount.count??0),held=Number(heldCount.count??0),issued=Number(issuedCount.count??0),voided=Number(voidCount.count??0);
      if(![counted,held,issued,voided].every(Number.isSafeInteger)||counted>raffle.total_numbers)throw Error('El inventario requiere revisión: se encontraron más registros que números definidos.');
      $('numberUnregistered').textContent=integer(raffle.total_numbers-counted);
      $('numberHeld').textContent=integer(held);
      $('numberIssuedVoided').textContent=integer(issued)+' / '+integer(voided);
      const allocations=new Map((page.data||[]).filter(row=>Number.isSafeInteger(row.number)&&row.number>=start&&row.number<end).map(row=>[row.number,row.allocation_state]));
      const grid=$('numbersGrid');
      const fragment=document.createDocumentFragment();
      for(let number=start;number<end;number++){
        const stateName=allocations.get(number);
        const type=allowedNumberStates.has(stateName)?stateName:'unregistered';
        const box=el('div',{class:'number-token '+type+(number===state.numbersHighlighted?' highlight':'')});
        box.append(el('strong',{},numberString(number,raffle.total_numbers)),el('small',{},numberStates[type]||'Sin registro'));
        box.title=`Número ${numberString(number,raffle.total_numbers)}: ${numberStates[type]||'Sin asignación registrada'}. No puede comprarse desde aquí.`;
        fragment.append(box);
      }
      grid.replaceChildren(fragment);
      $('numbersLoading').hidden=true;
      $('numbersPageLabel').textContent=`Página ${state.numbersPage+1} de ${Math.ceil(raffle.total_numbers/NUMBER_PAGE_SIZE)}`;
      $('numberRangeNote').textContent=`Mostrando ${numberString(start,raffle.total_numbers)} a ${numberString(end-1,raffle.total_numbers)} de ${integer(raffle.total_numbers)} números. Sin emisión ni ventas.`;
    }catch(error){
      if(requestId!==state.numbersRequest)return;
      $('numberUnregistered').textContent='—';
      $('numberHeld').textContent='—';
      $('numberIssuedVoided').textContent='—';
      $('numbersLoading').hidden=false;
      $('numbersLoading').textContent='No pudimos comprobar el inventario. No se mostrarán datos supuestos.';
      note('Error consultando inventario: '+(error.message||'Verifica los permisos de lectura.'),true);
    }finally{
      if(requestId===state.numbersRequest){
        state.numbersLoading=false;
        $('refreshNumbers').disabled=false;
        $('numbersPrev').disabled=state.numbersPage<=0;
        $('numbersNext').disabled=state.numbersPage>=Math.ceil(raffle.total_numbers/NUMBER_PAGE_SIZE)-1;
      }
    }
  }

  async function doLogin(event){
    event.preventDefault();setLoginError('');
    const form=new FormData(forms.login);const email=String(form.get('email')||'').trim();const password=String(form.get('password')||'');
    const button=forms.login.querySelector('button[type=submit]');button.disabled=true;
    try{
      const {error}=await state.client.auth.signInWithPassword({email,password});
      if(error){setLoginError('No se pudo iniciar sesión. Verifica los datos.');return;}
      await checkSession();forms.login.reset();
    }catch{setLoginError('No se pudo establecer conexión con el servidor.');}
    finally{button.disabled=false;}
  }
  async function doLogout(){
    await state.client?.auth.signOut();state.staff=null;state.user=null;state.raffles=[];state.selectedRaffle=null;state.photos=[];state.numbersRaffle=null;state.numbersRequest++;document.querySelector('.number-nav').hidden=true;visible('loginView');
    $('accountEmail').textContent='';setLoginError('');
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.id==='themeToggle'){setTheme(document.body.dataset.theme==='dark'?'light':'dark');return;}
    if(button.dataset.view){if(button.dataset.view==='create'){state.editing=null;clearForm();}showPanel(button.dataset.view);return;}
    if(button.dataset.prize){void openPrize(button.dataset.prize);return;}
    if(button.dataset.numbers){void openNumbers(button.dataset.numbers);return;}
    if(button.id==='numbersGoPrize'){if(state.numbersRaffle)void openPrize(state.numbersRaffle.id);return;}
    if(button.id==='numbersPrev'){void stepNumbers(-1);return;}
    if(button.id==='numbersNext'){void stepNumbers(1);return;}
    if(button.id==='refreshNumbers'){void refreshNumbers();return;}
    if(button.dataset.coverPhoto){void setCoverPhoto(button.dataset.coverPhoto);return;}
    if(button.dataset.captionPhoto){void updatePhotoCaption(button.dataset.captionPhoto);return;}
    if(button.dataset.deletePhoto){void deletePhoto(button.dataset.deletePhoto);return;}
    if(button.dataset.edit){startEdit(button.dataset.edit);return;}
    if(button.dataset.review){void sendToReview(button.dataset.review);return;}
    if(button.dataset.returnDraft){void returnToDraft(button.dataset.returnDraft);return;}
    if(button.id==='prizeReturnDraft'){if(state.selectedRaffle)void returnToDraft(state.selectedRaffle.id);return;}
    if(button.id==='wizardBack'){setStep(state.step-1);return;}
    if(button.id==='wizardNext'){if(validateStep(state.step))setStep(state.step+1);return;}
    if(button.dataset.step){const wanted=Number(button.dataset.step);if(wanted<=state.step||Array.from({length:wanted-state.step},(_,i)=>state.step+i).every(validateStep))setStep(wanted);return;}
    if(button.id==='logout'){void doLogout();}
  });
  $('numberJumpForm').addEventListener('submit',event=>{event.preventDefault();void jumpToNumber();});
  $('searchInput').addEventListener('input',renderTable);
  $('statusFilter').addEventListener('change',renderTable);
  forms.login.addEventListener('submit',event=>{void doLogin(event);});
  forms.raffle.addEventListener('submit',event=>{void saveRaffle(event);});
  forms.prize.addEventListener('submit',event=>{void savePrize(event);});
  forms.photo.addEventListener('submit',event=>{void uploadPhoto(event);});
  void init();
})();