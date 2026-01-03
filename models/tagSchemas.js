const mongoose = require('mongoose')

const TagSchemas = mongoose.Schema({
   
  tagname : {
    type: String,
    index:{unique:false}
  },
  
  regdt : {
    type: Date,
    index:{unique:false},
    default: Date.now
  },

  cnt : {
    type: Number,
    index:{unique:false},
    default: 1,
  },
})


const Tags=mongoose.model('Tag',TagSchemas)
module.exports=Tags