import nodemailer from "nodemailer";

export async function sendCredentialsEmail({ to, name, username, password, role }) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // your Gmail address
      pass: process.env.EMAIL_PASS, // Gmail App Password
    },
  });

  const mailOptions = {
    from: `"Property Tenant Management" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Account Credentials",
    text: `
Hi ${name},

Your ${role} account has been created.

Username: ${username}
Password: ${password}

Please log in and change your password immediately.

Thanks,
Property Tenant Management Team
    `,
  };

  await transporter.sendMail(mailOptions);
}
