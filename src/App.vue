
<template>
  <div id="app">
    <header class="app-header">
      <div class="logo-container">
        <h1 class="company-name">See Me Please</h1>
      </div>
      <nav class="main-nav">
        <router-link to="/" exact>Home</router-link>
      </nav>
      <div class="login-container">
        <router-link to="/login">Login</router-link>
      </div>
    </header>
    <router-view />
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


<style scoped>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  text-align: center;
  background-color: #f8f8f8;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background-color: #f9f7e9;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.logo-container {
  flex: 1;
}

.company-name {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  color: #333;
}

.main-nav {
  flex: 2;
  display: flex;
  justify-content: center;
  gap: 40px;
}

.main-nav a {
  text-decoration: none;
  color: #333;
  font-size: 18px;
}

.main-nav a:hover {
  color: #007BFF;
}

.main-nav a.router-link-exact-active {
  font-weight: bold;
  color: #007BFF;
}

.login-container {
  flex: 1;
  text-align: right;
}

.login-container a {
  text-decoration: none;
  color: #333;
  font-size: 18px;
}

.login-container a:hover {
  color: #007BFF;
}
</style>

