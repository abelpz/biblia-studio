import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchDoor43Version } from "./version.js";

describe("fetchDoor43Version", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests /api/v1/version on the default host and returns version", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ version: "1.21.0" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchDoor43Version();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://git.door43.org/api/v1/version",
    );
    expect(result).toEqual({ version: "1.21.0" });
  });

  it("uses a custom host when provided", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ version: "9.9.9" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await fetchDoor43Version({ host: "example.org" });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.org/api/v1/version",
    );
  });

  it("throws when response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: "Service Unavailable",
      }),
    );

    await expect(fetchDoor43Version()).rejects.toThrow(
      "Door43 API 503: Service Unavailable",
    );
  });

  it("throws when version is missing from JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      }),
    );

    await expect(fetchDoor43Version()).rejects.toThrow(
      "Invalid Door43 version response",
    );
  });
});
