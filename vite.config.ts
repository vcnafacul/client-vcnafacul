/// <reference types="vitest" />
import svgr from "@svgr/rollup";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __BUILD_VERSION__: JSON.stringify(Date.now().toString(36)),
  },
  plugins: [
    react(),
    svgr(),
    /*
      ⚠️ PWA **sem cache** (Parte 1 da discussion #57): o SW existe só para o
      site ser instalável e, depois, receber push. `injectionPoint: undefined`
      desliga o precache — com precache, um deploy novo só apareceria no
      segundo carregamento. Offline é a Parte 2.
    */
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      injectRegister: false, // registro manual em `src/pwa/registerSW.ts`
      injectManifest: { injectionPoint: undefined },
      manifest: {
        id: "/",
        name: "Você na Facul",
        short_name: "Você na Facul",
        description: "Plataforma gratuita de preparação para o vestibular",
        lang: "pt-BR",
        start_url: "/?source=pwa",
        scope: "/",
        display: "standalone",
        background_color: "#FFFFFF",
        theme_color: "#0B2747",
        icons: [
          { src: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/pwa/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      devOptions: { enabled: true, type: "module" },
    }),
  ],
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
