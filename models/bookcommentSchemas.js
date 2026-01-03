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

const BookcommentSchemas = mongoose.Schema({
  
  bookcomment_seq : {
    type: Number,
    index:{unique:true}
  },

  book_seq : {
    type: Number,
    index:{unique:false}
  },
  
  userseq : {
    type: Number,
    index:{unique:false}
  },
  
  userinfo   : {
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: "user", 
  },

  comment : { 
    type: String,
  },

  // 2025 10 18 마이 히스토리 화면에서 검색을 위해서 추가 book_title, images
  book_title : {
    type: String,
  },

  images : { //책에 대한 이미지
    type: Array,
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




const Bookcomments=mongoose.model('bookcomment',BookcommentSchemas)
module.exports=Bookcomments