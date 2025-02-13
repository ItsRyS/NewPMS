const emailjs = require("@emailjs/nodejs");
require("dotenv").config();

const sendEmail = async (to_email, to_name, document_name, document_id) => {
  try {
    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      {
        to_email,
        to_name,
        document_name,
        document_id,
        reply_to: "no-reply@yourdomain.com",
      },
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY,
      }
    );

    console.log(`Email sent to ${to_email}`, response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendEmail;
