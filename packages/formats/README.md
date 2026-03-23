# `@biblia-studio/formats`

Parsing, validation, and interchange for **scripture and resource containers**, aligned with [uW-Tools-Collab](https://github.com/unfoldingWord/uW-Tools-Collab) format documentation.

## USFM (v1 minimal)

**Allowlist** (expand only with fixtures + round-trip tests):

| Marker | Role                                       |
| ------ | ------------------------------------------ |
| `\id`  | Book code (first line of file, e.g. `MRK`) |
| `\ide` | Encoding (e.g. `UTF-8`)                    |
| `\c`   | Chapter number                             |
| `\p`   | Paragraph (verse containers)               |
| `\v`   | Verse number + text                        |

**Unsupported-marker policy:** strict — any other marker fails parsing with `UsfmParseError`. See `UNKNOWN_MARKER_POLICY` in `src/usfm/allowlist.ts`.

**API:** `parseUsfm`, `serializeUsfm`, `tokenizeUsfm` from the package root. Sample files live under `fixtures/`.
