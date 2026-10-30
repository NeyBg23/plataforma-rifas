-- Consultas de comprobación para ejecutar MANUALMENTE en SQL Editor DESPUÉS de crear la base V7.
-- Esperado: 4 tablas con rowsecurity=true; políticas explícitas en todas.
select tablename, rowsecurity from pg_tables
where schemaname='public' and tablename like 'ets_%'
order by tablename;
select tablename, policyname, cmd, roles from pg_policies
where schemaname='public' and tablename like 'ets_%'
order by tablename, policyname;
-- Esperado: anon solo puede SELECT sobre ets_raffles; authenticated no puede
-- escribir roles, números ni auditoría.
select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema='public' and table_name like 'ets_%'
  and grantee in ('anon','authenticated')
order by table_name, grantee, privilege_type;
-- Esperado: 0 rifas publicadas mientras no exista autorización.
select count(*) as rifas_publicadas from public.ets_raffles where state='published';