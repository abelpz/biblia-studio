import { describe, expect, it } from "vitest";
import { BIBLIA_STUDIO } from "./index";

describe("@biblia-studio/core", () => {
  it("exports workspace constant", () => {
    expect(BIBLIA_STUDIO).toBe("biblia-studio");
  });
});
