import { describe, expect, it } from "vitest";
import { STUDY_SCOPE } from "./index";

describe("@biblia-studio/study", () => {
  it("exports package scope", () => {
    expect(STUDY_SCOPE).toBe("@biblia-studio/study");
  });
});
