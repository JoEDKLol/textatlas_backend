const mongoose = require('mongoose')

const getDateString = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0'); // 0부터 시작하므로 +1
  const dd = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${yyyy}${mm}${dd}${hours}${minutes}${seconds}`; // e.g., "20250430000000"
};

const InquirySchemas = mongoose.Schema({
  
  inquiry_seq : {
    type: Number,
    index:{unique:true},
    required: true,
  },

  senddt : {
    type: String,
    default: getDateString,
    index: true, // 검색 성능 향상 
    required: true,
  },

  email : {
    type: String,
    required: true,
    index: true // 검색 성능 향상
  },

  inquiry : { //01:일반 문의, 02:버그 신고, 03:도서 추가 요청, 04:커뮤니티/쪽지 관련 문의
    type: String,
    required: true,
    index: true // 검색 성능 향상
  },

  content : { 
    type: String,
    text:true,
    required: true,
  },

  userinfo   : {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "user", 
  },

  // 상태 (00:읽지않음, 01:처리중, 02:처리완료)
  status : { 
    type: String,
    default: "00",
  },

  replied : { //답변이메일 전송 여부 
    type: Boolean,
    default: false,
  },
  
  ip_address : { //
    type: String,
  },


  deleteyn : {
    type: String,
    default: "n"
  },
  regdate : {
    type: Date,
    default: Date.now
  },
  reguser : {
    type: String,
    required: true
  },
  upddate : {
    type: Date,
    default: Date.now
  },
  upduser : {
    type: String,
    required: true
  }
  
});




const Inquiries=mongoose.model('inquiry',InquirySchemas)
module.exports=Inquiries