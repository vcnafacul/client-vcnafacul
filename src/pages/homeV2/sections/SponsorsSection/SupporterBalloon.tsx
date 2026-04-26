import { Globe } from "lucide-react";
import { Sponsor } from "../../adapters/sponsorsAdapter";

interface SupporterBalloonProps {
  sponsor: Sponsor;
  variant?: "popover" | "sheet";
}

export function SupporterBalloon({
  sponsor,
  variant = "popover",
}: SupporterBalloonProps) {
  const isMobile = variant === "sheet";
  return (
    <div className="flex flex-col gap-2 text-left">
      <div className="flex items-center gap-2">
        {sponsor.logoUrl && (
          <img
            src={sponsor.logoUrl}
            alt={sponsor.alt}
            className={
              "object-contain shrink-0 " + (isMobile ? "w-12 h-12" : "w-8 h-8")
            }
          />
        )}
        <h3 className="text-base font-semibold leading-snug">{sponsor.alt}</h3>
      </div>
      {sponsor.description && (
        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line break-words">
          {sponsor.description}
        </p>
      )}
      <a
        href={sponsor.link}
        target="_blank"
        rel="noopener noreferrer"
        className={
          "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold " +
          "bg-marine text-white hover:bg-marine/90 transition-colors self-start " +
          (isMobile ? "w-full justify-center self-stretch" : "")
        }
      >
        <Globe className="h-4 w-4" />
        Visitar site →
      </a>
    </div>
  );
}
