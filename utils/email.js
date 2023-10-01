const nodemailer = require('nodemailer');

var sendEmail = async (options) => {
  //1) create a transporter mtlb kon send kara ga mail like gmail,yahoo,hotmail etc

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Define the email options

  const mailOptions = {
    from: 'Tufail Ali <admin@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //3) Actually send the email
  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.log(err);
  }
};

module.exports = sendEmail;
