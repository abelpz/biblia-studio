import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@biblia-studio/door43",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
