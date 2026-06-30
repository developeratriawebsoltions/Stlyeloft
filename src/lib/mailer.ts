import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER ?? "";
const EMAIL_PASS = process.env.EMAIL_PASS ?? "";
const FROM_ADDRESS = process.env.EMAIL_FROM ?? EMAIL_USER;

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error("Missing EMAIL_USER or EMAIL_PASS in environment variables");
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  return transporter;
}

export async function sendOtpEmail(email: string, code: string) {
  const transport = getTransporter();

  await transport.sendMail({
    from: `"Stlyeloft" <${FROM_ADDRESS}>`,
    to: email,
    subject: "Your Stlyeloft OTP Code",
    html: `
      <div style="font-family: sans-serif;">
        <h2>Stlyeloft OTP Verification</h2>
        <p>Your one-time password is:</p>
        <p style="font-size: 1.5rem; font-weight: 700; letter-spacing: 0.2em;">${code}</p>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `,
  });
}

