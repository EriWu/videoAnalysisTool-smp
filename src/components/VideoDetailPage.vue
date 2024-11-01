<template>
  <div>
    <h1>{{ videoName }}</h1>
    <video
      ref="videoPlayer"
      controls
      :src="videoUrl"
      width="600"
      @timeupdate="updateCurrentTime"
    ></video>

    <h2>Analysis Results</h2>
    <div v-if="Object.keys(textAnnotations).length === 0">
      No analysis results found.
    </div>
    <div v-else>
      <!-- 遍历 textAnnotations -->
      <div
        v-for="(segments, key) in textAnnotations"
        :key="key"
        class="annotation-item"
      >
        <div class="annotation-row">
          <!-- 显示字段名称 -->
          <p class="label"><strong>{{ key }}:</strong></p>

          <!-- 创建时间轴 -->
          <div class="timeline">
            <!-- 遍历时间段 -->
            <div
              class="time-segment"
              v-for="(segment, index) in segments"
              :key="index"
              :style="{
                left: `${(segment.startTime / videoDuration) * 100}%`,
                width: `${((segment.endTime - segment.startTime) / videoDuration) * 100}%`
              }"
              @click="seekTo(segment.startTime)"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from "../firebaseConfig"; // 正确导入 Firestore
import { doc, getDoc } from "firebase/firestore"; // 引入需要的 Firestore 方法

export default {
  data() {
    return {
      analysisId: "", // 从路由参数获取的 analysisId
      videoUrl: "", // 视频的签名 URL
      videoName: "", // 视频名称
      textAnnotations: [], // 分析结果
      videoDuration: 0, // 视频时长
      initialLoadComplete: false, // 用于标记是否初始加载完成
    };
  },
  async created() {
    console.log("Component created");
    // 从路由参数中获取 analysisId 和 videoName
    this.analysisId = this.$route.params.id;
    this.videoName = this.$route.params.name;
    console.log("Analysis ID:", this.analysisId);

    // 根据 analysisId 获取 Firestore 中的文档
    try {
      const docRef = doc(db, "videoAnalysisResults", this.analysisId); // 指定文档
      console.log("Doc ref created:", docRef); // 检查文档引用
      const analysisDoc = await getDoc(docRef); // 获取文档

      if (analysisDoc.exists()) {
        this.textAnnotations = analysisDoc.data().textAnnotations;
        console.log(this.textAnnotations);

        // 设置视频的时长
        this.videoDuration = 300; // 可以设置一个默认时长或者通过签名URL获取时长
        this.initialLoadComplete = true;
      } else {
        console.error("No such document!");
      }
    } catch (error) {
      console.error("Error fetching document:", error);
    }

    // 调用 Cloud Function 获取视频签名 URL
    try {
      const response = await fetch(
        `https://us-central1-seemeplease-3e926.cloudfunctions.net/getVideoSignedUrl?fileName=${this.videoName}`
      );
      const data = await response.json();

      if (response.ok) {
        this.videoUrl = data.url; // 使用云函数返回的签名 URL
      } else {
        console.error("Failed to get signed URL:", data.error);
      }
    } catch (error) {
      console.error("Error fetching video signed URL:", error);
    }
  },
  methods: {
    // 更新当前播放时间
    updateCurrentTime(event) {
      this.videoDuration = event.target.duration;
    },
    // 跳转到视频指定时间，并滚动到播放器
    seekTo(time) {
      const videoPlayer = this.$refs.videoPlayer;
      videoPlayer.currentTime = time;
      videoPlayer.play();
      window.scrollTo(0, 0); // 滚动到页面顶部，使视频可见
    }
  }
};
</script>

<style scoped>
/* 样式 */
.annotation-item {
  margin-bottom: 20px;
  max-width: 100%; /* 限制整个项目的最大宽度 */
}

.annotation-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  max-width: 100%; /* 确保整个行不会超出屏幕宽度 */
}

.timeline {
  position: relative;
  width: 100%; /* 确保进度条宽度为容器的100% */
  max-width: 100%; /* 限制最大宽度 */
  height: 20px;
  background-color: #f0f0f0; /* 背景条颜色 */
  margin-left: 10px;
  overflow: hidden; /* 防止进度条溢出 */
}

.time-segment {
  position: absolute;
  height: 100%;
  background-color: red; /* 时间段颜色 */
  cursor: pointer;
}

/* 字段名称样式 */
.label {
  width: 150px; /* 字段名称的固定宽度 */
  margin-right: 10px;
  text-align: right; /* 右对齐 */
}
</style>
