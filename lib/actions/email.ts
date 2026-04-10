'use server'

import { Resend } from 'resend';
import { createClient } from '../supabase/server';
import { getPdfBuffer } from '../pdf';

const FROM_ADDRESS = 'Claria <noreply@claria.es>'

export async function sendWelcomeEmail(email: string, name: string) {
  const resend = new Resend(process.env.RESEND_API_KEY!)
  const displayName = name?.split(' ')[0] || 'autónomo'

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bienvenido a Claria</title>
</head>
<body style="margin:0;padding:0;background:#f8f8f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #ebebeb;border-radius:12px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:#080808;padding:32px 40px;">
              <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Claria.</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 24px;font-size:22px;font-weight:600;color:#111;letter-spacing:-0.3px;">
                Bienvenido, ${displayName} 👋
              </p>
              <p style="margin:0 0 16px;font-size:15px;color:#555;line-height:1.6;">
                Tu cuenta en Claria ya está activa. Ahora puedes crear facturas profesionales,
                controlar tu IVA trimestral y tener tus cuentas al día — sin gestoría.
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:#555;line-height:1.6;">
                El siguiente paso es completar tu perfil fiscal para que aparezca en tus facturas.
              </p>
              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#080808;border-radius:100px;padding:12px 28px;">
                    <a href="https://claria.es/dashboard/onboarding" style="color:#ffffff;text-decoration:none;font-size:14px;font-weight:500;">
                      Completar perfil →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f0f0f0;">
              <p style="margin:0;font-size:12px;color:#aaa;">
                Claria © 2026 — Facturación para autónomos españoles
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: [email],
      subject: `Bienvenido a Claria, ${displayName}`,
      html,
    })
  } catch {
    // Welcome email is non-blocking — log silently
    console.error('[claria] Failed to send welcome email to', email)
  }
}

export async function dispatchInvoiceEmail(invoiceId: string) {
  const resend = new Resend(process.env.RESEND_API_KEY!);
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
