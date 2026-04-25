// client-vcnafacul/src/pages/homeV2/sections/AboutSection/AboutDescription.tsx
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import RichTextRenderer from "../../../../components/atoms/richTextRenderer/RichTextRenderer";

const SHORT_LIMIT = 200;
const MEDIUM_LIMIT = 500;

export function AboutDescription({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);
  const len = description.length;

  if (len <= SHORT_LIMIT) {
    return (
      <div className="opacity-85 text-base md:text-lg leading-relaxed line-clamp-3">
        <RichTextRenderer content={description} contentFormat="markdown" />
      </div>
    );
  }

  if (len <= MEDIUM_LIMIT) {
    return (
      <div>
        <div
          className={[
            "opacity-85 text-base md:text-lg leading-relaxed transition-[max-height] duration-500",
            expanded ? "max-h-[1000px]" : "max-h-32 overflow-hidden",
          ].join(" ")}
        >
          <RichTextRenderer content={description} contentFormat="markdown" />
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 text-[#37d6b5] underline text-sm font-semibold"
        >
          {expanded ? "Ler menos" : "Ler mais"}
        </button>
      </div>
    );
  }

  // Long: drawer
  return (
    <Dialog.Root>
      <div className="opacity-85 text-base md:text-lg leading-relaxed line-clamp-4">
        <RichTextRenderer content={description} contentFormat="markdown" />
      </div>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="mt-3 text-[#37d6b5] underline text-sm font-semibold"
        >
          Ler manifesto completo →
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-[60]" />
        <Dialog.Content
          className="
            fixed top-0 right-0 h-full w-full md:w-[520px] z-[70] bg-white text-marine
            shadow-2xl overflow-y-auto p-8 outline-none
          "
        >
          <Dialog.Title className="text-2xl font-bold mb-4">
            Quem somos
          </Dialog.Title>
          <Dialog.Description asChild>
            <div className="prose">
              <RichTextRenderer content={description} contentFormat="markdown" />
            </div>
          </Dialog.Description>
          <Dialog.Close className="absolute top-4 right-4 text-marine">
            ✕
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
