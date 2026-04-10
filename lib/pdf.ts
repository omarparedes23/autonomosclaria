import { renderToStream } from '@react-pdf/renderer';
import { InvoicePDF } from '@/components/InvoicePDF';
import React from 'react';

// Converts the React component to a native Node Buffer for APIs that require it (like Resend).
export async function getPdfBuffer(invoice: any): Promise<Buffer> {
  const stream = await renderToStream(React.createElement(InvoicePDF, { invoice }) as any);
  
  return new Promise((resolve, reject) => {
    const buffers: Buffer[] = [];
    stream.on('data', data => buffers.push(data));
    stream.on('end', () => resolve(Buffer.concat(buffers)));
    stream.on('error', reject);
  });
}
