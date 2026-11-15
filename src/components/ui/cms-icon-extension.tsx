import { mergeAttributes, Node } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import { CMS_ICONS, type CmsIconName } from "@/components/ui/cms-icons";

function CmsIconView({ node }: NodeViewProps) {
  const name = String(node.attrs.name ?? "");
  const Icon = CMS_ICONS[name as CmsIconName];
  return (
    <NodeViewWrapper as="span" className="cms-icon" data-cms-icon={name}>
      {Icon ? <Icon size={18} aria-hidden /> : null}
    </NodeViewWrapper>
  );
}

export const CmsIcon = Node.create({
  name: "cmsIcon",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      name: {
        default: "Shield",
        parseHTML: (element) => element.getAttribute("data-cms-icon"),
        renderHTML: (attributes) => ({ "data-cms-icon": attributes.name }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-cms-icon]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes({ class: "cms-icon" }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CmsIconView);
  },
});
