import * as React from 'react';
import { Html, Head, Body, Container, Section, Text, Heading, Hr, Row, Column, Button } from '@react-email/components';

interface BookingEmailProps {
  customerName: string;
  date: string;
  time: string;
  serviceName: string;
  totalPrice: string;
  depositPaid: string;
  remainingDue: string;
  location: string;
  bookingUrl: string; // <--- New Prop
}

export default function BookingEmail({
  customerName, date, time, serviceName, totalPrice, depositPaid, remainingDue, location, bookingUrl
}: BookingEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={brand}>JN SIGNATURE DETAILING</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={h1}>Booking Confirmed</Heading>
            <Text style={text}>Hi {customerName},</Text>
            <Text style={text}>
              Your appointment has been secured. We have received your <strong>{depositPaid} deposit</strong>.
            </Text>

            <Section style={box}>
              <Row>
                <Column><Text style={label}>Service:</Text></Column>
                <Column><Text style={value}>{serviceName}</Text></Column>
              </Row>
              <Row>
                <Column><Text style={label}>Date:</Text></Column>
                <Column><Text style={value}>{date}</Text></Column>
              </Row>
              <Row>
                <Column><Text style={label}>Time:</Text></Column>
                <Column><Text style={value}>{time}</Text></Column>
              </Row>
              <Row>
                <Column><Text style={label}>Location:</Text></Column>
                <Column><Text style={value}>{location}</Text></Column>
              </Row>
            </Section>

            <Hr style={hr} />

            <Section>
              <Row>
                <Column><Text style={totalLabel}>Total Estimate:</Text></Column>
                <Column><Text style={totalValue}>{totalPrice}</Text></Column>
              </Row>
              <Row>
                <Column><Text style={depositLabel}>Deposit Paid:</Text></Column>
                <Column><Text style={depositValue}>-{depositPaid}</Text></Column>
              </Row>
              <Row style={{ marginTop: '10px' }}>
                <Column><Text style={dueLabel}>REMAINING DUE:</Text></Column>
                <Column><Text style={dueValue}>{remainingDue}</Text></Column>
              </Row>
            </Section>

            <Section style={{ textAlign: 'center' as const, marginTop: '30px' }}>
              <Button style={button} href={bookingUrl}>
                Manage Booking / Cancel
              </Button>
              <Text style={{ ...footer, marginTop: '10px' }}>
                Click above to view details or cancel your appointment.
              </Text>
            </Section>

            <Text style={footer}>
              Policy: Cancellations above 24h refund minus $2 fee. Under 24h non-refundable.
              <br/>Melbourne, AU | (555) 987-6543
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = { backgroundColor: '#000', fontFamily: 'sans-serif' };
const container = { margin: '0 auto', padding: '20px 0 48px', maxWidth: '600px' };
const header = { padding: '20px', textAlign: 'center' as const };
const brand = { color: '#dc2626', fontSize: '24px', fontWeight: 'bold', margin: '0' };
const content = { backgroundColor: '#111', padding: '40px', borderRadius: '10px', border: '1px solid #333' };
const h1 = { color: '#fff', fontSize: '24px', marginBottom: '20px', textAlign: 'center' as const };
const text = { color: '#ccc', fontSize: '16px', lineHeight: '24px' };
const box = { padding: '20px', backgroundColor: '#1a1a1a', borderRadius: '8px', margin: '20px 0' };
const label = { color: '#888', fontSize: '14px', fontWeight: 'bold' };
const value = { color: '#fff', fontSize: '14px', textAlign: 'right' as const };
const hr = { borderColor: '#333', margin: '20px 0' };
const totalLabel = { color: '#888', fontSize: '14px' };
const totalValue = { color: '#fff', fontSize: '14px', textAlign: 'right' as const };
const depositLabel = { color: '#dc2626', fontSize: '14px' };
const depositValue = { color: '#dc2626', fontSize: '14px', textAlign: 'right' as const };
const dueLabel = { color: '#fff', fontSize: '16px', fontWeight: 'bold' };
const dueValue = { color: '#fff', fontSize: '18px', fontWeight: 'bold', textAlign: 'right' as const };
const footer = { color: '#666', fontSize: '12px', marginTop: '30px', textAlign: 'center' as const };
const button = { 
  backgroundColor: '#dc2626', 
  color: '#fff', 
  padding: '12px 24px', 
  borderRadius: '5px', 
  fontWeight: 'bold', 
  textDecoration: 'none',
  display: 'inline-block',
  fontSize: '16px'
};