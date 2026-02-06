const mongoose = require('mongoose')

const getDateString = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0'); // 0부터 시작하므로 +1
  const dd = String(now.getDate()).padStart(2, '0');
  // const hours = String(now.getHours()).padStart(2, '0');
  // const minutes = String(now.getMinutes()).padStart(2, '0');
  // const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${yyyy}${mm}`; // e.g., "20250430000000"
};

const HotwordSchemas = mongoose.Schema({
  
  seq : {
    type: Number,
    index:true
  },

  regdt : {
    type: String,
    default: getDateString,
    index: true // 검색 성능 향상 
  },
  
  word : {
    type: String,
    index:true
  },

  count : {
    type: Number,
    index:true,
    default:1
  },
  wordinfo   : {
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: "dictionary", 
  },
  saveyn : { //저장했는지 여부 (최초에 모르는 단어 뜻을 확인, 그이후에는 저장할수 있음. )
    type: Boolean,
    default: false
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