import * as React from 'react';
import { Html, Head, Body, Container, Section, Text, Heading, Hr, Row, Column } from '@react-email/components';

interface OwnerNotificationEmailProps {
  type: 'new' | 'cancelled'; // Added this to fix the ts(2353) error
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  time: string;
  serviceName: string;
  isMobile: boolean;
  totalPrice: string;
  remainingDue: string;
}

export default function OwnerNotificationEmail({
  type,
  customerName,
  customerEmail,
  customerPhone,
  date,
  time,
  serviceName,
  isMobile,
  totalPrice,
  remainingDue,
}: OwnerNotificationEmailProps) {
  const isCancelled = type === 'cancelled';

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Dynamic Header based on status */}
          <Section style={{ 
            ...header, 
            backgroundColor: isCancelled ? '#7f1d1d' : '#dc2626' 
          }}>
            <Heading style={brand}>
              {isCancelled ? 'BOOKING CANCELLED ❌' : 'NEW BOOKING ALERT 💰'}
            </Heading>
          </Section>

          <Section style={content}>
            <Heading style={h2}>
              {isCancelled ? 'Deposit Forfeited/Refunded' : 'New Deposit Received: $30.00'}
            </Heading>
            
            <Text style={text}>
              <strong>Customer:</strong> {customerName}<br />
              <strong>Phone:</strong> {customerPhone}<br />
              <strong>Email:</strong> {customerEmail}
            </Text>

            <Hr style={hr} />

            <Section style={box}>
              <Text style={label}>SERVICE DETAILS</Text>
              <Text style={value}>{serviceName} {isMobile ? "(Mobile)" : "(Shop)"}</Text>
              <Text style={value}>{date} at {time}</Text>
            </Section>

            <Hr style={hr} />

            <Row>
              <Column><Text style={label}>Total Job Value:</Text></Column>
              <Column><Text style={value}>{totalPrice}</Text></Column>
            </Row>
            
            {!isCancelled && (
              <Row>
                <Column><Text style={dueLabel}>Collect on Completion:</Text></Column>
                <Column><Text style={dueValue}>{remainingDue}</Text></Column>
              </Row>
            )}

            {isCancelled && (
              <Text style={{ ...text, color: '#dc2626', fontWeight: 'bold', marginTop: '20px' }}>
                This slot is now available in the calendar.
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = { backgroundColor: '#eee', fontFamily: 'sans-serif' };
const container = { margin: '0 auto', padding: '20px 0', maxWidth: '600px' };
const header = { padding: '20px', textAlign: 'center' as const, borderRadius: '10px 10px 0 0' };
const brand = { color: '#fff', margin: 0, fontSize: '20px', fontWeight: 'bold' };
const content = { backgroundColor: '#fff', padding: '40px', borderRadius: '0 0 10px 10px' };
const h2 = { fontSize: '20px', color: '#333', marginTop: 0 };
const text = { fontSize: '16px', lineHeight: '24px', color: '#555' };
const box = { backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px', margin: '20px 0' };
const label = { fontSize: '12px', color: '#888', fontWeight: 'bold', textTransform: 'uppercase' as const };
const value = { fontSize: '16px', color: '#333', fontWeight: 'bold' };
const dueLabel = { fontSize: '16px', fontWeight: 'bold', color: '#333' };
const dueValue = { fontSize: '18px', fontWeight: 'bold', color: '#dc2626', textAlign: 'right' as const };
const hr = { borderColor: '#eee', margin: '20px 0' };