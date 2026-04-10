import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#FFFFFF', padding: 40 },
  header: { fontSize: 24, marginBottom: 20, fontWeight: 'bold' },
  section: { marginBottom: 10, paddingBottom: 10, flexGrow: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  bold: { fontWeight: 'bold' }
});

export const InvoicePDF = ({ invoice }: { invoice: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={[styles.row, { marginBottom: 30, paddingBottom: 10, borderBottom: '1px solid #EEEEEE' }]}>
        <View style={{ width: '50%' }}>
          {invoice.cl_users?.logo_url && (
            <Image src={invoice.cl_users.logo_url} style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: 10 }} />
          )}
          <Text style={styles.bold}>{invoice.cl_users?.name || 'Emisor No Configurado'}</Text>
          <Text style={{ fontSize: 10, marginTop: 4, color: '#555' }}>NIF: {invoice.cl_users?.nif || 'Sin NIF'}</Text>
          <Text style={{ fontSize: 10, marginTop: 4, color: '#555' }}>{invoice.cl_users?.fiscal_address || 'Sin Dirección'}</Text>
        </View>
        <View style={{ width: '50%', alignItems: 'flex-end' }}>
          <Text style={[styles.header, { marginBottom: 5 }]}>Factura {invoice.invoice_number}</Text>
          <Text style={{ fontSize: 10, color: '#555' }}>Fecha Emisión: {new Date(invoice.issue_date).toLocaleDateString('es-ES')}</Text>
        </View>
      </View>
      
      <View style={[styles.section, { marginBottom: 30 }]}>
        <Text style={styles.bold}>Facturado a:</Text>
        <Text style={{ marginTop: 5 }}>{invoice.cl_clients?.name}</Text>
        <Text style={{ fontSize: 10, marginTop: 4, color: '#555' }}>NIF: {invoice.cl_clients?.nif}</Text>
        <Text style={{ fontSize: 10, marginTop: 4, color: '#555' }}>{invoice.cl_clients?.address}</Text>
      </View>

      <View style={{ marginTop: 30, marginBottom: 30 }}>
        {invoice.cl_invoice_items?.map((item: any) => (
          <View key={item.id} style={styles.row}>
            <Text>{item.description} (x{item.quantity})</Text>
            <Text>{(item.unit_price_cents / 100).toFixed(2)}€</Text>
          </View>
        ))}
      </View>

      <View style={{ borderTop: '1px solid #000', paddingTop: 10 }}>
        <View style={styles.row}>
          <Text>Base Imponible</Text>
          <Text>{(invoice.taxable_base_cents / 100).toFixed(2)}€</Text>
        </View>
        <View style={styles.row}>
          <Text>Cuota IVA</Text>
          <Text>{(invoice.iva_quota_cents / 100).toFixed(2)}€</Text>
        </View>
        <View style={styles.row}>
          <Text>Retención IRPF</Text>
          <Text>-{(invoice.irpf_retention_cents / 100).toFixed(2)}€</Text>
        </View>
        <View style={[styles.row, { marginTop: 10, borderTop: '1px solid #CCC', paddingTop: 10 }]}>
          <Text style={styles.bold}>Total a Pagar</Text>
          <Text style={styles.bold}>{(invoice.total_cents / 100).toFixed(2)}€</Text>
        </View>
      </View>
    </Page>
  </Document>
);
