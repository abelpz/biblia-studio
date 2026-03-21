import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@biblia-studio/study",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
