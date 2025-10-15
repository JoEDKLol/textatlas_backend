const axios = require('axios');
// const fetch = require('node-fetch');
// const cheerio = require('cheerio');
const deepl = require('deepl-node'); // Import the library

// const getDefinitionFromGlosbe = async (word) => {

//   try {
//     // const url = `https://glosbe.com/gapi/translate?from=en&dest=ko&format=json&phrase=${word}`;
//     // const url = `https://glosbe.com/api/translate?from=eng&dest=kor&format=json&pretty=true&phrase=${word}`;
//     const url =  `https://glosbe.com/api/translate?lang=eng&text=${word}&format=json`;
//     const response = await axios.get(url);

//     console.log(response);

//     const results = response.data.tuc;

//     results.forEach((item) => {
//       if (item.meanings) {
//         console.log(`- ${item.meanings.map(m => m.text).join(', ')}`);
//       }
//     });
//   } catch (error) {
//     console.error('Error:', error.message);
//   }
// }

// async function getKoreanTranslationWiki(word) {
//   const url = `https://ko.wiktionary.org/wiki/${encodeURIComponent("love")}`;
//   const definitions = [];

//   try {
//     const { data } = await axios.get(url, {
//       headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Bot/1.0)' }
//     });

//     const $ = cheerio.load(data);

//     // '영어' 섹션 탐색 (h2, h3, h4 포함)
//     const headline = $('span.mw-headline').filter((_, el) =>
//       $(el).text().trim() === '영어'
//     ).first();

//     if (!headline.length) {
//       console.warn('영어 섹션을 찾을 수 없습니다.');
//       return [];
//     }

//     const headingTag = headline.closest('h2, h3, h4');
//     if (!headingTag.length) {
//       console.warn('영어 헤더 태그를 찾을 수 없습니다.');
//       return [];
//     }

//     // 영어 섹션의 다음 요소부터 다음 제목 전까지 파싱
//     const sectionElements = headingTag.nextUntil('h2, h3, h4');
//     sectionElements.each((_, el) => {
//       if ($(el).is('ol')) {
//         $(el).find('li').each((__, li) => {
//           const text = $(li).text().replace(/\[\d+\]/g, '').trim();
//           if (text) definitions.push(text);
//         });
//       }
//     });

//     return definitions;
//   } catch (error) {
//     console.error(`[${word}] 오류:`, error.message);
//     return [];
//   }
// }

// async function getKoreanTranslationlibretranslate(word) {

//   const sentences= "Most plants start as a seed. Plants spread their seeds. This helps them find new places to grow. Here are ways seeds travel. Some seeds are very light. Some are shaped like wings. Seeds like this can travel through the air.";

//   try {
//     const response = await axios.post('http://127.0.0.1:5000/translate', {
//       q: sentences,
//       source: "auto",
//       target: "ko",
//       format: "text",
//       alternatives: 0,
//       api_key: ""
//     }, {
//       headers: {
//         "Content-Type": "application/json"
//       }
//     });

//     console.log(response.data);
//   } catch (error) {
//     console.error('번역 요청 중 오류:', error.message);
//   }
// }

async function getKoreanTranslationDeepl(word) {
  const authKey = process.env.DEEPL_API_KEY;
  const translator = new deepl.Translator(authKey);
  // const sentences= ["test", "PRIDE AND PREJUDICE", '\n\n'];
  const sentences = word

  console.log(word);

  try {
    const result = await translator.translateText(sentences, null, "ko");
    // console.log(result);
    return result;
  } catch (error) {
    return "error"
  }
}

async function getSpanishTranslationDeepl(word) {
  const authKey = process.env.DEEPL_API_KEY;
  const translator = new deepl.Translator(authKey);
  // const sentences= ["test", "PRIDE AND PREJUDICE", '\n\n'];
  const sentences = word


  try {
    const result = await translator.translateText(sentences, null, "es");
    // console.log(result);
    return result;
  } catch (error) {
    return "error"
  }
}

// module.exports.getDefinitionFromGlosbe = getDefinitionFromGlosbe;
// module.exports.getKoreanTranslationWiki = getKoreanTranslationWiki;
// module.exports.getKoreanTranslationlibretranslate = getKoreanTranslationlibretranslate;
module.exports.getKoreanTranslationDeepl = getKoreanTranslationDeepl;
module.exports.getSpanishTranslationDeepl = getSpanishTranslationDeepl;


