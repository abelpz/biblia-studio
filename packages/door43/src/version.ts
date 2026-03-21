import { DOOR43_HOST_DEFAULT } from "./constants.js";

export type Door43VersionResponse = {
  version: string;
};

/**
 * Calls the public Gitea endpoint `GET /api/v1/version` (no auth).
 * @see https://git.door43.org/api/swagger
 */
export async function fetchDoor43Version(options?: {
  host?: string;
}): Promise<Door43VersionResponse> {
  const host = options?.host ?? DOOR43_HOST_DEFAULT;
  const url = `https://${host}/api/v1/version`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Door43 API ${res.status}: ${res.statusText}`);
  }
  const data = (await res.json()) as { version?: unknown };
  if (typeof data.version !== "string") {
    throw new Error("Invalid Door43 version response: missing version string");
  }
  return { version: data.version };
}
