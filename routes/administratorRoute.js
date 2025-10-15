const express=require('express')
const multer=require('multer')
const administratorRoute=express.Router()
let getFields=multer()
const commonModules = require("../utils/common");
const { default: mongoose } = require('mongoose')
const db = mongoose.connection;
const { sendEmail } = require('../utils/sendMail');
const checkAuth = require('../utils/checkAuth');
const Dictionaries = require("../models/dictionarySchemas"); 
const ObjectId = require("mongoose").Types.ObjectId;

//administrator
// administratorRoute.get("/codesearch", getFields.none(), async (request, response) => { 
//   try {
//     let sendObj = {};
    
//     const subcode = request.query.subcode;
//     const type = request.query.type;

//     let retCode
//     if(type === "a"){
//       retCode = await code.getSubCodeStr(subcode);
//     }else if(type === "b"){
//       retCode = await code.getSubCodeArr(subcode.split(","));
//     }

//     if(retCode === "error"){
//       sendObj = commonModules.sendObjSet("9001");
//     }else{
//       sendObj = commonModules.sendObjSet("9000", retCode);
//     }
    
    
//     response.status(200).send({
//       sendObj
//   });
//   } catch (error) {
    
//     response.status(500).send(obj);
//   }
// });

// administratorRoute.post("/saveaticles", getFields.none(), async (request, response) => { 
//   let sendObj = {};
//   try{

//     let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);



//     if(!chechAuthRes){
//       sendObj = commonModules.sendObjSet("2011");
//     }else{

//       const articleArr = request.body.articleArr
//       let articleArrInsert = [];
//       for(let i=0; i<articleArr.length; i++){
        
//         const article_seq = await sequence.getSequence("article_seq");
//         const obj = {
//           articleseq: article_seq, 
//           level:articleArr[i].level, 
//           category:articleArr[i].category, 
//           categorydetail:articleArr[i].categorydetail, 
//           title:articleArr[i].title, 
//           contenten:articleArr[i].contenten, 
//           img:articleArr[i].img, 
//           link:articleArr[i].link, 
//           reguser:"AI System",
//           upduser:"AI System",
//         }
//         articleArrInsert.push(obj);
//       }

//       const result = await Article.insertMany(articleArrInsert);

//       sendObj = commonModules.sendObjSet("9010");


//       response.status(200).send({
//           sendObj
//       });
//     }

//   }catch(error){
//     response.status(500).send(commonModules.sendObjSet("9012", error));
//   }
// });


//
// administratorRoute.post("/deletearticles", getFields.none(), async (request, response) => { 
//   let sendObj = {};
//   try{

//     let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);



//     if(!chechAuthRes){
//       sendObj = commonModules.sendObjSet("2011");
//     }else{

//       sendObj = commonModules.sendObjSet("9020");
//       response.status(200).send({
//           sendObj
//       });
//     }

//   }catch(error){
//     response.status(500).send(commonModules.sendObjSet("9022", error));
//   }
// });

administratorRoute.get("/searchwordlist", getFields.none(), async (request, response) => { 
  let sendObj = {};

  // console.log("여기 온다?");
  
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
        word: { $regex: new RegExp(`^${word}`, 'i') }, deleteyn:'n'
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
    console.log(error);
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
        word: { $regex: new RegExp(`^${word}`, 'i') }, deleteyn:'n'
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
    console.log(error);
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
          let resDictionarykrs=await newDictionarykrs.save();
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
    response.status(500).send(commonModules.sendObjSet("9052", error));
  }
});


module.exports=administratorRoute