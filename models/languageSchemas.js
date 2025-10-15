const mongoose = require('mongoose')


const LanguageSchemas = mongoose.Schema({
   
  text_by_language_us : {
    type: Array,
  },

  text_by_language_kr : {
    type: Array,
  },

  text_by_language_mx : {
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




const Languages=mongoose.model('language',LanguageSchemas)
module.exports=Languages