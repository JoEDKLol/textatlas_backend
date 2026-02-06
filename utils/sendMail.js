const nodemailer = require('nodemailer');
const { subscribe } = require('../routes/userRoute');
const { getDateStringYYYYMM, getDateString } = require('./common');

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


const emailContentInqury = (type, obj) => {
  const sendDateYYYYMMDD = getDateString();
  const sendDate = sendDateYYYYMMDD.substring(0, 4) + "-" + sendDateYYYYMMDD.substring(4, 6) + "-" + sendDateYYYYMMDD.substring(6, 8);
  const inquiryStr = (obj.inquiry === "01")?"일반문의":(obj.inquiry === "02")?"버그신고":(obj.inquiry === "03")?"도서추가요청":(obj.inquiry === "04")?"커뮤니티/쪽지 관련":"기타";
  const emailType = [
  {//kr
    "language":"kr", 
    "subject":`안녕하세요, TextAltas 입니다. 문의하신 내용이 정상적으로 접수되었습니다.`,
    "content":`
    <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f7f9; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e1e8ed; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
          .header { background-color: #2563eb; padding: 30px 20px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
          .content { padding: 40px 30px; }
          .content p { margin-bottom: 20px; font-size: 16px; }
          .info-box { background-color: #f8fafc; border-radius: 6px; padding: 20px; border-left: 4px solid #2563eb; margin: 30px 0; }
          .info-item { margin-bottom: 10px; font-size: 14px; }
          .info-label { font-weight: bold; color: #64748b; width: 80px; display: inline-block; }
          .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
          .tag { display: inline-block; background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 15px; }
      </style>
      
      
      
      </head>
      <body>
      <div class="container">
          <div class="header">
              <h1>TextAltas</h1>
          </div>

          <div class="content">
              <div class="tag">접수 완료</div>
              <p>안녕하세요,</p>
              <p>보내주신 소중한 문의 사항이 성공적으로 접수되었습니다.<br>
                담당자가 확인 후 영업일 기준 1~2일 내에 답변을 드릴 예정입니다.</p>

              <div class="info-box">
                  <div class="info-item">
                      <span class="info-label">접수 일시</span> <span>${sendDate}</span>
                  </div>
                  <div class="info-item">
                      <span class="info-label">문의 유형</span> <span>${inquiryStr}</span>
                  </div>
                  <div class="info-item">
                      <span class="info-label">문의 내용</span><br>
                      <div style="margin-top: 8px; color: #334155; border-top: 1px solid #e2e8f0; padding-top: 8px;">
                          ${obj.content}
                      </div>
                  </div>
              </div>

              <p style="font-size: 14px; color: #64748b;">
                  궁금하신 점이 있다면 언제든 이 메일에 회신해 주세요. 
                  더 나은 서비스를 위해 항상 노력하겠습니다.
              </p>
          </div>

          <div class="footer">
              <p>© 2026 TextAltas. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>`
  },
  
  {//us
    "language":"us", 
    "subject":`Hello, this is TextAltas. Your inquiry has been successfully received.`,
    "content":`
    <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f7f9; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e1e8ed; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            .header { background-color: #2563eb; padding: 30px 20px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 40px 30px; }
            .info-box { background-color: #f8fafc; border-radius: 6px; padding: 20px; border-left: 4px solid #2563eb; margin: 30px 0; }
            .info-item { margin-bottom: 10px; font-size: 14px; }
            .info-label { font-weight: bold; color: #64748b; width: 100px; display: inline-block; }
            .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
            .tag { display: inline-block; background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 15px; }
        </style>
      </head>
      <body>

        <div class="container">
          <div class="header">
              <h1>TextAltas</h1>
          </div>
          <div class="content">
            <div class="tag">Received</div>
            <p>Dear Customer,</p>
            <p>Thank you for reaching out to us. We have successfully received your inquiry.<br>
              Our team will review your message and get back to you within 1-2 business days.</p>

            <div class="info-box">
                <div class="info-item">
                  <span class="info-label">Date</span> <span>${sendDate}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Inquiry Type</span> <span>${inquiryStr}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Message</span><br>
                  <div style="margin-top: 8px; color: #334155; border-top: 1px solid #e2e8f0; padding-top: 8px;">
                      ${obj.content}
                  </div>
                </div>
              </div>

              <p style="font-size: 14px; color: #64748b;">
                  If you have any additional questions, please feel free to reply to this email. 
                  Stay tuned for our upcoming <strong>Smart Quiz features!</strong>
              </p>
          </div>
          <div class="footer">
              <p>© 2026 TextAltas. All rights reserved.</p>
          </div>
        </div>

      </body>
      </html>`
  }, 
  {//mx
    "language":"mx", 
    "subject":`Hola, somos TextAltas. Hemos recibido su consulta correctamente.`,
    "content":`
    <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            /* CSS는 영문 버전과 동일 */
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f7f9; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e1e8ed; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            .header { background-color: #2563eb; padding: 30px 20px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 40px 30px; }
            .info-box { background-color: #f8fafc; border-radius: 6px; padding: 20px; border-left: 4px solid #2563eb; margin: 30px 0; }
            .info-item { margin-bottom: 10px; font-size: 14px; }
            .info-label { font-weight: bold; color: #64748b; width: 120px; display: inline-block; }
            .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
            .tag { display: inline-block; background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 15px; }
        </style>
      </head>
      <body>

        <div class="container">
          <div class="header">
              <h1>TextAltas</h1>
          </div>
          <div class="content">
                <div class="tag">Recibido</div>
                <p>Hola,</p>
                <p>Gracias por ponerse en contacto con nosotros. Hemos recibido su consulta correctamente.<br>
                  Nuestro equipo revisará su mensaje y le responderá en un plazo de 1 a 2 días hábiles.</p>

                <div class="info-box">
                    <div class="info-item">
                        <span class="info-label">Fecha</span> <span>${sendDate}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Tipo de consulta</span> <span>${inquiryStr}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Mensaje</span><br>
                        <div style="margin-top: 8px; color: #334155; border-top: 1px solid #e2e8f0; padding-top: 8px;">
                            ${obj.content}
                        </div>
                    </div>
                </div>

                <p style="font-size: 14px; color: #64748b;">
                    Si tiene alguna pregunta adicional, no dude en responder a este correo electrónico. 
                    ¡Próximamente lanzaremos nuestras funciones de <strong>Cuestionarios Inteligentes!</strong>
                </p>
            </div>
            <div class="footer">
                <p>© 2026 TextAltas. All rights reserved.</p>
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


const sendEmailInquiry = async (sendEmail, type, obj) => {
  try {
    let emailContentArr = emailContentInqury(type, obj);

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
module.exports.sendEmailInquiry = sendEmailInquiry;