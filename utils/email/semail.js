const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, messageContent) => {
  return new Promise(async (resolve, reject) => {
    try {
      //create transporter
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587, // changing port 465 to 587  :)
        secure: false, // true=>false
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASS,
        },
        from: process.env.EMAIL, // adding <<from>>> to check if email still goes to spam folder
        replyTo: process.env.EMAIL2, // adding reply
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
