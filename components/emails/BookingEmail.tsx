import * as React from 'react';

interface BookingEmailProps {
  customerName: string;
  date: string;
  time: string;
  bookingUrl: string;
}

export const BookingEmail: React.FC<BookingEmailProps> = ({
  customerName,
  date,
  time,
  bookingUrl,
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
    <h1 style={{ color: '#000', fontSize: '24px' }}>Booking Confirmed! 🚗</h1>
    
    <p>Hi {customerName},</p>
    
    <p>Your car detailing appointment is locked in. We look forward to seeing you.</p>
    
    <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', margin: '20px 0' }}>
      <p style={{ margin: '5px 0' }}><strong>Date:</strong> {date}</p>
      <p style={{ margin: '5px 0' }}><strong>Time:</strong> {time}</p>
      <p style={{ margin: '5px 0' }}><strong>Service:</strong> Standard Detail ($10 Deposit)</p>
    </div>

    <p>Need to reschedule or cancel? You can manage your booking directly via the link below:</p>

    <a 
      href={bookingUrl}
      style={{
        display: 'inline-block',
        background: '#000',
        color: '#fff',
        padding: '12px 24px',
        borderRadius: '5px',
        textDecoration: 'none',
        fontWeight: 'bold',
        marginTop: '10px'
      }}
    >
      Manage Booking / Cancel
    </a>

    <div style={{ marginTop: '30px', fontSize: '12px', color: '#666', borderTop: '1px solid #eee', paddingTop: '20px' }}>
      <p><strong>Cancellation Policy:</strong></p>
      <p>
        • Cancellations made <strong>24 hours</strong> in advance are refunded (minus $1 processing fee).<br/>
        • Cancellations made less than 24 hours in advance are <strong>non-refundable</strong>.
      </p>
      <p>Have questions? Reply to this email or call us at (555) 123-4567.</p>
    </div>
  </div>
);

export default BookingEmail;