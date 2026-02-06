const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

const logDir = 'logs'; // 로그 파일이 저장될 폴더명

const { combine, timestamp, printf, colorize } = winston.format;

// 로그 출력 포맷 정의
const logFormat = printf(({ timestamp, level, message, ...meta }) => {
  // meta 객체에 error_id, description 등이 담겨 있습니다.
  // 객체가 비어있지 않으면 문자열로 변환하여 출력
  const metaString = Object.keys(meta).length 
    ? `\n${JSON.stringify(meta, null, 2)}` 
    : '';
    
  return `${timestamp} [${level}]: ${message}${metaString}`;
});

const logger = winston.createLogger({
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // 1. 모든 로그(info 이상)를 파일로 저장
    new winston.transports.DailyRotateFile({
      level: 'info',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir,
      filename: `%DATE%.log`,
      maxFiles: '14d', // 14일치 로그만 보관 (AWS 용량 관리용)
      zippedArchive: true, // 로그 압축 저장
    }),
    // 2. 에러 로그만 별도로 모아서 저장
    new winston.transports.DailyRotateFile({
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir + '/error',
      filename: `%DATE%.error.log`,
      maxFiles: '30d', // 에러 로그는 중요하니까 한 달 보관
      zippedArchive: true,
    }),
  ],
});

// 개발 환경(로컬)일 때는 콘솔에도 출력
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: combine(
      colorize(), // 레벨별 색상 추가
      logFormat
    ),
  }));
}

module.exports = logger;