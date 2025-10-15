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

const HotwordSchemas = mongoose.Schema({

  regdt : {
    type: String,
    default: getDateString,
    index: true // 검색 성능 향상 
  },

  book_seq : {
    type: Number,
    index:true
  },

  page : {
    type: Number,
  },

  sentenceindex : {
    type: Number,
  },

  word : {
    type: String,
    index:true
  },

  wordinfo   : {
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: "dictionary", 
    index:true
  },

  sentence : {
    type: String,
    index:true
  },
  
  count : {
    type: Number,
    default: 0
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




const Hotwords=mongoose.model('hotword',HotwordSchemas)
module.exports=Hotwords