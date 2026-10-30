-- Test reversible. Ejecutar en el SQL Editor solo después de la migración V11.
-- El DO block falla completo si alguna garantía básica se rompe.
BEGIN;
DO $test$
DECLARE
 v_raffle uuid;
 v_a uuid:=gen_random_uuid();
 v_b uuid:=gen_random_uuid();
 v_order uuid;
 v_result text;
 v_id uuid;
 v_count integer;
BEGIN
 SELECT id INTO v_raffle FROM public.ets_raffles ORDER BY created_at LIMIT 1;
 IF v_raffle IS NULL THEN RAISE EXCEPTION 'Se necesita una rifa de desarrollo'; END IF;
 SELECT outcome,demo_order_id INTO v_result,v_order FROM ets_order_lab.place_demo_order(v_raffle,v_a,ARRAY[5,7],60);
 IF v_result<>'created' OR v_order IS NULL THEN RAISE EXCEPTION 'Falló creación de prueba'; END IF;
 SELECT outcome INTO v_result FROM ets_order_lab.place_demo_order(v_raffle,v_b,ARRAY[7,8],60);
 IF v_result<>'conflict' THEN RAISE EXCEPTION 'No se rechazó una selección parcial en conflicto'; END IF;
 SELECT count(*) INTO v_count FROM ets_order_lab.slots WHERE order_id=v_order;
 IF v_count<>2 THEN RAISE EXCEPTION 'Se registraron números incorrectos'; END IF;
 SELECT outcome,demo_order_id INTO v_result,v_id FROM ets_order_lab.place_demo_order(v_raffle,v_a,ARRAY[7,5],60);
 IF v_result<>'replay' OR v_id<>v_order THEN RAISE EXCEPTION 'Falló idempotencia'; END IF;
 IF NOT ets_order_lab.release_demo_order(v_order) THEN RAISE EXCEPTION 'Falló liberación'; END IF;
 SELECT outcome INTO v_result FROM ets_order_lab.place_demo_order(v_raffle,v_b,ARRAY[7,8],60);
 IF v_result<>'created' THEN RAISE EXCEPTION 'Intento rechazado no pudo reintentarse tras liberar'; END IF;
END;
$test$;
ROLLBACK;