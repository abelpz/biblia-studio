# `@biblia-studio/editing`

Translation editing primitives: **ProseMirror** scripture document model aligned with `@biblia-studio/formats` USFM v1.

## Entry points

| Export                | Purpose                                                                      |
| --------------------- | ---------------------------------------------------------------------------- |
| `scriptureSchema`     | ProseMirror `Schema` (`doc` → `chapter` → `usfm_paragraph` → `verse` + text) |
| `usfmDocumentToPmDoc` | `UsfmDocument` → ProseMirror `doc` node                                      |
| `pmDocToUsfmDocument` | ProseMirror `doc` node → `UsfmDocument`                                      |
| `EDITING_SCOPE`       | Package name constant                                                        |

Re-exported types: `UsfmDocument`, `UsfmChapter`, `UsfmParagraph`, `UsfmVerse` from `@biblia-studio/formats`.

## Dependencies

Runtime: **prosemirror-model** (schema + document tree; one-line justification: structured scripture editing and a stable bridge to the formats `UsfmDocument`).

## Related

- `docs/15-bible-editor-product-vision.md` — WYSIWYG + minimal USFM
- `packages/formats/README.md` — USFM v1 allowlist
