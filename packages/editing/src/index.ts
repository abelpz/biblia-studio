/**
 * Translation editing — ProseMirror scripture model, buffers, validation hooks.
 */
export { EDITING_SCOPE } from "./scope.js";
export {
  pmDocToUsfmDocument,
  scriptureSchema,
  usfmDocumentToPmDoc,
} from "./scripture/index.js";
export type {
  UsfmChapter,
  UsfmDocument,
  UsfmParagraph,
  UsfmVerse,
} from "@biblia-studio/formats";
