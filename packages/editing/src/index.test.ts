import { describe, expect, it } from "vitest";
import { EDITING_SCOPE } from "./index";

describe("@biblia-studio/editing", () => {
  it("exports package scope", () => {
    expect(EDITING_SCOPE).toBe("@biblia-studio/editing");
  });
});
