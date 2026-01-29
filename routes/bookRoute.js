const express=require('express')
const multer=require('multer')
const bookRoute=express.Router()
let getFields=multer()
const Books = require("../models/bookSchemas");

const ObjectId = require("mongoose").Types.ObjectId;
const commonModules = require("../utils/common");
// const jwtModules = require("../utils/jwtmodule");
// const { default: mongoose } = require('mongoose')
// const db = mongoose.connection;
// const sequence = require("../utils/sequences");
const Communities = require('../models/communitySchemas');
const Hotwords = require('../models/hotwordSchemas');
const Hotsentences = require('../models/hotsentencesSchemas');
bookRoute.get("/booksearch", getFields.none(), async (request, response) => {
  try {
      
    let sendObj = {};

    // console.log("두번호출됨?"); 

    // console.log(request.query.currentPage);
    let keyword =  request.query.keyword; 

    const currentPage = request.query.currentPage;
    const pageListCnt = commonModules.readingPage; //20개씩 조회 
    const skipPage = pageListCnt*(currentPage-1);
    const userseq = request.query.userseq;

    let searchCondition;

    // const rgx = (pattern) => new RegExp(`^${pattern}.*`, 'i');
    // const searchRgx = rgx(keyword);
    
    // console.log(searchRgx);

    if(keyword){
      searchCondition = {
        $text:{$search:keyword},
        // $or: [
        //   {title:{$regex:searchRgx}}
        // ] 
          
      }
    }else{
      searchCondition = {}
    }

    // console.log(searchCondition);

      
    let totalCnt = await Books.countDocuments();
    let booksDate = await Books.find(searchCondition
      ,{
        "book_seq":1,
        "book_id":1,
        "title":1,
        "book_title":1,
        "images":1,
      })
    .sort({book_seq:-1})
    .lean()
    .skip(skipPage)
    .limit(pageListCnt);
    ;
    
    if(parseInt(userseq) > 0){
      // console.log("사용자번호가 있는 경우");
    }

    const resObj = {
      books : booksDate,
      totalCnt : totalCnt, 
    }


    if(booksDate.length > 0){
      resObj.lastBookSeq = booksDate[booksDate.length-1].book_seq;
      resObj.currentPage = currentPage;
    }
    sendObj = commonModules.sendObjSet("3000", resObj);
    

    response.status(200).send({
        sendObj
    });

  } catch (error) {
    // console.log(error);
    response.status(500).send(commonModules.sendObjSet("3002", error));
      
  }
});

//책정보 상세
bookRoute.get("/bookdetail", getFields.none(), async (request, response) => {
  try {
      
    let sendObj = {};

    const book_seq = request.query.book_seq;
    let booksDate = await Books.findOne({book_seq:book_seq},
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
        // "pages":{ $slice: 2 },
        "total_pages":1
      }
    )
    ;

    sendObj = commonModules.sendObjSet("3010", booksDate);
    
    response.status(200).send({
        sendObj
    });

  } catch (error) {
    // console.log(error);
    response.status(500).send(commonModules.sendObjSet("3012", error));
      
  }
});

// 
bookRoute.get("/homebooksearch", getFields.none(), async (request, response) => {
  try {
      
    let sendObj = {};


    const currentPage = request.query.currentPage;
    const pageListCnt = 16; //16개씩 조회 
      
    let booksDate = await Books.find({},{
        "book_seq":1,
        "book_id":1,
        "title":1,
        "book_title":1,
        "images":1,
      })
    .sort({book_seq:-1})
    .lean()
    .skip(0)
    .limit(pageListCnt);
    ;

    //최신커뮤니티글조회
    const communitiesObj = await Communities.find()
    .sort({community_seq:-1})
    .limit(6)
    .populate('userinfo', {_id:1, userseq:1, email:1, username:1, userimg:1, userthumbImg:1, introduction:1}).exec()
    ;

    const regdt = commonModules.getDateStringYYYYMM();
    //howwords 조회
    const hotwords = await Hotwords.find({regdt:regdt})
    .sort({count:-1, seq:-1})
    .limit(6)
    .populate('wordinfo', {_id:0, meaningKR:1, reworkmeaningKR:1, reworkynKR:1, meaningES:1, reworkmeaningES:1, reworkynES:1}).exec()
    ;

    //hotsentence 조회
    const hotsentences = await Hotsentences.find({regdt:regdt})
    .sort({count:-1})
    .limit(6)

    const resObj = {
      books : booksDate,
      communities : communitiesObj,
      hotwords : hotwords,
      hotsentences : hotsentences,

    }
    
    sendObj = commonModules.sendObjSet("3430", resObj);

    response.status(200).send({
        sendObj
    });

  } catch (error) {
    // console.log(error);
    response.status(500).send(commonModules.sendObjSet("3432", error));
      
  }
});


module.exports=bookRoute