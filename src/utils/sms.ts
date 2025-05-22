import { Twilio } from "twilio";

// Use the correct type for the Twilio client
const client: Twilio = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export function sendSms(to: string, body: string) {
  return client.messages.create({
    to,
    from: process.env.TWILIO_PHONE_NUMBER,
    body,
  });
}
