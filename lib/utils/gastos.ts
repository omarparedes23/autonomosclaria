export const DEDUCIBLE_DEFAULTS: Record<string, number> = {
  oficina:      100,
  software:     100,
  hardware:     100,
  telefono:      50,
  transporte:   100,
  dietas:        50,
  formacion:    100,
  publicidad:   100,
  suministros:   50,
  autonomo:     100,
  otros:        100,
}

export function getDeducibleDefault(categoria: string): number {
  return DEDUCIBLE_DEFAULTS[categoria] ?? 100
}
