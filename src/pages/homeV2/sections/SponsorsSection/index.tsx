import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { SectionComponent } from "../../../../components/templates/homeSection/Section.types";
import { Sponsor } from "../../adapters/sponsorsAdapter";
import { SupporterBalloon } from "./SupporterBalloon";

const LOGO_CLASS =
  "w-[140px] h-[140px] object-contain " +
  "grayscale opacity-70 " +
  "transition-all duration-300 ease-out " +
  "hover:grayscale-0 hover:opacity-100 hover:-translate-y-1 " +
  "hover:[filter:drop-shadow(0_8px_12px_rgb(0_0_0_/_0.18))]";

const TRIGGER_CLASS =
  "flex-none flex items-center justify-center rounded-md " +
  "focus-visible:outline outline-2 outline-offset-4 outline-[#f7b733] " +
  "bg-transparent border-0 p-0 cursor-pointer";

function hasDescription(s: Sponsor): boolean {
  return !!s.description && s.description.trim().length > 0;
}

function SponsorLogo({ sponsor }: { sponsor: Sponsor }) {
  return (
    <img src={sponsor.logoUrl} alt={sponsor.alt} className={LOGO_CLASS} />
  );
}

function SponsorWithBalloon({ sponsor }: { sponsor: Sponsor }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <button
            type="button"
            aria-label={`Sobre ${sponsor.alt}`}
            className={TRIGGER_CLASS}
          >
            <SponsorLogo sponsor={sponsor} />
          </button>
        </SheetTrigger>
        <SheetContent side="bottom">
          <SupporterBalloon sponsor={sponsor} variant="sheet" />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Sobre ${sponsor.alt}`}
          className={TRIGGER_CLASS}
        >
          <SponsorLogo sponsor={sponsor} />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="center" className="w-96">
        <SupporterBalloon sponsor={sponsor} variant="popover" />
      </PopoverContent>
    </Popover>
  );
}

export const SponsorsSection: SectionComponent<Sponsor[]> = ({ data }) => {
  if (data.length === 0) return null;

  return (
    <>
      <div className="container mx-auto px-4 mb-10 text-center">
        <p className="home-section__eyebrow mb-3">QUEM ACREDITA</p>
        <h2 className="text-3xl md:text-5xl font-extrabold leading-tight [text-wrap:balance]">
          Empresas que apoiam a causa
        </h2>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
          {data.map((s) =>
            hasDescription(s) ? (
              <SponsorWithBalloon key={s.alt} sponsor={s} />
            ) : (
              <a
                key={s.alt}
                href={s.link}
                target="_blank"
                rel="noopener noreferrer"
                title={s.alt}
                className={TRIGGER_CLASS}
              >
                <SponsorLogo sponsor={s} />
              </a>
            ),
          )}
        </div>
      </div>

      <p className="container mx-auto px-4 mt-10 text-center text-sm">
        Sua empresa também pode apoiar →{" "}
        <a href="mailto:contato@vcnafacul.com.br" className="underline font-semibold">
          contato@vcnafacul.com.br
        </a>
      </p>
    </>
  );
};

export default SponsorsSection;
