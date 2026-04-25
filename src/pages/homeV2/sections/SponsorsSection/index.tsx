import { SectionComponent } from "../../../../components/templates/homeSection/Section.types";
import { usePrefersReducedMotion } from "../../../../lib/motion/motionPreference";
import { Sponsor } from "../../adapters/sponsorsAdapter";
import { SponsorMarquee } from "./SponsorMarquee";

export const SponsorsSection: SectionComponent<Sponsor[]> = ({ data }) => {
  const reduced = usePrefersReducedMotion();
  if (data.length === 0) return null;
  const half = Math.ceil(data.length / 2);
  const a = data.slice(0, half);
  const b = data.slice(half).length > 0 ? data.slice(half) : data;
  return (
    <>
      <div className="container mx-auto px-4 mb-10 text-center">
        <p className="home-section__eyebrow mb-3">QUEM ACREDITA</p>
        <h2 className="text-3xl md:text-5xl font-extrabold leading-tight [text-wrap:balance]">
          Empresas que apoiam a causa
        </h2>
      </div>
      {reduced ? (
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.map((s) => (
            <a
              key={s.alt}
              href={s.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl border border-black/5 h-[80px] flex items-center justify-center"
            >
              <img src={s.logoUrl} alt={s.alt} className="max-w-[80%] max-h-[60%] object-contain" />
            </a>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <SponsorMarquee items={a} direction="left" durationSec={40} />
          <SponsorMarquee items={b} direction="right" durationSec={50} />
        </div>
      )}
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
