import { NextRequest, NextResponse } from 'next/server';
import { Twilio } from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const fromNumber = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;
const client = new Twilio(accountSid, authToken);

export async function OPTIONS(req: NextRequest) {
  // Handle CORS preflight request
  const res = NextResponse.next();
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  res.headers.set('Access-Control-Allow-Credentials', 'true');
  return new Response(null, {
    status: 204,
    headers: res.headers,
  });
}

export async function POST(req: NextRequest) {
  const { message, phoneNumbers } = await req.json();

  // Adjust validation to allow single message without phoneNumbers array
  if (!message) {
    return NextResponse.json({ message: 'Invalid request data: message is required' }, { status: 400 });
  }

  try {
    if (phoneNumbers && Array.isArray(phoneNumbers) && phoneNumbers.length > 0) {
      const sendMessages = phoneNumbers.map(phone =>
        client.messages.create({
          from: fromNumber,

          to: `whatsapp:${phone}`,
          body: message,
        })
      );
      await Promise.all(sendMessages);
    } else {
      // If no phoneNumbers array, send to a default number or return error
      // For now, return error
      return NextResponse.json({ message: 'Invalid request data: phoneNumbers array is required' }, { status: 400 });
    }
    return NextResponse.json({ message: 'WhatsApp alerts sent successfully!' });
  } catch (error) {
    console.error('Twilio error:', error);
    return NextResponse.json({ message: 'Failed to send WhatsApp messages.' }, { status: 500 });
  }
}
