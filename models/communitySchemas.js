const mongoose = require('mongoose')

//게시판 
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

const CommunitySchemas = mongoose.Schema({
  
  community_seq : {
    type: Number,
    index:{unique:true}
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

  title : { //단어가 포함된 문장
    type: String,
    text:true
  },

  contents : { 
    type: String,
    text:true
  },

  hashtags : {
    type: Array,
  },

  likecnt : {
    type: Number,
    default:0
  }, 

  commentcnt : {
    type: Number,
    default:0
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




const Communities=mongoose.model('community',CommunitySchemas)
module.exports=Communities