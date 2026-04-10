export const runtime = 'nodejs'; // Strictly bypass Edge restrictions for PDF engine

import { createClient } from '@/lib/supabase/server';
import { getPdfBuffer } from '@/lib/pdf';

export async function GET(request: Request, props: { params: Promise<{ invoiceId: string }> }) {
  const params = await props.params;
  const invoiceId = params.invoiceId;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { data: invoice } = await supabase
    .from('cl_invoices')
    .select(`
      *,
      cl_clients (*),
      cl_invoice_items (*),
      cl_users (*)
    `)
    .eq('id', invoiceId)
    .eq('user_id', user.id)
    .single();

  if (!invoice) return new Response('Not Found', { status: 404 });

  try {
    const buffer = await getPdfBuffer(invoice);
    return new Response(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="factura-${invoice.invoice_number}.pdf"`
      },
    });
  } catch (err: any) {
    return new Response(`PDF generation failed: ${err.message}`, { status: 500 });
  }
}
