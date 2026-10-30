-- EL TOQUE DE LA SUERTE / V11 — LABORATORIO PRIVADO DE PEDIDOS SIMULADOS
-- NO ES UN SISTEMA DE PEDIDOS COMERCIALES. NO COBRA, NO RESERVA NÚMEROS REALES.
-- No accede ni modifica public.ets_number_allocations.
-- Ejecutable solo desde un rol privilegiado (SQL Editor); ninguna función pública.
BEGIN;

CREATE SCHEMA IF NOT EXISTS ets_order_lab;
REVOKE ALL ON SCHEMA ets_order_lab FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS ets_order_lab.orders (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 raffle_id uuid NOT NULL REFERENCES public.ets_raffles(id) ON DELETE RESTRICT,
 request_id uuid NOT NULL,
 numbers integer[] NOT NULL CHECK (cardinality(numbers) BETWEEN 1 AND 5),
 state text NOT NULL DEFAULT 'held_demo' CHECK (state IN ('held_demo','released_demo','expired_demo')),
 expires_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE (raffle_id,request_id)
);
CREATE INDEX IF NOT EXISTS ets_v11_orders_expiry ON ets_order_lab.orders (expires_at) WHERE state = 'held_demo';
CREATE TABLE IF NOT EXISTS ets_order_lab.slots (
 raffle_id uuid NOT NULL REFERENCES public.ets_raffles(id) ON DELETE RESTRICT,
 number integer NOT NULL CHECK (number>=0),
 order_id uuid NOT NULL REFERENCES ets_order_lab.orders(id) ON DELETE CASCADE,
 expires_at timestamptz NOT NULL,
 PRIMARY KEY (raffle_id,number)
);
CREATE INDEX IF NOT EXISTS ets_v11_slots_order ON ets_order_lab.slots(order_id);
CREATE TABLE IF NOT EXISTS ets_order_lab.attempts (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 raffle_id uuid NOT NULL,
 request_id uuid NOT NULL,
 outcome text NOT NULL CHECK(outcome IN ('created','conflict','replay')),
 happened_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE IF NOT EXISTS ets_order_lab.events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 order_id uuid NOT NULL REFERENCES ets_order_lab.orders(id) ON DELETE CASCADE,
 event_type text NOT NULL CHECK(event_type IN ('demo_created','demo_released','demo_expired')),
 happened_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE ets_order_lab.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ets_order_lab.slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE ets_order_lab.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ets_order_lab.events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA ets_order_lab FROM PUBLIC, anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA ets_order_lab FROM PUBLIC, anon, authenticated;

-- Solicitud de DEMOSTRACIÓN de varios números, transacción indivisible.
-- Los advisory locks se adquieren siempre en orden, evitando bloqueos circulares.
-- Esta función NO es accesible desde la API pública.
CREATE OR REPLACE FUNCTION ets_order_lab.place_demo_order(
 p_raffle uuid, p_request uuid, p_numbers integer[], p_ttl_seconds integer DEFAULT 120
)
RETURNS TABLE (outcome text, demo_order_id uuid, expires_at timestamptz)
LANGUAGE plpgsql SECURITY INVOKER SET search_path=''
AS $$
DECLARE
 v_nums integer[];
 v_n integer;
 v_total integer;
 v_previous ets_order_lab.orders%ROWTYPE;
 v_busy integer;
 v_id uuid;
 v_exp timestamptz;
 v_rows integer;
BEGIN
 IF p_raffle IS NULL OR p_request IS NULL OR p_numbers IS NULL OR cardinality(p_numbers) NOT BETWEEN 1 AND 5 THEN
   RAISE EXCEPTION 'Se requieren rifa, clave y entre uno y cinco números de prueba';
 END IF;
 IF p_ttl_seconds IS NULL OR p_ttl_seconds NOT BETWEEN 10 AND 300 THEN
   RAISE EXCEPTION 'TTL de prueba debe estar entre 10 y 300 segundos';
 END IF;
 IF array_position(p_numbers,NULL) IS NOT NULL THEN RAISE EXCEPTION 'Números nulos'; END IF;
 SELECT pg_catalog.array_agg(x ORDER BY x) INTO v_nums FROM pg_catalog.unnest(p_numbers) x;
 IF (SELECT pg_catalog.count(DISTINCT x) FROM pg_catalog.unnest(v_nums) x) <> cardinality(v_nums) THEN
   RAISE EXCEPTION 'No se permiten números repetidos';
 END IF;
 -- Serialize attempts using the same request key for replay protection.
 PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_raffle::text||':'||p_request::text,13));
 SELECT * INTO v_previous FROM ets_order_lab.orders WHERE raffle_id=p_raffle AND request_id=p_request;
 IF FOUND THEN
   IF v_previous.numbers<>v_nums THEN RAISE EXCEPTION 'La clave de solicitud ya pertenece a otra selección'; END IF;
   INSERT INTO ets_order_lab.attempts(raffle_id,request_id,outcome) VALUES(p_raffle,p_request,'replay');
   RETURN QUERY SELECT 'replay'::text,v_previous.id,v_previous.expires_at; RETURN;
 END IF;
 SELECT total_numbers INTO v_total FROM public.ets_raffles WHERE id=p_raffle;
 IF NOT FOUND THEN RAISE EXCEPTION 'Rifa de laboratorio inexistente'; END IF;
 IF v_nums[1]<0 OR v_nums[cardinality(v_nums)]>=v_total THEN RAISE EXCEPTION 'Número fuera de rango'; END IF;
 -- Lock every number in a deterministic order; no partial order on any collision.
 FOREACH v_n IN ARRAY v_nums LOOP
   PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_raffle::text||':slot:'||v_n::text,19));
 END LOOP;
 SELECT count(*) INTO v_busy FROM ets_order_lab.slots s WHERE s.raffle_id=p_raffle AND s.number=ANY(v_nums) AND s.expires_at>pg_catalog.clock_timestamp();
 IF v_busy>0 THEN
   INSERT INTO ets_order_lab.attempts(raffle_id,request_id,outcome) VALUES(p_raffle,p_request,'conflict');
   RETURN QUERY SELECT 'conflict'::text,NULL::uuid,NULL::timestamptz;RETURN;
 END IF;
 v_exp:=pg_catalog.clock_timestamp()+pg_catalog.make_interval(secs=>p_ttl_seconds);
 INSERT INTO ets_order_lab.orders(raffle_id,request_id,numbers,expires_at)
 VALUES(p_raffle,p_request,v_nums,v_exp) RETURNING id INTO v_id;
 FOREACH v_n IN ARRAY v_nums LOOP
   INSERT INTO ets_order_lab.slots AS s(raffle_id,number,order_id,expires_at)
   VALUES(p_raffle,v_n,v_id,v_exp)
   ON CONFLICT(raffle_id,number) DO UPDATE SET order_id=EXCLUDED.order_id,expires_at=EXCLUDED.expires_at
   WHERE s.expires_at<=pg_catalog.clock_timestamp();
   GET DIAGNOSTICS v_rows=ROW_COUNT;
   IF v_rows<>1 THEN RAISE EXCEPTION 'Colisión concurrente; pedido de laboratorio revertido'; END IF;
 END LOOP;
 INSERT INTO ets_order_lab.events(order_id,event_type) VALUES(v_id,'demo_created');
 INSERT INTO ets_order_lab.attempts(raffle_id,request_id,outcome) VALUES(p_raffle,p_request,'created');
 RETURN QUERY SELECT 'created'::text,v_id,v_exp;
END;$$;

-- En laboratorio, cancelar una simulación libera sus números de forma controlada.
CREATE OR REPLACE FUNCTION ets_order_lab.release_demo_order(p_order uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path=''
AS $$
DECLARE v_count integer;
BEGIN
 UPDATE ets_order_lab.orders SET state='released_demo' WHERE id=p_order AND state='held_demo';
 GET DIAGNOSTICS v_count=ROW_COUNT;
 IF v_count=0 THEN RETURN false; END IF;
 DELETE FROM ets_order_lab.slots WHERE order_id=p_order;
 INSERT INTO ets_order_lab.events(order_id,event_type) VALUES(p_order,'demo_released');
 RETURN true;
END;$$;

-- Mantenimiento manual. No habilitar job automático hasta revisión de entorno.
CREATE OR REPLACE FUNCTION ets_order_lab.expire_demo_orders(p_limit integer DEFAULT 100)
RETURNS integer LANGUAGE plpgsql SECURITY INVOKER SET search_path=''
AS $$
DECLARE r record; v_count integer:=0;
BEGIN
 IF p_limit NOT BETWEEN 1 AND 1000 THEN RAISE EXCEPTION 'Límite inválido'; END IF;
 FOR r IN SELECT id FROM ets_order_lab.orders WHERE state='held_demo' AND expires_at<=pg_catalog.clock_timestamp()
   ORDER BY expires_at LIMIT p_limit FOR UPDATE SKIP LOCKED LOOP
   UPDATE ets_order_lab.orders SET state='expired_demo' WHERE id=r.id;
   DELETE FROM ets_order_lab.slots WHERE order_id=r.id AND expires_at<=pg_catalog.clock_timestamp();
   INSERT INTO ets_order_lab.events(order_id,event_type) VALUES(r.id,'demo_expired');
   v_count:=v_count+1;
 END LOOP;
 RETURN v_count;
END;$$;

REVOKE ALL ON ALL FUNCTIONS IN SCHEMA ets_order_lab FROM PUBLIC,anon,authenticated;
COMMIT;