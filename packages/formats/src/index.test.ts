import { describe, expect, it } from "vitest";
import { BIBLIA_STUDIO } from "./index";

describe("@biblia-studio/formats", () => {
  it("re-exports core constant", () => {
    expect(BIBLIA_STUDIO).toBe("biblia-studio");
  });
});
