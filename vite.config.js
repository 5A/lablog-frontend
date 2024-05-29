import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import fg from "fast-glob";
import path from "path";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        // dynamically add all html files under ./posts as entry points
        ...Object.fromEntries(
          fg
            .sync(["posts/**/*.html"])
            .map((file) => [
              path.parse(file).name,
              path.resolve(__dirname, file),
            ])
        ),
        // dynamically add all html files under ./pages as entry points
        ...Object.fromEntries(
          fg
            .sync(["pages/**/*.html"])
            .map((file) => [
              path.parse(file).name,
              path.resolve(__dirname, file),
            ])
        ),
        // Add other HTML entry points if needed
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 8080,
    origin: "http://dev.zzi.io:8080",
  },
});
