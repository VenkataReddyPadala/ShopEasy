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

// import nodemailer from "nodemailer";

// export const sendEmail = async (options) => {
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     host: "smtp.gmail.com",
//     port: 465,
//     secure: true, // Upgrades the connection to TLS immediately
//     auth: {
//       user: process.env.SMTP_MAIL, // Your Gmail address
//       pass: process.env.SMTP_PASSWORD, // Your 16-character Google App Password
//     },
//     // 💥 CRITICAL FOR RENDER: Stops IPv6 hanging and optimizes timeouts
//     connectionTimeout: 10000, // 10 seconds timeout limit
//     greetingTimeout: 10000,
//     socketTimeout: 10000,
//     dnsTimeout: 5000,
//   });

//   const htmlContent = `
//     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
//       <h2 style="color: #333333; text-align: center;">Reset Your Password</h2>
//       <p style="color: #666666; font-size: 16px; line-height: 1.5;">
//         You requested to reset your password for ShopEasy. Please click the button below to set a new password. This link will expire shortly.
//       </p>
//       <div style="text-align: center; margin: 30px 0;">
//         <a href="${options.resetLink}"
//            style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">
//           Reset Password
//         </a>
//       </div>
//       <p style="color: #999999; font-size: 12px; text-align: center; margin-top: 30px;">
//         If you didn't request this, you can safely ignore this email.
//       </p>
//     </div>
//   `;

//   const mailOptions = {
//     from: `ShopEasy <${process.env.SMTP_MAIL}>`,
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     html: htmlContent,
//   };

//   // We await here inside the utility file to ensure errors bubble up correctly
//   const info = await transporter.sendMail(mailOptions);
//   console.log("Email sent successfully: ", info.messageId);
//   return info;
// };

// Using brevo

export const sendEmail = async (options) => {
  const url = "https://api.brevo.com/v3/smtp/email";

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #333333; text-align: center;">Reset Your Password</h2>
      <p style="color: #666666; font-size: 16px; line-height: 1.5;">
        You requested to reset your password for ShopEasy. Please click the button below to set a new password. This link will expire shortly.
      </p>
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

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        // 💥 The email you used to sign up for Brevo
        sender: { name: "ShopEasy Support", email: process.env.SMTP_MAIL },
        to: [{ email: options.email }],
        subject: options.subject,
        textContent: options.message, // Fallback plain text
        htmlContent: htmlContent, // Your styled layout button
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to send email via Brevo");
    }

    console.log("Email successfully sent via Brevo API:", data.messageId);
    return data;
  } catch (error) {
    console.error("Brevo API Error on Render:", error);
    throw error;
  }
};
