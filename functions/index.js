/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const videoIntelligence = require('@google-cloud/video-intelligence').v1;
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const os = require('os');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const fetch = require('node-fetch'); // 如果需要从 URL 获取数据

admin.initializeApp();
const db = admin.firestore();
const storage = new Storage();

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.analyzeVideo = functions.storage.object().onFinalize(async (object) => {
    const filePath = object.name;
    const bucketName = object.bucket;
    const fileName = path.basename(filePath);

    // 检查是否是视频文件
    if (!filePath.startsWith('videos/')) {
        console.log('Not a video file.');
        return;
    }

    // 生成签名 URL
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);
    const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 1000 * 60 * 5, // 5 minutes
    });

    // 只下载视频的前几秒
    const response = await fetch(url, {
        headers: {
            'Range': 'bytes=0-1000000' // 只下载前1MB数据
        }
    });
    const arrayBuffer = await response.arrayBuffer();
    const tempFilePath = path.join(os.tmpdir(), fileName);
    fs.writeFileSync(tempFilePath, Buffer.from(arrayBuffer));

    // 使用 ffmpeg 生成缩略图
    const thumbnailFilePath = path.join(os.tmpdir(), `thumb-${fileName}.jpg`);
    await generateThumbnail(tempFilePath, thumbnailFilePath);

    // 上传缩略图到 Cloud Storage
    const thumbFileName = `thumbnails/thumb-${fileName}.jpg`;
    await bucket.upload(thumbnailFilePath, {
        destination: thumbFileName,
    });
    const thumbUrl = `https://storage.googleapis.com/${bucketName}/${thumbFileName}`;

    // 存储视频信息到 Firestore
    await db.collection('videos').doc(fileName).set({
        name: fileName,
        uploadTime: object.timeCreated,
        thumbnailUrl: thumbUrl,
    });

    // 继续执行视频分析...
    // 视频分析
    try {
        const videoClient = new videoIntelligence.VideoIntelligenceServiceClient();
        const gcsUri = `gs://${bucketName}/${filePath}`;
        const request = {
            inputUri: gcsUri,
            features: ['TEXT_DETECTION']
        };

        const [operation] = await videoClient.annotateVideo(request);
        console.log('Waiting for operation to complete...');
        const [operationResult] = await operation.promise();

        const textAnnotations = operationResult.annotationResults[0].textAnnotations;

        textAnnotations.forEach((textAnnotation) => {
            textAnnotation.segments.forEach((segment) => {
                const startTime = segment.segment.startTimeOffset.seconds || 0;
                const endTime = segment.segment.endTimeOffset.seconds || 0;
                const text = textAnnotation.text;

                // 将分析结果存入 Firestore
                db.collection('videoAnalysisResults').add({
                    text: text,
                    startTime: startTime,
                    endTime: endTime,
                    filePath: filePath
                });
                console.log(`Detected key text '${text}' from ${startTime}s to ${endTime}s`);
            });
        });
    } catch (error) {
        console.error('Error analyzing video:', error);
    }
});


// 使用 ffmpeg 生成缩略图的辅助函数
function generateThumbnail(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .screenshots({
                timestamps: ['50%'],
                filename: path.basename(outputPath),
                folder: path.dirname(outputPath),
                size: '320x240'
            })
            .on('end', resolve)
            .on('error', reject);
    });
}

