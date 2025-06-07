"use client";
// InitializedMDXEditor.tsx
import type { ForwardedRef } from "react";
import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  ListsToggle,
  CodeToggle,
  InsertTable,
  InsertThematicBreak,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  diffSourcePlugin,
  DiffSourceToggleWrapper,
  codeBlockPlugin,
  codeMirrorPlugin,
  useCodeBlockEditorContext,
  CodeBlockEditorDescriptor,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

const PlainTextCodeEditorDescriptor: CodeBlockEditorDescriptor = {
  // always use the editor, no matter the language or the meta of the code block
  match: (language, meta) => true,
  // You can have multiple editors with different priorities, so that there's a "catch-all" editor (with the lowest priority)
  priority: 0,
  // The Editor is a React component
  Editor: (props) => {
    const cb = useCodeBlockEditorContext();
    // stops the propagation so that the parent lexical editor does not handle certain events.
    return (
      <div onKeyDown={(e) => e.nativeEvent.stopImmediatePropagation()}>
        <textarea
          rows={Math.max(3, (props.code.match(/\n/g)?.length ?? 0) + 1)}
          cols={20}
          defaultValue={props.code}
          onChange={(e) => cb.setCode(e.target.value)}
          className="font-mono bg-zinc-900 text-zinc-100 p-4 rounded-md w-full border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-sm"
        />
      </div>
    );
  },
};

// Only import this to the next file
export default function InitializeEditor({
  editorRef,
  ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
  return (
    <MDXEditor
      plugins={[
        toolbarPlugin({
          toolbarClassName: "sticky",
          toolbarContents: () => (
            <>
              <UndoRedo />
              <BoldItalicUnderlineToggles />
              <BlockTypeSelect />
              <CreateLink />
              <InsertImage />
              <ListsToggle />
              <CodeToggle />
              <InsertTable />
              <InsertThematicBreak />
              <div className="rte-md-toggle">
                <DiffSourceToggleWrapper> </DiffSourceToggleWrapper>
              </div>
            </>
          ),
        }),
        diffSourcePlugin({
          viewMode: "rich-text",
          diffMarkdown: "",
        }),
        linkPlugin(),
        linkDialogPlugin(),
        imagePlugin(),
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        codeMirrorPlugin(),
        codeBlockPlugin({
          codeBlockEditorDescriptors: [PlainTextCodeEditorDescriptor],
        }),
        markdownShortcutPlugin(),
      ]}
      {...props}
      ref={editorRef}
    />
  );
}
