const functions = require('firebase-functions');
const { Storage } = require('@google-cloud/storage');
const cors = require('cors')({ origin: true });
const storage = new Storage();

exports.getVideoSignedUrl = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        const bucketName = 'seemeplease-3e926.appspot.com';  // 存储桶名称
        const fileName = req.query.fileName;  // 从请求中获取视频文件名

        try {
            const bucket = storage.bucket(bucketName);
            const file = bucket.file(`video/${fileName}`);  // 指定文件路径在 video 文件夹中

            // 生成签名 URL
            const [url] = await file.getSignedUrl({
                version: 'v4',
                action: 'read',
                expires: Date.now() + 60 * 60 * 1000,  // 1 小时有效期
            });

            res.status(200).send({ url });
        } catch (error) {
            console.error('Error generating signed URL:', error);
            res.status(500).send({ error: 'Failed to generate signed URL', details: error });
        }
    });
});
