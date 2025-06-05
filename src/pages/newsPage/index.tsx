import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ReactComponent as TriangleGreen } from "../../assets/icons/triangle-green.svg";
import Text from "../../components/atoms/text";
import NewsCarousel from "../../components/organisms/newsCarousel";
import HeroTemplate from "../../components/templates/heroTemplate";
import { News } from "../../dtos/news/news";
import { getNews } from "../../services/news/getNews";
import NewContent from "./newContent";

function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [indexSelect, setIndexSelect] = useState<number>(0);
  const VITE_BASE_FTP = import.meta.env.VITE_BASE_FTP;

  const breakpoints = {
    1: {
      slidesPerView: 1,
    },
    350: {
      slidesPerView: 1.5,
    },
    388: {
      slidesPerView: 2,
    },
    700: {
      slidesPerView: 3,
    },
    1000: {
      slidesPerView: 4,
    },
    1200: {
      slidesPerView: 5,
    },
  };

  useEffect(() => {
    getNews()
      .then((res) => {
        setNews(res.data);
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });
  }, []);

  return (
    <HeroTemplate headerPosition="fixed">
      <div className="relative flex items-center flex-col">
        <NewsCarousel
          news={news}
          breakpoints={breakpoints}
          onClickCard={(index: number) => {
            setIndexSelect(index);
          }}
        />
        <div className="bg-white h-12 min-w-[400px] max-w-[500px] relative -top-7 z-50 text-center text-xl text-grey py-2">
          {news.length == 0 ? null : news[indexSelect].session}
        </div>
        <Text size="secondary" className="text-grey font-normal">
          {news.length == 0 ? null : news[indexSelect].title}
        </Text>
        <NewContent
          fileName={
            news.length == 0
              ? ""
              : `${VITE_BASE_FTP}${news[indexSelect].fileName}`
          }
        />
        <TriangleGreen className="absolute w-[500px] -right-[250px] bottom-0 -z-10" />
      </div>
    </HeroTemplate>
  );
}

export default NewsPage;
