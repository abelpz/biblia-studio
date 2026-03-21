import { describe, expect, it } from "vitest";
import { TRANSLATION_SCOPE } from "./index";

describe("@biblia-studio/translation", () => {
  it("exports package scope", () => {
    expect(TRANSLATION_SCOPE).toBe("@biblia-studio/translation");
  });
});
