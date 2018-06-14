const requireLogin = require('../middlewares/requireLogin');
const AWS = require('aws-sdk');
const keys = require('../config/keys');
const uuid = require('uuid/v1');

const s3 = new AWS.S3({
  accessKeyId: keys.accessKeyId,
  secretAccessKey: keys.secretAccessKey
});

module.exports = app => {

  app.get('/api/upload', requireLogin, async (req, res) => {
    const key = `${req.user.id}/${uuid()}.jpeg`;
    s3.getSignedUrl('putObject', {
      Bucket: 'fparker-blog-images',
      ContentType: 'image/jpeg',
      Key: key
    }, (err, url) => {
      res.send({key, url});
    });
  });


};