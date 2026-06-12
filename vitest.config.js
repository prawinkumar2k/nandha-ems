import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.js"],
    include: ["tests/**/*.test.{js,jsx,ts,tsx}", "client/**/*.spec.{js,jsx,ts,tsx}"],
    coverage: {
      reporter: ["text", "html", "json"],
      include: ["server/**/*.js", "client/**/*.js", "client/**/*.jsx", "shared/**/*.js"],
      exclude: ["dist/**", "tmp/**", "node_modules/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve("./client"),
      "@shared": path.resolve("./shared"),
    },
  },
});
