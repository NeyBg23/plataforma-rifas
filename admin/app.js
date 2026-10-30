/* El toque de la suerte! · V7 · Acceso exclusivo por Supabase Auth + RLS.
 * El código público NO confiere permisos. La base de datos decide cada operación.
 * No se habilitan ventas, reservas, emisión de boletas ni aprobación de rifas.
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const config = window.ETS_PUBLIC_SUPABASE || {};
  const state = { client:null, user:null, staff:null, raffles:[], audit:[], view:'overview', step:1, editing:null, busy:false };
  const tableBody = $('rafflesRows');
  const forms = { login:$('loginForm'), raffle:$('raffleForm') };
  const themeKey='el-toque-v6-tema';
  let noticeTimeout;

  const money = amount => new Intl.NumberFormat('es-CO', {style:'currency',currency:'COP',maximumFractionDigits:0}).format(amount||0);
  const integer = amount => new Intl.NumberFormat('es-CO').format(amount||0);
  const dateFormat = date => date ? new Intl.DateTimeFormat('es-CO',{dateStyle:'medium',timeStyle:'short'}).format(new Date(date)) : 'Por definir';
  const labels={draft:'Borrador',in_review:'En revisión',awaiting_authorization:'Pendiente de autorización',published:'Publicada',closed:'Finalizada',cancelled:'Cancelada'};
  const roleLabels={admin:'Administrador',operator:'Operador',auditor:'Auditor'};
  const canWrite = () => ['admin','operator'].includes(state.staff?.role) && Boolean(state.staff?.enabled);

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
      if(canWrite()&&['draft','in_review','awaiting_authorization'].includes(r.state)){
        const edit=el('button',{type:'button',class:'mini',dataset:{edit:r.id}},'Editar');actions.append(edit);
        if(r.state==='draft')actions.append(el('button',{type:'button',class:'mini',dataset:{review:r.id}},'Revisar'));
      }else actions.textContent='Solo lectura';
      tr.append(actions);tableBody.append(tr);
    }
  }
  function renderAudit(){
    const parent=$('auditRows');parent.replaceChildren();
    if(!state.audit.length){parent.append(el('p',{},'No hay cambios registrados todavía.'));return;}
    for(const item of state.audit){
      const box=el('article',{class:'event'});
      box.append(el('strong',{},item.operation==='INSERT'?'Rifa creada':item.operation==='UPDATE'?'Rifa actualizada':'Operación registrada'));
      box.append(el('p',{},item.new_data?.title||item.old_data?.title||'Rifa'));
      box.append(el('div',{class:'time'},dateFormat(item.created_at)));
      parent.append(box);
    }
  }
  function showPanel(panel){
    if(!['overview','raffles','create','audit'].includes(panel))return;
    if(panel==='create'&&!canWrite())return note('Tu rol no puede crear rifas.',true);
    state.view=panel;
    for(const name of ['overview','raffles','create','audit']) $(name+'Panel').hidden = name!==panel;
    document.querySelectorAll('[data-view]').forEach(btn=>btn.classList.toggle('active',btn.dataset.view===panel));
    if(panel==='create'&&!state.editing)clearForm();
    if(panel==='raffles')renderTable();
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
    if(!confirm('¿Enviar este borrador a revisión interna? No se publicará ni recibirá pagos.'))return;
    state.busy=true;
    try{
      const {error}=await state.client.from('ets_raffles').update({state:'in_review'}).eq('id',id);
      if(error)throw error;
      await loadData();note('Enviado a revisión interna. Sin publicación comercial.');
    }catch(err){note('No se pudo cambiar el estado: '+(err.message||'error desconocido'),true);}
    finally{state.busy=false;}
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
    await state.client?.auth.signOut();state.staff=null;state.user=null;state.raffles=[];visible('loginView');
    $('accountEmail').textContent='';setLoginError('');
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.id==='themeToggle'){setTheme(document.body.dataset.theme==='dark'?'light':'dark');return;}
    if(button.dataset.view){if(button.dataset.view==='create'){state.editing=null;clearForm();}showPanel(button.dataset.view);return;}
    if(button.dataset.edit){startEdit(button.dataset.edit);return;}
    if(button.dataset.review){void sendToReview(button.dataset.review);return;}
    if(button.id==='wizardBack'){setStep(state.step-1);return;}
    if(button.id==='wizardNext'){if(validateStep(state.step))setStep(state.step+1);return;}
    if(button.dataset.step){const wanted=Number(button.dataset.step);if(wanted<=state.step||Array.from({length:wanted-state.step},(_,i)=>state.step+i).every(validateStep))setStep(wanted);return;}
    if(button.id==='logout'){void doLogout();}
  });
  $('searchInput').addEventListener('input',renderTable);
  $('statusFilter').addEventListener('change',renderTable);
  forms.login.addEventListener('submit',event=>{void doLogin(event);});
  forms.raffle.addEventListener('submit',event=>{void saveRaffle(event);});
  void init();
})();