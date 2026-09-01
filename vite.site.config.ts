import { defineConfig } from "vite";
import { execFileSync } from "node:child_process";

process.env.VITE_BUILD_ID ??= process.env.GITHUB_SHA?.slice(0, 7) || execFileSync("git", ["rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim();
process.env.VITE_APP_VERSION ??= "0.1.8";

export default defineConfig({
  root: "site",
  publicDir: "../public",
  server: { port: 4173, strictPort: true },
  build: {
    outDir: "../dist/site",
    emptyOutDir: true,
    target: "es2022",
    rollupOptions: {
      input: {
        index: "site/index.html",
        demo: "site/demo/index.html",
        privacy: "site/privacy/index.html",
        terms: "site/terms/index.html",
        notFound: "site/404.html"
      }
    }
  }
});
