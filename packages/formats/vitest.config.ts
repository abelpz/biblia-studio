import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@biblia-studio/formats",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
