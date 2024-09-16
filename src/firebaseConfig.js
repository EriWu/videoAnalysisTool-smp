// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA6f-DMSrE6QHJtbcZft74EWA8k4_Aisho",
    authDomain: "seemeplease-3e926.firebaseapp.com",
    projectId: "seemeplease-3e926",
    storageBucket: "seemeplease-3e926.appspot.com",
    messagingSenderId: "459778433750",
    appId: "1:459778433750:web:346587f4733fe04ae29f77"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize services
const auth = getAuth(app);

const db = getFirestore(app);

export { auth, db };
/*

1. const app = initializeApp(firebaseConfig);
功能：这一行代码用于初始化你的 Firebase 应用。
参数：firebaseConfig 是一个对象，包含了 Firebase 应用的配置信息（如 apiKey、authDomain、projectId 等）。这些信息通常从 Firebase 控制台中获取。
返回值：initializeApp() 返回一个 Firebase 应用实例，保存在常量 app 中。
作用：通过这行代码，Firebase 的服务被连接到了你的应用，之后你可以基于这个 app 实例调用其他 Firebase 服务。
2. const auth = getAuth(app);
功能：这一行代码初始化 Firebase Authentication（身份验证服务）。

参数：app 是前一行创建的 Firebase 应用实例，它告诉 Firebase Authentication 服务这个应用的上下文。

返回值：getAuth() 返回一个 auth 对象，保存在常量 auth 中。

作用：这个 auth 对象用于处理用户的身份验证操作，比如用户登录、注册、登出等。
3. const db = getFirestore(app);
功能：这一行代码初始化 Firebase Firestore（云数据库服务）。

参数：同样，app 是前面创建的 Firebase 应用实例，告诉 Firestore 使用这个应用的配置。

返回值：getFirestore() 返回一个 db 对象，保存在常量 db 中。

作用：db 对象用于与 Firebase Firestore 交互，执行数据库相关的操作，比如添加文档、查询文档、更新数据等。*/
