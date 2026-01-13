const mongoose = require('mongoose')

const CommunityLikeSchemas = mongoose.Schema({

    community_seq : {
      type: Number,
      index:{unique:false}
    },

    userseq : {
      type: Number,
      index:{unique:false}
    },
    
    communityinfo: {
      type: mongoose.Schema.Types.ObjectId, 
      required: true,
      ref: "community", 
    },

    likeyn : {
      type: Boolean,  
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


const CommunityLikes=mongoose.model('communityLike',CommunityLikeSchemas)
module.exports=CommunityLikes