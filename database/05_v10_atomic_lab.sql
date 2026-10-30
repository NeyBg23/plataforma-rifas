-- EL TOQUE DE LA SUERTE / V10 - LABORATORIO CERRADO, SIN VENTAS
-- Laboratorio SQL en esquema privado: NO utiliza public.ets_number_allocations.
-- No concede permisos de uso a anon, authenticated o PUBLIC; no habilita compras.
-- Por diseño las funciones solo se ejecutan desde SQL Editor por rol privilegiado.

begin;

create schema if not exists ets_lab;
revoke all on schema ets_lab from public, anon, authenticated;

create table if not exists ets_lab.runs (
  id uuid primary key default gen_random_uuid(),
  raffle_id uuid not null references public.ets_raffles(id) on delete restrict,
  label text not null check (length(label) between 4 and 120),
  is_closed boolean not null default false,
  created_at timestamptz not null default clock_timestamp()
);

create table if not exists ets_lab.slots (
  run_id uuid not null references ets_lab.runs(id) on delete cascade,
  number integer not null check (number >= 0),
  request_id uuid not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null default clock_timestamp(),
  primary key (run_id, number)
);
create index if not exists ets_lab_slots_expiry_idx on ets_lab.slots (expires_at);

create table if not exists ets_lab.requests (
  run_id uuid not null references ets_lab.runs(id) on delete cascade,
  request_id uuid not null,
  number integer not null,
  outcome text not null check (outcome in ('held','conflict')),
  expires_at timestamptz,
  created_at timestamptz not null default clock_timestamp(),
  primary key (run_id, request_id)
);

create table if not exists ets_lab.events (
  id bigint generated always as identity primary key,
  run_id uuid not null references ets_lab.runs(id) on delete cascade,
  number integer not null,
  request_id uuid not null,
  event_type text not null check (event_type in ('hold_accepted','hold_conflict','hold_released')),
  created_at timestamptz not null default clock_timestamp()
);
create index if not exists ets_lab_events_run_idx on ets_lab.events (run_id, id);

-- Defense in depth: the lab schema is not exposed in the Supabase Data API.
-- RLS blocks any future role granted schema access by accident.
alter table ets_lab.runs enable row level security;
alter table ets_lab.slots enable row level security;
alter table ets_lab.requests enable row level security;
alter table ets_lab.events enable row level security;
revoke all on all tables in schema ets_lab from public, anon, authenticated;
revoke all on all sequences in schema ets_lab from public, anon, authenticated;

-- Result is the ORIGINAL outcome of a request ID. A retry never creates a second hold.
-- The outcome is historical; current availability must be checked separately.
create or replace function ets_lab.try_hold(
  p_run uuid,
  p_number integer,
  p_request uuid,
  p_ttl_seconds integer default 120
)
returns table(outcome text, expires_at timestamptz)
language plpgsql security invoker
set search_path = ''
as $$
declare
  v_limit integer;
  v_closed boolean;
  v_prior ets_lab.requests%rowtype;
  v_expiry timestamptz;
  v_acquired boolean;
begin
  if p_run is null or p_request is null or p_number is null then
    raise exception 'Identificadores y número obligatorios';
  end if;
  if p_ttl_seconds is null or p_ttl_seconds < 10 or p_ttl_seconds > 300 then
    raise exception 'TTL permitido: entre 10 y 300 segundos';
  end if;

  -- Serialize *only* retries with the same idempotency key. Other keys remain concurrent.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_run::text || ':' || p_request::text, 0)
  );
  select q.* into v_prior
  from ets_lab.requests q
  where q.run_id = p_run and q.request_id = p_request;
  if found then
    if v_prior.number <> p_number then
      raise exception 'La misma clave de solicitud no puede usarse para otro número';
    end if;
    return query select v_prior.outcome, v_prior.expires_at;
    return;
  end if;

  select r.is_closed, rf.total_numbers
    into v_closed, v_limit
    from ets_lab.runs r
    join public.ets_raffles rf on rf.id = r.raffle_id
    where r.id = p_run;
  if not found or v_closed then
    raise exception 'Laboratorio inexistente o cerrado';
  end if;
  if p_number < 0 or p_number >= v_limit then
    raise exception 'Número fuera del rango de esta rifa';
  end if;

  v_expiry := pg_catalog.clock_timestamp() + pg_catalog.make_interval(secs => p_ttl_seconds);
  -- Single atomic UPSERT on (run_id, number). Only an expired slot can be replaced.
  insert into ets_lab.slots as s (run_id, number, request_id, expires_at)
  values (p_run, p_number, p_request, v_expiry)
  on conflict (run_id, number) do update
     set request_id = excluded.request_id,
         expires_at = excluded.expires_at,
         updated_at = pg_catalog.clock_timestamp()
   where s.expires_at <= pg_catalog.clock_timestamp()
  returning true into v_acquired;

  if coalesce(v_acquired, false) then
    insert into ets_lab.requests (run_id, request_id, number, outcome, expires_at)
      values (p_run, p_request, p_number, 'held', v_expiry);
    insert into ets_lab.events (run_id, number, request_id, event_type)
      values (p_run, p_number, p_request, 'hold_accepted');
    return query select 'held'::text, v_expiry;
  else
    insert into ets_lab.requests (run_id, request_id, number, outcome, expires_at)
      values (p_run, p_request, p_number, 'conflict', null);
    insert into ets_lab.events (run_id, number, request_id, event_type)
      values (p_run, p_number, p_request, 'hold_conflict');
    return query select 'conflict'::text, null::timestamptz;
  end if;
end;
$$;

-- Only the exact request that owns a valid hold can release it.
create or replace function ets_lab.release_hold(
  p_run uuid,
  p_number integer,
  p_request uuid
)
returns boolean
language plpgsql security invoker
set search_path = ''
as $$
declare
  v_released boolean;
begin
  update ets_lab.slots s
     set expires_at = pg_catalog.clock_timestamp(),
         updated_at = pg_catalog.clock_timestamp()
   where s.run_id = p_run and s.number = p_number and s.request_id = p_request
     and s.expires_at > pg_catalog.clock_timestamp()
  returning true into v_released;
  if coalesce(v_released,false) then
    insert into ets_lab.events (run_id, number, request_id, event_type)
    values (p_run,p_number,p_request,'hold_released');
    return true;
  end if;
  return false;
end;
$$;

revoke all on function ets_lab.try_hold(uuid,integer,uuid,integer) from public, anon, authenticated;
revoke all on function ets_lab.release_hold(uuid,integer,uuid) from public, anon, authenticated;

-- No role/user is created; no purchase or issuance endpoint is added.
-- The existing public.ets_number_allocations table is deliberately untouched.
commit;