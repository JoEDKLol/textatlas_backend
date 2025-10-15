const express=require('express')
const multer=require('multer')
const userRoute=express.Router()
let getFields=multer()
// const Books = require("../models/bookSchemas");
const Users = require("../models/userSchemas");
const EmailVerifications = require("../models/emailVerificationSchemas");
const ObjectId = require("mongoose").Types.ObjectId;
const commonModules = require("../utils/common");
const jwtModules = require("../utils/jwtmodule");
const { default: mongoose } = require('mongoose')
const db = mongoose.connection;
const sequence = require("../utils/sequences");
const { sendEmail } = require('../utils/sendMail');
const checkAuth = require('../utils/checkAuth');

// userRoute.get("/", getFields.none(), async (request, response) => {
//   try {
      
//       let sendObj = {};
//       let Books = await Books.find();
//       response.status(200).send({
//           sendObj
//       });

//   } catch (error) {
//       console.log(error);
//       response.status(500).send(commonModules.sendObjSet("1051", error));
      
//   }
// }); 
userRoute.post("/sendemail", getFields.none(), async (request, response) => {
  try { 
    let sendObj = {};
    
    let userData = await Users.findOne({email:request.body.email});
    if(userData){
      sendObj = commonModules.sendObjSet("1011");
    }else{ //verify numbers send
      //time to send email check 
      let emailVerifyData = await EmailVerifications.aggregate(
        [{$match:{ "email":request.body.email}},
        {$project: { "email": 1, "regdate": 1 }},
        {$sort:{_id:-1}},
        {$limit:1}
        ]   
      );
      if(emailVerifyData[0]){
        const searchDate = new Date(emailVerifyData[0].regdate)
        const currentDate = new Date();
        const diffMSec = currentDate.getTime() - searchDate.getTime()
        const diffMin = diffMSec / (1000);
        if(diffMin < 180){ //under 3 minutes
          sendObj = commonModules.sendObjSet("1014");
        }else{
          const sendEmailAdrr = request.body.email;
          const verifyNum = commonModules.getRandomNumber(6);
          const emailSendYn = await sendEmail(sendEmailAdrr, verifyNum, request.body.language);
          if(emailSendYn){
            //startTransaction
            const session = await db.startSession();
            session.startTransaction();
            const emailVObj = {
              // userseq:userseq,
              email:sendEmailAdrr,
              verifynumber:verifyNum,
              reguser:sendEmailAdrr,
              upduser:sendEmailAdrr,
            }
            await EmailVerifications.deleteMany({
              email:sendEmailAdrr
            });
            const newEmailVerifications = new EmailVerifications(emailVObj);
            await newEmailVerifications.save();

            // 4. commit
            await session.commitTransaction();
            // 5. end Transaction
            session.endSession();

            sendObj = commonModules.sendObjSet("1010");
          }else{
            sendObj = commonModules.sendObjSet("1012");
            throw new Error(sendObj.code);
          }
        }
      }else{
        const sendEmailAdrr = request.body.email;
        const verifyNum = commonModules.getRandomNumber(6);
        const emailSendYn = await sendEmail(sendEmailAdrr, verifyNum, request.body.language);
        if(emailSendYn){
          //startTransaction
          const session = await db.startSession();
          session.startTransaction();
          const emailVObj = {
            // userseq:userseq,
            email:sendEmailAdrr,
            verifynumber:verifyNum,
            reguser:sendEmailAdrr,
            upduser:sendEmailAdrr,
          }
          await EmailVerifications.deleteMany({
            email:sendEmailAdrr
          });
          const newEmailVerifications = new EmailVerifications(emailVObj);
          await newEmailVerifications.save();

          // 4. commit
          await session.commitTransaction();
          // 5. end Transaction
          session.endSession();

          sendObj = commonModules.sendObjSet("1010");
        }else{
          sendObj = commonModules.sendObjSet("1012");
          throw new Error(sendObj.code);
        }
      }
    }

    response.status(200).send({
        sendObj
    });

  } catch (error) {
    let obj = commonModules.sendObjSet(error.message);
    if(obj.code === ""){
      obj = commonModules.sendObjSet("1013");
    }
    response.status(500).send(obj);
  }
});

userRoute.get("/checkverifynumber", getFields.none(), async (request, response) => {
  try {
    let sendObj = {};  

    const resCheckNumber = await EmailVerifications.find({
      email:request.query.email,
      verifynumber:request.query.verifynumber
    })

    if(resCheckNumber.length > 0){
      sendObj = commonModules.sendObjSet("1020");
    }else{
      sendObj = commonModules.sendObjSet("1021");
    }

    response.status(200).send({
        sendObj
    });

  } catch (error) {
    response.status(500).send(commonModules.sendObjSet("1022", error));
  }
});

userRoute.post("/signup", getFields.none(), async (request, response) => {
  try {
    let sendObj = {};
    let userData = await Users.findOne({email:request.body.email});
    if(!userData){
      const userseq = await sequence.getSequence("user_seq");

      const userObj = {
        userseq:userseq,
        email:request.body.email,
        password:request.body.password,
        // agree:request.body.agree,
        firstLogin : true, 
        socialLogin : false, 
        reguser:request.body.email,
        upduser:request.body.email
      }

      const newUsers =new Users(userObj);
      let resusers=await newUsers.save();

      sendObj = commonModules.sendObjSet("1000");
    
    }else{
      sendObj = commonModules.sendObjSet("1001");
    }
      
    
    response.status(200).send({
        sendObj
    });

  } catch (error) {
    // console.log(error);
    response.status(500).send(commonModules.sendObjSet("1002", error));
  }
});

userRoute.get("/getAccessToken", getFields.none(), async (request, response) => {
  let sendObj = {};
  try {
      if(request.cookies.refreshtoken){
        const refreshtoken = jwtModules.checkRefreshToken(request.cookies.refreshtoken);
        if(refreshtoken){
          let userData = await Users.findOne({email:refreshtoken.email});
          
          if(userData){
            const userObj = {

              id:userData._id,
              email:userData.email,
              userseq:userData.userseq, 
              username:userData.username,
              userimg:userData.userimg,
              userthumbImg:userData.userthumbImg,
              role:userData.role,
            //   joinlevel : userData.joinlevel,
            //   learninglevel:userData.learninglevel,
            //   interestcategories : userData.interestcategories,
            //   interestDetails:userData.interestDetails,
            //   agree:userData.agree, 
              firstLogin : userData.firstLogin, 
              socialLogin : userData.socialLogin, 
              preferred_trans_lang : userData.preferred_trans_lang,
            }
            sendObj = commonModules.sendObjSet("2000", userObj);
            const accesstoken = jwtModules.retAccessToken(userData._id, userData.email);

            // console.log("accesstoken::" + accesstoken);
        
            response.setHeader("accesstoken", accesstoken);
          }else{
            sendObj = commonModules.sendObjSet("2001", userObj);
          }
        }
      }else{
          sendObj = commonModules.sendObjSet("2002", {});
      }

      response.send({sendObj});
  } catch (error) {
    response.status(500).send(commonModules.sendObjSet("2002", error));
      
  }
});

userRoute.post("/signin", getFields.none(), async (request, response) => {
  try {

    let sendObj = {};
    let userData = await Users.findOne({email:request.body.email});
    
    if(!userData){
        sendObj = commonModules.sendObjSet("1051");
    }
    
    if(userData){
      //password compare
      let res = await userData.comparePassword(request.body.password);
      
      if(!res){ //패스워드 인증 실패시 로그인 시도횟수가 10미만이면 시도횟수 증가
        if(userData.loginattemptscnt >= 10){
            sendObj = commonModules.sendObjSet("1051");
        }else{
            let upRes = await Users.updateOne({_id:userData._id}
                ,{"loginattemptscnt":userData.loginattemptscnt+1})
            sendObj = commonModules.sendObjSet("1051");
        }
      }else{

        if(userData.loginattemptscnt >= 10){ //로그인 시도횟수가 10이상이면 비밀번호 변경 해야 한다.
            sendObj = commonModules.sendObjSet("1052");
        }else{ 
          //로그인성공시 토큰 발급해준다. 
          //로그인 시도 횟수 초기화
          //01. 리프레쉬토큰은 header에 발급
          if(userData.loginattemptscnt > 0){
            await Users.updateOne({_id:userData._id}
            ,{"loginattemptscnt":0})
          }

          await Users.updateOne(
            {_id:userData._id},
            {
              "firstLogin":false, 
              "socialLogin":false,
            });

          const refreshtoken = jwtModules.retFreshToken(userData._id, userData.email);
          const resUserObj = {
            id:userData._id,
            email:userData.email,
            userseq:userData.userseq, 
            username:userData.username,
            userimg:userData.userimg,
            userthumbImg:userData.userthumbImg,
            role:userData.role,
            // joinlevel : userData.joinlevel,
            // learninglevel:userData.learninglevel,
            // interestcategories : userData.interestcategories,
            // interestDetails:userData.interestDetails,
            // agree:userData.agree, 
            firstLogin : userData.firstLogin, 
            socialLogin : userData.socialLogin, 
            preferred_trans_lang : userData.preferred_trans_lang,
            
          }

          const expiryDate = new Date( Date.now() + 60 * 60 * 1000 * 24 * 30); // 24 hour 30일
          const cookieConfig = { 
            //cookieConfig는 키, 밸류 외에 설정을 보낼 수 있다.
            // maxAge : 30000,
            //밀리초 단위로 들어가는데 30000을 설정하면 30초만료 쿠키를 생성한다. 
            expires:expiryDate, 
            httpOnly: true,
            sameSite : true,
            path: '/',
          };
          
          response.setHeader("refreshtoken", refreshtoken);
          //response.cookie('refreshtoken', refreshtoken, cookieConfig);
          sendObj = commonModules.sendObjSet("1050", resUserObj);
        }
      }

    }
    response.status(200).send({
        sendObj
    });

  } catch (error) {
    response.status(500).send(commonModules.sendObjSet("1051", error));
  }
});

userRoute.post("/googlesignin", getFields.none(), async (request, response) => {
  
  try {

      let sendObj = {};
      
      let userData = await Users.findOne({email:request.body.email});

      if(!userData){ //new user register
        let userEmail = request.body.email;

        const session = await db.startSession();
        session.startTransaction();

        const userseq = await sequence.getSequence("user_seq");
        const userSaveObj = {
          userseq:userseq,
          email:userEmail,
          password:userEmail,
        //   agree:{"all":false, "개인회원약관":true, "개인정보수집":true, "마케팅정보수집":false},
          firstLogin:true,
          socialLogin:true,
          reguser:userEmail,
          upduser:userEmail,
        }

        const newUsers =new Users(userSaveObj);
        let resusers=await newUsers.save();

        // 4. commit
        await session.commitTransaction();
        // 5. end Transaction
        session.endSession();

        
        const refreshtoken = jwtModules.retFreshToken(resusers._id, resusers.email);
        const resUserObj = {
          id:resusers._id,
          email:resusers.email,
          userseq:resusers.userseq, 
          username:resusers.username,
          userimg:resusers.userimg,
          userthumbImg:resusers.userthumbImg,
          role:resusers.role,
        //   joinlevel : resusers.joinlevel,
        //   learninglevel:resusers.learninglevel,
        //   interestcategories : resusers.interestcategories,
        //   interestDetails:resusers.interestDetails,
        //   agree:resusers.agree, 
          firstLogin : resusers.firstLogin, 
          socialLogin : resusers.socialLogin, 
          preferred_trans_lang : resusers.preferred_trans_lang,
        }
        response.setHeader("refreshtoken", refreshtoken);
        sendObj = commonModules.sendObjSet("1050", resUserObj);
          
      }else{

        let upRes = await Users.updateOne(
          {_id:userData._id},
          {
            "firstLogin":false, 
            "socialLogin":true,
          });

        const refreshtoken = jwtModules.retFreshToken(userData._id, userData.email);
        const resUserObj = {
          id:userData._id,
          email:userData.email,
          userseq:userData.userseq, 
          username:userData.username,
          userimg:userData.userimg,
          userthumbImg:userData.userthumbImg,
          role:userData.role,
        //   joinlevel : userData.joinlevel,
        //   learninglevel:userData.learninglevel,
        //   interestcategories : userData.interestcategories,
        //   interestDetails:userData.interestDetails,
        //   agree:userData.agree, 
          firstLogin : userData.firstLogin, 
          socialLogin : userData.socialLogin, 
          preferred_trans_lang : userData.preferred_trans_lang,
        }

        response.setHeader("refreshtoken", refreshtoken);
        sendObj = commonModules.sendObjSet("1050", resUserObj);
      }
      response.status(200).send({
          sendObj
      });


  }catch (error) {
    response.status(500).send(commonModules.sendObjSet("1051", error));
  }

});

userRoute.post("/checkaccessToken", getFields.none(), async (request, response) => {
  let sendObj = {};
  try {
    if(request.headers.accesstoken){
      const accessToken = jwtModules.checkAccessToken(request.headers.accesstoken);
      
      if(accessToken){
        let userData = await Users.findOne({email:accessToken.email});
        let resLikeArr = [];
        
        if(userData){
          const userObj = {

            id:userData._id,
            email:userData.email,
            userseq:userData.userseq, 
            username:userData.username,
            userimg:userData.userimg,
            userthumbImg:userData.userthumbImg,
            role:userData.role,
            // joinlevel : userData.joinlevel,
            // learninglevel:userData.learninglevel,
            // interestcategories : userData.interestcategories,
            // interestDetails:userData.interestDetails,
            // agree:userData.agree, 
            firstLogin : userData.firstLogin, 
            socialLogin : userData.socialLogin, 
            preferred_trans_lang : userData.preferred_trans_lang,
          }
          sendObj = commonModules.sendObjSet("2010", userObj);
            
        }else{
            sendObj = commonModules.sendObjSet("2011", {});
        }
      }else{
          sendObj = commonModules.sendObjSet("2011", {});
      }

    }

    response.send({sendObj});

  } catch (error) {
      response.status(500).send(commonModules.sendObjSet("2011", error));
  }
});

userRoute.get("/logout", getFields.none(), async (request, response) => {
  
  let sendObj = {};
  try {
      const refreshToken = jwtModules.checkRefreshToken(request.cookies.refreshtoken);

      if(refreshToken === false){
          sendObj = commonModules.sendObjSet("2021");
      }else{
          response.clearCookie('refreshtoken');
          sendObj = commonModules.sendObjSet("2020");
      }
      
      response.send({sendObj});

  } catch (error) {

      response.status(500).send(commonModules.sendObjSet("2022", error));
  }
});

userRoute.post("/sendemailforpassword", getFields.none(), async (request, response) => {
  try {
    let sendObj = {};

    let userData = await Users.findOne({email:request.body.email});


    if(!userData){
      sendObj = commonModules.sendObjSet("1031");
    }else{ //verify numbers send

      //time to send email check 
      let emailVerifyData = await EmailVerifications.aggregate(
        [{$match:{ "email":request.body.email}},
        {$project: { "email": 1, "regdate": 1 }},
        {$sort:{_id:-1}},
        {$limit:1}
        ]   
      );


      if(emailVerifyData[0]){
        const searchDate = new Date(emailVerifyData[0].regdate)
        const currentDate = new Date();
        const diffMSec = currentDate.getTime() - searchDate.getTime()
        const diffMin = diffMSec / (1000);
        if(diffMin < 180){ //under 3 minutes
          sendObj = commonModules.sendObjSet("1034");
        }else{
          const sendEmailAdrr = request.body.email;
          const verifyNum = commonModules.getRandomNumber(6);
          const emailSendYn = await sendEmail(sendEmailAdrr, verifyNum, request.body.language);
          if(emailSendYn){
            //startTransaction
            const session = await db.startSession();
            session.startTransaction();

            const emailVObj = {
                email:sendEmailAdrr,
                verifynumber:verifyNum,
                reguser:sendEmailAdrr,
                upduser:sendEmailAdrr,
            }
            await EmailVerifications.deleteMany({
              email:sendEmailAdrr
            });
            const newEmailVerifications = new EmailVerifications(emailVObj);
            await newEmailVerifications.save();

            // 4. commit
            await session.commitTransaction();
            // 5. end Transaction
            session.endSession();

            sendObj = commonModules.sendObjSet("1030");
          }else{
            sendObj = commonModules.sendObjSet("1032");
            throw new Error(sendObj.code);
          }
        }
      }else{
        const sendEmailAdrr = request.body.email;
        const verifyNum = commonModules.getRandomNumber(6);
        const emailSendYn = await sendEmail(sendEmailAdrr, verifyNum, request.body.language);
        if(emailSendYn){
          //startTransaction
          const session = await db.startSession();
          session.startTransaction();
          const emailVObj = {
            // userseq:userseq,
            email:sendEmailAdrr,
            verifynumber:verifyNum,
            reguser:sendEmailAdrr,
            upduser:sendEmailAdrr,
          }
          await EmailVerifications.deleteMany({
            email:sendEmailAdrr
          });
          const newEmailVerifications = new EmailVerifications(emailVObj);
          await newEmailVerifications.save();

          // 4. commit
          await session.commitTransaction();
          // 5. end Transaction
          session.endSession();

          sendObj = commonModules.sendObjSet("1030");
        }else{
          sendObj = commonModules.sendObjSet("1032");
          throw new Error(sendObj.code);
        }
      }
    }

    response.status(200).send({
        sendObj
    });

  } catch (error) {
    let obj = commonModules.sendObjSet(error.message); //code
    if(obj.code === ""){
      obj = commonModules.sendObjSet("1033");
    }
    response.status(500).send(obj);
  }
});

userRoute.post("/changepassword", getFields.none(), async (request, response) => {
  let sendObj = {};
  try{
    let date = new Date().toISOString();
    let upRes = await Users.updateOne(
        {email:request.body.email},
        {  
            "password":request.body.password, 
            "loginAttemptsCnt":0,
            "upddate":date,
            "updUser":request.body.email
        }
    )    
    if(upRes.modifiedCount > 0){
        sendObj = commonModules.sendObjSet("1040");
    }else{
        sendObj = commonModules.sendObjSet("1041");
    }

    response.status(200).send({
        sendObj
    });

  }catch(error){
    response.status(500).send(commonModules.sendObjSet("1042", error));
  }
});


userRoute.post("/usertranslatorupdate", getFields.none(), async (request, response) => {
  let sendObj = {};
  try{
    
    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
        
    if(!chechAuthRes){
      sendObj = commonModules.sendObjSet("2011");
    }else{    
      let date = new Date().toISOString();
      let upRes = await Users.updateOne(
          {userseq:request.body.userseq},
          {  
            "preferred_trans_lang":request.body.preferred_trans_lang,
            "upddate":date,
            "updUser":request.body.email
          }
      )

      sendObj = commonModules.sendObjSet("1060");

    }

    response.status(200).send({
        sendObj
    });

  }catch(error){
    response.status(500).send(commonModules.sendObjSet("1062", error));
  }
});





module.exports=userRoute