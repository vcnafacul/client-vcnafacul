import { SectionComponent } from "../../../../components/templates/homeSection/Section.types";
import { NewsItem } from "../../adapters/newsAdapter";
import { NEWS } from "../../../../routes/path";
import { NewsFeaturedCard } from "./NewsFeaturedCard";
import { NewsSideCard } from "./NewsSideCard";

export const NewsSection: SectionComponent<NewsItem[]> = ({ data }) => {
  const [featured, ...rest] = data;
  const side = rest.slice(0, 3);

  return (
    <>
      <div className="container mx-auto px-4 mb-10 flex items-end justify-between">
        <div>
          <p className="home-section__eyebrow mb-2">ATUALIZAÇÕES</p>
          <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">
            Novidades vcnafacul
          </h2>
        </div>
        <a href={NEWS} className="text-[#da005a] font-semibold text-sm">
          Ver todas →
        </a>
      </div>
      {data.length === 0 ? (
        <div className="container mx-auto px-4">
          <div className="rounded-2xl border border-dashed border-black/10 p-10 text-center opacity-70">
            Sem novidades por enquanto.
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 md:h-[480px]">
          <NewsFeaturedCard item={featured} />
          <div className="flex flex-col gap-3">
            {side.map((it, i) => (
              <NewsSideCard key={it.id} item={it} index={i} />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default NewsSection;
