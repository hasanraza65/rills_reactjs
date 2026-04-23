import React from 'react';
import { InvoiceData } from '../../types/api/invoice';

interface InvoicePDFTemplateProps {
  invoice: InvoiceData;
  schoolName?: string;
  schoolAddress?: string;
  schoolContact?: string;
}

export const InvoicePDFTemplate: React.FC<InvoicePDFTemplateProps> = ({ 
  invoice, 
  schoolName = "RILLS", 
  schoolAddress = "Main Campus, Lahore, Pakistan",
  schoolContact = "+92 300 1234567"
}) => {
  const firstItem = invoice.items?.[0];
  const firstStudent = firstItem?.student;

  return (
    <div style={{ padding: '40px', backgroundColor: '#ffffff', color: '#1e293b', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', border: '1px solid #f1f5f9' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '4px solid #0ea5e9', paddingBottom: '32px', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#0284c7', margin: '0 0 4px 0', letterSpacing: '-0.05em' }}>{schoolName}</h1>
          <p style={{ fontSize: '14px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Fee Voucher</p>
          <div style={{ marginTop: '16px', fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>
            <p style={{ margin: '2px 0' }}>{schoolAddress}</p>
            <p style={{ margin: '2px 0' }}>{schoolContact}</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9', textAlign: 'left', minWidth: '220px', display: 'inline-block' }}>
            <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px 0' }}>Invoice Number</p>
            <p style={{ fontSize: '20px', fontWeight: 900, color: '#1e293b', margin: 0 }}>#{invoice.invoice_no || invoice.id}</p>
            <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 2px 0' }}>Issue Date</p>
                <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155', margin: 0 }}>{invoice.issue_date || 'N/A'}</p>
              </div>
              <div>
                <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 2px 0' }}>Due Date</p>
                <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155', margin: 0 }}>{invoice.due_date || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '48px' }}>
        <div>
          <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', borderBottom: '1px solid #f0f9ff', paddingBottom: '4px' }}>Father / Guardian Details</p>
          <div style={{ lineHeight: '1.5' }}>
            <p style={{ fontSize: '18px', fontWeight: 900, color: '#1e293b', margin: '0 0 4px 0' }}>{invoice.parent?.father_name || 'N/A'}</p>
            <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, margin: 0 }}>Occupation: {invoice.parent?.father_occupation || 'N/A'}</p>
            <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, margin: 0 }}>CNIC: {invoice.parent?.father_cnic || 'N/A'}</p>
            <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, margin: 0 }}>Contact: {invoice.parent?.father_contact_no || 'N/A'}</p>
          </div>
        </div>
        <div>
          <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', borderBottom: '1px solid #f0f9ff', paddingBottom: '4px' }}>Mother Details</p>
          <div style={{ lineHeight: '1.5' }}>
            <p style={{ fontSize: '18px', fontWeight: 900, color: '#1e293b', margin: '0 0 4px 0' }}>{invoice.parent?.mother_name || 'N/A'}</p>
            <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, margin: 0 }}>Occupation: {invoice.parent?.mother_occupation || 'N/A'}</p>
            <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, margin: 0 }}>CNIC: {invoice.parent?.mother_cnic || 'N/A'}</p>
            <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, margin: 0 }}>Contact: {invoice.parent?.mother_contact_no || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '48px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
        <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Address</p>
        <p style={{ fontSize: '14px', color: '#334155', margin: 0 }}>{invoice.parent?.address || 'No Address Provided'}</p>
      </div>

      {/* Items Table */}
      <div style={{ marginBottom: '48px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', borderTopLeftRadius: '16px' }}>Student / Description</th>
              <th style={{ padding: '16px', textAlign: 'right', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total</th>
              <th style={{ padding: '16px', textAlign: 'right', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Paid</th>
              <th style={{ padding: '16px', textAlign: 'right', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', borderTopRightRadius: '16px' }}>Remaining</th>
            </tr>
          </thead>
          <tbody style={{ borderLeft: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
            {invoice.items?.map((item: any, index: number) => (
              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                <td style={{ padding: '20px 16px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 900, color: '#1e293b', margin: '0 0 4px 0' }}>{item.head_name}</p>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <p style={{ fontSize: '10px', color: '#0ea5e9', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{item.student?.name}</p>
                    <span style={{ fontSize: '10px', color: '#cbd5e1' }}>•</span>
                    <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>ADM: {item.student?.admission_no}</p>
                  </div>
                </td>
                <td style={{ padding: '20px 16px', textAlign: 'right', fontSize: '14px', fontWeight: 'bold', color: '#334155' }}>Rs. {Number(item.total_amount || item.amount).toLocaleString()}</td>
                <td style={{ padding: '20px 16px', textAlign: 'right', fontSize: '14px', fontWeight: 'bold', color: '#059669' }}>Rs. {Number(item.paid || 0).toLocaleString()}</td>
                <td style={{ padding: '20px 16px', textAlign: 'right', fontSize: '14px', fontWeight: 900, color: '#e11d48' }}>Rs. {Number(item.remaining || (item.total_amount - (item.paid || 0))).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: '#f0f9ff' }}>
              <td style={{ padding: '24px', fontSize: '16px', fontWeight: 900, color: '#0369a1', borderBottomLeftRadius: '16px' }}>Grand Total Payable</td>
              <td colSpan={3} style={{ padding: '24px', textAlign: 'right', borderBottomRightRadius: '16px' }}>
                <span style={{ fontSize: '24px', fontWeight: 900, color: '#0284c7', textDecoration: 'underline', textDecorationColor: '#f0f9ff', textDecorationThickness: '4px', textUnderlineOffset: '8px' }}>
                  Rs. {Number(invoice.total_amount).toLocaleString()}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '80px', paddingTop: '40px', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Terms & Conditions</p>
          <ul style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 500, lineHeight: '1.5', listStyleType: 'none', padding: 0, margin: 0 }}>
            <li>• Please pay the fees on or before the due date.</li>
            <li>• Late payment may attract a surcharge as per school policy.</li>
            <li>• This is a computer-generated voucher and does not require a signature.</li>
          </ul>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '160px', height: '2px', backgroundColor: '#e2e8f0', marginBottom: '8px' }}></div>
            <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Accounts Department</p>
          </div>
        </div>
      </div>
    </div>
  );
};
