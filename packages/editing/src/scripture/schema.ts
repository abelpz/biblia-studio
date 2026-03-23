import { Schema } from "prosemirror-model";

/**
 * ProseMirror schema for v1 minimal USFM structure (chapters → paragraphs → verses).
 * Mirrors {@link @biblia-studio/formats} `UsfmDocument` shape.
 */
export const scriptureSchema = new Schema({
  nodes: {
    doc: {
      content: "chapter*",
      attrs: {
        bookId: { default: null as string | null },
        encoding: { default: null as string | null },
      },
      toDOM(node) {
        return [
          "article",
          {
            class: "biblia-usfm-doc",
            "data-book-id": node.attrs.bookId ?? "",
            "data-encoding": node.attrs.encoding ?? "",
          },
          0,
        ];
      },
    },
    chapter: {
      content: "usfm_paragraph*",
      attrs: {
        number: { default: 1 },
      },
      toDOM(node) {
        return [
          "section",
          { class: "biblia-chapter", "data-c": String(node.attrs.number) },
          0,
        ];
      },
    },
    usfm_paragraph: {
      content: "verse*",
      toDOM() {
        return ["div", { class: "biblia-usfm-p" }, 0];
      },
    },
    verse: {
      content: "text*",
      attrs: {
        number: { default: 1 },
      },
      toDOM(node) {
        return [
          "p",
          { class: "biblia-verse", "data-v": String(node.attrs.number) },
          0,
        ];
      },
    },
    text: { inline: true },
  },
  marks: {},
});
