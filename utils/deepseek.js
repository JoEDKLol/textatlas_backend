const axios = require('axios');
const OpenAI = require('openai');

// DeepSeek API 키 (환경 변수로 관리 권장)
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';




/**
 * 영문 기사를 한국어로 요약 및 번역하는 함수
 * @param {string} englishText - 영문 기사 텍스트
 * @param {string} model - 사용할 모델 (ex: "deepseek-r1", "deepseek-v3")
 * @returns {Promise<string>} - 한국어로 번역된 요약문
 */

async function summarizeAndTranslate(englishText, model = 'deepseek-chat') {
    console.log(model);
    try {
        const response = await axios.post(
            DEEPSEEK_API_URL,
            {
                model: "deepseek-chat",
                messages: [
                    {
                        role: 'user',
                        content: `Summarize the following English article in Korean in 3 sentences:\n\n${englishText}`
                    }
                ],
                temperature: 0.3,
                max_tokens: 100,
            },
            {
                headers: { 
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('DeepSeek API Error:', error.response?.data || error.message);
        throw new Error('Failed to summarize and translate');
    }
}

async function summarizeAndTranslateRe(englishText, model = 'deepseek-reasoner') {
  const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY,
  }); 

  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: "You are a helpful assistant." }],
    model: "deepseek-chat",
  });

  console.log(completion.choices[0].message.content);
}


module.exports.summarizeAndTranslate = summarizeAndTranslate;
module.exports.summarizeAndTranslateRe = summarizeAndTranslateRe;