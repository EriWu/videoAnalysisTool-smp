// 配置路由的文件
import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';
import Login from './components/LoginSMP.vue'; // 引入 Login 组件
import HelloWorld from './components/HelloWorld.vue';
 // 引入 Firebase 服务
// import { auth, db } from './firebase';
import VideoWarehouse from './components/videoWarehouse.vue';  // 引入 VideoWarehouse 组件
import { auth } from './firebaseConfig';
import {onAuthStateChanged} from "firebase/auth";  // 引入 Firebase auth

const routes = [
    { path: '/login', component: Login },// 假设这是首页
    { path: '/home', component: HelloWorld },
    // { path: '/videoWarehouse', component: VideoWarehouse },  // 添加 videoWarehouse 路由
    {
        path: '/videoWarehouse',
        component: VideoWarehouse,
        meta: { requiresAuth: true }  // 标记需要登录访问的路由
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// 添加导航守卫
router.beforeEach((to, from, next) => {
    onAuthStateChanged(auth, (user) => {
        const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

        if (requiresAuth && !user) {
            // 如果需要登录但当前用户未登录，跳转到登录页面
            next('/login');
        } else {
            next();  // 否则允许进入页面
        }
    });
});


const app = createApp(App);
app.use(router);
app.mount('#app');