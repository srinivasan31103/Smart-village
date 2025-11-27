import twilio from 'twilio';

// Initialize Twilio client
let twilioClient = null;

const initTwilio = () => {
  if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  return twilioClient;
};

// Send SMS
export const sendSMS = async ({ to, message }) => {
  try {
    const client = initTwilio();

    if (!client) {
      console.log('Twilio not configured, skipping SMS');
      return { success: false, error: 'Twilio not configured' };
    }

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });

    console.log('SMS sent:', result.sid);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('SMS error:', error);
    return { success: false, error: error.message };
  }
};

// Send complaint status update SMS
export const sendComplaintStatusSMS = async (complaint, user) => {
  const message = `Smart Village Alert: Your complaint "${complaint.title}" status updated to ${complaint.status.toUpperCase()}. Check portal for details.`;

  return await sendSMS({
    to: user.phone,
    message
  });
};
