import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send email
export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

// Send complaint status update email
export const sendComplaintStatusEmail = async (complaint, user) => {
  const subject = `Complaint Status Update: ${complaint.title}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .status { display: inline-block; padding: 5px 10px; border-radius: 5px; font-weight: bold; }
        .status.pending { background-color: #FEF3C7; color: #92400E; }
        .status.in-progress { background-color: #DBEAFE; color: #1E40AF; }
        .status.resolved { background-color: #D1FAE5; color: #065F46; }
        .status.rejected { background-color: #FEE2E2; color: #991B1B; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Smart Village Management</h1>
        </div>
        <div class="content">
          <h2>Complaint Status Update</h2>
          <p>Dear ${user.name},</p>
          <p>Your complaint has been updated:</p>
          <p><strong>Complaint ID:</strong> ${complaint._id}</p>
          <p><strong>Title:</strong> ${complaint.title}</p>
          <p><strong>Status:</strong> <span class="status ${complaint.status}">${complaint.status.toUpperCase()}</span></p>
          <p><strong>Category:</strong> ${complaint.category}</p>
          ${complaint.assignedTo ? `<p><strong>Assigned To:</strong> Officer</p>` : ''}
          ${complaint.resolution && complaint.resolution.description ? `
            <p><strong>Resolution:</strong></p>
            <p>${complaint.resolution.description}</p>
          ` : ''}
          <p>You can track your complaint status by logging into the Smart Village portal.</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Smart Village Management System</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Dear ${user.name},

    Your complaint has been updated:

    Complaint ID: ${complaint._id}
    Title: ${complaint.title}
    Status: ${complaint.status.toUpperCase()}
    Category: ${complaint.category}
    ${complaint.resolution && complaint.resolution.description ? `\nResolution: ${complaint.resolution.description}` : ''}

    You can track your complaint status by logging into the Smart Village portal.

    This is an automated message.
    Smart Village Management System
  `;

  return await sendEmail({
    to: user.email,
    subject,
    text,
    html
  });
};

// Send welcome email
export const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to Smart Village Management System';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Smart Village!</h1>
        </div>
        <div class="content">
          <p>Dear ${user.name},</p>
          <p>Thank you for registering with Smart Village Management System.</p>
          <p>Your account has been successfully created with the following details:</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Role:</strong> ${user.role}</p>
          <p>You can now log in and access all the features available for your role.</p>
          <p>If you have any questions, please don't hesitate to contact us.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Smart Village Management System</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: user.email,
    subject,
    html
  });
};
