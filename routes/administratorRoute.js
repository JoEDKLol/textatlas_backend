const express=require('express')
const multer=require('multer')
const administratorRoute=express.Router()
let getFields=multer()
const commonModules = require("../utils/common");
const { default: mongoose } = require('mongoose')
const db = mongoose.connection;
const { sendEmailInquiry } = require('../utils/sendMail');

const checkAuth = require('../utils/checkAuth');
const Dictionaries = require("../models/dictionarySchemas"); 
const ObjectId = require("mongoose").Types.ObjectId;
const Inquiries = require("../models/inquirySchemas");
const sequence = require("../utils/sequences");


administratorRoute.get("/searchwordlist", getFields.none(), async (request, response) => { 
  let sendObj = {};

  try{

    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);

    if(!chechAuthRes){ 
      sendObj = commonModules.sendObjSet("2011");
    }else{

      const currentPage = request.query.currentPage;
      const pageListCnt = commonModules.dictionarySearchPage;
      const skipPage = pageListCnt*(currentPage-1);
      const reworkyn = request.query.reworkyn;

      const word = request.query.word;

      const findObj = {
        word: { $regex: new RegExp(`^${word}`, 'i') }, 
        // deleteyn:'n'
      }

      if(reworkyn){
        findObj.reworkynKR = (reworkyn === "1")?true:false;
      }

      const results = await Dictionaries.find(findObj)
      .sort({word:1})
      .lean()
      .skip(skipPage)
      .limit(pageListCnt);

      ;

      // console.log(results);

      sendObj = commonModules.sendObjSet("9030", results);
      response.status(200).send({
          sendObj
      });
    }

  }catch(error){
    // console.log(error);
    logger.error(error.message,  {...commonModules.sendObjSet("9032"), stack:error.stack});
    response.status(500).send(commonModules.sendObjSet("9032", error));
  }
});

//영한사전 업데이튼
administratorRoute.post("/administratorwordupdate", getFields.none(), async (request, response) => { 
  let sendObj = {};
  try{

    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);



    if(!chechAuthRes){
      sendObj = commonModules.sendObjSet("2011");
    }else{

      const _id = request.body._id;
      const word = request.body.word;
      const email = request.body.email;
      const reworkmeaningKR = request.body.reworkmeaningKR;
      const reworkynKR = request.body.reworkynKR;
      let savedWordYn = false;

      if(reworkynKR){

        const wordInfo = await Dictionaries.findOne({word:word.toLowerCase()});
        if(wordInfo){
          savedWordYn = true;
        }else{
          const dictionarykrsObj = {
            word:word,
            meaningKR:"",
            reworkmeaningKR:reworkmeaningKR,
            reworkynKR:true,
            reguser:request.body.email,
            upduser:request.body.email
          }
          const newDictionaries =new Dictionaries(dictionarykrsObj);
          let resDictionaries=await newDictionaries.save();
        }



        

      }else{
        let upRes = await Dictionaries.updateOne(
        {
          _id : new ObjectId(_id),
        },
        {
          "reworkmeaningKR":reworkmeaningKR,
          "reworkynKR":true,
          "upduser":email, 
          "upddate":Date.now()
        })
      }


      if(savedWordYn){
        sendObj = commonModules.sendObjSet("9043");
      }else{
        sendObj = commonModules.sendObjSet("9040");  
      }



      response.status(200).send({
          sendObj
      });
    }

  }catch(error){
    // console.log(error);
    logger.error(error.message,  {...commonModules.sendObjSet("9042"), stack:error.stack});
    response.status(500).send(commonModules.sendObjSet("9042", error));
  }
});

administratorRoute.post("/administratorwordlistsave", getFields.none(), async (request, response) => { 
  let sendObj = {};
  try{

    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);



    if(!chechAuthRes){
      sendObj = commonModules.sendObjSet("2011");
    }else{

      const email = request.body.email;
      const wordList = request.body.wordlist;

      const session = await db.startSession();
      session.startTransaction(); 

      for(let i=0; i<wordList.length; i++){

        const wordInfo = await Dictionaries.findOne({word:wordList[i].word.toLowerCase()});
        if(!wordInfo){  
          const dictionarykrsObj = {
            word:wordList[i].word,
            meaning:"",
            reworkmeaningKR:wordList[i].reworkmeaning,
            reworkynKR:true,
            reguser:email,
            upduser:email,
          }

          const newDictionaries =new Dictionaries(dictionarykrsObj);
          let resDictionaries=await newDictionaries.save();
        }else{
          let upRes = await Dictionaries.updateOne(
          {
            _id : wordInfo._id
          },
          {
            "reworkmeaning":wordList[i].reworkmeaning,
            "reworkyn":true,
            "upduser":email, 
            "upddate":Date.now()
          })
        }

      }

      await session.commitTransaction();
      session.endSession();

      sendObj = commonModules.sendObjSet("9050");

      response.status(200).send({
          sendObj
      });
    }

  }catch(error){
    
    logger.error(error.message,  {...commonModules.sendObjSet("9052"), stack:error.stack});
    response.status(500).send(commonModules.sendObjSet("9052", error));
  }
});

administratorRoute.get("/searchwordlistes", getFields.none(), async (request, response) => { 
  let sendObj = {};
  try{

    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
    
    


    if(!chechAuthRes){ 
      sendObj = commonModules.sendObjSet("2011");
    }else{

      const currentPage = request.query.currentPage;
      const pageListCnt = commonModules.dictionarySearchPage;
      const skipPage = pageListCnt*(currentPage-1);
      const reworkyn = request.query.reworkyn;

      const word = request.query.word;

      const findObj = {
        word: { $regex: new RegExp(`^${word}`, 'i') }, 
        // deleteyn:'n'
      }

      if(reworkyn){
        findObj.reworkynES = (reworkyn === "1")?true:false;
      }

      const results = await Dictionaries.find(findObj)
      .sort({word:1})
      .lean()
      .skip(skipPage)
      .limit(pageListCnt);

      ;

      sendObj = commonModules.sendObjSet("9030", results);
      response.status(200).send({
          sendObj
      });
    }

  }catch(error){
    logger.error(error.message,  {...commonModules.sendObjSet("9032"), stack:error.stack});
    response.status(500).send(commonModules.sendObjSet("9032", error));
  }
});

//영어 에스파뇨 사전 업데이트
administratorRoute.post("/administratorwordupdatees", getFields.none(), async (request, response) => { 
  let sendObj = {};
  try{
    // console.log("여기 안옴?");
    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);



    if(!chechAuthRes){
      sendObj = commonModules.sendObjSet("2011");
    }else{

      const _id = request.body._id;
      const word = request.body.word;
      const email = request.body.email;
      const reworkmeaningES = request.body.reworkmeaningES;
      const newWordYn = request.body.newWordYn;
      let savedWordYn = false;

      if(newWordYn){

        const wordInfo = await Dictionaries.findOne({word:word.toLowerCase()});
        if(wordInfo){
          savedWordYn = true;
        }else{
          const dictionarykrsObj = {
            word:word,
            reworkmeaningES:reworkmeaningES,
            reworkynES:true,
            reguser:request.body.email,
            upduser:request.body.email
          }
          const newDictionaries =new Dictionaries(dictionarykrsObj);
          let resDictionarykrs=await newDictionaries.save();
        }



        

      }else{
        let upRes = await Dictionaries.updateOne(
        {
          _id : new ObjectId(_id),
        },
        {
          "reworkmeaningES":reworkmeaningES,
          "reworkynES":true,
          "upduser":email, 
          "upddate":Date.now()
        })
      }


      if(savedWordYn){
        sendObj = commonModules.sendObjSet("9043");
      }else{
        sendObj = commonModules.sendObjSet("9040");  
      }



      response.status(200).send({
          sendObj
      });
    }

  }catch(error){
    // console.log(error);
    logger.error(error.message,  {...commonModules.sendObjSet("9042"), stack:error.stack});
    response.status(500).send(commonModules.sendObjSet("9042", error));
  }
});

administratorRoute.post("/administratorwordlistsavees", getFields.none(), async (request, response) => { 
  let sendObj = {};
  try{

    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);



    if(!chechAuthRes){
      sendObj = commonModules.sendObjSet("2011");
    }else{

      const email = request.body.email;
      const wordList = request.body.wordlist;

      const session = await db.startSession();
      session.startTransaction(); 

      for(let i=0; i<wordList.length; i++){

        const wordInfo = await Dictionaries.findOne({word:wordList[i].word.toLowerCase()});
        if(!wordInfo){  
          const dictionarykrsObj = {
            word:wordList[i].word,
            meaningES:"",
            reworkmeaningES:wordList[i].reworkmeaningES,
            reworkynES:true,
            reguser:email,
            upduser:email,
          }

          const newDictionaries =new Dictionaries(dictionarykrsObj);
          let resDictionarykrs=await newDictionaries.save();
        }else{
          let upRes = await Dictionaries.updateOne(
          {
            _id : wordInfo._id
          },
          {
            "reworkmeaningES":wordList[i].reworkmeaningES,
            "reworkynES":true,
            "upduser":email, 
            "upddate":Date.now()
          })
        }

      }

      await session.commitTransaction();
      session.endSession();

      sendObj = commonModules.sendObjSet("9050");

      response.status(200).send({
          sendObj
      });
    }

  }catch(error){
    // console.log(error);
    logger.error(error.message,  {...commonModules.sendObjSet("9052"), stack:error.stack});
    response.status(500).send(commonModules.sendObjSet("9052", error));
  }
});

//Contact Us 사용자가 문의사항 전달
administratorRoute.post("/contactussend", getFields.none(), async (request, response) => { 
  let sendObj = {};
  try{

    const email = request.body.email;
    const inquiry = request.body.inquiry;
    const content = request.body.content;
    const userinfo = request.body.userinfo;
    const nameField = request.body.nameField;
    const useremail = request.body.useremail;
    const language = request.body.language;

    

    if(nameField){ //허니팟 봇인경우 완료처리 리턴해줌
      sendObj = commonModules.sendObjSet("9050");
    }else{
      // 고객에게 email 전송
      

      const inquiry_seq = await sequence.getSequence("inquiry_seq");
      const inquiryObj = {
        inquiry_seq:inquiry_seq,
        email:email,
        inquiry:inquiry,
        content:content,
        userinfo:(userinfo)?new ObjectId(userinfo):null,
        ip_address:request.ip,
        reguser:(useremail)?useremail:email,
        upduser:(useremail)?useremail:email, 
      }
      
      const resEmailSend = await sendEmailInquiry(email, language, inquiryObj);
      // console.log(resEmailSend);
      // const newDictionaries =new Dictionaries(dictionarykrsObj);
      //     let resDictionaries=await newDictionaries.save();

      const newInquiries = new Inquiries(inquiryObj);
      const resInquiries = await newInquiries.save();


      // const session = await db.startSession();
      // session.startTransaction(); 

      

      // await session.commitTransaction();
      // session.endSession();

      sendObj = commonModules.sendObjSet("9050");
    }

    response.status(200).send({
        sendObj
    });
    

  }catch(error){
    logger.error(error.message,  {...commonModules.sendObjSet("9052"), stack:error.stack});
    response.status(500).send(commonModules.sendObjSet("9052", error));
  }
});



module.exports=administratorRoute