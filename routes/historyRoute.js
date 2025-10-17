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

      // const rgx = (pattern) => new RegExp(`^${pattern}.*`, 'i');
      // const searchRgx = rgx(keyword);

      if(keyword){
        searchCondition = {
          $text:{$search:keyword},
        }
      }else{
        searchCondition = {}
      }

      searchCondition.userseq = userseq;

      // console.log(searchCondition);


      // let totalCnt = await Readinghistories.countDocuments(searchCondition);
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
    console.log(error);
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
    console.log(error);
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



module.exports=historyRoute