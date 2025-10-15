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


module.exports=bookRoute