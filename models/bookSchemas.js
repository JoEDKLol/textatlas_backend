const mongoose = require('mongoose')

const getDateString = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0'); // 0부터 시작하므로 +1
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`; // e.g., "20250430"
};

const BookSchemas = mongoose.Schema({
   
  book_seq : {
    type: Number,
    index:{unique:true}
  },

  read_type : { //추후에 기사 등의 읽을거리 추가에 대한 구분값 "book", "article" 등등
    type: String,
  }, 

  source : {
    type: String,
    // index:{unique:false}
  },

  book_id : {
    type: Number,
    index:{unique:false}
  },

  title : {
    type: String,
    index:{unique:false}
  },

  book_title : {
    type: String,
    text: true
  },

  alternate_title : {
    type: String,
    // index:{unique:false}
  },

  author : {
    type: Object,
  },

  subjects : {
    type: Array,
  },

  copyright_status : {
    type: String,
    // index:{unique:false}
  },

  language : {
    type: String,
  },

  release_date : {
    type: String,
  },

  reading_level : {
    type: String,
  },

  loc_class : {
    type: Array,
  },

  download_url : {
    type: String,
  },

  downloads_30_days : {
    type: String,
  },

  images : {
    type: Array,
  },

  content : {
    type: String,
  },

  pages : {
    type: Array,
  },

  translator_kr : {
    type: Array,
  },

  translator_sp : {
    type: Array,
  },

  translator_ch : {
    type: Array,
  },

  translator_jp : {
    type: Array,
  },

  total_pages : {
    type: Number,
    default: 0
  },

  crawled_at : {
    type: String,
  },

  most_recently_updated : {
    type: String,
  },



  viewcount : {
    type: Number,
    default: 0
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




const Books=mongoose.model('book',BookSchemas)
module.exports=Books