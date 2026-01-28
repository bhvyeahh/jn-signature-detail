import * as React from 'react';

interface CustomerCancelEmailProps {
  customerName: string;
  date: string;
  refundAmount: string; // e.g., "$9.00" or "$0.00"
}

export const CustomerCancelEmail: React.FC<CustomerCancelEmailProps> = ({
  customerName,
  date,
  refundAmount,
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
    <h1 style={{ color: '#d32f2f', fontSize: '24px' }}>Booking Cancelled ❌</h1>
    <p>Hi {customerName},</p>
    <p>Your appointment for <strong>{date}</strong> has been cancelled as requested.</p>
    
    <div style={{ background: '#fef2f2', padding: '15px', borderRadius: '8px', margin: '20px 0', border: '1px solid #fecaca' }}>
      <p style={{ margin: '5px 0', color: '#991b1b' }}><strong>Refund Processed:</strong> {refundAmount}</p>
      <p style={{ fontSize: '12px', color: '#7f1d1d' }}>Please allow 5-10 business days for the funds to appear in your account.</p>
    </div>

    <p>We hope to see you another time!</p>
  </div>
);

export default CustomerCancelEmail;