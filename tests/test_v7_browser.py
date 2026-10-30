from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
JS=(ROOT/'admin/app.js').read_text()
CSS=(ROOT/'admin/styles.css').read_text()
HTML=(ROOT/'admin/index.html').read_text().replace('<script src="config.js"></script><script src="app.js" defer></script>','').replace('<link rel="stylesheet" href="styles.css" />', '<style>'+CSS+'</style>')
MOCK='''
window.ETS_PUBLIC_SUPABASE={url:'https://fake-demo.supabase.co',publishableKey:'sb_publishable_abcdefghijklmnopqrstuvw'};
window.demoDB={raffles:[], audit:[]};
window.demoSession=null;
function query(table){
 const q={table,mode:'select',payload:null,where:[],
 select(cols){this.cols=cols;return this}, order(){return this},limit(){return this},
 eq(k,v){this.where.push([k,v]);return this},
 update(v){this.mode='update';this.payload=v;return this},
 insert(v){this.mode='insert';this.payload=v;return this},
 maybeSingle(){return Promise.resolve({data:{role:'admin',enabled:true},error:null})},
 single(){return Promise.resolve(this.result())},
 result(){
   if(this.table==='ets_staff_members')return {data:{role:'admin',enabled:true},error:null};
   let rows=this.table==='ets_raffles'?window.demoDB.raffles:window.demoDB.audit;
   if(this.mode==='insert'){
     const row={id:'demo-uuid-'+(window.demoDB.raffles.length+1),...this.payload,created_at:new Date().toISOString()};
     window.demoDB.raffles.unshift(row);
     window.demoDB.audit.unshift({id:window.demoDB.audit.length+1,operation:'INSERT',new_data:row,created_at:new Date().toISOString()});
     return {data:row,error:null};
   }
   if(this.mode==='update'){
     const id=this.where.find(x=>x[0]==='id')?.[1];
     const row=rows.find(x=>x.id===id);
     if(row)Object.assign(row,this.payload);
     window.demoDB.audit.unshift({id:window.demoDB.audit.length+1,operation:'UPDATE',new_data:row,created_at:new Date().toISOString()});
     return {data:row,error:null};
   }
   return {data:[...rows],error:null};
 },
 then(resolve,reject){return Promise.resolve(this.result()).then(resolve,reject)}
 };
 return q;
}
window.supabase={createClient(){return {
 auth:{async getUser(){return {data:{user:window.demoSession},error:null}}, async signInWithPassword(){window.demoSession={id:'demo-user-1',email:'admin@example.test'};return {error:null}},async signOut(){window.demoSession=null;return {error:null}}},
 from(name){return query(name)}
}}};
'''

def test():
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for name,width,height in [('desktop',1440,900),('mobile',390,844)]:
   page=browser.new_page(viewport={'width':width,'height':height})
   errors=[]
   page.on('pageerror',lambda e: errors.append(str(e)))
   page.set_content(HTML,wait_until='load')
   page.add_script_tag(content='window.ETS_PUBLIC_SUPABASE={};')
   page.add_script_tag(content=JS)
   assert page.locator('#setupView').is_visible(), 'La consola debe bloquearse sin configuración'
   assert not page.locator('#dashboardView').is_visible(), 'Datos ocultos sin sesión'
   page.locator('#themeToggle').click()
   assert page.locator('body').get_attribute('data-theme')=='light'
   page.screenshot(path=str(ROOT/f'tests/setup-{name}.png'))
   assert not errors, errors
   page.close()

   page=browser.new_page(viewport={'width':width,'height':height})
   errors=[]
   page.on('pageerror',lambda e: errors.append(str(e)))
   page.set_content(HTML,wait_until='load')
   page.add_script_tag(content=MOCK)
   page.add_script_tag(content=JS)
   page.locator('#loginView').wait_for(state='visible')
   page.locator('#loginForm input[name="email"]').fill('admin@example.test')
   page.locator('#loginForm input[name="password"]').fill('not-a-real-password')
   page.locator('#loginForm button[type="submit"]').click()
   page.locator('#dashboardView').wait_for(state='visible')
   page.locator('#metricTotal').wait_for(state='visible')
   page.locator('button[data-view="create"]').first.click()
   page.locator('input[name="title"]').fill('Motocicleta de prueba')
   page.locator('textarea[name="description"]').fill('Un premio solo para comprobar el formulario de borrador')
   page.locator('#wizardNext').click()
   page.locator('input[name="ticket_price_cop"]').fill('25000')
   page.locator('input[name="total_numbers"]').fill('10000')
   page.locator('#wizardNext').click()
   assert 'Motocicleta de prueba' in page.locator('#reviewGrid').inner_text()
   page.locator('#saveRaffle').click()
   page.wait_for_timeout(100)
   assert page.locator('#rafflesPanel').is_visible()
   assert page.locator('#rafflesRows tr').count()==1
   page.screenshot(path=str(ROOT/f'tests/dashboard-{name}.png'))
   page.on('dialog',lambda d:d.accept())
   page.locator('#rafflesRows [data-review]').click()
   page.wait_for_timeout(100)
   assert 'En revisión' in page.locator('#rafflesRows').inner_text()
   page.locator('button[data-view="audit"]').first.click()
   assert page.locator('#auditRows .event').count()>=1
   assert not errors,errors
   page.close()
   print(name,'OK — setup, tema, login, wizard, consulta, auditoría')
  browser.close()
if __name__=='__main__':test()