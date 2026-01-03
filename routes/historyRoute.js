const express=require('express')
const multer=require('multer')
const historyRoute=express.Router()
let getFields=multer()
const Books = require("../models/bookSchemas");
const ObjectId = require("mongoose").Types.ObjectId;
const commonModules = require("../utils/common");
const translate = require('../utils/translate');
const Readinghistories = require("../models/readinghistorySchemas");
const mongoose = require('mongoose'); // mongoose import
const checkAuth = require('../utils/checkAuth');

const Dictionaries = require("../models/dictionarySchemas");
const Learningwords = require("../models/learningwordSchemas");
const Learningsentences = require("../models/learningsentenceSchemas");
const Translatedhistories = require('../models/translatedhistorySchemas');
const Hotwords = require('../models/hotwordSchemas');


//사용자별 읽은 책 정보 조회
historyRoute.get("/booklistsearch", getFields.none(), async (request, response) => {
  try {
      
    let sendObj = {};

    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
        
    if(!chechAuthRes){
      sendObj = commonModules.sendObjSet("2011");
    }else{

      let keyword =  request.query.keyword; 
      const listPage = request.query.listPage;
      const pageListCnt = commonModules.bookHisSearchPage; //10개씩 조회 
      const skipPage = pageListCnt*(listPage-1);
      const userseq = parseInt(request.query.userseq);
      const userByTotalSearchYn = request.query.userByTotalSearchYn;

      let searchCondition;

      if(keyword){
        searchCondition = {
          $text:{$search:keyword},
        }
      }else{
        searchCondition = {}
      }

      searchCondition.userseq = userseq;

      let booksDate = await Readinghistories.find(searchCondition
        // ,{
        //   "book_seq":1,
        //   "book_id":1,
        //   "title":1,
        //   "book_title":1,
        //   "images":1,
        // }
      )
      .sort({book_seq:-1})
      .lean()
      .skip(skipPage)
      .limit(pageListCnt);
      ;

      //집계 조회 해당 사용자가 읽은 책, 읽기 완료, 읽기 중

      let userByTotal = [];

      if(userByTotalSearchYn === "false"){
        userByTotal = await Readinghistories.aggregate([
        {
          $match: {
            'userseq' : userseq
          }
        },
        {
          $addFields: { // 임시 필드를 추가하여 read_complete_time의 상태를 명확히 합니다.
            "isCompletedFieldPresent": {
              $cond: {
                if: { $ne: ["$readcompletedt", "$$REMOVE"] }, // read_complete_time 필드가 존재한다면
                then: true,
                else: false // 존재하지 않는다면
              }
            }
          }
        },
        {
          $group: {
            _id: "$userseq", // 그룹화할 필드
            totalBooks: {
              $sum: 1 // 해당 사용자가 읽었거나 읽고 있는 전체 책의 수
            },
            inProgressBooks: { // '읽는 중인 책'의 수입니다. (read_complete_time 필드가 없거나 null인 경우)
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $eq: ["$readcompletedt", null] }, // read_complete_time 필드가 null인 경우
                      { $eq: ["$isCompletedFieldPresent", false] } // read_complete_time 필드 자체가 없는 경우
                    ]
                  },
                  1, // 조건을 만족하면 1을 더합니다.
                  0  // 아니면 0을 더합니다.
                ]
              }
            },
            completedBooks: { // '읽기 완료한 책'의 수입니다. (read_complete_time 필드가 존재하고 null이 아닌 경우)
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$readcompletedt", true] }, // read_complete_time 필드가 존재하는 경우
                      { $ne: ["$read_complete_time", null] }     // read_complete_time 필드 값이 null이 아닌 경우
                    ]
                  },
                  1, // 조건을 만족하면 1을 더합니다.
                  0  // 아니면 0을 더합니다.
                ]
              }
            }
          }
        }
      ]);
      }



      const resObj = {
        books : booksDate,
        // totalCnt : totalCnt, 
        userByTotal : userByTotal
      }
      sendObj = commonModules.sendObjSet("3050", resObj);
    }

    

    response.status(200).send({
        sendObj
    });

  } catch (error) {
    // console.log(error);
    response.status(500).send(commonModules.sendObjSet("3052", error));
      
  }
});

//사용자가 선택한 책의 저장한 단어리스트 조회
historyRoute.get("/booksavedwordsearch", getFields.none(), async (request, response) => {
  try {
      
    let sendObj = {};

    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
        
    if(!chechAuthRes){
      sendObj = commonModules.sendObjSet("2011");
    }else{

      const currentPage = request.query.currentPage;
      const pageListCnt = commonModules.bookSavedWordSearchPage; //10개씩 조회 
      const skipPage = pageListCnt*(currentPage-1);
      const userseq = parseInt(request.query.userseq);
      const book_seq = parseInt(request.query.book_seq);
      
      const resObj = await Learningwords.find({
        userseq:userseq,
        book_seq:book_seq
      })
      .sort({learningdt:-1})
      .lean()
      .skip(skipPage)
      .limit(pageListCnt)
      .populate('wordinfo', {_id:0, meaningKR:1, reworkmeaningKR:1, reworkynKR:1, meaningES:1, reworkmeaningES:1, reworkynES:1}).exec()
      ;
      
      sendObj = commonModules.sendObjSet("3060", resObj);
    }

    

    response.status(200).send({
        sendObj
    });

  } catch (error) {
    // console.log(error);
    response.status(500).send(commonModules.sendObjSet("3062", error));
      
  }
});

//사용자가 선택한 책의 저장한 문장리스트 조회
historyRoute.get("/booksavedsentencesearch", getFields.none(), async (request, response) => {
  try {
      
    let sendObj = {};

    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
        
    if(!chechAuthRes){
      sendObj = commonModules.sendObjSet("2011");
    }else{

      const currentPage = request.query.currentPage;
      const pageListCnt = commonModules.bookSavedSentenceSearchPage; //10개씩 조회 
      // const pageListCnt = 1
      const skipPage = pageListCnt*(currentPage-1);
      const userseq = parseInt(request.query.userseq);
      const book_seq = parseInt(request.query.book_seq);
      
      const resObj = await Learningsentences.find({
        userseq:userseq,
        book_seq:book_seq
      })
      .sort({learningdt:-1})
      .lean()
      .skip(skipPage)
      .limit(pageListCnt);
      
      sendObj = commonModules.sendObjSet("3070", resObj);
    }

    

    response.status(200).send({
        sendObj
    });

  } catch (error) {
    // console.log(error);
    response.status(500).send(commonModules.sendObjSet("3072", error));
      
  }
});

//단어가 포함된 문장 번역
historyRoute.get("/translatesentenceword", getFields.none(), async (request, response) => {
  try {
      
    let sendObj = {};

    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
        
    if(!chechAuthRes){
      sendObj = commonModules.sendObjSet("2011");
    }else{

      const userseq = parseInt(request.query.userseq);
      const book_seq = parseInt(request.query.book_seq);
      const page = parseInt(request.query.page);
      const sentenceindex = parseInt(request.query.sentenceindex);

      // const resObj = await Learningsentences.findOne({
      //   userseq:userseq,
      //   book_seq:book_seq,
      //   page:page,
      //   sentenceindex:sentenceindex

      // })

      let booksDateF = await Books.findOne({book_seq:book_seq},
        {
          "pages":{ $slice: [page-1, 1] }, //1페이지씩 조회
          "translator_kr":{ $slice: [page-1, 1] }, 
          "translator_sp":{ $slice: [page-1, 1] },
        }
      ) 

      const retObj = {
        translatedsentenceKR:booksDateF.translator_kr[0].contentarr[sentenceindex].text,
        translatedsentenceES:booksDateF.translator_sp[0].contentarr[sentenceindex].text,
      }
      ;
      
      sendObj = commonModules.sendObjSet("3080", retObj);
    }

    

    response.status(200).send({
        sendObj
    });

  } catch (error) {
    // console.log(error);
    response.status(500).send(commonModules.sendObjSet("3082", error));
      
  }
});

//단어 별표시
historyRoute.post("/wordimportance", getFields.none(), async (request, response) => {
  try {

    let sendObj = {};

    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
    
      if(!chechAuthRes){
        sendObj = commonModules.sendObjSet("2011");
      }else{
        const _id = new ObjectId(request.body._id);
        const importance = parseInt(request.body.importance);
        const email = request.body.email;
        let date = new Date().toISOString();


        const resLearningwords = await Learningwords.updateOne({
          _id:_id
        },{
          "importance":importance,
          "upddate":date,
          "updUser":email
        })
        ;

        sendObj = commonModules.sendObjSet("3090", resLearningwords);
        
      }
    response.status(200).send({
      sendObj
    });
  } catch (error) {
    response.status(500).send(commonModules.sendObjSet("3092", error));
  }
});

historyRoute.post("/sentenceimportance", getFields.none(), async (request, response) => {
  try {

    let sendObj = {};

    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
    
      if(!chechAuthRes){
        sendObj = commonModules.sendObjSet("2011");
      }else{
        const _id = new ObjectId(request.body._id);
        const importance = parseInt(request.body.importance);
        const email = request.body.email;
        let date = new Date().toISOString();

        const resLearningsentences = await Learningsentences.updateOne({
          _id:_id
        },{
          "importance":importance,
          "upddate":date,
          "updUser":email
        })
        ;

        sendObj = commonModules.sendObjSet("3100", resLearningsentences);
        
      }
    response.status(200).send({
      sendObj
    });
  } catch (error) {
    response.status(500).send(commonModules.sendObjSet("3102", error));
  }
});

//사용자가 저장한 단어리스트 조회 (현재 가장 최근에 저장한 순서대로 조회됨.)
//
historyRoute.get("/savedwordsearch", getFields.none(), async (request, response) => {
  try {
      
    let sendObj = {};

    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
        
    if(!chechAuthRes){
      sendObj = commonModules.sendObjSet("2011");
    }else{

      const currentPage = request.query.currentPage;
      const pageListCnt = commonModules.bookSavedWordSearchPage; //10개씩 조회 
      const skipPage = pageListCnt*(currentPage-1);
      const userseq = parseInt(request.query.userseq);
      const keyword = request.query.keyword;
      const orderType = parseInt(request.query.orderType);
      // const learningyn = request.query.learningyn; //학습완료여부

      let orderTypeObj = {
        learningdt:-1
      }

      if(orderType === 1){ //오름차순
        orderTypeObj = {
          importance:-1,
          learningdt:-1
        }
      }else if(orderType === 2){ //내림차순
        orderTypeObj = {
          importance:1,
          learningdt:-1
        }
      }

      let searchCondition;

      if(keyword){
        searchCondition = {
           word: { $regex: new RegExp(`^${keyword}`, 'i') },
        }
      }else{
        searchCondition = {}
      }

      searchCondition.userseq = userseq;
      // searchCondition.learningyn = learningyn;

      // console.log(searchCondition);
      
      const resObj = await Learningwords.find(
        searchCondition
      )
      .sort(orderTypeObj)
      .lean()
      .skip(skipPage)
      .limit(pageListCnt)
      .populate('wordinfo', {_id:0, meaningKR:1, reworkmeaningKR:1, reworkynKR:1, meaningES:1, reworkmeaningES:1, reworkynES:1}).exec()
      ;


      sendObj = commonModules.sendObjSet("3110", resObj);
    }

    

    response.status(200).send({
        sendObj
    });

  } catch (error) {
    response.status(500).send(commonModules.sendObjSet("3112", error));
      
  }
});

//사용자가 저장한 문장리스트 조회 (현재 가장 최근에 저장한 순서대로 조회됨.)
//
historyRoute.get("/savedsentencesearch", getFields.none(), async (request, response) => {
  try {
      
    let sendObj = {};

    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
        
    if(!chechAuthRes){
      sendObj = commonModules.sendObjSet("2011");
    }else{

      const currentPage = request.query.currentPage;
      const pageListCnt = commonModules.bookSavedSentenceSearchPage; //10개씩 조회 
      const skipPage = pageListCnt*(currentPage-1);
      const userseq = parseInt(request.query.userseq);
      const keyword = request.query.keyword;
      const orderType = parseInt(request.query.orderType);
      // const learningyn = request.query.learningyn; //학습완료여부

      let orderTypeObj = {
        learningdt:-1
      }

      if(orderType === 1){ //오름차순
        orderTypeObj = {
          importance:-1,
          learningdt:-1
        }
      }else if(orderType === 2){ //내림차순
        orderTypeObj = {
          importance:1,
          learningdt:-1
        }
      }

      let searchCondition;

      if(keyword){
        searchCondition = {
           $text:{$search:keyword},
        }
      }else{
        searchCondition = {}
      }

      searchCondition.userseq = userseq;
      // searchCondition.learningyn = learningyn;
      
      const resObj = await Learningsentences.find(
        searchCondition
      )
      .sort(orderTypeObj)
      .lean()
      .skip(skipPage)
      .limit(pageListCnt)
      ;


      sendObj = commonModules.sendObjSet("3120", resObj);
    }

    

    response.status(200).send({
        sendObj
    });

  } catch (error) {
    console.log(error);
    response.status(500).send(commonModules.sendObjSet("3122", error));
      
  }
});

//단어 학습완료업데이트
historyRoute.post("/wordlearningfinish", getFields.none(), async (request, response) => {
  try {

    let sendObj = {};

    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
    
      if(!chechAuthRes){
        sendObj = commonModules.sendObjSet("2011");
      }else{
        const _id = new ObjectId(request.body._id);
        const email = request.body.email;
        let date = new Date().toISOString();

        const resLearningwords = await Learningwords.updateOne({
          _id:_id
        },{
          "learningyn":true,
          "upddate":date,
          "updUser":email
        })
        ;

        sendObj = commonModules.sendObjSet("3130");
        
      }
    response.status(200).send({
      sendObj
    });
  } catch (error) {
    response.status(500).send(commonModules.sendObjSet("3132", error));
  }
});


//학습 단어 조회
historyRoute.get("/learnwordsearch", getFields.none(), async (request, response) => {
  try {
      
    let sendObj = {};

    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
        
    if(!chechAuthRes){
      sendObj = commonModules.sendObjSet("2011");
    }else{

      // const currentPage = request.query.currentPage;
      const pageListCnt = commonModules.bookSavedWordSearchPage; //10개씩 조회 
      // const skipPage = pageListCnt*(currentPage-1);
      const userseq = parseInt(request.query.userseq);
      const keyword = request.query.keyword;
      const orderType = parseInt(request.query.orderType);
      const learningyn = request.query.learningyn; //학습완료여부
      const lastSeq = parseInt(request.query.lastSeq); 

      let orderTypeObj = {
        learningdt:-1
      }

      if(orderType === 1){ //오름차순
        orderTypeObj = {
          importance:-1,
          learningdt:-1
        }
      }else if(orderType === 2){ //내림차순
        orderTypeObj = {
          importance:1,
          learningdt:-1
        }
      }

      let searchCondition;

      if(keyword){
        searchCondition = {
           word: { $regex: new RegExp(`^${keyword}`, 'i') },
        }
      }else{
        searchCondition = {}
      }

      searchCondition.userseq = userseq;
      searchCondition.learningyn = learningyn;

      if(lastSeq > 0){
        searchCondition.seq = {"$lt":lastSeq}
      }

      const resObj = await Learningwords.find(
        searchCondition
      )
      .sort(orderTypeObj)
      .limit(pageListCnt)
      .populate('wordinfo', {_id:0, meaningKR:1, reworkmeaningKR:1, reworkynKR:1, meaningES:1, reworkmeaningES:1, reworkynES:1}).exec()
      ;

      sendObj = commonModules.sendObjSet("3140", resObj);
    }

    response.status(200).send({
        sendObj
    });

  } catch (error) {
    // console.log(error);
    response.status(500).send(commonModules.sendObjSet("3142", error));
      
  }
});

//학습 단어 건수 조회 탭 이동시 조회됨 
historyRoute.get("/learnwordcntsearch", getFields.none(), async (request, response) => {
  try {
      
    let sendObj = {};

    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
        
    if(!chechAuthRes){
      sendObj = commonModules.sendObjSet("2011");
    }else{

      const userseq = parseInt(request.query.userseq);

      // console.log(searchCondition);
      //전체 건수
      let userbywordtotalcnt = await Learningwords.countDocuments(
        {userseq:userseq}
      );

      let userbywordcnt = await Learningwords.countDocuments( //학습 중인 단어 건수
        {userseq:userseq, learningyn:false}
      );

      let userbywordlearnedcnt = await Learningwords.countDocuments( //학습 완료 단어 건수
        {userseq:userseq, learningyn:true}
      );
      
      

      const obj = {
        userbywordtotalcnt:userbywordtotalcnt,
        userbywordcnt:userbywordcnt,
        userbywordlearnedcnt:userbywordlearnedcnt,
      }

      sendObj = commonModules.sendObjSet("3150", obj);
    }

    response.status(200).send({
        sendObj
    });

  } catch (error) {
    response.status(500).send(commonModules.sendObjSet("3152", error));
      
  }
});

//학습 문장 조회
historyRoute.get("/learnsentencesearch", getFields.none(), async (request, response) => {
  try {
      
    let sendObj = {};

    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
        
    if(!chechAuthRes){
      sendObj = commonModules.sendObjSet("2011");
    }else{

      const pageListCnt = commonModules.bookSavedSentenceSearchPage; //10개씩 조회 
      const userseq = parseInt(request.query.userseq);
      const keyword = request.query.keyword;
      const orderType = parseInt(request.query.orderType);
      const learningyn = request.query.learningyn; //학습완료여부
      const lastSeq = parseInt(request.query.lastSeq); //직전 조회의 마지막 seq 
      
      let orderTypeObj = {
        learningdt:-1
      }

      if(orderType === 1){ //오름차순
        orderTypeObj = {
          importance:-1,
          learningdt:-1
        }
      }else if(orderType === 2){ //내림차순
        orderTypeObj = {
          importance:1,
          learningdt:-1
        }
      }

      let searchCondition;

      if(keyword){
        searchCondition = {
           $text:{$search:keyword},
        }
      }else{
        searchCondition = {}
      }

      searchCondition.userseq = userseq;
      searchCondition.learningyn = learningyn;

      if(lastSeq > 0){
        searchCondition.seq = {"$lt":lastSeq}
      }
      
      const resObj = await Learningsentences.find(
        searchCondition
      )
      .sort(orderTypeObj)
      .limit(pageListCnt)
      ;


      sendObj = commonModules.sendObjSet("3160", resObj);
    }

    

    response.status(200).send({
        sendObj
    });

  } catch (error) {
    response.status(500).send(commonModules.sendObjSet("3162", error));
      
  }
});

//학습 문장 건수 조회 탭 이동시 조회됨 
historyRoute.get("/learnsentencecntsearch", getFields.none(), async (request, response) => {
  try {
      
    let sendObj = {};

    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
        
    if(!chechAuthRes){
      sendObj = commonModules.sendObjSet("2011");
    }else{

      const userseq = parseInt(request.query.userseq);

      // console.log(searchCondition);
      //전체 건수
      let userbysentencetotalcnt = await Learningsentences.countDocuments(
        {userseq:userseq}
      );

      let userbysentencecnt = await Learningsentences.countDocuments( //학습 중인 단어 건수
        {userseq:userseq, learningyn:false}
      );

      let userbysentencelearnedcnt = await Learningsentences.countDocuments( //학습 완료 단어 건수
        {userseq:userseq, learningyn:true}
      );
      
      

      const obj = {
        userbysentencetotalcnt:userbysentencetotalcnt,
        userbysentencecnt:userbysentencecnt,
        userbysentencelearnedcnt:userbysentencelearnedcnt,
      }

      sendObj = commonModules.sendObjSet("3170", obj);
    }

    response.status(200).send({
        sendObj
    });

  } catch (error) {
    response.status(500).send(commonModules.sendObjSet("3172", error));
      
  }
});



//문장 학습완료업데이트
historyRoute.post("/sentencelearningfinish", getFields.none(), async (request, response) => {
  try {

    let sendObj = {};

    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
    
      if(!chechAuthRes){
        sendObj = commonModules.sendObjSet("2011");
      }else{
        const _id = new ObjectId(request.body._id);
        const email = request.body.email;
        let date = new Date().toISOString();

        const resLearningsentences = await Learningsentences.updateOne({
          _id:_id
        },{
          "learningyn":true,
          "upddate":date,
          "updUser":email
        })
        ;

        sendObj = commonModules.sendObjSet("3130");
        
      }
    response.status(200).send({
      sendObj
    });
  } catch (error) {
    response.status(500).send(commonModules.sendObjSet("3132", error));
  }
});

module.exports=historyRoute