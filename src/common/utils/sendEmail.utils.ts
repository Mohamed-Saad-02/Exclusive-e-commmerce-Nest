import { createTransport, SendMailOptions, Transporter } from "nodemailer";

export const sendEmail = async (mailOptions: SendMailOptions) => {
  try {
    const transporter: Transporter = createTransport({
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      port: Number(process.env.EMAIL_PORT),
      host: process.env.EMAIL_HOST,
      secure: true,
    });

    await transporter.sendMail(mailOptions);

    console.log("Email sent successfully");
    return true;
  } catch (error) {
    console.log("Failed to send email", error.message);
    throw new Error("Failed to send email");
  }
};
