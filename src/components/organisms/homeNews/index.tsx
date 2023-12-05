import { useState, useEffect } from "react"
import { News } from "../../../dtos/news/news"
import { getNews } from "../../../services/news/getNews"
import NewsCarousel from "../newsCarousel"
import Text from "../../atoms/text"
import { ReactComponent as TriangleGreen } from "../../../assets/icons/triangle-green.svg";
import { useNavigate } from "react-router-dom"
import { NEWS } from "../../../routes/path"

function HomeNews(){
    const [news, setNews] = useState<News[]>([])

    const navigate = useNavigate()

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
        730: {
            slidesPerView: 3.5,
        },
        850: {
            slidesPerView: 4,
        },
        1000: {
            slidesPerView: 4,
        },
        1200: {
            slidesPerView: 3,
        },
      }

    useEffect(() => {
        getNews()
          .then(res => {
            setNews(res)
          })
          .catch(err => {
            console.log(err)
          })
      }, [])

    return (
        <div className="relative w-full">
            <TriangleGreen className="absolute w-[500px] -right-[250px]" />
            <div className="grid grid-cols-4 container mx-auto gap-4">
            <div className="col-span-4 md:col-span-2">
                <Text size="secondary">Não perca nossas novidades!</Text>
                <Text size="tertiary">Fique ligado nas ultimas noticias e nossas novas funcionalidades</Text>
            </div>
            <div className="col-span-4 md:col-span-2 mx-4">
                <NewsCarousel news={news} breakpoints={breakpoints} onClickCard={() => { navigate(NEWS) }} />
            </div>
            </div>
        </div>
    )
}

export default HomeNews