import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        <h3 className="text-h3">{sponsor.alt}</h3>
      </div>
      {sponsor.description && (
        <p className="text-body text-muted-foreground whitespace-pre-line break-words">
          {sponsor.description}
        </p>
      )}
      <Button
        asChild
        variant="primary"
        className={isMobile ? "w-full justify-center self-stretch" : "self-start"}
      >
        <a href={sponsor.link} target="_blank" rel="noopener noreferrer">
          <Globe className="h-4 w-4" />
          Visitar site →
        </a>
      </Button>
    </div>
  );
}
