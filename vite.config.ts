import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@popup": "/src/services/popup",
      "@api": "/src/services/api",
      "@storage": "/src/services/storage",
      "@services": "/src/services",
      "@components": "/src/components",
      "@views": "/src/views",
      "@i18n": "/src/i18n",
    },
  },
  server: {
    host: "0.0.0.0",
    proxy: {
      // 代理/aliyun-oss
      "/static": {
        target: "https://physics-static-cn.turtlesim.com",
        changeOrigin: true,
        rewrite: (path) => {
          return path.replace("/static", "");
        },
        headers: {
          Referer: "https://www.turtlesim.com/",
        },
        secure: false, // 关闭 TLS 验证
      },
      "/api": {
        target: "https://physics-api-cn.turtlesim.com",
        changeOrigin: true,
        rewrite: (path) => {
          console.log(path.replace("/api", ""));
          return path.replace("/api", "");
        },
        headers: {
          Referer: "https://www.turtlesim.com/",
        },
      },
    },
  },
});
