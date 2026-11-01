// Build estático con allowlist explícita. Nunca servir el repositorio completo.
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve, relative, sep } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const out = join(root, 'dist');
const allowed = [
  'index.html',
  'styles.css',
  'app.js',
  'favicon.svg',
  'site.css',
  'site.mjs',
  'public-catalog.mjs',
  'admin/index.html',
  'admin/v9.html',
  'admin/styles.css',
  'admin/app.js',
  'admin/config.js',
  'admin/expediente.html',
  'admin/dossier.css',
  'admin/dossier.mjs',
  'admin/dossier-domain.mjs', // solo URL y clave publicable; nunca service_role.
  'experiencia/index.html',
  'experiencia/styles.css',
  'experiencia/app.mjs',
  'experiencia/catalog.mjs',
  'experiencia/demo-domain.mjs',
  'experiencia/payment-gate.mjs',
  'experiencia/assets/premio-1.svg',
  'experiencia/assets/premio-2.svg',
  'experiencia/assets/premio-3.svg',
  'laboratorio/index.html',
  'laboratorio/styles.css',
  'laboratorio/app.mjs'
];
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const name of allowed) {
  const src = join(root, name);
  const dest = join(out, name);
  if (!existsSync(src) || !statSync(src).isFile()) throw new Error('Falta archivo público requerido: ' + name);
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
}
// Evitar indexación de una plataforma que aún no está autorizada para operar.
writeFileSync(join(out, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
const collect = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap(e => {
  const path = join(dir, e.name);
  return e.isDirectory() ? collect(path) : [relative(out, path).split(sep).join('/')];
});
const published = collect(out).sort();
const expected = [...allowed, 'robots.txt'].sort();
if (published.join('\n') !== expected.join('\n')) throw new Error('El contenido público difiere de la lista permitida.');
console.log('Vercel: ' + allowed.length + ' archivos estáticos permitidos, sin SQL ni directorios internos.');
