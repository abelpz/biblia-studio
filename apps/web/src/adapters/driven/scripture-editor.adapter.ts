import { parseUsfm, serializeUsfm } from "@biblia-studio/formats";
import type { ScriptureEditorPort } from "../../ports/scripture-editor.port";

export function createScriptureEditorAdapter(): ScriptureEditorPort {
  return {
    parseUsfm,
    serializeUsfm,
  };
}
