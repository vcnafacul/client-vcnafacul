import { SectionComponent } from "../../../../components/templates/homeSection/Section.types";
import { PrepCourse } from "../../adapters/prepCoursesAdapter";
import { FORM_GEOLOCATION } from "../../../../routes/path";

const LOGO_CLASS =
  "w-[140px] h-[140px] object-contain " +
  "opacity-80 " +
  "transition-all duration-300 ease-out " +
  "hover:opacity-100 hover:-translate-y-1 " +
  "hover:[filter:drop-shadow(0_8px_12px_rgb(0_0_0_/_0.18))]";

const TRIGGER_CLASS =
  "flex-none flex items-center justify-center rounded-md " +
  "focus-visible:outline outline-2 outline-offset-4 outline-[#37d6b5]";

export const PrepCoursesSection: SectionComponent<PrepCourse[]> = ({
  data,
}) => {
  return (
    <>
      <div className="container mx-auto px-4 mb-10 text-center">
        <p className="home-section__eyebrow mb-3">REDE DE PARCEIROS</p>
        <h2 className="text-3xl md:text-5xl font-extrabold leading-tight [text-wrap:balance]">
          Cursinhos populares que estão na frente
        </h2>
        <p className="mt-3 text-base md:text-lg opacity-80 max-w-2xl mx-auto">
          Educação gratuita acontecendo em cidades do Brasil inteiro.
        </p>
      </div>

      {data.length > 0 && (
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
            {data.map((c) => (
              <a
                key={c.alt}
                href={c.link}
                target="_blank"
                rel="noopener noreferrer"
                title={c.alt}
                className={TRIGGER_CLASS}
              >
                <img src={c.logoUrl} alt={c.alt} className={LOGO_CLASS} />
              </a>
            ))}
          </div>
        </div>
      )}

      <p className="container mx-auto px-4 mt-10 text-center text-sm">
        Conhece um cursinho popular? →{" "}
        <a
          href={FORM_GEOLOCATION}
          className="underline font-semibold"
        >
          indique
        </a>
      </p>
    </>
  );
};

export default PrepCoursesSection;
