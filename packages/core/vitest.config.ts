import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@biblia-studio/core",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
