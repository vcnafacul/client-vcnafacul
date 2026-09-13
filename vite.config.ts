/// <reference types="vitest" />
import svgr from "@svgr/rollup";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __BUILD_VERSION__: JSON.stringify(Date.now().toString(36)),
  },
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "pdfmake/build/pdfmake": "pdfmake/build/pdfmake.js",
      "pdfmake/build/vfs_fonts": "pdfmake/build/vfs_fonts.js",
    },
  },
  assetsInclude: ["**/*.svg"],
  optimizeDeps: {
    include: ["pdfmake/build/pdfmake", "pdfmake/build/vfs_fonts"],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    // ⚠️ Ver o docblock no fim de `components/dashV2/DashToolbar.test.tsx`.
    // Aquele arquivo leva ~50s e satura um core; no runner de 2 vCPU do CI o
    // processo principal deixava de ser escalonado e o RPC do vitest estourava
    // com `Timeout calling "onTaskUpdate"` — pipeline vermelha com TODOS os
    // testes verdes. Fork único e em série tira a contenção. É contorno.
    pool: "forks",
    poolOptions: { forks: { singleFork: true } },
    fileParallelism: false,
    teardownTimeout: 30000,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          gsap: ["gsap", "@gsap/react"],
          motion: ["motion"],
        },
      },
    },
  },
});
