import { describe, expect, it } from "vitest";
import { PROJECT_SCOPE } from "./index";

describe("@biblia-studio/project", () => {
  it("exports package scope", () => {
    expect(PROJECT_SCOPE).toBe("@biblia-studio/project");
  });
});
