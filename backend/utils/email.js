import nodemailer from "nodemailer";
// export const sendEmail = async (options) => {
//   const transporter = nodemailer.createTransport({
//     service: process.env.SMTP_SERVICE,
//     auth: {
//       user: process.env.SMTP_MAIL,
//       pass: process.env.SMTP_PASSWORD,
//     },
//   });
//   const mailOptions = {
//     from: process.env.SMTP_MAIL,
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//   };
//   await transporter.sendMail(mailOptions);
// };

export const sendEmail = async (options) => {
  // We use explicit fallbacks so it never defaults to localhost (::1)
  const mailHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const mailPort = parseInt(process.env.SMTP_PORT, 10) || 465;

  const transporter = nodemailer.createTransport({
    host: mailHost,
    port: mailPort,
    secure: mailPort === 465, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD, // Your 16-character App Password
    },
    // Add this timeout configuration to prevent infinite hanging
    connectionTimeout: 10000,
    greetingTimeout: 10000,
  });

  const mailOptions = {
    from: `Your App Name <${process.env.SMTP_MAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};
