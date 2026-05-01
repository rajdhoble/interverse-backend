const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  let transporter;
  
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  } else {
    // Generate test SMTP service account from ethereal.email if no settings are provided
    // This allows us to preview the sent emails via a URL immediately without real credentials
    let testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  const message = {
    from: `${process.env.FROM_NAME || 'Internship Portal'} <${process.env.FROM_EMAIL || 'noreply@internshipportal.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(message);

  console.log('✅ Email successfully generated: %s', info.messageId);
  
  if (!process.env.SMTP_HOST) {
    // Preview only available when sending through an Ethereal account
    console.log('🔗 Mail Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }
};

module.exports = sendEmail;
