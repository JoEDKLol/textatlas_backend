const mongoose = require('mongoose')
const bcrypt = require("bcrypt");
const saltRounds = 10;

const UserSchema = mongoose.Schema({
  userseq : {
    type: Number,
    index:{unique:true}
  },
  email : {
    type: String,
    required: true,
    index:{unique:true}
  },
  password : {
    type: String,
  },

  username : {
    type: String,
  }, 
  
  userimg : {
    type: String,
  }, 
  
  userthumbImg : {
    type: String,
  }, 

  loginattemptscnt : {
    type: Number,
    default: 0
  },
  role : {
    type: String,
    enum: ['administrator','user'],
    default: 'user'
  },
  joinlevel: {
    type: Number,
    default: 0
  },
  learninglevel: {
    type: String,
  },
  interestcategories: {
    type: Array,
    default: []
  },
  interestDetails: {
    type: Array,
    default: []
  },
  agree: {
    type: Object,
    default: {"all":false, "개인회원약관":false, "개인정보수집":false, "마케팅정보수집":false}
  },

  firstLogin: {
    type: Boolean,
    default : false
  }, 

  socialLogin: {
    type: Boolean,
    default : false
  }, 

  accountlock : {
    type: String,
    default: "n"
  },

  ad_free_period:{
    type: Date,
  },

  //선호 번역 언어 kr, es
  preferred_trans_lang: {
    type: String,
    default: "kr"
  },

  introduction : {
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

})

UserSchema.pre("save", function(next){

    var user = this;

    if (user.isModified("password")) {
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) return next(err);
            bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
          });
        });
      } else {
        next();
      }

})

UserSchema.pre("updateOne", function(next){

    var user = this;
    if (user._update.password) {
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) return next(err);
            bcrypt.hash(user._update.password, salt, function (err, hash) {
                if (err) return next(err);
                user._update.password = hash;
                next();
            });
        });
      } else {
        next();
      }
})

UserSchema.methods.comparePassword = async function (plainPassword) {
    let res = await bcrypt.compare(plainPassword, this.password);
    return res;
};

const Users=mongoose.model('user',UserSchema)
module.exports=Users