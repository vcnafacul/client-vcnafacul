import { Swiper, SwiperSlide } from "swiper/react";
import React from "react";
import { Pagination } from 'swiper/modules';
import './styles.css'
import "swiper/css";
import 'swiper/css/pagination';

interface CarouselProps {
    className?: string;
    childrens: React.ReactNode[];
    slidesPerView?: number;
    spaceBetween?: number;
    loop?: boolean;
    centeredSlides?: boolean;
    slidesPerGroupSkip?: number;
    grabCursor?: boolean;
    dynamicBullets?: boolean;
    pagination?: boolean;
}

function Carousel({className, childrens, slidesPerView, spaceBetween, loop, centeredSlides, slidesPerGroupSkip, grabCursor, dynamicBullets, pagination}: CarouselProps) {
    return (
        <div className={className}>
            <Swiper className="mySwiper" 
                pagination={{
                    dynamicBullets: dynamicBullets ?? false,
                }}
                modules={ pagination ? [Pagination] : []}
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