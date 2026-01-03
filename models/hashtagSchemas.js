const mongoose = require('mongoose')


const HashtagSchema = mongoose.Schema({
   
  tagname : {
    type: String,
    index:{unique:false}
  },
  
  community_seq : {
    type: Number,
    index:{unique:false}
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


const Hashtags=mongoose.model('Hashtag',HashtagSchema)
module.exports=Hashtags