import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../admin/index.html',import.meta.url),'utf8');
const js=readFileSync(new URL('../admin/app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../admin/styles.css',import.meta.url),'utf8');

test('V16.1: inicio ofrece continuar sorteo sin volver a diligenciarlo',()=>{
  for(const id of ['dashboardResume','dashboardLeadName','dashboardLeadSummary','dashboardLeadStatus','dashboardPrize','dashboardDossier','dashboardNumbers']){
    assert.match(html,new RegExp('id="'+id+'"'));
  }
  assert.match(js,/state\.raffles\.find\(r=>r\.state==='draft'\)\|\|state\.raffles\[0\]/);
  assert.match(js,/resume\.hidden=!raffle/);
  assert.match(js,/\$\('dashboardLeadName'\)\.textContent=raffle\.title/);
});

test('V16.1: accesos usan identificadores de la rifa existente',()=>{
  for(const action of ['prize','dossier','numbers']){
    assert.match(html,new RegExp('id="dashboard'+action[0].toUpperCase()+action.slice(1)+'" data-'+action+'=""'));
    assert.match(js,new RegExp("\\$\\('dashboard"+action[0].toUpperCase()+action.slice(1)+"'\\)\\.dataset\\."+action+"=raffle\\.id"));
  }
});

test('V16.1: no habilita venta ni altera estados',()=>{
  const segment=js.slice(js.indexOf('function renderMetrics(){'),js.indexOf('function el(tag,'));
  assert.ok(segment.includes("state.raffles"));
  assert.doesNotMatch(segment,/\.insert\(|\.update\(|\.rpc\(|\bfetch\(/);
  assert.match(html,/Los documentos y la revisión no habilitan ventas/);
  assert.match(html,/Panel de gestión · (?:V16\.1 Express|V17)/);
});

test('V16.1: sigue siendo responsive, sin navegación redundante',()=>{
  assert.match(css,/V16\.1 DASHBOARD/);
  assert.match(css,/@media\(max-width:760px\)/);
  assert.doesNotMatch(html,/¿Por dónde empezar\?/);
  assert.match(html,/Crear sorteo/);
});
