<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="login-title">Login</h2>
      <form @submit.prevent="login">
        <input type="email" v-model="email" placeholder="Email" class="login-input" required />
        <input type="password" v-model="password" placeholder="Password" class="login-input" required />
        <button type="submit" class="login-button">Login</button>
      </form>
      <!-- 显示登录失败的错误提示 -->
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useRouter } from 'vue-router';

export default {
  data() {
    return {
      email: '',
      password: '',
      errorMessage: ''  // 用于存储错误信息
    };
  },
  setup() {
    const router = useRouter();  // 使用 Vue Router
    return { router };
  },
  methods: {
    async login() {
      try {
        console.log("Attempting to log in with:", this.email, this.password);

        const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);

        console.log("Logged in:", userCredential.user);
        // 登录成功后，重定向到 ThumbnailPage 页面
        this.router.push('/ThumbnailPage');
      } catch (error) {
        console.error("Login failed:", error.message);
        console.error("Error code:", error.code);  // 捕获错误代码
        // 登录失败，显示错误提示信息
        this.errorMessage = "Login failed: " + error.message;
      }
    }
  }
};
</script>

<style scoped>
/* 页面布局与卡片样式 */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* 让卡片居中 */
  background-color: #f8f8f8; /* 背景色 */
}

.login-card {
  width: 400px;
  padding: 30px;
  background-color: #EBE9E8; /* 修改卡片背景色为灰色 */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1); /* 阴影效果 */
  border-radius: 8px; /* 圆角边框 */
}

.login-title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

.login-input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
  font-size: 16px;
}

.login-button {
  width: 100%;
  padding: 10px;
  margin-top: 20px;
  background-color: #008080; /* 修改按钮颜色为绿色 */
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
}

.login-button:hover {
  background-color: #006666; /* 按钮悬停时的颜色 */
}

.error-message {
  color: red;
  text-align: center;
  margin-top: 10px;
}
</style>
