// src/router.js
import { createRouter, createWebHistory } from 'vue-router';
import Login from './components/LoginSMP.vue'; // 引入 Login 组件
import ThumbnailPage from './components/ThumbnailPage.vue';  // 引入缩略图页面
import VideoDetailPage from './components/VideoDetailPage.vue';  // 引入视频详情页面
import { auth } from './firebaseConfig';  // 引入 Firebase auth
import { onAuthStateChanged } from "firebase/auth";  // 引入 Firebase auth

// 定义路由
const routes = [
    { path: '/login', component: Login },
    { path: '/', component: Login },
    { path: '/home', component: Login },
    { path: '/ThumbnailPage', component: ThumbnailPage },
    {
        path: '/video-detail/:id/:name',  // 修改此处，定义 id 和 name 参数
        name: 'VideoDetail',  // 为此路由添加一个 name 属性
        component: VideoDetailPage,
        meta: { requiresAuth: true }
    },
];

// 创建路由实例
const router = createRouter({
    history: createWebHistory(),
    routes,
});

// 添加导航守卫
router.beforeEach((to, from, next) => {
    onAuthStateChanged(auth, (user) => {
        const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

        if (requiresAuth && !user) {
            next('/login');  // 如果需要登录但用户未登录，跳转到登录页面
        } else {
            next();  // 否则允许进入页面
        }
    });
});

export default router;
