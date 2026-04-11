-- Gastos deducibles
CREATE TABLE IF NOT EXISTS cl_gastos (
  id                    UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID    REFERENCES cl_users(id) ON DELETE CASCADE,
  fecha                 DATE    NOT NULL,
  descripcion           TEXT    NOT NULL,
  categoria             TEXT    NOT NULL CHECK (
    categoria IN (
      'oficina','software','hardware','telefono','transporte',
      'dietas','formacion','publicidad','suministros','autonomo','otros'
    )
  ),
  importe_cents         INTEGER NOT NULL,
  base_imponible_cents  INTEGER NOT NULL,
  iva_soportado_cents   INTEGER NOT NULL,
  iva_rate              INTEGER NOT NULL DEFAULT 21,
  deducible_percent     INTEGER NOT NULL DEFAULT 100,
  justificacion         TEXT,
  created_at            TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE cl_gastos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own gastos"
  ON cl_gastos FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
