
const readingPage = 20;
const bookHisSearchPage = 10; //사용자별 히스토리에서 읽은 책 리스트 조회 리스트
const bookSavedWordSearchPage = 10; //사용자별 히스토리에서 선택한 책의 저장한 단어 리스트 조회
const bookSavedSentenceSearchPage = 10; //사용자별 히스토리에서 선택한 책의 저장한 문장 리스트 조회
const dictionarySearchPage = 20;
const commentPage = 5;
const replyPage = 5;
const codes = [
    {code:"1000", msg:"가입성공", yn:"y"},
    {code:"1001", msg:"이미 가입된 이메일이 있습니다.", yn:"n"},
    {code:"1002", msg:"Internal Server Error", yn:"n"},
    {code:"1010", msg:"email verify send success", yn:"y"},
    {code:"1011", msg:"이미 가입된 이메일이 있습니다.", yn:"n"},
    {code:"1012", msg:"email 인증번호 발송 실패 ", yn:"n"}, //email verify send fail (sendMail)
    {code:"1013", msg:"email 인증번호 발송 실패 ", yn:"n"},
    {code:"1014", msg:"email 인증번호 발송 실패 (3분 이내 재발송)", yn:"n"},
    {code:"1020", msg:"인증번호 인증 성공", yn:"y"},
    {code:"1021", msg:"인증번호 인증 실패", yn:"n"},
    {code:"1022", msg:"Internal Server Error", yn:"n"},
    {code:"1050", msg:"로그인 성공", yn:"y"},
    {code:"1051", msg:"로그인 실패", yn:"n"},
    {code:"1052", msg:"로그인 시도 횟수 초과", yn:"n"},

    {code:"1060", msg:"사용자 선호 번역언어 업데이트 성공", yn:"y"},
    {code:"1061", msg:"사용자 선호 번역언어 업데이트 실패", yn:"n"},
    {code:"1062", msg:"Internal Server Error", yn:"n"},

    {code:"1200", msg:"learning 단어 저장 성공", yn:"y"},
    {code:"1201", msg:"learning 단어 저장 실패", yn:"n"},
    {code:"1202", msg:"Internal Server Error", yn:"n"},

    {code:"1210", msg:"learning 문장 저장 성공", yn:"y"},
    {code:"1211", msg:"learning 문장 저장 실패", yn:"n"},
    {code:"1212", msg:"Internal Server Error", yn:"n"},
    
    {code:"2000", msg:"request access-token success", yn:"y"},
    {code:"2001", msg:"request access-token failed", yn:"n"},
    {code:"2002", msg:"request access-token failed-refreshTokenError", yn:"n"},
    {code:"2010", msg:"request access-token-check success", yn:"n"},
    {code:"2011", msg:"request access-token-check failed", yn:"n"},
    {code:"2020", msg:"request logout success", yn:"n"},

    {code:"1030", msg:"email verify send success", yn:"y"},
    {code:"1031", msg:"이미 가입된 이메일이 있습니다.", yn:"n"},
    {code:"1032", msg:"email 인증번호 발송 실패", yn:"n"},
    {code:"1033", msg:"email 인증번호 발송 실패", yn:"n"},
    {code:"1034", msg:"email 인증번호 발송 실패 (3분 이내 재발송)", yn:"n"},

    {code:"1040", msg:"비밀번호 변경 성공", yn:"y"},
    {code:"1041", msg:"비밀번호 변경 실패.", yn:"n"},
    {code:"1042", msg:"Internal Server Error", yn:"n"},


    {code:"3000", msg:"books 조회 성공", yn:"y"},
    {code:"3001", msg:"books 조회 실패", yn:"y"},
    {code:"3002", msg:"Internal Server Error", yn:"y"},

    {code:"3010", msg:"book detail 조회 성공", yn:"y"},
    {code:"3011", msg:"book detail 조회 실패", yn:"y"},
    {code:"3012", msg:"Internal Server Error", yn:"y"},

    {code:"3020", msg:"book reading 조회 성공", yn:"y"},
    {code:"3021", msg:"book reading 조회 실패", yn:"y"},
    {code:"3022", msg:"Internal Server Error", yn:"y"},
    {code:"3023", msg:"번역 실패", yn:"y"},

    {code:"3030", msg:"사용자별 읽기 조회 성공", yn:"y"},
    {code:"3031", msg:"사용자별 읽기 조회 실패", yn:"y"},
    {code:"3032", msg:"Internal Server Error", yn:"y"},

    {code:"3040", msg:"사용자별 단어 번역 성공", yn:"y"},
    {code:"3041", msg:"사용자별 단어 번역 실패", yn:"y"},
    {code:"3042", msg:"Internal Server Error", yn:"y"},
    {code:"3043", msg:"번역 실패", yn:"y"},

    {code:"3050", msg:"사용자 히스토리 책리스트 조회 성공", yn:"y"},
    {code:"3051", msg:"사용자 히스토리 책리스트 조회 실패", yn:"y"},
    {code:"3052", msg:"Internal Server Error", yn:"y"},

    {code:"3060", msg:"사용자가 선택한 책의 저장한 단어 조회 성공", yn:"y"},
    {code:"3061", msg:"사용자가 선택한 책의 저장한 단어 조회 실패", yn:"y"},
    {code:"3062", msg:"Internal Server Error", yn:"y"},

    {code:"3070", msg:"사용자가 선택한 책의 저장한 문장 조회 성공", yn:"y"},
    {code:"3071", msg:"사용자가 선택한 책의 저장한 문장 조회 실패", yn:"y"},
    {code:"3072", msg:"Internal Server Error", yn:"y"},

    {code:"3080", msg:"단어가 포함된 문장 번역 성공", yn:"y"},
    {code:"3081", msg:"단어가 포함된 문장 번역 성공 실패", yn:"y"},
    {code:"3082", msg:"Internal Server Error", yn:"y"},

    {code:"3090", msg:"단어 별포인트 업데이트 성공", yn:"y"},
    {code:"3091", msg:"단어 별포인트 업데이트 실패", yn:"y"},
    {code:"3092", msg:"Internal Server Error", yn:"y"},

    {code:"3100", msg:"문장 별포인트 업데이트 성공", yn:"y"},
    {code:"3101", msg:"문장 별포인트 업데이트 실패", yn:"y"},
    {code:"3102", msg:"Internal Server Error", yn:"y"},

    


    //9000번대를 관리자페이지 관련 결과코드
    {code:"9000", msg:"코드 조회 성공.", yn:"y"},
    {code:"9001", msg:"코드 조회 실패", yn:"n"},
    {code:"9002", msg:"Internal Server Error", yn:"n"},
    {code:"9010", msg:"languageSet 조회 성공.", yn:"y"},
    {code:"9011", msg:"languageSet 조회 실패", yn:"n"},
    {code:"9012", msg:"Internal Server Error", yn:"n"},

    {code:"9030", msg:"wordlist 조회 성공.", yn:"y"},
    {code:"9031", msg:"wordlist 조회 실패", yn:"n"},
    {code:"9032", msg:"Internal Server Error", yn:"n"},

    {code:"9040", msg:"wordlist update 성공.", yn:"y"},
    {code:"9041", msg:"wordlist update 실패", yn:"n"},
    {code:"9042", msg:"Internal Server Error", yn:"n"},
    {code:"9043", msg:"이미 저장된 단어입니다.", yn:"n"},

    {code:"9050", msg:"wordlist 다건 save 성공.", yn:"y"},
    {code:"9051", msg:"wordlist 다건 save 실패", yn:"n"},
    {code:"9052", msg:"Internal Server Error", yn:"n"},
]

function sendObjSet(code, resObj) {

    let obj = {
        // // code:code , 
        // code:(returnCodeContents(code).length === 0) ? "" : code,
        // message:returnCodeContents(code)[0],
        // success:returnCodeContents(code)[1],
        // resObj:resObj
    }

    const findCode = codes.find((elem) => elem.code === code);
    if(findCode){
        obj.code = findCode.code;
        obj.message = findCode.msg;
        obj.success = findCode.yn;
        obj.resObj = resObj;
    }else{
        obj.code = "";
        obj.message = "없는 코드입니다.";
        obj.success = "n";
        obj.resObj = resObj;
    }


    return obj;



}



const getRandomNumber = (n) => {

    let retNum = "";
    for (let i = 0; i < n; i++) {
        retNum += Math.floor(Math.random() * 10)
    }
    return retNum;

}

const getDateString = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0'); // 0부터 시작하므로 +1
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`; // e.g., "20250430"
};

/**
 * 주어진 문자열 배열에서 문장 내의 엔터값을 공백으로 변환합니다.
 * 순수하게 공백/엔터로만 이루어진 문자열은 변경하지 않고 유지합니다.
 * 
 * @param {string[]} inputArray 처리할 문자열 배열
 * @returns {string[]} 처리된 문자열 배열
 */
function processTextArray(inputArray) {
  if (!Array.isArray(inputArray)) {
    console.error("입력은 배열이어야 합니다.");
    return [];
  }

  const processedArray = inputArray.map(item => {
    // 문자열이 아닌 요소가 있을 경우를 대비해 문자열로 변환 (선택 사항)
    const currentString = String(item); 

    // 문자열을 trim() 했을 때 길이가 0보다 크면 문장이 있다고 판단합니다.
    // (즉, 공백이 아닌 실제 문자가 하나라도 포함되어 있다는 의미)
    if (currentString.trim().length > 0) {
      // 문장 내부에 있는 엔터값 (캐리지 리턴 \r 또는 라인 피드 \n, 그리고 \r\n 조합)을 
      // 하나의 공백으로 변경합니다.
      // 전역(g) 플래그를 사용하여 모든 일치 항목을 변경합니다.
      return currentString.replace(/(\r\n|\n|\r)/g, ' ');
    } else {
      // 순수하게 공백, 탭, 엔터로만 이루어진 문자열은 변경하지 않고 그대로 반환합니다.
      return currentString;
    }
  });

  return processedArray;
}



module.exports.sendObjSet = sendObjSet;
module.exports.getRandomNumber = getRandomNumber;
module.exports.getDateString = getDateString;
module.exports.dictionarySearchPage = dictionarySearchPage;
module.exports.readingPage = readingPage;
module.exports.commentPage = commentPage;
module.exports.replyPage = replyPage;
module.exports.bookHisSearchPage = bookHisSearchPage;

module.exports.bookSavedWordSearchPage = bookSavedWordSearchPage;
module.exports.bookSavedSentenceSearchPage = bookSavedSentenceSearchPage;

module.exports.processTextArray = processTextArray;

