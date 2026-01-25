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

//쪽지함 조회 - 전체
messageRoute.get("/messagelistsearch", getFields.none(), async (request, response) => {
  try {
      
    let sendObj = {};

    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken); //로그인이 필요함.
        
    if(!chechAuthRes){
      sendObj = commonModules.sendObjSet("2011");
    }else{

      const pageListCnt = commonModules.messageSearchPage; //10개씩 조회 
      const lastSeq = parseInt(request.query.lastSeq); //직전 조회의 마지막 seq
      const userseq = parseInt(request.query.userseq);

      let searchCondition = {
        $or: [ { send_user_seq:userseq, send_msg_deleteyn:false }, { receive_user_seq:userseq, receive_msg_deleteyn:false } ],
        
      };

      
      if(lastSeq > 0){
        searchCondition.message_seq = {"$lt":lastSeq};
      }

      // console.log(searchCondition);
      const resObj = await Messages.find(
         searchCondition 
      )
      .sort({message_seq:-1})
      .limit(pageListCnt)
      .populate('send_userinfo', {_id:1, userseq:1, email:1, username:1, userimg:1, userthumbImg:1, introduction:1})
      .populate('receive_userinfo', {_id:1, userseq:1, email:1, username:1, userimg:1, userthumbImg:1, introduction:1})
      .exec()
      ;

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
        receive_user_seq:receive_user_seq, //받은 사람이 로그인사용자(나) 인 경우
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
    // console.log(error);
    response.status(500).send(commonModules.sendObjSet("3342", error));
      
  }
});

//내용확인 업데이트
messageRoute.post("/receivemessagecheck", getFields.none(), async (request, response) => {
  try {
      
    let sendObj = {};

    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken); //로그인이 필요함.
        
    if(!chechAuthRes){
      sendObj = commonModules.sendObjSet("2011");
    }else{


      const date = new Date().toISOString();
      const userseq = request.body.userseq;

      const updateMessages=await Messages.findOneAndUpdate(
        {
          message_seq:request.body.message_seq,
        },
        {
          
          "receive_time":commonModules.getDateStringYYYYMMDDhhmmss(),
          "msg_checkyn":true,
          "upduser":request.body.email,
          "upddate":date,
        },
        { new: true } // 옵션: 새 문서 반환

      );

      //읽지 않은 메시지 건수조회
      const resMessagesCnt = await Messages.countDocuments(
        {receive_user_seq:userseq, msg_checkyn:false, receive_msg_deleteyn:false }
      )

      const resObj = {
        updateMessages:updateMessages,
        cnt:resMessagesCnt
      }
      
      sendObj = commonModules.sendObjSet("3350", resObj);
    }

    response.status(200).send({
        sendObj
    });

  } catch (error) {
    // console.log(error);
    response.status(500).send(commonModules.sendObjSet("3352", error));
      
  }
});

//읽지 않은 메시지 건수 조회
messageRoute.get("/unreadmessagecnt", getFields.none(), async (request, response) => {
  try {
      
    let sendObj = {};

    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken); //로그인이 필요함.
        
    if(!chechAuthRes){
      sendObj = commonModules.sendObjSet("2011");
    }else{
      const userseq = request.query.userseq; 
      const resMessagesCnt = await Messages.countDocuments(
        {receive_user_seq:userseq, msg_checkyn:false, receive_msg_deleteyn:false }
      )
      
      sendObj = commonModules.sendObjSet("3360", resMessagesCnt);
    }

    response.status(200).send({
        sendObj
    });

  } catch (error) {
    // console.log(error);
    response.status(500).send(commonModules.sendObjSet("3362", error));
      
  }
});

// 메시지 삭제
messageRoute.post("/deletemessage", getFields.none(), async (request, response) => {
  try {
      
    let sendObj = {};

    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken); //로그인이 필요함.
        
    if(!chechAuthRes){
      sendObj = commonModules.sendObjSet("2011");
    }else{


      const date = new Date().toISOString();
      const sendMessageYn = request.body.sendMessageYn;  //false:받은메시지, true:보낸메시지
      const userseq = request.body.userseq;

      const queryCondition = {
        "upduser":request.body.email,
        "upddate":date,
      }
      if(sendMessageYn){ //내가 보낸 메시지
        queryCondition.send_msg_deleteyn = true;
      }else{
        queryCondition.receive_msg_deleteyn = true;
      }

      // console.log(queryCondition);
      const deleteMessages=await Messages.findOneAndUpdate(
        {
          message_seq:request.body.message_seq,
        },
        
        queryCondition ,
        
        { new: true } // 옵션: 새 문서 반환

      );

      //읽지 않은 메시지 건수조회
      const resMessagesCnt = await Messages.countDocuments(
        {receive_user_seq:userseq, msg_checkyn:false, receive_msg_deleteyn:false }
      )

      const resObj = {
        deleteMessages:deleteMessages,
        cnt:resMessagesCnt
      }
      
      sendObj = commonModules.sendObjSet("3370", resObj);
    }

    response.status(200).send({
        sendObj
    });

  } catch (error) {
    // console.log(error);
    response.status(500).send(commonModules.sendObjSet("3372", error));
      
  }
});

//쪽지함 조회 - 받은
messageRoute.get("/resmessagelistallsearch", getFields.none(), async (request, response) => {
  try {
      
    let sendObj = {};

    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken); //로그인이 필요함.
        
    if(!chechAuthRes){
      sendObj = commonModules.sendObjSet("2011");
    }else{

      const pageListCnt = commonModules.messageSearchPage; //10개씩 조회 
      const lastSeq = parseInt(request.query.lastSeq); //직전 조회의 마지막 seq
      const userseq = parseInt(request.query.userseq);

      let searchCondition = {
        receive_user_seq:userseq, receive_msg_deleteyn:false,
      };

      
      if(lastSeq > 0){
        searchCondition.message_seq = {"$lt":lastSeq};
      }

      // console.log(searchCondition);
      const resObj = await Messages.find(
         searchCondition 
      )
      .sort({message_seq:-1})
      .limit(pageListCnt)
      .populate('send_userinfo', {_id:1, userseq:1, email:1, username:1, userimg:1, userthumbImg:1, introduction:1})
      .populate('receive_userinfo', {_id:1, userseq:1, email:1, username:1, userimg:1, userthumbImg:1, introduction:1})
      .exec()
      ;

      sendObj = commonModules.sendObjSet("3380", resObj);
    }

    response.status(200).send({
        sendObj
    });

  } catch (error) {
    // console.log(error);
    response.status(500).send(commonModules.sendObjSet("3382", error));
      
  }
});

// 
messageRoute.get("/sendmessagelistallsearch", getFields.none(), async (request, response) => {
  try {
      
    let sendObj = {};

    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken); //로그인이 필요함.
        
    if(!chechAuthRes){
      sendObj = commonModules.sendObjSet("2011");
    }else{

      const pageListCnt = commonModules.messageSearchPage; //10개씩 조회 
      const lastSeq = parseInt(request.query.lastSeq); //직전 조회의 마지막 seq
      const userseq = parseInt(request.query.userseq);

      let searchCondition = {
        send_user_seq:userseq, send_msg_deleteyn:false,
      };

      
      if(lastSeq > 0){
        searchCondition.message_seq = {"$lt":lastSeq};
      }

      // console.log(searchCondition);
      const resObj = await Messages.find(
         searchCondition 
      )
      .sort({message_seq:-1})
      .limit(pageListCnt)
      .populate('send_userinfo', {_id:1, userseq:1, email:1, username:1, userimg:1, userthumbImg:1, introduction:1})
      .populate('receive_userinfo', {_id:1, userseq:1, email:1, username:1, userimg:1, userthumbImg:1, introduction:1})
      .exec()
      ;

      sendObj = commonModules.sendObjSet("3390", resObj);
    }

    response.status(200).send({
        sendObj
    });

  } catch (error) {
    // console.log(error);
    response.status(500).send(commonModules.sendObjSet("3392", error));
      
  }
});

module.exports=messageRoute