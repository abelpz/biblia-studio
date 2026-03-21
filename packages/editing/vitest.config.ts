import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@biblia-studio/editing",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
