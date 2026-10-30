-- EL TOQUE DE LA SUERTE! — V8: fichas de premio, galería PRIVADA y trazabilidad.
-- Migración ADITIVA para el proyecto exclusivo ncbdkllujiakleuhdhhr.
-- No altera ni publica rifas existentes. No habilita cobros ni asignación de números.
BEGIN;

CREATE TABLE public.ets_prizes (
 raffle_id uuid PRIMARY KEY REFERENCES public.ets_raffles(id) ON DELETE RESTRICT,
 brand varchar(100) NOT NULL DEFAULT '',
 model varchar(100) NOT NULL DEFAULT '',
 prize_condition text NOT NULL DEFAULT 'new' CHECK (prize_condition IN ('new','used','other')),
 prize_details text NOT NULL DEFAULT '' CHECK (length(prize_details) <= 5000),
 estimated_value_cop bigint CHECK (estimated_value_cop IS NULL OR estimated_value_cop BETWEEN 1 AND 100000000000),
 includes_text text NOT NULL DEFAULT '' CHECK (length(includes_text) <= 3000),
 delivery_notes text NOT NULL DEFAULT '' CHECK (length(delivery_notes) <= 3000),
 updated_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
 updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ets_prize_images (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 raffle_id uuid NOT NULL REFERENCES public.ets_raffles(id) ON DELETE RESTRICT,
 storage_path text NOT NULL UNIQUE,
 alt_text varchar(180) NOT NULL CHECK (length(btrim(alt_text)) BETWEEN 4 AND 180),
 is_cover boolean NOT NULL DEFAULT false,
 sort_order smallint NOT NULL DEFAULT 0 CHECK (sort_order BETWEEN 0 AND 100),
 uploaded_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT ets_image_path_matches_raffle CHECK (storage_path LIKE raffle_id::text || '/%'),
 CONSTRAINT ets_image_path_format CHECK (storage_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$')
);
CREATE INDEX ets_images_raffle_order_idx ON public.ets_prize_images(raffle_id,sort_order,created_at);
CREATE UNIQUE INDEX ets_images_one_cover_idx ON public.ets_prize_images(raffle_id) WHERE is_cover;

CREATE OR REPLACE FUNCTION ets_internal.set_prize_updated()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
 NEW.updated_at := now();
 NEW.updated_by := auth.uid();
 RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION ets_internal.audit_prize()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF tg_op = 'DELETE' THEN
   INSERT INTO public.ets_raffle_audit(raffle_id,actor_id,operation,old_data)
   VALUES(old.raffle_id,auth.uid(),'PRIZE_DELETE',to_jsonb(old));
   RETURN old;
 END IF;
 INSERT INTO public.ets_raffle_audit(raffle_id,actor_id,operation,old_data,new_data)
 VALUES(new.raffle_id,auth.uid(),'PRIZE_' || tg_op,
        CASE WHEN tg_op='UPDATE' THEN to_jsonb(old) ELSE NULL END,to_jsonb(new));
 RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION ets_internal.audit_image()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF tg_op = 'DELETE' THEN
  INSERT INTO public.ets_raffle_audit(raffle_id,actor_id,operation,old_data)
  VALUES(old.raffle_id,auth.uid(),'PHOTO_DELETE',to_jsonb(old));
  RETURN old;
 END IF;
 INSERT INTO public.ets_raffle_audit(raffle_id,actor_id,operation,old_data,new_data)
 VALUES(new.raffle_id,auth.uid(),'PHOTO_' || tg_op,
        CASE WHEN tg_op='UPDATE' THEN to_jsonb(old) ELSE NULL END,to_jsonb(new));
 RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION ets_internal.limit_gallery_size()
RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
 PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.raffle_id::text, 381));
 IF (SELECT pg_catalog.count(*) FROM public.ets_prize_images WHERE raffle_id=new.raffle_id) >= 8 THEN
  RAISE EXCEPTION 'Máximo ocho fotografías por rifa';
 END IF;
 RETURN new;
END;
$$;
REVOKE ALL ON FUNCTION ets_internal.limit_gallery_size() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER ets_gallery_maximum BEFORE INSERT ON public.ets_prize_images
 FOR EACH ROW EXECUTE FUNCTION ets_internal.limit_gallery_size();

CREATE TRIGGER ets_prizes_stamp BEFORE UPDATE ON public.ets_prizes
 FOR EACH ROW EXECUTE FUNCTION ets_internal.set_prize_updated();
CREATE TRIGGER ets_prizes_audit AFTER INSERT OR UPDATE OR DELETE ON public.ets_prizes
 FOR EACH ROW EXECUTE FUNCTION ets_internal.audit_prize();
CREATE TRIGGER ets_images_audit AFTER INSERT OR UPDATE OR DELETE ON public.ets_prize_images
 FOR EACH ROW EXECUTE FUNCTION ets_internal.audit_image();

REVOKE ALL ON FUNCTION ets_internal.set_prize_updated() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION ets_internal.audit_prize() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION ets_internal.audit_image() FROM PUBLIC, anon, authenticated;

ALTER TABLE public.ets_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ets_prize_images ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ets_prizes FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.ets_prize_images FROM PUBLIC, anon, authenticated;

-- Autorización independiente del frontend; no se usan JWT user_metadata.
GRANT SELECT, INSERT ON public.ets_prizes TO authenticated;
GRANT UPDATE (brand,model,prize_condition,prize_details,estimated_value_cop,includes_text,delivery_notes) ON public.ets_prizes TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.ets_prize_images TO authenticated;
GRANT UPDATE (alt_text,is_cover,sort_order) ON public.ets_prize_images TO authenticated;

CREATE POLICY ets_prizes_staff_select ON public.ets_prizes FOR SELECT TO authenticated USING (
 EXISTS (SELECT 1 FROM public.ets_staff_members s
         WHERE s.user_id=(SELECT auth.uid()) AND s.enabled AND s.role IN ('admin','operator','auditor')));
CREATE POLICY ets_prizes_staff_insert ON public.ets_prizes FOR INSERT TO authenticated WITH CHECK (
 updated_by=(SELECT auth.uid())
 AND EXISTS (SELECT 1 FROM public.ets_staff_members s WHERE s.user_id=(SELECT auth.uid()) AND s.enabled AND s.role IN ('admin','operator'))
 AND EXISTS (SELECT 1 FROM public.ets_raffles r WHERE r.id=raffle_id AND r.state='draft' AND NOT r.authorization_verified));
CREATE POLICY ets_prizes_staff_update ON public.ets_prizes FOR UPDATE TO authenticated
 USING (EXISTS (SELECT 1 FROM public.ets_staff_members s WHERE s.user_id=(SELECT auth.uid()) AND s.enabled AND s.role IN ('admin','operator'))
        AND EXISTS (SELECT 1 FROM public.ets_raffles r WHERE r.id=raffle_id AND r.state='draft' AND NOT r.authorization_verified))
 WITH CHECK (updated_by=(SELECT auth.uid())
         AND EXISTS (SELECT 1 FROM public.ets_staff_members s WHERE s.user_id=(SELECT auth.uid()) AND s.enabled AND s.role IN ('admin','operator'))
         AND EXISTS (SELECT 1 FROM public.ets_raffles r WHERE r.id=raffle_id AND r.state='draft' AND NOT r.authorization_verified));

CREATE POLICY ets_images_staff_select ON public.ets_prize_images FOR SELECT TO authenticated USING (
 EXISTS (SELECT 1 FROM public.ets_staff_members s
         WHERE s.user_id=(SELECT auth.uid()) AND s.enabled AND s.role IN ('admin','operator','auditor')));
CREATE POLICY ets_images_staff_insert ON public.ets_prize_images FOR INSERT TO authenticated WITH CHECK (
 uploaded_by=(SELECT auth.uid())
 AND split_part(storage_path,'/',2)=(SELECT auth.uid())::text
 AND EXISTS (SELECT 1 FROM public.ets_staff_members s WHERE s.user_id=(SELECT auth.uid()) AND s.enabled AND s.role IN ('admin','operator'))
 AND EXISTS (SELECT 1 FROM public.ets_raffles r WHERE r.id=raffle_id AND r.state='draft' AND NOT r.authorization_verified));
CREATE POLICY ets_images_staff_update ON public.ets_prize_images FOR UPDATE TO authenticated USING (
 EXISTS (SELECT 1 FROM public.ets_staff_members s WHERE s.user_id=(SELECT auth.uid()) AND s.enabled AND s.role IN ('admin','operator'))
 AND EXISTS (SELECT 1 FROM public.ets_raffles r WHERE r.id=raffle_id AND r.state='draft' AND NOT r.authorization_verified))
 WITH CHECK (EXISTS (SELECT 1 FROM public.ets_staff_members s WHERE s.user_id=(SELECT auth.uid()) AND s.enabled AND s.role IN ('admin','operator'))
 AND EXISTS (SELECT 1 FROM public.ets_raffles r WHERE r.id=raffle_id AND r.state='draft' AND NOT r.authorization_verified));
CREATE POLICY ets_images_staff_delete ON public.ets_prize_images FOR DELETE TO authenticated USING (
 EXISTS (SELECT 1 FROM public.ets_staff_members s WHERE s.user_id=(SELECT auth.uid()) AND s.enabled AND s.role IN ('admin','operator'))
 AND EXISTS (SELECT 1 FROM public.ets_raffles r WHERE r.id=raffle_id AND r.state='draft' AND NOT r.authorization_verified));

-- Limita el bucket a imágenes privadas y máximo 5 MB por objeto. Sin acceso anónimo.
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES ('ets-prize-drafts','ets-prize-drafts',false,5242880,ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- La carpeta raíz es el UUID de la rifa; la segunda es el del usuario que sube.
-- Solo personal activo y borradores pueden subirse/modificarse.
CREATE POLICY ets_v8_storage_staff_read ON storage.objects FOR SELECT TO authenticated USING (
 bucket_id='ets-prize-drafts' AND EXISTS (
 SELECT 1 FROM public.ets_staff_members s
 WHERE s.user_id=(SELECT auth.uid()) AND s.enabled AND s.role IN ('admin','operator','auditor')));
CREATE POLICY ets_v8_storage_staff_upload ON storage.objects FOR INSERT TO authenticated WITH CHECK (
 bucket_id='ets-prize-drafts' AND (storage.foldername(name))[2]=(SELECT auth.uid())::text
 AND storage.extension(name) IN ('jpg','jpeg','png','webp')
 AND EXISTS (SELECT 1 FROM public.ets_staff_members s WHERE s.user_id=(SELECT auth.uid()) AND s.enabled AND s.role IN ('admin','operator'))
 AND EXISTS (SELECT 1 FROM public.ets_raffles r WHERE r.id::text=(storage.foldername(name))[1] AND r.state='draft' AND NOT r.authorization_verified));
CREATE POLICY ets_v8_storage_staff_delete ON storage.objects FOR DELETE TO authenticated USING (
 bucket_id='ets-prize-drafts'
 AND EXISTS (SELECT 1 FROM public.ets_staff_members s WHERE s.user_id=(SELECT auth.uid()) AND s.enabled
             AND (s.role='admin' OR (s.role='operator' AND owner_id=(SELECT auth.uid())::text)))
 AND EXISTS (SELECT 1 FROM public.ets_raffles r WHERE r.id::text=(storage.foldername(name))[1] AND r.state='draft' AND NOT r.authorization_verified));
COMMIT;