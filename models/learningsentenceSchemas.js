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

const LearningsentenceSchemas = mongoose.Schema({

  seq : {
    type: Number,
    index:{unique:true}
  },

  userseq : {
    type: Number,
    index:{unique:false}
  },

  book_seq : {
    type: Number,
    index:{unique:false}
  },

  learningdt : {
    type: String,
    default: getDateString,
    index: true // 검색 성능 향상 
  },

  page : {
    type: Number,
  },

  sentenceindex : {
    type: Number,
  },
  
  sentence : {
    type: String,
    text: true
  },

  translatedsentenceKR : {
    type: String,
  },

  translatedsentenceES : {
    type: String,
  },

  importance : { //별표
    type: Number,
    default: 0
  },

  // 2025 10 18 마이 히스토리 화면에서 검색을 위해서 추가 book_title, images
  book_title : {
    type: String,
    
  },

  images : {
    type: Array,
  },

  //학습완료여부 체크되면 조회시 검색 안된다. 
  learningyn : {
    type:Boolean,
    index: true,
    default: false,
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




const Learningsentences=mongoose.model('learningsentence',LearningsentenceSchemas)
module.exports=Learningsentences