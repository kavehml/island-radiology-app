import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface RequisitionConfirmationEmailData {
  to: string;
  requisitionNumber: string;
  patientName: string;
  orderType: string;
  submittedByName: string;
  submittedAt: string;
}

export const sendRequisitionConfirmationEmail = async (
  data: RequisitionConfirmationEmailData
): Promise<void> => {
  // Skip email sending if SMTP is not configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.log('SMTP not configured, skipping email send');
    return;
  }

  const mailOptions = {
    from: `"Island Radiology" <${process.env.SMTP_USER}>`,
    to: data.to,
    subject: `Requisition Confirmation - ${data.requisitionNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
          .info-box { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid #3498db; }
          .requisition-number { font-size: 24px; font-weight: bold; color: #2c3e50; text-align: center; padding: 20px; background-color: #ecf0f1; }
          .footer { margin-top: 20px; padding: 20px; text-align: center; color: #7f8c8d; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Island Radiology</h1>
          </div>
          <div class="content">
            <h2>Requisition Submitted Successfully</h2>
            <p>Dear ${data.submittedByName},</p>
            <p>Thank you for submitting an imaging requisition. Your request has been received and is being processed.</p>
            
            <div class="requisition-number">
              Requisition Number: ${data.requisitionNumber}
            </div>
            
            <div class="info-box">
              <h3>Requisition Details:</h3>
              <p><strong>Patient Name:</strong> ${data.patientName}</p>
              <p><strong>Order Type:</strong> ${data.orderType}</p>
              <p><strong>Submitted By:</strong> ${data.submittedByName}</p>
              <p><strong>Submitted At:</strong> ${data.submittedAt}</p>
            </div>
            
            <p>You can track the status of this requisition using the requisition number and patient's date of birth at our patient portal.</p>
            
            <p>If you have any questions, please contact our office.</p>
            
            <p>Best regards,<br>Island Radiology Team</p>
          </div>
          <div class="footer">
            <p>This is an automated confirmation email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Requisition Submitted Successfully

Dear ${data.submittedByName},

Thank you for submitting an imaging requisition. Your request has been received and is being processed.

Requisition Number: ${data.requisitionNumber}

Requisition Details:
- Patient Name: ${data.patientName}
- Order Type: ${data.orderType}
- Submitted By: ${data.submittedByName}
- Submitted At: ${data.submittedAt}

You can track the status of this requisition using the requisition number and patient's date of birth at our patient portal.

If you have any questions, please contact our office.

Best regards,
Island Radiology Team
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Confirmation email sent to ${data.to}`);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    // Don't throw error - email failure shouldn't break requisition submission
  }
};
