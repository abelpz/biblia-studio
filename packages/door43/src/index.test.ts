import { describe, expect, it } from "vitest";
import { DOOR43_HOST_DEFAULT } from "./index";

describe("@biblia-studio/door43", () => {
  it("defaults Door43 host", () => {
    expect(DOOR43_HOST_DEFAULT).toBe("git.door43.org");
  });
});
