const express=require('express')
const multer=require('multer')
const messageRoute=express.Router()
let getFields=multer()
const commonModules = require("../utils/common");
const { default: mongoose } = require('mongoose')
const db = mongoose.connection;
const { sendEmail } = require('../utils/sendMail');
const checkAuth = require('../utils/checkAuth');
const Dictionaries = require("../models/dictionarySchemas"); 
const ObjectId = require("mongoose").Types.ObjectId;
const Messages = require("../models/messageSchemas");
const sequence = require("../utils/sequences");

//쪽지함 조회
messageRoute.get("/messagelistsearch", getFields.none(), async (request, response) => {
  try {
      
    let sendObj = {};

    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken); //로그인이 필요함.
        
    if(!chechAuthRes){
      sendObj = commonModules.sendObjSet("2011");
    }else{

      const resObj = await Messages.find({});
      sendObj = commonModules.sendObjSet("3330", resObj);
    }

    response.status(200).send({
        sendObj
    });

  } catch (error) {
    // console.log(error);
    response.status(500).send(commonModules.sendObjSet("3332", error));
      
  }
});

//쪽지보내기
messageRoute.post("/messagesend", getFields.none(), async (request, response) => {
  try {
      
    let sendObj = {};

    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken); //로그인이 필요함.
        
    if(!chechAuthRes){
      sendObj = commonModules.sendObjSet("2011");
    }else{

      const message_seq = await sequence.getSequence("message_seq");
      const send_user_seq = parseInt(request.body.send_user_seq);
      const receive_user_seq = parseInt(request.body.receive_user_seq);
      const title = request.body.title;
      const message = request.body.message;
      const send_userinfo = new ObjectId(request.body.send_userinfo);
      const receive_userinfo = new ObjectId(request.body.receive_userinfo);


      const messageObj = {
        message_seq:message_seq,
        send_user_seq:send_user_seq,
        receive_user_seq:receive_user_seq,
        title:title,
        message:message,
        send_userinfo:send_userinfo,
        receive_userinfo:receive_userinfo,
        reguser:request.body.email,
        upduser:request.body.email,
      }

      const newMessages = new Messages(messageObj);
      const resMessages = await newMessages.save();


      sendObj = commonModules.sendObjSet("3340");
    }

    

    response.status(200).send({
        sendObj
    });

  } catch (error) {
    console.log(error);
    response.status(500).send(commonModules.sendObjSet("3342", error));
      
  }
});


module.exports=messageRoute