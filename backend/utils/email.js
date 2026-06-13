// import nodemailer from "nodemailer";
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

import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  // 1. Configure the transporter using 'service: gmail' (optimized for cloud platforms like Render)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_MAIL, // Your Gmail address
      pass: process.env.SMTP_PASSWORD, // Your 16-character Google App Password
    },
  });

  // 2. Build the HTML email template dynamically using options.message or a specific link
  // Note: Ensure options.resetLink contains the absolute URL (e.g., https://yourfrontend.vercel.app/reset-password/token)
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #333333; text-align: center;">Reset Your Password</h2>
      <p style="color: #666666; font-size: 16px; line-height: 1.5;">
        You requested to reset your password for ShopEasy. Please click the button below to set a new password. This link will expire shortly.
      </p>
      
      <!-- Real-world Button Container -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${options.resetLink}" 
           style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">
          Reset Password
        </a>
      </div>
      
      <p style="color: #999999; font-size: 12px; text-align: center; margin-top: 30px;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `;

  // 3. Define the mail options, passing the HTML layout into the 'html' field
  const mailOptions = {
    from: `ShopEasy <${process.env.SMTP_MAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message, // Fallback for email clients that block HTML
    html: htmlContent, // This renders the button!
  };

  // 4. Send the email with error logging for Render
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: ", info.messageId);
    return info;
  } catch (error) {
    console.error("Nodemailer Error on Render:", error);
    throw error;
  }
};
