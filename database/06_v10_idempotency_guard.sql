-- V10.1: endurece idempotencia de solicitudes; no modifica datos existentes.
begin;
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

commit;