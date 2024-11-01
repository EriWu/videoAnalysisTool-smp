const express = require('express');
const admin = require('firebase-admin');
const { VideoIntelligenceServiceClient } = require('@google-cloud/video-intelligence');
const path = require('path');

admin.initializeApp();
const db = admin.firestore();
const videoClient = new VideoIntelligenceServiceClient();


const app = express();
app.use(express.json());

app.post('/process-video', async (req, res) => {
    const { filePath, bucketName } = req.body;
    console.log(`Processing video: ${filePath} in bucket: ${bucketName}`);
    try {
        const gcsUri = `gs://${bucketName}/${filePath}`;
        const request = {
            inputUri: gcsUri,
            features: ['TEXT_DETECTION']
        };

        const [operation] = await videoClient.annotateVideo(request);
        console.log('Video analysis started.');

        // 在 Firestore 中记录分析状态
        // await db.collection('videoAnalysisResults').add({
        //     filePath: filePath,
        //     status: 'PENDING'
        // });

        // 等待操作完成
        const [operationResult] = await operation.promise();

        const textAnnotations = operationResult.annotationResults[0].textAnnotations;
        const combinedResultsMap = {};

        textAnnotations.forEach((textAnnotation) => {
            const detectedText = textAnnotation.text;
            if (!combinedResultsMap[detectedText]) {
                combinedResultsMap[detectedText] = [];
            }
            textAnnotation.segments.forEach((segment) => {
                // 确保 startTime 和 endTime 是 JavaScript 原生的 Number 类型
                const startTime = (segment.segment.startTimeOffset.seconds || 0) + (segment.segment.startTimeOffset.nanos || 0) / 1e9;
                const endTime = (segment.segment.endTimeOffset.seconds || 0) + (segment.segment.endTimeOffset.nanos || 0) / 1e9;
                const segments = combinedResultsMap[detectedText];
                if (segments.length > 0) {
                    const lastSegment = segments[segments.length - 1];
                    if (Math.abs(lastSegment.endTime - startTime) < 1.0) {
                        lastSegment.endTime = endTime;
                    } else {
                        segments.push({ startTime, endTime });
                    }
                } else {
                    segments.push({ startTime, endTime });
                }
            });
        });
        const fileName = path.basename(filePath);
        // 在分析结果完成后存储分析结果
        const analysisDocRef = db.collection('videoAnalysisResults').doc(fileName + '_analysis');
        await analysisDocRef.set({
            filePath: filePath,
            textAnnotations: combinedResultsMap
        });

        // 更新 video 集合中的分析状态
        await db.collection('video').doc(fileName).update({
            analysisStatus: 'COMPLETED',
            analysisId: analysisDocRef.id
        });

        res.status(200).send('Video analysis completed.');
    } catch (error) {
        console.error('Error analyzing video:', error);
        res.status(500).send('Error processing video.');
    }
});

app.listen(8080, () => {
    console.log('Cloud Run server started on port 8080');
});
