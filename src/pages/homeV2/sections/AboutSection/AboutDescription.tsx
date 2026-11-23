// client-vcnafacul/src/pages/homeV2/sections/AboutSection/AboutDescription.tsx
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import RichTextRenderer from "../../../../components/atoms/richTextRenderer/RichTextRenderer";
import { QUEM_SOMOS_PATH } from "../../../../routes/path";

export function AboutDescription({ description }: { description: string }) {
  return (
    <div className="flex flex-col">
      <div className="text-prose text-muted-foreground line-clamp-4">
        <RichTextRenderer
          content={description}
          contentFormat="markdown"
          className="prose-invert"
        />
      </div>
      <Button asChild variant="primary" size="lg" className="mt-4 self-start">
        <Link to={QUEM_SOMOS_PATH}>Saiba mais →</Link>
      </Button>
    </div>
  );
}
