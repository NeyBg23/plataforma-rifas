-- EL TOQUE DE LA SUERTE! / V7
-- Aplicar ÚNICAMENTE en un proyecto Supabase nuevo y exclusivo.
-- Todas las tablas expuestas tienen RLS y privilegios explícitos.
-- Ninguna política permite emitir, comprar o reservar números.

begin;

create schema if not exists ets_internal;
revoke all on schema ets_internal from public, anon, authenticated;

create table if not exists public.ets_staff_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','operator','auditor')),
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.ets_raffles (
  id uuid primary key default gen_random_uuid(),
  title varchar(140) not null check (length(trim(title)) >= 3),
  description text not null default '',
  category text not null check (category in ('moto','auto','tecnologia','hogar','otros')),
  ticket_price_cop integer not null check (ticket_price_cop between 1 and 1000000000),
  total_numbers integer not null check (total_numbers between 10 and 1000000),
  draw_at timestamptz,
  state text not null default 'draft' check (state in ('draft','in_review','awaiting_authorization','published','closed','cancelled')),
  authorization_verified boolean not null default false,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint verified_before_public check (state <> 'published' or (authorization_verified and draw_at is not null))
);
create index if not exists ets_raffles_created_at_idx on public.ets_raffles (created_at desc);
create index if not exists ets_raffles_status_idx on public.ets_raffles (state);

-- No filas significa que el número aún no ha sido asignado; NO implica disponibilidad certificada.
-- No existe API de reserva/compra en V7; inserciones y actualizaciones son solo de servicios futuros.
create table if not exists public.ets_number_allocations (
  raffle_id uuid not null references public.ets_raffles(id) on delete restrict,
  number integer not null check (number >= 0),
  allocation_state text not null check (allocation_state in ('held','issued','void')),
  order_ref uuid,
  reserved_until timestamptz,
  created_at timestamptz not null default now(),
  primary key (raffle_id, number)
);
create index if not exists ets_numbers_order_idx on public.ets_number_allocations (order_ref);

create table if not exists public.ets_raffle_audit (
  id bigint generated always as identity primary key,
  raffle_id uuid not null,
  actor_id uuid,
  operation text not null,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);
create index if not exists ets_audit_raffle_idx on public.ets_raffle_audit (raffle_id, created_at desc);

create or replace function ets_internal.set_raffle_modified()
returns trigger language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function ets_internal.audit_raffle_change()
returns trigger language plpgsql security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.ets_raffle_audit (raffle_id, actor_id, operation, new_data)
    values (new.id, auth.uid(), tg_op, to_jsonb(new));
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.ets_raffle_audit (raffle_id, actor_id, operation, old_data, new_data)
    values (new.id, auth.uid(), tg_op, to_jsonb(old), to_jsonb(new));
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.ets_raffle_audit (raffle_id, actor_id, operation, old_data)
    values (old.id, auth.uid(), tg_op, to_jsonb(old));
    return old;
  end if;
  return null;
end;
$$;
revoke all on function ets_internal.audit_raffle_change() from public, anon, authenticated;
revoke all on function ets_internal.set_raffle_modified() from public, anon, authenticated;

create trigger ets_raffles_updated_at
before update on public.ets_raffles
for each row execute function ets_internal.set_raffle_modified();
create trigger ets_raffles_audit
  after insert or update or delete on public.ets_raffles
  for each row execute function ets_internal.audit_raffle_change();

-- RLS obligatorio en todas las tablas públicas.
alter table public.ets_staff_members enable row level security;
alter table public.ets_raffles enable row level security;
alter table public.ets_number_allocations enable row level security;
alter table public.ets_raffle_audit enable row level security;

-- Sin gestión de roles desde navegador. El administrador inicial se asigna desde SQL Editor.
revoke all on public.ets_staff_members from public, anon, authenticated;
revoke all on public.ets_raffles from public, anon, authenticated;
revoke all on public.ets_number_allocations from public, anon, authenticated;
revoke all on public.ets_raffle_audit from public, anon, authenticated;

-- Solo el usuario autenticado puede ver su propia asignación de rol.
grant select (user_id,role,enabled,created_at) on public.ets_staff_members to authenticated;
create policy ets_staff_read_self on public.ets_staff_members
  for select to authenticated using (user_id = (select auth.uid()));

-- Publico: NO hay resultados públicos salvo cuando una rifa es publicada formalmente
-- desde servicios privilegiados, con autorización verificada.
grant select (id,title,description,category,ticket_price_cop,total_numbers,draw_at,state)
  on public.ets_raffles to anon;
grant select (id,title,description,category,ticket_price_cop,total_numbers,draw_at,state,
              authorization_verified,created_at,updated_at)
  on public.ets_raffles to authenticated;
create policy ets_raffles_public_read on public.ets_raffles
  for select to anon,authenticated
  using (state = 'published' and authorization_verified = true and draw_at is not null);

-- Personal autorizado (según rol en tabla segura) puede leer todas las rifas.
create policy ets_raffles_staff_read on public.ets_raffles
  for select to authenticated
  using (exists (
    select 1 from public.ets_staff_members s
    where s.user_id=(select auth.uid()) and s.enabled
      and s.role in ('admin','operator','auditor')
  ));

-- INSERT/UPDATE nunca pueden habilitar comercialización ni declarar autorización.
grant insert on public.ets_raffles to authenticated;
grant update (title,description,category,ticket_price_cop,total_numbers,draw_at,state)
  on public.ets_raffles to authenticated;
create policy ets_raffles_staff_create on public.ets_raffles
  for insert to authenticated
  with check (
    created_by=(select auth.uid()) and state='draft' and authorization_verified=false
    and exists (
      select 1 from public.ets_staff_members s
      where s.user_id=(select auth.uid()) and s.enabled and s.role in ('admin','operator')
    )
  );
create policy ets_raffles_staff_edit on public.ets_raffles
  for update to authenticated
  using (
    state in ('draft','in_review','awaiting_authorization') and authorization_verified=false
    and exists (
      select 1 from public.ets_staff_members s
      where s.user_id=(select auth.uid()) and s.enabled and s.role in ('admin','operator')
    )
  )
  with check (
    state in ('draft','in_review','awaiting_authorization') and authorization_verified=false
    and exists (
      select 1 from public.ets_staff_members s
      where s.user_id=(select auth.uid()) and s.enabled and s.role in ('admin','operator')
    )
  );

-- Asignaciones: consulta solo al personal; NO hay permiso público para modificar números.
grant select on public.ets_number_allocations to authenticated;
create policy ets_numbers_staff_read on public.ets_number_allocations
  for select to authenticated using (exists (
    select 1 from public.ets_staff_members s
    where s.user_id=(select auth.uid()) and s.enabled
      and s.role in ('admin','operator','auditor')
  ));

-- Auditoría solo lectura para personal autorizado; escritura solo desde trigger.
grant select on public.ets_raffle_audit to authenticated;
create policy ets_audit_staff_read on public.ets_raffle_audit
  for select to authenticated using (exists (
    select 1 from public.ets_staff_members s
    where s.user_id=(select auth.uid()) and s.enabled
      and s.role in ('admin','operator','auditor')
  ));

commit;