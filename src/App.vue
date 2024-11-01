<template>
  <div id="app">
    <!-- 顶部导航栏 -->
    <header class="app-header">
      <div class="logo-container">
        <!-- logo -->
        <img src="@/assets/logo2.png" alt="logo" class="logo" />
        <h1 class="company-name">See Me Please</h1>
      </div>
      <nav class="main-nav">
        <!-- 导航链接 -->
        <router-link to="/ThumbnailPage" exact>Home</router-link>
        <div v-if="user">
          <!-- 已登录时显示登出 -->
          <button @click="logout" class="nav-btn">Logout</button>
        </div>
        <div v-else>
          <!-- 未登录时显示登录 -->
          <router-link to="/login" class="nav-btn">Login</router-link>
        </div>
      </nav>
    </header>

    <!-- 渲染当前路由的组件 -->
    <router-view />

    <!-- 底部页脚 -->
    <footer class="app-footer">
      <div class="footer-info">
        <p>Digital Discovery Pty Ltd, Trading as 'See Me Please'</p>
        <p>ABN: 22 668 639 156</p>
        <p>hello@seemeplease.com</p>
      </div>
    </footer>
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
/* 页面基础样式 */
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  text-align: center;
  background-color: #f8f8f8;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;  /* 确保导航栏内部元素垂直居中 */
  padding: 15px 30px;
  background-color: #EBE9E8;  /* 灰色背景 */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.logo-container {
  display: flex;
  align-items: center;  /* 使 logo 和导航项垂直居中 */
  gap: 10px;
}

.main-nav {
  display: flex;
  align-items: center;  /* 垂直居中对齐 */
  justify-content: flex-end;  /* 右对齐 */
  gap: 20px;  /* 添加导航项间距 */
}

.main-nav a, .nav-btn {
  text-decoration: none;
  color: #333;
  font-size: 18px;
  padding: 10px 15px;  /* 调整按钮和链接的 padding，使大小一致 */
  display: inline-block;  /* 确保链接行为像按钮 */
}

.main-nav a.router-link-exact-active {
  background-color: #008080;  /* 激活链接的背景颜色 */
  color: white;
  border-radius: 5px;
}

.nav-btn {
  background: none;
  border: none;
  cursor: pointer;
}

.nav-btn:hover {
  color: #008080;
}

.logo {
  width: 50px;
  height: auto;
}

.company-name {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  color: #333;
}

/* 美化后的底部页脚 */
.app-footer {
  background-color: #EBE9E8; /* 页脚背景色 */
  color: #333;
  padding: 20px 30px;
  display: flex;
  justify-content: center;
  border-top: 1px solid #ccc;
}

.footer-info {
  text-align: center;
}

.footer-info p {
  margin: 5px 0; /* 调整间距 */
  font-size: 14px;
}
</style>
