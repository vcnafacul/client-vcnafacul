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

const PENDING_PROTOCOL = "pending-asset://";
const ASSET_PROTOCOL = "asset://";

/**
 * Marca a imagem como não resolvida, de forma visível.
 *
 * Antes, uma falha de resolução deixava o `<img>` com o `src` original
 * (`asset://…`, que o browser não sabe carregar) e nada mais: imagem invisível,
 * nenhum erro no console além da requisição vermelha. Um `<img>` sem `src` e com
 * `alt` faz o browser desenhar o texto do alt, que é o sinal que faltava.
 */
function marcarAssetIndisponivel(img: HTMLImageElement, motivo: string) {
  img.removeAttribute("src");
  img.setAttribute("alt", "[Imagem indisponível]");
  img.setAttribute("data-asset-error", "true");
  img.title = motivo;
  img.style.minWidth = "180px";
  img.style.minHeight = "32px";
  img.style.outline = "1px dashed #dc2626";
  img.style.color = "#dc2626";
  img.style.fontSize = "12px";
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

      // Copy HTML attributes (skip width/height/textAlign — handled manually;
      // skip src — `asset://`/`pending-asset://` não são protocolos de rede e
      // o browser falharia o carregamento antes da resolução abaixo rodar)
      for (const [key, value] of Object.entries(HTMLAttributes)) {
        if (
          value != null &&
          value !== false &&
          key !== "width" &&
          key !== "height" &&
          key !== "textAlign" &&
          key !== "src"
        ) {
          img.setAttribute(key, String(value));
        }
      }

      const src: string = node.attrs.src || "";

      // Resolve special URL schemes
      if (src.startsWith(PENDING_PROTOCOL)) {
        const tempId = src.slice(PENDING_PROTOCOL.length);
        const blobUrl = resolvePendingUrl?.(tempId);
        if (blobUrl) {
          img.src = blobUrl;
        } else {
          marcarAssetIndisponivel(
            img,
            `Imagem pendente ${tempId} não encontrada nesta sessão`
          );
        }
      } else if (src.startsWith(ASSET_PROTOCOL)) {
        const assetId = src.slice(ASSET_PROTOCOL.length);
        if (resolveAssetUrl) {
          resolveAssetUrl(assetId)
            .then((blobUrl) => {
              if (blobUrl) {
                img.src = blobUrl;
              } else {
                marcarAssetIndisponivel(
                  img,
                  `Não foi possível carregar o asset ${assetId}`
                );
              }
            })
            .catch(() => {
              marcarAssetIndisponivel(
                img,
                `Falha ao buscar o asset ${assetId}`
              );
            });
        } else {
          marcarAssetIndisponivel(
            img,
            "Editor sem resolvedor de assets configurado"
          );
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
