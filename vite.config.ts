import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Base relative : le dossier dist/ se déploie tel quel, à la racine ou dans un sous-dossier.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: { chunkSizeWarningLimit: 1600 },
});
