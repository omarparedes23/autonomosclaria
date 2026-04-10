-- Invoice Atomic Numeration

CREATE TABLE IF NOT EXISTS cl_invoice_sequences (
  user_id UUID REFERENCES cl_users(id) ON DELETE CASCADE,
  year INTEGER,
  current_val INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, year)
);

-- Note: No RLS on sequences table natively because users shouldn't query it directly; 
-- it's meant to be modified via the trusted SECURITY DEFINER function below or restricted to authenticated usage.

ALTER TABLE cl_invoice_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their sequences" ON cl_invoice_sequences USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION generate_invoice_number(p_user_id UUID) 
RETURNS TEXT 
SECURITY INVOKER
AS $$
DECLARE
  v_year INTEGER := extract(year from current_date);
  v_next_val INTEGER;
  v_number TEXT;
BEGIN
  -- Insert sequence row if not exists
  INSERT INTO cl_invoice_sequences (user_id, year, current_val)
  VALUES (p_user_id, v_year, 0)
  ON CONFLICT (user_id, year) DO NOTHING;

  -- Lock row and update
  UPDATE cl_invoice_sequences
  SET current_val = current_val + 1
  WHERE user_id = p_user_id AND year = v_year
  RETURNING current_val INTO v_next_val;

  -- Format: YYYY-001
  v_number := v_year::TEXT || '-' || lpad(v_next_val::TEXT, 3, '0');
  
  RETURN v_number;
END;
$$ LANGUAGE plpgsql;
