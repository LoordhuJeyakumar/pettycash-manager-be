const config = require("../utils/config");
const nodemailer = require("nodemailer");
const emailMessage = require("./message");

async function sendVerificationEmail(user) {
  try {
    let URL = `${config.FRONTEND_BASEURI}verification/${user.verificationToken}`;
    const transporter = nodemailer.createTransport({
      host: config.EMAIL_HOST,
      port: config.EMAIL_PORT,
      secure: config.EMAIL_SECURE, // use SSL
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS,
      },
    });

    transporter.verify((error, success) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Server is ready to send email");
      }
    });

    const message = {
      from: config.EMAIL_USER,
      to: user.email,
      subject: "User Verification Link",
      text: `
            
Hi ${user.name},

We just need to verify your email address before you can access Pettycash manager.

Verify your email address ${URL}

Thanks! – The Pettycash manager team
            `,
      html: emailMessage(URL, user.name),
    };

    transporter.sendMail(message, (error, info) => {
      if (error) {
        console.log("Email Sent failed", error);
        return error;
      } else {
        console.log("Email sent sucessfully");
        return info;
      }
    });
  } catch (error) {
    console.log("Email not sent");
    console.log(error);
  }
}

module.exports = sendVerificationEmail;
