import { UsfmParseError } from "./errors.js";

export type UsfmToken = {
  /** Lowercase marker name (e.g. `v`, `c`). */
  marker: string;
  /** Present for `\\c N`, `\\v N`, etc. */
  number?: number;
  /** Text after marker header until the next `\\` or EOF. */
  body: string;
  /** Index of `\\` that started this token (for errors). */
  offset: number;
};

function normalizeNewlines(input: string): string {
  return input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

/**
 * Split USFM into marker tokens. Each token's body runs until the next `\\`.
 */
export function tokenizeUsfm(input: string): UsfmToken[] {
  const text = normalizeNewlines(input);
  const tokens: UsfmToken[] = [];
  let i = 0;
  if (text.charCodeAt(0) === 0xfeff) {
    i = 1;
  }

  while (i < text.length) {
    const bs = text.indexOf("\\", i);
    if (bs === -1) {
      if (tokens.length) {
        const last = tokens[tokens.length - 1]!;
        last.body += text.slice(i);
      } else if (text.slice(i).trim()) {
        throw new UsfmParseError(
          "Text before first USFM marker is not allowed in v1",
          i,
        );
      }
      break;
    }
    if (bs > i) {
      const extra = text.slice(i, bs);
      if (tokens.length) {
        const last = tokens[tokens.length - 1]!;
        last.body += extra;
      } else if (extra.trim()) {
        throw new UsfmParseError(
          "Text before first USFM marker is not allowed in v1",
          i,
        );
      }
    }
    const markerStart = bs;
    i = bs + 1;
    if (i >= text.length) {
      throw new UsfmParseError(
        "Dangling backslash at end of input",
        markerStart,
      );
    }

    let marker = "";
    while (i < text.length && /[a-zA-Z0-9]/.test(text.charAt(i))) {
      marker += text.charAt(i);
      i++;
    }
    if (marker === "") {
      throw new UsfmParseError("Invalid or empty marker after \\", markerStart);
    }
    if (text.charAt(i) === "*") {
      marker += "*";
      i++;
    }

    while (i < text.length && /[ \t]/.test(text.charAt(i))) {
      i++;
    }

    let number: number | undefined;
    if (i < text.length && /[0-9]/.test(text.charAt(i))) {
      let ns = "";
      while (i < text.length && /[0-9]/.test(text.charAt(i))) {
        ns += text.charAt(i);
        i++;
      }
      number = parseInt(ns, 10);
    }

    while (i < text.length && /[ \t]/.test(text.charAt(i))) {
      i++;
    }

    const bodyStart = i;
    const nextBs = text.indexOf("\\", bodyStart);
    const bodyEnd = nextBs === -1 ? text.length : nextBs;
    const body = text.slice(bodyStart, bodyEnd);
    i = nextBs === -1 ? text.length : nextBs;

    tokens.push({
      marker: marker.toLowerCase(),
      number,
      body,
      offset: markerStart,
    });
  }

  return tokens;
}
