const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const s3 = require('./s3client'); 

const uploadS3 = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AMPLIFY_BUCKET,
        key: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `uploads/${uniqueSuffix}${path.extname(file.originalname)}`); // S3에 저장될 파일 경로와 이름
        },
        contentType: multerS3.AUTO_CONTENT_TYPE,
    }),
});

module.exports = uploadS3;