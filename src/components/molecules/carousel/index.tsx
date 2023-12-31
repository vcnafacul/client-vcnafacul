/* eslint-disable @typescript-eslint/no-explicit-any */
import { Swiper, SwiperProps, SwiperSlide } from "swiper/react";
import React from "react";
import './styles.css'
import "swiper/css";
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import PrevNextSwiper from "../../atoms/PrevNextSwiper";

interface CarouselProps extends SwiperProps {
    className?: string;
    childrens: React.ReactNode[];
    slidesPerView?: number;
    spaceBetween?: number;
    loop?: boolean;
    centeredSlides?: boolean;
    slidesPerGroupSkip?: number;
    grabCursor?: boolean;
    dynamicBullets?: boolean;
    breakpoints?: any;
    arrow?: boolean;
}

function Carousel({className, childrens, slidesPerView, spaceBetween, loop, centeredSlides, slidesPerGroupSkip, grabCursor, dynamicBullets, breakpoints, arrow = false, ...props}: CarouselProps) {

    return (
        <div className={className}>
            <Swiper className="mySwiper"
                {...props}
                breakpoints={breakpoints ?? null}
                pagination={{
                    dynamicBullets: dynamicBullets ?? false,
                }}
                slidesPerView={slidesPerView ?? 1}
                spaceBetween={spaceBetween ?? 30}
                loop={loop ?? true}
                centeredSlides={centeredSlides ?? true}
                
                slidesPerGroupSkip={ slidesPerGroupSkip ?? 1}
                grabCursor={grabCursor ?? false}>
                {childrens.map((child, index) => (
                    <SwiperSlide key={index}>{child}</SwiperSlide>
                ))}
                {arrow ? <PrevNextSwiper /> : <></>}
            </Swiper>
        </div>
    )
}

export default Carousel