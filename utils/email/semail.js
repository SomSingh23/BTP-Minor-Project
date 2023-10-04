const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, messageContent) => {
  return new Promise(async (resolve, reject) => {
    try {
      //create transporter
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASS,
        },
      });

      const message = {
        to: to,
        subject: `${subject}`,
        html: `${messageContent}`,
      };
      const info = await transporter.sendMail(message);
      resolve(info.messageId);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = sendEmail;
