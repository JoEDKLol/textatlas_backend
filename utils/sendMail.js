const nodemailer = require('nodemailer');
const { subscribe } = require('../routes/userRoute');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, 
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.GMAIL_APP_KEY,
  },
});





const emailContent = (numbers, type) => {
  const emailType = [
  {//kr
    "language":"kr", 
    "subject":`TextAltas 이메일 인증번호 입니다.`,
    "content":`
    <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <title>이메일 인증번호 안내</title>
        <style>
          body {
            background-color: #4A6D88;
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 600px;
            margin: 30px auto;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 128, 0, 0.1);
            padding: 30px 20px;
            text-align: center;
          }
          .header {
            background-color: #4A6D88;
            color: #ffffff;
            padding: 20px 0;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
            font-size: 22px;
            font-weight: bold;
          }
          .content {
            color: #333333;
            padding: 20px 0;
          }
          .content p {
            font-size: 16px;
            margin: 10px 0;
          }
          .code-box {
            display: inline-block;
            padding: 15px 30px;
            background-color: #bdebf7ff;
            color: #1c3346ff;
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 4px;
            border: 2px dashed #4A6D88;
            border-radius: 8px;
            margin: 20px 0;
          }
          .footer {
            font-size: 12px;
            color: #777777;
            margin-top: 30px;
          }
        </style>
      
      
      
      </head>
      <body>

        <div class="email-container">
          <div class="header">
            회원가입 이메일 인증
          </div>
          <div class="content">
            <p>안녕하세요!</p>
            <p>회원가입을 위해 아래의 인증번호를 입력해 주세요.</p>

            <div class="code-box">${numbers}</div>

            <p>인증번호 유효시간은 <strong>3분</strong>입니다.</p>
            <p>본인이 요청하지 않은 경우 이 메일은 무시하셔도 됩니다.</p>
          </div>
          <div class="footer">
            &copy; 2025 LolaTheQueen. All rights reserved.
          </div>
        </div>

      </body>
      </html>`
  },
  
  {//us
    "language":"us", 
    "subject":`[TextAltas] email verification code.`,
    "content":`
    <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Email verification number information</title>
        <style>
          body {
            background-color: #4A6D88;
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 600px;
            margin: 30px auto;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 128, 0, 0.1);
            padding: 30px 20px;
            text-align: center;
          }
          .header {
            background-color: #4A6D88;
            color: #ffffff;
            padding: 20px 0;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
            font-size: 22px;
            font-weight: bold;
          }
          .content {
            color: #333333;
            padding: 20px 0;
          }
          .content p {
            font-size: 16px;
            margin: 10px 0;
          }
          .code-box {
            display: inline-block;
            padding: 15px 30px;
            background-color: #bdebf7ff;
            color: #1c3346ff;
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 4px;
            border: 2px dashed #4A6D88;
            border-radius: 8px;
            margin: 20px 0;
          }
          .footer {
            font-size: 12px;
            color: #777777;
            margin-top: 30px;
          }
        </style>
      
      
      
      </head>
      <body>

        <div class="email-container">
          <div class="header">
            Membership registration email verification
          </div>
          <div class="content">
            <p>hello!</p>
            <p>Please enter the authentication number below to register.</p>

            <div class="code-box">${numbers}</div>

            <p>The authentication number is valid for <strong>3 minutes.</strong></p>
            <p>You can ignore this email unless you requested it.</p>
          </div>
          <div class="footer">
            &copy; 2025 LolaTheQueen. All rights reserved.
          </div>
        </div>

      </body>
      </html>`
  }, 
  {//mx
    "language":"mx", 
    "subject":`[TextAltas] código de verificación de correo electrónico.`,
    "content":`
    <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Información del número de verificación de correo electrónico</title>
        <style>
          body {
            background-color: #4A6D88;
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 600px;
            margin: 30px auto;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 128, 0, 0.1);
            padding: 30px 20px;
            text-align: center;
          }
          .header {
            background-color: #4A6D88;
            color: #ffffff;
            padding: 20px 0;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
            font-size: 22px;
            font-weight: bold;
          }
          .content {
            color: #333333;
            padding: 20px 0;
          }
          .content p {
            font-size: 16px;
            margin: 10px 0;
          }
          .code-box {
            display: inline-block;
            padding: 15px 30px;
            background-color: #bdebf7ff;
            color: #1c3346ff;
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 4px;
            border: 2px dashed #4A6D88;
            border-radius: 8px;
            margin: 20px 0;
          }
          .footer {
            font-size: 12px;
            color: #777777;
            margin-top: 30px;
          }
        </style>
      
      
      
      </head>
      <body>

        <div class="email-container">
          <div class="header">
            Verificación del correo electrónico de registro de membresía
          </div>
          <div class="content">
            <p>Hola!</p>
            <p>Ingrese el número de autenticación a continuación para registrarse.</p>

            <div class="code-box">${numbers}</div>

            <p>El número de autenticación es válido por <strong>3 minutos.</strong></p>
            <p>Puedes ignorar este correo electrónico a menos que lo hayas solicitado.</p>
          </div>
          <div class="footer">
            &copy; 2025 LolaTheQueen. All rights reserved.
          </div>
        </div>

      </body>
      </html>`
    }
  ];

  let contentsArr = [];


  if(type === "us"){
    contentsArr.push(emailType[1].subject);
    contentsArr.push(emailType[1].content);
  }else if(type === "kr"){
    contentsArr.push(emailType[0].subject);
    contentsArr.push(emailType[0].content);
  }else if(type === "mx"){
    contentsArr.push(emailType[2].subject);
    contentsArr.push(emailType[2].content);
  }else{
    contentsArr.push(emailType[1].subject);
    contentsArr.push(emailType[1].content);
  }


  return contentsArr;
};


const sendEmail = async (sendEmail, numbers, type) => {
  try {
    let emailContentArr = emailContent(numbers, type);

    await transporter.sendMail({
      from: process.env.NODEMAILER_USER, // 보내는 이메일
      to: sendEmail, // 받는 이메일
      subject: emailContentArr[0],
      html : emailContentArr[1],
    });

    return true;

  } catch (error) {
    return false;
  }
};

module.exports.sendEmail = sendEmail;