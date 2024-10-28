const nodemailer = require("nodemailer");
const config = require("../config/environments");

class Mailer {
  constructor() {}

  async emailVerify(to, name, surname, message) {
    try {
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: config.MAIL_USER,
          pass: config.MAIL_PASS,
        },
      });

      const mailOptions = {
        from: `"Tuana" <${config.MAIL_USER}>`,
        to: to,
        subject: "Tuanalytics.com | Email Verification",
        html: `
        <html>
        <head>
          <style>
            body {
              font-family: Dosis, sans-serif;
              color: #333 !important;
              background-color: #f4f4f4;
            }
      
            .container {
              width: fit-content;
              margin: 0 auto;
              padding: 4rem 2rem;
              background-color: #f2f2f2;
              border-radius: 10px;
              text-align: center;
              font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
              border: 2px solid #e7e7e7;
            }
      
            .verify-button {
              text-decoration: none;
              color: #ffffff !important;
              padding: 0.6rem 2rem;
              margin:1rem 0;
              background-color: #00e20b;
              font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
              border-radius: 10px;
              font-weight: bolder;
    
            }
            .verify-button:hover {
              transition: 0.2s ease-in-out;
              background-color: #00b509;
            }

            h1{
              margin: .5rem 0;
       
              color: #333 !important;
            }

            p{
              margin: .5rem 0;
              padding: .5rem 0;
              font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
              color: #333 !important;
            }

            
            .underline{
              border-top: 0.1rem solid #00000041;
              width: 80%;
              border-radius: 10px;
              margin: .5rem auto 2rem auto;
            }

            .logo{
              width: 150px;
             
            }
      
          </style>
        </head>
        <body>
          <div class="container">
          <img class="logo" src="https://image.ahmetselimboz.com.tr/marqqet/Marqqet_Text.png" alt="">
          <hr class="underline">
            <h1>Hello! ${name} ${surname}</h1>
            <p>Welcome aboard! Verify your email and start shopping!</p>
            <a href="${message}" class="verify-button">Verify Your Account</a>
          </div>
        </body>
      </html>
      `,
      };

      await transporter.sendMail(mailOptions);
      console.log("Mail sent!");
    } catch (error) {
      console.log("sendMail Error: " + error);
    }
  }
}

module.exports = new Mailer();
