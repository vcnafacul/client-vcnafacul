import svgr from "@svgr/rollup";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
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
});
