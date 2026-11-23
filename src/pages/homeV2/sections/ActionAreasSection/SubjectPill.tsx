// client-vcnafacul/src/pages/homeV2/sections/ActionAreasSection/SubjectPill.tsx
import { SubjectItem } from "../../adapters/actionAreasAdapter";

export function SubjectPill({
  subject,
  group,
  size,
}: {
  subject: SubjectItem;
  group: { themeColor: string; textColor: string };
  size: "lg" | "md";
}) {
  const Icon = subject.Image;
  return (
    <button
      type="button"
      aria-label={subject.title}
      style={{ background: group.themeColor, color: group.textColor }}
      className={[
        "rounded-full inline-flex items-center gap-2 transition-transform shadow-md",
        "hover:scale-110 focus-visible:outline outline-2 outline-offset-2 outline-ring",
        size === "lg" ? "px-4 py-2 text-body" : "px-3 py-1.5 text-body-sm",
      ].join(" ")}
    >
      <Icon className="w-4 h-4" />
      <span className="font-semibold">{subject.title}</span>
    </button>
  );
}
