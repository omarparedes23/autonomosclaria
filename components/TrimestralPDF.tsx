import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const QUARTER_LABEL: Record<string, string> = {
  Q1: '1er Trimestre (Ene–Mar)',
  Q2: '2º Trimestre (Abr–Jun)',
  Q3: '3er Trimestre (Jul–Sep)',
  Q4: '4º Trimestre (Oct–Dic)',
}

const eur = (cents: number) =>
  (cents / 100).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'

const styles = StyleSheet.create({
  page: { padding: 44, fontSize: 9, color: '#111', lineHeight: 1.4 },
  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28, paddingBottom: 16, borderBottom: '1pt solid #E0E0E0' },
  brandTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  docTitle: { fontSize: 12, color: '#444', marginBottom: 2 },
  docSub: { fontSize: 9, color: '#777' },
  profileLabel: { fontSize: 8, color: '#777', marginBottom: 2, textAlign: 'right' },
  profileValue: { fontSize: 9, textAlign: 'right' },
  // Section
  sectionTitle: { fontSize: 10, fontWeight: 'bold', marginBottom: 6, marginTop: 18, paddingBottom: 4, borderBottom: '0.5pt solid #DDDDDD', color: '#333' },
  // Summary table
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottom: '0.5pt solid #F0F0F0' },
  summaryLabel: { color: '#555' },
  summaryValue: { fontWeight: 'bold' },
  summaryTotal: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, marginTop: 4, borderTop: '1pt solid #111' },
  summaryTotalLabel: { fontWeight: 'bold', fontSize: 10 },
  summaryTotalValue: { fontWeight: 'bold', fontSize: 10 },
  // Breakdown
  brkRow: { flexDirection: 'row', paddingVertical: 4, borderBottom: '0.5pt solid #F0F0F0' },
  brkCell: { flex: 1 },
  brkHeader: { flexDirection: 'row', paddingVertical: 5, backgroundColor: '#F7F7F7', marginBottom: 2 },
  brkHeaderCell: { flex: 1, fontWeight: 'bold', color: '#444' },
  // Invoice list
  invHeader: { flexDirection: 'row', paddingVertical: 5, backgroundColor: '#F7F7F7', marginBottom: 2 },
  invHeaderCell: { fontWeight: 'bold', color: '#444' },
  invRow: { flexDirection: 'row', paddingVertical: 4, borderBottom: '0.5pt solid #F4F4F4' },
  // Footer
  footer: { marginTop: 'auto', paddingTop: 16, borderTop: '0.5pt solid #DDD', fontSize: 7, color: '#999' },
})

interface Invoice {
  id: string
  invoice_number: string
  issue_date: string
  taxable_base_cents: number
  iva_quota_cents: number
  irpf_retention_cents: number
  total_cents: number
  cl_clients?: { name?: string } | null
  cl_invoice_items?: Array<{ quantity: number; unit_price_cents: number; iva_rate: number }> | null
}

interface Profile {
  name?: string | null
  nif?: string | null
  fiscal_address?: string | null
}

interface IvaBreakdown {
  [rate: string]: { base: number; iva: number }
}

interface Props {
  quarter: string
  year: number
  profile: Profile | null
  invoices: Invoice[]
  totalBase: number
  totalIva: number
  totalIrpf: number
  ivaBreakdown: IvaBreakdown
}

export const TrimestralPDF = ({ quarter, year, profile, invoices, totalBase, totalIva, totalIrpf, ivaBreakdown }: Props) => {
  const ivaRates = Object.keys(ivaBreakdown).sort((a, b) => Number(b) - Number(a))

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brandTitle}>Claria</Text>
            <Text style={styles.docTitle}>Resumen Trimestral IVA</Text>
            <Text style={styles.docSub}>{QUARTER_LABEL[quarter] ?? quarter} — {year}</Text>
          </View>
          <View>
            <Text style={styles.profileLabel}>Autónomo</Text>
            <Text style={styles.profileValue}>{profile?.name ?? '—'}</Text>
            <Text style={[styles.profileLabel, { marginTop: 4 }]}>NIF</Text>
            <Text style={styles.profileValue}>{profile?.nif ?? '—'}</Text>
            <Text style={[styles.profileLabel, { marginTop: 4 }]}>Dirección</Text>
            <Text style={styles.profileValue}>{profile?.fiscal_address ?? '—'}</Text>
          </View>
        </View>

        {/* Summary */}
        <Text style={styles.sectionTitle}>Resumen del período</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Número de facturas</Text>
          <Text style={styles.summaryValue}>{invoices.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Base imponible total</Text>
          <Text style={styles.summaryValue}>{eur(totalBase)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>IVA repercutido total</Text>
          <Text style={styles.summaryValue}>{eur(totalIva)}</Text>
        </View>
        {totalIrpf > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>IRPF retenido total</Text>
            <Text style={styles.summaryValue}>–{eur(totalIrpf)}</Text>
          </View>
        )}
        <View style={styles.summaryTotal}>
          <Text style={styles.summaryTotalLabel}>Total facturado (con IVA{totalIrpf > 0 ? ', sin IRPF' : ''})</Text>
          <Text style={styles.summaryTotalValue}>{eur(totalBase + totalIva - totalIrpf)}</Text>
        </View>

        {/* IVA breakdown */}
        {ivaRates.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Desglose por tipo de IVA</Text>
            <View style={styles.brkHeader}>
              <Text style={[styles.brkHeaderCell, { flex: 1 }]}>Tipo IVA</Text>
              <Text style={[styles.brkHeaderCell, { flex: 2, textAlign: 'right' }]}>Base imponible</Text>
              <Text style={[styles.brkHeaderCell, { flex: 2, textAlign: 'right' }]}>Cuota IVA</Text>
            </View>
            {ivaRates.map((rate) => (
              <View key={rate} style={styles.brkRow}>
                <Text style={[styles.brkCell, { flex: 1 }]}>{rate}%</Text>
                <Text style={[styles.brkCell, { flex: 2, textAlign: 'right' }]}>{eur(ivaBreakdown[rate].base)}</Text>
                <Text style={[styles.brkCell, { flex: 2, textAlign: 'right' }]}>{eur(ivaBreakdown[rate].iva)}</Text>
              </View>
            ))}
          </>
        )}

        {/* Invoice list */}
        <Text style={styles.sectionTitle}>Listado de facturas</Text>
        <View style={styles.invHeader}>
          <Text style={[styles.invHeaderCell, { flex: 2 }]}>Nº Factura</Text>
          <Text style={[styles.invHeaderCell, { flex: 3 }]}>Cliente</Text>
          <Text style={[styles.invHeaderCell, { flex: 2 }]}>Fecha</Text>
          <Text style={[styles.invHeaderCell, { flex: 2, textAlign: 'right' }]}>Base</Text>
          <Text style={[styles.invHeaderCell, { flex: 2, textAlign: 'right' }]}>IVA</Text>
          <Text style={[styles.invHeaderCell, { flex: 2, textAlign: 'right' }]}>Total</Text>
        </View>
        {invoices.map((inv) => (
          <View key={inv.id} style={styles.invRow}>
            <Text style={{ flex: 2 }}>{inv.invoice_number}</Text>
            <Text style={{ flex: 3 }}>{inv.cl_clients?.name ?? '—'}</Text>
            <Text style={{ flex: 2 }}>{new Date(inv.issue_date).toLocaleDateString('es-ES')}</Text>
            <Text style={{ flex: 2, textAlign: 'right' }}>{eur(inv.taxable_base_cents)}</Text>
            <Text style={{ flex: 2, textAlign: 'right' }}>{eur(inv.iva_quota_cents)}</Text>
            <Text style={{ flex: 2, textAlign: 'right' }}>{eur(inv.total_cents)}</Text>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Este documento es un resumen orientativo. Consúltelo con su gestor para la presentación oficial del Modelo 303.
          </Text>
          <Text style={{ marginTop: 4 }}>Generado por Claria · {new Date().toLocaleDateString('es-ES')}</Text>
        </View>

      </Page>
    </Document>
  )
}
