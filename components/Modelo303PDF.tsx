import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const QUARTER_PERIODO: Record<string, string> = {
  Q1: '1T',
  Q2: '2T',
  Q3: '3T',
  Q4: '4T',
}

const QUARTER_LABEL: Record<string, string> = {
  Q1: '1er Trimestre (Enero – Marzo)',
  Q2: '2º Trimestre (Abril – Junio)',
  Q3: '3er Trimestre (Julio – Septiembre)',
  Q4: '4º Trimestre (Octubre – Diciembre)',
}

const eur = (cents: number) =>
  (cents / 100).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'

const styles = StyleSheet.create({
  page: { padding: 44, fontSize: 9, color: '#111', lineHeight: 1.5, fontFamily: 'Helvetica' },

  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, paddingBottom: 16, borderBottom: '1.5pt solid #111' },
  brandCol: { flex: 1 },
  brandTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  formTitle: { fontSize: 11, color: '#333', marginBottom: 1 },
  formSub: { fontSize: 8, color: '#666' },
  infoCol: { flex: 1, alignItems: 'flex-end' },
  infoRow: { flexDirection: 'row', gap: 8, marginBottom: 3 },
  infoLabel: { fontSize: 8, color: '#666', textAlign: 'right', minWidth: 60 },
  infoValue: { fontSize: 9, fontWeight: 'bold', textAlign: 'right' },

  // Section header
  sectionTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 14,
    marginBottom: 0,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Casilla rows
  casillaRow: { flexDirection: 'row', borderBottom: '0.5pt solid #E8E8E8', paddingVertical: 5, paddingHorizontal: 8 },
  casillaAlt: { backgroundColor: '#FAFAFA' },
  casillaNum: { width: 32, fontSize: 8, color: '#888', fontWeight: 'bold' },
  casillaDesc: { flex: 1, fontSize: 9 },
  casillaBase: { width: 80, textAlign: 'right', fontSize: 9 },
  casillaCuota: { width: 80, textAlign: 'right', fontSize: 9, fontWeight: 'bold' },

  // Column headers
  colHeader: { flexDirection: 'row', paddingVertical: 4, paddingHorizontal: 8, backgroundColor: '#F0F0F0', borderBottom: '0.5pt solid #DDD' },
  colHeaderNum: { width: 32, fontSize: 8, color: '#555' },
  colHeaderDesc: { flex: 1, fontSize: 8, color: '#555' },
  colHeaderBase: { width: 80, textAlign: 'right', fontSize: 8, color: '#555' },
  colHeaderCuota: { width: 80, textAlign: 'right', fontSize: 8, color: '#555' },

  // Result box
  resultBox: { marginTop: 14, border: '1pt solid #111', borderRadius: 4 },
  resultTitle: { fontSize: 8, fontWeight: 'bold', color: '#fff', backgroundColor: '#111', paddingHorizontal: 8, paddingVertical: 4, letterSpacing: 0.5, textTransform: 'uppercase' },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8, paddingVertical: 6 },
  resultLabel: { fontSize: 9 },
  resultValue: { fontSize: 11, fontWeight: 'bold' },
  resultPositive: { color: '#B91C1C' },
  resultNegative: { color: '#15803D' },
  resultBadge: { fontSize: 8, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 3, alignSelf: 'flex-start', marginLeft: 'auto' },
  badgeIngresar: { backgroundColor: '#FEE2E2', color: '#B91C1C' },
  badgeDevolver: { backgroundColor: '#DCFCE7', color: '#15803D' },
  resultDivider: { height: '0.5pt', backgroundColor: '#E8E8E8', marginHorizontal: 8 },

  // Footer
  footer: { marginTop: 'auto', paddingTop: 12, borderTop: '0.5pt solid #DDD', fontSize: 7, color: '#999', lineHeight: 1.6 },
  footerWarning: { fontSize: 7, color: '#B45309', backgroundColor: '#FEF3C7', padding: 6, borderRadius: 3, marginBottom: 8, lineHeight: 1.6 },
})

interface Profile {
  name?: string | null
  nif?: string | null
  fiscal_address?: string | null
}

interface Casillas {
  // IVA devengado
  c01_base21: number
  c02_cuota21: number
  c06_base10: number
  c07_cuota10: number
  c11_base4: number
  c12_cuota4: number
  c27_totalDevengado: number
  // IVA deducible
  c28_baseDeducible: number
  c29_cuotaSoportada: number
  // Resultado
  c46_diferencia: number
  c69_resultado: number
}

interface Props {
  quarter: string
  year: number
  profile: Profile | null
  casillas: Casillas
}

export const Modelo303PDF = ({ quarter, year, profile, casillas }: Props) => {
  const isPositive = casillas.c69_resultado >= 0

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.brandCol}>
            <Text style={styles.brandTitle}>MODELO 303</Text>
            <Text style={styles.formTitle}>IVA — Autoliquidación</Text>
            <Text style={styles.formSub}>{QUARTER_LABEL[quarter] ?? quarter} · Ejercicio {year}</Text>
          </View>
          <View style={styles.infoCol}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ejercicio</Text>
              <Text style={styles.infoValue}>{year}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Período</Text>
              <Text style={styles.infoValue}>{QUARTER_PERIODO[quarter] ?? quarter}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>NIF</Text>
              <Text style={styles.infoValue}>{profile?.nif ?? '—'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nombre</Text>
              <Text style={styles.infoValue}>{profile?.name ?? '—'}</Text>
            </View>
            {profile?.fiscal_address && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Domicilio</Text>
                <Text style={styles.infoValue}>{profile.fiscal_address}</Text>
              </View>
            )}
          </View>
        </View>

        {/* IVA Devengado */}
        <Text style={styles.sectionTitle}>IVA Devengado (Repercutido)</Text>
        <View style={styles.colHeader}>
          <Text style={styles.colHeaderNum}>Casilla</Text>
          <Text style={styles.colHeaderDesc}>Concepto</Text>
          <Text style={styles.colHeaderBase}>Base imponible</Text>
          <Text style={styles.colHeaderCuota}>Cuota IVA</Text>
        </View>

        {[
          { num: '01/02', desc: 'Operaciones corrientes al 21%', base: casillas.c01_base21, cuota: casillas.c02_cuota21 },
          { num: '06/07', desc: 'Operaciones corrientes al 10%', base: casillas.c06_base10, cuota: casillas.c07_cuota10 },
          { num: '11/12', desc: 'Operaciones corrientes al 4%',  base: casillas.c11_base4,  cuota: casillas.c12_cuota4 },
        ].map((row, i) => (
          <View key={row.num} style={[styles.casillaRow, i % 2 === 1 ? styles.casillaAlt : {}]}>
            <Text style={styles.casillaNum}>{row.num}</Text>
            <Text style={styles.casillaDesc}>{row.desc}</Text>
            <Text style={styles.casillaBase}>{eur(row.base)}</Text>
            <Text style={styles.casillaCuota}>{eur(row.cuota)}</Text>
          </View>
        ))}

        <View style={[styles.casillaRow, { backgroundColor: '#F5F5F5' }]}>
          <Text style={styles.casillaNum}>27</Text>
          <Text style={[styles.casillaDesc, { fontWeight: 'bold' }]}>Total cuota devengada</Text>
          <Text style={styles.casillaBase}></Text>
          <Text style={[styles.casillaCuota, { fontWeight: 'bold', fontSize: 10 }]}>{eur(casillas.c27_totalDevengado)}</Text>
        </View>

        {/* IVA Deducible */}
        <Text style={styles.sectionTitle}>IVA Deducible (Soportado)</Text>
        <View style={styles.colHeader}>
          <Text style={styles.colHeaderNum}>Casilla</Text>
          <Text style={styles.colHeaderDesc}>Concepto</Text>
          <Text style={styles.colHeaderBase}>Base imponible</Text>
          <Text style={styles.colHeaderCuota}>Cuota IVA</Text>
        </View>

        <View style={styles.casillaRow}>
          <Text style={styles.casillaNum}>28/29</Text>
          <Text style={styles.casillaDesc}>Adquisiciones corrientes (gastos deducibles)</Text>
          <Text style={styles.casillaBase}>{eur(casillas.c28_baseDeducible)}</Text>
          <Text style={styles.casillaCuota}>{eur(casillas.c29_cuotaSoportada)}</Text>
        </View>

        {/* Resultado */}
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Resultado</Text>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Casilla 46 — Diferencia (IVA devengado – IVA deducible)</Text>
            <Text style={[styles.casillaCuota, { width: 90 }]}>{eur(casillas.c46_diferencia)}</Text>
          </View>

          <View style={styles.resultDivider} />

          <View style={[styles.resultRow, { paddingVertical: 10 }]}>
            <View>
              <Text style={[styles.resultLabel, { fontSize: 10, fontWeight: 'bold' }]}>
                Casilla 69 — Resultado final
              </Text>
              <Text style={[styles.resultLabel, { color: '#666', marginTop: 2 }]}>
                {isPositive ? 'A ingresar en Hacienda' : 'A devolver por Hacienda'}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.resultValue, isPositive ? styles.resultPositive : styles.resultNegative]}>
                {eur(Math.abs(casillas.c69_resultado))}
              </Text>
              <View style={[styles.resultBadge, isPositive ? styles.badgeIngresar : styles.badgeDevolver]}>
                <Text>{isPositive ? 'A INGRESAR' : 'A DEVOLVER'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerWarning}>
            <Text>
              ⚠ Documento generado por Claria con carácter orientativo. Verifique los datos con su gestor antes de presentar el Modelo 303 oficial.
            </Text>
          </View>
          <Text>Generado por Claria · {new Date().toLocaleDateString('es-ES')} · {profile?.name ?? ''} · {profile?.nif ?? ''}</Text>
        </View>

      </Page>
    </Document>
  )
}
