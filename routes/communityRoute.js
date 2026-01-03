const express=require('express')
const multer=require('multer')
const communityRoute=express.Router()
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

const sequence = require("../utils/sequences");
const Communities = require('../models/communitySchemas');
const Hashtags = require('../models/hashtagSchemas'); 

//파일 업로드
const s3Uploader = require('../utils/s3Upload');
const s3Delete = require('../utils/s3Delete');
const Tags = require('../models/tagSchemas');

communityRoute.post('/fileUploadS3',  async (request, response) => {
  try {
    let sendObj = {};
    
    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
    if(!chechAuthRes) throw new Error();

    if(!chechAuthRes){
      sendObj = commonModules.sendObjSet("2011");
    }else{

      const uploadMiddlewareS3 = s3Uploader.single('file');


      uploadMiddlewareS3(request, response, async function (err) {
        // console.log(err);
        const retObj = {
          errMassage : ""
        }
        if (err instanceof multer.MulterError) {  

          

            retObj.errMassage = err.message;
            sendObj = commonModules.sendObjSet("9101");

        } else if (err) {      // An unknown error occurred when uploading. 
            retObj.errMassage = err.message;
            sendObj = commonModules.sendObjSet("9101");
        }    // Everything went fine. 
        else {


          const obj = {
            img_url : request.file ? request.file.location : null,
            thumbImg_url : request.file ? request.file.location : null,
          }
          sendObj = commonModules.sendObjSet("9100", obj);
        }

        response.send({
          sendObj
        }); 

      })
    }


  } catch (error) {

    let obj = commonModules.sendObjSet(error.message); //code

    if(obj.code === ""){
      obj = commonModules.sendObjSet("9102");
    }
    response.status(500).send(obj);
  }
});


//글쓰기 저장
communityRoute.post("/savecommunitywriting", getFields.none(), async (request, response) => {
  try {
    
    let sendObj = {};

    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
    
      if(!chechAuthRes){
        sendObj = commonModules.sendObjSet("2011");
      }else{
        // Communities //
        const session = await mongoose.startSession();
        const userseq = request.body.userseq;
        const userinfo = new ObjectId(request.body.userinfo);;
        const title = request.body.title;
        const contents = request.body.contents;
        const hashtags = request.body.hashtags;

        const community_seq = await sequence.getSequence("community_seq");
        session.startTransaction(); // 트랜잭션을 시작합니다.
        // console.log(community_seq);
        
        const communityObj = {
          community_seq:community_seq,
          userseq:userseq,
          userinfo:userinfo,
          title:title,
          contents:contents,
          hashtags:hashtags,
          reguser:request.body.email,
          upduser:request.body.email,

        }

        const newCommunities =new Communities(communityObj);
        let resCommunities=await newCommunities.save();

        //hashtag 저장
        if(hashtags.length > 0){

          let hashtagObjArr = new Array();

          for(let i=0; i<hashtags.length; i++){
            const tagName = hashtags[i];
            const obj = {
              tagname:hashtags[i],
              community_seq:community_seq,
              reguser:request.body.email,
              upduser:request.body.email,
            }

            hashtagObjArr.push(obj);
            //동일한 tag가 있는 경우 건수를 증가시킨다.
            const resTags = await Tags.findOneAndUpdate(
              { tagname: tagName }, // 찾을 조건 (Query)
              {
                "$inc": {"cnt": 1}, 
              },  // 업데이트할 내용 ($set 연산자 사용 권장)
              { upsert: true } // 옵션: 새 문서 반환, upsert 활성화
            );

          }
          const resHashTags = await Hashtags.insertMany(hashtagObjArr);

         
 
        } 

        sendObj = commonModules.sendObjSet("3180");
        ;

        await session.commitTransaction(); // 모든 작업이 성공했으므로 커밋합니다.
        session.endSession(); // 세션을 종료합니다.
        
      }
    response.status(200).send({
      sendObj
    });
  } catch (error) {
    console.log(error);
    if (session.inTransaction()) { // 트랜잭션이 활성 상태일 때만 롤백 시도
      await session.abortTransaction();
    }
    response.status(500).send(commonModules.sendObjSet("3182", error));
  }
});

//커뮤니티 글 리스트 조회
communityRoute.get("/communitylistsearch", getFields.none(), async (request, response) => {
  try {
      
    let sendObj = {};

    const pageListCnt = commonModules.communitySearchPage; //10개씩 조회 
    const keyword = request.query.keyword;
    const lastSeq = parseInt(request.query.lastSeq); //직전 조회의 마지막 seq 
    
    
    let searchCondition;

    if(keyword){
      searchCondition = {
          $text:{$search:keyword},
      }
    }else{
      searchCondition = {}
    }
    
    if(lastSeq > 0){
      searchCondition.community_seq = {"$lt":lastSeq}
    }
    
    const resObj = await Communities.find(
      searchCondition
    )
    .sort({community_seq:-1})
    .limit(pageListCnt)
    .populate('userinfo', {_id:0, userseq:1, email:1, username:1, userimg:1, userthumbImg:1}).exec()
    ;

    sendObj = commonModules.sendObjSet("3190", resObj);

    response.status(200).send({
        sendObj
    });

  } catch (error) {
    response.status(500).send(commonModules.sendObjSet("3192", error));
      
  }
});

//태그 건수 조회 : 한달 기준 가장 많이 사용된 태그 10건
communityRoute.get("/taglistsearch", getFields.none(), async (request, response) => {
  try {
      
    let sendObj = {};
    
    const now = new Date(); // 쿼리를 실행하는 현재 시점의 날짜와 시간
    
    // 2. 한 달 전 날짜 계산
    const oneMonthAgo = new Date(now); // 현재 시간을 복사
    oneMonthAgo.setMonth(now.getMonth() - 1); // 현재 달에서 1개월을 웁니다.
    
    const resObj = await Tags.find(
      {regdt: { $gte: oneMonthAgo }}
    )
    .sort({ "cnt": -1 }) 
    .limit(10);
    ;

    sendObj = commonModules.sendObjSet("3200", resObj);

    response.status(200).send({
        sendObj
    });

  } catch (error) {
    response.status(500).send(commonModules.sendObjSet("3202", error));
      
  }
});


module.exports=communityRoute