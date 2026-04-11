CREATE TABLE IF NOT EXISTS public.cl_quarterly_declarations (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year         INTEGER      NOT NULL,
  quarter      TEXT         NOT NULL CHECK (quarter IN ('Q1','Q2','Q3','Q4')),
  declared_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  notes        TEXT,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE (user_id, year, quarter)
);

ALTER TABLE public.cl_quarterly_declarations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own quarterly declarations"
  ON public.cl_quarterly_declarations
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
