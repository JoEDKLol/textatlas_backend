const mongoose = require('mongoose')


const DictionarySchemas = mongoose.Schema({
   
  word : {
    type: String,
    index:{unique:true}
  },

  meaningKR : {
    type: String,
  },

  reworkmeaningKR : { //관리자가 등록한 경우 태그와 같이 insert됨
    type: String,
  },

  reworkynKR : {
    type: Boolean,
    default: false,
  },

  meaningES : { //에스파뇨 사전
    type: String,
  },

  reworkmeaningES : { //관리자 등록 영문사전
    type: String,
  },

  reworkynES : { //관리자가 등록한 경우 true
    type: Boolean,
    default: false,
  },

  ref1 : {
    type: String,
  },

  ref2 : {
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


const Dictionaries=mongoose.model('dictionary',DictionarySchemas)
module.exports=Dictionaries