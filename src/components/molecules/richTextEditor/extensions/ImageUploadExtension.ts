import Image from "@tiptap/extension-image";

export interface ImageUploadOptions {
  onUpload: (file: File) => Promise<string>;
  resolvePendingUrl?: (ref: string) => string | undefined;
  resolveAssetUrl?: (assetId: string) => Promise<string | undefined>;
}

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

    return ({ node, HTMLAttributes }) => {
      const dom = document.createElement("img");

      // Copy HTML attributes
      for (const [key, value] of Object.entries(HTMLAttributes)) {
        if (value != null && value !== false) {
          dom.setAttribute(key, String(value));
        }
      }

      const src: string = node.attrs.src || "";

      const resolveSrc = () => {
        if (src.startsWith("pending-asset://")) {
          const tempId = src.replace("pending-asset://", "");
          const blobUrl = resolvePendingUrl?.(tempId);
          if (blobUrl) {
            dom.src = blobUrl;
          }
        } else if (src.startsWith("asset://")) {
          const assetId = src.replace("asset://", "");
          if (resolveAssetUrl) {
            resolveAssetUrl(assetId).then((blobUrl) => {
              if (blobUrl) {
                dom.src = blobUrl;
              }
            });
          }
        } else {
          dom.src = src;
        }
      };

      resolveSrc();

      // Basic styling
      dom.style.maxWidth = "100%";
      dom.style.height = "auto";

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type.name !== "image") return false;
          const newSrc = updatedNode.attrs.src || "";
          if (newSrc !== src) {
            // Src changed, let the extension re-create the view
            return false;
          }
          return true;
        },
      };
    };
  },
});

export default ImageUploadExtension;
