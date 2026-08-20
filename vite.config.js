import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Poll the filesystem so edits made outside the editor (e.g. via a
    // mounted folder) are picked up and hot-reloaded like normal saves.
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
});
