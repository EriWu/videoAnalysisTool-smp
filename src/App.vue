


<template>
  <div id="app">
    <nav>
      <router-link to="/login">Login</router-link>
      <router-link to="/home">Home</router-link>

    </nav>
    <div v-if="user">
      <p>Welcome, {{ user.email }}</p>
      <button @click="logout">Logout</button>
    </div>
    <router-view/>
  </div>
</template>

<script>
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebaseConfig";


export default {
  data() {
    return {
      user: null,  // 用于存储当前登录用户
    };
  },
  created() {
    // 监听用户登录状态
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.user = user;  // 如果有用户登录，将用户信息存储在数据中
      } else {
        this.user = null;  // 如果用户登出，清除用户信息
      }
    });
  },
  methods: {
    async logout() {
      try {
        await signOut(auth);  // 调用 Firebase 的 signOut 方法退出
        this.user = null;     // 清除用户信息
        this.$router.push('/login');  // 退出后重定向到登录页面
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }
  }
};
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
