const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', 
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Email error:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Resend sendEmail failed:", err);
    return false;
  }
};

module.exports = sendEmail;
