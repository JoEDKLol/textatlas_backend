
const readingPage = 20;
const bookHisSearchPage = 12; //사용자별 히스토리에서 읽은 책 리스트 조회 리스트
const bookSavedWordSearchPage = 10; //사용자별 히스토리에서 선택한 책의 저장한 단어 리스트 조회
const bookSavedSentenceSearchPage = 10; //사용자별 히스토리에서 선택한 책의 저장한 문장 리스트 조회
const communitySearchPage = 10; //등록한 커뮤니티 글 리스트 조회
const commentSearchPage = 10; //댓글 리스트 조회
const subCommentSearchPage = 10; //대댓글 리스트 조회 거수
const messageSearchPage = 10; //메시지 리스트 조회 건수
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

    {code:"9100", msg:"Image save success.", yn:"y"},
    {code:"9101", msg:"Image save failed", yn:"n"},
    {code:"9102", msg:"Internal Server Error", yn:"n"},

    {code:"9110", msg:"Image delete success.", yn:"y"},
    {code:"9111", msg:"Image delete failed", yn:"n"},
    {code:"9112", msg:"Internal Server Error", yn:"n"},

    {code:"9120", msg:"Image and userimg delete success.", yn:"y"},
    {code:"9121", msg:"Image and userimg delete failed", yn:"n"},
    {code:"9122", msg:"Internal Server Error", yn:"n"},


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

    {code:"3110", msg:"사용자가 저장한 단어 조회 성공", yn:"y"},
    {code:"3111", msg:"사용자가 저장한 단어 조회 성공", yn:"y"},
    {code:"3112", msg:"Internal Server Error", yn:"y"},

    {code:"3120", msg:"사용자가 저장한 문장 조회 성공", yn:"y"},
    {code:"3121", msg:"사용자가 저장한 문장 조회 성공", yn:"y"},
    {code:"3122", msg:"Internal Server Error", yn:"y"},

    {code:"3130", msg:"단어 학습완료 업데이트 성공", yn:"y"},
    {code:"3131", msg:"단어 학습완료 업데이트 실패", yn:"y"},
    {code:"3132", msg:"Internal Server Error", yn:"y"},

    {code:"3140", msg:"학습에서 단어 조회 성공", yn:"y"},
    {code:"3141", msg:"학습에서 단어 조회 실패", yn:"y"},
    {code:"3142", msg:"Internal Server Error", yn:"y"},

    {code:"3150", msg:"학습에서 단어 건수 조회 성공", yn:"y"},
    {code:"3151", msg:"학습에서 단어 건수 조회 실패", yn:"y"},
    {code:"3152", msg:"Internal Server Error", yn:"y"},

    {code:"3160", msg:"학습에서 문장 조회 성공", yn:"y"},
    {code:"3161", msg:"학습에서 문장 조회 실패", yn:"y"},
    {code:"3162", msg:"Internal Server Error", yn:"y"},

    {code:"3170", msg:"학습에서 문장 건수 조회 성공", yn:"y"},
    {code:"3171", msg:"학습에서 문장 건수 조회 실패", yn:"y"},
    {code:"3172", msg:"Internal Server Error", yn:"y"},

    {code:"3180", msg:"글쓰기 저장 성공", yn:"y"},
    {code:"3181", msg:"글쓰기 저장 실패", yn:"y"},
    {code:"3182", msg:"Internal Server Error", yn:"y"},

    {code:"3190", msg:"커뮤니티 글쓰기 조회 성공", yn:"y"},
    {code:"3191", msg:"커뮤니티 글쓰기 조회 실패", yn:"y"},
    {code:"3192", msg:"Internal Server Error", yn:"y"},

    {code:"3200", msg:"태그 조회 성공", yn:"y"},
    {code:"3201", msg:"태그 조회 실패", yn:"y"},
    {code:"3202", msg:"Internal Server Error", yn:"y"},

    {code:"3210", msg:"커뮤니티글 상세 조회 성공", yn:"y"},
    {code:"3211", msg:"커뮤니티글 상세 조회 실패", yn:"y"},
    {code:"3212", msg:"Internal Server Error", yn:"y"},

    {code:"3220", msg:"커뮤니티글 좋아요 (사용자별) 조회 성공", yn:"y"},
    {code:"3221", msg:"커뮤니티글 좋아요 (사용자별) 조회 실패", yn:"y"},
    {code:"3222", msg:"Internal Server Error", yn:"y"},

    {code:"3230", msg:"커뮤니티글 좋아요 (사용자별) 업데이트 성공", yn:"y"},
    {code:"3231", msg:"커뮤니티글 좋아요 (사용자별) 업데이트 실패", yn:"y"},
    {code:"3232", msg:"Internal Server Error", yn:"y"},

    {code:"3240", msg:"커뮤니티글 좋아요 (사용자별) 업데이트 성공", yn:"y"},
    {code:"3241", msg:"커뮤니티글 좋아요 (사용자별) 업데이트 실패", yn:"y"},
    {code:"3242", msg:"Internal Server Error", yn:"y"},

    {code:"3250", msg:"댓글 리스트 조회 성공", yn:"y"},
    {code:"3251", msg:"댓글 리스트 조회 실패", yn:"y"},
    {code:"3252", msg:"Internal Server Error", yn:"y"},

    {code:"3260", msg:"대댓글 저장 성공", yn:"y"},
    {code:"3261", msg:"대댓글 저장 실패", yn:"y"},
    {code:"3262", msg:"Internal Server Error", yn:"y"},

    {code:"3270", msg:"대댓글 조회 성공", yn:"y"},
    {code:"3271", msg:"대댓글 조회 실패", yn:"y"},
    {code:"3272", msg:"Internal Server Error", yn:"y"},

    {code:"3280", msg:"나의 정보 업데이트 성공", yn:"y"},
    {code:"3281", msg:"나의 정보 업데이트 실패", yn:"y"},
    {code:"3282", msg:"Internal Server Error", yn:"y"},

    {code:"3290", msg:"댓글 업데이트 성공", yn:"y"},
    {code:"3291", msg:"댓글 업데이트 실패", yn:"y"},
    {code:"3292", msg:"Internal Server Error", yn:"y"},

    {code:"3300", msg:"댓글 업데이트 성공", yn:"y"},
    {code:"3301", msg:"댓글 업데이트 실패", yn:"y"},
    {code:"3302", msg:"Internal Server Error", yn:"y"},

    {code:"3310", msg:"댓글 업데이트 성공", yn:"y"},
    {code:"3311", msg:"댓글 업데이트 실패", yn:"y"},
    {code:"3312", msg:"Internal Server Error", yn:"y"},

    {code:"3320", msg:"커뮤니티 글 업데이트 성공", yn:"y"},
    {code:"3321", msg:"커뮤니티 글 업데이트 실패", yn:"y"},
    {code:"3322", msg:"Internal Server Error", yn:"y"},

    {code:"3330", msg:"쪽지함 조회 성공", yn:"y"},
    {code:"3331", msg:"쪽지함 조회 실패", yn:"y"},
    {code:"3332", msg:"Internal Server Error", yn:"y"},

    {code:"3340", msg:"쪽지함 전송 성공", yn:"y"},
    {code:"3341", msg:"쪽지함 전송 실패", yn:"y"},
    {code:"3342", msg:"Internal Server Error", yn:"y"},

    {code:"3350", msg:"쪽지함 내용 확인 업데이트 성공", yn:"y"},
    {code:"3351", msg:"쪽지함 내용 확인 업데이트 실패", yn:"y"},
    {code:"3352", msg:"Internal Server Error", yn:"y"},

    {code:"3360", msg:"읽지 않은 메시지 건수 조회 성공", yn:"y"},
    {code:"3361", msg:"읽지 않은 메시지 건수 조회 실패", yn:"y"},
    {code:"3362", msg:"Internal Server Error", yn:"y"},

    {code:"3370", msg:"메시지 삭제 성공", yn:"y"},
    {code:"3371", msg:"메시지 삭제 실패", yn:"y"},
    {code:"3372", msg:"Internal Server Error", yn:"y"},
    
    {code:"3380", msg:"받은 쪽지함 조회 성공", yn:"y"},
    {code:"3381", msg:"받은 쪽지함 조회 실패", yn:"y"},
    {code:"3382", msg:"Internal Server Error", yn:"y"},

    {code:"3390", msg:"보낸 쪽지함 조회 성공", yn:"y"},
    {code:"3391", msg:"보낸 쪽지함 조회 실패", yn:"y"},
    {code:"3392", msg:"Internal Server Error", yn:"y"},

    {code:"3400", msg:"사용자별 커뮤니티리스트 조회 성공", yn:"y"},
    {code:"3401", msg:"사용자별 커뮤니티리스트 조회 실패", yn:"y"},
    {code:"3402", msg:"Internal Server Error", yn:"y"},

    {code:"3410", msg:"사용자별 커뮤니티리스트 댓글 조회 성공", yn:"y"},
    {code:"3411", msg:"사용자별 커뮤니티리스트 댓글 조회 실패", yn:"y"},
    {code:"3412", msg:"Internal Server Error", yn:"y"},

    {code:"3420", msg:"사용자별 좋아요 누른 커뮤니티 글 조회 성공", yn:"y"},
    {code:"3421", msg:"사용자별 좋아요 누른 커뮤니티 글 조회 성공", yn:"y"},
    {code:"3422", msg:"Internal Server Error", yn:"y"},



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

const getDateStringYYYYMMDDhhmmss = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0'); // 0부터 시작하므로 +1
  const dd = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${yyyy}${mm}${dd}${hours}${minutes}${seconds}`; // e.g., "20250430000000"
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
module.exports.communitySearchPage = communitySearchPage;
module.exports.commentSearchPage = commentSearchPage;
module.exports.subCommentSearchPage = subCommentSearchPage;
module.exports.messageSearchPage = messageSearchPage;

module.exports.bookSavedWordSearchPage = bookSavedWordSearchPage;
module.exports.bookSavedSentenceSearchPage = bookSavedSentenceSearchPage;

module.exports.processTextArray = processTextArray;
module.exports.getDateStringYYYYMMDDhhmmss = getDateStringYYYYMMDDhhmmss
