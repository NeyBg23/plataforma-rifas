-- El toque de la suerte! V15 — expediente privado y revisión documental.
-- Migración ADITIVA. No modifica rifas previas ni habilita autorización, publicación, números o pagos.
BEGIN;

CREATE TABLE public.ets_campaign_dossiers (
  raffle_id uuid PRIMARY KEY REFERENCES public.ets_raffles(id) ON DELETE RESTRICT,
  organizer_name varchar(200) NOT NULL DEFAULT '' CHECK (length(btrim(organizer_name)) <= 200),
  competent_authority varchar(200) NOT NULL DEFAULT '' CHECK (length(btrim(competent_authority)) <= 200),
  authorization_reference_claimed varchar(160) NOT NULL DEFAULT '' CHECK (length(btrim(authorization_reference_claimed)) <= 160),
  supporting_notes text NOT NULL DEFAULT '' CHECK (length(supporting_notes) <= 4000),
  updated_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON COLUMN public.ets_campaign_dossiers.authorization_reference_claimed IS
  'Referencia DECLARADA por usuario; no acredita verificación ni habilita publicar.';

CREATE TABLE public.ets_campaign_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id uuid NOT NULL REFERENCES public.ets_raffles(id) ON DELETE RESTRICT,
  storage_path text NOT NULL UNIQUE,
  document_kind text NOT NULL CHECK (document_kind IN ('authorization_claim','prize_support','organizer_support','other')),
  original_filename varchar(180) NOT NULL CHECK (length(btrim(original_filename)) BETWEEN 1 AND 180),
  mime_type text NOT NULL CHECK (mime_type IN ('application/pdf','image/jpeg','image/png')),
  size_bytes bigint NOT NULL CHECK (size_bytes BETWEEN 1 AND 10485760),
  uploaded_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ets_campaign_document_path CHECK (
    storage_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}\.(pdf|jpg|jpeg|png)$'
    AND split_part(storage_path,'/',1) = raffle_id::text
    AND split_part(storage_path,'/',2) = uploaded_by::text
  )
);
CREATE INDEX ets_campaign_docs_raffle_idx ON public.ets_campaign_documents (raffle_id,created_at DESC);

CREATE TABLE public.ets_campaign_review_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id uuid NOT NULL REFERENCES public.ets_raffles(id) ON DELETE RESTRICT,
  note_type text NOT NULL CHECK (note_type IN ('observation','request_changes','ready_for_external_review')),
  content text NOT NULL CHECK (length(btrim(content)) BETWEEN 5 AND 2000),
  actor_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ets_campaign_review_raffle_idx ON public.ets_campaign_review_notes (raffle_id, created_at DESC);
COMMENT ON COLUMN public.ets_campaign_review_notes.note_type IS
  'ready_for_external_review es solo una preparación INTERNA; no es autorización ni publicación.';

CREATE OR REPLACE FUNCTION ets_internal.set_campaign_dossier_updated()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  NEW.updated_at := now();
  NEW.updated_by := (SELECT auth.uid());
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION ets_internal.set_campaign_dossier_updated() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION ets_internal.audit_campaign_dossier()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.ets_raffle_audit (raffle_id,actor_id,operation,old_data,new_data)
  VALUES (NEW.raffle_id, (SELECT auth.uid()), 'DOSSIER_'||TG_OP,
          CASE WHEN TG_OP='UPDATE' THEN to_jsonb(OLD) ELSE NULL END, to_jsonb(NEW));
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION ets_internal.audit_campaign_dossier() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION ets_internal.audit_campaign_document()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.ets_raffle_audit (raffle_id,actor_id,operation,new_data)
  VALUES (NEW.raffle_id,(SELECT auth.uid()),'DOSSIER_DOCUMENT_INSERT',to_jsonb(NEW));
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION ets_internal.audit_campaign_document() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION ets_internal.audit_campaign_review()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.ets_raffle_audit (raffle_id,actor_id,operation,new_data)
  VALUES (NEW.raffle_id,(SELECT auth.uid()),'DOSSIER_REVIEW_INSERT',to_jsonb(NEW));
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION ets_internal.audit_campaign_review() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER ets_dossier_stamp BEFORE UPDATE ON public.ets_campaign_dossiers
  FOR EACH ROW EXECUTE FUNCTION ets_internal.set_campaign_dossier_updated();
CREATE TRIGGER ets_dossier_audit AFTER INSERT OR UPDATE ON public.ets_campaign_dossiers
  FOR EACH ROW EXECUTE FUNCTION ets_internal.audit_campaign_dossier();
CREATE TRIGGER ets_dossier_document_audit AFTER INSERT ON public.ets_campaign_documents
  FOR EACH ROW EXECUTE FUNCTION ets_internal.audit_campaign_document();
CREATE TRIGGER ets_dossier_review_audit AFTER INSERT ON public.ets_campaign_review_notes
  FOR EACH ROW EXECUTE FUNCTION ets_internal.audit_campaign_review();

ALTER TABLE public.ets_campaign_dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ets_campaign_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ets_campaign_review_notes ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.ets_campaign_dossiers FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.ets_campaign_documents FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.ets_campaign_review_notes FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT ON public.ets_campaign_dossiers TO authenticated;
GRANT UPDATE (organizer_name,competent_authority,authorization_reference_claimed,supporting_notes)
 ON public.ets_campaign_dossiers TO authenticated;
GRANT SELECT, INSERT ON public.ets_campaign_documents TO authenticated;
GRANT SELECT, INSERT ON public.ets_campaign_review_notes TO authenticated;

-- El personal habilitado puede consultar. Solo admin/operador crea o corrige documentos.
CREATE POLICY ets_dossier_staff_read ON public.ets_campaign_dossiers
  FOR SELECT TO authenticated USING (EXISTS (
    SELECT 1 FROM public.ets_staff_members s WHERE s.user_id=(SELECT auth.uid())
    AND s.enabled AND s.role IN ('admin','operator','auditor')
  ));
CREATE POLICY ets_dossier_staff_create ON public.ets_campaign_dossiers
  FOR INSERT TO authenticated WITH CHECK (
    updated_by=(SELECT auth.uid())
    AND EXISTS (SELECT 1 FROM public.ets_staff_members s WHERE s.user_id=(SELECT auth.uid()) AND s.enabled AND s.role IN ('admin','operator'))
    AND EXISTS (SELECT 1 FROM public.ets_raffles r WHERE r.id=raffle_id AND r.state IN ('draft','in_review','awaiting_authorization') AND NOT r.authorization_verified)
  );
CREATE POLICY ets_dossier_staff_update ON public.ets_campaign_dossiers
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.ets_staff_members s WHERE s.user_id=(SELECT auth.uid()) AND s.enabled AND s.role IN ('admin','operator'))
    AND EXISTS (SELECT 1 FROM public.ets_raffles r WHERE r.id=raffle_id AND r.state IN ('draft','in_review','awaiting_authorization') AND NOT r.authorization_verified)
  ) WITH CHECK (
    updated_by=(SELECT auth.uid())
    AND EXISTS (SELECT 1 FROM public.ets_staff_members s WHERE s.user_id=(SELECT auth.uid()) AND s.enabled AND s.role IN ('admin','operator'))
    AND EXISTS (SELECT 1 FROM public.ets_raffles r WHERE r.id=raffle_id AND r.state IN ('draft','in_review','awaiting_authorization') AND NOT r.authorization_verified)
  );

CREATE POLICY ets_dossier_documents_staff_read ON public.ets_campaign_documents
  FOR SELECT TO authenticated USING (EXISTS (
    SELECT 1 FROM public.ets_staff_members s WHERE s.user_id=(SELECT auth.uid())
    AND s.enabled AND s.role IN ('admin','operator','auditor')
  ));
CREATE POLICY ets_dossier_documents_staff_create ON public.ets_campaign_documents
  FOR INSERT TO authenticated WITH CHECK (
    uploaded_by=(SELECT auth.uid()) AND split_part(storage_path,'/',2)=(SELECT auth.uid())::text
    AND EXISTS (SELECT 1 FROM public.ets_staff_members s WHERE s.user_id=(SELECT auth.uid()) AND s.enabled AND s.role IN ('admin','operator'))
    AND EXISTS (SELECT 1 FROM public.ets_raffles r WHERE r.id=raffle_id AND r.state IN ('draft','in_review','awaiting_authorization') AND NOT r.authorization_verified)
    AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id='ets-campaign-evidence' AND o.name=storage_path)
  );

CREATE POLICY ets_dossier_reviews_staff_read ON public.ets_campaign_review_notes
  FOR SELECT TO authenticated USING (EXISTS (
    SELECT 1 FROM public.ets_staff_members s WHERE s.user_id=(SELECT auth.uid())
    AND s.enabled AND s.role IN ('admin','operator','auditor')
  ));
CREATE POLICY ets_dossier_reviews_staff_create ON public.ets_campaign_review_notes
  FOR INSERT TO authenticated WITH CHECK (
    actor_id=(SELECT auth.uid())
    AND EXISTS (SELECT 1 FROM public.ets_staff_members s WHERE s.user_id=(SELECT auth.uid()) AND s.enabled AND s.role IN ('admin','operator'))
    AND EXISTS (SELECT 1 FROM public.ets_raffles r WHERE r.id=raffle_id AND r.state IN ('draft','in_review','awaiting_authorization') AND NOT r.authorization_verified)
  );

-- Documentos privados; no crear ninguna política para rol anon.
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
 VALUES ('ets-campaign-evidence','ets-campaign-evidence',false,10485760,ARRAY['application/pdf','image/jpeg','image/png'])
 ON CONFLICT (id) DO NOTHING;

CREATE POLICY ets_v15_storage_staff_read ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id='ets-campaign-evidence' AND EXISTS (
      SELECT 1 FROM public.ets_staff_members s WHERE s.user_id=(SELECT auth.uid())
      AND s.enabled AND s.role IN ('admin','operator','auditor'))
  );
CREATE POLICY ets_v15_storage_staff_upload ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id='ets-campaign-evidence'
    AND (storage.foldername(name))[2]=(SELECT auth.uid())::text
    AND storage.extension(name) IN ('pdf','jpg','jpeg','png')
    AND EXISTS (SELECT 1 FROM public.ets_staff_members s WHERE s.user_id=(SELECT auth.uid()) AND s.enabled AND s.role IN ('admin','operator'))
    AND EXISTS (SELECT 1 FROM public.ets_raffles r
      WHERE r.id::text=(storage.foldername(name))[1]
      AND r.state IN ('draft','in_review','awaiting_authorization') AND NOT r.authorization_verified)
  );
-- Solo se permite limpiar objetos huérfanos propios SIN registro de documento;
-- los archivos registrados NO se editan ni eliminan desde el frontend.
CREATE POLICY ets_v15_storage_cleanup_orphan ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id='ets-campaign-evidence'
    AND owner_id=(SELECT auth.uid())::text
    AND (storage.foldername(name))[2]=(SELECT auth.uid())::text
    AND NOT EXISTS (SELECT 1 FROM public.ets_campaign_documents d WHERE d.storage_path=name)
    AND EXISTS (SELECT 1 FROM public.ets_staff_members s WHERE s.user_id=(SELECT auth.uid()) AND s.enabled AND s.role IN ('admin','operator'))
    AND EXISTS (SELECT 1 FROM public.ets_raffles r WHERE r.id::text=(storage.foldername(name))[1] AND r.state IN ('draft','in_review','awaiting_authorization') AND NOT r.authorization_verified)
  );
COMMIT;