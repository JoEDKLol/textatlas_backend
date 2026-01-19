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

const MessageSchemas = mongoose.Schema({
  message_seq : {
    type: Number,
    index:{unique:true}
  },

  send_user_seq : {
    type: Number,
    index:{unique:false}
  },

  receive_user_seq : {
    type: Number,
    index:{unique:false}
  },

  send_time : {
    type: String,
    default: getDateString,
  },

  receive_time : {
    type: String,
  },

  msg_checkyn : {
    type: Boolean,
    default:false
  },

  title : { //단어가 포함된 문장
    type: String,
    text:true
  },

  message : { 
    type: String,
    text:true
  },

  send_msg_deleteyn : {
    type: Boolean,
    default:false
  },

  receive_msg_deleteyn : {
    type: Boolean,
    default:false
  },

  send_userinfo   : {
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: "user", 
  },

  receive_userinfo   : {
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: "user", 
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

})


const Messages=mongoose.model('message',MessageSchemas)
module.exports=Messages