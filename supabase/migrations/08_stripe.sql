ALTER TABLE public.cl_users
  ADD COLUMN IF NOT EXISTS plan                   TEXT        NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS stripe_customer_id     TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS plan_expires_at        TIMESTAMPTZ;
