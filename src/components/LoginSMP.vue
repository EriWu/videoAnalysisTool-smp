<template>
  <div>
    <h2>Login</h2>
    <form @submit.prevent="login">
      <input type="email" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
    <!-- 显示登录失败的错误提示 -->
    <p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>
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
        // 登录成功后，重定向到 videoWarehouse 页面
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

</style>