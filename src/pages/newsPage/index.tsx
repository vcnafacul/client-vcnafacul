import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ReactComponent as TriangleGreen } from "../../assets/icons/triangle-green.svg";
import NewsSelector from "../../components/organisms/newsSelector";
import HeroTemplate from "../../components/templates/heroTemplate";
import { News } from "../../dtos/news/news";
import { getNews } from "../../services/news/getNews";
import NewContent from "./newContent";

function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [indexSelect, setIndexSelect] = useState<number>(0);
  /** Índice efetivamente exibido (atualiza após o fade out) */
  const [displayIndex, setDisplayIndex] = useState<number>(0);
  /** true enquanto o conteúdo atual está saindo (fade out) */
  const [isExiting, setIsExiting] = useState(false);

  const displayNews = news.length > 0 ? news[displayIndex] : null;

  useEffect(() => {
    getNews()
      .then((res) => {
        setNews(res.data);
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });
  }, []);

  // Quando o usuário escolhe outra novidade, inicia o fade out
  useEffect(() => {
    if (indexSelect === displayIndex || isExiting) return;
    setIsExiting(true);
  }, [indexSelect, displayIndex, isExiting]);

  const handleTransitionEnd = useCallback(() => {
    if (!isExiting) return;
    setDisplayIndex(indexSelect);
    setIsExiting(false);
  }, [isExiting, indexSelect]);

  return (
    <HeroTemplate headerPosition="fixed">
      <div className="relative pt-8 pb-16 min-h-[1000px]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left: Vertical selector */}
            <div className="w-full lg:w-72 lg:sticky lg:top-24 shrink-0 pt-4">
              <NewsSelector
                news={news}
                selectedIndex={indexSelect}
                onSelect={setIndexSelect}
              />
            </div>

            {/* Right: Content */}
            <div className="flex-1 min-w-0">
              {displayNews && (
                <div className="flex flex-col gap-2 mb-6">
                  <span className="inline-block w-fit bg-green2 bg-opacity-15 text-green2 text-sm font-semibold px-4 py-1 rounded-full uppercase tracking-wide">
                    {displayNews.session}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-grey">
                    {displayNews.title}
                  </h2>
                </div>
              )}

              <div
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 md:p-10 transition-opacity duration-300 ease-in-out"
                style={{ opacity: isExiting ? 0 : 1 }}
                onTransitionEnd={handleTransitionEnd}
              >
                <NewContent fileKey={displayNews?.fileName ?? ""} />
              </div>
            </div>
          </div>
        </div>

        <TriangleGreen className="absolute w-[500px] -right-[250px] bottom-0 -z-10" />
      </div>
    </HeroTemplate>
  );
}

export default NewsPage;
