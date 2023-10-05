const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, messageContent) => {
  return new Promise(async (resolve, reject) => {
    try {
      //create transporter
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465, // changing port 587 to 465 :)
        secure: true, // false -> true
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASS,
        },
        from: process.env.EMAIL, // adding <<from>>> to check if email still goes to spam folder
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
