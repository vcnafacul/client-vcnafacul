import { Node, mergeAttributes, nodeInputRule } from "@tiptap/core";
import katex from "katex";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    latex: {
      insertLatex: (formula: string, displayMode?: boolean) => ReturnType;
    };
  }
}

/**
 * LaTeX node for TipTap — rendered live with KaTeX.
 *
 * Supports:
 * - Toolbar button via `insertLatex` command
 * - InputRule: type `$formula$` → inline math
 * - InputRule: type `$$formula$$` → display math
 * - Double-click to edit formula
 *
 * Stored in markdown as `$...$` / `$$...$$`.
 */
export const LatexExtension = Node.create({
  name: "latex",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      formula: { default: "" },
      displayMode: { default: false },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-latex]",
        getAttrs: (el) => {
          const element = el as HTMLElement;
          return {
            formula: element.getAttribute("data-latex") || "",
            displayMode: element.getAttribute("data-display") === "true",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-latex": HTMLAttributes.formula,
        "data-display": String(HTMLAttributes.displayMode),
        class: HTMLAttributes.displayMode ? "latex-block" : "latex-inline",
        contenteditable: "false",
      }),
    ];
  },

  addNodeView() {
    return ({ node }) => {
      const isDisplay = node.attrs.displayMode;
      const dom = document.createElement("span");
      dom.setAttribute("data-latex", node.attrs.formula);
      dom.setAttribute("data-display", String(isDisplay));
      dom.classList.add(isDisplay ? "latex-block" : "latex-inline");
      dom.contentEditable = "false";
      dom.style.cursor = "pointer";

      try {
        katex.render(node.attrs.formula, dom, {
          throwOnError: false,
          displayMode: isDisplay,
        });
      } catch {
        dom.textContent = node.attrs.formula;
      }

      dom.addEventListener("dblclick", () => {
        const newFormula = prompt("Editar fórmula LaTeX:", node.attrs.formula);
        if (newFormula !== null && newFormula !== node.attrs.formula) {
          try {
            katex.render(newFormula, dom, {
              throwOnError: false,
              displayMode: isDisplay,
            });
          } catch {
            dom.textContent = newFormula;
          }
          dom.setAttribute("data-latex", newFormula);
        }
      });

      return { dom };
    };
  },

  addCommands() {
    return {
      insertLatex:
        (formula: string, displayMode = false) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { formula, displayMode },
          });
        },
    };
  },

  addInputRules() {
    return [
      // $$formula$$ → display math (must come before single $ rule)
      nodeInputRule({
        find: /\$\$([^$]+)\$\$$/,
        type: this.type,
        getAttributes: (match: RegExpMatchArray) => ({
          formula: match[1],
          displayMode: true,
        }),
      }),
      // $formula$ → inline math
      nodeInputRule({
        find: /(?:^|[^$])\$([^$\n]+)\$$/,
        type: this.type,
        getAttributes: (match: RegExpMatchArray) => ({
          formula: match[1],
          displayMode: false,
        }),
      }),
    ];
  },
});

export default LatexExtension;
