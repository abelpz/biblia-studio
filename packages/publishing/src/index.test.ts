import { describe, expect, it } from "vitest";
import { PUBLISHING_SCOPE } from "./index";

describe("@biblia-studio/publishing", () => {
  it("exports package scope", () => {
    expect(PUBLISHING_SCOPE).toBe("@biblia-studio/publishing");
  });
});
