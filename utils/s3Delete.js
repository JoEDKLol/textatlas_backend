
const s3 = require('./s3client'); 
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

const deleteS3 = async (file_key) => {
  try {
    
    const input = { // DeleteObjectRequest
      Bucket: process.env.AMPLIFY_BUCKET, // required
      Key: file_key, // required
    };

    const command = new DeleteObjectCommand(input);
    const response = await s3.send(command);
    return true;

  } catch (error) {
    return false;
  }
};


module.exports = deleteS3;