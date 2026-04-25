// client-vcnafacul/src/pages/homeV2/sections/PrepCoursesSection/index.tsx
import { SectionComponent } from "../../../../components/templates/homeSection/Section.types";
import { PrepCourse } from "../../adapters/prepCoursesAdapter";
import { PrepCourseCard } from "./PrepCourseCard";

const SUGGEST_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSf-VaK8qrxYx6qd-6WHV8aaaiOnR5cxMsQUaKhU3L1N3jNx0w/viewform";

export const PrepCoursesSection: SectionComponent<PrepCourse[]> = ({ data }) => {
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
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((c, i) => (
          <PrepCourseCard key={c.alt} course={c} index={i} />
        ))}
        <a
          href={SUGGEST_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="
            rounded-2xl p-5 md:p-6 border-2 border-dashed border-[#37d6b5]
            flex items-center justify-center text-center font-semibold text-[#0b2747]
            hover:bg-[#37d6b522] transition-colors
            focus-visible:outline outline-2 outline-offset-2 outline-[#37d6b5]
          "
        >
          Conhece um cursinho popular?
          <br />
          Indique →
        </a>
      </div>
    </>
  );
};

export default PrepCoursesSection;
