const functions = require('firebase-functions');
const { Storage } = require('@google-cloud/storage');
const cors = require('cors')({ origin: true }); // 引入 cors 模块
const storage = new Storage();

exports.getThumbnailSignedUrl = functions.https.onRequest((req, res) => {
    cors(req, res, async () => { // 使用 cors 处理跨域
        const bucketName = 'seemeplease-3e926.appspot.com'; // 替换为你的存储桶名称
        const fileName = req.query.fileName; // 从请求中获取文件名

        try {
            const bucket = storage.bucket(bucketName);
            const file = bucket.file(`thumbnails/${fileName}`);

            // 生成签名 URL
            const [url] = await file.getSignedUrl({
                version: 'v4',
                action: 'read',
                expires: Date.now() + 60 * 60 * 1000, // 1 小时过期
            });

            res.status(200).send({ url });
        } catch (error) {
            console.error('Error generating signed URL:', error);
            res.status(500).send({ error: 'Failed to generate signed URL', details: error });
        }
    });
});
