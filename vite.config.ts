import { defineConfig } from "vite";
import { resolve } from "node:path";

const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isGithubActions = process.env.GITHUB_ACTIONS === "true";

export default defineConfig({
  base: isGithubActions && repoName ? `/${repoName}/` : "/",
  build: {
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.build.html"),
      },
      output: {
        entryFileNames: "assets/index.js",
        chunkFileNames: "assets/chunk-[name].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) {
            return "assets/index.css";
          }
          return "assets/[name][extname]";
        },
      },
    },
  },
  server: {
    port: 5173,
  },
});
