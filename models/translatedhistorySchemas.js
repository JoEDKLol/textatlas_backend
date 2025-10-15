const mongoose = require('mongoose')

//마지막 학습 문장 확인에 필요 학습을 위한 다음문장 클릭시 저장
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

const TranslatedhistorySchemas = mongoose.Schema({
   
  userseq : {
    type: Number,
    index:{unique:false}
  },
  
  book_seq : {
    type: Number,
    index:{unique:false}
  },

  translateddt : {
    type: String,
    default: getDateString,
    index: true
  },

  page : {
    type: Number,
  },

  type : { //a:단어, b:문장
    type: String,
  }, 

  word : {
    type: String,
  }, 

  sentenceindex : {
    type: Number,
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




const Translatedhistories=mongoose.model('translatedhistory',TranslatedhistorySchemas)
module.exports=Translatedhistories