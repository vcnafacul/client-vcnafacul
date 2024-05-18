import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ReactComponent as TriangleGreen } from "../../../assets/icons/triangle-green.svg";
import { NEWS } from "../../../routes/path";
import { getNews } from "../../../services/news/getNews";
import { useHomeStore } from "../../../store/home";
import { DiffTime } from "../../../utils/diffTime";
import Text from "../../atoms/text";
import NewsCarousel from "../newsCarousel";

function HomeNews() {
  const { news, setNews } = useHomeStore();

  const navigate = useNavigate();

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
  };

  useEffect(() => {
    if (news.data.length === 0 || DiffTime(news.updated, 8)) {
      getNews()
        .then((res) => {
          setNews(res.data);
        })
        .catch((error: Error) => {
          toast.error(error.message);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full">
      <TriangleGreen className="absolute w-[500px] rotate-[135deg] bottom-0 -right-[162px]" />
      <div className="container grid grid-cols-4 gap-4 mx-auto">
        <div className="col-span-4 md:col-span-2">
          <Text size="secondary">Não perca nossas novidades!</Text>
          <Text size="tertiary">
            Fique ligado nas ultimas noticias e nossas novas funcionalidades
          </Text>
        </div>
        <div className="col-span-4 mx-4 md:col-span-2">
          <NewsCarousel
            news={news.data}
            breakpoints={breakpoints}
            onClickCard={() => {
              navigate(NEWS);
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default HomeNews;
