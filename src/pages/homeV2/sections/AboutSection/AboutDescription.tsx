// client-vcnafacul/src/pages/homeV2/sections/AboutSection/AboutDescription.tsx
import { Link } from "react-router-dom";
import RichTextRenderer from "../../../../components/atoms/richTextRenderer/RichTextRenderer";
import { QUEM_SOMOS_PATH } from "../../../../routes/path";

export function AboutDescription({ description }: { description: string }) {
  return (
    <div className="flex flex-col">
      <div className="opacity-85 text-base md:text-lg leading-relaxed line-clamp-4">
        <RichTextRenderer
          content={description}
          contentFormat="markdown"
          className="prose-invert"
        />
      </div>
      <Link
        to={QUEM_SOMOS_PATH}
        className="inline-flex items-center gap-2 mt-4 rounded-full px-6 py-2.5 text-sm font-semibold bg-[#37d6b5] text-[#0b2747] hover:bg-[#2bbfa1] hover:-translate-y-0.5 transition-all duration-200 shadow-md self-start"
      >
        Saiba mais →
      </Link>
    </div>
  );
}
