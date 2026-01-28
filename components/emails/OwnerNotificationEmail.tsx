import * as React from 'react';

interface OwnerNotificationEmailProps {
  type: 'new' | 'cancelled';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  time: string;
  price: string;
}

export const OwnerNotificationEmail: React.FC<OwnerNotificationEmailProps> = ({
  type,
  customerName,
  customerEmail,
  customerPhone,
  date,
  time,
  price,
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
    {type === 'new' ? (
      <h1 style={{ color: '#16a34a' }}>💰 New Booking ($10)</h1>
    ) : (
      <h1 style={{ color: '#d32f2f' }}>❌ Booking Cancelled</h1>
    )}
    
    <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '8px' }}>
      <p><strong>Customer:</strong> {customerName}</p>
      <p><strong>Date:</strong> {date} at {time}</p>
      <p><strong>Phone:</strong> {customerPhone}</p>
      <p><strong>Email:</strong> {customerEmail}</p>
      <p><strong>Amount:</strong> {price}</p>
    </div>
  </div>
);

export default OwnerNotificationEmail;