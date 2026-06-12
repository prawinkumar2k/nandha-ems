import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["."],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },

  },
  build: {
    outDir: "dist/spa",
  },
  ssr: {
    external: [
      "express",
      "mongoose",
      "jsonwebtoken",
      "bcryptjs",
      "socket.io",
      "cors",
      "dotenv",
      "multer",
    ],
  },
  optimizeDeps: {
    exclude: ["lucide-react"], // Speed up analysis for large icon libraries
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve("./client"),
      "@shared": path.resolve("./shared"),
    },
  },
}));


function expressPlugin() {
  return {
    name: "express-plugin",
    apply: "serve",
    async configureServer(server) {
      // Ensure .env is loaded before the server module runs
      const { config } = await import("dotenv");
      config();
      const { createServer, connectDB, setupSocket } = await import("./server/index.js");
      await connectDB();
      const app = createServer();
      server.middlewares.use(app);
      if (server.httpServer) {
        setupSocket(server.httpServer, app);
      }
    },
  };
}
