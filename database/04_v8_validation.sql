-- Validaciones de V8. Consultas de solo lectura, no alteran datos.
select tablename, rowsecurity from pg_tables where schemaname='public' and tablename in ('ets_prizes','ets_prize_images');
select id, public, file_size_limit, allowed_mime_types from storage.buckets where id='ets-prize-drafts';
select tablename, policyname, cmd from pg_policies where schemaname='public' and tablename in ('ets_prizes','ets_prize_images') order by tablename,policyname;
select policyname, cmd from pg_policies where schemaname='storage' and tablename='objects' and policyname like 'ets_v8_%' order by policyname;
-- Comprobar que anon no puede leer las nuevas tablas ni escribirlas.
select 'ets_prizes' as tabla, has_table_privilege('anon','public.ets_prizes','SELECT') as anon_select,has_table_privilege('anon','public.ets_prizes','INSERT') as anon_insert
union all
select 'ets_prize_images',has_table_privilege('anon','public.ets_prize_images','SELECT'),has_table_privilege('anon','public.ets_prize_images','INSERT');