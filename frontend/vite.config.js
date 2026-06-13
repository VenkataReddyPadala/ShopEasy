import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // Assures Vite correctly handles relative paths and root fallback routing
  base: "/",

  server: {
    // This replicates the Vercel rewrite behavior during your local testing,
    // ensuring deep links like /resetPassword/:token also work locally.
    historyApiFallback: true,
  },

  build: {
    // If you are using Vite v8+ with Rolldown, use 'rolldownOptions'
    // If you are using Vite v5/v6 with Rollup, change this key name to 'rollupOptions'
    rolldownOptions: {
      output: {
        manualChunks(id) {
          // Identify the massive country-state-city library
          if (id.includes("node_modules/country-state-city")) {
            return "geo-data-vendor";
          }
          // Bundle other standard dependencies cleanly together
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
});
