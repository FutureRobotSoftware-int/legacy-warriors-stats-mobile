import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    proxy: {
      "/videos": {
        target: "http://34.111.120.224",
        changeOrigin: true,
      },
      "/shotdata": {
        target: "http://34.111.120.224",
        changeOrigin: true,
      },
    },
  },
});
