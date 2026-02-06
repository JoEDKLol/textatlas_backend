const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cookieParser = require("cookie-parser");
dotenv.config()

const cors = require("cors")
let corspolicy = {
    // origin:'http://localhost:3000'
    origin:process.env.FRONTEND_URL
}


// const restaurantRoute = require('./routes/restaurantRoute')
// const managementRoute = require('./routes/managementRoute')
// const blogRouter = require('./routes/blogRoute')

const path = require("path");
const commonRoute = require('./routes/commonRoute');
const userRouter = require('./routes/userRoute');
const bookRoute = require('./routes/bookRoute');
const readingRoute = require('./routes/reading');
const historyRoute = require('./routes/historyRoute');
const administratorRouter = require('./routes/administratorRoute');
const communityRoute = require('./routes/communityRoute');
const messageRoute = require('./routes/messageRoute');
const logger = require('./utils/logger');
const publicPath = path.join(__dirname, "uploads"); //정적파일 로드 


const app = express();

// AWS ALB(로드밸런서)를 거쳐올 때 원본 IP를 신뢰하도록 설정
// app.set('trust proxy', true);

app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(
    cors({
      exposedHeaders: ['accesstoken'],
      // credentials: true,
    }),
  );
app.use(cors(corspolicy));
app.use(cookieParser());

app.use(express.static(publicPath)); 

const db = module.exports = () => {
  try{
      mongoose.connect(process.env.DBURI
      ,   {user:process.env.DBUSERNAME, pass:process.env.DBPASSWORD,
          useNewUrlParser:true, useUnifiedTopology:true
          }
      )
      console.log("MongoDB Connection is Successful")
  }catch(error){
      console.log("MongoDB Connection is failed")
  }
}

db();

app.use('/',commonRoute);
app.use('/user',userRouter); 
app.use('/book',bookRoute); 
app.use('/reading',readingRoute);
app.use('/administrator',administratorRouter);
app.use('/history',historyRoute);
app.use('/community',communityRoute);
app.use('/message',messageRoute);



// app.use('/res',restaurantRoute);
// app.use('/management',managementRoute);
// app.use('/blog',blogRouter);

app.use((err, req, res, next) => {
  
  logger.error(err.message, { 
      error_id: "index", 
      description: err.message,
      stack: err.stack
   });
  res.status(500).send('Internal Server Error');
});

app.listen(process.env.PORT,()=>{
  console.log(`Example app listening at http://localhost:${process.env.PORT}`)
})