import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@biblia-studio/publishing",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
