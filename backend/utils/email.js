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
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // e.g., smtp.gmail.com or smtp.mailtrap.io
    port: parseInt(process.env.SMTP_PORT, 10) || 465, // 465 (SSL) or 587 (TLS)
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `ShopEasy <${process.env.SMTP_MAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};
