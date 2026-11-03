import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../admin/index.html',import.meta.url),'utf8');
const js=readFileSync(new URL('../admin/app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../admin/styles.css',import.meta.url),'utf8');
const rls=readFileSync(new URL('../database/01_core_schema.sql',import.meta.url),'utf8');

test('V16: el formulario muestra premio y números en una sola pantalla',()=>{
  assert.match(html,/data-step-panel="1" class="wizard-panel"/);
  assert.match(html,/data-step-panel="2" class="wizard-panel"><h2>2\./);
  assert.match(html,/data-step-panel="3" class="wizard-panel" hidden/);
  assert.match(js,/function setStep\(_unused\)/);
  assert.match(js,/p\.hidden=p\.dataset\.stepPanel==='3'/);
  assert.match(js,/\$\('saveRaffle'\)\.hidden=false/);
});

test('V16: los campos indispensables siguen validados en la base',()=>{
  for(const n of ['title','category','ticket_price_cop','total_numbers']) {
    assert.match(html,new RegExp('name="'+n+'"[^>]*required'));
  }
  assert.match(js,/validateStep\(1\)/);
  assert.match(js,/validateStep\(2\)/);
  assert.match(js,/Number\.isSafeInteger\(price\)/);
  assert.match(js,/Number\.isSafeInteger\(total\)/);
});

test('V16: guardar permanece en estado borrador y no autoriza venta',()=>{
  assert.match(js,/created_by:state\.user\.id,state:'draft'/);
  assert.doesNotMatch(js,/\.insert\([^\n]*state:'published'/);
  assert.match(rls,/state='draft' and authorization_verified=false/);
  assert.match(rls,/state='published' and authorization_verified = true/);
  assert.match(html,/Guardar sorteo en borrador/);
});

test('V16: accesos siguientes utilizan id real del registro guardado',()=>{
  assert.match(html,/id="quickSuccess"[^>]*hidden/);
  assert.match(js,/const createdId=data\?\.id/);
  for(const a of ['prize','dossier','numbers']){
    assert.match(html,new RegExp('data-'+a+'=""'));
    assert.ok(js.includes(".dataset."+a+"=createdId"));
  }
});

test('V16: panel responsive, sin habilitación comercial',()=>{
  assert.match(css,/V16 EXPRESS/);
  assert.match(css,/@media\(max-width:620px\)/);
  assert.match(html,/Ningún paso habilita ventas automáticamente/);
});
