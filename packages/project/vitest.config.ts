import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@biblia-studio/project",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
