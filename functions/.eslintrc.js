// module.exports = {
//   env: {
//     es6: true,
//     node: true,
//   },
//   parserOptions: {
//     "ecmaVersion": 2018,
//     requireConfigFile: false, // 避免 Babel 配置错误
//   },
//   extends: [
//     "eslint:recommended",
//     'plugin:vue/vue3-recommended', // 如果使用 Vue 3
//     "google",
//   ],
//   rules: {
//     "no-restricted-globals": ["error", "name", "length"],
//     "prefer-arrow-callback": "error",
//     "quotes": ["error", "double", {"allowTemplateLiterals": true}],
//   },
//   // overrides: [
//   //   {
//   //     files: ["**/*.spec.*"],
//   //     env: {
//   //       mocha: true,
//   //     },
//   //     rules: {},
//   //   },
//   // ],
//   globals: {},
// };
module.exports = {
  env: {
    es6: true,
    node: true,
    browser: true, // 如果是浏览器环境需要添加这一行
  },
  parser: "@babel/eslint-parser", // 使用 Babel 解析器
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module", // 使用 ES 模块
    requireConfigFile: false,
  },
  extends: [
    "eslint:recommended",
    "google",
    "plugin:vue/recommended", // 如果是 Vue.js 项目
  ],
  rules: {
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    "quotes": ["error", "double", {"allowTemplateLiterals": true}],
  },
  overrides: [
    {
      files: ["**/*.spec.*"],
      env: {
        mocha: true,
      },
      rules: {},
    },
  ],
  globals: {},
};
