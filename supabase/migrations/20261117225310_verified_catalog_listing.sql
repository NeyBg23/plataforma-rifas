-- Publicación de fichas autorizadas. Los pedidos siguen reservados al estado published.
begin;

set local lock_timeout = '5s';

alter table public.ets_prizes
  add column prize_kind text check (prize_kind in ('in_kind', 'cash'));
grant update (prize_kind) on public.ets_prizes to authenticated;

alter table public.ets_raffles
  drop constraint ets_raffles_state_check,
  drop constraint verified_before_public,
  add constraint ets_raffles_state_check
    check (state in ('draft','in_review','awaiting_authorization','listed','published','closed','cancelled')),
  add constraint verified_before_public
    check (state not in ('listed','published') or (authorization_verified and draw_at is not null));

alter policy ets_raffles_public_read on public.ets_raffles
  using (state in ('listed','published') and authorization_verified and draw_at is not null);

-- Vincula la comprobación a los datos que se revisaron, incluso ante cambios concurrentes.
create function ets_internal.raffle_listing_snapshot(raffle_id uuid)
returns text language sql stable set search_path = ''
as $$
  select encode(sha256(convert_to(jsonb_build_array(
    r.title, r.description, r.category, r.ticket_price_cop, r.total_numbers,
    extract(epoch from r.draw_at),
    to_jsonb(p) - array['raffle_id','updated_by','updated_at'],
    d.organizer_name, d.competent_authority, d.authorization_reference_claimed
  )::text, 'UTF8')), 'hex')
  from public.ets_raffles r
  join public.ets_prizes p on p.raffle_id = r.id
  join public.ets_campaign_dossiers d on d.raffle_id = r.id
  where r.id = $1
$$;

create function ets_internal.raffle_listing_status(raffle_id uuid)
returns text language plpgsql stable set search_path = ''
as $$
declare
  raffle public.ets_raffles%rowtype;
  prize public.ets_prizes%rowtype;
  dossier public.ets_campaign_dossiers%rowtype;
  verification jsonb;
begin
  select * into raffle from public.ets_raffles where id = $1;
  if not found then return 'not_found'; end if;
  if raffle.state in ('listed','published') then return raffle.state; end if;
  if raffle.state in ('closed','cancelled') then return 'inactive'; end if;

  select p.* into prize from public.ets_prizes p where p.raffle_id = $1;
  if prize.prize_kind = 'cash' then return 'cash_prize'; end if;
  if prize.prize_kind is distinct from 'in_kind' then return 'prize_kind'; end if;
  if prize.prize_condition = 'used' then return 'used_prize'; end if;
  if length(btrim(prize.prize_details)) < 10 or length(btrim(prize.delivery_notes)) < 8 then
    return 'prize_details';
  end if;

  if raffle.draw_at is null or raffle.draw_at <= statement_timestamp() then return 'draw_date'; end if;
  if not exists (select 1 from public.ets_prize_images i where i.raffle_id = $1) then return 'photos'; end if;

  select d.* into dossier from public.ets_campaign_dossiers d where d.raffle_id = $1;
  if not found or length(btrim(dossier.organizer_name)) < 3 or
      length(btrim(dossier.competent_authority)) < 3 or dossier.authorization_reference_claimed = '' then
    return 'dossier';
  end if;
  if not exists (
    select 1 from public.ets_campaign_documents d
    join storage.objects o on o.bucket_id = 'ets-campaign-evidence' and o.name = d.storage_path
    where d.raffle_id = $1 and d.document_kind = 'authorization_claim'
  ) then return 'evidence'; end if;

  if raffle.state = 'draft' then return 'review'; end if;
  if not raffle.authorization_verified then return 'verification'; end if;

  select a.new_data into verification from public.ets_raffle_audit a
    where a.raffle_id = $1 and a.operation = 'AUTHORIZATION_VERIFIED'
    order by a.id desc limit 1;
  if verification->>'snapshot' is distinct from ets_internal.raffle_listing_snapshot($1) or not exists (
    select 1 from public.ets_campaign_documents d
    join storage.objects o on o.bucket_id = 'ets-campaign-evidence' and o.name = d.storage_path
    where d.raffle_id = $1 and d.document_kind = 'authorization_claim' and d.id::text = verification->>'document_id'
  ) then return 'verification'; end if;

  return 'ready';
end;
$$;

-- Solo la administración de la base de datos registra una comprobación externa.
-- La referencia y el soporte se cotejan con la respuesta de la autoridad antes de usar esta función.
create function ets_internal.record_raffle_authorization(
  raffle_id uuid, document_id uuid, reviewer_id uuid, verified_reference text, verification_note text
)
returns text language plpgsql set search_path = ''
as $$
declare
  status text;
  reference text;
  snapshot text;
begin
  perform 1 from public.ets_staff_members
    where user_id = $3 and enabled and role in ('admin','auditor') for share;
  if not found then raise exception 'Revisor no habilitado' using errcode = '42501'; end if;

  perform 1 from public.ets_raffles where id = $1 for update;
  perform 1 from public.ets_prizes p where p.raffle_id = $1 for share;
  select d.authorization_reference_claimed into reference from public.ets_campaign_dossiers d
    where d.raffle_id = $1 for share;

  status := ets_internal.raffle_listing_status($1);
  if status <> 'verification' then return status; end if;
  if btrim($4) is distinct from reference or
      coalesce(length(btrim($5)),0) not between 10 and 2000 or not exists (
        select 1 from public.ets_campaign_documents d
        join storage.objects o on o.bucket_id = 'ets-campaign-evidence' and o.name = d.storage_path
        where d.raffle_id = $1 and d.id = $2 and d.document_kind = 'authorization_claim'
      ) then
    return 'evidence';
  end if;

  snapshot := ets_internal.raffle_listing_snapshot($1);
  update public.ets_raffles set authorization_verified = true where id = $1;
  insert into public.ets_raffle_audit (raffle_id, actor_id, operation, new_data)
    values ($1, $3, 'AUTHORIZATION_VERIFIED', jsonb_build_object(
      'document_id', $2, 'reference', reference, 'note', btrim($5), 'snapshot', snapshot
    ));
  return 'ready';
end;
$$;

create function ets_internal.publish_raffle_listing(raffle_id uuid, actor_id uuid)
returns text language plpgsql set search_path = ''
as $$
declare
  status text;
begin
  perform 1 from public.ets_staff_members
    where user_id = $2 and enabled and role = 'admin' for share;
  if not found then raise exception 'Publicación reservada para administración' using errcode = '42501'; end if;

  perform 1 from public.ets_raffles where id = $1 for update;
  perform 1 from public.ets_prizes p where p.raffle_id = $1 for share;
  perform 1 from public.ets_campaign_dossiers d where d.raffle_id = $1 for share;
  status := ets_internal.raffle_listing_status($1);
  if status <> 'ready' then return status; end if;

  update public.ets_raffles set state = 'listed' where id = $1;
  insert into public.ets_raffle_audit (raffle_id, actor_id, operation, new_data)
    values ($1, $2, 'LISTING_PUBLISHED', jsonb_build_object('state', 'listed'));
  return 'listed';
end;
$$;

revoke all on function ets_internal.raffle_listing_snapshot(uuid) from public, anon, authenticated;
revoke all on function ets_internal.raffle_listing_status(uuid) from public, anon, authenticated;
revoke all on function ets_internal.record_raffle_authorization(uuid,uuid,uuid,text,text) from public, anon, authenticated;
revoke all on function ets_internal.publish_raffle_listing(uuid,uuid) from public, anon, authenticated;

commit;
