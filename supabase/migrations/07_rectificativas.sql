ALTER TABLE public.cl_invoices
  ADD COLUMN IF NOT EXISTS rectificative          BOOLEAN  NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS original_invoice_id    UUID     REFERENCES public.cl_invoices(id),
  ADD COLUMN IF NOT EXISTS motivo_rectificacion   TEXT;
