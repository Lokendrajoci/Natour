const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,

      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // 2) Define the email options
    const mailOptions = {
      from: process.env.EMAIL_SERVER_USER,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    // 3) Actually send the email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail;
