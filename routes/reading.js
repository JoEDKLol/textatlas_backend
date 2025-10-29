const express=require('express')
const multer=require('multer')
const readingRoute=express.Router()
let getFields=multer()
const Books = require("../models/bookSchemas");
const ObjectId = require("mongoose").Types.ObjectId;
const commonModules = require("../utils/common");
const translate = require('../utils/translate');
const Readinghistories = require("../models/readinghistorySchemas");
const mongoose = require('mongoose'); // mongoose import
const checkAuth = require('../utils/checkAuth');
const sequence = require("../utils/sequences");
const Dictionaries = require("../models/dictionarySchemas");
const Learningwords = require("../models/learningwordSchemas");
const Learningsentences = require("../models/learningsentenceSchemas");
const Translatedhistories = require('../models/translatedhistorySchemas');
const Hotwords = require('../models/hotwordSchemas');
const ReadingHistorySchemas = require('../models/readinghistorySchemas');


//책정보 상세
readingRoute.post("/readingbypage", getFields.none(), async (request, response) => {

  try {
    

    let sendObj = {};
    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
    
    if(!chechAuthRes){
      
      sendObj = commonModules.sendObjSet("2011");
    }else{
      let date = new Date().toISOString();
      const session = await mongoose.startSession();
      const book_seq = request.body.book_seq;
      const userseq = request.body.userseq; //사용자별 읽기 히스토리를 저장한다.
      const email = request.body.email;
      let currnet_page = request.body.currnetPage; //보여줄 페이지 
      const searchFirst = request.body.searchFirst //최초조회 여부 최초조회이면 사용자 책 읽기 기록에서 page 조회

      //Readinghistories 에서 사용자별 책 읽기 기록 조회
      let readingHis = await Readinghistories.findOne({userseq:userseq, book_seq:book_seq});
      
      session.startTransaction(); // 트랜잭션을 시작합니다.
      
      if(readingHis){ //읽기 기록이 있는 경우 조회해온 이력에서 페이지를 셋팅한다.
        if(searchFirst){
          currnet_page = readingHis.page;
        }else{
          currnet_page = currnet_page;

          //사용자별 읽기 히스토리 업데이트 
          let updateReadinghistories = await Readinghistories.findOneAndUpdate(
            {
              userseq:userseq,
              book_seq:book_seq,

            },
            {
              "page":currnet_page,
              "upddate":date,
              "updUser":email
            },
          )

        }

      }else{
        //읽기 기록이 없는 경우 현재 책에 대한 정보를 저장한다.
        let book_info = await Books.findOne({book_seq:book_seq},{_id:1, book_title:1, images:1});

        const readingHistObj ={
          userseq:userseq,
          book_seq:book_seq,
          book_info:book_info._id,
          book_title:book_info.book_title,
          images:book_info.images,
          reguser:email,
          upduser:email,
          
        }
        const newReadinghistories = new Readinghistories(readingHistObj);
        await newReadinghistories.save();

        //viewcount 카운트 업데이트 한다.
        let upRes = await Books.findOneAndUpdate(
          {book_seq:book_seq},
          {$inc: { viewcount: 1 }}
        )

        // console.log(upRes);

      }

      let booksDate = await Books.findOne({book_seq:book_seq},
        {
          "book_seq":1,
          "pages":{ $slice: [currnet_page-1, 1] }, //1페이지씩 조회
        }
      )
      ;

      
      // console.log(commonModules.processTextArray(booksDate.pages[0].contentarr));

      if(!booksDate.pages[0].tranlatorYn){ 
        // console.log("번역 실행");
        let arr = commonModules.processTextArray(booksDate.pages[0].contentarr); 
        // for(let i=0; i<booksDate.pages[0].contentarr.length; i++){
        //   arr.push(booksDate.pages[0].contentarr[i].replace(/\n|\r/g, ' '))
        // }
        
        const translatorKr = await translate.getKoreanTranslationDeepl(arr);
        const translatorEs = await translate.getSpanishTranslationDeepl(arr);
        
        if(translatorKr !== "error" && translatorEs !== "error"){
          const objKr = {
            page : currnet_page, 
            contentarr : translatorKr,
          }

          const objEs = {
            page : currnet_page, 
            contentarr : translatorEs,
          }

          //번역된 내용은 업데이트 한다.
          let updateBook = await Books.findOneAndUpdate(
            {book_seq:book_seq},
            {
              '$set': {"pages.$[element].tranlatorYn":true},
              '$push': { // $push 연산자를 사용하여 pages 배열에 newPage 객체를 추가합니다.
                  translator_kr: objKr, 
                  translator_sp : objEs
              }
            },
            {arrayFilters: [{ 'element.page': currnet_page}]},
          )  
        }else{ //번역 실패
          sendObj = commonModules.sendObjSet("3023");
          throw new Error(sendObj.code);
        }

      }else{
        // console.log("번역 미실행");
      }

      await session.commitTransaction(); // 모든 작업이 성공했으므로 커밋합니다.
      session.endSession(); // 세션을 종료합니다.

      let booksDateF = await Books.findOne({book_seq:book_seq},
        {
          "book_seq":1,
          "source":1,
          "book_id":1,
          "title":1,
          "book_title":1,
          "author":1,
          "subjects":1,
          "copyright_status":1,
          "language":1,
          "release_date":1,
          "reading_level":1,
          "loc_class":1,
          "download_url":1,
          "downloads_30_days":1,
          "images":1,
          "pages":{ $slice: [currnet_page-1, 1] }, //1페이지씩 조회
          "total_pages":1,
          "translator_kr":{ $slice: [currnet_page-1, 1] }, 
          "translator_sp":{ $slice: [currnet_page-1, 1] },
        }
      )
      ;
      
      const resObj = {
        bookData:booksDateF, 
        currentPage:currnet_page
      }

      sendObj = commonModules.sendObjSet("3020", resObj);
    }

    response.status(200).send({
        sendObj
    });

  } catch (error) {

    if (session.inTransaction()) { // 트랜잭션이 활성 상태일 때만 롤백 시도
      await session.abortTransaction();
    }

    let obj = commonModules.sendObjSet(error.message); //code
    if(obj.code === ""){
      obj = commonModules.sendObjSet("3022");
    }
    response.status(500).send(obj);
      
  }
});


//사용자별 책읽기 히스토리 조회 권한있어야 함.
readingRoute.post("/readhissearch", getFields.none(), async (request, response) => {

  try {
      
    let sendObj = {};
    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
    
    if(!chechAuthRes){
      
      sendObj = commonModules.sendObjSet("2011");
    }else{

      const book_seq_list = request.body.book_seq_list;
      const userseq = request.body.userseq; 

      let readingHis = await Readinghistories.find({userseq:userseq, book_seq : {$in:book_seq_list}});
      
      ;

      sendObj = commonModules.sendObjSet("3030", readingHis);
    }

    response.status(200).send({
        sendObj
    });

  } catch (error) {
    // console.log(error);
    response.status(500).send(commonModules.sendObjSet("3032", error));
      
  }

});


//단어 등을 클릭시 번역 로직
// 1) 사전테이블 조회 후 없으면 deepl 조회 후 사전테이블에 저장
// 2) 사용자별 번역 히스토리에 이력이 없으면 저장
// 3) 사용자가 저장한 단어 또는 문장인지 조회
readingRoute.post("/translationword", getFields.none(), async (request, response) => {
  try {

    let sendObj = {};

    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
    
    if(!chechAuthRes){
      sendObj = commonModules.sendObjSet("2011");
    }else{
      
      const session = await mongoose.startSession();
      session.startTransaction();


      const book_seq = request.body.book_seq;
      const userseq = request.body.userseq;
      const page = request.body.page; //현재 책 page
      const index = request.body.index; //문장 index
      const email = request.body.email; //문장 index

      // a:word, b:sentence
      let data = request.body.data;
      let result = "";
      let resultKR = ""; //번역 및 검색 결과 KR
      let resultES = ""; //번역 및 검색 결과 ES
      
      

      data = request.body.data.toLowerCase();
      

      //사전테이블에서 먼저 조회후 없으면 deepl 조회 후 사전테이블 insert
      const resDictionary = await Dictionaries.findOne({
        word:data
      })

      if(!resDictionary){ 
        resultKR = await translate.getKoreanTranslationDeepl(data); //한국
        resultES = await translate.getSpanishTranslationDeepl(data); //에스파뇨
        
        if(resultKR !== "error" && resultES !== "error"){

          const dictionObj = {
            word:data,
            meaningKR:resultKR.text,
            meaningES:resultES.text,
            reguser:request.body.email,
            upduser:request.body.email
          }
          const newDictionaries =new Dictionaries(dictionObj);
          let resDictionaries=await newDictionaries.save();

          const resResult = {
            wordid:resDictionaries._id,
            textKR : resultKR.text,
            textES : resultES.text,
            saveyn : false,
          }

          result = resResult;

        }else{
          sendObj = commonModules.sendObjSet("3043");
          throw new Error(sendObj.code);
        }
        

      }else{ //사전테이블에 있는 경우

        //사용자 단어 저장여부 확인
        const userSaveWord =  await Learningwords.findOne({
          userseq:userseq,
          book_seq:book_seq,
          page:page,
          sentenceindex:index,
          word:data, 
        })

        const resResult = {
          wordid:resDictionary._id,
          textKR : resDictionary.meaningKR,
          textES : resDictionary.meaningES,
          saveyn : (userSaveWord)?true:false,
          // sentenceSaveYn : (userSaveSentence)?true:false,
          reworkmeaningKR : resDictionary.reworkmeaningKR,
          reworkynKR : resDictionary.reworkynKR,
          reworkmeaningES : resDictionary.reworkmeaningES,
          reworkynES : resDictionary.reworkynES,
        }
        result = resResult;
        // result = await translate.getKoreanTranslationDeepl(data);
      }

      //사용자 문장 저장여부 확인
      const userSaveSentence = await Learningsentences.findOne({
        userseq:userseq,
        book_seq:book_seq,
        page:page,
        sentenceindex:index,
      })

      result.sentenceSaveYn = (userSaveSentence)?true:false;

      //번역history 저장 (단어)
      // 사용자 단어 저장여부 확인
      const resTranslatedhistories = await Translatedhistories.findOne({
        userseq:userseq, 
        book_seq:book_seq,
        page:page,
        type:'a', //단어
        word:data, 
        sentenceindex:index
      });

      if(!resTranslatedhistories){
        const translatedHisObj = {
          userseq:userseq, 
          book_seq:book_seq,
          page:page,
          type:'a',
          word:data, 
          sentenceindex:index,
          reguser:request.body.email,
          upduser:request.body.email,
        }

        const newTranslatedhistories =new Translatedhistories(translatedHisObj);
        let resDictionarykrsSave=await newTranslatedhistories.save();
      }

      await session.commitTransaction();
      session.endSession();


      if(result !== "error"){
        sendObj = commonModules.sendObjSet("3040", result);
      }else{
        sendObj = commonModules.sendObjSet("3041");
      }

      ;
      
    }
    response.status(200).send({
      sendObj
    });
  } catch (error) {
    if (session.inTransaction()) { // 트랜잭션이 활성 상태일 때만 롤백 시도
      await session.abortTransaction();
    }
    
    let obj = commonModules.sendObjSet(error.message); //code
    if(obj.code === ""){
      obj = commonModules.sendObjSet("3042");
    }
    response.status(500).send(obj);
  }
});

readingRoute.post("/saveword", getFields.none(), async (request, response) => {
  try {
    // console.log("?????????????????");
    let sendObj = {};

    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
    
      if(!chechAuthRes){
        sendObj = commonModules.sendObjSet("2011");
      }else{
        console.log("111111111111111");
        const session = await mongoose.startSession();
        session.startTransaction();

        const userseq = request.body.userseq;
        const book_seq = request.body.book_seq;
        const page = request.body.page;
        const sentenceindex = request.body.sentenceindex;
        const word = request.body.word;
        const sentence = request.body.sentence;
        const wordid = new ObjectId(request.body.wordid);
        const email = request.body.email;
        const book_title = request.body.book_title;
        const images = request.body.images;

        const wordObj = {
          userseq:userseq, 
          book_seq:book_seq,
          page:page,
          sentenceindex:sentenceindex,
          word:word.toLowerCase(),
          sentence:sentence,
          wordinfo:wordid,
          book_title:book_title,
          images:images,
          reguser:email,
          upduser:email, 
        }
        console.log("222222222222");
        const resultLearningwords = await Learningwords.findOne( 
          {
            userseq:userseq, 
            book_seq:book_seq,
            page:page,
            sentenceindex:sentenceindex,
            word:word.toLowerCase(),
          }
        ); 
        console.log("3333333333333");
        if(!resultLearningwords){
          console.log("4444444444444");
          const learnword_seq = await sequence.getSequence("learnword_seq");
          wordObj.seq = learnword_seq;
          const newLearningwords =new Learningwords(wordObj);
          let resLearningwords=await newLearningwords.save();

          //ReadingHistory 에서 saved_word_cnt 1 증가 시킨다.
          let upRes = await ReadingHistorySchemas.findOneAndUpdate(
            { userseq:userseq,book_seq:book_seq},
            {$inc: { saved_word_cnt: 1 }}
          )

        }
        
          

        //hot word count
        // const regday = commonModules.getDateString();
        // const resHotwords = await Hotwords.findOne({
        //   book_seq:book_seq,
        //   page:page,
        //   sentenceindex:sentenceindex, 
        //   word:word.toLowerCase(),
        // });

        // if(resHotwords){ //update
        //   let upRes = await Hotwords.updateOne(
        //   {
        //     book_seq:book_seq,
        //     page:page,
        //     sentenceindex:sentenceindex, 
        //     word:request.body.word.toLowerCase(),
        //   },{
        //     "count":resHotwords.count+1
        //   })
        // }else{ //save
        //   const hotwordObj = {
        //     book_seq:book_seq,
        //     page:page,
        //     sentenceindex:sentenceindex, 
        //     word:request.body.word.toLowerCase(),
        //     wordinfo:new ObjectId(request.body.wordid),
        //     sentence:sentence,
        //     reguser:request.body.email,
        //     upduser:request.body.email, 
        //   }
        //   const newHotwords =new Hotwords(hotwordObj);
        //   let resNewHotwords=await newHotwords.save();  
        // }

        // await session.commitTransaction();
        // session.endSession();

        

        await session.commitTransaction();
        session.endSession();

        sendObj = commonModules.sendObjSet("1200");
        ;
        
      }
    response.status(200).send({
      sendObj
    });
  } catch (error) {
    if (session.inTransaction()) { // 트랜잭션이 활성 상태일 때만 롤백 시도
      await session.abortTransaction();
    }
    console.log(error);
    response.status(500).send(commonModules.sendObjSet("1202", error));
  }
});



readingRoute.post("/savesentence", getFields.none(), async (request, response) => {
  try {

    let sendObj = {};

    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
    
      if(!chechAuthRes){
        sendObj = commonModules.sendObjSet("2011");
      }else{

        const session = await mongoose.startSession();
        session.startTransaction();

        const userseq = request.body.userseq;
        const book_seq = request.body.book_seq;
        const page = request.body.page;
        const sentenceindex = request.body.sentenceindex;
        const sentence = request.body.sentence;
        const translatedsentenceKR = request.body.translatedsentenceKR;
        const translatedsentenceES = request.body.translatedsentenceES;
        const email = request.body.email;
        const book_title = request.body.book_title;
        const images = request.body.images;

        const wordObj = {
          userseq:userseq, 
          book_seq:book_seq,
          page:page,
          sentenceindex:sentenceindex,
          sentence:sentence,
          translatedsentenceKR:translatedsentenceKR,
          translatedsentenceES:translatedsentenceES,
          book_title:book_title,
          images:images,
          reguser:email,
          upduser:email, 
        }

        const resultLearningsentences = await Learningsentences.findOne(
          {
            userseq:userseq, 
            book_seq:book_seq,
            page:page,
            sentenceindex:sentenceindex,
          }
        ); 

        if(!resultLearningsentences){
          const learnsentence_seq = await sequence.getSequence("learnsentence_seq");
          wordObj.seq = learnsentence_seq;
          const newLearningsentences =new Learningsentences(wordObj);
          let resLearningsentences=await newLearningsentences.save();

          //ReadingHistory 에서 saved_word_cnt 1 증가 시킨다.
          let upRes = await ReadingHistorySchemas.findOneAndUpdate(
            { userseq:userseq,book_seq:book_seq},
            {$inc: { saved_sentence_cnt: 1 }}
          )
        }
        
        sendObj = commonModules.sendObjSet("1210");
        ;
        
      }
    response.status(200).send({
      sendObj
    });
  } catch (error) {
    // console.log(error);
    if (session.inTransaction()) { // 트랜잭션이 활성 상태일 때만 롤백 시도
      await session.abortTransaction();
    }
    response.status(500).send(commonModules.sendObjSet("1212", error));
  }
});

module.exports=readingRoute