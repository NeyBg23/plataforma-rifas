-- Prueba reversible V10. Ejecutar SOLO en SQL Editor del proyecto de desarrollo.
-- Sustituye el UUID de rifa únicamente si necesitas probar con otra rifa EXISTENTE.
begin;
do $test$
declare
  v_run uuid;
  v_a uuid := gen_random_uuid();
  v_b uuid := gen_random_uuid();
  v_c uuid := gen_random_uuid();
  v_result text;
  v_count integer;
begin
  insert into ets_lab.runs(raffle_id,label)
  values ('c3b1eb27-ade9-434f-ade4-6ce68f84f184','V10 automated rollback smoke test')
  returning id into v_run;
  select outcome into v_result from ets_lab.try_hold(v_run,5,v_a,120);
  if v_result <> 'held' then raise exception 'First hold must succeed'; end if;
  select outcome into v_result from ets_lab.try_hold(v_run,5,v_b,120);
  if v_result <> 'conflict' then raise exception 'Conflicting hold must fail'; end if;
  select outcome into v_result from ets_lab.try_hold(v_run,5,v_a,120);
  if v_result <> 'held' then raise exception 'Retry must be idempotent'; end if;
  select count(*) into v_count from ets_lab.slots where run_id=v_run and number=5;
  if v_count <> 1 then raise exception 'Unique slot protection failed'; end if;
  begin
    perform outcome from ets_lab.try_hold(v_run,6,v_a,120);
    raise exception 'Reused idempotency key unexpectedly accepted';
  exception when others then
    if SQLERRM not like 'La misma clave de solicitud%' then raise; end if;
  end;
  if ets_lab.release_hold(v_run,5,v_b) then raise exception 'Unauthorized release succeeded'; end if;
  if not ets_lab.release_hold(v_run,5,v_a) then raise exception 'Owner release failed'; end if;
  select outcome into v_result from ets_lab.try_hold(v_run,5,v_c,120);
  if v_result <> 'held' then raise exception 'Released slot cannot be reused'; end if;
end $test$;
rollback;