"use client";

import { useMemo, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { TextStyleKit } from "@tiptap/extension-text-style";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo,
  Smile,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo,
  ImageIcon,
  Code,
  Baseline,
  Highlighter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CmsIcon } from "@/components/ui/cms-icon-extension";
import { CMS_ICONS, CMS_ICON_NAMES, type CmsIconName } from "@/components/ui/cms-icons";

type TiptapEditorProps = {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
};

const FONT_FAMILIES = [
  { label: "Default", value: "" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times", value: '"Times New Roman", Times, serif' },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Courier", value: '"Courier New", Courier, monospace' },
];

const FONT_SIZES = ["", "12px", "14px", "16px", "18px", "20px", "24px", "32px", "40px"];
const LINE_HEIGHTS = ["", "1", "1.4", "1.6", "1.8", "2"];

export default function TiptapEditor({
  content,
  onChange,
  placeholder = "Write your blog content here...",
}: TiptapEditorProps) {
  const [iconsOpen, setIconsOpen] = useState(false);
  const [iconQuery, setIconQuery] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: true, allowBase64: true }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: true }),
      TextStyleKit.configure({ backgroundColor: false }),
      CmsIcon,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor: current }) => {
      onChange(current.getHTML());
    },
    editorProps: {
      attributes: {
        class: "tiptap focus:outline-none min-h-[300px] max-w-none p-4",
      },
    },
  });

  const visibleIcons = useMemo(() => {
    const term = iconQuery.trim().toLowerCase();
    return CMS_ICON_NAMES.filter((name) => !term || name.toLowerCase().includes(term)).slice(0, 48);
  }, [iconQuery]);

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file || !editor) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        editor.chain().focus().setImage({ src: reader.result as string }).run();
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const insertIcon = (name: CmsIconName) => {
    editor?.chain().focus().insertContent({ type: "cmsIcon", attrs: { name } }).run();
    setIconsOpen(false);
    setIconQuery("");
  };

  if (!editor) return null;

  const textStyle = editor.getAttributes("textStyle");
  const headingLevel = ([1, 2, 3] as const).find((level) => editor.isActive("heading", { level }));
  const active = (pressed: boolean) => (pressed ? "bg-muted" : "");

  return (
    <div className="border-border bg-background overflow-hidden rounded-lg border">
      <div className="border-border bg-muted/30 flex flex-wrap items-center gap-1 border-b p-2">
        <select
          value={headingLevel ? String(headingLevel) : "p"}
          onChange={(event) => {
            const value = event.target.value;
            if (value === "p") editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: Number(value) as 1 | 2 | 3 }).run();
          }}
          className="border-input bg-background text-foreground h-8 rounded-md border px-2 text-xs"
          title="Heading"
        >
          <option value="p">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>
        <select
          value={FONT_FAMILIES.some((font) => font.value === textStyle.fontFamily) ? (textStyle.fontFamily ?? "") : ""}
          onChange={(event) => {
            const value = event.target.value;
            if (!value) editor.chain().focus().unsetFontFamily().run();
            else editor.chain().focus().setFontFamily(value).run();
          }}
          className="border-input bg-background text-foreground h-8 max-w-28 rounded-md border px-2 text-xs"
          title="Font"
        >
          {FONT_FAMILIES.map((font) => (
            <option key={font.label} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
        <select
          value={FONT_SIZES.includes(textStyle.fontSize) ? (textStyle.fontSize ?? "") : ""}
          onChange={(event) => {
            const value = event.target.value;
            if (!value) editor.chain().focus().unsetFontSize().run();
            else editor.chain().focus().setFontSize(value).run();
          }}
          className="border-input bg-background text-foreground h-8 rounded-md border px-2 text-xs"
          title="Font size"
        >
          <option value="">Size</option>
          {FONT_SIZES.filter(Boolean).map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <select
          value={LINE_HEIGHTS.includes(textStyle.lineHeight) ? (textStyle.lineHeight ?? "") : ""}
          onChange={(event) => {
            const value = event.target.value;
            if (!value) editor.chain().focus().unsetLineHeight().run();
            else editor.chain().focus().setLineHeight(value).run();
          }}
          className="border-input bg-background text-foreground h-8 rounded-md border px-2 text-xs"
          title="Line height"
        >
          <option value="">Line</option>
          {LINE_HEIGHTS.filter(Boolean).map((height) => (
            <option key={height} value={height}>
              {height}
            </option>
          ))}
        </select>

        <Button type="button" variant="ghost" size="sm" title="Bold" className={active(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" title="Italic" className={active(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" title="Underline" className={active(editor.isActive("underline"))} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" title="Strikethrough" className={active(editor.isActive("strike"))} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" title="Heading" className={active(editor.isActive("heading"))} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 className="h-4 w-4" />
        </Button>

        <label className="hover:bg-muted inline-flex h-8 items-center gap-1 rounded-md px-2" title="Text color">
          <Baseline className="h-4 w-4" />
          <input
            type="color"
            aria-label="Text color"
            value={typeof textStyle.color === "string" && textStyle.color.startsWith("#") ? textStyle.color : "#0f172a"}
            onChange={(event) => editor.chain().focus().setColor(event.target.value).run()}
            className="h-5 w-5 cursor-pointer border-0 bg-transparent p-0"
          />
        </label>
        <label className="hover:bg-muted inline-flex h-8 items-center gap-1 rounded-md px-2" title="Highlight">
          <Highlighter className="h-4 w-4" />
          <input
            type="color"
            aria-label="Highlight color"
            defaultValue="#fef08a"
            onChange={(event) => editor.chain().focus().setHighlight({ color: event.target.value }).run()}
            className="h-5 w-5 cursor-pointer border-0 bg-transparent p-0"
          />
        </label>

        <Button type="button" variant="ghost" size="sm" title="Align left" className={active(editor.isActive({ textAlign: "left" }))} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" title="Align center" className={active(editor.isActive({ textAlign: "center" }))} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" title="Align right" className={active(editor.isActive({ textAlign: "right" }))} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" title="Bullet list" className={active(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" title="Numbered list" className={active(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" title="Quote" className={active(editor.isActive("blockquote"))} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" title="Code block" className={active(editor.isActive("codeBlock"))} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <Code className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" title="Insert image" onClick={handleImageUpload}>
          <ImageIcon className="h-4 w-4" />
        </Button>

        <div className="relative">
          <Button type="button" variant="ghost" size="sm" title="Insert icon" className={active(iconsOpen)} onClick={() => setIconsOpen((open) => !open)}>
            <Smile className="h-4 w-4" />
          </Button>
          {iconsOpen && (
            <div className="border-border bg-popover text-popover-foreground absolute top-10 left-0 z-20 w-72 rounded-lg border p-2 shadow-lg">
              <input
                value={iconQuery}
                onChange={(event) => setIconQuery(event.target.value)}
                placeholder="Search icons"
                className="border-input bg-background mb-2 h-8 w-full rounded-md border px-2 text-xs"
              />
              <div className="grid max-h-52 grid-cols-6 gap-1 overflow-y-auto">
                {visibleIcons.map((name) => {
                  const Icon = CMS_ICONS[name];
                  return (
                    <button
                      key={name}
                      type="button"
                      title={name}
                      onClick={() => insertIcon(name)}
                      className="hover:bg-muted flex h-8 items-center justify-center rounded-md"
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <Button type="button" variant="ghost" size="sm" title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <EditorContent editor={editor} className="bg-background" />
    </div>
  );
}
