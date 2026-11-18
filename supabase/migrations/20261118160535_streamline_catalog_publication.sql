-- La revisión interna y la galería son opcionales para publicar la ficha.
-- Conserva la verificación, el soporte de autorización y la separación de pedidos.
begin;

create or replace function ets_internal.raffle_listing_status(raffle_id uuid)
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
  if coalesce(btrim(prize.prize_details), '') = '' or coalesce(btrim(prize.delivery_notes), '') = '' then
    return 'prize_details';
  end if;

  if raffle.draw_at is null or raffle.draw_at <= statement_timestamp() then return 'draw_date'; end if;

  select d.* into dossier from public.ets_campaign_dossiers d where d.raffle_id = $1;
  if not found or length(btrim(dossier.organizer_name)) < 3 or
      length(btrim(dossier.competent_authority)) < 3 or btrim(dossier.authorization_reference_claimed) = '' then
    return 'dossier';
  end if;
  if not exists (
    select 1 from public.ets_campaign_documents d
    join storage.objects o on o.bucket_id = 'ets-campaign-evidence' and o.name = d.storage_path
    where d.raffle_id = $1 and d.document_kind = 'authorization_claim'
  ) then return 'evidence'; end if;

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

commit;
