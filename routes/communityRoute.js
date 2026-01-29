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
const CommunityLikes = require('../models/communityLikeSchemas');
const Comments = require('../models/commentSchemas');
const Users = require('../models/userSchemas');

//파일 업로드
const s3Uploader = require('../utils/s3Upload');
const s3Delete = require('../utils/s3Delete');
const Tags = require('../models/tagSchemas');
const SubComments = require('../models/subCommentSchemas');



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

communityRoute.post("/fileDeleteS3", getFields.none(), async (request, response) => {
  try {
      let sendObj = {};
      
      let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
      
      if(!chechAuthRes){
        sendObj = commonModules.sendObjSet("2011");
      }else{
        const imgDeleteRes = await s3Delete(request.body.file_key);
        
        if(imgDeleteRes){

          sendObj = commonModules.sendObjSet("9110");
        }else{
          sendObj = commonModules.sendObjSet("9111");  
        }
        response.send({
          sendObj
        }); 

      }
  } catch (error) {
    console.log(error);
    let obj = commonModules.sendObjSet(error.message); //code

    if(obj.code === ""){
      obj = commonModules.sendObjSet("9112");
    }
    response.status(500).send(obj);
  }
});

communityRoute.post("/fileDeleteS3withuser", getFields.none(), async (request, response) => {
  try {
      let sendObj = {};
      
      let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
      
      if(!chechAuthRes){
        sendObj = commonModules.sendObjSet("2011");
      }else{
        const imgDeleteRes = await s3Delete(request.body.file_key);
        
        if(imgDeleteRes){
          let date = new Date().toISOString();

          let updateUsers=await Users.updateOne(
            {
              userseq:request.body.userseq, 
            },
            {
              "userimg":"",
              "userthumbImg":"",
              "upduser":request.body.email,
              "upddate":date,
            }
          );
          sendObj = commonModules.sendObjSet("9120");
        }else{
          sendObj = commonModules.sendObjSet("9121");  
        }

        

        response.send({
          sendObj
        }); 
      }

  } catch (error) {
    let obj = commonModules.sendObjSet(error.message); //code

    if(obj.code === ""){
      obj = commonModules.sendObjSet("9122");
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

      const resObj = await Communities.findOne(
        {community_seq:community_seq,}
      )
      .populate('userinfo', {_id:1, userseq:1, email:1, username:1, userimg:1, userthumbImg:1, introduction:1}).exec()
      ;

      sendObj = commonModules.sendObjSet("3180", resObj);
      ;

      await session.commitTransaction(); // 모든 작업이 성공했으므로 커밋합니다.
      session.endSession(); // 세션을 종료합니다.
      
    }

    response.status(200).send({
      sendObj
    });
  } catch (error) {
    if (session.inTransaction()) { // 트랜잭션이 활성 상태일 때만 롤백 시도
      await session.abortTransaction();
    }
    response.status(500).send(commonModules.sendObjSet("3182", error));
  }
});

//커뮤니티글 업데이트
communityRoute.post("/updatecommunitywriting", getFields.none(), async (request, response) => {
  try {
    
    let sendObj = {};

    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
    
    if(!chechAuthRes){
      sendObj = commonModules.sendObjSet("2011");
    }else{
      // Communities //
      const session = await mongoose.startSession();
      const userseq = parseInt(request.body.userseq);
      const title = request.body.title;
      const contents = request.body.contents;
      const hashtags = request.body.hashtags;

      const community_seq = parseInt(request.body.community_seq);
      session.startTransaction(); // 트랜잭션을 시작합니다.


      let date = new Date().toISOString();
      const resCommunities = await Communities.updateOne(
        {
          community_seq:community_seq,
          userseq:userseq,
        },
        {
          "title":title,
          "contents":contents,
          "hashtags":hashtags,
          "upduser":request.body.email,
          "upddate":date,
        }
    
      );

      //기존 tag 삭제
      await Hashtags.deleteMany({community_seq:community_seq,});
      // community_seq
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

      const resObj = await Communities.findOne(
        {community_seq:community_seq,}
      )
      .populate('userinfo', {_id:1, userseq:1, email:1, username:1, userimg:1, userthumbImg:1, introduction:1}).exec()
      ;
      
      sendObj = commonModules.sendObjSet("3320", resObj);
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
    response.status(500).send(commonModules.sendObjSet("3322", error));
  }
});

//커뮤니티 글 리스트 조회
communityRoute.post("/communitylistsearch", getFields.none(), async (request, response) => {
  try {
      
    let sendObj = {};

    const pageListCnt = commonModules.communitySearchPage; //10개씩 조회 
    const keyword = request.body.keyword;
    const lastSeq = parseInt(request.body.lastSeq); //직전 조회의 마지막 seq
    const tagYn = request.body.tagYn;
    const searchTagList = request.body.searchTagList;
    

    // console.log(tagYn); //태그 조회 여부
    // console.log(searchTagList); //조회 태그 리스트ㄴ
    
    
    let searchCondition;

    if(keyword){
      searchCondition = {
        $text:{$search:keyword},
      }
    }else{
      searchCondition = {}
    }

    if(searchTagList.length > 0){
      const communitySeqObjList = await Hashtags.find({tagname: { $in: searchTagList } })
      
      if(communitySeqObjList.length > 0){
        
        let communitySeqList = new Array;
        for(let i =0; i<communitySeqObjList.length; i++){
          communitySeqList.push(communitySeqObjList[i].community_seq);
        }

        searchCondition.community_seq = {$in: communitySeqList}
      }
      
    }

    
    if(lastSeq > 0){
      searchCondition.community_seq = {...searchCondition.community_seq, "$lt":lastSeq}
    }
    
    const resObj = await Communities.find(
      searchCondition
    )
    .sort({community_seq:-1})
    .limit(pageListCnt)
    .populate('userinfo', {_id:1, userseq:1, email:1, username:1, userimg:1, userthumbImg:1, introduction:1}).exec()
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
    oneMonthAgo.setMonth(now.getMonth() - 1); // 현재 달에서 1개월을 뺌
    
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

//커뮤니티 글 리스트 상세조회
communityRoute.get("/communitydetailsearch", getFields.none(), async (request, response) => {
  try {
      
    let sendObj = {};
    const community_seq = parseInt(request.query.community_seq);
    const resObj = await Communities.findOne(
      {community_seq:community_seq}
    )
    .populate('userinfo', {_id:1, userseq:1, email:1, username:1, userimg:1, userthumbImg:1, introduction:1}).exec()
    ;

    sendObj = commonModules.sendObjSet("3210", resObj);

    response.status(200).send({
        sendObj
    });

    //좋아요 클릭 조회

  } catch (error) {
    // console.log(error);
    response.status(500).send(commonModules.sendObjSet("3212", error));
  }
});

//커뮤니티 사용자 글 리스트 상세조회 
communityRoute.get("/communitydetailusersearch", getFields.none(), async (request, response) => {
  try {
      
    let sendObj = {};
    const community_seq = parseInt(request.query.community_seq);
    const userseq = parseInt(request.query.userseq);
    const resObj = await Communities.findOne(
      {community_seq:community_seq, userseq:userseq}
    )
    .populate('userinfo', {_id:1, userseq:1, email:1, username:1, userimg:1, userthumbImg:1, introduction:1}).exec()
    ;

    sendObj = commonModules.sendObjSet("3310", resObj);

    response.status(200).send({
        sendObj
    });

    //좋아요 클릭 조회

  } catch (error) {
    // console.log(error);
    response.status(500).send(commonModules.sendObjSet("3312", error));
  }
});

//커뮤니티 글 좋아요 조회 사용자별
communityRoute.get("/communitylikebyuser", getFields.none(), async (request, response) => {
  try {
      
    let sendObj = {};
    const community_seq = parseInt(request.query.community_seq);
    const userseq = parseInt(request.query.userseq);

    const resObj = await CommunityLikes.findOne(
      {
        community_seq:community_seq,
        userseq:userseq
      }
    )

    sendObj = commonModules.sendObjSet("3220", resObj);
    response.status(200).send({
        sendObj
    });

    //좋아요 클릭 조회

  } catch (error) {
    // console.log(error);
    response.status(500).send(commonModules.sendObjSet("3222", error));
  }
});

//커뮤니티 글 좋아요 업데이트
communityRoute.post("/communitylikeupdate", getFields.none(), async (request, response) => {
  try {
      
    let sendObj = {};
    
    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
    
    if(!chechAuthRes){
      sendObj = commonModules.sendObjSet("2011");
    }else{
    
      const session = await mongoose.startSession();
      const community_seq = parseInt(request.body.community_seq);
      const userseq = parseInt(request.body.userseq);
      const email = request.body.email;
      const likeyn = request.body.likeyn;
      
      const resObj = await CommunityLikes.findOne(
        {
          community_seq:community_seq,
          userseq:userseq
        }
      )

      session.startTransaction(); // 트랜잭션을 시작합니다.

      if(resObj){ //업데이트
        let upRes = await CommunityLikes.updateOne({
          community_seq:community_seq,
          userseq:userseq
        },
        {  likeyn: likeyn })
      }else{ //insert
        const communityLikeObj = {
          community_seq:community_seq,
          userseq:userseq,
          communityinfo:new ObjectId(request.body.community_id),
          likeyn:true,
          reguser:request.body.email,
          upduser:request.body.email,

        }

        const newCommunityLikes =new CommunityLikes(communityLikeObj);
        let resCommunityLikes=await newCommunityLikes.save();
      }

      let likecntPM;
      if(likeyn){
        likecntPM = 1;
      }else{
        likecntPM = -1
      }
      let upRes = await Communities.findOneAndUpdate({community_seq:community_seq}
        ,{ $inc: { likecnt: likecntPM } }
        ,{ new: true }
      )


      const obj = {
        likeyn:likeyn,
        likecnt:upRes.likecnt
      }

      sendObj = commonModules.sendObjSet("3230", obj);
      await session.commitTransaction(); // 모든 작업이 성공했으므로 커밋합니다.
      session.endSession(); // 세션을 종료합니다.
    }

    response.status(200).send({sendObj});

  } catch (error) {
    if (session.inTransaction()) { // 트랜잭션이 활성 상태일 때만 롤백 시도
      await session.abortTransaction();
    }
    response.status(500).send(commonModules.sendObjSet("3232", error));
  }
});

//커뮤니티 글에 대한 댓글 저장하기
communityRoute.post("/commentsave", getFields.none(), async (request, response) => {
  try {
    let sendObj = {};

    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
    if(!chechAuthRes){
      sendObj = commonModules.sendObjSet("2011");
    }else{

      const session = await mongoose.startSession();
      session.startTransaction(); // 트랜잭션을 시작합니다.

      const community_seq = parseInt(request.body.community_seq);
      const userseq = parseInt(request.body.userseq);
      const email = request.body.email;
      const userinfo = new ObjectId(request.body.userinfo); //사용자ID
      const communityinfo = new ObjectId(request.body.communityinfo); //커뮤니티글ID
      const comment = request.body.comment;
      

      const comment_seq = await sequence.getSequence("comment_seq");
      
      const commentObj = {
        comment_seq:comment_seq,
        community_seq:community_seq,
        userseq:userseq,
        userinfo:userinfo,
        communityinfo:communityinfo,
        comment:comment,
        reguser:email,
        upduser:email,

      }

      const newComments = new Comments(commentObj);
      const resComments = await newComments.save();

      let upRes = await Communities.findOneAndUpdate({community_seq:community_seq}
        ,{ $inc: { commentcnt: 1 } }
        ,{ new: true }
      )



      const obj = {
        commentcnt:upRes.commentcnt,
        newCommentObj:resComments
      }
      
      sendObj = commonModules.sendObjSet("3240", obj);
      

      await session.commitTransaction(); // 모든 작업이 성공했으므로 커밋합니다.
      session.endSession(); // 세션을 종료합니다.
    }

    response.status(200).send({sendObj});

  } catch (error) {
    // console.log(error);
    if (session.inTransaction()) { // 트랜잭션이 활성 상태일 때만 롤백 시도
      await session.abortTransaction();
    }

    response.status(500).send(commonModules.sendObjSet("3242", error));
  }
});

//커뮤니티 글에 대한 댓글 조회
communityRoute.get("/commentsearch", getFields.none(), async (request, response) => {
  try {

    let sendObj = {};

    const pageListCnt = commonModules.commentSearchPage; //10개씩 조회 
    const lastCommentSeq = parseInt(request.query.lastCommentSeq); //직전 조회의 마지막 seq
    const community_seq = parseInt(request.query.community_seq);
    

    let searchCondition = {};
    searchCondition.community_seq = community_seq;

    if(lastCommentSeq > 0){
      searchCondition = {...searchCondition, comment_seq:{$lt:lastCommentSeq}}
    }

    // if(subcomment_seq > 0){
    //   searchCondition = {...searchCondition, comment_seq:{$lte:lastCommentSeq}, subcomment_seq:{$gt:subcomment_seq} }
    // }
    
    
    const resObj = await Comments.find(
      searchCondition
    )
    .sort({comment_seq:-1, subcomment_seq:1})
    .limit(pageListCnt)
    .populate('userinfo', {_id:1, userseq:1, email:1, username:1, userimg:1, userthumbImg:1, introduction:1}).exec()
    ;
 

    sendObj = commonModules.sendObjSet("3250", resObj);
    response.status(200).send({
        sendObj
    });


  } catch (error) {
    response.status(500).send(commonModules.sendObjSet("3252", error));
  }
});

//커뮤니티 글에 대한 댓글 저장하기
communityRoute.post("/subcommentsave", getFields.none(), async (request, response) => {
  try {
    let sendObj = {};
    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
    if(!chechAuthRes){
      sendObj = commonModules.sendObjSet("2011");
    }else{

      const session = await mongoose.startSession();
      session.startTransaction(); // 트랜잭션을 시작합니다.

      const community_seq = parseInt(request.body.community_seq);
      const comment_seq = parseInt(request.body.comment_seq);
      const userseq = parseInt(request.body.userseq);
      const email = request.body.email;
      const userinfo = new ObjectId(request.body.userinfo); //사용자ID
      const communityinfo = new ObjectId(request.body.communityinfo); //커뮤니티글ID
      const comment = request.body.comment;
      

      const subcomment_seq = await sequence.getSequence("subcomment_seq");
      const subCommentObj = {
        comment_seq:comment_seq,
        subcomment_seq:subcomment_seq,
        community_seq:community_seq,
        userseq:userseq,
        userinfo:userinfo,
        communityinfo:communityinfo,
        comment:comment,
        reguser:email,
        upduser:email,

      }

      const newSubComments = new SubComments(subCommentObj);
      const resSubComments = await newSubComments.save();

      let upRes = await Comments.findOneAndUpdate({community_seq:community_seq, comment_seq:comment_seq,}
        ,{ $inc: { subcommentcnt: 1 } }
        ,{ new: true }
      )

      const obj = {
        subcommentcnt:upRes.subcommentcnt,
        newCommentObj:resSubComments
      }
      
      sendObj = commonModules.sendObjSet("3250", obj);

      await session.commitTransaction(); // 모든 작업이 성공했으므로 커밋합니다.
      session.endSession(); // 세션을 종료합니다.
    }

    response.status(200).send({sendObj});

  } catch (error) {
    if (session.inTransaction()) { // 트랜잭션이 활성 상태일 때만 롤백 시도
      await session.abortTransaction();
    }

    response.status(500).send(commonModules.sendObjSet("3252", error));
  }
});

//커뮤니티 글에 대한 대댓글 조회
communityRoute.get("/subcommentsearch", getFields.none(), async (request, response) => {
  try {

    let sendObj = {};

    const pageListCnt = commonModules.subCommentSearchPage; //10개씩 조회 
    const lastSubCommentSeq = parseInt(request.query.lastSubCommentSeq); //직전 조회의 마지막 seq
    const community_seq = parseInt(request.query.community_seq);
    const comment_seq = parseInt(request.query.comment_seq);

    let searchCondition = {};
    searchCondition.community_seq = community_seq;
    searchCondition.comment_seq = comment_seq;

    if(lastSubCommentSeq > 0){
      searchCondition = {...searchCondition, subcomment_seq:{$lt:lastSubCommentSeq}}
    }

    // if(subcomment_seq > 0){
    //   searchCondition = {...searchCondition, comment_seq:{$lte:lastCommentSeq}, subcomment_seq:{$gt:subcomment_seq} }
    // }
    
    
    const resObj = await SubComments.find(
      searchCondition
    )
    .sort({subcomment_seq:-1})
    .limit(pageListCnt)
    .populate('userinfo', {_id:1, userseq:1, email:1, username:1, userimg:1, userthumbImg:1, introduction:1}).exec()
    ;
 

    sendObj = commonModules.sendObjSet("3270", resObj);
    response.status(200).send({
        sendObj
    });


  } catch (error) {
    response.status(500).send(commonModules.sendObjSet("3272", error));
  }
});

//댓글업데이트
communityRoute.post("/commentupdate", getFields.none(), async (request, response) => {
  try {
      let sendObj = {};
      let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
      
      if(!chechAuthRes){
        sendObj = commonModules.sendObjSet("2011");
      }else{
        let date = new Date().toISOString();

        let updateComments=await Comments.updateOne(
          {
            community_seq:request.body.community_seq,
            comment_seq:request.body.comment_seq,
          },
          {
            
            "comment":request.body.comment,
            "upduser":request.body.email,
            "upddate":date,
          }
        );
        sendObj = commonModules.sendObjSet("3290");

        response.send({
          sendObj
        }); 
      }

  } catch (error) {
    // console.log(error);
    let obj = commonModules.sendObjSet(error.message); //code

    if(obj.code === ""){
      obj = commonModules.sendObjSet("3292");
    }
    response.status(500).send(obj);
  }
});

//대댓글업데이트
communityRoute.post("/subcommentupdate", getFields.none(), async (request, response) => {
  try {
      let sendObj = {};
      let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
      
      if(!chechAuthRes){
        sendObj = commonModules.sendObjSet("2011");
      }else{
        let date = new Date().toISOString();

        let updateComments=await SubComments.updateOne(
          {
            subcomment_seq:request.body.subcomment_seq,
            community_seq:request.body.community_seq,
            comment_seq:request.body.comment_seq,

          },
          {
            "comment":request.body.comment,
            "upduser":request.body.email,
            "upddate":date,
          }
        );
        sendObj = commonModules.sendObjSet("3300");

        response.send({
          sendObj
        }); 
      }

  } catch (error) {
    // console.log(error);
    let obj = commonModules.sendObjSet(error.message); //code

    if(obj.code === ""){
      obj = commonModules.sendObjSet("3302");
    }
    response.status(500).send(obj);
  }
});

//커뮤니티 글 리스트 조회 - 사용자별 my info 에서 조회함 
communityRoute.post("/communitylistsearchbyuser", getFields.none(), async (request, response) => {
  try {
      
    let sendObj = {};

    const pageListCnt = commonModules.communitySearchPage; //10개씩 조회 
    const lastSeq = parseInt(request.body.lastSeq); //직전 조회의 마지막 seq
    const userseq = parseInt(request.body.userseq);
    
    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
      
    if(!chechAuthRes){
      sendObj = commonModules.sendObjSet("2011");
    }else{
      let searchCondition = {
        userseq:userseq
      };
      
      if(lastSeq > 0){
        searchCondition.community_seq = {"$lt":lastSeq}
      }
      
      const resObj = await Communities.find(
        searchCondition
      )
      .sort({community_seq:-1})
      .limit(pageListCnt)
      // .populate('userinfo', {_id:1, userseq:1, email:1, username:1, userimg:1, userthumbImg:1, introduction:1}).exec()
      ;

      sendObj = commonModules.sendObjSet("3400", resObj);

    }
    

    response.status(200).send({
        sendObj
    });

  } catch (error) {
    response.status(500).send(commonModules.sendObjSet("3402", error));
      
  }
});

//커뮤니티 글에 대한 댓 리스트 조회 - 사용자별 my info 에서 조회함 
communityRoute.post("/commentlistsearchbyuser", getFields.none(), async (request, response) => {
  try {
      
    let sendObj = {};

    const pageListCnt = commonModules.communitySearchPage; //10개씩 조회 
    const lastSeq = parseInt(request.body.lastSeq); //직전 조회의 마지막 seq
    const userseq = parseInt(request.body.userseq);
    
    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
      
    if(!chechAuthRes){
      sendObj = commonModules.sendObjSet("2011");
    }else{
      let searchCondition = {
          userseq:userseq
      };
      
      if(lastSeq > 0){
        searchCondition.comment_seq = {"$lt":lastSeq}
      }
      
      const resObj = await Comments.find(
        searchCondition
      )
      .sort({comment_seq:-1})
      .limit(pageListCnt)
      // .populate('userinfo', {_id:1, userseq:1, email:1, username:1, userimg:1, userthumbImg:1, introduction:1}).exec()
      ;

      sendObj = commonModules.sendObjSet("3410", resObj);

    }
    

    response.status(200).send({
        sendObj
    });

  } catch (error) {
    response.status(500).send(commonModules.sendObjSet("3412", error));
      
  }
});

//대댓글 리스트 조회 - 사용자별 my info 에서 조회함 
communityRoute.post("/subcommentlistsearchbyuser", getFields.none(), async (request, response) => {
  try {
      
    let sendObj = {};

    const pageListCnt = commonModules.communitySearchPage; //10개씩 조회 
    const lastSeq = parseInt(request.body.lastSeq); //직전 조회의 마지막 seq
    const userseq = parseInt(request.body.userseq);
    
    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
      
    if(!chechAuthRes){
      sendObj = commonModules.sendObjSet("2011");
    }else{
      let searchCondition = {
        userseq:userseq
      };
      
      if(lastSeq > 0){
        searchCondition.subcomment_seq = {"$lt":lastSeq}
      }
      
      const resObj = await SubComments.find(
        searchCondition
      )
      .sort({subcomment_seq:-1})
      .limit(pageListCnt)
      // .populate('userinfo', {_id:1, userseq:1, email:1, username:1, userimg:1, userthumbImg:1, introduction:1}).exec()
      ;

      sendObj = commonModules.sendObjSet("3410", resObj);

    }
    

    response.status(200).send({
        sendObj
    });

  } catch (error) {
    response.status(500).send(commonModules.sendObjSet("3412", error));
      
  }
});

//좋아요 누른 커뮤니티 리스트
communityRoute.post("/likecommunitylistsearchbyuser", getFields.none(), async (request, response) => {
  try {
      
    let sendObj = {};

    const pageListCnt = commonModules.communitySearchPage; //10개씩 조회 
    const lastSeq = parseInt(request.body.lastSeq); //직전 조회의 마지막 seq
    const userseq = parseInt(request.body.userseq);
    
    let chechAuthRes = checkAuth.checkAuth(request.headers.accesstoken);
      
    if(!chechAuthRes){
      sendObj = commonModules.sendObjSet("2011");
    }else{
      let searchCondition = {
        userseq:userseq,
        likeyn:true
      };
    
      if(lastSeq > 0){
        searchCondition.community_seq = {"$lt":lastSeq}
      }
      
      const resObj = await CommunityLikes.find(
        searchCondition
      )
      .sort({community_seq:-1})
      .limit(pageListCnt)
      .populate('communityinfo', {_id:1, community_seq:1, userseq:1, title:1, contents:1, hashtags:1, likecnt:1, commentcnt:1, regdate:1}).exec()
      ;

      sendObj = commonModules.sendObjSet("3420", resObj);

    }
    

    response.status(200).send({
        sendObj
    });

  } catch (error) {
    console.log(error);
    response.status(500).send(commonModules.sendObjSet("3422", error));
      
  }
});

//커뮤니티 글 리스트 조회 - 홈에서 조회
communityRoute.post("/communitylistsearchhome", getFields.none(), async (request, response) => {
  try {
      
    let sendObj = {};

    const pageListCnt = 10; //10개씩 조회 
    
    
    const resObj = await Communities.find()
    .sort({community_seq:-1})
    .limit(pageListCnt)
    .populate('userinfo', {_id:1, userseq:1, email:1, username:1, userimg:1, userthumbImg:1, introduction:1}).exec()
    ;

    sendObj = commonModules.sendObjSet("3190", resObj);

    response.status(200).send({
        sendObj
    });

  } catch (error) {
    response.status(500).send(commonModules.sendObjSet("3192", error));
      
  }
});

module.exports=communityRoute