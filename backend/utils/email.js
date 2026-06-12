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

import dns from "dns"; // Built-in Node.js module

export const sendEmail = async (options) => {
  const mailHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const mailPort = parseInt(process.env.SMTP_PORT, 10) || 465;

  const transporter = nodemailer.createTransport({
    host: mailHost,
    port: mailPort,
    secure: mailPort === 465, // true for 465
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    // 💡 FORCE IPV4 ONLY (Fixes ENETUNREACH on cloud platforms)
    dnsLookup: (hostname, options, callback) => {
      dns.lookup(hostname, { family: 4 }, (err, address, family) => {
        callback(err, address, family);
      });
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
  });

  const mailOptions = {
    from: `ShopEasy <${process.env.SMTP_MAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};
