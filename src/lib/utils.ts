import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Tokens do design system (tailwind/type-scale.js e tailwind.config.js).
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "hero", "display", "h1", "h2", "h3", "h4", "prose", "body",
            "body-sm", "caption", "label", "button", "overline", "numeric",
          ],
        },
      ],
      z: [
        { z: ["base", "raised", "sticky", "header", "overlay", "popover", "toast"] },
      ],
      "max-w": [{ "max-w": ["prose-content", "form", "page"] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
