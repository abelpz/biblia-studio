"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createScriptureEditorAdapter } from "../../src/adapters/driven/scripture-editor.adapter";
import { ScriptureEditor } from "../../src/components/ScriptureEditor";

const SEED_USFM = `\\id MRK
\\ide UTF-8
\\c 1
\\p
\\v 1 The beginning of the good news about Jesus the Messiah.
\\v 2 As it is written in the prophet Isaiah.
`;

function downloadUsfm(usfm: string) {
  const blob = new Blob([usfm], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "scripture.usfm";
  a.click();
  URL.revokeObjectURL(url);
}

export default function EditorPage() {
  const port = useMemo(() => createScriptureEditorAdapter(), []);
  const [usfm, setUsfm] = useState(SEED_USFM);

  return (
    <main style={{ padding: "1.5rem", maxWidth: "48rem" }}>
      <h1 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
        Scripture editor (M2)
      </h1>
      <p style={{ marginBottom: "1rem", color: "#444" }}>
        Minimal WYSIWYG via ProseMirror; USFM round-trip uses{" "}
        <code>@biblia-studio/formats</code> and{" "}
        <code>@biblia-studio/editing</code>.
      </p>
      <ScriptureEditor
        initialUsfm={SEED_USFM}
        port={port}
        onUsfmChange={setUsfm}
      />
      <p style={{ marginTop: "1rem" }}>
        <button type="button" onClick={() => downloadUsfm(usfm)}>
          Download USFM
        </button>
      </p>
      <p style={{ marginTop: "1.25rem" }}>
        <Link href="/">← Home</Link>
      </p>
    </main>
  );
}
