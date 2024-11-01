<template>
  <div class="video-grid">
    <div v-for="video in videos" :key="video.name" class="video-card">
      <img :src="video.thumbnailDownloadUrl" alt="video.name" class="thumbnail" />
      <p class="title">{{ video.name || 'Title' }}</p>
      <div class="status-and-button">
        <span :class="video.analysisStatus === 'PENDING' ? 'pending' : 'complete'">
          {{ video.analysisStatus === 'PENDING' ? 'Pending...' : 'Complete' }}
        </span>
        <button @click="handleClick(video)" class="analyze-button">Video Analyze</button>
      </div>
    </div>

    <!-- 弹窗提示 -->
    <div v-if="showPopup" class="popup">
      <p>Uploading, please wait...</p>
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
      error: false,
      showPopup: false // 控制弹窗显示
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
    handleClick(video) {
      if (video.analysisStatus === 'PENDING') {
        // 如果状态是 PENDING，显示弹窗
        this.showPopup = true;
        setTimeout(() => {
          this.showPopup = false; // 弹窗显示一段时间后消失
        }, 3000); // 显示弹窗3秒
      } else {
        // 状态为 COMPLETE，跳转到详情页
        this.goToDetail(video.analysisId, video.name);
      }
    },
    goToDetail(analysisId, videoName) {
      console.log("Navigating to VideoDetail:", analysisId, videoName);
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

<style scoped>
.video-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 20px;
}

.video-card {
  background-color: #EBE9E8; /* 修改卡片背景色为灰色 */
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
  background-color: #B22222; /* 深红色按钮 */
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}

.analyze-button:hover {
  background-color: #8B0000; /* 悬停时更深的红色 */
}

.popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}
</style>
