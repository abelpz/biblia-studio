"use client";

import {
  pmDocToUsfmDocument,
  scriptureSchema,
  usfmDocumentToPmDoc,
} from "@biblia-studio/editing";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { useEffect, useRef, useState } from "react";
import "prosemirror-view/style/prosemirror.css";
import type { ScriptureEditorPort } from "../ports/scripture-editor.port";

export type ScriptureEditorProps = {
  initialUsfm: string;
  port: ScriptureEditorPort;
  onUsfmChange?: (usfm: string) => void;
};

export function ScriptureEditor(props: ScriptureEditorProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const portRef = useRef(props.port);
  const onChangeRef = useRef(props.onUsfmChange);

  const [usfmPreview, setUsfmPreview] = useState(props.initialUsfm);

  useEffect(() => {
    portRef.current = props.port;
  }, [props.port]);

  useEffect(() => {
    onChangeRef.current = props.onUsfmChange;
  }, [props.onUsfmChange]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) {
      return;
    }
    const doc = portRef.current.parseUsfm(props.initialUsfm);
    const node = usfmDocumentToPmDoc(doc);
    const state = EditorState.create({ schema: scriptureSchema, doc: node });
    const view = new EditorView(el, {
      state,
      dispatchTransaction(tr) {
        const next = view.state.apply(tr);
        view.updateState(next);
        const out = portRef.current.serializeUsfm(
          pmDocToUsfmDocument(next.doc),
        );
        setUsfmPreview(out);
        onChangeRef.current?.(out);
      },
    });
    return () => {
      view.destroy();
    };
  }, [props.initialUsfm, props.port]);

  return (
    <div>
      <div
        ref={rootRef}
        className="biblia-pm-root"
        style={{
          border: "1px solid #ccc",
          borderRadius: 4,
          padding: "0.5rem",
          minHeight: "12rem",
        }}
      />
      <h2 style={{ fontSize: "1rem", marginTop: "1rem" }}>
        USFM preview (serialized)
      </h2>
      <pre
        style={{
          fontSize: "0.8rem",
          overflow: "auto",
          padding: "0.75rem",
          background: "#f6f6f6",
          borderRadius: 4,
        }}
      >
        {usfmPreview}
      </pre>
    </div>
  );
}
