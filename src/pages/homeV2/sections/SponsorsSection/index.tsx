import { SectionComponent } from "../../../../components/templates/homeSection/Section.types";
import { Sponsor } from "../../adapters/sponsorsAdapter";

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
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
          {data.map((s) => (
            <a
              key={s.alt}
              href={s.link}
              target="_blank"
              rel="noopener noreferrer"
              title={s.alt}
              className="
                flex-none w-[160px] h-[90px] bg-white rounded-xl
                border border-black/5 shadow-sm
                flex items-center justify-center
                grayscale opacity-70
                transition-all duration-300 ease-out
                hover:grayscale-0 hover:opacity-100 hover:-translate-y-1 hover:shadow-md
                focus-visible:outline outline-2 outline-offset-2 outline-[#f7b733]
              "
            >
              <img
                src={s.logoUrl}
                alt={s.alt}
                className="max-w-[75%] max-h-[60%] object-contain"
              />
            </a>
          ))}
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
