-- Pago manual por transferencia. El esquema solo es accesible desde el servidor.
create schema if not exists ets_manual;
revoke all on schema ets_manual from public, anon, authenticated;

create table ets_manual.settings (
  raffle_id uuid primary key references public.ets_raffles(id),
  recipient text not null check (length(recipient) between 3 and 120),
  institution text not null check (length(institution) between 2 and 100),
  payment_key text not null default '' check (length(payment_key) <= 160),
  instructions text not null default '' check (length(instructions) <= 1500),
  qr_path text not null default '',
  enabled boolean not null default false,
  updated_by uuid not null references auth.users(id),
  updated_at timestamptz not null default now(),
  check (not enabled or payment_key <> '' or qr_path <> '')
);
create table ets_manual.orders (
  id uuid primary key,
  raffle_id uuid not null references public.ets_raffles(id),
  access_hash text not null check (access_hash ~ '^[a-f0-9]{64}$'),
  is_test boolean not null,
  numbers integer[] not null check (cardinality(numbers) between 1 and 5),
  customer_name text not null check (length(customer_name) between 3 and 100),
  customer_contact text not null check (customer_contact ~ '^\+?[0-9]{7,18}$'),
  source_hash text,
  amount_cop bigint not null check (amount_cop > 0),
  payment_details jsonb not null,
  state text not null default 'awaiting_payment'
    check (state in ('awaiting_payment','pending_review','confirmed','rejected','expired')),
  payment_reference text,
  transfer_fingerprint text,
  review_note text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  expires_at timestamptz not null default (now() + interval '30 minutes'),
  created_at timestamptz not null default now()
);
create index ets_manual_orders_raffle_idx on ets_manual.orders(raffle_id, created_at desc);
create index ets_manual_orders_source_idx on ets_manual.orders(source_hash,created_at) where not is_test;
create unique index ets_manual_transfer_once_idx on ets_manual.orders(transfer_fingerprint)
  where not is_test and state in ('pending_review','confirmed');
create table ets_manual.slots (
  raffle_id uuid not null references public.ets_raffles(id),
  number integer not null check (number >= 0),
  is_test boolean not null,
  order_id uuid not null references ets_manual.orders(id),
  primary key (raffle_id, number, is_test)
);
create index ets_manual_slots_order_idx on ets_manual.slots(order_id);
create table ets_manual.events (
  id bigint generated always as identity primary key,
  order_id uuid not null references ets_manual.orders(id),
  action text not null,
  actor_id uuid,
  created_at timestamptz not null default now()
);
alter table ets_manual.settings enable row level security;
alter table ets_manual.orders enable row level security;
alter table ets_manual.slots enable row level security;
alter table ets_manual.events enable row level security;
revoke all on all tables in schema ets_manual from public, anon, authenticated;
revoke all on all sequences in schema ets_manual from public, anon, authenticated;

create function ets_manual.expire_orders(p_raffle uuid, p_test boolean)
returns void language plpgsql set search_path = '' as $$
begin
  -- Todas las operaciones de una rifa/modo comparten el mismo bloqueo.
  perform pg_advisory_xact_lock(hashtextextended(p_raffle::text || p_test::text, 0));
  with expired as (
    update ets_manual.orders set state = 'expired'
    where raffle_id = p_raffle and is_test = p_test
      and state = 'awaiting_payment' and expires_at <= clock_timestamp()
    returning id
  )
  insert into ets_manual.events(order_id, action) select id, 'expired' from expired;
  delete from public.ets_number_allocations a using ets_manual.orders o
    where a.order_ref = o.id and o.raffle_id = p_raffle and not o.is_test
      and o.state = 'expired' and a.allocation_state = 'held';
  delete from ets_manual.slots s using ets_manual.orders o
    where s.order_id = o.id and o.raffle_id = p_raffle and o.is_test = p_test
      and o.state = 'expired';
end;
$$;

create function ets_manual.place_order(
  p_raffle uuid, p_id uuid, p_hash text, p_numbers integer[],
  p_name text, p_contact text, p_test boolean, p_actor uuid, p_source text default null
)
returns jsonb language plpgsql set search_path = '' as $$
declare
  campaign public.ets_raffles%rowtype;
  settings ets_manual.settings%rowtype;
  previous ets_manual.orders%rowtype;
  selected integer[];
begin
  if p_test and not exists (
    select 1 from public.ets_staff_members where user_id = p_actor
      and enabled and role in ('admin','operator')
  ) then raise exception 'Permiso insuficiente' using errcode = '42501'; end if;
  if p_test is null or p_numbers is null or cardinality(p_numbers) not between 1 and 5
    or array_position(p_numbers, null) is not null then
    raise exception 'Selección inválida' using errcode = '22023';
  end if;
  select array_agg(n order by n) into selected from unnest(p_numbers) n;
  if (select count(distinct n) from unnest(p_numbers) n) <> cardinality(p_numbers) then
    raise exception 'Números repetidos' using errcode = '22023';
  end if;
  perform ets_manual.expire_orders(p_raffle, p_test);
  select * into previous from ets_manual.orders where id = p_id;
  if found then
    if previous.access_hash <> p_hash or previous.raffle_id <> p_raffle
      or previous.is_test <> p_test or previous.numbers <> selected
      or previous.customer_name <> p_name or previous.customer_contact <> p_contact then
      raise exception 'Reintento con datos distintos' using errcode = '22023';
    end if;
    return jsonb_build_object('outcome','replay','order_id',previous.id);
  end if;
  select * into campaign from public.ets_raffles where id = p_raffle for share;
  if not found then raise exception 'Sorteo no disponible' using errcode = '22023'; end if;
  if not p_test and (campaign.state <> 'published' or not campaign.authorization_verified
    or campaign.draw_at is null or campaign.draw_at <= clock_timestamp()) then
    raise exception 'Sorteo no habilitado' using errcode = '42501';
  end if;
  if selected[1] < 0 or selected[cardinality(selected)] >= campaign.total_numbers then
    raise exception 'Número fuera de rango' using errcode = '22023';
  end if;
  select * into settings from ets_manual.settings where raffle_id = p_raffle for share;
  if not found or not settings.enabled then
    raise exception 'Configura el pago manual antes de crear pedidos' using errcode = '22023';
  end if;
  if exists (select 1 from ets_manual.slots where raffle_id = p_raffle
    and is_test = p_test and number = any(selected)) or
    (not p_test and exists (select 1 from public.ets_number_allocations
      where raffle_id = p_raffle and number = any(selected))) then
    return jsonb_build_object('outcome','conflict');
  end if;
  if not p_test and (
    (p_source is not null and (select count(*) from ets_manual.orders
      where source_hash=p_source and not is_test and created_at > clock_timestamp()-interval '15 minutes') >= 10)
    or (select count(*) from ets_manual.orders where raffle_id=p_raffle and not is_test
      and customer_contact=p_contact and state in ('awaiting_payment','pending_review')) >= 3
  ) then raise exception 'Demasiados pedidos pendientes' using errcode = 'PT429'; end if;
  insert into ets_manual.orders(id,raffle_id,access_hash,is_test,numbers,
    customer_name,customer_contact,source_hash,amount_cop,payment_details,expires_at)
  values (p_id,p_raffle,p_hash,p_test,selected,p_name,p_contact,
    p_source,
    campaign.ticket_price_cop::bigint * cardinality(selected),
    jsonb_build_object('recipient',settings.recipient,'institution',settings.institution,
      'payment_key',settings.payment_key,'instructions',settings.instructions,'qr_path',settings.qr_path),
    case when p_test then clock_timestamp()+interval '30 minutes'
      else least(clock_timestamp()+interval '30 minutes',campaign.draw_at) end);
  insert into ets_manual.slots(raffle_id,number,is_test,order_id)
    select p_raffle,n,p_test,p_id from unnest(selected) n;
  if not p_test then
    insert into public.ets_number_allocations(raffle_id,number,allocation_state,order_ref,reserved_until)
      select p_raffle,n,'held',p_id,expires_at
      from unnest(selected) n cross join ets_manual.orders where id = p_id;
  end if;
  insert into ets_manual.events(order_id,action,actor_id) values(p_id,'created',p_actor);
  return jsonb_build_object('outcome','created','order_id',p_id);
end;
$$;

create function ets_manual.report_payment(p_raffle uuid,p_id uuid,p_hash text,p_reference text)
returns text language plpgsql set search_path = '' as $$
declare current_order ets_manual.orders%rowtype;
begin
  select * into current_order from ets_manual.orders
    where id = p_id and raffle_id = p_raffle and access_hash = p_hash;
  if not found then raise exception 'Pedido no encontrado' using errcode = '42501'; end if;
  perform ets_manual.expire_orders(p_raffle,current_order.is_test);
  select * into current_order from ets_manual.orders where id = p_id for update;
  if current_order.state in ('pending_review','confirmed') and current_order.payment_reference = p_reference then
    return current_order.state;
  end if;
  if current_order.state <> 'awaiting_payment' then
    raise exception 'Este pedido ya no admite una referencia de pago' using errcode = '22023';
  end if;
  if length(trim(p_reference)) not between 3 and 120 then
    raise exception 'Referencia inválida' using errcode = '22023';
  end if;
  update ets_manual.orders set state = 'pending_review',payment_reference = p_reference,
    transfer_fingerprint = encode(sha256(convert_to(
      lower(payment_details->>'institution') || '|' || lower(payment_details->>'payment_key')
      || '|' || lower(trim(p_reference)), 'UTF8')), 'hex') where id = p_id;
  if not current_order.is_test then
    update public.ets_number_allocations set reserved_until = null
      where order_ref = p_id and allocation_state = 'held';
  end if;
  insert into ets_manual.events(order_id,action) values(p_id,'payment_reported');
  return 'pending_review';
end;
$$;

create function ets_manual.review_payment(p_raffle uuid,p_id uuid,p_actor uuid,p_decision text,p_note text)
returns text language plpgsql set search_path = '' as $$
declare current_order ets_manual.orders%rowtype;
begin
  if not exists (select 1 from public.ets_staff_members
    where user_id = p_actor and enabled and role in ('admin','operator')) then
    raise exception 'Permiso insuficiente' using errcode = '42501';
  end if;
  if p_decision not in ('confirmed','rejected') or p_decision is null
    or p_note is null or length(trim(p_note)) not between 3 and 500 then
    raise exception 'Decisión o nota inválida' using errcode = '22023';
  end if;
  select * into current_order from ets_manual.orders where id = p_id and raffle_id = p_raffle;
  if not found then raise exception 'Pedido no encontrado' using errcode = '22023'; end if;
  perform ets_manual.expire_orders(p_raffle,current_order.is_test);
  select * into current_order from ets_manual.orders where id = p_id for update;
  if current_order.state = p_decision then return p_decision; end if;
  if current_order.state <> 'pending_review' then
    raise exception 'Solo se revisan transferencias reportadas' using errcode = '22023';
  end if;
  if p_decision = 'confirmed' and not current_order.is_test then
    perform 1 from public.ets_raffles where id = p_raffle and state = 'published'
      and authorization_verified and draw_at > clock_timestamp() for share;
    if not found then raise exception 'Sorteo no habilitado' using errcode = '42501'; end if;
    if (select count(*) from public.ets_number_allocations
      where order_ref = p_id and allocation_state = 'held'
        and raffle_id = p_raffle and number = any(current_order.numbers))
        <> cardinality(current_order.numbers) then
      raise exception 'Inventario inconsistente. Requiere revisión' using errcode = '22023';
    end if;
    update public.ets_number_allocations set allocation_state = 'issued',reserved_until = null
      where order_ref = p_id and allocation_state = 'held';
  elsif p_decision = 'rejected' then
    delete from ets_manual.slots where order_id = p_id;
    if not current_order.is_test then
      delete from public.ets_number_allocations where order_ref = p_id and allocation_state = 'held';
    end if;
  end if;
  update ets_manual.orders set state = p_decision,review_note = p_note,
    reviewed_by = p_actor,reviewed_at = clock_timestamp() where id = p_id;
  insert into ets_manual.events(order_id,action,actor_id) values(p_id,p_decision,p_actor);
  return p_decision;
end;
$$;
revoke all on all functions in schema ets_manual from public,anon,authenticated;

-- QR originales privados. El servidor entrega URLs temporales para subir y consultar.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('ets-payment-qr','ets-payment-qr',false,5242880,array['image/png','image/jpeg','image/webp'])
on conflict(id) do nothing;
