import Image from "@tiptap/extension-image";
import { ResizableNodeView } from "@tiptap/core";

export interface ImageUploadOptions {
  onUpload: (file: File) => Promise<string>;
  resolvePendingUrl?: (ref: string) => string | undefined;
  resolveAssetUrl?: (assetId: string) => Promise<string | undefined>;
}

const ALIGN_TO_JUSTIFY: Record<string, string> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
};

const DEFAULT_WIDTH = 300;

export const ImageUploadExtension = Image.extend<ImageUploadOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      onUpload: async () => "",
      resolvePendingUrl: undefined,
      resolveAssetUrl: undefined,
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      "data-asset-id": {
        default: null,
      },
      width: {
        default: null,
        parseHTML: (el) => {
          const w = el.getAttribute("width");
          return w ? Number(w) : null;
        },
      },
      height: {
        default: null,
        parseHTML: (el) => {
          const h = el.getAttribute("height");
          return h ? Number(h) : null;
        },
      },
      textAlign: {
        default: "left",
        parseHTML: (el) => {
          // Check wrapping div's text-align
          const parent = el.parentElement;
          if (parent?.tagName === "DIV" && parent.style.textAlign) {
            return parent.style.textAlign;
          }
          return el.getAttribute("data-text-align") || "left";
        },
      },
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      uploadImage:
        (file: File) =>
        ({ commands }: { commands: any }) => {
          const onUpload = this.options.onUpload;
          onUpload(file).then((assetUrl) => {
            commands.insertContent({
              type: "image",
              attrs: {
                src: assetUrl,
                "data-asset-id": assetUrl,
              },
            });
          });
          return true;
        },
    };
  },

  addNodeView() {
    const resolvePendingUrl = this.options.resolvePendingUrl;
    const resolveAssetUrl = this.options.resolveAssetUrl;
    const extensionThis = this;

    return ({ node, getPos, HTMLAttributes, editor }) => {
      const img = document.createElement("img");

      // Copy HTML attributes (skip width/height/textAlign — handled manually)
      for (const [key, value] of Object.entries(HTMLAttributes)) {
        if (
          value != null &&
          value !== false &&
          key !== "width" &&
          key !== "height" &&
          key !== "textAlign"
        ) {
          img.setAttribute(key, String(value));
        }
      }

      const src: string = node.attrs.src || "";

      // Resolve special URL schemes
      if (src.startsWith("pending-asset://")) {
        const tempId = src.replace("pending-asset://", "");
        const blobUrl = resolvePendingUrl?.(tempId);
        if (blobUrl) {
          img.src = blobUrl;
        }
      } else if (src.startsWith("asset://")) {
        const assetId = src.replace("asset://", "");
        if (resolveAssetUrl) {
          resolveAssetUrl(assetId).then((blobUrl) => {
            if (blobUrl) {
              img.src = blobUrl;
            }
          });
        }
      } else {
        img.src = src;
      }

      img.style.maxWidth = "100%";

      // Apply initial size: use saved dimensions, or cap at DEFAULT_WIDTH
      const savedWidth = node.attrs.width;
      const savedHeight = node.attrs.height;
      if (!savedWidth && !savedHeight) {
        img.style.width = `${DEFAULT_WIDTH}px`;
        img.style.height = "auto";
        // Once image loads, commit actual dimensions
        img.addEventListener(
          "load",
          () => {
            const naturalW = img.naturalWidth;
            const naturalH = img.naturalHeight;
            const displayW = Math.min(naturalW, DEFAULT_WIDTH);
            const displayH = Math.round((displayW / naturalW) * naturalH);
            img.style.width = `${displayW}px`;
            img.style.height = `${displayH}px`;
          },
          { once: true }
        );
      }

      const nodeView = new ResizableNodeView({
        element: img,
        editor,
        node,
        getPos,
        onResize: (width, height) => {
          img.style.width = `${width}px`;
          img.style.height = `${height}px`;
        },
        onCommit: (width, height) => {
          const pos = getPos();
          if (pos === undefined) return;
          extensionThis.editor
            .chain()
            .setNodeSelection(pos)
            .updateAttributes("image", {
              width: Math.round(width),
              height: Math.round(height),
            })
            .run();
        },
        onUpdate: (updatedNode) => {
          if (updatedNode.type.name !== "image") return false;
          const newSrc = updatedNode.attrs.src || "";
          if (newSrc !== src) return false;

          // Sync width/height from attributes if changed externally
          const w = updatedNode.attrs.width;
          const h = updatedNode.attrs.height;
          if (w) img.style.width = `${w}px`;
          if (h) img.style.height = `${h}px`;

          // Sync alignment
          const align = updatedNode.attrs.textAlign || "left";
          nodeView.container.style.justifyContent =
            ALIGN_TO_JUSTIFY[align] || "flex-start";

          return true;
        },
        options: {
          directions: ["bottom-right", "bottom-left"],
          preserveAspectRatio: true,
          min: { width: 50, height: 50 },
        },
      });

      // Apply initial alignment
      const align = node.attrs.textAlign || "left";
      nodeView.container.style.justifyContent =
        ALIGN_TO_JUSTIFY[align] || "flex-start";

      return nodeView;
    };
  },
});

export default ImageUploadExtension;
