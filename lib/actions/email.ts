'use server'

import { Resend } from 'resend';
import { createClient } from '../supabase/server';
import { getPdfBuffer } from '../pdf';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function dispatchInvoiceEmail(invoiceId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

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

  if (!invoice) throw new Error('Invoice Not Found');
  if (!invoice.cl_clients.email) throw new Error('Client has no email configured');

  try {
    const buffer = await getPdfBuffer(invoice);

    const { error } = await resend.emails.send({
      from: 'Claria Invoicing <facturas@tu-dominio.com>', // Replace appropriately based on Resend configuration
      to: [invoice.cl_clients.email],
      subject: `Nueva Factura ${invoice.invoice_number} - ${invoice.cl_clients.name}`,
      text: `Hola,\n\nAdjunta encontrarás la factura ${invoice.invoice_number} requerida.\n\nAtentamente.`,
      attachments: [
        {
          filename: `factura-${invoice.invoice_number}.pdf`,
          content: buffer
        }
      ]
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true };

  } catch (e: any) {
    return { error: `Dispatch failed: ${e.message}` }
  }
}
