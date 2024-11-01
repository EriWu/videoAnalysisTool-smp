

<template>
  <div class="video-grid">
    <div v-for="video in videos" :key="video.name" class="video-card">
      <img :src="video.thumbnailDownloadUrl" alt="video.name" class="thumbnail" />
      <p class="title">{{ video.name || 'Title' }}</p>
      <div class="status-and-button">
        <span :class="video.analysisStatus === 'PENDING' ? 'pending' : 'complete'">
          {{ video.analysisStatus === 'PENDING' ? 'Pending...' : 'Complete' }}
        </span>
        <button @click="goToDetail(video.analysisId, video.name)" class="analyze-button">Video Analyze</button>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from "@/firebaseConfig"; // 引入 Firebase 配置
import { getDocs, collection } from 'firebase/firestore'; // Firestore 的函数

export default {
  data() {
    return {
      videos: [], // 存储视频数据，包括缩略图的下载链接
      loading: true,
      error: false
    };
  },
  methods: {
    async fetchVideos() {
      console.log("Fetching videos...");
      try {
        const videosSnapshot = await getDocs(collection(db, "video")); // 从 Firestore 中获取视频集合

        const videos = [];

        // 遍历每个视频数据
        for (const doc of videosSnapshot.docs) {
          const videoData = doc.data();
          console.log("Video data:", videoData);

          // 调用 Firebase Function 获取签名 URL
          const response = await fetch(
              `https://us-central1-seemeplease-3e926.cloudfunctions.net/getThumbnailSignedUrl?fileName=${videoData.thumbnailUrl}`
          );
          const data = await response.json();

          if (response.ok) {
            // 将签名 URL 添加到视频数据中
            videos.push({
              ...videoData,
              thumbnailDownloadUrl: data.url // 使用云函数返回的签名 URL
            });
          } else {
            throw new Error(data.error);
          }
        }

        this.videos = videos; // 将视频数据设置为组件的数据
        console.log("Fetched videos:", this.videos);
      } catch (error) {
        console.error("Error fetching videos: ", error);
        this.error = true;
      } finally {
        this.loading = false; // 加载完成后设置为 false
      }
    },
    goToDetail(analysisId, videoName) {
      this.$router.push({
        name: 'VideoDetail',
        params: {
          id: analysisId,
          name: videoName
        }
      });
    }

  },
  created() {
    this.fetchVideos(); // 组件创建时获取视频数据
  }
};
</script>

<!--

<style>
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.video-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 8px;
  text-align: center;
}

.thumbnail {
  width: 100%;
  height: auto;
  border-radius: 4px;
}

.status-and-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.analyze-button {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
}

.analyze-button:hover {
  background-color: #0056b3;
}

.pending {
  color: orange;
}

.complete {
  color: green;
}
</style>

-->


<style scoped>
.video-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 20px;
}

.video-card {
  background-color: #f9f7e9;
  border-radius: 10px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.thumbnail {
  width: 100%;
  height: auto;
}

.title {
  margin-top: 10px;
  font-size: 16px;
}

.status-and-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.pending {
  color: orange;
}

.complete {
  color: green;
}

.analyze-button {
  background-color: red;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}

.analyze-button:hover {
  background-color: darkred;
}
</style> -->
