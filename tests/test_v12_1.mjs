import test from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const source=pathToFileURL(resolve(import.meta.dirname,'../laboratorio/app.mjs')).href;
function context(mode){
 const nodes=new Map();
 const create=()=>({textContent:'',children:[],dataset:{},disabled:false,hidden:false,className:'',style:{},addEventListener(){},append(...children){this.children.push(...children)},replaceChildren(...children){this.children=children}});
 for(const id of ['themeBtn','sessionStatus','requestError','refreshData','privateDashboard','accessGate','account','rafflesCount','allocationsCount','auditCount','raffleRows','auditRows'])nodes.set(id,create());
 const anchors=[create(),create()];
 const client = {
  auth: {async getUser(){return mode==='anon' ? {data:{user:null},error:null} : {data:{user:{id:'test-user'}},error:null};}},
  from(table) {
   return {
    select(fields,opt) {
     return {
      eq(){return {async maybeSingle(){return {data:mode==='staff'?{role:'admin',enabled:true}:null,error:null};}};},
      order(){return {async limit(){return {data:table==='ets_raffles'?[{id:'test-id',title:'Rifa interna',total_numbers:100,state:'draft'}]:[{id:'audit-id',operation:'INSERT',created_at:'2026-10-30T12:00:00Z'}],count:1,error:null};}};},
      then(onDone){return Promise.resolve({count:0,data:null,error:null}).then(onDone);}
     };
    }
   };
  }
 };
 globalThis.document={body:{dataset:{}},getElementById(id){const n=nodes.get(id);if(!n)throw new Error('Missing DOM: '+id);return n},querySelectorAll(sel){if(sel==='.side > a')return anchors;return []},createElement(){return create()}};
 globalThis.window={ETS_PUBLIC_SUPABASE:{url:'https://example.supabase.co',publishableKey:'sb_publishable_ABCdefghijkLMNOP'},supabase:{createClient:()=>client}};
 globalThis.localStorage={getItem(){return null},setItem(){}};
 return nodes;
}
for(const mode of ['anon','no-role','staff']){
 test('V12.1 '+mode,async()=>{
  const nodes=context(mode);
  await import(source+'?case='+mode);
  for(let n=0;n<6;n++)await new Promise(r=>setTimeout(r,0));
  if(mode==='staff'){
   assert.equal(nodes.get('privateDashboard').hidden,false);
   assert.equal(nodes.get('rafflesCount').textContent,'1');
   assert.equal(nodes.get('allocationsCount').textContent,'0');
   assert.equal(nodes.get('auditCount').textContent,'1');
   assert.match(nodes.get('sessionStatus').textContent,/Lectura autorizada/);
  }else{
   assert.equal(nodes.get('privateDashboard').hidden,true);
   assert.equal(nodes.get('rafflesCount').textContent,'');
   assert.match(nodes.get('sessionStatus').textContent,mode==='anon'?/Inicia sesión/:/sin permiso/);
  }
 });
}