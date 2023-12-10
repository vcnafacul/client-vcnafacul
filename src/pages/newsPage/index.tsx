import { useEffect, useState } from "react"
import HeroTemplate from "../../components/templates/heroTemplate"
import { footer, header } from "../home/data"
import { heroNews } from "./data"
import Text from "../../components/atoms/text"
import { News } from "../../dtos/news/news"
import { getNews } from "../../services/news/getNews"
import Content from "../../components/atoms/content"
import NewsCarousel from "../../components/organisms/newsCarousel"
import { toast } from "react-toastify"

function NewsPage(){
    const [news, setNews] = useState<News[]>([])
    const [indexSelect, setIndexSelect] = useState<number>(0);

    const VITE_BASE_FTP = import.meta.env.VITE_BASE_FTP;

    const NewContent = () => {
      if(news.length > 0) {
        return (
          <Content docxFilePath={`${VITE_BASE_FTP}${news[indexSelect].fileName}.docx`} />
        )
      }
      return null
    }

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
      530: {
          slidesPerView: 2.4,

      },
      600: {
          slidesPerView: 3,

      },
      750: {
          slidesPerView: 3.5,
      },
      850: {
          slidesPerView: 4,
      },
      1000: {
          slidesPerView: 4.5,
      },
      1200: {
          slidesPerView: 5,
      },
    }


    useEffect(() => {
        getNews()
          .then(res => {
            setNews(res)
          })
          .catch((error: Error) => {
            toast.error(error.message)
          })
      }, [])
      
    return (
        <HeroTemplate header={header} footer={footer} hero={heroNews} headerPosition="fixed">
            <div className="relative flex items-center flex-col">
                <div className="bg-white h-12 min-w-[400px] max-w-[500px] relative -top-7 z-50 text-center text-xl text-grey py-2">
                  {news.length == 0 ? null : news[indexSelect].session}
                </div>
                <Text size="secondary" className="text-grey font-normal">{news.length == 0 ? null : news[indexSelect].title}</Text>
                <NewContent />
                <NewsCarousel news={news} breakpoints={breakpoints} onClickCard={(index: number) => { setIndexSelect(index)}} />
            </div>
        </HeroTemplate>
    )
}

export default NewsPage