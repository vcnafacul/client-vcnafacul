/* eslint-disable @typescript-eslint/no-explicit-any */
import { News } from "../../../dtos/news/news"
import Carousel from "../../molecules/carousel"

interface NewsCarouselProps {
    news: News[]
    breakpoints: any;
    onClickCard: (id: number) => void;
}

function NewsCarousel({ news, breakpoints, onClickCard }: NewsCarouselProps){

    const cardsNews = news.map((card, index) => {
        return (
            <div key={card.id} className="w-40 h-40 bg-gray-950 bg-opacity-50 flex justify-center items-end text-white text-sm p-4 mb-10 cursor-pointer" onClick={() => { onClickCard(index) }}>
                {card.title}
            </div>
        )})

    return (
        <div className="py-4 container mx-auto">
            <Carousel pagination dynamicBullets childrens={cardsNews} loop={false} breakpoints={breakpoints} slidesPerView={4} centeredSlides={false}/>
        </div>
    )
}

export default NewsCarousel