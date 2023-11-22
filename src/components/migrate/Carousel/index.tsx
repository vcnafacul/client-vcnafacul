import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import './styles.css'
import React from "react";

interface CarouselProps {
    className?: string;
    childrens: React.ReactNode[];
    slidesPerView?: number;
    spaceBetween?: number;
    loop?: boolean;
    centeredSlides?: boolean;
    slidesPerGroupSkip?: number;
    grabCursor?: boolean;
}

function Carousel({className, childrens, slidesPerView, spaceBetween, loop, centeredSlides, slidesPerGroupSkip, grabCursor}: CarouselProps) {
    return (
        <div className={className}>
            <Swiper className="mySwiper" 
                slidesPerView={slidesPerView ?? 1}
                spaceBetween={spaceBetween ?? 30}
                loop={loop ?? true}
                centeredSlides={centeredSlides ?? true}
                slidesPerGroupSkip={ slidesPerGroupSkip ?? 1}
                grabCursor={grabCursor ?? false}>
                {childrens.map((child, index) => (
                    <SwiperSlide key={index}>{child}</SwiperSlide>
                ))}
            </Swiper>
        </div>
    )
}

export default Carousel