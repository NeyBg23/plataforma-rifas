-- Ejecutar únicamente en una base aislada con los esquemas y migraciones aplicados.
begin;

do $$
declare
  admin_id uuid;
  operator_id uuid;
  campaign uuid := gen_random_uuid();
  document uuid := gen_random_uuid();
  evidence_path text;
  rejected boolean := false;
begin
  select user_id into admin_id from public.ets_staff_members where enabled and role = 'admin' limit 1;
  select user_id into operator_id from public.ets_staff_members where enabled and role = 'operator' limit 1;
  if admin_id is null or operator_id is null then
    raise exception 'Crea un administrador y un operador ficticios para la prueba';
  end if;

  evidence_path := campaign::text || '/' || admin_id::text || '/' || document::text || '.pdf';
  insert into public.ets_raffles(id,title,description,category,ticket_price_cop,total_numbers,created_by,draw_at)
    values(campaign,'Ficha ficticia de prueba','Descripción ficticia','hogar',20000,100,admin_id,now()+interval '10 days');
  insert into public.ets_prizes(raffle_id,prize_kind,prize_condition,prize_details,delivery_notes,updated_by)
    values(campaign,'cash','other','TV LG','En sede',admin_id);
  insert into public.ets_campaign_dossiers(raffle_id,organizer_name,competent_authority,authorization_reference_claimed,updated_by)
    values(campaign,'Gestor de prueba','Autoridad de prueba','PRUEBA-ACTO',admin_id);
  insert into storage.objects(bucket_id,name) values('ets-campaign-evidence',evidence_path);
  insert into public.ets_campaign_documents(id,raffle_id,storage_path,document_kind,original_filename,mime_type,size_bytes,uploaded_by)
    values(document,campaign,evidence_path,'authorization_claim','soporte-ficticio.pdf','application/pdf',1,admin_id);
  insert into ets_manual.settings(raffle_id,recipient,institution,payment_key,enabled,updated_by)
    values(campaign,'PRUEBA SIN DINERO','Banco ficticio','SOLO-PRUEBA',true,admin_id);

  execute 'set local role anon';
  if exists (select id from public.ets_raffles where id=campaign) then
    raise exception 'Un visitante pudo ver la rifa en borrador';
  end if;
  execute 'reset role';
  if has_schema_privilege('authenticated','ets_internal','USAGE') or
     has_function_privilege('authenticated','ets_internal.publish_raffle_listing(uuid,uuid)','EXECUTE') then
    raise exception 'Una cuenta web obtuvo acceso directo a la publicación';
  end if;
  if ets_internal.publish_raffle_listing(campaign,admin_id) <> 'cash_prize' or
     ets_internal.record_raffle_authorization(campaign,document,admin_id,'PRUEBA-ACTO','Confirmación ficticia') <> 'cash_prize' then
    raise exception 'La ficha con premio en efectivo llegó a la publicación';
  end if;

  -- Cambios de datos de prueba hechos dentro de esta transacción, sin compradores.
  perform set_config('request.jwt.claim.sub',admin_id::text,true);
  update public.ets_prizes set prize_kind='in_kind',prize_condition='new' where raffle_id=campaign;
  if ets_internal.publish_raffle_listing(campaign,admin_id) <> 'verification' then
    raise exception 'Cargar un soporte bastó para publicar';
  end if;
  if ets_internal.record_raffle_authorization(campaign,document,admin_id,'OTRO-ACTO','Confirmación ficticia') <> 'evidence' then
    raise exception 'Aceptó una referencia diferente al acto declarado';
  end if;
  if ets_internal.record_raffle_authorization(campaign,document,admin_id,'PRUEBA-ACTO','Confirmación ficticia') <> 'ready' then
    raise exception 'No registró la comprobación ficticia';
  end if;
  if ets_internal.raffle_listing_status(campaign) <> 'ready' then
    raise exception 'La verificación no dejó una ficha lista';
  end if;
  execute 'set local role authenticated';
  update public.ets_raffles set state='in_review' where id=campaign;
  if (select state from public.ets_raffles where id=campaign) is distinct from 'draft' then
    raise exception 'Una cuenta web modificó datos aprobados';
  end if;
  execute 'reset role';

  begin
    perform ets_internal.publish_raffle_listing(campaign,operator_id);
  exception when insufficient_privilege then rejected := true;
  end;
  if not rejected then raise exception 'Un operador pudo publicar'; end if;

  update public.ets_raffles set title='Datos que cambiaron después de revisión' where id=campaign;
  if ets_internal.publish_raffle_listing(campaign,admin_id) <> 'verification' then
    raise exception 'La verificación siguió válida tras cambiar los datos revisados';
  end if;
  update public.ets_raffles set title='Ficha ficticia de prueba' where id=campaign;
  if ets_internal.publish_raffle_listing(campaign,admin_id) <> 'listed' then
    raise exception 'La ficha autorizada no pasó de borrador a publicada';
  end if;
  perform ets_internal.publish_raffle_listing(campaign,admin_id);
  if (select count(*) from public.ets_raffle_audit
      where raffle_id=campaign and operation='LISTING_PUBLISHED' and actor_id=admin_id) <> 1 then
    raise exception 'La publicación duplicó o perdió el registro de auditoría';
  end if;

  execute 'set local role anon';
  if (select state from public.ets_raffles where id=campaign) is distinct from 'listed' then
    raise exception 'El catálogo público no pudo leer la ficha';
  end if;
  execute 'reset role';

  rejected := false;
  begin
    perform ets_manual.place_order(campaign,gen_random_uuid(),repeat('a',64),array[1],
      'Cliente ficticio','+570000000000',false,null);
  exception when insufficient_privilege then rejected := true;
  end;
  if not rejected then raise exception 'Una ficha informativa aceptó un pedido público'; end if;
end;
$$;

rollback;
