'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Editor as TiptapEditor } from '@tiptap/react';
import type { EditorSerializationResult, SaveState } from './types';
import { normalizeMarkdown, serializeContentJson } from './utils';

type PersistenceOptions = {
  onCommit: (payload: {
    contentJson: EditorSerializationResult['contentJson'];
    revision: number;
    markdownExport?: string;
  }) => Promise<number | void> | number | void;
  onDirtyChange?: (dirty: boolean) => void;
};

export function useCruiseEditorPersistence({ onCommit, onDirtyChange }: PersistenceOptions) {
  const commitTimeoutRef = useRef<number | null>(null);
  const savedTimeoutRef = useRef<number | null>(null);
  const committedJsonRef = useRef(serializeContentJson(null));
  const latestJsonRef = useRef(serializeContentJson(null));
  const currentRevisionRef = useRef(0);
  const dirtyRef = useRef(false);
  const onCommitRef = useRef(onCommit);
  const onDirtyChangeRef = useRef(onDirtyChange);
  const [saveState, setSaveState] = useState<SaveState>('idle');

  onCommitRef.current = onCommit;
  onDirtyChangeRef.current = onDirtyChange;

  const markDirty = useCallback((nextDirty: boolean) => {
    if (dirtyRef.current === nextDirty) return;
    dirtyRef.current = nextDirty;
    onDirtyChangeRef.current?.(nextDirty);
  }, []);

  const serializeEditor = useCallback((editor: TiptapEditor): EditorSerializationResult => {
    const contentJson = editor.getJSON();
    const markdownExport = normalizeMarkdown(
      ((editor.storage as unknown) as { markdown: { getMarkdown: () => string } }).markdown.getMarkdown(),
    );
    return {
      contentJson,
      markdownExport,
      serializedJson: serializeContentJson(contentJson),
    };
  }, []);

  const commitEditor = useCallback(async (editor: TiptapEditor) => {
    const next = serializeEditor(editor);
    if (next.serializedJson === committedJsonRef.current) {
      markDirty(false);
      setSaveState('idle');
      return;
    }
    setSaveState('saving');
    try {
      const nextRevision =
        (await onCommitRef.current({
          contentJson: next.contentJson,
          revision: currentRevisionRef.current,
          markdownExport: next.markdownExport,
        })) ?? currentRevisionRef.current + 1;
      currentRevisionRef.current = nextRevision;
      committedJsonRef.current = next.serializedJson;
      latestJsonRef.current = next.serializedJson;
      markDirty(false);
      setSaveState('saved');
      if (savedTimeoutRef.current) window.clearTimeout(savedTimeoutRef.current);
      savedTimeoutRef.current = window.setTimeout(() => setSaveState('idle'), 1000);
    } catch {
      markDirty(true);
      setSaveState('error');
      window.setTimeout(() => editor.commands.focus(), 0);
    }
  }, [markDirty, serializeEditor]);

  const scheduleCommit = useCallback((getEditor: () => TiptapEditor | null) => {
    if (commitTimeoutRef.current) window.clearTimeout(commitTimeoutRef.current);
    commitTimeoutRef.current = window.setTimeout(() => {
      const editor = getEditor();
      if (!editor) return;
      void commitEditor(editor);
    }, 500);
  }, [commitEditor]);

  const commitNow = useCallback(async (getEditor: () => TiptapEditor | null) => {
    if (commitTimeoutRef.current) {
      window.clearTimeout(commitTimeoutRef.current);
      commitTimeoutRef.current = null;
    }
    const editor = getEditor();
    if (!editor) return;
    await commitEditor(editor);
  }, [commitEditor]);

  const resetPersistedState = useCallback((serializedContent: string, revision: number) => {
    committedJsonRef.current = serializedContent;
    latestJsonRef.current = serializedContent;
    currentRevisionRef.current = revision;
    markDirty(false);
    setSaveState('idle');
  }, [markDirty]);

  useEffect(() => () => {
    if (commitTimeoutRef.current) window.clearTimeout(commitTimeoutRef.current);
    if (savedTimeoutRef.current) window.clearTimeout(savedTimeoutRef.current);
  }, []);

  return {
    saveState,
    setSaveState,
    committedJsonRef,
    latestJsonRef,
    currentRevisionRef,
    markDirty,
    serializeEditor,
    scheduleCommit,
    commitNow,
    resetPersistedState,
  };
}
