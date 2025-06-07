"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code2,
  List as ListIcon,
  ListOrdered,
  Quote,
  Image as ImageIcon,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading as HeadingIcon,
  Minus,
  Smile,
} from "lucide-react";

/* inline emoji picker (client-only) */
const EmojiPicker = dynamic(() => import("@/components/EmojiPicker"), {
  ssr: false,
});

/* ------------------------------------------------------------------
 *  Editor impl is lazy-loaded; SSR disabled by Next.js dynamic()
 * ----------------------------------------------------------------*/
const EditorImpl = dynamic(
  async () => {
    const { useEditor, EditorContent } = await import("@tiptap/react");
    const StarterKit     = (await import("@tiptap/starter-kit")).default;
    const Underline      = (await import("@tiptap/extension-underline")).default;
    const TextAlign      = (await import("@tiptap/extension-text-align")).default;
    const Link           = (await import("@tiptap/extension-link")).default;
    const Image          = (await import("@tiptap/extension-image")).default;
    const HorizontalRule = (await import("@tiptap/extension-horizontal-rule")).default;
    const CodeBlock      = (await import("@tiptap/extension-code-block")).default;

    /* disable the two features that StarterKit already includes
       so we can add our customised versions below                */
    const CleanStarter = StarterKit.configure({
      codeBlock: false,
      horizontalRule: false,
    });

    return function InnerEditor({
      value,
      onChange,
    }: {
      value: string;
      onChange: (html: string) => void;
    }) {
      /* immediatelyRender:false → silences SSR hydration warning  */
      const editor = useEditor({
        extensions: [
          CleanStarter,
          CodeBlock,
          Underline,
          Image,
          HorizontalRule,
          Link.configure({
            openOnClick: false,
            HTMLAttributes: { rel: "noopener" },
          }),
          TextAlign.configure({ types: ["heading", "paragraph"] }),
        ],
        content: value,
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
        editorProps: {
          attributes: {
            class:
              "prose max-w-none min-h-[180px] focus:outline-none p-2 border rounded",
          },
        },
        immediatelyRender: false,          // ← fixes hydration message
      });

      const [showEmoji, setShowEmoji] = useState(false);
      if (!editor)
        return <div className="border rounded p-2">Loading editor…</div>;

      const Btn = ({
        onClick,
        active,
        icon,
        label,
      }: {
        onClick: () => void;
        active?: boolean;
        icon: React.ReactNode;
        label: string;
      }) => (
        <button
          type="button"
          onClick={onClick}
          title={label}
          className={`p-1 rounded hover:bg-gray-200 ${
            active ? "text-blue-600" : "text-gray-700"
          }`}
        >
          {icon}
        </button>
      );

      return (
        <div className="space-y-2 relative">
          {/* ───── toolbar ───── */}
          <div className="flex flex-wrap gap-1 border rounded px-2 py-1 bg-gray-50">
            <Btn
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              active={editor.isActive("heading", { level: 2 })}
              icon={<HeadingIcon className="w-4 h-4" />}
              label="Heading"
            />
            <Btn
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive("bold")}
              icon={<Bold className="w-4 h-4" />}
              label="Bold"
            />
            <Btn
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive("italic")}
              icon={<Italic className="w-4 h-4" />}
              label="Italic"
            />
            <Btn
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              active={editor.isActive("underline")}
              icon={<UnderlineIcon className="w-4 h-4" />}
              label="Underline"
            />
            <Btn
              onClick={() => editor.chain().focus().toggleStrike().run()}
              active={editor.isActive("strike")}
              icon={<Strikethrough className="w-4 h-4" />}
              label="Strike"
            />
            <Btn
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              active={editor.isActive("codeBlock")}
              icon={<Code2 className="w-4 h-4" />}
              label="Code block"
            />
            <Btn
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive("bulletList")}
              icon={<ListIcon className="w-4 h-4" />}
              label="Bullet list"
            />
            <Btn
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive("orderedList")}
              icon={<ListOrdered className="w-4 h-4" />}
              label="Ordered list"
            />
            <Btn
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive("blockquote")}
              icon={<Quote className="w-4 h-4" />}
              label="Blockquote"
            />
            <Btn
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              icon={<Minus className="w-4 h-4" />}
              label="Horizontal rule"
            />
            <Btn
              onClick={() => {
                const url = prompt("URL");
                if (url)
                  editor
                    .chain()
                    .focus()
                    .extendMarkRange("link")
                    .setLink({ href: url })
                    .run();
              }}
              active={editor.isActive("link")}
              icon={<LinkIcon className="w-4 h-4" />}
              label="Link"
            />
            <Btn
              onClick={() => {
                const src = prompt("Image URL");
                if (src) editor.chain().focus().setImage({ src }).run();
              }}
              icon={<ImageIcon className="w-4 h-4" />}
              label="Image"
            />
            <Btn
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              active={editor.isActive({ textAlign: "left" })}
              icon={<AlignLeft className="w-4 h-4" />}
              label="Left"
            />
            <Btn
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              active={editor.isActive({ textAlign: "center" })}
              icon={<AlignCenter className="w-4 h-4" />}
              label="Center"
            />
            <Btn
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              active={editor.isActive({ textAlign: "right" })}
              icon={<AlignRight className="w-4 h-4" />}
              label="Right"
            />
            {/* emoji toggle */}
            <Btn
              onClick={() => setShowEmoji(v => !v)}
              icon={<Smile className="w-4 h-4" />}
              label="Emoji"
            />
          </div>

          {/* emoji picker popup */}
          {showEmoji && (
            <EmojiPicker
              onSelect={emoji => {
                editor.chain().focus().insertContent(emoji).run();
                setShowEmoji(false);
              }}
              onClose={() => setShowEmoji(false)}
            />
          )}

          <EditorContent editor={editor} />
        </div>
      );
    };
  },
  { ssr: false },
);

export default function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  return <EditorImpl value={value} onChange={onChange} />;
}
