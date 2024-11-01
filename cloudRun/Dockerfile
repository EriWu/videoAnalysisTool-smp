# 使用官方 Node.js 镜像
FROM node:18

# 设置工作目录
WORKDIR /usr/src/app

# 复制 package.json 并安装依赖
COPY package*.json ./
RUN npm install

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 8080

# 启动应用
CMD ["npm", "start"]
