// main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';  // 引入路由文件

const app = createApp(App);
app.use(router);
app.mount('#app');
