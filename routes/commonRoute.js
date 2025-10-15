const express=require('express')
const multer=require('multer')
const commonRoute=express.Router()
let getFields=multer()
const Languages = require("../models/languageSchemas");

const ObjectId = require("mongoose").Types.ObjectId;
const commonModules = require("../utils/common");
// const jwtModules = require("../utils/jwtmodule");
// const { default: mongoose } = require('mongoose')
// const db = mongoose.connection;
// const sequence = require("../utils/sequences");

commonRoute.get("/getlanguageset", getFields.none(), async (request, response) => {
  try {
      let sendObj = {};
      let resLanguages = await Languages.findOne();

      console.log(resLanguages);
      sendObj = commonModules.sendObjSet("9010", resLanguages);
      response.status(200).send({
          sendObj
      });

  } catch (error) {
      console.log(error);
      response.status(500).send(commonModules.sendObjSet("9012", error));
      
  }
});

module.exports=commonRoute