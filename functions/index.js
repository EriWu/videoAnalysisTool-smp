const functions = require('firebase-functions');
const admin = require('firebase-admin');
const videoIntelligence = require('@google-cloud/video-intelligence').v1;
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const os = require('os');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const ffprobeInstaller = require('@ffprobe-installer/ffprobe');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const frontendthumbnailFunctions = require('./frontendthumbnailFunctions');
const frontendVideoGet = require("./frontendVideoGet");
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

admin.initializeApp();
const db = admin.firestore();
const storage = new Storage();

//使用 functions.storage.object().onFinalize() 创建一个 Cloud Function，该函数会在 Cloud Storage 中有新文件上传并完成时触发。
// 这意味着每次有文件上传到指定的存储桶并写入成功后，这个函数都会被调用。
exports.handleVideoUpload  = functions.storage.object().onFinalize(async (object) => {
    const filePath = object.name; // 获取文件路径
    const bucketName = object.bucket; // 获取存储桶名称
    const fileName = path.basename(filePath); // 获取文件名

    // 这段代码用于过滤上传到 Cloud Storage 中的文件，以确保只有存储在特定目录（在本例中是 video/ 目录）中的文件会被处理。
    if (!filePath.startsWith('video/')) {
        console.log('Not in video router.');
        return;
    }

    // 检查文件是否是视频文件
    if (!object.contentType.startsWith('video/')) {
        console.log('Not a video file.');
        return;
    }

    //生成签名URL的原因：：Cloud Storage 中的文件通常是受保护的，默认情况下需要进行身份验证才能访问。生成签名 URL 可以在不提供身份验证的情况下，安全地授予对文件的临时访问权限。
    // 获取存储桶和文件对象
    console.log('making url');
    const bucket = storage.bucket(bucketName); //获取存储桶的引用
    const file = bucket.file(filePath); //获取存储桶中目标文件的引用
    // 生成签名 URL,签名 URL 是一个带有临时授权的链接，可以在一定时间内用于访问文件。
    const [url] = await file.getSignedUrl({
        action: 'read', // 允许执行 'read' 操作，即读取文件
        expires: Date.now() + 1000 * 60 * 5, // 设置 URL 的过期时间为 5 分钟（当前时间 + 5 分钟）
    });

    // 只下载视频的前几秒
    /*    headers：定义请求头，这里设置了一个 Range 头，用于指定下载文件的部分内容。
    'Range': 'bytes=0-1000000'：这是 HTTP 的 Range 头，它告诉服务器只返回文件的前 1MB 数据（即从字节 0 到 1000000）。这样做的目的是避免下载整个文件，只下载部分内容，比如为了生成缩略图或预览片段。
    await：由于 fetch 是异步操作，await 用于等待请求完成并返回响应。*/
    //fetch(url, {...})：使用 fetch 函数发送 HTTP 请求来下载文件。url 是之前生成的签名 URL，允许临时访问 Google Cloud Storage 中的文件。只下载前10MB数据
    console.log('await fetch');
    const response = await fetch(url, {
        headers: {
            'Range': 'bytes=0-10000000'
        }
    });
    console.log('have make url');

    const arrayBuffer = await response.arrayBuffer();
    const tempFilePath = path.join(os.tmpdir(), fileName);
    //os.tmpdir()：获取操作系统的临时文件目录，通常用于存放临时文件。
    // 使用 Node.js 的文件系统模块 (fs) 同步地将 Buffer 数据写入到 tempFilePath 指定的文件中。因为这是同步操作，在数据写入完成之前，程序会暂停在这一行。
    console.log('storing the thumnail in tempFilePath ');

    fs.writeFileSync(tempFilePath, Buffer.from(arrayBuffer));

    // 生成缩略图
    const thumbnailFilePath = path.join(os.tmpdir(), `thumb-${fileName}.jpg`);
    await generateThumbnailFromScene(tempFilePath, thumbnailFilePath, 5); // 5秒

    // 上传缩略图到 Cloud Storage
    const thumbFileName = `thumbnails/thumb-${fileName}.jpg`;
    await bucket.upload(thumbnailFilePath, {
        destination: thumbFileName,
    });
    //构造缩略图文件的公开 URL，以便将其存储到 Firestore 或用于前端展示。
    // const thumbUrl = `https://storage.googleapis.com/${bucketName}/${thumbFileName}`;
    const thumbUrl = `thumb-${fileName}.jpg`;
    // 将视频的相关信息（包括生成的缩略图 URL）存储到 Firestore 数据库中。
    await db.collection('video').doc(fileName).set({ //db.collection('video')：选择或创建一个名为 video 的集合。
        name: fileName,
        uploadTime: object.timeCreated,
        thumbnailUrl: thumbUrl,
        filePath: filePath,
        analysisStatus: 'PENDING'
    });
    // 调用 Cloud Run 进行视频分析
    await fetch('https://video-analysis-459778433750.australia-southeast1.run.app/process-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            filePath: filePath,
            bucketName: bucketName
        })
    });
    console.log('Video processing request sent to Cloud Run');
});

// 导出新云函数
exports.getThumbnailSignedUrl = frontendthumbnailFunctions.getThumbnailSignedUrl;
exports.getVideoSignedUrl = frontendVideoGet.getVideoSignedUrl;

function generateThumbnailFromScene(inputPath, outputPath, timestamp) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .seekInput(timestamp)
            .frames(1) // 仅提取一帧
            .output(outputPath)
            .on('end', resolve)
            .on('error', reject)
            .run();
    });
}

//禁用了eslintrc firebase.json "npm --prefix \"$RESOURCE_DIR\" run lint"