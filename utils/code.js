const MajorCode = require("../models/majorCodeSchemas");
const SubCode = require("../models/subCodeSchemas");

const getSubCodeStr = async (codeStr) => {
  try{
      const subCodes = await SubCode.find(
          {code:codeStr, deleteyn:"n"},
      ).sort({order:1});

      return subCodes;
          
  }catch(e){
      return "error"
  }
}

const getSubCodeArr = async (codeArr) => {

  try{
      const subCodes = await SubCode.find(
          {
            code : {
              $in: codeArr,
            },
            deleteyn:"n"
          },
      ).sort({code:1, subcode:1, order:1});
      return subCodes;
          
  }catch(e){
      return "error"
  }
}
//서브코드에서  attr1에 해당하는 코드를 조회한다.
const getSubCodeAttr1Str = async (codeStr) => {

  try{
    const subCodes = await SubCode.find(
        {attr1:codeStr, deleteyn:"n"},
    ).sort({order:1});
    return subCodes;
        
  }catch(e){
      return "error"
  }
}
//서브코드Arr에서  attr1에 해당하는 코드를 조회한다.
const getSubCodeAttr1Arr = async (codeArr) => {

  try{
      const subCodes = await SubCode.find(
          {
            attr1 : {
              $in: codeArr,
            },
            deleteyn:"n"
          },
      ).sort({order:1});
      return subCodes;
          
  }catch(e){
      return "error"
  }
}


module.exports.getSubCodeStr = getSubCodeStr;
module.exports.getSubCodeArr = getSubCodeArr;
module.exports.getSubCodeAttr1Str = getSubCodeAttr1Str;
module.exports.getSubCodeAttr1Arr = getSubCodeAttr1Arr;