import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  preview: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
    // Nginx reenvía el dominio público; sin esto Vite responde 403.
    allowedHosts: ["opsai.reliability.space", "localhost", "127.0.0.1"],
  },
});
