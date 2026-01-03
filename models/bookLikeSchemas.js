const mongoose = require('mongoose')

const BookLikeSchemas = mongoose.Schema({

    book_seq : {
      type: Number,
      index:{unique:false}
    },

    userseq : {
      type: Number,
      index:{unique:false}
    },
    
    bookinfo: {
      type: mongoose.Schema.Types.ObjectId, 
      required: true,
      ref: "book", 
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


const BookLikes=mongoose.model('bookLike',BookLikeSchemas)
module.exports=BookLikes