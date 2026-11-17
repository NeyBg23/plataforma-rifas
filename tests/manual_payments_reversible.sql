-- Ejecutar con BEGIN y ROLLBACK. Solo crea campañas y transferencias ficticias.
do $$
declare
  actor uuid;
  campaign uuid := gen_random_uuid();
  live_campaign uuid := gen_random_uuid();
  first_order uuid := gen_random_uuid();
  other_order uuid := gen_random_uuid();
  real_order uuid := gen_random_uuid();
  expired_order uuid := gen_random_uuid();
  result jsonb;
  rejected boolean;
begin
  select user_id into actor from public.ets_staff_members where enabled and role='admin' limit 1;
  if actor is null then raise exception 'Falta administrador para las pruebas'; end if;
  insert into public.ets_raffles(id,title,category,ticket_price_cop,total_numbers,created_by)
    values(campaign,'PRUEBA TRANSACCIONAL TEMPORAL','otros',10000,100,actor);
  insert into ets_manual.settings(raffle_id,recipient,institution,payment_key,enabled,updated_by)
    values(campaign,'PRUEBA SIN DINERO','Banco ficticio','SOLO-PRUEBA',true,actor);

  rejected := false;
  begin
    perform ets_manual.place_order(campaign,first_order,repeat('a',64),array[1,2],'Cliente ficticio','+570000000000',true,null);
  exception when insufficient_privilege then rejected := true; end;
  if not rejected then raise exception 'La prueba debe requerir personal'; end if;
  rejected := false;
  begin
    perform ets_manual.place_order(campaign,first_order,repeat('a',64),array[1,2],'Cliente ficticio','+570000000000',false,null);
  exception when insufficient_privilege then rejected := true; end;
  if not rejected then raise exception 'Un borrador no debe aceptar pedidos públicos'; end if;

  result := ets_manual.place_order(campaign,first_order,repeat('a',64),array[2,1],'Cliente ficticio','+570000000000',true,actor);
  if result->>'outcome' <> 'created' then raise exception 'Falla al crear'; end if;
  if (select amount_cop from ets_manual.orders where id=first_order) <> 20000 then raise exception 'Importe incorrecto'; end if;
  if exists(select 1 from public.ets_number_allocations where raffle_id=campaign) then raise exception 'La prueba tocó inventario real'; end if;
  result := ets_manual.place_order(campaign,first_order,repeat('a',64),array[1,2],'Cliente ficticio','+570000000000',true,actor);
  if result->>'outcome' <> 'replay' then raise exception 'Falla idempotencia'; end if;
  result := ets_manual.place_order(campaign,other_order,repeat('b',64),array[2,3],'Cliente ficticio','+570000000000',true,actor);
  if result->>'outcome' <> 'conflict' or exists(select 1 from ets_manual.orders where id=other_order) then raise exception 'Conflicto parcial'; end if;
  rejected := false;
  begin
    perform ets_manual.report_payment(campaign,first_order,repeat('b',64),'REF-FICTICIA-1');
  exception when insufficient_privilege then rejected := true; end;
  if not rejected then raise exception 'Aceptó acceso ajeno'; end if;
  if ets_manual.report_payment(campaign,first_order,repeat('a',64),'REF-FICTICIA-1') <> 'pending_review' then raise exception 'Reporte fallido'; end if;
  perform ets_manual.report_payment(campaign,first_order,repeat('a',64),'REF-FICTICIA-1');
  if (select count(*) from ets_manual.events where order_id=first_order and action='payment_reported') <> 1 then raise exception 'Reporte duplicado'; end if;
  perform ets_manual.review_payment(campaign,first_order,actor,'confirmed','Prueba de confirmación');
  perform ets_manual.review_payment(campaign,first_order,actor,'confirmed','Reintento');
  if (select count(*) from ets_manual.events where order_id=first_order and action='confirmed') <> 1 then raise exception 'Confirmación duplicada'; end if;

  perform ets_manual.place_order(campaign,expired_order,repeat('c',64),array[4],'Cliente ficticio','+570000000000',true,actor);
  update ets_manual.orders set expires_at=clock_timestamp()-interval '1 second' where id=expired_order;
  perform ets_manual.expire_orders(campaign,true);
  if exists(select 1 from ets_manual.slots where order_id=expired_order) then raise exception 'No liberó al vencer'; end if;
  rejected := false;
  begin
    perform ets_manual.report_payment(campaign,expired_order,repeat('c',64),'REF-TARDIA');
  exception when invalid_parameter_value then rejected := true; end;
  if not rejected then raise exception 'Aceptó transferencia tardía'; end if;

  -- Campaña temporal habilitada únicamente dentro de esta transacción reversible.
  insert into public.ets_raffles(id,title,category,ticket_price_cop,total_numbers,created_by,state,authorization_verified,draw_at)
    values(live_campaign,'PRUEBA REVERSIBLE PUBLICADA','otros',15000,100,actor,'published',true,clock_timestamp()+interval '1 day');
  insert into ets_manual.settings(raffle_id,recipient,institution,payment_key,enabled,updated_by)
    values(live_campaign,'PRUEBA SIN DINERO','Banco ficticio','SOLO-PRUEBA',true,actor);
  perform ets_manual.place_order(live_campaign,real_order,repeat('d',64),array[10,11],'Cliente ficticio','+570000000000',false,null);
  if (select count(*) from public.ets_number_allocations where order_ref=real_order and allocation_state='held') <> 2 then raise exception 'No retuvo atómicamente'; end if;
  -- El cambio del destino no altera las instrucciones del pedido existente.
  update ets_manual.settings set payment_key='OTRA-LLAVE-DE-PRUEBA' where raffle_id=live_campaign;
  if (select payment_details->>'payment_key' from ets_manual.orders where id=real_order) <> 'SOLO-PRUEBA' then raise exception 'Cambió destino histórico'; end if;
  perform ets_manual.report_payment(live_campaign,real_order,repeat('d',64),'REF-REAL-FICTICIA');
  perform ets_manual.review_payment(live_campaign,real_order,actor,'confirmed','Verificación ficticia');
  if (select count(*) from public.ets_number_allocations where order_ref=real_order and allocation_state='issued') <> 2 then raise exception 'Confirmación sin inventario'; end if;
  perform ets_manual.place_order(live_campaign,other_order,repeat('e',64),array[12],'Cliente ficticio','+570000000000',false,null);
  perform ets_manual.report_payment(live_campaign,other_order,repeat('e',64),'OTRA-REFERENCIA');
  perform ets_manual.review_payment(live_campaign,other_order,actor,'rejected','Referencia no recibida');
  if exists(select 1 from public.ets_number_allocations where order_ref=other_order) then raise exception 'El rechazo no liberó'; end if;
  if has_schema_privilege('anon','ets_manual','USAGE') or has_schema_privilege('authenticated','ets_manual','USAGE') then raise exception 'Esquema expuesto'; end if;
end;
$$;
